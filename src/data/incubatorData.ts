/* ============================================
   FILE: incubatorData.ts
   PURPOSE: Central data model for incubator employees with per-role KPIs
   DEPENDENCIES: none
   EXPORTS: IncubatorKPI, IncubatorMember, INCUBATOR_MEMBERS
   ============================================ */

// #region Types

/** KPI metric for an incubator employee */
export interface IncubatorKPI {
  /** Metric display name */
  name: string;
  /** Target goal description */
  target: string;
  /** Current progress 0-100 */
  current: number;
  /** Unit of measure */
  unit: string;
}

/** Incubator employee data */
export interface IncubatorMember {
  /** Unique ID */
  id: string;
  /** Full name */
  name: string;
  /** Hebrew initials for avatar */
  initials: string;
  /** Role in Hebrew */
  role: string;
  /** Role in English */
  roleEn: string;
  /** Short description */
  description: string;
  /** Gradient colors for card accent */
  colorFrom: string;
  /** Gradient colors for card accent */
  colorTo: string;
  /** Text accent color */
  accentColor: string;
  /** Vesting progress 0-100 */
  vestingPercent: number;
  /** Milestones summary */
  milestones: string;
  /** Role-specific KPIs */
  kpis: IncubatorKPI[];
}

// #endregion

// #region Data

/** INCUBATOR_MEMBERS — All incubator employees with individual KPI metrics */
export const INCUBATOR_MEMBERS: IncubatorMember[] = [
  {
    id: 'doron-biton',
    name: 'דורון ביטון',
    initials: 'ד"ב',
    role: 'סמנכ"ל שיווק ומכירות',
    roleEn: 'VP Sales & Marketing',
    description: 'בעל ניסיון עשיר וקשרים ענפים בתעשייה העסקית. דורון ייקח אחריות מלאה על מערך המכירות ברוביום, פתיחת דלתות לחברות ענק והבאת הכנסות B2B.',
    colorFrom: '#3b82f6',
    colorTo: '#6366f1',
    accentColor: '#818cf8',
    vestingPercent: 2,
    milestones: 'קבלת האופציות (2% מהחברה) מותנית בסגירת פיילוטים והשגת יעדי מכירות (ARR) בפועל.',
    kpis: [
      { name: 'הכנסות ARR', target: '500K ₪ שנתי', current: 0, unit: '₪' },
      { name: 'פיילוטים שנסגרו', target: '3 לקוחות', current: 0, unit: 'לקוחות' },
      { name: 'Pipeline Value', target: '2M ₪', current: 10, unit: '₪' },
      { name: 'פגישות מכירה', target: '20 בחודש', current: 5, unit: 'פגישות' },
    ],
  },
  {
    id: 'gavir-yamin',
    name: 'גביר ימין',
    initials: 'ג"י',
    role: 'סמנכ"ל מערכות מידע, סייבר ופיתוח מוצר',
    roleEn: 'VP IT, Cyber & Product Dev',
    description: 'מהנדס תוכנה וארכיטקט. אמון על אבטחת המידע (סייבר), ניהול מערכות המידע (IT), ופיתוח פנימי של ארכיטקטורת המוצרים.',
    colorFrom: '#10b981',
    colorTo: '#14b8a6',
    accentColor: '#6ee7b7',
    vestingPercent: 2,
    milestones: 'תלוי בעמידה במבדקי סייבר ואבטחת לקוחות מוסדיים, הרמת תשתיות ענן וסגירת Sprints. 2% מהחברה.',
    kpis: [
      { name: 'מבדקי סייבר', target: '4 מבדקים/שנה', current: 25, unit: 'מבדקים' },
      { name: 'תשתיות ענן', target: 'Production Ready', current: 30, unit: '%' },
      { name: 'Sprints שהושלמו', target: '12 בשנה', current: 15, unit: 'ספרינטים' },
      { name: 'זמן Uptime', target: '99.5%', current: 40, unit: '%' },
    ],
  },
  {
    id: 'inbar-barbi',
    name: 'ענבר ברבי דאבוש',
    initials: 'ע"ב',
    role: 'מהנדסת מוצר ופרזנטורית ראשית',
    roleEn: 'Product Engineer & Lead Presenter',
    description: 'מהנדסת חברותית וחדה, אמונה על פיתוח המוצר וייצוגו כלפי חוץ. ענבר תדגים ללקוחות ולארגונים רשמיים את הטכנולוגיה.',
    colorFrom: '#ec4899',
    colorTo: '#f43f5e',
    accentColor: '#fda4af',
    vestingPercent: 2,
    milestones: 'האופציות (2% מהחברה) מותנות באפיוני מוצר, הנגשת המערכות לשוק, וקיום מצגות מוצלחות למשקיעים.',
    kpis: [
      { name: 'אפיוני מוצר', target: '6 אפיונים', current: 10, unit: 'אפיונים' },
      { name: 'מצגות למשקיעים', target: '8 בשנה', current: 0, unit: 'מצגות' },
      { name: 'דמואים מוצלחים', target: '12 בשנה', current: 5, unit: 'דמואים' },
      { name: 'שביעות רצון לקוחות', target: '4.5/5', current: 0, unit: 'ציון' },
    ],
  },
  {
    id: 'sonia-iloz',
    name: 'סוניה אילוז',
    initials: 'ס"א',
    role: 'AI PA & מזכירת סינתטית',
    roleEn: 'AI Personal Assistant',
    description: 'מינוי טכנולוגי-אנושי: מזכירת AI ועוזרת למנכ"ל. אחראית לניתוב משימות, ארגון זמנים למנכ"ל, ושחרור צווארי בקבוק ניהוליים.',
    colorFrom: '#f59e0b',
    colorTo: '#ea580c',
    accentColor: '#fbbf24',
    vestingPercent: 1,
    milestones: 'חיסכון מוכח בשעות הניהול של אלדד, ניהול המשימות במערכות AI ארגוניות וייעול שוטף. 1% מהחברה.',
    kpis: [
      { name: 'שעות שנחסכו למנכ"ל', target: '40 שעות/חודש', current: 20, unit: 'שעות' },
      { name: 'משימות שנותבו', target: '200 בחודש', current: 15, unit: 'משימות' },
      { name: 'SLA תגובה', target: '< 2 שעות', current: 30, unit: 'שעות' },
      { name: 'ייעול תהליכים', target: '10 תהליכים', current: 10, unit: 'תהליכים' },
    ],
  },
  {
    id: 'omri-shitrit',
    name: 'עומרי שיטרית',
    initials: 'ע"ש',
    role: 'AI & Fullstack Developer',
    roleEn: 'AI & Fullstack Developer',
    description: 'אחראי על פיתוח ואינטגרציה של מערכות AI. מציאת פתרונות מותאמים ללקוחות, ועבודה צמודה עם CTO לשמירה על סטנדרטים גבוהים.',
    colorFrom: '#06b6d4',
    colorTo: '#3b82f6',
    accentColor: '#67e8f9',
    vestingPercent: 2,
    milestones: 'האופציות (2% מהחברה) מותנות בפיתוח מודולי AI פונקציונליים, אינטגרציה מלאה ועמידה ביעדי איכות.',
    kpis: [
      { name: 'מודולי AI', target: '6 מודולים', current: 5, unit: 'מודולים' },
      { name: 'אינטגרציות', target: '10 מערכות', current: 5, unit: 'אינטגרציות' },
      { name: 'Code Quality', target: '> 85%', current: 10, unit: '%' },
      { name: 'Bug Fix SLA', target: '< 24 שעות', current: 0, unit: 'שעות' },
    ],
  },
];

// #endregion
