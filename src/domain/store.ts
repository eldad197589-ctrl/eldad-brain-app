/* ============================================
   FILE: store.ts
   PURPOSE: שכבת אחסון מרכזית — כל הנתונים עוברים דרך כאן
   DEPENDENCIES: ./types
   EXPORTS: store (singleton)
   ============================================ */
import type { Bill, Receipt } from './types';
import { eventBus } from './events';
import type { EventMeta } from './events';

// #region State Schema + Versioning

const STORAGE_KEY = 'eldad_home_store';
const CURRENT_VERSION = 2;

interface StoreState {
  version: number;
  bills: Bill[];
  receipts: Receipt[];
  billIdCounter: number;
  receiptIdCounter: number;
  lastModified: string;
}

function createEmptyState(): StoreState {
  return {
    version: CURRENT_VERSION,
    bills: [],
    receipts: [],
    billIdCounter: 1,
    receiptIdCounter: 1,
    lastModified: new Date().toISOString()
  };
}

// #endregion

// #region Migration

/**
 * מיגרציה בסיסית: אם המבנה השתנה, מעדכנים בלי לאבד נתונים
 */
function migrate(raw: Record<string, unknown>): StoreState {
  const v = (raw.version as number) || 1;
  const state = createEmptyState();

  // v1 → v2: הוספת lastModified
  if (v <= 1) {
    state.bills = Array.isArray(raw.bills) ? raw.bills as Bill[] : [];
    state.receipts = Array.isArray(raw.receipts) ? raw.receipts as Receipt[] : [];
    state.billIdCounter = (raw.billIdCounter as number) || (raw as Record<string, unknown>).billId as number || 1;
    state.receiptIdCounter = (raw.receiptIdCounter as number) || (raw as Record<string, unknown>).rcptId as number || 1;

    // מיגרציה מ-keys ישנים
    if (!state.bills.length) {
      try {
        const oldBills = localStorage.getItem('eldad_bills');
        if (oldBills) state.bills = JSON.parse(oldBills);
      } catch { /* ignore */ }
    }
    if (!state.receipts.length) {
      try {
        const oldRcpts = localStorage.getItem('eldad_receipts');
        if (oldRcpts) state.receipts = JSON.parse(oldRcpts);
      } catch { /* ignore */ }
    }
    if (state.billIdCounter <= 1) {
      try {
        const oldCounters = localStorage.getItem('eldad_counters');
        if (oldCounters) {
          const c = JSON.parse(oldCounters);
          state.billIdCounter = c.billIdCounter || 1;
          state.receiptIdCounter = c.receiptIdCounter || 1;
        }
      } catch { /* ignore */ }
    }
  }

  // v2: מבנה נוכחי — העתקה ישירה
  if (v >= 2) {
    state.bills = Array.isArray(raw.bills) ? raw.bills as Bill[] : [];
    state.receipts = Array.isArray(raw.receipts) ? raw.receipts as Receipt[] : [];
    state.billIdCounter = (raw.billIdCounter as number) || 1;
    state.receiptIdCounter = (raw.receiptIdCounter as number) || 1;
    state.lastModified = (raw.lastModified as string) || new Date().toISOString();
  }

  state.version = CURRENT_VERSION;
  return state;
}

// #endregion

// #region Persistence Layer

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== CURRENT_VERSION) return migrate(parsed);
    return parsed as StoreState;
  } catch {
    return createEmptyState();
  }
}

/** write-lock למניעת כתיבה מקבילית */
let isWriting = false;

function saveState(state: StoreState): void {
  if (isWriting) {
    // דחיית כתיבה ב-microtask למניעת דריסה
    queueMicrotask(() => saveState(state));
    return;
  }
  isWriting = true;
  try {
    state.lastModified = new Date().toISOString();
    state.version = CURRENT_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota — silent */ }
  finally { isWriting = false; }
}

// #endregion

// #region Store API

class HomeStore {
  private state: StoreState;

  constructor() {
    this.state = loadState();
  }

  // --- Bills ---

  /** מחזיר עותק של כל החשבונות */
  getBills(): Bill[] { return [...this.state.bills]; }

  /** מחזיר חשבון לפי ID */
  getBillById(id: string): Bill | undefined {
    return this.state.bills.find(b => b.id === id);
  }

  /** מחזיר reference מוטאבילי לחשבון (למנועים שמשנים ישירות) */
  getBillRef(id: string): Bill | undefined {
    return this.state.bills.find(b => b.id === id);
  }

  /** הוספת חשבון חדש. מחזיר false אם כפילות. */
  addBill(bill: Bill, meta?: Partial<EventMeta>): boolean {
    // guard: duplicate ID
    if (this.state.bills.some(b => b.id === bill.id)) {
      console.warn(`[store] bill ${bill.id} כבר קיים — לא נוסף.`);
      return false;
    }
    // guard: fingerprint — ספק + סכום + תאריך יעד. חוסם כפילות מדויקת, מאפשר bills שונים מאותו ספק.
    const isPaidOrClosed = (s: string) => ['paid', 'duplicate'].includes(s);
    if (this.state.bills.some(b =>
      b.provider === bill.provider &&
      Math.abs(b.amount - bill.amount) < 0.01 &&
      b.dueDate === bill.dueDate &&
      !isPaidOrClosed(b.status)
    )) {
      console.warn(`[store] bill זהה ל-${bill.provider}/₪${bill.amount}/${bill.dueDate} כבר קיים — לא נוסף.`);
      return false;
    }
    // guard: sourceEmailId כפול
    if (bill.sourceEmailId && this.state.bills.some(b =>
      b.sourceEmailId === bill.sourceEmailId
    )) {
      console.warn(`[store] מייל ${bill.sourceEmailId} כבר עובד — לא נוסף.`);
      return false;
    }
    this.state.bills.push(bill);
    this.persist();
    eventBus.emit('bill_created', { billId: bill.id, provider: bill.provider, amount: bill.amount, status: bill.status }, { source: 'store', ...meta });
    return true;
  }

  /** עדכון חשבון קיים (לפי ID). meta מועבר ל-eventBus לשמירת correlationId. */
  updateBill(id: string, updates: Partial<Bill>, meta?: Partial<EventMeta>): Bill | null {
    const bill = this.state.bills.find(b => b.id === id);
    if (!bill) return null;
    const prevStatus = bill.status;
    Object.assign(bill, updates);
    this.persist();
    if (updates.status && updates.status !== prevStatus) {
      eventBus.emit('bill_status_changed', { billId: id, from: prevStatus, to: updates.status }, { source: 'store', ...meta });
      if (updates.status === 'paid') {
        eventBus.emit('bill_paid', { billId: id, provider: bill.provider, amount: bill.amount, confirmationNumber: bill.confirmationNumber || '', paidDate: bill.paidDate || '' }, { source: 'store', ...meta });
      }
    }
    return bill;
  }

  /** מספר bill הבא — מתקדם את המונה מעבר לכל ה-IDs הקיימים */
  nextBillId(): string {
    // ודא שהמונה לא מתנגש עם ID קיים
    let id = `bill-${this.state.billIdCounter}`;
    while (this.state.bills.some(b => b.id === id)) {
      this.state.billIdCounter++;
      id = `bill-${this.state.billIdCounter}`;
    }
    this.state.billIdCounter++;
    return id;
  }

  // --- Receipts ---

  /** מחזיר עותק של כל הקבלות */
  getReceipts(): Receipt[] { return [...this.state.receipts]; }

  /** הוספת קבלה */
  addReceipt(receipt: Receipt, meta?: Partial<EventMeta>): void {
    this.state.receipts.push(receipt);
    this.persist();
    eventBus.emit('receipt_created', { receiptId: receipt.id, provider: receipt.provider, amount: receipt.amount, linkedBillId: receipt.linkedBillId }, { source: 'store', ...meta });
  }

  /** מספר receipt הבא */
  nextReceiptId(): string {
    return `rcpt-${this.state.receiptIdCounter++}`;
  }

  /** בדיקת כפילויות קבלה */
  isDuplicateReceipt(provider: string, amount: number, confNum: string): boolean {
    return this.state.receipts.some(r =>
      r.provider === provider &&
      Math.abs(r.amount - amount) < 0.01 &&
      r.confirmationNumber === confNum
    );
  }

  // --- Counters ---

  getReceiptCounterValue(): number { return this.state.receiptIdCounter; }
  incrementReceiptCounter(): void { this.state.receiptIdCounter++; this.persist(); }

  // --- State Management ---

  /** שמירה ל-localStorage */
  persist(): void { saveState(this.state); }

  /** רענון מ-localStorage (אחרי שינוי מ-tab אחר) */
  reload(): void { this.state = loadState(); }

  /** איפוס מלא */
  reset(): void {
    this.state = createEmptyState();
    this.persist();
    eventBus.emit('store_reset', {}, { source: 'store' });
    try {
      localStorage.removeItem('eldad_bills');
      localStorage.removeItem('eldad_receipts');
      localStorage.removeItem('eldad_counters');
    } catch { /* silent */ }
  }

  /** גרסת ה-state הנוכחית */
  getVersion(): number { return this.state.version; }

  /** תאריך שינוי אחרון */
  getLastModified(): string { return this.state.lastModified; }

  /** מחזיר reference לכל ה-bills (למנועים שצריכים mutation) */
  getBillsMutable(): Bill[] { return this.state.bills; }

  /** מחזיר reference לכל ה-receipts (למנועים שצריכים mutation) */
  getReceiptsMutable(): Receipt[] { return this.state.receipts; }
}

// #endregion

// #region Singleton Export

export const store = new HomeStore();

// #endregion
