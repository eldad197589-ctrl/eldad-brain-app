/* ============================================
   FILE: dashboard/engine.ts
   PURPOSE: בניית תצוגת Dashboard — קריאה בלבד, אפס לוגיקה
   DEPENDENCIES: ../types
   EXPORTS: buildDashboardView
   ============================================ */
import type { Bill, Receipt, PaymentPlan, DashboardView } from '../types';

// #region Dashboard Builder

export function buildDashboardView(
  allBills: Bill[],
  allReceipts: Receipt[],
  plan: PaymentPlan
): DashboardView {
  return {
    urgent: allBills.filter(b => b.status === 'overdue' || b.status === 'due'),
    upcoming: allBills.filter(b => b.status === 'upcoming'),
    recentlyPaid: allBills.filter(b => b.status === 'paid').sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || '')).slice(0, 10),
    anomalies: allBills.filter(b => b.status === 'review' || b.status === 'duplicate'),
    plan,
    recentReceipts: allReceipts.sort((a, b) => b.receivedDate.localeCompare(a.receivedDate)).slice(0, 10)
  };
}

// #endregion
