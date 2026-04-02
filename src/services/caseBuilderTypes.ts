/* ============================================
   FILE: caseBuilderTypes.ts
   PURPOSE: Types for Case Builder input.
   DEPENDENCIES: ../data/caseTypes
   EXPORTS: RawEmail, RawDocument, CaseSourceInput
   ============================================ */
import type { CaseDocumentType, CaseProcessType } from '../data/caseTypes';

// #region Types

/** Raw email — minimal shape from Gmail JSON */
export interface RawEmail {
  id: string;
  from: string;
  to: string;
  cc?: string;
  subject: string;
  date: string;
  snippet: string;
}

/** Raw document — file from local folder or email attachment */
export interface RawDocument {
  fileName: string;
  source: 'local_folder' | 'email_attachment';
  relativePath?: string;
  wasSubmitted?: boolean;
  submissionDate?: string;
  /** Optional manual override — if not provided, auto-classified */
  type?: CaseDocumentType;
  /** Optional description override */
  description?: string;
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
  /** תוכן התגובה המלא של אלדד */
  authoredResponseContent?: string;
  /** תוכן החלטת הרשות (text, לא רק description) */
  decisionContent?: string;
}

// #endregion
