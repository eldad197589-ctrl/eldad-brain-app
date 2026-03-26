/* ============================================
   FILE: seedTasks.ts
   PURPOSE: Seed data for tasks — consolidated, de-duplicated, status-accurate
   DEPENDENCIES: calendarTypes.ts
   EXPORTS: SEED_TASKS
   ============================================ */
import type { Task } from './calendarTypes';

// #region Tasks — לפני הפגישה (26/3)

/** SEED_TASKS — Consolidated task list, de-duplicated and status-accurate */
export const SEED_TASKS: Task[] = [
  // ═══════════════════════════════════════════
  // 🔴 לפני הפגישה (26/3) — משימות שצריכות להסתיים לפני הפגישה
  // ═══════════════════════════════════════════
  {
    id: 'protokol-update-agreement',
    title: 'עדכון הסכם מייסדים לפי סיכומי הפגישה',
    dueDate: '2026-03-26',
    priority: 'high',
    status: 'done',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'אלדד',
    notes: 'הסכם מעודכן כולל: חלוקת 26.66%×3, תשלום רטרואקטיבי, שכר B2B, הבשלה, וטו תחומי.',
    actionLink: '/agreement',
    subTasks: [
      { text: 'עדכון חלוקת מניות 26.66% × 3', done: true },
      { text: 'הוספת סעיף תשלום רטרואקטיבי 15K/חודש', done: true },
      { text: 'הוספת מנגנון עדכון שכר שנתי + הפחתה (7.7)', done: true },
      { text: 'הוספת סעיף NDA לעובדי חממה', done: true },
      { text: 'יצירת Track Changes לאוסנת', done: true },
    ],
  },
  {
    id: 'pitch-deck-update',
    title: 'Pitch Deck מעודכן — פלאפון',
    dueDate: '2026-03-20',
    priority: 'high',
    status: 'in-progress',
    category: 'פלאפון',
    notes: 'מצגת Pitch לפלאפון עם נתוני ARPU, ARR, CAC, LTV.',
    actionLink: '/products',
    subTasks: [
      { text: 'עדכון נתוני ARPU ממחשבון', done: false },
      { text: 'הוספת תרשים תחזית הכנסות', done: false },
      { text: 'סקירה סופית עם קיריל', done: false },
    ],
  },

  // #endregion

  // #region אחרי הפגישה — משימות ביצוע

  // ═══════════════════════════════════════════
  // 🟠 אחרי הפגישה — משימות ביצוע מיידי
  // ═══════════════════════════════════════════
  {
    id: 'register-robium-ltd',
    title: 'פתיחת חברה — רוביום בע"מ',
    dueDate: '2026-03-29',
    priority: 'high',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'founders-signing-march-26-2026',
    assignee: 'אוסנת',
    notes: 'פתיחת חברה ברשם, חשבון בנק, רישום מע"מ ומס הכנסה.',
    subTasks: [
      { text: 'רישום ברשם החברות (3 שמות)', done: false },
      { text: 'פתיחת חשבון בנק לחברה', done: false },
      { text: 'רישום במע"מ ומס הכנסה', done: false },
      { text: 'הכנת תקנון חברה', done: false },
    ],
  },
  {
    id: 'protokol-nda-incubator',
    title: 'הכנת הסכמי NDA וחוזים — גביר וענבר',
    dueDate: '2026-03-28',
    priority: 'high',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'קיריל',
    notes: 'NDA וחוזי עבודה לעובדי החממה.',
    actionLink: '/incubator',
    subTasks: [
      { text: 'ניסוח NDA כללי', done: false },
      { text: 'ניסוח חוזה חממה — גביר', done: false },
      { text: 'ניסוח חוזה חממה — ענבר', done: false },
    ],
  },
  {
    id: 'aktuar-evaluation',
    title: 'אקטואר — הערכת שווי רוביום',
    dueDate: '2026-03-29',
    priority: 'high',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'אלדד',
    notes: 'הערכת ערך רוביום לצורך קביעת שווי Sweat Equity.',
    subTasks: [
      { text: 'איתור אקטואר מתאים', done: false },
      { text: 'העברת נתונים + קבלת דוח', done: false },
    ],
  },
  {
    id: 'pelephone-demo',
    title: 'הכנת דמו חי לפלאפון',
    dueDate: '2026-03-30',
    priority: 'high',
    status: 'todo',
    category: 'פלאפון',
    notes: 'דמו חי של מוצר הפרוטוקול עבור פגישת פלאפון.',
    actionLink: '/products',
    subTasks: [
      { text: 'הכנת תרחיש דמו', done: false },
      { text: 'בדיקת זרימה מלאה', done: false },
      { text: 'הכנת מצגת ליוואי', done: false },
    ],
  },

  // #endregion

  // #region משימות תלויות תזרים / אסטרטגיות

  // ═══════════════════════════════════════════
  // 🟡 משימות תלויות תזרים — יבוצעו כשיהיו הכנסות
  // ═══════════════════════════════════════════
  {
    id: 'company-loans-25k',
    title: 'הלוואת חברה — 25 אש"ח × 2',
    dueDate: '2026-04-05',
    priority: 'high',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'הלוואה 25K לאלדד ו-25K לקיריל. מותנה בתזרים.',
  },
  {
    id: 'retroactive-pay-15k',
    title: 'תשלום רטרואקטיבי — 15K/חודש × 3',
    dueDate: '2026-04-15',
    priority: 'high',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-11-2026',
    notes: 'סה"כ 45K לכל אחד (אלדד + קיריל). מותנה בתזרים חיובי.',
  },
  {
    id: 'pre-company-investment-payout',
    title: 'החזר השקעת עבר — 500 אש"ח',
    dueDate: '2026-06-01',
    priority: 'low',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: '250K לאלדד, 250K לקיריל. מותנה בתזרים/משקיע.',
  },

  // ═══════════════════════════════════════════
  // 🔵 ESOP + חממה — משימות מבניות
  // ═══════════════════════════════════════════
  {
    id: 'esop-trustee-appointment',
    title: 'מינוי נאמן ESOP — סעיף 102',
    dueDate: '2026-04-15',
    priority: 'high',
    status: 'todo',
    category: 'חממה',
    notes: 'מינוי נאמן מאושר (IBI/אקסלנס/מיטב) + הגשת תכנית לרשות המסים.',
    actionLink: '/incubator',
  },
  {
    id: 'esop-grant-letters',
    title: 'הסכמי חממה — Grant Letters + Vesting',
    dueDate: '2026-04-30',
    priority: 'high',
    status: 'todo',
    category: 'חממה',
    notes: 'Grant Letters ל-5 עובדים. מודל היברידי Time+Milestone.',
    actionLink: '/incubator',
  },
  {
    id: 'register-ip-brand',
    title: 'רישום קניין רוחני — המוח של אלדד',
    dueDate: '2026-04-05',
    priority: 'high',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'רישום סימן מסחרי + IP Assignment לחברה.',
  },
];

// #endregion
