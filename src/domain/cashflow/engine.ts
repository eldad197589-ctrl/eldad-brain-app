/* ============================================
   FILE: cashflow/engine.ts
   PURPOSE: מנוע תזרים — החלטות תשלום מבוססות יתרה
   DEPENDENCIES: ../types
   EXPORTS: getPaymentDecisions
   ============================================ */
import type { Bill, CashflowState, PaymentDecision, PaymentPlan } from '../types';

// #region Decision Engine

/**
 * מנוע החלטה: מה לשלם עכשיו, מה לדחות, מה חריג
 */
export function getPaymentDecisions(
  openBills: Bill[],
  cashflow: CashflowState,
  today: Date = new Date()
): PaymentPlan {
  const payNow: PaymentDecision[] = [];
  const defer: PaymentDecision[] = [];
  const review: PaymentDecision[] = [];

  const activeBills = openBills
    .filter(b => b.status !== 'paid' && b.status !== 'duplicate')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  let balance = cashflow.balance;

  for (const bill of activeBills) {
    const diffDays = Math.ceil((new Date(bill.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const afterPay = balance - bill.amount;
    const canAfford = afterPay >= cashflow.reserveMinimum;

    if (bill.status === 'review') {
      review.push({ billId: bill.id, provider: bill.provider, amount: bill.amount, dueDate: bill.dueDate, decision: 'review', reason: `חריג (${bill.notes.join(', ')}). אישור ידני.` });
      continue;
    }

    if (diffDays <= 0 || bill.status === 'overdue') {
      if (canAfford) { payNow.push({ billId: bill.id, provider: bill.provider, amount: bill.amount, dueDate: bill.dueDate, decision: 'pay_now', reason: `באיחור ${Math.abs(diffDays)} ימים. יש יתרה.` }); balance -= bill.amount; }
      else { review.push({ billId: bill.id, provider: bill.provider, amount: bill.amount, dueDate: bill.dueDate, decision: 'review', reason: `באיחור אך אין יתרה מספקת.` }); }
      continue;
    }

    if (diffDays <= 3 || bill.status === 'due') {
      if (canAfford) { payNow.push({ billId: bill.id, provider: bill.provider, amount: bill.amount, dueDate: bill.dueDate, decision: 'pay_now', reason: `${diffDays} ימים. יש יתרה.` }); balance -= bill.amount; }
      else { defer.push({ billId: bill.id, provider: bill.provider, amount: bill.amount, dueDate: bill.dueDate, decision: 'defer', reason: `דחוף אך תגרום לירידה מתחת לרצפה (₪${cashflow.reserveMinimum}).` }); }
      continue;
    }

    defer.push({ billId: bill.id, provider: bill.provider, amount: bill.amount, dueDate: bill.dueDate, decision: 'defer', reason: `עוד ${diffDays} ימים. לא דחוף.` });
  }

  return { payNow, defer, review, totalDue: payNow.reduce((s, d) => s + d.amount, 0), balanceAfterPayments: balance, isOverloaded: payNow.reduce((s, d) => s + d.amount, 0) > cashflow.monthlyIncome * 0.5 };
}

// #endregion
