/* ============================================
   FILE: draftReadinessEvaluator.ts
   PURPOSE: מנגנון agentic להערכת מוכנות טיוטה.
            קובע status על פי תוכן — לא על פי לחיצה.
            נקרא אוטומטית אחרי כל שינוי ב-draft.
   DEPENDENCIES: ../data/caseTypes
   EXPORTS: evaluateDraftReadiness, DraftEvaluation
   ============================================ */
import type {
  CaseDraft, CaseDraftStatus, CaseEntity,
  SuggestedAttackBlock, AuthoredArgument,
} from '../data/caseTypes';

// #region Types

/** תוצאת הערכת מוכנות — מה המערכת קבעה ולמה */
export interface DraftEvaluation {
  /** הסטטוס שנגזר מהתוכן */
  computedStatus: CaseDraftStatus;
  /** האם הסטטוס שונה מהנוכחי */
  statusChanged: boolean;
  /** סיבות המעבר */
  reasons: string[];
  /** חסמים שמונעים קידום נוסף */
  blockers: string[];
  /** האם דרוש אישור אלדד (לא ניתן לעקוף) */
  requiresEldadApproval: boolean;
}

// #endregion

// #region Detection Helpers

/** Placeholders ידועים מתוך draftGenerator templates */
const KNOWN_PLACEHOLDERS = [
  '[AMOUNT]', '[DATE]', '[SUBJECT]', '[REFERENCE]', '[ENTITY]',
  '[תקופה]', '[נימוקים מפורטים]', '[נקודה ראשונה]', '[נקודה שנייה]',
  '[תיאור הנזק', '[סכום הנזק הנתבע]', '[שיטת חישוב', '[AMOUNT]',
  '[תוכן המענה]', '[פירוט מסמך',
];

/**
 * בדיקה: האם גוף הטיוטה עדיין template ריק?
 * template = יש 3+ placeholders ולא הוזרקו blocks.
 */
function isTemplateBody(body: string): boolean {
  const count = KNOWN_PLACEHOLDERS.filter(ph => body.includes(ph)).length;
  return count >= 3;
}

/**
 * בדיקה: האם יש placeholders שנותרו?
 * מחזיר רשימה ספציפית.
 */
function findRemainingPlaceholders(body: string): string[] {
  return KNOWN_PLACEHOLDERS.filter(ph => body.includes(ph));
}

/**
 * בדיקה: האם הוזרקו בלוקי טיעון ממפת התקיפה לגוף?
 */
function hasInsertedBlocks(draft: CaseDraft): boolean {
  return (draft.insertedAttackBlockIds?.length ?? 0) > 0;
}

/**
 * בדיקה: האם יש בלוקי טיעון מוצעים עם תוכן ממשי?
 */
function hasSubstantiveBlocks(blocks?: SuggestedAttackBlock[]): boolean {
  if (!blocks || blocks.length === 0) return false;
  return blocks.some(b =>
    b.counterArgument.length > 20
    && b.source === 'authored_response'
  );
}

/**
 * בדיקה: האם draft.body מכיל תוכן ממשי (לא רק template)?
 * תוכן ממשי = יש טקסט ארוך מ-500 תווים + הוזרקו blocks.
 */
function hasSubstantiveBody(body: string, draft: CaseDraft): boolean {
  return body.length > 500 && hasInsertedBlocks(draft);
}

/**
 * בדיקה: האם יש ראיות מקושרות מספיקות?
 */
function hasLinkedEvidence(blocks?: SuggestedAttackBlock[]): boolean {
  if (!blocks) return false;
  const withEvidence = blocks.filter(b =>
    b.includeInDraft && b.supportingEvidence.length > 0
  );
  return withEvidence.length > 0;
}

/**
 * בדיקה: האם אלדד אישר? (approved_by_eldad flag in draft)
 * מכבד את האישור כ-gate חד-כיווני — ברגע שאושר, לא חוזר אחורה.
 */
function hasEldadApproval(draft: CaseDraft): boolean {
  return draft.status === 'approved_by_eldad'
    || draft.status === 'ready_for_submission'
    || (draft.reviewedBy === 'eldad' && draft.lastReviewedAt != null);
}

// #endregion

// #region Core Evaluator

/**
 * מעריך את מוכנות הטיוטה על סמך תוכן בפועל.
 * 
 * מעברים:
 * 
 *   draft → under_review
 *     כאשר: יש תוכן ממשי (blocks הוזרקו), יש בלוקי טיעון מוצעים,
 *            אין טיוטה ריקה (template בלבד).
 * 
 *   under_review → approved_by_eldad
 *     כאשר: אלדד סימן אישור (mission/instruction/reviewedBy).
 *     *** GATE: לא ניתן לעקוף. אין קידום אוטומטי ל-approved. ***
 * 
 *   approved_by_eldad → ready_for_submission
 *     כאשר: אין placeholders, יש body סופי ≥500 תווים,
 *            יש ראיות מקושרות, אושר ע"י אלדד.
 * 
 * כלל: status לא יורד. ברגע ש-approved — לא חוזר ל-under_review.
 *
 * @param draft - הטיוטה הנוכחית
 * @param caseEntity - התיק המלא (לבדיקת authoredArguments, attackMap)
 * @returns DraftEvaluation עם הסטטוס המחושב וסיבות
 */
export function evaluateDraftReadiness(
  draft: CaseDraft,
  caseEntity: CaseEntity,
): DraftEvaluation {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const currentStatus = draft.status;

  const remainingPlaceholders = findRemainingPlaceholders(draft.body);
  const templateOnly = isTemplateBody(draft.body);
  const hasBlocks = hasSubstantiveBlocks(draft.suggestedBlocks);
  const blocksInserted = hasInsertedBlocks(draft);
  const bodyIsReal = hasSubstantiveBody(draft.body, draft);
  const hasEvidence = hasLinkedEvidence(draft.suggestedBlocks);
  const eldadApproved = hasEldadApproval(draft);
  const hasAttackData = (caseEntity.attackMap?.length ?? 0) > 0;
  const hasAuthoredArgs = (caseEntity.authoredArguments?.length ?? 0) > 0;

  // === DEDUP GUARD: block if two blocks share identical counterArgument ===
  const counterTexts = (draft.suggestedBlocks ?? []).map(b => b.counterArgument);
  const hasDuplicateCounters = counterTexts.length !== new Set(counterTexts).size;

  // === Non-demotion rule: never go backward ===
  // approved_by_eldad / ready_for_submission: only forward
  if (currentStatus === 'ready_for_submission') {
    // HARD GUARD: block if placeholders or duplicate counters
    if (remainingPlaceholders.length > 0 || hasDuplicateCounters) {
      const blockerList: string[] = [];
      if (remainingPlaceholders.length > 0) {
        blockerList.push(`נותרו ${remainingPlaceholders.length} placeholders: ${remainingPlaceholders.slice(0, 3).join(', ')}`);
      }
      if (hasDuplicateCounters) {
        blockerList.push('נמצאו מענים כפולים (counterArguments זהים) בבלוקי הטיעון');
      }
      return {
        computedStatus: 'under_review',
        statusChanged: true,
        reasons: ['סטטוס שודרג לאחור — נמצאו פגמים בטיוטה שסומנה כמוכנה'],
        blockers: blockerList,
        requiresEldadApproval: true,
      };
    }
    return {
      computedStatus: 'ready_for_submission',
      statusChanged: false,
      reasons: ['הטיוטה כבר מוכנה להגשה'],
      blockers: [],
      requiresEldadApproval: false,
    };
  }

  // === Evaluate: approved_by_eldad → ready_for_submission ===
  if (eldadApproved) {
    if (remainingPlaceholders.length === 0 && bodyIsReal && hasEvidence) {
      reasons.push('אלדד אישר', 'אין placeholders', 'גוף ממשי', 'ראיות מקושרות');
      return {
        computedStatus: 'ready_for_submission',
        statusChanged: currentStatus !== 'ready_for_submission',
        reasons,
        blockers: [],
        requiresEldadApproval: false,
      };
    }
    // Approved but not ready yet — stay at approved
    if (remainingPlaceholders.length > 0) {
      blockers.push(`עדיין ${remainingPlaceholders.length} placeholders: ${remainingPlaceholders.slice(0, 3).join(', ')}`);
    }
    if (!bodyIsReal) blockers.push('גוף הטיוטה קצר מדי או חסר blocks');
    if (!hasEvidence) blockers.push('אין ראיות מקושרות לבלוקים שנבחרו');

    return {
      computedStatus: 'approved_by_eldad',
      statusChanged: currentStatus !== 'approved_by_eldad',
      reasons: ['אושר ע"י אלדד, ממתין להשלמת חסמים'],
      blockers,
      requiresEldadApproval: false,
    };
  }

  // === Evaluate: draft → under_review ===
  if (!templateOnly && hasBlocks && hasAttackData) {
    // Content exists — check for substantive review readiness
    if (blocksInserted || hasAuthoredArgs) {
      reasons.push('תוכן ממשי קיים');
      if (blocksInserted) reasons.push('blocks הוזרקו לגוף');
      if (hasAuthoredArgs) reasons.push('טיעוני אלדד מנותחים');
      if (hasAttackData) reasons.push('מפת תקיפה קיימת');

      // Blockers for next step
      blockers.push('נדרש אישור מפורש של אלדד לקידום');
      if (remainingPlaceholders.length > 0) {
        blockers.push(`נותרו ${remainingPlaceholders.length} placeholders`);
      }

      return {
        computedStatus: 'under_review',
        statusChanged: currentStatus !== 'under_review' && currentStatus === 'draft',
        reasons,
        blockers,
        requiresEldadApproval: true,
      };
    }
  }

  // === Default: stays draft ===
  if (templateOnly) blockers.push('הטיוטה עדיין template בלבד');
  if (!hasBlocks) blockers.push('אין בלוקי טיעון מוצעים');
  if (!hasAttackData) blockers.push('אין מפת תקיפה');

  return {
    computedStatus: 'draft',
    statusChanged: false,
    reasons: ['טיוטה ראשונית — ממתינה לתוכן'],
    blockers,
    requiresEldadApproval: false,
  };
}

// #endregion

// #region Public API

/**
 * מקדם את status הטיוטה אוטומטית על סמך הערכת מוכנות.
 * מחזיר draft חדש עם status מעודכן, או את ה-draft המקורי אם לא השתנה.
 * לוג מלא לקונסול — visibility למערכת AGI.
 *
 * @param draft - הטיוטה הנוכחית
 * @param caseEntity - התיק המלא
 * @returns CaseDraft עם status שנגזר מתוכן
 */
export function advanceDraftByContent(
  draft: CaseDraft,
  caseEntity: CaseEntity,
): CaseDraft {
  const evaluation = evaluateDraftReadiness(draft, caseEntity);

  // Log — observable behavior for the AGI layer
  const prefix = evaluation.statusChanged
    ? `🔄 [DraftEvaluator] STATUS CHANGE: ${draft.status} → ${evaluation.computedStatus}`
    : `📋 [DraftEvaluator] STATUS UNCHANGED: ${draft.status}`;

  console.log(prefix);
  console.log(`   Reasons: ${evaluation.reasons.join(' | ')}`);
  if (evaluation.blockers.length > 0) {
    console.log(`   Blockers: ${evaluation.blockers.join(' | ')}`);
  }
  if (evaluation.requiresEldadApproval) {
    console.log(`   🔒 GATE: נדרש אישור אלדד`);
  }

  if (!evaluation.statusChanged) {
    return draft;
  }

  return {
    ...draft,
    status: evaluation.computedStatus,
  };
}

/**
 * מאשר טיוטה בשם אלדד — gate שלא ניתן לעקוף אוטומטית.
 * נקרא ע"י agent mission / systemBrain / confirm action.
 * לא ע"י כפתור UI (אבל UI יכול לקרוא לזה דרך store action).
 * 
 * @param draft - הטיוטה הנוכחית
 * @returns CaseDraft עם eldad approval flag + status re-evaluation
 */
export function markApprovedByEldad(draft: CaseDraft): CaseDraft {
  console.log('[DraftEvaluator] ✅ ELDAD APPROVAL RECEIVED');
  return {
    ...draft,
    status: 'approved_by_eldad',
    reviewedBy: 'eldad',
    lastReviewedAt: new Date().toISOString(),
  };
}

// #endregion
