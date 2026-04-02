/* ============================================
   FILE: classificationTypes.ts
   PURPOSE: טיפוסים משותפים למערכת סיווג המיילים — email-to-workflow
   DEPENDENCIES: None
   EXPORTS: EmailCategory, TargetQueue, ExtractedData, ClassifiedEmail,
            WorkflowAction, RoutingResult, AccountingRecord, ClientRecord
   ============================================ */

// #region Email Categories

/** 7 קטגוריות סיווג מייל */
export type EmailCategory =
  | 'invoice'
  | 'payment_required'
  | 'accounting_document'
  | 'legal_task'
  | 'client_document'
  | 'bank_request'
  | 'marketing';

/** יעד ניתוב */
export type TargetQueue =
  | 'accounting'
  | 'payments'
  | 'tasks'
  | 'clients'
  | 'ignore';

/** מיפוי category → queue */
export const CATEGORY_QUEUE_MAP: Record<EmailCategory, TargetQueue> = {
  invoice: 'accounting',
  payment_required: 'payments',
  accounting_document: 'accounting',
  legal_task: 'tasks',
  client_document: 'clients',
  bank_request: 'tasks',
  marketing: 'ignore',
};

// #endregion

// #region Extracted Data

/** נתונים שחולצו מגוף המייל */
export interface ExtractedData {
  clientName: string | null;
  amount: number | null;
  dueDate: string | null;
  attachments: string[];
  actionRequired: string | null;
  paymentLink: string | null;
}

// #endregion

// #region Classification Result

/** תוצאת סיווג מלאה */
export interface ClassifiedEmail {
  emailId: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  labels: string[];
  /** הקטגוריה שנבחרה */
  category: EmailCategory;
  /** רמת ביטחון 0-100 */
  confidence: number;
  /** סיבת הסיווג (עברית) */
  reason: string;
  /** נתונים שחולצו */
  extracted: ExtractedData;
  /** תור יעד */
  targetQueue: TargetQueue;
}

// #endregion

// #region Workflow Actions

/** פעולת workflow שבוצעה */
export type WorkflowAction =
  | 'bill_created'
  | 'invoice_stored'
  | 'accounting_doc_stored'
  | 'task_created'
  | 'draft_generated'
  | 'client_doc_stored'
  | 'ignored'
  | 'skipped';

/** תוצאת ניתוב */
export interface RoutingResult {
  emailId: string;
  category: EmailCategory;
  actions: WorkflowAction[];
  targetQueue: TargetQueue;
  /** מזהה הישות שנוצרה (bill id, task id, etc.) */
  createdEntityId?: string;
  /** טיוטת מענה (לסוג legal_task) */
  draftSubject?: string;
  draftBody?: string;
}

// #endregion

// #region Storage Records

/** רשומת הנהלת חשבונות */
export interface AccountingRecord {
  id: string;
  emailId: string;
  type: 'invoice' | 'receipt' | 'tax_notice' | 'payslip' | 'general';
  from: string;
  subject: string;
  amount: number | null;
  date: string;
  storedAt: string;
}

/** רשומת לקוח */
export interface ClientRecord {
  id: string;
  emailId: string;
  clientName: string;
  subject: string;
  actionRequired: string | null;
  date: string;
  storedAt: string;
}

// #endregion
