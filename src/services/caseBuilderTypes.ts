/* ============================================
   FILE: caseBuilderTypes.ts
   PURPOSE: Types for Case Builder input.
   DEPENDENCIES: ../data/caseTypes
   EXPORTS: RawEmail, RawDocument, CaseSourceInput, ClaimResponse
   ============================================ */
import type { CaseDocumentType, CaseProcessType } from '../data/caseTypes';

// #region Types

/**
 * Raw email — METADATA ONLY (no body, no attachments).
 * Data level: PARTIAL. Contains subject + snippet from Gmail metadata.
 * To upgrade to REAL: connect Gmail API (gmail.readonly) or import .eml files.
 */
export interface RawEmail {
  id: string;
  threadId?: string;
  from: string;
  to: string;
  cc?: string;
  subject: string;
  date: string;
  body?: string;
  attachments?: string[];
  /** Gmail snippet — NOT the full body. Navigation aid only (כלל 10). */
  snippet: string;
  isPartial?: boolean;
  missingFields?: string[];
}

/** סטטוס מסמך — 3 מצבים במקום boolean */
export type DocumentStatus =
  | 'submitted_by_claimant'    // הוגש לרשות ע"י המייצג/התובע
  | 'received_from_authority'   // התקבל מהרשות
  | 'exists_locally_only';      // קיים בתיקייה מקומית בלבד

/**
 * Raw document — FILE REFERENCE ONLY (no content).
 * Data level: PARTIAL. Contains filename + path pointer.
 * To upgrade to REAL: OCR/parse the actual file content.
 */
export interface RawDocument {
  fileName: string;
  source: 'local_folder' | 'email_attachment';
  relativePath?: string;
  /** סטטוס 3-כיווני: הוגש / התקבל / מקומי בלבד */
  documentStatus?: DocumentStatus;
  submissionDate?: string;
  /** @deprecated — use documentStatus instead */
  wasSubmitted?: boolean;
  /** Optional manual override — if not provided, auto-classified */
  type?: CaseDocumentType;
  /** Optional description override */
  description?: string;
}

/** מהימנות רכיב */
export type ReliabilityTag = 'REAL' | 'PARTIAL' | 'SYNTHETIC';

/** מענה ייעודי לטענת רשות — inject ישיר 1:1, ללא fuzzy matching */
export interface ClaimResponse {
  /** אינדקס הטענה (1-based, תואם את DECISION_CONTENT) */
  claimIndex: number;
  /** המענה המלא — מילה במילה מהגרסה המאושרת */
  counterText: string;
  /** שמות קבצי ראיות ספציפיים לטענה הזו */
  evidenceFileNames: string[];
  /** תגית מהימנות */
  reliability: ReliabilityTag;
}

/** Full input to the builder */
export interface CaseSourceInput {
  /** Slug-style ID, e.g. 'dima-rodnitski' */
  caseId: string;
  /** Client display name */
  clientName: string;
  /** Process type */
  processType: CaseProcessType;
  /** ISO date YYYY-MM-DD */
  deadline: string;
  /** Official case number at the authority */
  officialCaseNumber?: string;
  /** Raw emails from Gmail JSON */
  rawEmails: RawEmail[];
  /** Raw documents from local folder scan */
  rawDocuments: RawDocument[];
  /** Free-form notes */
  notes?: string;
  /** Optional: original creation date */
  createdAt?: string;
  /** תוכן התגובה המלא של אלדד — fallback אם אין claimResponses */
  authoredResponseContent?: string;
  /** תוכן החלטת הרשות (text, לא רק description) */
  decisionContent?: string;
  /** מענים ייעודיים 1:1 לטענות — עוקף fuzzy matching כשקיים */
  claimResponses?: ClaimResponse[];
}

// #endregion
