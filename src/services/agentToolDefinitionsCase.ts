/* ============================================
   FILE: agentToolDefinitionsCase.ts
   PURPOSE: Case-specific agent tools — bridge between agent layer and CaseEntity.
            Enables agents to read, evaluate, update, and export cases at runtime.
   DEPENDENCIES: brainStore, caseTypes, draftReadinessEvaluator, wordExportService
   EXPORTS: getCaseContextTool, updateCaseDraftTool, evaluateCaseReadinessTool,
            generateCaseOutputTool
   ============================================ */
import { SchemaType } from '@google/generative-ai';
import { useBrainStore } from '../store/brainStore';
import type { CaseDraft } from '../data/caseTypes';
import { evaluateDraftReadiness, advanceDraftByContent } from './draftReadinessEvaluator';
import { exportToWord } from './wordExportService';
import type { AgentTool } from './agentTools';
import { markApprovedByEldad } from './draftReadinessEvaluator';

// #region Helpers

/** Read case from store (works outside React) */
function getCaseFromStore(caseId: string) {
  return useBrainStore.getState().cases.find(c => c.caseId === caseId);
}

/** Known template placeholders */
const PLACEHOLDERS = [
  '[AMOUNT]', '[DATE]', '[SUBJECT]', '[REFERENCE]', '[ENTITY]',
  '[תקופה]', '[נימוקים מפורטים]', '[נקודה ראשונה]', '[נקודה שנייה]',
  '[סכום הנזק הנתבע]', '[תוכן המענה]',
];

// #endregion

// #region Tool 1: get_case_context

/** @see AgentTool — load full case snapshot for agent reasoning */
export const getCaseContextTool: AgentTool = {
  name: 'get_case_context',
  descriptionHe: 'טעינת הקשר מלא של תיק — metadata, טיוטה, מפת תקיפה, ראיות, חסרים',
  allowedLayers: ['command', 'intake', 'processing', 'output'],
  declaration: {
    name: 'get_case_context',
    description: 'Load full context of a case by caseId. Returns metadata, draft status, attack map summary, authored arguments, documents, missing items, risk flags, and deadline.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        case_id: { type: SchemaType.STRING, description: 'Case ID (e.g. dima-rodnitski)' },
      },
      required: ['case_id'],
    },
  },
  execute: async (args) => {
    const caseId = args.case_id as string;
    const c = getCaseFromStore(caseId);
    if (!c) {
      return { success: false, error: `תיק "${caseId}" לא נמצא` };
    }

    const deadlineDate = new Date(c.deadline + 'T00:00:00');
    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const bodyPlaceholders = c.draft
      ? PLACEHOLDERS.filter(ph => c.draft!.body.includes(ph))
      : [];

    const selectedBlocks = c.draft?.suggestedBlocks?.filter(b => b.includeInDraft) || [];
    const insertedBlockCount = c.draft?.insertedAttackBlockIds?.length ?? 0;

    return {
      success: true,
      caseId: c.caseId,
      clientName: c.clientName,
      processType: c.processType,
      caseStatus: c.status,
      deadline: c.deadline,
      daysLeft,
      isUrgent: daysLeft <= 14,
      officialCaseNumber: c.officialCaseNumber || null,

      draft: c.draft ? {
        status: c.draft.status,
        templateType: c.draft.templateType,
        bodyLength: c.draft.body.length,
        remainingPlaceholders: bodyPlaceholders,
        placeholderCount: bodyPlaceholders.length,
        sufficiencyWarning: c.draft.sufficiencyWarning,
        selectedBlockCount: selectedBlocks.length,
        insertedBlockCount,
        exportedDraftAt: c.draft.exportedDraftAt || null,
        exportedFinalAt: c.draft.exportedFinalAt || null,
        reviewedBy: c.draft.reviewedBy || null,
        lastReviewedAt: c.draft.lastReviewedAt || null,
      } : null,

      attackMap: c.attackSummary || null,
      authoredArgumentCount: c.authoredArguments?.length ?? 0,
      uncoveredAuthorityClaims: c.uncoveredAuthorityClaims || [],

      documents: c.documents.map(d => ({
        id: d.id, type: d.type, description: d.description,
        wasSubmitted: d.wasSubmitted,
      })),
      documentCount: c.documents.length,
      submittedDocCount: c.documents.filter(d => d.wasSubmitted).length,

      missingItems: c.missingItems,
      riskFlags: c.riskFlags,

      emails: { total: c.emails.length },
      timeline: { eventCount: c.timeline.length },
    };
  },
};

// #endregion

// #region Tool 2: update_case_draft

/** @see AgentTool — update case draft through existing store mechanism */
export const updateCaseDraftTool: AgentTool = {
  name: 'update_case_draft',
  descriptionHe: 'עדכון טיוטת תיק — body, subject, status, approval',
  allowedLayers: ['command', 'output'],
  declaration: {
    name: 'update_case_draft',
    description: 'Update an existing case draft. Can modify body text, subject, sufficiency warning, or mark as reviewed. Does NOT overwrite suggestedBlocks or export timestamps.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        case_id: { type: SchemaType.STRING, description: 'Case ID' },
        body: { type: SchemaType.STRING, description: 'New draft body text (optional — only if changing content)' },
        subject: { type: SchemaType.STRING, description: 'New draft subject (optional)' },
        sufficiency_warning: { type: SchemaType.STRING, description: 'Updated warning text (optional)' },
      },
      required: ['case_id'],
    },
  },
  execute: async (args) => {
    const caseId = args.case_id as string;
    const c = getCaseFromStore(caseId);
    if (!c) return { success: false, error: `תיק "${caseId}" לא נמצא` };
    if (!c.draft) return { success: false, error: 'לתיק אין טיוטה' };

    const patch: Partial<CaseDraft> = {};
    if (args.body) patch.body = args.body as string;
    if (args.subject) patch.subject = args.subject as string;
    if (args.sufficiency_warning !== undefined) {
      patch.sufficiencyWarning = (args.sufficiency_warning as string) || null;
    }

    const updatedDraft: CaseDraft = { ...c.draft, ...patch };
    const caseAfterPatch = { ...c, draft: updatedDraft };
    const evaluated = advanceDraftByContent(updatedDraft, caseAfterPatch);

    useBrainStore.getState().updateCaseDraft(caseId, evaluated);

    return {
      success: true,
      caseId,
      previousStatus: c.draft.status,
      newStatus: evaluated.status,
      statusChanged: c.draft.status !== evaluated.status,
      message: c.draft.status !== evaluated.status
        ? `סטטוס הטיוטה עודכן: ${c.draft.status} → ${evaluated.status}`
        : 'הטיוטה עודכנה בהצלחה, הסטטוס לא השתנה',
    };
  },
};

// #region Tool 2.5: approve_case_draft

export const approveCaseDraftTool: AgentTool = {
  name: 'approve_case_draft',
  descriptionHe: 'אישור מפורש של טיוטה להגשה ע"י שרת ההרשאות',
  allowedLayers: ['decision'],
  declaration: {
    name: 'approve_case_draft',
    description: 'Explicitly mark a case draft as approved and ready for submission. MUST only be used if there is an explicit instruction or quote from Eldad authorizing the submission.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        case_id: { type: SchemaType.STRING, description: 'Case ID' },
        authorization_quote: { type: SchemaType.STRING, description: 'Exact quote from the user instruction authorizing this action (Audit Trail)' },
      },
      required: ['case_id', 'authorization_quote'],
    },
  },
  execute: async (args) => {
    const caseId = args.case_id as string;
    const quote = args.authorization_quote as string;
    
    if (!quote || quote.length < 5) {
      return { success: false, error: 'Authorization quote is required to approve cases.' };
    }

    const c = getCaseFromStore(caseId);
    if (!c || !c.draft) return { success: false, error: 'תיק או טיוטה לא נמצאו' };

    // Set Eldad approval
    const approvedDraft = markApprovedByEldad(c.draft);
    
    // Add audit trail marker into sufficiency warning (if present) to leave a trace
    if (approvedDraft.sufficiencyWarning) {
      approvedDraft.sufficiencyWarning += `\n[AUDIT] Approved via agent intent. Quote: "${quote}"`;
    }

    const caseAfterApproval = { ...c, draft: approvedDraft };
    // Re-evaluate to cascade to ready_for_submission if content rules pass
    const evaluated = advanceDraftByContent(approvedDraft, caseAfterApproval);

    useBrainStore.getState().updateCaseDraft(caseId, evaluated);

    return {
      success: true,
      caseId,
      auditTrail: `Approved with quote: "${quote}"`,
      newStatus: evaluated.status,
    };
  },
};

// #endregion

// #region Tool 3: evaluate_case_readiness

/** @see AgentTool — evaluate appeal readiness using content analysis */
export const evaluateCaseReadinessTool: AgentTool = {
  name: 'evaluate_case_readiness',
  descriptionHe: 'הערכת מוכנות ערר — ניתוח תוכן, ראיות, כיסוי טענות, deadline',
  allowedLayers: ['command', 'processing'],
  declaration: {
    name: 'evaluate_case_readiness',
    description: 'Evaluate whether a case appeal is ready for submission. Checks draft content, placeholders, evidence coverage, authority claim coverage, missing items, and deadline proximity.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        case_id: { type: SchemaType.STRING, description: 'Case ID' },
      },
      required: ['case_id'],
    },
  },
  execute: async (args) => {
    const caseId = args.case_id as string;
    const c = getCaseFromStore(caseId);
    if (!c) return { success: false, error: `תיק "${caseId}" לא נמצא` };
    if (!c.draft) return { success: false, error: 'לתיק אין טיוטה — לא ניתן להעריך' };

    const evaluation = evaluateDraftReadiness(c.draft, c);

    const deadlineDate = new Date(c.deadline + 'T00:00:00');
    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const totalAuthorityClaims = c.attackMap?.length ?? 0;
    const coveredClaims = c.attackMap?.filter(a =>
      a.source === 'authored_response' && a.counterArgument.length > 20
    ).length ?? 0;

    const hasStrongPoints = (c.attackSummary?.strongPoints ?? 0) > 0;
    const missingEvidenceCount = c.attackSummary?.missingEvidencePoints ?? 0;
    const bodyPlaceholders = PLACEHOLDERS.filter(ph => c.draft!.body.includes(ph));

    const advanced = advanceDraftByContent(c.draft, c);
    if (advanced.status !== c.draft.status) {
      useBrainStore.getState().updateCaseDraft(caseId, advanced);
    }

    return {
      success: true,
      caseId,
      currentDraftStatus: advanced.status,
      statusAdvanced: advanced.status !== c.draft.status,
      evaluation: {
        computedStatus: evaluation.computedStatus,
        reasons: evaluation.reasons,
        blockers: evaluation.blockers,
        requiresEldadApproval: evaluation.requiresEldadApproval,
      },
      contentAnalysis: {
        bodyLength: c.draft.body.length,
        remainingPlaceholders: bodyPlaceholders,
        isTemplateOnly: bodyPlaceholders.length >= 3,
        insertedBlocks: c.draft.insertedAttackBlockIds?.length ?? 0,
        selectedBlocks: c.draft.suggestedBlocks?.filter(b => b.includeInDraft).length ?? 0,
      },
      claimCoverage: {
        totalAuthorityClaims,
        coveredByAuthored: coveredClaims,
        coverageRatio: totalAuthorityClaims > 0
          ? Math.round((coveredClaims / totalAuthorityClaims) * 100) : 0,
        hasStrongPoints,
        missingEvidenceCount,
        uncoveredClaims: c.uncoveredAuthorityClaims || [],
      },
      caseCompleteness: {
        missingItems: c.missingItems,
        missingItemCount: c.missingItems.length,
        documentCount: c.documents.length,
        submittedDocCount: c.documents.filter(d => d.wasSubmitted).length,
        riskFlags: c.riskFlags,
      },
      deadline: {
        date: c.deadline, daysLeft,
        isUrgent: daysLeft <= 14, isCritical: daysLeft <= 5,
      },
      readyForExport: evaluation.computedStatus === 'ready_for_submission',
    };
  },
};

// #endregion

// #region Tool 4: generate_case_output

/** @see AgentTool — produce Word export from case */
export const generateCaseOutputTool: AgentTool = {
  name: 'generate_case_output',
  descriptionHe: 'הפקת מסמך Word מתיק — טיוטה או סופי',
  allowedLayers: ['command', 'output'],
  declaration: {
    name: 'generate_case_output',
    description: 'Generate Word output from a case. Mode "draft_word" creates a watermarked draft. Mode "final_word" creates submission-ready document (only if status is ready_for_submission).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        case_id: { type: SchemaType.STRING, description: 'Case ID' },
        mode: { type: SchemaType.STRING, description: 'Output mode: draft_word or final_word' },
      },
      required: ['case_id', 'mode'],
    },
  },
  execute: async (args) => {
    const caseId = args.case_id as string;
    const mode = args.mode as string;
    const c = getCaseFromStore(caseId);
    if (!c) return { success: false, error: `תיק "${caseId}" לא נמצא` };
    if (!c.draft) return { success: false, error: 'לתיק אין טיוטה' };

    if (mode === 'final_word' && c.draft.status !== 'ready_for_submission') {
      return {
        success: false,
        error: `ייצוא סופי חסום — סטטוס נוכחי: ${c.draft.status}. נדרש ready_for_submission`,
        currentStatus: c.draft.status,
      };
    }

    if (mode === 'final_word') {
      const remainingPlaceholders = c.draft.body.match(/\[.*?\]/g);
      if (remainingPlaceholders && remainingPlaceholders.length > 0) {
        return {
          success: false,
          error: `ייצוא סופי חסום — הטיוטה עדיין מכילה פלייסחולדרים מסוג: ${remainingPlaceholders.join(', ')}`,
        };
      }
    }

    const isFinal = mode === 'final_word';
    const dateStr = new Date().toISOString().slice(0, 10);

    try {
      await exportToWord({
        title: isFinal ? c.draft.subject : `טיוטה: ${c.draft.subject}`,
        filename: `${isFinal ? 'סופי' : 'טיוטה'}_${c.clientName.replace(/\s+/g, '_')}_${dateStr}`,
        sections: [
          ...(isFinal ? [] : [{ paragraphs: ['*** טיוטה בלבד — לא מאושר להגשה ***', '────────────────────────────'] }]),
          { paragraphs: c.draft.body.split('\n\n') },
          { signatures: [{ name: 'אלדד ברגר', role: isFinal ? 'רו"ח — מייצג מורשה' : 'רו"ח — מייצג מורשה (בטיוטה)' }] },
        ],
      });

      const exportPatch: Partial<CaseDraft> = isFinal
        ? { exportedFinalAt: new Date().toISOString() }
        : { exportedDraftAt: new Date().toISOString() };

      useBrainStore.getState().updateCaseDraft(caseId, { ...c.draft, ...exportPatch });

      return {
        success: true,
        caseId,
        mode,
        exportedAt: new Date().toISOString(),
        message: isFinal ? 'מסמך סופי יוצא בהצלחה — מוכן להגשה' : 'טיוטה יוצאה בהצלחה (עם watermark)',
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'שגיאת ייצוא' };
    }
  },
};

// #endregion
