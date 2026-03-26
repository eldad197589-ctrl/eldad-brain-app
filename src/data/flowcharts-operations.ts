/* ============================================
   FILE: flowcharts-operations.ts
   PURPOSE: Operations flowchart data — part 1 (guardian, attendance, worklaw, payroll, insolvency)
   DEPENDENCIES: flowchartTypes.ts
   EXPORTS: guardianPro, attendance, worklaw, payrollProcessing, insolvency
   ============================================ */
import type { FlowchartData } from './flowchartTypes';

// #region Guardian Pro

/** תרשים #2 — Guardian Pro */
export const guardianPro: FlowchartData = {
  id: 'guardian-pro',
  flowNum: 2,
  badge: 'תרשים זרימה #2 | Guardian Pro · רוביום',
  title: 'Guardian Pro — מערכת דיווח לאפוטרופוס הראשי',
  subtitle: '7 שלבים: מקליטת נתונים בנקאיים ועד הגשת חבילה מלאה לאפוטרופוס הכללי',
  steps: [
    {
      num: 1, emoji: '📥', title: 'קליטת נתונים (Input Layer)',
      subtitle: 'קבלת כל הנתונים הפיננסיים מהאפוטרופוס',
      color: '#3b82f6',
      badge: { text: 'כלל ברזל', type: 'iron' },
      details: [
        { icon: '🏦', iconBg: 'rgba(59,130,246,0.15)', title: 'חשבונות בנק', text: 'CSV / PDF — ייבוא אוטומטי', tags: ['excelParser.ts', 'pdfProcessor.ts'] },
        { icon: '📊', iconBg: 'rgba(59,130,246,0.15)', title: 'Excel ידני', text: 'טבלאות אקסל מהאפוטרופוס / הגורם המטפל' },
        { icon: '📄', iconBg: 'rgba(59,130,246,0.15)', title: 'מסמכים תומכים (PDF)', text: 'חשבוניות, קבלות, אישורים', tags: ['aiDocumentProcessor.ts'] },
        { icon: '⌨️', iconBg: 'rgba(59,130,246,0.15)', title: 'הזנה ידנית מבוקרת', text: 'שדות חובה: תאריך, סכום, סוג, חשבון בנק, מקור<br>⚠️ אין הזנה ללא שיוך לחשבון!' },
      ]
    },
    {
      num: 2, emoji: '🤖', title: 'סיווג ומיפוי (AI + Official Codes)',
      subtitle: 'מיפוי כל תנועה לקוד רשמי של האפוטרופוס הכללי',
      color: '#8b5cf6',
      badge: { text: 'AI Engine', type: 'ai' },
      details: [
        { icon: '🧠', iconBg: 'rgba(139,92,246,0.15)', title: 'Scanner.AI — סיווג אוטומטי', text: 'מנוע AI (Gemini) מזהה ומסווג תנועות אוטומטית', tags: ['scannerAI.ts', 'transactionCategorizer.ts'] },
        { icon: '📋', iconBg: 'rgba(139,92,246,0.15)', title: '500+ קודים רשמיים', text: 'הכנסות (11-65) · הוצאות (80-143) · נכסים (201-507) · חובות (401-403)', tags: ['reportCodes.ts'] },
        { icon: '✂️', iconBg: 'rgba(139,92,246,0.15)', title: 'פיצול תנועות מורכבות', text: 'תנועה אחת → מספר קודים (Split Transaction)', tags: ['financialCalculations.ts'] },
        { icon: '🔗', iconBg: 'rgba(139,92,246,0.15)', title: 'המרת קודי בנק → קודי רשמיים', text: 'קוד בנק 105 → קוד רשמי 201 (עו"ש)', tags: ['BANK_CODE_MAPPING'] },
      ]
    },
    {
      num: 3, emoji: '🔍', title: 'בקרת איכות ואימות (Validation)',
      subtitle: 'בדיקות חובה — המערכת מתריעה, רו"ח מחליט',
      color: '#f59e0b',
      badge: { text: 'כלל ברזל', type: 'iron' },
      details: [
        { icon: '⚖️', iconBg: 'rgba(245,158,11,0.15)', title: 'יתרת פתיחה ↔ יתרת סגירה', text: 'מחייב: יתרת פתיחה + תקבולים − תשלומים = יתרת סגירה' },
        { icon: '🔄', iconBg: 'rgba(245,158,11,0.15)', title: 'זיהוי כפילויות', text: 'חיפוש תנועות זהות (סכום + תאריך + חשבון)', tags: ['transactionMatcher.ts'] },
        { icon: '⚠️', iconBg: 'rgba(245,158,11,0.15)', title: 'זיהוי חריגים', text: 'סכומים חריגים, תדירות חריגה, הכנסה חוזרת', tags: ['completionChecker.ts'] },
        { icon: '📐', iconBg: 'rgba(245,158,11,0.15)', title: 'הקצאות חודשיות', text: 'חלוקה אוטומטית של הוצאות לפי חודשים<br>carry-forward למקרה של חוסר ביתרה' },
      ]
    },
    {
      num: 4, emoji: '📊', title: 'הפקת דוחות כספיים (Reports)',
      subtitle: '4 דוחות רשמיים לפי תבנית האפוטרופוס הכללי',
      color: '#10b981',
      badge: { text: 'תבנית רשמית', type: 'law' },
      details: [
        { icon: '📋', iconBg: 'rgba(16,185,129,0.15)', title: 'דוח תקבולים ותשלומים', text: 'יתרות פתיחה → הכנסות מפורטות → הוצאות מפורטות → יתרה תיאורטית → השוואה לבנק' },
        { icon: '📈', iconBg: 'rgba(16,185,129,0.15)', title: 'דוח רווח והפסד', text: 'הכנסה לפי סוג · הוצאות לפי סוג · ⚠️ ללא קיזוז מס!' },
        { icon: '🏦', iconBg: 'rgba(16,185,129,0.15)', title: 'התאמות בנק', text: 'פירוט מלא לכל חשבון · סטטוס: פתוח/סגור', tags: ['financialCalculations.ts'] },
        { icon: '⚖️', iconBg: 'rgba(16,185,129,0.15)', title: 'השוואת הון', text: 'פתיחה מול סגירה · ₪ ומט"ח בנפרד · הסבר חובה לכל פער' },
      ]
    },
    {
      num: 5, emoji: '📝', title: 'חוות דעת רו"ח (CPA Opinion)',
      subtitle: 'מסמך ביקורת רשמי — נוצר ע"י AI + אישור רו"ח',
      color: '#ec4899',
      badge: { text: 'AI Generated', type: 'ai' },
      details: [
        { icon: '🏷️', iconBg: 'rgba(236,72,153,0.15)', title: '4 סוגי חוות דעת', text: 'בלתי מסוייגת ✓ · מסוייגת ⚠️ · שלילית ✗ · אי מתן חוות דעת', tags: ['opinionGenerator.ts'] },
        { icon: '🤖', iconBg: 'rgba(236,72,153,0.15)', title: 'יצירה אוטומטית (Gemini)', text: 'AI מקבל: נתוני תיק + סוג → מפיק: נושא + תוכן + ממצאים + המלצות' },
        { icon: '🔒', iconBg: 'rgba(236,72,153,0.15)', title: 'כללי ברזל', text: '⚠️ אין עריכה חופשית של הנוסח המשפטי<br>⚠️ חובה לציין מסמכים חסרים<br>✍️ חתימה ידנית או דיגיטלית בלבד' },
      ]
    },
    {
      num: 6, emoji: '✅', title: 'אישור אפוטרופוס (Guardian Approval)',
      subtitle: 'צפייה בלבד → V אישור → חתימה → נעילה',
      color: '#06b6d4',
      details: [
        { icon: '👁️', iconBg: 'rgba(6,182,212,0.15)', title: 'צפייה בלבד (Read-Only)', text: 'האפוטרופוס רואה את כל הדוחות ללא אפשרות עריכה' },
        { icon: '☑️', iconBg: 'rgba(6,182,212,0.15)', title: 'Checkbox אישור', text: '"קראתי ואני מאשר את הדוח" + חתימה דיגיטלית' },
        { icon: '🔐', iconBg: 'rgba(6,182,212,0.15)', title: 'נעילת דוח', text: 'לאחר אישור — הדוח ננעל לצמיתות, אין אפשרות שינוי' },
      ]
    },
    {
      num: 7, emoji: '📤', title: 'ייצוא והגשה (Export & Submit)',
      subtitle: 'חבילת הגשה מלאה — PDF + Excel + ארכיון',
      color: '#6366f1',
      details: [
        { icon: '📄', iconBg: 'rgba(99,102,241,0.15)', title: 'PDF בתבנית קבועה', text: 'דוח מודפס — Pixel-Perfect לפי תקן האפוטרופוס', tags: ['pdfExport.ts', 'pdfRenderer.ts'] },
        { icon: '📊', iconBg: 'rgba(99,102,241,0.15)', title: 'גיבוי Excel', text: 'כל הנתונים בפורמט אקסל לגיבוי', tags: ['excelExport.ts'] },
        { icon: '📦', iconBg: 'rgba(99,102,241,0.15)', title: 'חבילת ZIP', text: 'כל הדוחות + אסמכתאות בקובץ אחד', tags: ['zipExport.ts'] },
        { icon: '🌐', iconBg: 'rgba(99,102,241,0.15)', title: 'הגשה לפורטל', text: 'מוכן להעלאה לפורטל האפוטרופוס הכללי + ארכיון אוטומטי' },
      ]
    },
  ],
  ironRules: [
    { text: 'חישוב מס — אסור! הכנסה ברוטו בלבד, מס כהוצאה נפרדת' },
    { text: 'קיזוז הכנסות/הוצאות — אסור! הכל מוצג בנפרד' },
    { text: 'שינוי מבנה דוח — אסור! הכל לפי אינדקס האפוטרופוס' },
    { text: '"ליפוף" נתונים — אסור! מציגים רק עובדות בלי הערכות' },
    { text: 'מחיקת תנועות בנק — אסור! כל תנועה נשמרת' },
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'חבילת הגשה מלאה לאפוטרופוס הכללי: דוחות כספיים + חוות דעת רו"ח + אישור אפוטרופוס + אסמכתאות',
    emphasis: 'הכל בפורמט רשמי, מבוקר, וננעל — מוכן להגשה ✓',
  }
};

// #endregion

// #region Attendance

/** תרשים #3 — מנוע נוכחות */
export const attendance: FlowchartData = {
  id: 'attendance',
  flowNum: 3,
  badge: 'תרשים זרימה #3 | מנוע נוכחות · רוביום',
  title: 'מנוע נוכחות — חוק עבודה ישראלי',
  subtitle: 'חישוב משמרות, שעות נוספות, חגים, לילה וייצוא לתוכנת שכר — לפי חוק שעות עבודה ומנוחה',
  steps: [
    {
      num: 1, emoji: '📋', title: 'הגדרת חוזה עובד (Contract Setup)',
      subtitle: 'הגדרת תנאי ההעסקה ומבנה ימי העבודה',
      color: '#14b8a6',
      badge: { text: 'חוק עבודה', type: 'law' },
      details: [
        { icon: '📅', iconBg: 'rgba(20,184,166,0.15)', title: 'מבנה שבוע עבודה', text: '5 ימים (8.6 שעות/יום) או 6 ימים (8.0 שעות/יום)<br>מקסימום שבועי: 43 שעות' },
        { icon: '💰', iconBg: 'rgba(20,184,166,0.15)', title: 'שכר שעתי', text: 'תעריף בסיס לחישוב שעות נוספות, חגים, ולילה', tags: ['AttendanceContract'] },
        { icon: '🏢', iconBg: 'rgba(20,184,166,0.15)', title: 'שיוך מעסיק', text: 'כל עובד משויך למעסיק · ניהול רב-חברתי', tags: ['employerService.ts'] },
        { icon: '📊', iconBg: 'rgba(20,184,166,0.15)', title: 'ייבוא רשימת עובדים', text: 'XLSX (נוכחות שעות עוגנים + עובדי חברה)', tags: ['EmployeeImportDialog'] },
      ]
    },
    {
      num: 2, emoji: '⏰', title: 'קליטת משמרות (Shift Entry)',
      subtitle: 'שעת כניסה/יציאה + הפסקה — ידנית או מקובץ',
      color: '#3b82f6',
      details: [
        { icon: '🕐', iconBg: 'rgba(59,130,246,0.15)', title: 'הזנת שעות', text: 'שעת התחלה · שעת סיום · הפסקה (דקות)', tags: ['ShiftEntry component'] },
        { icon: '📁', iconBg: 'rgba(59,130,246,0.15)', title: 'ייבוא מקובץ', text: 'קליטת נוכחות ממערכת שעון נוכחות חיצונית', tags: ['fileExtractionService.ts'] },
        { icon: '📜', iconBg: 'rgba(59,130,246,0.15)', title: 'היסטוריית נוכחות', text: 'צפייה בנתוני עבר · השוואה בין חודשים', tags: ['AttendanceHistoryPanel'] },
      ]
    },
    {
      num: 3, emoji: '📆', title: 'זיהוי חגים וימים מיוחדים',
      subtitle: 'מאגר חגים ישראלי מלא: 2024-2026 — חגים, חול המועד, ערבי חג, ימי זיכרון',
      color: '#f59e0b',
      badge: { text: 'לוח עברי', type: 'law' },
      details: [
        { icon: '🕎', iconBg: 'rgba(245,158,11,0.15)', title: 'חגים רשמיים (ISRAEL_HOLIDAYS)', text: 'פסח, שבועות, ראש השנה, יום כיפור, סוכות, שמחת תורה, יום העצמאות', tags: ['constants.ts'] },
        { icon: '🌿', iconBg: 'rgba(245,158,11,0.15)', title: 'חול המועד (CHOL_HAMOED)', text: 'ימי עבודה רגילים בין ימי החג — לא יום מנוחה חובה' },
        { icon: '🕯️', iconBg: 'rgba(245,158,11,0.15)', title: 'ערבי חג (HOLIDAY_EVES)', text: 'ימי עבודה מקוצרים — עד 7 שעות או עד 13:00' },
        { icon: '🏳️', iconBg: 'rgba(245,158,11,0.15)', title: 'ימי זיכרון + בחירות', text: 'יום השואה, יום הזיכרון, ימי בחירות — חופשה בתשלום' },
      ]
    },
    {
      num: 4, emoji: '🧮', title: 'חישוב משמרת (calculateShift)',
      subtitle: 'מנוע חישוב: שעות רגילות, נוספות 125%, נוספות 150%, שבת 150%/200%',
      color: '#8b5cf6',
      badge: { text: 'מנוע חישוב', type: 'calc' },
      details: [
        { icon: '📐', iconBg: 'rgba(139,92,246,0.15)', title: 'חישוב שעות ברוטו', text: 'סיום − התחלה − הפסקה = שעות עבודה<br>הפסקה מינימלית: 30 דקות (מעל 6 שעות)' },
        { icon: '🌙', iconBg: 'rgba(139,92,246,0.15)', title: 'חישוב שעות לילה', text: '22:00-06:00 = משמרת לילה<br>7 שעות = יום עבודה מלא', tags: ['calculateNightHours()'] },
        { icon: '⏱️', iconBg: 'rgba(139,92,246,0.15)', title: 'שעות נוספות', text: '2 שעות ראשונות: 125%<br>מהשעה השלישית: 150%<br>⚠️ מקסימום 2 שעות יום @125%' },
        { icon: '🕎', iconBg: 'rgba(139,92,246,0.15)', title: 'חג ושבת', text: 'שעות רגילות: 150%<br>שעות נוספות בחג: 200%' },
      ],
      formulas: {
        title: '⚡ פורמולות חישוב מרכזיות',
        lines: [
          { variable: 'grossHours', operator: '=', expression: '(endTime - startTime) - breakMinutes', comment: 'שעות ברוטו' },
          { variable: 'regularHours', operator: '=', expression: 'min(grossHours, dailyStandard)', comment: 'שעות רגילות (8.6 / 8.0)' },
          { variable: 'overtime125', operator: '=', expression: 'min(2, max(0, grossHours - dailyStandard))', comment: 'נוספות 125%' },
          { variable: 'overtime150', operator: '=', expression: 'max(0, grossHours - dailyStandard - 2)', comment: 'נוספות 150%' },
          { variable: 'nightHours', operator: '=', expression: 'hoursIn(22:00, 06:00)', comment: 'שעות לילה (7 שעות = מלא)' },
          { variable: 'holidayPay', operator: '=', expression: 'regularHours × 1.50 + overtime × 2.00', comment: 'תשלום חג' },
          { variable: 'totalPay', operator: '=', expression: 'Σ(hours × rate × multiplier)', comment: 'סה"כ ליום' },
        ]
      }
    },
    {
      num: 5, emoji: '📊', title: 'סיכום חודשי (calculateSummary)',
      subtitle: 'ריכוז כל המשמרות לסיכום חודשי מפורט',
      color: '#10b981',
      details: [
        { icon: '📋', iconBg: 'rgba(16,185,129,0.15)', title: 'סה"כ ימי עבודה', text: 'ימים רגילים + ימי חג + ימי שבת שעבד' },
        { icon: '⏱️', iconBg: 'rgba(16,185,129,0.15)', title: 'ריכוז שעות', text: 'רגילות · נוספות 125% · נוספות 150% · לילה · חג' },
        { icon: '💰', iconBg: 'rgba(16,185,129,0.15)', title: 'חישוב עלות שכר', text: 'שכר בסיס + תוספת שעות נוספות + תוספת חג/שבת', tags: ['calculateSummary()'] },
        { icon: '📈', iconBg: 'rgba(16,185,129,0.15)', title: 'דשבורד סיכום', text: 'תצוגה ויזואלית של כל הנתונים', tags: ['SummaryDashboard'] },
      ]
    },
    {
      num: 6, emoji: '⚖️', title: 'יועץ חוקי (LawAdvisor)',
      subtitle: 'בדיקה אוטומטית של עמידה בדרישות חוק העבודה',
      color: '#f97316',
      badge: { text: 'AI Advisor', type: 'ai' },
      details: [
        { icon: '⚠️', iconBg: 'rgba(249,115,22,0.15)', title: 'התראות חריגה', text: 'חריגה ממכסת שעות נוספות · הפסקה חסרה · עבודה ברצף ללא מנוחה' },
        { icon: '📕', iconBg: 'rgba(249,115,22,0.15)', title: 'הפניה לסעיפי חוק', text: 'חוק שעות עבודה ומנוחה, צו הרחבה, חוק חופשה שנתית' },
      ]
    },
    {
      num: 7, emoji: '📤', title: 'ייצוא לתוכנת שכר (Payroll Export)',
      subtitle: 'ייצוא נתוני נוכחות מחושבים לתוכנת שכר חיצונית',
      color: '#6366f1',
      details: [
        { icon: '📑', iconBg: 'rgba(99,102,241,0.15)', title: 'CSV מובנה', text: 'עמודות: עובד · תאריך · שעות רגילות · 125% · 150% · לילה · חג' },
        { icon: '🔗', iconBg: 'rgba(99,102,241,0.15)', title: 'אינטגרציה', text: 'תואם לתוכנות שכר: חשבשבת, מיקרוס, הילה, Priority' },
        { icon: '📊', iconBg: 'rgba(99,102,241,0.15)', title: 'דוח PDF', text: 'סיכום חודשי וישואלי לכל עובד — מוכן להדפסה' },
      ]
    },
  ],
  decisions: [
    {
      afterStep: 2,
      decision: {
        title: 'סיווג יום — מה סוג היום?',
        branches: [
          { label: '📅 יום רגיל', sub: '100%', type: 'normal' },
          { label: '🕎 חג רשמי', sub: '150%-200%', type: 'holiday' },
          { label: '🌙 משמרת לילה', sub: '7 שעות = מלא', type: 'night' },
          { label: '🕯️ ערב חג', sub: 'עד 7 שעות', type: 'eve' },
        ]
      }
    }
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'דוח נוכחות חודשי מלא: שעות מחושבות + תוספות חוק + התראות ציות — מוכן לייצוא לתוכנת שכר',
    emphasis: 'חישוב אוטומטי, עמידה בחוק, ייצוא CSV — הכל מוגן משפטית ✓',
  }
};

// #endregion

// #region Worklaw

/** תרשים #4 — דיני עבודה */
export const worklaw: FlowchartData = {
  id: 'worklaw',
  flowNum: 4,
  badge: '⚖️ תהליך ליבה: Worklaw & Opinions',
  title: 'דיני עבודה וחוות דעת OS',
  subtitle: 'מערכת ה-OS שמושכת מידע ממערכות אחרות (כמו מנוע השכר) וממסמכים חיצוניים כדי לאתר חוסרים, להפעיל תחשיבים משפטיים ולהפיק חוות דעת מול כ-85+ מקרים ו-10 ענפים שונים.',
  relatedLinks: [
    { to: '/flow/expert-opinion', label: '📄 חוות דעת כלכלית' },
    { to: '/flow/attendance', label: '⏰ מנוע נוכחות' },
  ],
  steps: [
    {
      num: 1, emoji: '📥', title: 'איסוף והצלבת הנתונים (Data Linkage)',
      subtitle: 'התממשקות ל-Attendance OS ולמסמכי הקצה',
      color: '#3b82f6',
      details: [
        { icon: '📄', iconBg: 'rgba(59,130,246,0.15)', title: 'משיכת תלושי שכר', text: 'PDF/Data — פירוט רכיבי שכר לפי חודש', tags: ['PDF/Data'] },
        { icon: '📊', iconBg: 'rgba(59,130,246,0.15)', title: 'קריאת דוחות נוכחות', text: 'דוחות נוכחות מוקלטים ממערכת שעון', tags: ['Attendance OS'] },
        { icon: '🏦', iconBg: 'rgba(59,130,246,0.15)', title: 'פיענוח דוחות פנסיה', text: 'דוחות פנסיה וקופות גמל — OCR', tags: ['OCR Extractor'] },
      ]
    },
    {
      num: 2, emoji: '🧮', title: 'מנוע התחשיב המשפטי (Legal Calculation Engine)',
      subtitle: 'השוואה בין שעות מהנוכחות לבין מה ששולם בתלושים',
      color: '#ec4899',
      details: [
        { icon: '⏱️', iconBg: 'rgba(236,72,153,0.15)', title: 'איתור שעות נוספות חסרות', text: 'השוואת שעות עבודה בפועל מול רכיבי שכר' },
        { icon: '🏦', iconBg: 'rgba(236,72,153,0.15)', title: 'בדיקת העברות פנסיוניות', text: 'האם הופרשו סכומים לפי חוק?' },
        { icon: '💰', iconBg: 'rgba(236,72,153,0.15)', title: 'חישוב הלנת שכר ופיצויי פיטורין', text: 'חישוב לפי 10 חוקי הסכמים קיבוציים' },
      ]
    },
    {
      num: 3, emoji: '📄', title: 'הפקת חוות דעת ותוצרים (Document Generation)',
      subtitle: 'מעבר מהמספרים אל השפה המשפטית',
      color: '#14b8a6',
      details: [
        { icon: '📊', iconBg: 'rgba(20,184,166,0.15)', title: 'אקסל תחשיבי פירוט', text: 'נספח מפורט — כל רכיב לפי חודש' },
        { icon: '📝', iconBg: 'rgba(20,184,166,0.15)', title: 'מסמך Word — חוות דעת מומחה', text: 'חוות דעת כלכלית חתומה על ידי רו"ח' },
        { icon: '✉️', iconBg: 'rgba(20,184,166,0.15)', title: 'מכתב התראה', text: 'מכתב לפני נקיטת הליכים משפטיים' },
      ]
    },
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'חוות דעת כלכלית מלאה + תחשיב Excel + מכתב התראה — מוכנים להגשה לבית הדין לעבודה',
    emphasis: '85+ תיקים · 10 ענפים · הצלבה אוטומטית מול מנוע הנוכחות ✓',
  }
};

// #endregion

// #region Payroll Processing

/** תרשים #5 — מיקרו-תהליך עיבוד שכר */
export const payrollProcessing: FlowchartData = {
  id: 'payroll-processing',
  flowNum: 5,
  badge: 'מיקרו-תהליך (Micro-Process Mapping)',
  title: 'מזרימת מייל (Gmail) לעיבוד Agentic',
  subtitle: 'תרגום התהליך האמיתי המתרחש בתיקיית "א.א. עוגנים" אל מנוע הנוכחות ושכר OS.',
  relatedLinks: [
    { to: '/flow/brain-router', label: '← חזרה ל-Brain Router' },
    { to: '/flow/attendance', label: 'חזרה לעץ נוכחות מלא →' },
  ],
  steps: [
    {
      num: 1, emoji: '📧', title: 'טריגר נכנס (Inbox Data Ingestion)',
      subtitle: 'האג\'נט עוקב אחר הכתובת הייעודית',
      color: '#3b82f6',
      details: [
        { icon: '👤', iconBg: 'rgba(59,130,246,0.15)', title: 'מאת', text: 'רוני סבג (א.א. עוגנים)' },
        { icon: '📋', iconBg: 'rgba(59,130,246,0.15)', title: 'נושא', text: 'תיקון תלושים + שעות הובלה' },
        { icon: '📎', iconBg: 'rgba(59,130,246,0.15)', title: 'מצורפים', text: '📄 טופס_101_חדש.pdf | 📊 שעות_איתוראן_דצמבר.xlsx' },
      ]
    },
    {
      num: 2, emoji: '🤖', title: 'Brain Router & Data Extractors',
      subtitle: 'סיווג הלקוח ופתיחת הקבצים',
      color: '#8b5cf6',
      badge: { text: 'Brain Router', type: 'ai' },
      details: [
        { icon: '🔍', iconBg: 'rgba(139,92,246,0.15)', title: 'זיהוי לקוח', text: 'Matching domain "א.א. עוגנים" to Client ID: 95175976000' },
        { icon: '📄', iconBg: 'rgba(139,92,246,0.15)', title: 'חילוץ PDF', text: 'Extracted: Name=Moshe Cohen, ID=0533088994', tags: ['EXTRACTOR'] },
        { icon: '📊', iconBg: 'rgba(139,92,246,0.15)', title: 'חילוץ Excel', text: 'Extracted: 4,000 work hours across 12 employees', tags: ['EXTRACTOR'] },
      ]
    },
    {
      num: 3, emoji: '🧮', title: 'Attendance & Payroll OS (מנוע שכר עוגנים)',
      subtitle: 'החלת חוקים רגולטוריים',
      color: '#14b8a6',
      details: [
        { icon: '📋', iconBg: 'rgba(20,184,166,0.15)', title: 'הסכם קיבוצי', text: 'ענף ההובלה / ניקיון' },
        { icon: '🌙', iconBg: 'rgba(20,184,166,0.15)', title: 'בדיקת חריגות', text: 'משמרת 22:00 (משמרת לילה 🥇)' },
        { icon: '💰', iconBg: 'rgba(20,184,166,0.15)', title: 'פרמטר מס', text: 'עדכון נקודות זיכוי מ-101' },
        { icon: '📊', iconBg: 'rgba(20,184,166,0.15)', title: 'פעולה', text: 'הפקת פקודת שכר מדוללת' },
      ]
    },
    {
      num: 4, emoji: '📤', title: 'Document Engine & Vault',
      subtitle: 'סגירת המעגל ואיתרוג הנתונים בחזרה למוסדות',
      color: '#10b981',
      details: [
        { icon: '✉️', iconBg: 'rgba(16,185,129,0.15)', title: 'שליחת מייל אוטומטי', text: 'מייל לרוני עם התלושים' },
        { icon: '📋', iconBg: 'rgba(16,185,129,0.15)', title: 'פקודת הנהלת חשבונות', text: 'עיצוב פקודה ל-CFO OS' },
        { icon: '🏛️', iconBg: 'rgba(16,185,129,0.15)', title: 'דיווח מוסדות', text: 'שליחת דיווח מס הכנסה (תיק ניכויים 95175976000) ב-15 לחודש' },
      ]
    },
  ],
  result: {
    title: 'תוצאת מיקרו-תהליך',
    text: '12 תלושי שכר הופקו · נשמרו בארכיון · מייל נשלח · דיווח מוסדות בוצע',
    emphasis: 'זמן מערכת: 1.25 שניות (מקבילה אנושית: 45 דקות) ✓',
  }
};

// #endregion

// #region Insolvency

/** תרשים #6 — חדלות פירעון */
export const insolvency: FlowchartData = {
  id: 'insolvency',
  flowNum: 6,
  badge: 'תרשים זרימה #5 | חדלות פירעון · רוביום',
  title: 'דוח חדלות פירעון — חודשי לעו"ד',
  subtitle: 'דוח חודשי על תנועות הכנסות והוצאות של חייב בהליך חדלות פירעון — אישור רו"ח לבית המשפט',
  relatedLinks: [
    { to: '/flow/guardian-pro', label: '🏛️ Guardian Pro' },
  ],
  steps: [
    {
      num: 1, emoji: '📋', title: 'פתיחת תיק חדלות פירעון',
      subtitle: 'פרטי החייב, מספר תיק בית משפט, פרטי עו"ד, נאמן',
      color: '#c9a84c',
      badge: { text: 'משפטי', type: 'law' },
      details: [
        { icon: '👤', iconBg: 'rgba(201,168,76,0.15)', title: 'פרטי החייב', text: 'שם · ת.ז. · כתובת · מצב משפחתי\n⚡ בניגוד לאפוטרופוס: כאן החייב הוא *כשיר*' },
        { icon: '⚖️', iconBg: 'rgba(201,168,76,0.15)', title: 'פרטי ההליך', text: 'מספר תיק · בית משפט · שם השופט · מועד צו פתיחה' },
        { icon: '👩‍⚖️', iconBg: 'rgba(201,168,76,0.15)', title: 'עו"ד / נאמן', text: 'שם עורך הדין · פרטי הנאמן (אם מונה) → הם מזמיני הדוח' },
        { icon: '📅', iconBg: 'rgba(201,168,76,0.15)', title: 'תקופת דיווח', text: 'חודשי — כל חודש דוח חדש\n⚡ בניגוד לאפוטרופוס: שנתי → כאן חודשי' },
      ]
    },
    {
      num: 2, emoji: '📥', title: 'קליטת תנועות חודשיות',
      subtitle: 'הכנסות, הוצאות, תשלומים לנושים — ידני או מקובץ בנק',
      color: '#3b82f6',
      badge: { text: 'מנוע Guardian', type: 'ai' },
      details: [
        { icon: '💰', iconBg: 'rgba(59,130,246,0.15)', title: 'הכנסות החייב', text: 'משכורת · הכנסות נוספות · מזונות שמתקבלים', tags: ['incomeMap'] },
        { icon: '🧾', iconBg: 'rgba(59,130,246,0.15)', title: 'הוצאות החייב', text: 'דיור · מזון · חינוך · רפואה · נסיעות', tags: ['expenseMap'] },
        { icon: '🏦', iconBg: 'rgba(59,130,246,0.15)', title: 'פעילות בנקאית', text: 'קליטת דפי בנק → סיווג אוטומטי', tags: ['scannerAI.ts'] },
        { icon: '💳', iconBg: 'rgba(59,130,246,0.15)', title: 'תשלומים לנושים', text: 'תשלומים חודשיים לפי צו בית משפט' },
      ]
    },
    {
      num: 3, emoji: '🧮', title: 'חישוב מאזן חודשי',
      subtitle: 'הכנסות − הוצאות = עודף/גירעון — האם החייב עומד ביעדים?',
      color: '#8b5cf6',
      badge: { text: 'מנוע Guardian', type: 'ai' },
      details: [
        { icon: '📊', iconBg: 'rgba(139,92,246,0.15)', title: 'סיכום הכנסות', text: 'ריכוז כל מקורות ההכנסה לחודש', tags: ['totalIncome'] },
        { icon: '📉', iconBg: 'rgba(139,92,246,0.15)', title: 'סיכום הוצאות', text: 'ריכוז כל ההוצאות לפי קטגוריה', tags: ['totalExpenses'] },
        { icon: '⚖️', iconBg: 'rgba(139,92,246,0.15)', title: 'עודף/גירעון', text: 'הכנסות − הוצאות = האם נשאר לפירעון?', tags: ['surplus'] },
      ],
      formulas: {
        title: '⚡ חישובים (מופשט מ-Guardian)',
        lines: [
          { variable: 'totalIncome', operator: '=', expression: 'Σ(salary + otherIncome + alimony)', comment: 'הכנסות' },
          { variable: 'totalExpenses', operator: '=', expression: 'Σ(housing + food + edu + medical + transport)', comment: 'הוצאות' },
          { variable: 'surplus', operator: '=', expression: 'totalIncome - totalExpenses', comment: 'עודף/גירעון' },
          { variable: 'creditorPayment', operator: '=', expression: 'courtOrder.monthlyAmount', comment: 'תשלום לנושים' },
          { variable: 'compliance', operator: '=', expression: 'surplus >= creditorPayment', comment: 'עומד בצו?' },
        ]
      }
    },
    {
      num: 4, emoji: '🔍', title: 'בקרת איכות + התראות',
      subtitle: 'בדיקת חריגות: הוצאות חריגות, הכנסות לא מדווחות, עמידה בצו',
      color: '#f59e0b',
      details: [
        { icon: '⚠️', iconBg: 'rgba(245,158,11,0.15)', title: 'הוצאה חריגה', text: 'הוצאה מעל הנורמה → דגל אדום' },
        { icon: '🔴', iconBg: 'rgba(245,158,11,0.15)', title: 'אי עמידה בצו', text: 'החייב לא שילם את התשלום החודשי לנושים' },
        { icon: '📋', iconBg: 'rgba(245,158,11,0.15)', title: 'מסמכים חסרים', text: 'תלוש שכר / אישור בנק / קבלה חסרים' },
      ]
    },
    {
      num: 5, emoji: '📄', title: 'הפקת דוח חודשי',
      subtitle: 'דוח מסודר: הכנסות, הוצאות, מאזן, הערות רו"ח',
      color: '#10b981',
      badge: { text: 'אישור רו"ח', type: 'done' },
      details: [
        { icon: '📋', iconBg: 'rgba(16,185,129,0.15)', title: 'טבלת הכנסות', text: 'פירוט כל מקור הכנסה + סכום + אסמכתא' },
        { icon: '📋', iconBg: 'rgba(16,185,129,0.15)', title: 'טבלת הוצאות', text: 'פירוט לפי קטגוריה + סכום + קבלה' },
        { icon: '📊', iconBg: 'rgba(16,185,129,0.15)', title: 'שורת סיכום', text: 'סה"כ הכנסות · סה"כ הוצאות · עודף/גירעון' },
        { icon: '📝', iconBg: 'rgba(16,185,129,0.15)', title: 'הערות רו"ח', text: 'ממצאים · תצפיות · הסתייגויות (אם נדרש)', tags: ['opinionGenerator.ts'] },
      ]
    },
    {
      num: 6, emoji: '✅', title: 'חתימת רו"ח + שליחה לעו"ד',
      subtitle: 'חתימה דיגיטלית של רו"ח → שליחת הדוח לעו"ד / נאמן',
      color: '#06b6d4',
      details: [
        { icon: '✍️', iconBg: 'rgba(6,182,212,0.15)', title: 'חתימת רו"ח', text: '"בזער אנפין" — אישור מצומצם על הנתונים' },
        { icon: '📤', iconBg: 'rgba(6,182,212,0.15)', title: 'שליחה לעו"ד', text: 'PDF → דוא"ל לעורכת הדין / השותפה' },
        { icon: '🗂️', iconBg: 'rgba(6,182,212,0.15)', title: 'שמירה בתיק', text: 'ארכיון דוחות חודשיים — היסטוריה מלאה' },
      ]
    },
    {
      num: 7, emoji: '🏛️', title: 'הגשה לבית המשפט',
      subtitle: 'עו"ד מגיש את הדוח כחלק מדיווח תקופתי לבית המשפט',
      color: '#6366f1',
      details: [
        { icon: '📎', iconBg: 'rgba(99,102,241,0.15)', title: 'הגשה כנספח', text: 'דוח רו"ח → נספח לבקשה / דיווח תקופתי' },
        { icon: '🔁', iconBg: 'rgba(99,102,241,0.15)', title: 'מחזור חודשי', text: 'כל חודש → חוזרים לשלב 2 → דוח חדש' },
      ]
    },
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'דוח חודשי מלא: הכנסות + הוצאות + מאזן + הערות רו"ח — חתום ומוגש לעו"ד ולבית המשפט',
    emphasis: 'מבוסס על מנוע Guardian Pro — גרסת "בזער אנפין" ✓',
  }
};

// #endregion
