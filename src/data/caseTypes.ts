/* ============================================
   FILE: caseTypes.ts
   PURPOSE: Case entity types — single shape for all case data.
            Seeds and future loaders must produce this exact shape.
   DEPENDENCIES: None (pure types)
   EXPORTS: CaseEntity, CaseEmail, CaseDocument, CaseDocumentType,
            CaseStatus, CaseProcessType, CaseDraft, SuggestedAttackBlock
   ============================================ */

import type { CaseBundle } from '../integrations/gmail/caseBundle';
import type { AttackPoint } from '../services/decisionAttackEngine';

// #region Types

/** סטטוס תיק */
export type CaseStatus =
  | 'collecting'
  | 'reviewing'
  | 'drafting'
  | 'submitted'
  | 'appealed'
  | 'closed';

/** סוג תהליך */
export type CaseProcessType =
  | 'war_compensation_appeal'
  | 'war_compensation_claim'
  | 'tax_audit'
  | 'penalty_appeal'
  | 'insurance_claim'
  | 'general';

/** סיווג מסמך */
export type CaseDocumentType =
  | 'decision_document'
  | 'response_letter'
  | 'license'
  | 'calculation'
  | 'business_records'
  | 'supporting_scan'
  | 'request_letter'
  | 'attachment'
  | 'other';

/** סוג טיעון מנותח מתגובת אלדד */
export type AuthoredArgumentType = 'factual' | 'legal' | 'evidentiary' | 'procedural';

/** טיעון מנותח מתגובה שנכתבה ע"י אלדד */
export interface AuthoredArgument {
  /** מזהה ייחודי */
  id: string;
  /** כותרת קצרה */
  title: string;
  /** הטקסט המלא של הטיעון */
  argumentText: string;
  /** סיווג */
  argumentType: AuthoredArgumentType;
  /** מזהי טענות רשות שהטיעון עונה עליהן */
  relatedAuthorityClaimIds: string[];
  /** מזהי ראיות תומכות */
  supportingEvidenceIds: string[];
  /** הערכת חוזק */
  strengthEstimate: 'strong' | 'medium' | 'weak';
  /** הפסקאות המקוריות מהתגובה */
  sourceParagraphs: string[];
}

/** אירוע בציר הזמן */
export interface CaseTimelineEvent {
  id: string;
  date: string;
  type: 'email_received' | 'email_sent' | 'document_submitted' | 'decision_received' | 'deadline' | 'other';
  description: string;
}

/** מייל בתיק */
export interface CaseEmail {
  /** Gmail message ID */
  id: string;
  /** שולח */
  from: string;
  /** נמען */
  to: string;
  /** עותק */
  cc: string;
  /** נושא */
  subject: string;
  /** תאריך ISO */
  date: string;
  /** תקציר */
  snippet: string;
  /** סיווג אוטומטי (מ-emailClassifier) */
  classification?: {
    category: string;
    confidence: number;
    isWork: boolean;
  };
}

/** מסמך בתיק */
export interface CaseDocument {
  /** מזהה ייחודי */
  id: string;
  /** שם קובץ */
  fileName: string;
  /** סיווג */
  type: CaseDocumentType;
  /** תיאור */
  description: string;
  /** מקור: 'local_folder' | 'email_attachment' */
  source: 'local_folder' | 'email_attachment';
  /** נתיב יחסי (לתיקיה מקומית) */
  relativePath?: string;
  /** האם סופק למפקח */
  wasSubmitted: boolean;
  /** תאריך הגשה */
  submissionDate?: string;
}

/** סטטוס טיוטה ומחזור חיים */
export type CaseDraftStatus =
  | 'draft'
  | 'under_review'
  | 'approved_by_eldad'
  | 'ready_for_submission';

/** בלוק טיעון מוצע — נגזר ממפת התקיפה לשימוש ידני בטיוטה */
export interface SuggestedAttackBlock {
  /** מזהה ייחודי */
  id: string;
  /** הטענה המקורית של הרשות */
  authorityClaim: string;
  /** הטיעון הנגדי המוצע */
  counterArgument: string;
  /** ראיות תומכות */
  supportingEvidence: string[];
  /** עוצמת התקיפה */
  strengthLevel: 'strong' | 'medium' | 'weak';
  /** האם אלדד בחר להכניס לטיוטה — ידני בלבד */
  includeInDraft: boolean;
  /** מקור הטיעון הנגדי — תגובת אלדד או טיעון גנרי */
  source: 'authored_response' | 'generic';
  /** מזהה AuthoredArgument תואם */
  authoredArgumentId?: string;
}

/** טיוטת ערר/מכתב */
export interface CaseDraft {
  /** סוג תבנית */
  templateType: string;
  /** נושא */
  subject: string;
  /** גוף */
  body: string;
  /** תאריך יצירה */
  createdAt: string;
  /** סטטוס מול אלדד */
  status: CaseDraftStatus;
  /** התראת מספיקות (Sufficiency Warning) */
  sufficiencyWarning: string | null;
  /** בלוקי טיעון מוצעים שנבחרו — ידני בלבד, לא מקודם אוטומטית */
  suggestedBlocks?: SuggestedAttackBlock[];
  /** תיעוד ייצוא לטיוטה פנימית */
  exportedDraftAt?: string;
  /** תיעוד ייצוא להגשה סופית */
  exportedFinalAt?: string;
  /** מתי נבדק אחרונה */
  lastReviewedAt?: string;
  /** מי בדק (למשל, 'אלדד') */
  reviewedBy?: string;
  /** מתי הוזרקו בלוקי טיעון לגוף הטיוטה */
  suggestedBlocksInsertedAt?: string;
  /** מזהי בלוקים שכבר הוזרקו — למניעת כפילות */
  insertedAttackBlockIds?: string[];
  /** מאיזה גרסת seed נבנתה הטיוטה */
  builtFromVersion?: number;
  /** מקור הטיוטה: seed_blocks / generic_template / manual_edit */
  builtFromSource?: 'seed_blocks' | 'generic_template' | 'manual_edit';
  /** snapshot של הטיוטה הקודמת לפני דריסה (כלל הגנה) */
  previousSnapshot?: {
    body: string;
    subject: string;
    savedAt: string;
    builtFromVersion?: number;
  };
}

/** ישות תיק מלאה */
export interface CaseEntity {
  /** מזהה ייחודי — slug-style, e.g. 'dima-rodnitski' */
  caseId: string;
  /** שם לקוח */
  clientName: string;
  /** סוג תהליך */
  processType: CaseProcessType;
  /** סטטוס */
  status: CaseStatus;
  /** דדליין ISO date (YYYY-MM-DD) */
  deadline: string;
  /** מספר תיק ברשות */
  officialCaseNumber?: string;
  /** מיילים */
  emails: CaseEmail[];
  /** מסמכים */
  documents: CaseDocument[];
  /** פריטים חסרים */
  missingItems: string[];
  /** טיוטה אחרונה */
  draft: CaseDraft | null;
  /** מקבץ הקשר מחושב מ-email context, אם יש */
  caseBundle?: CaseBundle;
  /** רצועת זמן מחושבת */
  timeline: CaseTimelineEvent[];
  /** הערות חופשיות */
  notes: string;
  /** דגלי סיכון */
  riskFlags: string[];
  /** מפת תקיפה שלב-הוכחות (אם קיים טקסט החלטה ותגובת אלדד) */
  attackMap?: AttackPoint[];
  /** סיכום מפת התקיפה ל-UI */
  attackSummary?: {
    totalClaims: number;
    strongPoints: number;
    mediumPoints: number;
    weakPoints: number;
    missingEvidencePoints: number;
  };
  /** טיעונים מנותחים מתגובת אלדד */
  authoredArguments?: AuthoredArgument[];
  /** טענות רשות שעדיין אין להן מענה מספיק */
  uncoveredAuthorityClaims?: string[];
  /** תאריך יצירה */
  createdAt: string;
  /** תאריך עדכון */
  updatedAt: string;
  /** מזהה גרסת מנוע ההרכבה */
  builtWithVersion?: number;
  /** חותמת זמן של ההרכבה אחרונה */
  builtAt?: string;
  /** טביעת אצבע של המקור (אופציונלי כרגע) */
  sourceFingerprint?: string;
}

// #endregion
