/* ============================================
   FILE: incubatorAgreementData.ts
   PURPOSE: Static data constants for incubator employment & ESOP agreement templates
   DEPENDENCIES: None
   EXPORTS: AgreementSection, EMPLOYMENT_SECTIONS, ESOP_SECTIONS, KPI_DATA
   ============================================ */

// #region Types

/** Collapsible section for agreement display */
export interface AgreementSection {
  /** Section id */
  id: string;
  /** Section title */
  title: string;
  /** Section content lines */
  content: string[];
  /** Highlight text */
  highlight?: string;
}

/** KPI data structure for an employee */
export interface EmployeeKPI {
  /** Employee name */
  name: string;
  /** Employee role */
  role: string;
  /** ESOP percentage */
  percent: string;
  /** KPI metrics */
  kpis: { metric: string; target: string; weight: string }[];
}

// #endregion

// #region Employment Agreement Data

/** Employment agreement template sections */
export const EMPLOYMENT_SECTIONS: AgreementSection[] = [
  {
    id: 'emp-1', title: '1. מבוא',
    content: [
      'החברה עוסקת בפיתוח מערכות AI עסקיות (פרוטוקול ישיבות, אוטומציה עסקית).',
      'החברה מעוניינת להעסיק את העובד במסגרת תוכנית החממה (Incubator Program), והעובד מעוניין להיות מועסק כעובד שכיר.',
      'העובד זכאי בנוסף לאופציות בהתאם להסכם הענקת אופציות נפרד (ESOP Grant Agreement).',
    ],
  },
  {
    id: 'emp-2', title: '2. התפקיד',
    content: [
      'תואר התפקיד: [למלא — סמנכ"ל שיווק ומכירות / סמנכ"ל IT / מהנדסת מוצר / AI PA / מפתח Fullstack]',
      'תיאור התפקיד: [למלא בהתאם לתפקיד]',
      'כפיפות: [אלדד דוד — מנכ"ל / קיריל יאקימנקו — CTO]',
      'העובד מתחייב להקדיש את מלוא מרצו, זמנו ויכולותיו לתפקידו בחברה.',
    ],
  },
  {
    id: 'emp-3', title: '3. תקופת ניסיון, ימי עבודה ומיקום',
    content: [
      'תאריך תחילת ההעסקה: ___/___/2026',
      'תקופת ניסיון: 6 חודשים. הודעה מוקדמת של 14 יום בתקופת הניסיון.',
      'מבנה משרה: 5 ימי עבודה בשבוע (א\'-ה\'), תקן משרה מלאה (42 שעות).',
      'מקום עבודה: משרדי החברה + מודל עבודה מרחוק (Hybrid / WFH) למקצועות טכנולוגיים בתיאום.',
    ],
  },
  {
    id: 'emp-4', title: '4. שכר, תמורה ושעות נוספות',
    content: [
      'שכר יסוד קובע לפנסיה: מפורט בנספח ג\'. מובהר כי שכר היסוד כשלעצמו (ללא תוספות) לא יפחת משכר המינימום (6,443.85 ₪, 01/04/2026).',
      'שעות נוספות גלובליות: תמורה חלופית לאור אופי תעשיית ה-AI והעבודה העצמאית (ללא פיקוח שעון נוקשה שמתאים נניח לעובדי שטח/משאיות).',
      'תשלום השכר: עד ה-9 בכל חודש (חוק הגנת השכר).',
      'עדכון שכר: ייבחן מחדש לאחר תקופה שלא תעלה על חודשיים. ייקבע לפי תפקיד, ביצועים, KPIs, ותזרים.',
      'רכיבי שכר נוספים (בונוסים, עמלות) — ייקבעו בנספח השכר.',
      'אופציות: בהתאם להסכם ESOP נפרד.',
    ],
    highlight: 'שכר מינימום במשק: 6,443.85 ₪ (01/04/2026). השכר האישי ייקבע במו"מ עם כל עובד.',
  },
  {
    id: 'emp-5', title: '5. זכויות סוציאליות',
    content: [
      'ביטוח פנסיוני: מעסיק 6.5% (תגמולים) + 6% (פיצויים). עובד 6%.',
      'פיצויי פיטורים: סעיף 14 — הפרשה שוטפת במקום פיצויים.',
      'חופשה: 12 ימים/שנה.',
      'מחלה: 1.5 ימים/חודש (18/שנה).',
      'הבראה: 7 ימים × 418 ₪ (לאחר שנה).',
      'נסיעות: עד 22.60 ₪/יום.',
    ],
  },
  {
    id: 'emp-6', title: '6. סודיות (NDA)',
    content: [
      'סודיות מוחלטת על קוד, AI, לקוחות, תוכניות עסקיות — ללא הגבלת זמן.',
      'פיצוי מוסכם: 50,000 ₪ בגין הפרה — ללא צורך בהוכחת נזק.',
    ],
  },
  {
    id: 'emp-7', title: '7. קניין רוחני (IP)',
    content: [
      'IP Assignment מלא: כל פיתוח במהלך העבודה — שייך לחברה (סעיף 132 לחוק הפטנטים).',
      'ויתור על תמלוגים (סעיף 134) וזכויות מוסריות (סעיפים 45-46 לחוק זכות יוצרים).',
    ],
  },
  {
    id: 'emp-8', title: '8. אי-תחרות ואי-שידול',
    content: [
      'Non-Compete: 12 חודשים ממועד סיום.',
      'Non-Solicitation: 18 חודשים — איסור שידול עובדים, לקוחות, ספקים.',
    ],
  },
  {
    id: 'emp-9', title: '9. סיום העסקה',
    content: [
      'הודעה מוקדמת: לפי חוק (עד חודש לאחר שנה).',
      'פיצויים: סעיף 14.',
      'השפעה על אופציות: לפי Good/Bad Leaver בהסכם ESOP.',
    ],
  },
];

// #endregion

// #region ESOP Agreement Data

/** ESOP agreement template sections */
export const ESOP_SECTIONS: AgreementSection[] = [
  {
    id: 'esop-1', title: '1. הקצאת אופציות ומסלול מיסוי',
    content: [
      'הקצאה: [X]% מהון המניות בדילול מלא.',
      'מחיר מימוש: 0.01 ₪ למניה (ערך נקוב).',
      'מסלול: 102(ב)(2) — רווח הון מופקד בידי נאמן. מס: 25% בלבד.',
      'נאמן: [IBI Capital / אקסלנס / מיטב דש].',
      'חסימה: 24 חודשים בידי הנאמן.',
      'פקיעה: 10 שנים ממועד ההקצאה.',
    ],
    highlight: 'סעיף 102 — מס 25% בלבד! קבלנים מחויבים ב-50% לפי סעיף 3(ט).',
  },
  {
    id: 'esop-2', title: '2. הבשלה מריטוקרטית (Hybrid Vesting)',
    content: [
      'תקופה: 4 שנים (פתוח לדיון, ראה המלצה מטה). Cliff: 12 חודשים.',
      '50% הבשלה על בסיס זמן — 25% ביום שנה, אח"כ חודשי.',
      '50% הבשלה על בסיס ביצועים (KPIs) — לפי נספח א\'.',
      'הערכה רבעונית: CEO + CTO בוחנים KPIs.',
    ],
    highlight: '💡 המלצת המערכת לעולם ה-AI: הסטנדרט הוא 4 שנים, אך ב-AI הקצב מהיר יותר. לשקול מול הדירקטוריון: (1) קיצור התקופה ל-3 שנים כנהוג בחברות AI מסוימות, או (2) הוספת "האצת ביצועים" (Accelerated Vesting) בעת הגעה לאבן דרך עסקית משמעותית.',
  },
  {
    id: 'esop-3', title: '3. סיום התקשרות (Leaver Provisions)',
    content: [
      'Good Leaver: שומר אופציות מובשלות, 90 יום למימוש.',
      'Bad Leaver: Claw-back במחיר נקוב (0.01 ₪/מניה). עילות: הפרת אמונים, מעילה, גניבת IP, הרשעה פלילית.',
      'KPI Miss: עצירת הבשלה בלבד. 3 רבעונים רצופים = ביטול אופציות לא-מובשלות.',
    ],
  },
  {
    id: 'esop-4', title: '4. האצה — Double Trigger ⭐',
    content: [
      'תנאי 1: שינוי שליטה (Change of Control) — מכירה של 50%+.',
      'תנאי 2: העובד מפוטר ללא עילה תוך 12 חודשים מהרכישה.',
      'תוצאה (שניהם מתקיימים): 100% האצה מיידית.',
    ],
    highlight: 'מגן על העובד מפיטורי אקזיט, אך לא מרתיע רוכשים.',
  },
  {
    id: 'esop-5', title: '5. דילול (Anti-Dilution)',
    content: [
      'בגיוס הון — דילול Pro-Rata שוויוני עם כל בעלי המניות.',
      'עדכון בכתב תוך 30 יום.',
    ],
  },
  {
    id: 'esop-6', title: '6. קניין רוחני וסודיות',
    content: [
      'IP Assignment מלא (סעיף 132 לחוק הפטנטים).',
      'ויתור על תמלוגים + זכויות מוסריות.',
      'NDA ללא הגבלת זמן.',
      'אי-תחרות: 12 חודשים. אי-שידול: 18 חודשים.',
    ],
  },
];

/** KPI data per incubator employee */
export const KPI_DATA: EmployeeKPI[] = [
  {
    name: 'דורון ביטון', role: 'סמנכ"ל שיווק ומכירות', percent: '2.00%',
    kpis: [
      { metric: 'הכנסות ARR', target: '500,000 ₪', weight: '30%' },
      { metric: 'פיילוטים שנסגרו', target: '3 לקוחות', weight: '25%' },
      { metric: 'Pipeline', target: '2,000,000 ₪', weight: '25%' },
      { metric: 'פגישות מכירה', target: '20/חודש', weight: '20%' },
    ],
  },
  {
    name: 'גביר ימין', role: 'סמנכ"ל IT, סייבר ופיתוח מוצר', percent: '2.00%',
    kpis: [
      { metric: 'מבדקי סייבר', target: '4/שנה', weight: '25%' },
      { metric: 'תשתיות ענן', target: 'Production Ready', weight: '25%' },
      { metric: 'Sprints', target: '12/שנה', weight: '25%' },
      { metric: 'Uptime', target: '≥ 99.5%', weight: '25%' },
    ],
  },
  {
    name: 'ענבר ברבי דאבוש', role: 'מהנדסת מוצר ופרזנטורית', percent: '2.00%',
    kpis: [
      { metric: 'אפיוני מוצר', target: '6/שנה', weight: '25%' },
      { metric: 'מצגות למשקיעים', target: '8/שנה', weight: '25%' },
      { metric: 'דמואים', target: '12/שנה', weight: '25%' },
      { metric: 'CSAT', target: '≥ 4.5/5', weight: '25%' },
    ],
  },
  {
    name: 'סוניה אילוז', role: 'AI PA & מזכירת סינתטית', percent: '1.00%',
    kpis: [
      { metric: 'חיסכון שעות', target: '40 שעות/חודש', weight: '30%' },
      { metric: 'משימות שנותבו', target: '200/חודש', weight: '25%' },
      { metric: 'SLA תגובה', target: '< 2 שעות', weight: '25%' },
      { metric: 'ייעול תהליכים', target: '10/שנה', weight: '20%' },
    ],
  },
  {
    name: 'עומרי שיטרית', role: 'AI & Fullstack Developer', percent: '2.00%',
    kpis: [
      { metric: 'מודולי AI', target: '6 מודולים', weight: '25%' },
      { metric: 'אינטגרציות', target: '10 מערכות', weight: '25%' },
      { metric: 'Code Quality', target: '≥ 85%', weight: '25%' },
      { metric: 'Bug Fix SLA', target: '< 24 שעות', weight: '25%' },
    ],
  },
];

// #endregion
