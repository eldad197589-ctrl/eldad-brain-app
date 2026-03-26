/* ============================================
   FILE: flowcharts-legal.ts
   PURPOSE: Legal & reporting flowchart data (expert opinion, institutional reports)
   DEPENDENCIES: flowchartTypes.ts
   EXPORTS: expertOpinion, institutionalReports
   ============================================ */
import type { FlowchartData } from './flowchartTypes';

// #region Expert Opinion

/** תרשים #7 — חוות דעת כלכלית */
export const expertOpinion: FlowchartData = {
  id: 'expert-opinion',
  flowNum: 7,
  badge: 'תרשים זרימה #6 | חוות דעת · רוביום',
  title: 'חוות דעת כלכלית — דיני עבודה',
  subtitle: 'תהליך עבודה מלא: מקבלת כתב תביעה ועד הגשת חוות דעת חתומה לבית הדין לעבודה',
  relatedLinks: [
    { to: '/flow/worklaw', label: '⚖️ דיני עבודה OS' },
    { to: '/flow/attendance', label: '⏰ מנוע נוכחות' },
  ],
  steps: [
    {
      num: 1, emoji: '📥', title: 'קבלת התיק מעו"ד',
      subtitle: 'קבלת כתב תביעה / כתב הגנה + ייפוי כוח + מסמכים ראשוניים',
      color: '#059669',
      badge: { text: 'משפטי', type: 'law' },
      details: [
        { icon: '📋', iconBg: 'rgba(5,150,105,0.15)', title: 'כתב תביעה / כתב הגנה', text: 'ניתוח הטענות: שעות נוספות, פיצויי פיטורין, דמי הבראה, חגים', tags: ['כתב תביעה.pdf'] },
        { icon: '📎', iconBg: 'rgba(5,150,105,0.15)', title: 'נספחים ותצהירים', text: 'תצהירי עדות ראשית, מסמכים משלימים, כרטסות' },
        { icon: '📝', iconBg: 'rgba(5,150,105,0.15)', title: 'ייפוי כוח', text: 'ייפוי כוח מהלקוח + הסכם שכ"ט חוות דעת' },
      ]
    },
    {
      num: 2, emoji: '📊', title: 'איסוף אסמכתאות שכר',
      subtitle: 'תלושי שכר, טופס 161, דפי בנק, רישומי נוכחות',
      color: '#3b82f6',
      badge: { text: 'אסמכתאות', type: 'done' },
      details: [
        { icon: '📄', iconBg: 'rgba(59,130,246,0.15)', title: 'תלושי שכר', text: 'כל התלושים לתקופת ההעסקה — פירוט רכיבים' },
        { icon: '📋', iconBg: 'rgba(59,130,246,0.15)', title: 'טופס 161 (א/ד/ה)', text: 'פרטי סיום העסקה, פיצויים, קיצבה' },
        { icon: '🏦', iconBg: 'rgba(59,130,246,0.15)', title: 'כרטסות / דפי בנק', text: 'אימות תשלומים בפועל' },
        { icon: '📑', iconBg: 'rgba(59,130,246,0.15)', title: 'הסכם קיבוצי / צו הרחבה', text: 'ענף: בנייה, מזון, מלונאות, ניקיון, שמירה, תעשייה...' },
      ]
    },
    {
      num: 3, emoji: '📕', title: 'זיהוי ההסכם הקיבוצי החל',
      subtitle: '9 ענפים + מגזר ציבורי + חוקת העבודה',
      color: '#f59e0b',
      badge: { text: 'דיני עבודה', type: 'law' },
      details: [
        { icon: '🏗️', iconBg: 'rgba(245,158,11,0.15)', title: 'ענף הבנייה', text: 'שכר תעריפי, תוספת ענפית' },
        { icon: '🛡️', iconBg: 'rgba(245,158,11,0.15)', title: 'שמירה / ניקיון / מלונאות', text: 'תנאים ייחודיים לכל ענף' },
        { icon: '🏭', iconBg: 'rgba(245,158,11,0.15)', title: 'תעשייה / מתכת / עץ / מזון', text: 'הסכמים קיבוציים ייעודיים + צווי הרחבה' },
        { icon: '📖', iconBg: 'rgba(245,158,11,0.15)', title: 'חוקת העבודה', text: 'חלק 1+2 (9.6MB) — המדריך המלא' },
      ]
    },
    {
      num: 4, emoji: '🧮', title: 'בניית תחשיב (XLSX)',
      subtitle: 'טבלת Excel: חישוב כל רכיב — שעות נוספות, פיצויים, הפרשות, הבראה',
      color: '#8b5cf6',
      badge: { text: 'חישוב', type: 'calc' },
      details: [
        { icon: '⏱️', iconBg: 'rgba(139,92,246,0.15)', title: 'שעות נוספות', text: '125% (2 ראשונות) · 150% (מהשלישית)' },
        { icon: '💰', iconBg: 'rgba(139,92,246,0.15)', title: 'פיצויי פיטורין', text: 'משכורת אחרונה × שנות עבודה − הפרשות מעסיק (161ד)' },
        { icon: '🏖️', iconBg: 'rgba(139,92,246,0.15)', title: 'דמי הבראה + חופשה', text: 'ימי הבראה × תעריף · פדיון חופשה' },
        { icon: '📊', iconBg: 'rgba(139,92,246,0.15)', title: 'הפרשות סוציאליות', text: 'פנסיה, קופ"ג, ביטוח מנהלים — האם הופרשו?', tags: ['תחשיב.xlsx'] },
      ],
      formulas: {
        title: '⚡ נוסחאות חישוב מרכזיות',
        lines: [
          { variable: 'severancePay', operator: '=', expression: 'lastSalary × yearsWorked', comment: 'פיצויי פיטורין' },
          { variable: 'netSeverance', operator: '=', expression: 'severancePay - employerDeposits(161d)', comment: 'בניכוי הפרשות' },
          { variable: 'overtimePay', operator: '=', expression: 'Σ(hours125 × rate × 1.25 + hours150 × rate × 1.50)', comment: 'שעות נוספות' },
          { variable: 'recuperation', operator: '=', expression: 'eligibleDays × dailyRate', comment: 'דמי הבראה' },
          { variable: 'pensionGap', operator: '=', expression: 'requiredDeposit - actualDeposit', comment: 'הפרש פנסיוני' },
          { variable: 'totalClaim', operator: '=', expression: 'Σ(allComponents)', comment: 'סה"כ חוות דעת' },
        ]
      }
    },
    {
      num: 5, emoji: '📝', title: 'כתיבת חוות הדעת (DOCX)',
      subtitle: 'מסמך מקצועי: פתיחה, ממצאים, חישובים, סיכום, חתימה',
      color: '#f43f5e',
      badge: { text: 'מסמך', type: 'done' },
      details: [
        { icon: '📄', iconBg: 'rgba(244,63,94,0.15)', title: 'מבנה חוות הדעת', text: '1. פתיחה (מי מבקש, לאיזה בי"ד)<br>2. תיאור ההעסקה<br>3. ממצאים והשוואת זכויות<br>4. תחשיב מפורט<br>5. סיכום + חתימת רו"ח' },
        { icon: '⚖️', iconBg: 'rgba(244,63,94,0.15)', title: 'הפניות לחוק', text: 'חוק פיצויי פיטורים · חוק שעות עבודה · חוק חופשה שנתית · חוק דמי מחלה · צווי הרחבה' },
        { icon: '📎', iconBg: 'rgba(244,63,94,0.15)', title: 'נספחים', text: 'תחשיב Excel · אסמכתאות · טופס 161' },
      ]
    },
    {
      num: 6, emoji: '🔍', title: 'ביקורת ואישור',
      subtitle: 'בדיקה סופית של הנתונים, ההפניות לחוק, והנוסח',
      color: '#06b6d4',
      details: [
        { icon: '✅', iconBg: 'rgba(6,182,212,0.15)', title: 'בדיקת תקינות', text: 'התאמת מספרים בין תחשיב לחוות דעת' },
        { icon: '✍️', iconBg: 'rgba(6,182,212,0.15)', title: 'חתימת רו"ח', text: 'חתימה דיגיטלית + חותמת משרד' },
      ]
    },
    {
      num: 7, emoji: '📤', title: 'הגשה לבית הדין',
      subtitle: 'שליחה לעו"ד → הגשה לבית הדין לעבודה',
      color: '#6366f1',
      details: [
        { icon: '📧', iconBg: 'rgba(99,102,241,0.15)', title: 'שליחה לעו"ד', text: 'חוות דעת + תחשיב + נספחים — במייל' },
        { icon: '📁', iconBg: 'rgba(99,102,241,0.15)', title: 'ארכיון', text: 'שמירה בתיק הלקוח — גישה מהירה לעדכונים' },
      ]
    },
  ],
  decisions: [
    {
      afterStep: 1,
      decision: {
        title: '🔀 מי הלקוח?',
        branches: [
          { label: '👤 צד תובע (עובד)', sub: 'חוות דעת תומכת בתביעה — הוכחת זכויות', type: 'yes' },
          { label: '🏢 צד נתבע (מעסיק)', sub: 'חוות דעת לכתב הגנה — הפרכת טענות', type: 'no' },
        ]
      }
    }
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'חוות דעת כלכלית חתומה + תחשיב XLSX + נספחים — מוכנים להגשה לבית הדין לעבודה',
    emphasis: '9 ענפים · 85+ תיקים · הפניות לחוק עדכניות ✓',
  }
};

// #endregion

// #region Institutional Reports

/** תרשים #9 — דיווחי מוסדות */
export const institutionalReports: FlowchartData = {
  id: 'institutional-reports',
  flowNum: 9,
  badge: 'תרשים זרימה #7 | דיווחי מוסדות · רוביום',
  title: 'דיווחי מוסדות — עץ דיווחים מלא',
  subtitle: 'כל הדיווחים התקופתיים: מס הכנסה · מע"מ · ביטוח לאומי · מקדמות — לוח זמנים + תהליך',
  steps: [
    {
      num: 1, emoji: '📅', title: 'זיהוי מועד דיווח וסוג דוח',
      subtitle: 'חודשי / דו-חודשי / שנתי — לאיזה מוסד? מה הדד ליין?',
      color: '#0ea5e9',
      badge: { text: 'לו"ז', type: 'law' },
      details: [
        { icon: '📆', iconBg: 'rgba(14,165,233,0.15)', title: 'תדירות הדיווח', text: 'חודשי: מע"מ (עוסק מורשה גדול)<br>דו-חודשי: מע"מ (עוסק מורשה קטן)<br>שנתי: דוח שנתי מס הכנסה' },
        { icon: '⏰', iconBg: 'rgba(14,165,233,0.15)', title: 'דד ליין', text: 'מע"מ: 15 לחודש שלאחר תקופת הדיווח<br>ניכויים: 15 לחודש<br>מקדמות: 15 לחודש<br>ביט"ל: 15 לחודש' },
        { icon: '🏢', iconBg: 'rgba(14,165,233,0.15)', title: 'סוג עוסק', text: 'עוסק מורשה · עוסק פטור · חברה<br>כל אחד — לוח דיווחים אחר' },
      ]
    },
    {
      num: 2, emoji: '📊', title: 'ריכוז נתונים לדיווח',
      subtitle: 'איסוף נתוני הכנסות, הוצאות, חשבוניות, תשלומי שכר',
      color: '#f59e0b',
      details: [
        { icon: '🧾', iconBg: 'rgba(245,158,11,0.15)', title: 'חשבוניות מס (עסקאות)', text: 'חשבוניות שהוצאו ללקוחות בתקופה<br>סכום + מע"מ = בסיס לדיווח עסקאות' },
        { icon: '📥', iconBg: 'rgba(245,158,11,0.15)', title: 'חשבוניות תשומות', text: 'חשבוניות ספקים — ניכוי מע"מ תשומות' },
        { icon: '💰', iconBg: 'rgba(245,158,11,0.15)', title: 'נתוני שכר', text: 'סה"כ ברוטו, ניכויים, תשלומי מעסיק<br>לדיווח ניכויים + ביט"ל' },
        { icon: '📋', iconBg: 'rgba(245,158,11,0.15)', title: 'ריכוז ב-Excel', text: 'טבלת ריכוז חודשית / דו-חודשית', tags: ['דיווחי מוסדות 2025.xlsx'] },
      ]
    },
    {
      num: 3, emoji: '📝', title: 'הכנת הדיווח + בקרה',
      subtitle: 'מילוי טפסים, אימות נתונים, בדיקת התאמות',
      color: '#ef4444',
      details: [
        { icon: '✅', iconBg: 'rgba(239,68,68,0.15)', title: 'אימות מול הנה"ח', text: 'הנתונים בדיווח = מה שבספרים?<br>התאמת חשבוניות · מאזן בוחן' },
        { icon: '🔢', iconBg: 'rgba(239,68,68,0.15)', title: 'חישוב מע"מ לתשלום', text: 'עסקאות − תשומות = מע"מ נטו<br>יתרה לתשלום / לזיכוי' },
        { icon: '📊', iconBg: 'rgba(239,68,68,0.15)', title: 'חישוב ניכויים', text: 'מס הכנסה עובדים + ביט"ל עובדים + מעסיק' },
      ]
    },
    {
      num: 4, emoji: '🌐', title: 'הגשה דיגיטלית למוסדות',
      subtitle: 'שידור מקוון לרשות המיסים / ביטוח לאומי',
      color: '#8b5cf6',
      badge: { text: 'שידור', type: 'done' },
      details: [
        { icon: '🖥️', iconBg: 'rgba(139,92,246,0.15)', title: 'מערכת שע"מ', text: 'שידור דיווח מקוון לרשות המיסים<br>מע"מ + ניכויים + מקדמות' },
        { icon: '🏛️', iconBg: 'rgba(139,92,246,0.15)', title: 'ביטוח לאומי', text: 'דיווח על שכר ותשלומי מעסיק<br>טופס 102 / מרכז' },
        { icon: '📤', iconBg: 'rgba(139,92,246,0.15)', title: 'אישור שידור', text: 'קבלת אישור שידור + מספר אסמכתא' },
      ]
    },
    {
      num: 5, emoji: '💳', title: 'ביצוע תשלום',
      subtitle: 'תשלום המס באמצעות שובר / העברה בנקאית / הרשאה',
      color: '#10b981',
      details: [
        { icon: '🏦', iconBg: 'rgba(16,185,129,0.15)', title: 'אמצעי תשלום', text: 'הרשאה לחיוב · מס"ב · שובר בנק · כ"א<br>תשלום עד ה-15 לחודש' },
        { icon: '📋', iconBg: 'rgba(16,185,129,0.15)', title: 'אישור תשלום', text: 'שמירת אסמכתא תשלום + עדכון ב-Excel' },
      ]
    },
    {
      num: 6, emoji: '🗂️', title: 'ארכיון + מעקב שנתי',
      subtitle: 'שמירת כל הדיווחים + מעקב רציף + דוח שנתי מסכם',
      color: '#6366f1',
      details: [
        { icon: '📁', iconBg: 'rgba(99,102,241,0.15)', title: 'ארכיון דיווחים', text: 'קובץ Excel שנתי — כל הדיווחים', tags: ['דיווחי מוסדות 2017-2025.xlsx'] },
        { icon: '📊', iconBg: 'rgba(99,102,241,0.15)', title: 'דוח שנתי מרכז', text: 'ריכוז שנתי: 856/857 + דוח מס הכנסה<br>התאמות מע"מ מול מס הכנסה' },
        { icon: '🔄', iconBg: 'rgba(99,102,241,0.15)', title: 'מחזור חודשי', text: 'חוזרים לשלב 1 בתחילת כל חודש' },
      ]
    },
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'דיווח שוטף לכל המוסדות — בזמן, מדויק, עם אסמכתאות',
    emphasis: 'מע"מ ✓ · מס הכנסה ✓ · ביטוח לאומי ✓ · מקדמות ✓ · דוח שנתי ✓',
  }
};

// #endregion
