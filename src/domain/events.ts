/* ============================================
   FILE: events.ts
   PURPOSE: Event Bus פנימי עם governance — מטא-דאטה, loop guard, debug
   DEPENDENCIES: אין (standalone)
   EXPORTS: eventBus, DomainEventMap, DomainEventName, EventMeta
   ============================================ */

// #region Event Type Definitions

/** כל סוגי האירועים במערכת + הפרמטרים שלהם */
export interface DomainEventMap {
  bill_created:        { billId: string; provider: string; amount: number; status: string };
  bill_paid:           { billId: string; provider: string; amount: number; confirmationNumber: string; paidDate: string };
  bill_status_changed: { billId: string; from: string; to: string };
  payment_failed:      { billId: string; provider: string; reason: string };
  payment_started:     { billId: string; provider: string };
  receipt_created:     { receiptId: string; provider: string; amount: number; linkedBillId: string | null };
  receipt_linked:      { receiptId: string; billId: string; provider: string };
  reconcile_success:   { billId: string; confirmationNumber: string };
  reconcile_failed:    { billId: string; reason: string };
  inbox_synced:        { processed: number; skipped: number };
  dashboard_updated:   { urgent: number; upcoming: number; paid: number; anomalies: number };
  store_reset:         Record<string, never>;
}

export type DomainEventName = keyof DomainEventMap;

// #endregion

// #region Event Meta

/** מטא-דאטה שמלווה כל אירוע */
export interface EventMeta {
  /** מקור האירוע */
  source: 'store' | 'pipeline' | 'inbox' | 'executor' | 'unknown';
  /** מזהה שרשרת — לקבצ אירועים קשורים */
  correlationId: string;
}

/** יצירת correlationId ייחודי */
export function createCorrelationId(prefix?: string): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 6);
  return `${prefix || 'evt'}-${ts}-${rnd}`;
}

/** ברירת מחדל למטא — תאימות לאחור */
function defaultMeta(): EventMeta {
  return { source: 'unknown', correlationId: createCorrelationId() };
}

// #endregion

// #region Event Log

export interface EventLogEntry {
  timestamp: string;
  event: DomainEventName;
  payload: unknown;
  source: EventMeta['source'];
  correlationId: string;
}

const MAX_LOG = 200;

// #endregion

// #region Loop Guard

/** מונה חזרות לפי correlationId + event */
const loopCounters = new Map<string, number>();

/** מספר מרבי של חזרות לאותו אירוע באותה שרשרת */
const MAX_LOOP_COUNT = 3;

function checkLoopGuard(event: DomainEventName, correlationId: string): boolean {
  const key = `${correlationId}::${event}`;
  const count = (loopCounters.get(key) || 0) + 1;
  loopCounters.set(key, count);

  if (count > MAX_LOOP_COUNT) {
    console.warn(
      `[EventBus] ⚠️ לולאה זוהתה: "${event}" חזר ${count} פעמים בשרשרת ${correlationId}. נחסם.`
    );
    return false; // חסום
  }
  return true; // תקין
}

/** ניקוי loop counters — להפעלה תקופתית או אחרי שרשרת */
function clearLoopCounters(): void {
  loopCounters.clear();
}

// #endregion

// #region Event Bus Implementation

type Handler<T> = (payload: T, meta: EventMeta) => void;

class EventBus {
  private handlers = new Map<string, Set<Handler<unknown>>>();
  private log: EventLogEntry[] = [];
  private debugMode = false;

  // --- Debug ---

  /** הפעלת/כיבוי מצב debug */
  enableDebug(on: boolean): void {
    this.debugMode = on;
    console.log(`[EventBus] debug mode: ${on ? 'ON' : 'OFF'}`);
  }

  // --- Subscribe ---

  /**
   * הרשמה לאירוע — מחזירה פונקציית unsubscribe.
   * ה-handler מקבל payload + meta.
   */
  subscribe<K extends DomainEventName>(
    event: K,
    handler: Handler<DomainEventMap[K]>
  ): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    const set = this.handlers.get(event)!;
    set.add(handler as Handler<unknown>);

    return () => { set.delete(handler as Handler<unknown>); };
  }

  // --- Emit ---

  /**
   * שליחת אירוע לכל הנרשמים.
   * meta אופציונלי — אם לא מסופק, נוצר ברירת מחדל (תאימות לאחור).
   */
  emit<K extends DomainEventName>(
    event: K,
    payload: DomainEventMap[K],
    meta?: Partial<EventMeta>
  ): void {
    const fullMeta: EventMeta = { ...defaultMeta(), ...meta };

    // Loop Guard — בדיקה לפני הפצה
    if (!checkLoopGuard(event, fullMeta.correlationId)) {
      return; // נחסם — לולאה
    }

    // רישום ללוג
    this.log.push({
      timestamp: new Date().toISOString(),
      event,
      payload,
      source: fullMeta.source,
      correlationId: fullMeta.correlationId
    });
    if (this.log.length > MAX_LOG) this.log.shift();

    // Debug output
    if (this.debugMode) {
      console.log(
        `[EventBus] 📡 ${event}`,
        `| source: ${fullMeta.source}`,
        `| corr: ${fullMeta.correlationId}`,
        payload
      );
    }

    // קריאה ל-handlers
    const set = this.handlers.get(event);
    if (!set) return;

    for (const handler of set) {
      try { handler(payload, fullMeta); }
      catch (err) {
        console.error(`[EventBus] handler error for "${event}":`, err);
      }
    }
  }

  // --- Log Access ---

  /** מחזיר עותק של הלוג האחרון */
  getLog(limit?: number): EventLogEntry[] {
    return this.log.slice(-(limit ?? MAX_LOG));
  }

  /** מחזיר לוג מסונן לפי אירוע */
  getLogByEvent(event: DomainEventName): EventLogEntry[] {
    return this.log.filter(e => e.event === event);
  }

  /** מחזיר לוג מסונן לפי correlationId */
  getLogByCorrelation(correlationId: string): EventLogEntry[] {
    return this.log.filter(e => e.correlationId === correlationId);
  }

  // --- Cleanup ---

  /** ניקוי כל ה-handlers והלוג (לבדיקות) */
  clearAll(): void {
    this.handlers.clear();
    this.log = [];
    clearLoopCounters();
  }

  /** ניקוי מוני לולאות בלבד */
  resetLoopCounters(): void { clearLoopCounters(); }

  /** מחזיר שרשרת אירועים מלאה לפי correlationId */
  getFlowTrace(correlationId: string): EventLogEntry[] {
    return this.log.filter(e => e.correlationId === correlationId);
  }
}

// #endregion

// #region Singleton Export

export const eventBus = new EventBus();

// #endregion
