/* ============================================
   FILE: cashflow.ts
   PURPOSE: מנוע תזרים - מאזן, החלטות תשלום, זיהוי עומסים
   DEPENDENCIES: bills.ts
   EXPORTS: CashflowState, PaymentDecision, getPaymentDecisions
   ============================================ */
// #region Interfaces

import { Bill } from '../bills/bills';

/**
 * מצב התזרים הנוכחי
 */
export interface CashflowState {
  balance: number;           // יתרה נוכחית בעו"ש
  creditLimit: number;       // מסגרת אשראי מותרת
  monthlyIncome: number;     // הכנסה חודשית ממוצעת
  reserveMinimum: number;    // סכום רצפה שאסור לרדת ממנו
}

/**
 * החלטת תשלום בודדת שהמנוע מחזיר
 */
export interface PaymentDecision {
  billId: string;
  provider: string;
  amount: number;
  dueDate: string;
  decision: 'pay_now' | 'defer' | 'review';
  reason: string;
}

/**
 * סיכום ההחלטות של מנוע התזרים
 */
export interface PaymentPlan {
  payNow: PaymentDecision[];
  defer: PaymentDecision[];
  review: PaymentDecision[];
  totalDue: number;
  balanceAfterPayments: number;
  isOverloaded: boolean;
}

// #endregion

// #region Decision Engine

/**
 * מנוע ההחלטות הראשי: מקבל את רשימת החשבונות הפתוחים ואת מצב התזרים,
 * ומחזיר תוכנית פעולה מפורטת - מה לשלם עכשיו, מה לדחות, ומה חריג.
 */
export function getPaymentDecisions(
  openBills: Bill[],
  cashflow: CashflowState,
  today: Date = new Date()
): PaymentPlan {
  const payNow: PaymentDecision[] = [];
  const defer: PaymentDecision[] = [];
  const review: PaymentDecision[] = [];

  // סינון רק חשבונות פתוחים (לא שולמו, לא כפילויות)
  const activeBills = openBills
    .filter(b => b.status !== 'paid' && b.status !== 'duplicate')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  let runningBalance = cashflow.balance;

  for (const bill of activeBills) {
    const due = new Date(bill.dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // חוק 1: חשבון שמסומן לבדיקה ידנית - לא משלמים אוטומטית
    if (bill.status === 'review') {
      review.push({
        billId: bill.id,
        provider: bill.provider,
        amount: bill.amount,
        dueDate: bill.dueDate,
        decision: 'review',
        reason: `סכום חריג (${bill.notes.join(', ')}). נדרש אישור ידני.`
      });
      continue;
    }

    // חוק 2: האם יש מספיק כסף אחרי תשלום זה?
    const balanceAfterThis = runningBalance - bill.amount;
    const canAfford = balanceAfterThis >= cashflow.reserveMinimum;

    // חוק 3: תשלום באיחור או דחוף - חייב לשלם אם יש כסף
    if (diffDays <= 0 || bill.status === 'overdue') {
      if (canAfford) {
        payNow.push({
          billId: bill.id,
          provider: bill.provider,
          amount: bill.amount,
          dueDate: bill.dueDate,
          decision: 'pay_now',
          reason: `באיחור של ${Math.abs(diffDays)} ימים. יש מספיק יתרה.`
        });
        runningBalance -= bill.amount;
      } else {
        review.push({
          billId: bill.id,
          provider: bill.provider,
          amount: bill.amount,
          dueDate: bill.dueDate,
          decision: 'review',
          reason: `באיחור אך אין מספיק יתרה (חסרים ₪${Math.abs(balanceAfterThis - cashflow.reserveMinimum).toFixed(0)}). נדרשת החלטה.`
        });
      }
      continue;
    }

    // חוק 4: תשלום דחוף (פחות מ-3 ימים)
    if (diffDays <= 3 || bill.status === 'due') {
      if (canAfford) {
        payNow.push({
          billId: bill.id,
          provider: bill.provider,
          amount: bill.amount,
          dueDate: bill.dueDate,
          decision: 'pay_now',
          reason: `${diffDays} ימים לפדיון. יש מספיק יתרה.`
        });
        runningBalance -= bill.amount;
      } else {
        defer.push({
          billId: bill.id,
          provider: bill.provider,
          amount: bill.amount,
          dueDate: bill.dueDate,
          decision: 'defer',
          reason: `דחוף אך תשלומו ישאיר יתרה מתחת לרצפה (₪${cashflow.reserveMinimum}). מומלץ לדחות עד הכנסה קרובה.`
        });
      }
      continue;
    }

    // חוק 5: תשלום עתידי - דוחים
    defer.push({
      billId: bill.id,
      provider: bill.provider,
      amount: bill.amount,
      dueDate: bill.dueDate,
      decision: 'defer',
      reason: `עוד ${diffDays} ימים. לא דחוף כרגע.`
    });
  }

  const totalDue = payNow.reduce((sum, d) => sum + d.amount, 0);
  const isOverloaded = totalDue > cashflow.monthlyIncome * 0.5;

  return {
    payNow,
    defer,
    review,
    totalDue,
    balanceAfterPayments: runningBalance,
    isOverloaded
  };
}

// #endregion
