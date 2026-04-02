/* ============================================
   FILE: caseBuilderHelpers.ts
   PURPOSE: Helper functions for caseBuilder to normalize inputs and compute fields.
   DEPENDENCIES: ../data/caseTypes, ../services/emailClassifier,
                 ../integrations/gmail/caseBundle
   EXPORTS: normalizeEmails, normalizeDocuments, computeRiskFlags,
            computeMissingItems, computeStatus, computeTimeline,
            findCaseBundle, computeInitialDraft, deriveSuggestedBlocks
   ============================================ */
import type {
  CaseEmail, CaseDocument, CaseDocumentType,
  CaseProcessType, CaseStatus, CaseTimelineEvent, CaseDraft,
  SuggestedAttackBlock
} from '../data/caseTypes';
import { classifyEmail } from './emailClassifier';
import { identifyCaseContext, getAllBundles } from '../integrations/gmail/caseBundle';
import { generateAppealDraft } from '../integrations/gmail/draftGenerator';
import type { RawEmail, RawDocument, CaseSourceInput } from './caseBuilderTypes';
import { AttackPoint } from './decisionAttackEngine';

// #region Email Normalization

/**
 * Normalize raw emails → CaseEmail[] with classification.
 * Sorted by date descending (newest first).
 */
export function normalizeEmails(rawEmails: RawEmail[]): CaseEmail[] {
  return rawEmails
    .map(raw => {
      const cls = classifyEmail(raw.from, raw.subject);
      const email: CaseEmail = {
        id: raw.id,
        from: raw.from,
        to: raw.to,
        cc: raw.cc || '',
        subject: raw.subject,
        date: raw.date,
        snippet: raw.snippet,
        classification: {
          category: cls.category,
          confidence: cls.confidence,
          isWork: cls.isWork,
        },
      };
      return email;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

// #endregion

// #region Document Normalization

/** Auto-classify document type from filename */
function classifyDocType(fileName: string): CaseDocumentType {
  const lower = fileName.toLowerCase();
  if (/נימוקי?\s*החלטה|מכתב\s*החלטה/i.test(fileName)) return 'decision_document';
  if (/מכתב\s*רשמי/i.test(fileName)) return 'response_letter';
  if (/רישיון/i.test(fileName)) return 'license';
  if (/חישוב|הפסד/i.test(fileName)) return 'calculation';
  if (/ספר\s*עסקאות|חשבונית/i.test(fileName)) return 'business_records';
  if (/בקשה.*מסמכים|השלמת\s*מסמכים/i.test(fileName)) return 'request_letter';
  if (/scan|סריקה/i.test(lower)) return 'supporting_scan';
  return 'other';
}

/** Auto-generate description from filename */
function generateDescription(fileName: string, type: CaseDocumentType): string {
  const DESC_MAP: Partial<Record<CaseDocumentType, string>> = {
    decision_document: 'מסמך החלטה / נימוקי דחייה',
    response_letter: 'מכתב תגובה רשמי',
    license: 'רישיון / אישור מקצועי',
    calculation: 'חישוב / טבלת נתונים',
    business_records: 'רישום עסקי / ספר עסקאות',
    request_letter: 'בקשת השלמת מסמכים מהרשות',
    supporting_scan: 'סריקה תומכת',
    attachment: 'נספח',
  };
  return DESC_MAP[type] || `קובץ: ${fileName}`;
}

/**
 * Normalize raw documents → CaseDocument[].
 * Auto-classify type and generate description if not provided.
 */
export function normalizeDocuments(rawDocs: RawDocument[]): CaseDocument[] {
  return rawDocs.map((raw, idx) => {
    const type = raw.type || classifyDocType(raw.fileName);
    const description = raw.description || generateDescription(raw.fileName, type);
    return {
      id: `doc-${String(idx + 1).padStart(2, '0')}`,
      fileName: raw.fileName,
      type,
      description,
      source: raw.source,
      relativePath: raw.relativePath,
      wasSubmitted: raw.wasSubmitted ?? false,
      submissionDate: raw.submissionDate,
    };
  });
}

// #endregion

// #region Computed Fields

/** Compute risk flags from sources */
export function computeRiskFlags(
  input: CaseSourceInput,
  emails: CaseEmail[],
  documents: CaseDocument[],
): string[] {
  const flags: string[] = [];

  // Deadline proximity
  const daysLeft = Math.ceil(
    (new Date(input.deadline + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft <= 60) {
    flags.push(`דדליין ערר: ${daysLeft} ימים (${input.deadline})`);
  }

  // Use caseBundle's identifyCaseContext for deeper risk signals
  const contextEmails = emails.slice(0, 5);
  for (const email of contextEmails) {
    const ctx = identifyCaseContext(email.from, email.subject, email.snippet);
    if (ctx.confidence > 50 && ctx.matchedSignals.length > 0) {
      // Found a strong signal — check if decision was ignored
      if (/החלטה|דחייה|נימוקי/i.test(email.subject)) {
        const hasResponseLetter = documents.some(d => d.type === 'response_letter' && d.wasSubmitted);
        if (hasResponseLetter) {
          flags.push('ההחלטה התעלמה ממכתב תגובה שנשלח');
        }
      }
      break; // one context check is enough
    }
  }

  // Incomplete submission — some docs exist but weren't submitted
  const unsubmitted = documents.filter(d => !d.wasSubmitted && d.type !== 'supporting_scan');
  if (unsubmitted.length > 0 && documents.some(d => d.wasSubmitted)) {
    flags.push(`${unsubmitted.length} מסמכים טרם הוגשו`);
  }

  // Legal precedent flag for war compensation appeals
  if (input.processType === 'war_compensation_appeal') {
    flags.push('ההחלטה לא התייחסה לפסיקה (ע"א 749/87)');
  }

  return flags;
}

/** Compute missing items based on processType and existing docs */
export function computeMissingItems(
  processType: CaseProcessType,
  documents: CaseDocument[],
): string[] {
  const missing: string[] = [];
  const docTypes = new Set(documents.map(d => d.type));

  if (processType === 'war_compensation_appeal') {
    // Expert CPA opinion is always recommended for appeals
    if (!docTypes.has('other')) {
      missing.push('חוות דעת רו"ח מומחה (אופציונלי — חיזוק)');
    }
  }

  if (processType === 'tax_audit') {
    if (!docTypes.has('calculation')) missing.push('חישובי מס');
    if (!docTypes.has('business_records')) missing.push('ספרי חשבונות');
  }

  return missing;
}

/** Compute status from document state and deadline */
export function computeStatus(
  documents: CaseDocument[],
  deadline: string,
): CaseStatus {
  const allSubmitted = documents.length > 0 && documents.every(d => d.wasSubmitted);
  if (allSubmitted) return 'submitted';

  const daysLeft = Math.ceil(
    (new Date(deadline + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft < 0) return 'closed';

  const hasSubmissions = documents.some(d => d.wasSubmitted);
  if (hasSubmissions) return 'reviewing';

  return 'collecting';
}

/** Compute timeline from emails, documents, and deadlines */
export function computeTimeline(
  emails: CaseEmail[],
  documents: CaseDocument[],
  deadline: string,
): CaseTimelineEvent[] {
  const events: CaseTimelineEvent[] = [];

  // 1. Emails
  emails.forEach(e => {
    const isSent = e.from.includes('eldad197589@gmail.com');
    events.push({
      id: `ev-email-${e.id}`,
      date: e.date,
      type: isSent ? 'email_sent' : 'email_received',
      description: `מייל: ${e.subject}`,
    });
  });

  // 2. Submitted Documents
  documents.filter(d => d.wasSubmitted && d.submissionDate).forEach(d => {
    events.push({
      id: `ev-doc-${d.id}`,
      date: d.submissionDate!,
      type: 'document_submitted',
      description: `הגשת מסמך: ${d.description}`,
    });
  });

  // 3. Decisions Received
  documents.filter(d => d.type === 'decision_document' && d.source === 'local_folder').forEach((d, idx) => {
    events.push({
      id: `ev-dec-${idx}`,
      date: d.submissionDate || '2026-02-25', // Fallback for Dima's case if date is missing
      type: 'decision_received',
      description: `קבלת החלטה: ${d.description}`,
    });
  });

  // 4. Deadline
  events.push({
    id: 'ev-deadline',
    date: deadline,
    type: 'deadline',
    description: 'מועד אחרון לפעולה',
  });

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

/** Extract matching caseBundle if exists */
export function findCaseBundle(clientName: string) {
  const bundles = getAllBundles();
  const normalizedClient = clientName.trim().split(' ')[0]; // Match logic
  return bundles.find(b => b.clientName.includes(normalizedClient)) || undefined;
}

/** Compute a basic draft if there's enough context */
export function computeInitialDraft(
  processType: CaseProcessType,
  documents: CaseDocument[],
  attackMap?: AttackPoint[],
): CaseDraft | null {
  if (processType === 'war_compensation_appeal') {
    const hasDecision = documents.some(d => d.type === 'decision_document');
    // Existing authored response has priority:
    const eldadResponse = documents.find(d => d.type === 'response_letter');
    
    // Require at least a decision document or a response letter
    if (!hasDecision && !eldadResponse) {
      return null;
    }
    
    // Sufficiency check:
    let warning: string | null = null;
    let status: 'draft' | 'under_review' | 'approved_by_eldad' | 'ready_for_submission' = 'draft';

    if (eldadResponse) {
      warning = 'נדרש עיבוי מטיעון קיים של אלדד';
      status = 'draft';
    }

    // Generate basic draft
    const rawDraft = generateAppealDraft(
      'החלטת רשות המסים — מסלול אדום',
      new Date().toISOString(),
      null,
      'war_compensation_red_track'
    );

    // Derive suggested blocks from attackMap if available
    const suggestedBlocks = attackMap ? deriveSuggestedBlocks(attackMap) : undefined;
    
    return {
      templateType: rawDraft.templateType,
      subject: rawDraft.subject,
      body: rawDraft.body,
      status,
      sufficiencyWarning: warning,
      suggestedBlocks,
      createdAt: new Date().toISOString(),
    };
  }
  
  return null;
}

/**
 * Derives SuggestedAttackBlocks from attackMap.
 * Filters out missing_evidence — only actionable points become blocks.
 * All blocks start with includeInDraft = false (manual selection by Eldad).
 */
export function deriveSuggestedBlocks(attackMap: AttackPoint[]): SuggestedAttackBlock[] {
  return attackMap
    .filter(p => p.strengthLevel !== 'missing_evidence')
    .map((p, idx) => ({
      id: `sab-${String(idx + 1).padStart(2, '0')}`,
      authorityClaim: p.authorityClaim,
      counterArgument: p.counterArgument,
      supportingEvidence: p.supportingEvidence,
      strengthLevel: p.strengthLevel as 'strong' | 'medium' | 'weak',
      includeInDraft: false,
      source: p.source,
      authoredArgumentId: p.authoredArgumentId,
    }));
}

// #endregion
