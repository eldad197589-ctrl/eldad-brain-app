/* ============================================
   FILE: pipeline.ts
   PURPOSE: צנרת מרכזית — מחברת את כל המנועים דרך store
   DEPENDENCIES: store, orchestrator, bills, receipts, cashflow, dashboard, payments/executor
   EXPORTS: handleIncomingEvent, confirmBillPayment, executeBillViaGateway,
            reconcileBill, generateDashboard, seedInitialBills, getAllBills, getAllReceipts
   ============================================ */
import type { IncomingEvent, Bill, Receipt, CashflowState, DashboardView } from './types';
import { store } from './store';
import { eventBus, createCorrelationId } from './events';
import { processIncomingEvent } from './orchestrator/engine';
import { classifyBillStatus, linkReceiptToBill } from './bills/engine';
import { processReceipt } from './receipts/engine';
import { getPaymentDecisions } from './cashflow/engine';
import { buildDashboardView } from './dashboard/engine';
import { executeBillPayment, reconcilePayment, createManualGateway, clearExpiredLocks } from './payments/executor';
import type { PaymentGateway, ExecutionResult } from './payments/executor';

// #region Validation Helpers

function isValidDate(dateStr: string): boolean {
  if (!dateStr || dateStr.trim() === '') return false;
  return !isNaN(new Date(dateStr).getTime());
}

// #endregion

// #region Pipeline: אירוע חדש נכנס למערכת

/**
 * זרימה מלאה: מייל/קובץ → Orchestrator → Bills או Receipts
 */
export function handleIncomingEvent(
  event: IncomingEvent,
  providerHint: string,
  amount: number,
  dueDate: string,
  previousAmount?: number,
  paymentLink?: string
): { action: string; bill?: Bill; receipt?: Receipt; issues: string[] } {

  const issues: string[] = [];

  if (amount <= 0) {
    return { action: 'rejected', issues: ['סכום לא תקין (0 או שלילי). האירוע נדחה.'] };
  }

  const forceReview = !providerHint || providerHint.trim() === '';
  if (forceReview) issues.push('שם ספק ריק — בדיקה ידנית.');

  const badDate = !isValidDate(dueDate);
  if (badDate) issues.push('תאריך לא תקין — בדיקה ידנית.');

  const routing = processIncomingEvent(event);

  // קבלה → Receipts
  if (routing.documentType === 'receipt') {
    const confNum = `auto-${Date.now()}`;
    if (store.isDuplicateReceipt(providerHint, amount, confNum)) {
      return { action: 'duplicate_receipt', issues: [...routing.issues, 'קבלה כפולה.'] };
    }

    const receipt = processReceipt(
      store.nextReceiptId(), providerHint, amount, confNum,
      routing.entity === 'business' ? 'business' : 'household',
      event.payload.sender
    );

    const closed = linkReceiptToBill(receipt.id, providerHint, amount, confNum, store.getBillsMutable());
    if (closed) {
      receipt.linkedBillId = closed.id;
      receipt.notes.push(`סגר חשבון: ${closed.id}`);
    } else {
      receipt.notes.push('לא נמצא חשבון פתוח — תיוק בלבד.');
    }

    store.addReceipt(receipt);
    return { action: 'filed_receipt', receipt, issues: [...routing.issues, ...issues] };
  }

  // חשבון → Bills
  if (routing.selectedEngine === 'bills' && routing.action === 'process_payment') {
    const rawBill: Omit<Bill, 'status' | 'notes'> = {
      id: store.nextBillId(),
      provider: providerHint || 'לא ידוע',
      category: event.payload.subject,
      amount,
      dueDate: badDate ? new Date().toISOString().split('T')[0] : dueDate,
      previousAmount,
      sourceEmailId: event.id,
      paymentLink,
    };

    if (forceReview || badDate) {
      const bill: Bill = { ...rawBill, status: 'review', notes: [...issues] };
      store.addBill(bill);
      return { action: 'bill_created_review', bill, issues: [...routing.issues, ...issues] };
    }

    const { status, notes } = classifyBillStatus(rawBill, store.getBillsMutable());
    const bill: Bill = { ...rawBill, status, notes };
    store.addBill(bill);
    return { action: 'bill_created', bill, issues: [...routing.issues, ...notes] };
  }

  return { action: routing.action, issues: [...routing.issues, ...issues] };
}

// #endregion

// #region Pipeline: אישור תשלום ידני

/**
 * אלדד לוחץ "שילמתי" — סימון ידני + receipt אוטומטית.
 * correlationId מגיע מה-UI כדי לשמר שרשרת.
 */
export function confirmBillPayment(
  billId: string,
  confirmationNumber?: string,
  correlationId?: string
): { success: boolean; bill?: Bill; receipt?: Receipt; error?: string } {
  const corrId = correlationId || createCorrelationId('cfm');
  const meta = { correlationId: corrId };

  const bill = store.getBillRef(billId);
  if (!bill) return { success: false, error: `חשבון ${billId} לא נמצא.` };
  if (bill.status === 'paid') return { success: false, error: 'כבר שולם.' };
  if (bill.status === 'duplicate') return { success: false, error: 'כפילות.' };

  const confNum = confirmationNumber || `manual-${Date.now()}`;
  bill.status = 'paid';
  bill.paidDate = new Date().toISOString().split('T')[0];
  bill.confirmationNumber = confNum;
  bill.notes.push(`אושר ידנית. אישור: ${confNum}.`);

  eventBus.emit('bill_paid', { billId, provider: bill.provider, amount: bill.amount, confirmationNumber: confNum, paidDate: bill.paidDate }, { source: 'pipeline', ...meta });

  let receipt: Receipt | undefined;
  if (!store.isDuplicateReceipt(bill.provider, bill.amount, confNum)) {
    receipt = processReceipt(store.nextReceiptId(), bill.provider, bill.amount, confNum, 'household');
    receipt.linkedBillId = bill.id;
    receipt.notes.push(`נוצרה מאישור ידני של ${billId}.`);
    store.addReceipt(receipt, meta);
    bill.linkedReceiptId = receipt.id;
  }

  store.persist();
  return { success: true, bill, receipt };
}

// #endregion

// #region Pipeline: ביצוע תשלום דרך Executor

/**
 * ביצוע תשלום מלא עם executor + gateway.
 * correlationId מגיע מה-UI כדי לשמר שרשרת.
 */
export async function executeBillViaGateway(
  billId: string,
  cashflow: CashflowState,
  gateway?: PaymentGateway,
  confirmationNumber?: string,
  correlationId?: string
): Promise<ExecutionResult> {
  const corrId = correlationId || createCorrelationId('pay');
  const meta = { correlationId: corrId };

  const bill = store.getBillRef(billId);
  if (!bill) {
    return { stage: 'rejected', bill: { id: billId } as Bill, issues: ['חשבון לא נמצא.'] };
  }

  eventBus.emit('payment_started', { billId, provider: bill.provider }, { source: 'pipeline', ...meta });

  const gw = gateway || createManualGateway(confirmationNumber);
  const counterRef = { value: store.getReceiptCounterValue() };

  const result = await executeBillPayment(
    bill, store.getBillsMutable(), store.getReceiptsMutable(), cashflow, gw, counterRef
  );

  if (result.receipt) {
    store.incrementReceiptCounter();
    // receipt נוצרה ע"י executor ישירות ל-array — צריך לשמור ולשלוח event
    store.persist();
    eventBus.emit('receipt_created', {
      receiptId: result.receipt.id, provider: result.receipt.provider,
      amount: result.receipt.amount, linkedBillId: result.receipt.linkedBillId
    }, { source: 'pipeline', ...meta });
  }
  store.persist();

  if (result.stage === 'completed') {
    eventBus.emit('bill_paid', { billId, provider: bill.provider, amount: bill.amount, confirmationNumber: bill.confirmationNumber || '', paidDate: bill.paidDate || '' }, { source: 'pipeline', ...meta });
  } else if (result.stage === 'failed') {
    eventBus.emit('payment_failed', { billId, provider: bill.provider, reason: result.issues.join(', ') }, { source: 'pipeline', ...meta });
  }
  return result;
}

// #endregion

// #region Pipeline: Reconciliation

/**
 * אימות תשלום מול אסמכתה חיצונית.
 * correlationId מגיע מה-UI.
 */
export function reconcileBill(
  billId: string, confirmationNumber: string, paidAmount: number,
  correlationId?: string
): { reconciled: boolean; issue?: string } {
  const corrId = correlationId || createCorrelationId('rcn');
  const meta = { correlationId: corrId };

  const result = reconcilePayment(billId, confirmationNumber, paidAmount, store.getBillsMutable());
  store.persist();
  if (result.reconciled) eventBus.emit('reconcile_success', { billId, confirmationNumber }, { source: 'pipeline', ...meta });
  else eventBus.emit('reconcile_failed', { billId, reason: result.issue || 'לא ידוע' }, { source: 'pipeline', ...meta });
  return result;
}

// #endregion

// #region Pipeline: Dashboard

export function generateDashboard(cashflow: CashflowState): DashboardView {
  clearExpiredLocks(store.getBillsMutable());
  const plan = getPaymentDecisions(store.getBillsMutable(), cashflow);
  return buildDashboardView(store.getBillsMutable(), store.getReceiptsMutable(), plan);
}

// #endregion

// #region Pipeline: Seed + Data Access

/**
 * טעינת seed (רק אם ריק)
 */
export function seedInitialBills(bills: Omit<Bill, 'status' | 'notes'>[]): void {
  if (store.getBills().length > 0) return;
  for (const raw of bills) {
    const { status, notes } = classifyBillStatus(raw, store.getBillsMutable());
    store.addBill({ ...raw, status, notes });
  }
}

export function getAllBills(): Bill[] { return store.getBills(); }
export function getAllReceipts(): Receipt[] { return store.getReceipts(); }
export function resetState(): void { store.reset(); }

// #endregion

// #region Event Listeners (נרשמים בטעינת המודול)

// כשנוצרת receipt עם linkedBillId — שלח אירוע receipt_linked (מעביר meta)
eventBus.subscribe('receipt_created', (payload, meta) => {
  if (payload.linkedBillId) {
    eventBus.emit('receipt_linked', { receiptId: payload.receiptId, billId: payload.linkedBillId, provider: payload.provider }, { source: 'pipeline', correlationId: meta.correlationId });
  }
});

// כשחשבון שולם — רישום ללוג (בעתיד: עדכון cashflow אוטומטי)
eventBus.subscribe('bill_paid', (payload) => {
  console.log(`[מנוע תשלום] שולם: ${payload.provider} — ₪${payload.amount} (אישור: ${payload.confirmationNumber})`);
});

// כשתשלום נכשל — רישום
eventBus.subscribe('payment_failed', (payload) => {
  console.warn(`[מנוע תשלום] נכשל: ${payload.provider} — ${payload.reason}`);
});

// #endregion
