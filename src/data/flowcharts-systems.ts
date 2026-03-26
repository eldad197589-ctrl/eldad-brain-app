/* ============================================
   FILE: flowcharts-systems.ts
   PURPOSE: System architecture flowchart data (brain router, attendance agents)
   DEPENDENCIES: flowchartTypes.ts
   EXPORTS: brainRouter, attendanceAgents
   ============================================ */
import type { FlowchartData } from './flowchartTypes';

// #region Brain Router

/** תרשים #10 — Brain Router */
export const brainRouter: FlowchartData = {
  id: 'brain-router',
  flowNum: 10,
  badge: '🧠 Brain Router · המוח של אלדד',
  title: 'Brain Router — נתב המוח',
  subtitle: 'ארכיטקטורת מערכות ההפעלה: מקבלת קלט → מזהה לקוח → מנתבת ל-OS הנכון → מפיק תוצרים',
  relatedLinks: [
    { to: '/flow/payroll-processing', label: '💰 מיקרו-תהליך שכר' },
    { to: '/flow/attendance-agents', label: '⏰ מנוע נוכחות OS' },
  ],
  steps: [
    {
      num: 1, emoji: '📧', title: 'שכבת קלט (Input Layer)',
      subtitle: 'כל הערוצים שדרכם מידע נכנס למוח',
      color: '#8b5cf6',
      details: [
        { icon: '📧', iconBg: 'rgba(139,92,246,0.15)', title: 'Gmail / דוא"ל', text: 'מתחברי Gmail → מיילים עם מצורפים' },
        { icon: '💬', iconBg: 'rgba(139,92,246,0.15)', title: 'WhatsApp / API', text: 'הודעות ומצורפים מלקוחות' },
        { icon: '📁', iconBg: 'rgba(139,92,246,0.15)', title: 'Google Drive / ענן', text: 'קבצים שעולים לתיקייה שיתופית' },
        { icon: '⌨️', iconBg: 'rgba(139,92,246,0.15)', title: 'הזנה ידנית (UI)', text: 'דרך ממשק הדשבורד — טפסים ייעודיים' },
      ]
    },
    {
      num: 2, emoji: '🧠', title: 'Brain Router — מנוע ניתוב',
      subtitle: 'מזהה לקוח, מסווג בקשה, ומנתב ל-OS המתאים',
      color: '#06b6d4',
      badge: { text: 'AI Engine', type: 'ai' },
      details: [
        { icon: '🔍', iconBg: 'rgba(6,182,212,0.15)', title: 'זיהוי לקוח', text: 'Matching domain / כתובת / טלפון → Client ID' },
        { icon: '📋', iconBg: 'rgba(6,182,212,0.15)', title: 'סיווג סוג בקשה', text: 'שכר? חשבונות? מס? דיווח? חוות דעת?' },
        { icon: '🔗', iconBg: 'rgba(6,182,212,0.15)', title: 'ניתוב ל-OS', text: 'Attendance OS · Guardian Pro · Worklaw · CFO OS · דיווחי מוסדות' },
        { icon: '📄', iconBg: 'rgba(6,182,212,0.15)', title: 'חילוץ מצורפים', text: 'PDF → OCR · XLSX → Parser · JPG → Vision', tags: ['EXTRACTOR'] },
      ]
    },
    {
      num: 3, emoji: '⚙️', title: 'מערכות הפעלה (Operating Systems)',
      subtitle: '7 מערכות מקבילות — כל אחת עם לוגיקה, חוקים, ומנוע משלה',
      color: '#14b8a6',
      details: [
        { icon: '⏰', iconBg: 'rgba(20,184,166,0.15)', title: 'Attendance OS', text: 'מנוע נוכחות — חישוב משמרות, שעות נוספות, חגים', tags: ['OS #1'] },
        { icon: '🏛️', iconBg: 'rgba(20,184,166,0.15)', title: 'Guardian Pro', text: 'דיווח לאפוטרופוס הכללי — מאזן + חוות דעת', tags: ['OS #2'] },
        { icon: '⚖️', iconBg: 'rgba(20,184,166,0.15)', title: 'Worklaw OS', text: 'דיני עבודה — חוות דעת כלכלית + תחשיבים', tags: ['OS #3'] },
        { icon: '📊', iconBg: 'rgba(20,184,166,0.15)', title: 'CFO OS + דיווחי מוסדות', text: 'הנהלת חשבונות + דיווחים שוטפים למוסדות', tags: ['OS #4-5'] },
        { icon: '💰', iconBg: 'rgba(20,184,166,0.15)', title: 'רווח הון + מלחמה', text: 'חישוב מס רווח הון · תביעות פיצויי מלחמה', tags: ['OS #6-7'] },
      ]
    },
    {
      num: 4, emoji: '📤', title: 'שכבת פלט (Output Layer)',
      subtitle: 'תוצרים, מסמכים, דיווחים — חוזרים ללקוח או למוסד',
      color: '#10b981',
      details: [
        { icon: '📄', iconBg: 'rgba(16,185,129,0.15)', title: 'מסמכים (PDF/DOCX)', text: 'חוות דעת · דוחות · מכתבים — מוכנים לחתימה' },
        { icon: '📊', iconBg: 'rgba(16,185,129,0.15)', title: 'תחשיבים (XLSX)', text: 'אקסל מפורט — נספחים לחוות דעת / דוחות' },
        { icon: '✉️', iconBg: 'rgba(16,185,129,0.15)', title: 'מיילים אוטומטיים', text: 'שליחת תוצרים חזרה ללקוח / לעו"ד' },
        { icon: '🏛️', iconBg: 'rgba(16,185,129,0.15)', title: 'דיווח למוסדות', text: 'שידור מקוון: מס הכנסה · מע"מ · ביט"ל' },
      ]
    },
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'קלט → ניתוב → עיבוד → פלט — כל הזרימה אוטומטית מקצה לקצה',
    emphasis: '7 מערכות הפעלה · 50+ סוכנים · 1.25 שניות ממייל לתוצר ✓',
  }
};

// #endregion

// #region Attendance Agents

/** תרשים #11 — מנוע נוכחות — סוכנים */
export const attendanceAgents: FlowchartData = {
  id: 'attendance-agents',
  flowNum: 11,
  badge: 'מערכת הפעלה #1 | Attendance OS · רוביום',
  title: 'מערכת הפעלה — מנוע נוכחות (Agents)',
  subtitle: 'סוכנים · תת-סוכנים · מיומנויות · כלים · עצי החלטות — תבנית אב לכל תהליך במוח של אלדד',
  relatedLinks: [
    { to: '/flow/attendance', label: '⏰ תרשים נוכחות (זרימה)' },
    { to: '/flow/brain-router', label: '🧠 Brain Router' },
  ],
  steps: [
    {
      num: 0, emoji: '🎛️', title: 'סוכן תזמור — Orchestrator Agent',
      subtitle: 'מנהל את כל הזרימה · מנתב בין סוכנים · עוקב אחר סטטוס · מסלים שגיאות לאנושי',
      color: '#6366f1',
      badge: { text: 'תזמור', type: 'ai' },
      details: [
        { icon: '📋', iconBg: 'rgba(99,102,241,0.15)', title: 'זרימת עבודה', text: 'חוזה → משמרות → סיווג → חישוב → סיכום → ציות → ייצוא' },
        { icon: '🔧', iconBg: 'rgba(99,102,241,0.15)', title: 'מיומנויות', text: 'task_routing · state_tracking · error_escalation · human_handoff', tags: ['Message Broker', 'State Store'] },
      ]
    },
    {
      num: 1, emoji: '📋', title: 'סוכן הגדרת חוזה (Contract Setup Agent)',
      subtitle: 'עובד חדש נוסף / חוזה עודכן → מאמת נתונים → AttendanceContract ✓',
      color: '#14b8a6',
      details: [
        { icon: '📥', iconBg: 'rgba(20,184,166,0.15)', title: 'קלט', text: 'Employee ID · סוג שבוע (5/6) · שכר שעתי · מזהה מעסיק · קובץ XLSX' },
        { icon: '📤', iconBg: 'rgba(20,184,166,0.15)', title: 'פלט', text: 'AttendanceContract מאומת ✓' },
        { icon: '🎯', iconBg: 'rgba(20,184,166,0.15)', title: 'מיומנויות', text: 'data_validation · default_assignment · legal_constraint_check · xlsx_parsing', tags: ['HR Database', 'Employee Import Parser'] },
        { icon: '🤖', iconBg: 'rgba(20,184,166,0.15)', title: 'תת-סוכנים', text: 'ImportValidatorSubAgent', tags: ['ImportValidatorSubAgent'] },
      ]
    },
    {
      num: 2, emoji: '⏰', title: 'סוכן קליטת משמרות (Shift Entry Agent)',
      subtitle: 'נתוני משמרת → וידוא · חילוץ · כפילויות → ShiftEntry[] ✓',
      color: '#3b82f6',
      details: [
        { icon: '📥', iconBg: 'rgba(59,130,246,0.15)', title: 'קלט', text: 'שעת התחלה · שעת סיום · דקות הפסקה · מזהה עובד · תאריך' },
        { icon: '📤', iconBg: 'rgba(59,130,246,0.15)', title: 'פלט', text: 'ShiftEntry[] מאומת ✓' },
        { icon: '🎯', iconBg: 'rgba(59,130,246,0.15)', title: 'מיומנויות', text: 'time_parsing · file_extraction · duplicate_detection · data_normalization', tags: ['CSV/XLSX Parser', 'Clock System API'] },
        { icon: '🤖', iconBg: 'rgba(59,130,246,0.15)', title: 'תת-סוכנים', text: 'FileExtractionSubAgent · DuplicateDetectorSubAgent', tags: ['FileExtractionSubAgent', 'DuplicateDetectorSubAgent'] },
      ]
    },
    {
      num: 3, emoji: '📆', title: 'סוכן סיווג יום (Day Classification Agent)',
      subtitle: 'תאריך → לוח עברי → סוג יום: NORMAL/HOLIDAY/EVE/NIGHT/SHABBAT/MEMORIAL',
      color: '#f59e0b',
      details: [
        { icon: '📥', iconBg: 'rgba(245,158,11,0.15)', title: 'קלט', text: 'תאריך · טווח שעות משמרת' },
        { icon: '📤', iconBg: 'rgba(245,158,11,0.15)', title: 'פלט', text: 'סוג יום: NORMAL / HOLIDAY / EVE / NIGHT / SHABBAT / MEMORIAL' },
        { icon: '🎯', iconBg: 'rgba(245,158,11,0.15)', title: 'מיומנויות', text: 'hebrew_calendar_lookup · holiday_matching · night_range_detection · shabbat_detection', tags: ['Israel Holidays DB', 'Hebrew Date Converter'] },
        { icon: '🤖', iconBg: 'rgba(245,158,11,0.15)', title: 'תת-סוכנים', text: 'HebrewCalendarSubAgent', tags: ['HebrewCalendarSubAgent'] },
      ]
    },
    {
      num: 4, emoji: '🧮', title: 'סוכן חישוב משמרת (Shift Calculation Agent)',
      subtitle: 'משמרת מסווגת → מנוע חישוב → ShiftBreakdown: רגילות · OT125 · OT150 · לילה · חג',
      color: '#8b5cf6',
      badge: { text: 'מנוע חישוב', type: 'calc' },
      details: [
        { icon: '📥', iconBg: 'rgba(139,92,246,0.15)', title: 'קלט', text: 'שעות משמרת · סוג יום · פרמטרי חוזה (תקן יומי, תעריף)' },
        { icon: '📤', iconBg: 'rgba(139,92,246,0.15)', title: 'פלט', text: 'ShiftBreakdown: רגילות · OT125 · OT150 · לילה · חג · סה"כ' },
        { icon: '🎯', iconBg: 'rgba(139,92,246,0.15)', title: 'מיומנויות', text: 'formula_engine · overtime_logic · night_hour_calc · holiday_multiplier', tags: ['Calculation Engine', 'Rate Table'] },
        { icon: '🤖', iconBg: 'rgba(139,92,246,0.15)', title: 'תת-סוכנים', text: 'OvertimeSubAgent · NightHoursSubAgent · HolidayPaySubAgent', tags: ['OvertimeSubAgent', 'NightHoursSubAgent'] },
      ]
    },
    {
      num: 5, emoji: '📊', title: 'סוכן סיכום חודשי (Monthly Summary Agent)',
      subtitle: 'כל המשמרות → סיכום חודשי מפורט → MonthlySummary ✓',
      color: '#10b981',
      details: [
        { icon: '📥', iconBg: 'rgba(16,185,129,0.15)', title: 'קלט', text: 'ShiftBreakdown[] · AttendanceContract · תקופה (חודש)' },
        { icon: '📤', iconBg: 'rgba(16,185,129,0.15)', title: 'פלט', text: 'MonthlySummary: ימים, שעות, עלויות, חריגות' },
        { icon: '🎯', iconBg: 'rgba(16,185,129,0.15)', title: 'מיומנויות', text: 'data_aggregation · cost_calculation · anomaly_detection · trend_analysis', tags: ['Summary Dashboard', 'Cost Calculator'] },
        { icon: '🤖', iconBg: 'rgba(16,185,129,0.15)', title: 'תת-סוכנים', text: 'CostCalculatorSubAgent · TrendAnalysisSubAgent', tags: ['CostCalculatorSubAgent'] },
      ]
    },
    {
      num: 6, emoji: '⚖️', title: 'סוכן ציות ויועץ חוקי (Compliance Agent)',
      subtitle: 'בדיקת חוקיות → התראות חריגה → LawAdvisor ✓',
      color: '#f97316',
      badge: { text: 'AI Advisor', type: 'ai' },
      details: [
        { icon: '📥', iconBg: 'rgba(249,115,22,0.15)', title: 'קלט', text: 'MonthlySummary + ConsentRecord + AttendanceContract' },
        { icon: '📤', iconBg: 'rgba(249,115,22,0.15)', title: 'פלט', text: 'ComplianceReport: חריגות · הפניות לחוק · תיקונים נדרשים' },
        { icon: '🎯', iconBg: 'rgba(249,115,22,0.15)', title: 'מיומנויות', text: 'legal_validation · overtime_limit_check · break_compliance · consent_verification', tags: ['Law Database', 'Alert System'] },
        { icon: '🤖', iconBg: 'rgba(249,115,22,0.15)', title: 'תת-סוכנים', text: 'LawAdvisorSubAgent · OvertimeAlertSubAgent', tags: ['LawAdvisorSubAgent'] },
      ]
    },
    {
      num: 7, emoji: '📤', title: 'סוכן ייצוא (Export Agent)',
      subtitle: 'מפיק CSV/PDF לתוכנת שכר + ארכיון',
      color: '#f43f5e',
      details: [
        { icon: '📥', iconBg: 'rgba(244,63,94,0.15)', title: 'קלט', text: 'MonthlySummary + ComplianceReport + רשימת עובדים' },
        { icon: '📤', iconBg: 'rgba(244,63,94,0.15)', title: 'פלט', text: 'CSV לשכר · PDF דוח חודשי · ארכיון אוטומטי' },
        { icon: '🎯', iconBg: 'rgba(244,63,94,0.15)', title: 'מיומנויות', text: 'csv_formatting · pdf_generation · payroll_mapping · file_archiving', tags: ['Payroll Adapter', 'PDF Engine'] },
        { icon: '🤖', iconBg: 'rgba(244,63,94,0.15)', title: 'תת-סוכנים', text: 'PayrollMapperSubAgent · PDFGeneratorSubAgent', tags: ['PayrollMapperSubAgent'] },
      ]
    },
  ],
  result: {
    title: 'תוצאת מערכת ההפעלה',
    text: '7 סוכנים + 15 תת-סוכנים + 28 מיומנויות + עצי החלטות — מנוע נוכחות מלא מקצה לקצה',
    emphasis: 'תבנית אב לכל OS במוח של אלדד — סוכנים, כלים, עצי החלטות ✓',
  }
};

// #endregion
