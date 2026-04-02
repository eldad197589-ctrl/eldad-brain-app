/* ============================================
   FILE: bills.ts
   PURPOSE: מנוע תשלומים - מבנה נתונים, סטטוסים ולוגיקת סיווג
   DEPENDENCIES: None
   EXPORTS: Bill, BillStatus, classifyBillStatus, linkReceiptToBill
   ============================================ */
// #region Interfaces

/**
 * סטטוסים אפשריים של חשבון במערכת
 */
export type BillStatus = 
  | 'upcoming'   // תשלום עתידי (מעל 3 ימים לפדיון)
  | 'due'        // תשלום קרוב (פחות מ-3 ימים)
  | 'overdue'    // תשלום באיחור (תאריך עבר)
  | 'paid'       // שולם וסגור
  | 'duplicate'  // כפילות מזוהה של חשבון קיים
  | 'review';    // סכום חריג שדורש אישור ידני

/**
 * מבנה נתונים מלא של חשבון
 */
export interface Bill {
  id: string;
  provider: string;
  category: string;
  amount: number;
  dueDate: string;            // תאריך פדיון (ISO)
  status: BillStatus;
  previousAmount?: number;    // סכום חשבון קודם מאותו ספק
  sourceEmailId?: string;
  paymentLink?: string;
  linkedReceiptId?: string;   // מצביע לקבלה שסגרה את החשבון
  confirmationNumber?: string;
  paidDate?: string;          // תאריך תשלום בפועל
  paidVia?: string;           // אמצעי תשלום
  filedUnder?: string;        // תיקיית תיוק ב-Gmail/Drive
  notes: string[];            // הערות מנוע / אנומליות
}

// #endregion

// #region Bill Status Logic

/**
 * מחשב סטטוס אוטומטי של חשבון לפי כללי המערכת
 * @param bill - החשבון לבדיקה
 * @param existingBills - רשימת כל החשבונות הקיימים (לבדיקת כפילויות)
 * @param today - תאריך נוכחי (מותאם לבדיקות)
 */
export function classifyBillStatus(
  bill: Omit<Bill, 'status' | 'notes'>,
  existingBills: Bill[],
  today: Date = new Date()
): { status: BillStatus; notes: string[] } {
  const notes: string[] = [];
  const due = new Date(bill.dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // חוק 1: כפילות - אם קיים כבר חשבון מאותו ספק ואותו סכום באותו חודש
  const isDuplicate = existingBills.some(existing =>
    existing.id !== bill.id &&
    existing.provider === bill.provider &&
    existing.amount === bill.amount &&
    existing.dueDate === bill.dueDate &&
    existing.status !== 'duplicate'
  );
  if (isDuplicate) {
    notes.push('זוהתה כפילות: חשבון זהה כבר קיים במערכת מאותו ספק.');
    return { status: 'duplicate', notes };
  }

  // חוק 2: חריגת סכום - אם הסכום גבוה ב-20% או יותר מהחשבון הקודם
  if (bill.previousAmount && bill.amount > bill.previousAmount * 1.2) {
    const pctJump = Math.round(((bill.amount - bill.previousAmount) / bill.previousAmount) * 100);
    notes.push(`סכום חריג: עלייה של ${pctJump}% ביחס לחשבון הקודם (₪${bill.previousAmount} → ₪${bill.amount}).`);
    return { status: 'review', notes };
  }

  // חוק 3: תאריך עבר - איחור בתשלום
  if (diffDays < 0) {
    notes.push(`איחור של ${Math.abs(diffDays)} ימים מתאריך הפדיון.`);
    return { status: 'overdue', notes };
  }

  // חוק 4: פחות מ-3 ימים - דחוף
  if (diffDays <= 3) {
    notes.push('פחות מ-3 ימים לתאריך הפדיון.');
    return { status: 'due', notes };
  }

  // חוק 5: תשלום עתידי רגיל
  notes.push(`${diffDays} ימים לתאריך הפדיון.`);
  return { status: 'upcoming', notes };
}

// #endregion

// #region Receipt Linking

/**
 * חיבור קבלה לחשבון קיים - סוגר את החשבון ומסמן כשולם.
 * הקבלה לא יוצרת חשבון חדש, רק סוגרת חשבון פתוח.
 * @returns החשבון המעודכן, או null אם לא נמצא חשבון פתוח מתאים
 */
export function linkReceiptToBill(
  receiptId: string,
  provider: string,
  amount: number,
  confirmationNumber: string,
  bills: Bill[]
): Bill | null {
  // מחפש חשבון פתוח מאותו ספק בטווח סכום קרוב (סטיית 5% מותרת)
  const matchingBill = bills.find(b =>
    b.status !== 'paid' &&
    b.status !== 'duplicate' &&
    b.provider === provider &&
    Math.abs(b.amount - amount) / b.amount < 0.05
  );

  if (!matchingBill) return null;

  matchingBill.status = 'paid';
  matchingBill.linkedReceiptId = receiptId;
  matchingBill.confirmationNumber = confirmationNumber;
  matchingBill.paidDate = new Date().toISOString().split('T')[0];
  matchingBill.notes.push(`נסגר אוטומטית ע"י קבלה ${receiptId}.`);

  return matchingBill;
}

// #endregion
