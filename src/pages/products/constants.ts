/* ============================================
   FILE: constants.ts
   PURPOSE: Static data and configuration
   DEPENDENCIES: None (local only)
   EXPORTS: Product, Module, Partnership, RoadmapItem, STATUS_BADGE, LIVE_PRODUCTS, MODULES, PARTNERSHIPS, ROADMAP_Q1, ROADMAP_Q2, ROADMAP_Q34
   ============================================ */
/**
 * Products Page — Constants & Data
 */

// #region Types

export interface Product {
  emoji: string;
  name: string;
  desc: string;
  status: 'live' | 'beta' | 'alpha' | 'dev';
  color: string;
  link?: string;
  linkLabel?: string;
  flowchart?: string;
}

export interface Module {
  emoji: string;
  name: string;
  sub: string;
  flowchart: string;
}

export interface Partnership {
  emoji: string;
  name: string;
  status: string;
  color: string;
  desc: string;
  link?: string;
}

export interface RoadmapItem {
  done: boolean;
  text: string;
}

// #endregion

// #region Data

/** STATUS_BADGE — Static data and configuration */
export const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  live:  { label: 'פעיל', color: '#10b981' },
  beta:  { label: 'Beta מתקדם', color: '#3b82f6' },
  alpha: { label: 'Alpha', color: '#06b6d4' },
  dev:   { label: 'בפיתוח', color: '#f59e0b' },
};

/** LIVE_PRODUCTS — Static data and configuration */
export const LIVE_PRODUCTS: Product[] = [
  { emoji: '🎙️', name: 'Robium Protokol (המתמלל)', status: 'beta', color: '#3b82f6', desc: 'מערכת תמלול חכמה מבוססת AI. מתמלל ישיבות, פגישות ודיונים בזמן אמת בעברית. כולל הפקת סיכום אוטומטי.', link: 'https://protokol.robium.net', linkLabel: 'פתח מערכת' },
  { emoji: '⏱️', name: 'Robium Smart Attendance', status: 'live', color: '#f59e0b', desc: 'מערכת ניהול נוכחות חכמה לעסקים: חישוב שעות, שעות נוספות, משמרות, התאמות לחוקי עבודה ישראליים.', flowchart: '/flow/attendance', linkLabel: 'תרשים זרימה' },
  { emoji: '🛡️', name: 'Guardian Pro (אפוטרופוס)', status: 'live', color: '#a855f7', desc: 'מערכת דיווח אוטומטית לאפוטרופוס הכללי. הפקת דוחות, ניהול תיקים, סריקת מסמכים ותיעוד חכם.', flowchart: '/flow/guardian', linkLabel: 'תרשים זרימה' },
  { emoji: '📊', name: 'Robium Capital Gains', status: 'live', color: '#10b981', desc: 'מנוע חישוב רווח הון מבית Robium. מחשב סעיף 91, אינפלציה, פחת ליניארי, ומייצר טופס 1399.', flowchart: '/flow/capital-gains', linkLabel: 'תרשים זרימה' },
  { emoji: '✉️', name: 'בוט מכתבים חכם', status: 'live', color: '#f43f5e', desc: 'הפקת מכתבים גנריים מותאמים אישית בלחיצת כפתור: אישורי העסקה, מכתבי הערכה, הודעות לעובדים.', link: '/letter', linkLabel: 'נסה עכשיו' },
  { emoji: '🧠', name: 'המוח של אלדד (Brain Router)', status: 'alpha', color: '#06b6d4', desc: 'מערכת ההפעלה המרכזית — Meta-Orchestrator. מנתב בקשות AI לסוכנים ייעודיים.', flowchart: '/flow/brain-router', linkLabel: 'ארכיטקטורה' },
];

/** MODULES — Static data and configuration */
export const MODULES: Module[] = [
  { emoji: '💰', name: 'מערכת שכר', sub: 'Payroll Processing', flowchart: '/flow/payroll' },
  { emoji: '⚖️', name: 'דיני עבודה', sub: 'Work Law Engine', flowchart: '/flow/worklaw' },
  { emoji: '📋', name: 'חוות דעת מומחה', sub: 'Expert Opinion', flowchart: '/flow/expert' },
  { emoji: '🏛️', name: 'דוחות מוסדיים', sub: 'Institutional Reports', flowchart: '/flow/reports' },
  { emoji: '🔴', name: 'חדלות פירעון', sub: 'Insolvency Engine', flowchart: '/flow/insolvency' },
  { emoji: '🇮🇱', name: 'פיצויי מלחמה', sub: 'War Compensation', flowchart: '/flow/war' },
  { emoji: '🤖', name: 'סוכנים דיגיטליים', sub: 'AI Agents', flowchart: '/flow/agents' },
];

/** PARTNERSHIPS — Static data and configuration */
export const PARTNERSHIPS: Partnership[] = [
  { emoji: '📱', name: 'Pelephone (פלאפון)', status: 'מגעים מתקדמים', color: '#10b981', desc: 'שיתוף פעולה עם חברת פלאפון להפצת המתמלל. מודל הכנסה: 80/20 Revenue Share. שוק יעד: SMB ישראלי.', link: 'https://pelephone2.vercel.app' },
  { emoji: '🏢', name: 'ההסתדרות הלאומית (אלון)', status: 'שיחה ראשונה הושלמה ✓', color: '#3b82f6', desc: 'אלון, ראש אגף עובדים זרים. מנהל 48,000 עובדים זרים ו-200,000 עובדים בסה"כ.' },
  { emoji: '🌍', name: 'המגזר הערבי (פדגוגיה)', status: 'היענות חמה', color: '#f59e0b', desc: 'שיתוף פעולה עם איברהים סאנה, גורם מפתח בתחום הפדגוגי במגזר הערבי.' },
];

/** ROADMAP_Q1 — Static data and configuration */
export const ROADMAP_Q1: RoadmapItem[] = [
  { done: true, text: 'חתימת הסכם מייסדים' }, { done: true, text: 'השלמת מוצרי ליבה (7+ מערכות)' },
  { done: false, text: 'גרסת Beta מתקדמת למתמלל' }, { done: false, text: 'סגירת LOI עם פלאפון' },
];
/** ROADMAP_Q2 — Static data and configuration */
export const ROADMAP_Q2: RoadmapItem[] = [
  { done: false, text: 'פיילוט ראשון עם ההסתדרות' }, { done: false, text: 'שיווק המתמלל במגזר הערבי' },
  { done: false, text: 'הכשרת AI למחלקה המשפטית' }, { done: false, text: 'גיוס 2 מתכנתים לחממה' },
];
/** ROADMAP_Q34 — Static data and configuration */
export const ROADMAP_Q34: RoadmapItem[] = [
  { done: false, text: 'המרה לחברה בע"מ' }, { done: false, text: 'גיוס Pre-Seed / Seed' },
  { done: false, text: '10+ לקוחות משלמים' }, { done: false, text: 'השקה מסחרית מלאה' },
];

// #endregion
