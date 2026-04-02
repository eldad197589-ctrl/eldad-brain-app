/* ============================================
   FILE: types.ts
   PURPOSE: טיפוסי נתונים משותפים לכל מנועי המערכת
   DEPENDENCIES: None
   EXPORTS: BillStatus, Bill, Receipt, CashflowState, PaymentDecision, PaymentPlan, DashboardView
   ============================================ */

// #region Bill Types

export type BillStatus =
  | 'upcoming'
  | 'due'
  | 'overdue'
  | 'paid'
  | 'duplicate'
  | 'review'
  | 'payment_in_progress'
  | 'payment_failed';

export interface Bill {
  id: string;
  provider: string;
  category: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  previousAmount?: number;
  sourceEmailId?: string;
  paymentLink?: string;
  linkedReceiptId?: string;
  confirmationNumber?: string;
  paidDate?: string;
  paidVia?: string;
  filedUnder?: string;
  notes: string[];
}

// #endregion

// #region Receipt Types

export interface Receipt {
  id: string;
  provider: string;
  amount: number;
  receivedDate: string;
  confirmationNumber: string;
  linkedBillId: string | null;
  filingTarget: 'personal' | 'business';
  filingPath: string;
  sourceEmailId?: string;
  notes: string[];
}

// #endregion

// #region Orchestrator Types

export interface IncomingEvent {
  id: string;
  source: 'EMAIL' | 'UPLOAD' | 'WHATSAPP';
  payload: {
    sender: string;
    subject: string;
    body: string;
    fileName?: string;
    mimeType?: string;
  };
}

export type EntityType = 'household' | 'business' | 'unknown';
export type DocType = 'bill' | 'invoice' | 'receipt' | 'contract' | 'general' | 'unknown';
export type EngineChoice = 'bills' | 'business-docs' | 'ignore';
export type ActionChoice = 'process_payment' | 'file_to_drive' | 'notify_user' | 'discard';

export interface OrchestratorResult {
  entity: EntityType;
  documentType: DocType;
  selectedEngine: EngineChoice;
  action: ActionChoice;
  confidence: number;
  issues: string[];
}

// #endregion

// #region Cashflow Types

export interface CashflowState {
  balance: number;
  creditLimit: number;
  monthlyIncome: number;
  reserveMinimum: number;
}

export interface PaymentDecision {
  billId: string;
  provider: string;
  amount: number;
  dueDate: string;
  decision: 'pay_now' | 'defer' | 'review';
  reason: string;
}

export interface PaymentPlan {
  payNow: PaymentDecision[];
  defer: PaymentDecision[];
  review: PaymentDecision[];
  totalDue: number;
  balanceAfterPayments: number;
  isOverloaded: boolean;
}

// #endregion

// #region Dashboard Types

export interface DashboardView {
  urgent: Bill[];
  upcoming: Bill[];
  recentlyPaid: Bill[];
  anomalies: Bill[];
  plan: PaymentPlan;
  recentReceipts: Receipt[];
}

// #endregion
