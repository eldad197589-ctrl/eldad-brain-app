/* ============================================
   FILE: executor.ts
   PURPOSE: מנוע ביצוע תשלומים — מחזור חיים מלא עם הגנות
   DEPENDENCIES: ../types, ../receipts/engine
   EXPORTS: executeBillPayment, reconcilePayment, createManualGateway,
            createFailedGateway, getAuditTrail, clearExpiredLocks
   ============================================ */
import type { Bill, Receipt, CashflowState } from '../types';
import { processReceipt } from '../receipts/engine';

// #region Gateway Interface

/**
 * ממשק שער תשלום — כל gateway חייב לממש את זה
 */
export interface PaymentGatewayResult {
  /** האם התשלום הצליח */
  success: boolean;
  /** מספר אישור מהספק */
  confirmationNumber?: string;
  /** הודעת שגיאה אם נכשל */
  errorMessage?: string;
  /** הסכום שנגבה בפועל (לבדיקת התאמה) */
  paidAmount?: number;
  /** מזהה פנימי של ה-gateway */
  gatewayRef?: string;
}

/**
 * טיפוס פונקציית gateway — מקבלת bill ומחזירה תוצאה
 */
export type PaymentGateway = (bill: Bill) => Promise<PaymentGatewayResult>;

// #endregion

// #region Audit Trail

export interface AuditEntry {
  timestamp: string;
  billId: string;
  action: string;
  detail: string;
  gatewayRef?: string;
}

const auditTrail: AuditEntry[] = [];

function audit(billId: string, action: string, detail: string, gatewayRef?: string): void {
  auditTrail.push({
    timestamp: new Date().toISOString(),
    billId,
    action,
    detail,
    gatewayRef
  });
}

/** מחזיר את כל לוג הביקורת */
export function getAuditTrail(): AuditEntry[] { return [...auditTrail]; }

/** מחזיר לוג ביקורת של חשבון ספציפי */
export function getAuditForBill(billId: string): AuditEntry[] {
  return auditTrail.filter(e => e.billId === billId);
}

// #endregion

// #region Lock Management

/** מפת נעילות: billId → timestamp של נעילה */
const activeLocks = new Map<string, number>();

/** משך timeout לנעילה (5 דקות) */
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

function acquireLock(billId: string): boolean {
  const existing = activeLocks.get(billId);
  if (existing) {
    const elapsed = Date.now() - existing;
    if (elapsed < LOCK_TIMEOUT_MS) {
      return false; // נעול — לא ניתן להתחיל תשלום
    }
    // נעילה פגה — משחררים
    activeLocks.delete(billId);
    audit(billId, 'lock_expired', `נעילה פגה לאחר ${Math.round(elapsed / 1000)} שניות.`);
  }
  activeLocks.set(billId, Date.now());
  return true;
}

function releaseLock(billId: string): void {
  activeLocks.delete(billId);
}

/**
 * ניקוי נעילות שפגו — להפעלה תקופתית
 */
export function clearExpiredLocks(allBills: Bill[]): string[] {
  const cleared: string[] = [];
  for (const [billId, lockTime] of activeLocks.entries()) {
    if (Date.now() - lockTime > LOCK_TIMEOUT_MS) {
      activeLocks.delete(billId);
      const bill = allBills.find(b => b.id === billId);
      if (bill && bill.status === 'payment_in_progress') {
        bill.status = 'payment_failed';
        bill.notes.push('נעילה פגה (timeout). החשבון שוחרר.');
      }
      audit(billId, 'lock_cleared', 'נעילה נוקתה אוטומטית עקב timeout.');
      cleared.push(billId);
    }
  }
  return cleared;
}

// #endregion

// #region Execution Result

export interface ExecutionResult {
  stage: 'validated' | 'in_progress' | 'completed' | 'failed' | 'rejected' | 'amount_mismatch';
  bill: Bill;
  receipt?: Receipt;
  balanceAfter?: number;
  issues: string[];
}

// #endregion

// #region Pre-Payment Validation

function validateBeforePayment(bill: Bill, cashflow: CashflowState): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (bill.status === 'paid') {
    issues.push('החשבון כבר שולם.'); return { valid: false, issues };
  }
  if (bill.status === 'duplicate') {
    issues.push('החשבון מסומן ככפילות.'); return { valid: false, issues };
  }
  if (bill.status === 'payment_in_progress') {
    issues.push('תשלום כבר מתבצע.'); return { valid: false, issues };
  }

  const after = cashflow.balance - bill.amount;
  if (after < cashflow.reserveMinimum) {
    issues.push(`יתרה תרד ל-₪${after} (מתחת לרצפה ₪${cashflow.reserveMinimum}).`);
    return { valid: false, issues };
  }

  return { valid: true, issues: [] };
}

// #endregion

// #region Payment Execution

/** סטיית סכום מותרת (1%) */
const AMOUNT_TOLERANCE = 0.01;

/**
 * מנוע ביצוע תשלום מלא:
 * 1. ולידציה
 * 2. נעילה (מניעת כפילויות)
 * 3. סימון payment_in_progress
 * 4. קריאה ל-gateway
 * 5. בדיקת התאמת סכום
 * 6. הצלחה → paid + receipt / כשלון → payment_failed
 */
export async function executeBillPayment(
  bill: Bill,
  allBills: Bill[],
  allReceipts: Receipt[],
  cashflow: CashflowState,
  gateway: PaymentGateway,
  receiptIdCounter: { value: number }
): Promise<ExecutionResult> {

  // --- שלב 1: ולידציה ---
  const v = validateBeforePayment(bill, cashflow);
  if (!v.valid) {
    audit(bill.id, 'rejected', v.issues.join(' '));
    return { stage: 'rejected', bill, issues: v.issues };
  }

  // --- שלב 2: נעילה ---
  if (!acquireLock(bill.id)) {
    audit(bill.id, 'lock_denied', 'ניסיון תשלום נדחה — חשבון נעול.');
    return { stage: 'rejected', bill, issues: ['החשבון נעול (תשלום אחר בתהליך). נסה שוב.'] };
  }

  // --- שלב 3: payment_in_progress ---
  const prevStatus = bill.status;
  bill.status = 'payment_in_progress';
  bill.notes.push('תשלום מתחיל...');
  audit(bill.id, 'payment_started', `סטטוס שונה מ-${prevStatus} ל-payment_in_progress.`);

  // --- שלב 4: קריאה ל-gateway ---
  let gwResult: PaymentGatewayResult;
  try {
    gwResult = await gateway(bill);
  } catch (err) {
    bill.status = 'payment_failed';
    const msg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
    bill.notes.push(`שגיאת gateway: ${msg}`);
    audit(bill.id, 'gateway_error', msg);
    releaseLock(bill.id);
    return { stage: 'failed', bill, issues: [`שגיאת gateway: ${msg}`] };
  }

  // --- שלב 4.1: gateway החזיר כשלון ---
  if (!gwResult.success) {
    bill.status = 'payment_failed';
    bill.notes.push(`תשלום נכשל: ${gwResult.errorMessage || 'ללא פירוט'}`);
    audit(bill.id, 'payment_failed', gwResult.errorMessage || 'ללא פירוט', gwResult.gatewayRef);
    releaseLock(bill.id);
    return { stage: 'failed', bill, issues: [`נכשל: ${gwResult.errorMessage}`] };
  }

  // --- שלב 5: בדיקת התאמת סכום ---
  if (gwResult.paidAmount !== undefined) {
    const diff = Math.abs(gwResult.paidAmount - bill.amount) / bill.amount;
    if (diff > AMOUNT_TOLERANCE) {
      bill.status = 'review';
      bill.notes.push(`חוסר התאמת סכום: צפוי ₪${bill.amount}, נגבה ₪${gwResult.paidAmount}. עובר לבדיקה.`);
      audit(bill.id, 'amount_mismatch', `₪${bill.amount} vs ₪${gwResult.paidAmount}`, gwResult.gatewayRef);
      releaseLock(bill.id);
      return { stage: 'amount_mismatch', bill, issues: [`סכום שנגבה (₪${gwResult.paidAmount}) שונה מהצפוי (₪${bill.amount}).`] };
    }
  }

  // --- שלב 6: הצלחה → paid + receipt ---
  const confNum = gwResult.confirmationNumber || `gw-${Date.now()}`;

  bill.status = 'paid';
  bill.paidDate = new Date().toISOString().split('T')[0];
  bill.confirmationNumber = confNum;
  bill.notes.push(`שולם בהצלחה. אישור: ${confNum}.`);

  const receipt = processReceipt(
    `rcpt-${receiptIdCounter.value++}`, bill.provider, bill.amount, confNum, 'household'
  );
  receipt.linkedBillId = bill.id;
  receipt.notes.push('נוצרה אוטומטית לאחר תשלום מוצלח.');
  allReceipts.push(receipt);
  bill.linkedReceiptId = receipt.id;

  audit(bill.id, 'payment_completed', `אישור: ${confNum}`, gwResult.gatewayRef);
  releaseLock(bill.id);

  return {
    stage: 'completed',
    bill,
    receipt,
    balanceAfter: cashflow.balance - bill.amount,
    issues: []
  };
}

// #endregion

// #region Reconciliation

/**
 * התאמת תשלום: מאמתת שחשבון אכן שולם מול אסמכתה חיצונית.
 * משמשת כשמגיעה קבלה/אישור ממקור חיצוני ורוצים לוודא שהמערכת מסונכרנת.
 */
export function reconcilePayment(
  billId: string,
  confirmationNumber: string,
  paidAmount: number,
  allBills: Bill[]
): { reconciled: boolean; issue?: string } {
  const bill = allBills.find(b => b.id === billId);
  if (!bill) {
    return { reconciled: false, issue: `חשבון ${billId} לא נמצא.` };
  }

  // אם עדיין לא שולם — האסמכתה מאשרת תשלום
  if (bill.status !== 'paid' && bill.status !== 'payment_failed' && bill.status !== 'review') {
    return { reconciled: false, issue: `חשבון ${billId} במצב ${bill.status} — לא ניתן לבצע reconciliation.` };
  }

  // בדיקת התאמת סכום
  const diff = Math.abs(paidAmount - bill.amount) / bill.amount;
  if (diff > AMOUNT_TOLERANCE) {
    bill.status = 'review';
    bill.notes.push(`reconciliation: סכום לא תואם (₪${paidAmount} מול ₪${bill.amount}).`);
    audit(billId, 'reconcile_mismatch', `₪${paidAmount} vs ₪${bill.amount}`);
    return { reconciled: false, issue: `סכום האסמכתה (₪${paidAmount}) לא תואם (₪${bill.amount}).` };
  }

  // בדיקת התאמת אישור
  if (bill.confirmationNumber && bill.confirmationNumber !== confirmationNumber) {
    bill.notes.push(`reconciliation: מספר אישור שונה (${confirmationNumber} מול ${bill.confirmationNumber}).`);
    audit(billId, 'reconcile_conf_mismatch', `${confirmationNumber} vs ${bill.confirmationNumber}`);
    return { reconciled: false, issue: 'מספר אישור לא תואם.' };
  }

  // הכל תואם — מאשרים
  if (bill.status === 'payment_failed' || bill.status === 'review') {
    bill.status = 'paid';
    bill.paidDate = bill.paidDate || new Date().toISOString().split('T')[0];
    bill.confirmationNumber = confirmationNumber;
    bill.notes.push(`reconciliation: אושר עם אסמכתה ${confirmationNumber}.`);
  }

  audit(billId, 'reconciled', `אומת בהצלחה. אישור: ${confirmationNumber}.`);
  return { reconciled: true };
}

// #endregion

// #region Gateway Factories

/**
 * Gateway ידני: אלדד אישר שהוא שילם.
 * הסכום שנגבה = סכום החשבון (אין בדיקת התאמה).
 */
export function createManualGateway(confirmationNumber?: string): PaymentGateway {
  return async (bill: Bill) => ({
    success: true,
    confirmationNumber: confirmationNumber || `manual-${Date.now()}`,
    paidAmount: bill.amount, // אדם מאשר — מניחים שהסכום נכון
    gatewayRef: 'human-in-the-loop'
  });
}

/**
 * Gateway כשלון: לבדיקות ותרגולים.
 */
export function createFailedGateway(errorMessage: string): PaymentGateway {
  return async () => ({
    success: false,
    errorMessage,
    gatewayRef: 'test-failure'
  });
}

/**
 * Gateway עם סכום שונה: לבדיקת amount mismatch.
 */
export function createMismatchGateway(paidAmount: number, confNum: string): PaymentGateway {
  return async () => ({
    success: true,
    confirmationNumber: confNum,
    paidAmount, // סכום שונה מהצפוי!
    gatewayRef: 'test-mismatch'
  });
}

// #endregion
