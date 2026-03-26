/* ============================================
   FILE: flowcharts-tax.ts
   PURPOSE: Tax-related flowchart data (capital gains, war compensation, declaration of capital, penalty cancellation)
   DEPENDENCIES: flowchartTypes.ts
   EXPORTS: capitalGains, warCompensation, declarationOfCapital, penaltyCancellation
   ============================================ */
import type { FlowchartData } from './flowchartTypes';

// #region Capital Gains

/** תרשים #1 — חישוב רווח הון ממכירת נכס בחו"ל */
export const capitalGains: FlowchartData = {
  id: 'capital-gains',
  flowNum: 1,
  badge: 'תרשים זרימה #1 | המוח של אלדד · רוביום',
  title: 'חישוב רווח הון ממכירת נכס בחו"ל',
  subtitle: 'סעיף 91 לפקודת מס הכנסה — תהליך מלא מאיסוף נתונים ועד אריזת תיק דיגיטלי',
  relatedLinks: [
    { to: '/calculator', label: '🧮 המחשבון' },
    { to: '/case/halman', label: '📁 התיק' },
  ],
  steps: [
    {
      num: 1, emoji: '📥', title: 'איסוף נתונים ואסמכתאות',
      subtitle: 'קבלת מסמכי מקור מהלקוח וממקורות חיצוניים',
      color: '#3b82f6',
      badge: { text: '✓ הושלם', type: 'done' },
      details: [
        { icon: '📄', iconBg: 'rgba(59,130,246,0.15)', title: 'מסמכי רכישה', text: 'חוזה רכישה, Purchase Summary, חשבונית ייעוץ', tags: ['מסמך רכישה עמ\' 1-10'] },
        { icon: '📄', iconBg: 'rgba(59,130,246,0.15)', title: 'מסמכי מכירה', text: 'Closing Disclosure, Closing Cost Details, FIRPTA', tags: ['מסמך מכירה עמ\' 1-10'] },
        { icon: '📊', iconBg: 'rgba(59,130,246,0.15)', title: 'דוחות מס ארה"ב', text: 'Schedule E (2020-2025) — פירוט פחת שנתי', tags: ['Schedule E שורה 18'] },
        { icon: '💱', iconBg: 'rgba(59,130,246,0.15)', title: 'שערי חליפין ומדדים', text: 'שער $ ליום הרכישה (3.6249) וליום המכירה (3.2727)<br>מדד לצרכן: 33.569 → 40.111' },
      ]
    },
    {
      num: 2, emoji: '🔍', title: 'מחקר משפטי-מיסויי',
      subtitle: 'ניתוח סעיפי חוק, אמנות מס, ופסיקה רלוונטית',
      color: '#8b5cf6',
      badge: { text: '✓ הושלם', type: 'done' },
      details: [
        { icon: '⚖️', iconBg: 'rgba(139,92,246,0.15)', title: 'סעיפי פקודת מס הכנסה', text: 'סעיף 88 — הגדרות נכס<br>סעיף 91 — חישוב רווח הון מקרקעין בחו"ל<br>סעיף 21(א) — ניכוי פחת ממחיר מקור<br>סעיפים 199-210 — זיכוי מסי חוץ' },
        { icon: '🌐', iconBg: 'rgba(139,92,246,0.15)', title: 'אמנת מס ישראל-ארה"ב', text: 'מתירה זיכוי מס זר. ה-FIRPTA (15% ניכוי במקור) ניתן לזיכוי כנגד חבות המס הישראלית' },
        { icon: '🔬', iconBg: 'rgba(139,92,246,0.15)', title: 'מחקר פחת ספציפי', text: 'חישוב פחת נכס מקרקעין בחו"ל — השוואת שיטות ישראליות מול אמריקאיות' },
        { icon: '📐', iconBg: 'rgba(139,92,246,0.15)', title: 'בחינת חלופות', text: 'חלופה A: ללא פחת | חלופה B: עם פחת לפי דוחות<br>ניתוח איזה מסלול מיטיב עם הנישום' },
      ]
    },
    {
      num: 3, emoji: '📋', title: 'בניית נייר עבודה',
      subtitle: 'מבנה מסודר עם שדות אינטראקטיביים ואינפוטים',
      color: '#06b6d4',
      badge: { text: '✓ הושלם', type: 'done' },
      details: [
        { icon: '👤', iconBg: 'rgba(6,182,212,0.15)', title: 'א. פרטי מוכרים והנכס', text: 'שמות, ת.ז., כתובת הנכס, סוג, שימוש, תקופת החזקה, חלקי בעלות (50%/50%)' },
        { icon: '💰', iconBg: 'rgba(6,182,212,0.15)', title: 'ב. נתוני רכישה ומכירה', text: 'מחירים, הוצאות, שערים, מדדים — כל שדה ניתן לעריכה עם הפניה לאסמכתא' },
        { icon: '📉', iconBg: 'rgba(6,182,212,0.15)', title: 'ג. לוח פחת מפורט', text: 'פחת שנתי לפי שנה (2018-2025), מקור (Schedule E / הערכה), סה"כ מצטבר' },
        { icon: '📊', iconBg: 'rgba(6,182,212,0.15)', title: 'פירוט הוצאות מכירה', text: '10 סעיפים: עמלות מתווך, נאמנות, מסמכים, מדידה, FIRPTA — סה"כ $34,915.11' },
      ]
    },
    {
      num: 4, emoji: '🧮', title: 'חישוב רב-חלופות',
      subtitle: 'מנוע חישוב אינטראקטיבי — סעיף 91 לפקודה',
      color: '#10b981',
      badge: { text: '✓ הושלם', type: 'done' },
      details: [
        { icon: '🅰️', iconBg: 'rgba(16,185,129,0.15)', title: 'חלופה A: ללא פחת', text: 'תמורה נטו − עלות רכישה = רווח הון נומינלי<br>המרה ל-₪ → ניכוי אינפלציה → רווח ריאלי' },
        { icon: '🅱️', iconBg: 'rgba(16,185,129,0.15)', title: 'חלופה B: עם פחת (מומלצת)', text: 'עלות מתואמת = עלות רכישה − פחת מצטבר<br>רווח גדול יותר אך FIRPTA מכסה' },
      ],
      formulas: {
        title: '⚡ פורמולות חישוב מרכזיות',
        lines: [
          { variable: 'netProceeds', operator: '=', expression: 'salePrice − saleExpenses', comment: 'תמורה נטו' },
          { variable: 'adjustedBasis', operator: '=', expression: '(purchasePrice + expenses) − depreciation', comment: 'עלות מתואמת' },
          { variable: 'nominalGain_ILS', operator: '=', expression: '(netProceeds × saleRate) − (adjustedBasis × purchaseRate)', comment: 'רווח נומינלי' },
          { variable: 'inflationFactor', operator: '=', expression: 'saleCPI ÷ purchaseCPI', comment: 'מקדם אינפלציה' },
          { variable: 'realGain', operator: '=', expression: 'nominalGain_ILS − max(0, inflationary)', comment: 'רווח הון ריאלי' },
          { variable: 'israelTax', operator: '=', expression: 'realGain × 0.25', comment: 'מס 25% - סעיף 91(ב)(1)' },
          { variable: 'firptaCredit', operator: '=', expression: 'min(firptaAmount × firptaRate, israelTax)', comment: 'זיכוי מס זר' },
          { variable: 'additionalTax', operator: '=', expression: 'max(0, israelTax − firptaCredit)', comment: 'מס נוסף לתשלום' },
        ]
      }
    },
    {
      num: 5, emoji: '📄', title: 'סימולציית טפסים רשמיים',
      subtitle: 'הדמיית טופס 1399 — שומה עצמית',
      color: '#f59e0b',
      badge: { text: '✓ הושלם', type: 'done' },
      details: [
        { icon: '📋', iconBg: 'rgba(245,158,11,0.15)', title: 'מיפוי שדות טופס 1399', text: 'שדה 15: התמורה | שדה 20: עלות (מחיר מקורי)<br>שדה 40: פחת שנצבר | שדה 9: יתרת מחיר מקורי<br>שדה 17: רווח/הפסד הון | שדה 23: רווח הון ריאלי' },
        { icon: '📅', iconBg: 'rgba(245,158,11,0.15)', title: 'לוחות זמנים לדיווח', text: '30 ימים מיום המכירה / עד 30/4/2026<br>שיעור מס: 25% (רווח הון ריאלי - יחיד)' },
      ]
    },
    {
      num: 6, emoji: '📤', title: 'הפקת תוצרים מקצועיים',
      subtitle: 'מכתבים, דוחות, וסיכומים ללקוח ולגורמים חיצוניים',
      color: '#ef4444',
      badge: { text: '✓ הושלם', type: 'done' },
      details: [
        { icon: '✉️', iconBg: 'rgba(239,68,68,0.15)', title: 'מכתב לבנק', text: 'מכתב מקצועי לשחרור כספים — עיצוב פרימיום עם לוגו משרד, פס זהב, וחתימה דיגיטלית' },
        { icon: '🏷️', iconBg: 'rgba(239,68,68,0.15)', title: 'באנר סיכום', text: 'ירוק = "אין מס נוסף לתשלום" ✓<br>אדום = "יש מס נוסף: ₪XX,XXX" ⚠️' },
        { icon: '👥', iconBg: 'rgba(239,68,68,0.15)', title: 'חלוקה לפי מוכרים', text: 'חישוב אישי לכל בעל זכויות: רווח הון, מס, זיכוי, ומס נוסף — לפי % בעלות' },
        { icon: '📊', iconBg: 'rgba(239,68,68,0.15)', title: 'שערי חליפין ופרטי דיווח', text: 'כרטיסיות ויזואליות: שער רכישה, שער מכירה, שינוי %, טפסים, מועדי הגשה' },
      ]
    },
    {
      num: 7, emoji: '📦', title: 'אריזת תיק דיגיטלי',
      subtitle: 'ארגון כל המסמכים בתיקייה מוגמרת — מוכנה לשליחה',
      color: '#6366f1',
      badge: { text: '✓ הושלם', type: 'done' },
      details: [
        { icon: '📁', iconBg: 'rgba(99,102,241,0.15)', title: 'תיק_דיגיטלי_מכירת_נכס_חול_2025/', text: '1. מכתב_לבנק.html — מכתב שחרור כספים<br>2. נייר_עבודה_רווח_הון.docx<br>3. חישוב_רווח_הון_וטופס_1399.html<br>4. אסמכתאות רכישה + מכירה<br>5. הודעה_על_מכירה_ושומה.pdf<br>6. README.txt — תוכן עניינים' },
        { icon: '✅', iconBg: 'rgba(99,102,241,0.15)', title: 'צ\'קליסט נושאים שטופלו', text: '✓ נייר עבודה — סעיף 91<br>✓ טופס 1399 — סימולציה<br>✓ מכתב לבנק — שחרור כספים<br>✓ אסמכתאות — רכישה, מכירה, שומה' },
      ]
    },
  ],
  decisions: [
    {
      afterStep: 4,
      decision: {
        title: 'נקודת החלטה',
        question: 'האם יש מס נוסף לתשלום בישראל? (israelTax > firptaCredit)',
        branches: [
          { label: '✅ לא — FIRPTA מכסה', sub: 'אין מס נוסף', type: 'yes' },
          { label: '⚠️ כן — יש חבות', sub: 'דרוש תשלום נוסף', type: 'no' },
        ]
      }
    }
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'תיק דיגיטלי מלא: נייר עבודה + טופס 1399 + מכתב לבנק + אסמכתאות — מוכן לשליחה ✓',
    emphasis: 'חלופה B מומלצת — FIRPTA מכסה את חבות המס הישראלית',
  }
};

// #endregion

// #region War Compensation

/** תרשים #8 — פיצויי מלחמה */
export const warCompensation: FlowchartData = {
  id: 'war-compensation',
  flowNum: 8,
  badge: 'תרשים זרימה #4 | פיצויי מלחמה · רוביום',
  title: 'פיצויי מלחמה — מס רכוש ונזקי מלחמה',
  subtitle: 'תהליך מלא: מאיסוף אסמכתאות ועד הגשת תביעה לרשות המיסים — חרבות ברזל + צוק איתן',
  steps: [
    {
      num: 1, emoji: '🔍', title: 'בדיקת זכאות ותושבות',
      subtitle: 'האם הלקוח עונה על תנאי הסף — יישוב ספר, תושבות, עסק פעיל',
      color: '#ef4444',
      badge: { text: 'תנאי סף', type: 'law' },
      details: [
        { icon: '📍', iconBg: 'rgba(239,68,68,0.15)', title: 'תושבות ביישוב ספר', text: 'בדיקה: האם העיר הוכרזה כיישוב ספר ע"י שר האוצר' },
        { icon: '🏢', iconBg: 'rgba(239,68,68,0.15)', title: 'משרד/עסק פיזי באזור', text: 'תנאי: עסק פעיל באזור הפגיעה' },
        { icon: '📋', iconBg: 'rgba(239,68,68,0.15)', title: 'רישיון/אישור עוסק', text: 'רישיון תיווך, תעודת רו"ח, רישום עסק' },
        { icon: '📅', iconBg: 'rgba(239,68,68,0.15)', title: 'תקופת הפגיעה', text: 'חרבות ברזל: 7.10.2023 ואילך\nצוק איתן: יולי-אוגוסט 2014' },
      ]
    },
    {
      num: 2, emoji: '📥', title: 'איסוף אסמכתאות ונתונים',
      subtitle: 'ריכוז כל החומר: מחזורים, חשבוניות, עסקאות, התכתבויות',
      color: '#f59e0b',
      badge: { text: 'אסמכתאות', type: 'done' },
      details: [
        { icon: '📊', iconBg: 'rgba(245,158,11,0.15)', title: 'דוחות מחזורים', text: 'מחזור עסקי לתקופה > מחזור ממוצע' },
        { icon: '🧾', iconBg: 'rgba(245,158,11,0.15)', title: 'חשבוניות מס', text: 'חשבוניות שהוצאו לפני/אחרי המלחמה' },
        { icon: '💬', iconBg: 'rgba(245,158,11,0.15)', title: 'יומן עסקאות + התכתבויות', text: 'הוכחת עסקאות שנפגעו: מסרים, הסכמים, רישום בזמן אמת' },
        { icon: '📄', iconBg: 'rgba(245,158,11,0.15)', title: 'מסמכים תומכים', text: 'ספר עסקאות, חלופת מסחרית, רישיון עסק, תצהיר' },
      ]
    },
    {
      num: 3, emoji: '🧮', title: 'חישוב הפסד (XLS)',
      subtitle: 'טבלת אקסל: מחזור רגיל מול מחזור נפגע = הפסד הכנסה',
      color: '#3b82f6',
      badge: { text: 'חישוב', type: 'calc' },
      details: [
        { icon: '📈', iconBg: 'rgba(59,130,246,0.15)', title: 'מחזור תקופה "רגילה"', text: 'ממוצע מחזורים לפני המלחמה — תקופת ייחוס' },
        { icon: '📉', iconBg: 'rgba(59,130,246,0.15)', title: 'מחזור תקופת מלחמה', text: 'מחזור בפועל בתקופת הפגיעה' },
        { icon: '💰', iconBg: 'rgba(59,130,246,0.15)', title: 'חישוב הפרש', text: 'מחזור רגיל − מחזור נפגע = הפסד ישיר, בניכוי הוצאות שנחסכו' },
        { icon: '🔗', iconBg: 'rgba(59,130,246,0.15)', title: 'עסקאות ספציפיות (מסלול אדום)', text: 'פירוט כל עסקה שנפגעה: סכום, שלב, סיבת הביטול' },
      ],
      formulas: {
        title: '⚡ נוסחאות חישוב הפסד',
        lines: [
          { variable: 'avgTurnover', operator: '=', expression: 'Σ(monthlyTurnovers) / referenceMonths', comment: 'ממוצע מחזור רגיל' },
          { variable: 'warTurnover', operator: '=', expression: 'Σ(warPeriodTurnovers)', comment: 'מחזור בתקופת מלחמה' },
          { variable: 'grossLoss', operator: '=', expression: 'avgTurnover - warTurnover', comment: 'הפסד גולמי' },
          { variable: 'savedExpenses', operator: '=', expression: 'expenses × savingsRate', comment: 'הוצאות שנחסכו' },
          { variable: 'netLoss', operator: '=', expression: 'grossLoss - savedExpenses', comment: 'הפסד נקי = סכום תביעה' },
          { variable: 'directLoss', operator: '=', expression: 'Σ(cancelledDeals × dealCommission)', comment: 'מסלול אדום — עסקאות שבוטלו' },
        ]
      }
    },
    {
      num: 4, emoji: '⚖️', title: 'בניית טיעון משפטי',
      subtitle: 'הכנת נימוקים משפטיים מובנים — תושבות, נזק, תקדימים',
      color: '#8b5cf6',
      badge: { text: 'משפטי', type: 'law' },
      details: [
        { icon: '📍', iconBg: 'rgba(139,92,246,0.15)', title: 'סעיף 1: תושבות ומיקום', text: 'תושב יישוב ספר, משרד עסקי באזור, נכסים ביישוב' },
        { icon: '📋', iconBg: 'rgba(139,92,246,0.15)', title: 'סעיף 2: הוכחת היקף הנזק', text: 'עסקאות בשלות שנפגעו, תיעוד בזמן אמת, חשבוניות' },
        { icon: '⚖️', iconBg: 'rgba(139,92,246,0.15)', title: 'סעיף 3: מניע אישי ≠ שלילת פיצוי', text: 'ע"א 749/87 — "המבחן אובייקטיבי-כלכלי"' },
        { icon: '🏢', iconBg: 'rgba(139,92,246,0.15)', title: 'סעיף 4: פגיעה בפעילות', text: 'לא ניתן לעבוד ממקום אחר — נכסים בעיר, לקוחות פונו' },
      ]
    },
    {
      num: 5, emoji: '✉️', title: 'כתיבת מכתב רשמי לרשות המיסים',
      subtitle: 'מכתב מובנה: 7 סעיפים + סיכום + חתימת רו"ח',
      color: '#10b981',
      badge: { text: 'מכתב', type: 'done' },
      details: [
        { icon: '📝', iconBg: 'rgba(16,185,129,0.15)', title: 'מבנה המכתב', text: '7 סעיפי נימוק מובנים + טבלת סיכום הפסדים + חתימה' },
        { icon: '📊', iconBg: 'rgba(16,185,129,0.15)', title: 'טבלת סיכום', text: 'פירוט: עסקאות שנפגעו, סכומים, סה"כ תביעה' },
      ]
    },
    {
      num: 6, emoji: '📤', title: 'הגשה לרשות המיסים',
      subtitle: 'הגשת התביעה במערכת מקוונת / דואר',
      color: '#f97316',
      details: [
        { icon: '🌐', iconBg: 'rgba(249,115,22,0.15)', title: 'הגשה מקוונת', text: 'מערכת מס רכוש — הגשת תביעה דיגיטלית' },
        { icon: '📋', iconBg: 'rgba(249,115,22,0.15)', title: 'מעקב סטטוס', text: 'מעקב אחר התביעה + דיון + ערר (אם נדרש)' },
      ]
    },
  ],
  decisions: [
    {
      afterStep: 2,
      decision: {
        title: '🔀 בחירת מסלול פיצוי — איזה מסלול מתאים?',
        branches: [
          { label: '🔴 מסלול אדום', sub: 'נזק ישיר מוכח — עסקאות ספציפיות שנפגעו', type: 'no' },
          { label: '🟢 מסלול מחזורים', sub: 'ירידה במחזור העסקי — השוואת מחזורים', type: 'yes' },
          { label: '🟠 מסלול משולב', sub: 'שילוב מסלולים — אדום + רכיבי מחזורים', type: 'neutral' },
        ]
      }
    }
  ],
  result: {
    title: 'תוצאת התהליך',
    text: 'תביעת פיצויי מלחמה מלאה: חישוב הפסד + טיעון משפטי + מכתב רשמי — מוגשת לרשות המיסים',
    emphasis: 'חרבות ברזל + צוק איתן · 3 מסלולי פיצוי · תקדימים משפטיים ✓',
  }
};

// #endregion

// #region Declaration of Capital

/** תרשים #12 — הצהרת הון */
export const declarationOfCapital: FlowchartData = {
  id: 'declaration-of-capital',
  flowNum: 12,
  badge: 'תרשים זרימה #12 | הצהרת הון · רוביום',
  title: 'הצהרת הון — תהליך מלא',
  subtitle: 'איסוף מסמכים, קליטת נתונים, בדיקת הצהרה קודמת, ניתוח שינויים בהון — קביעון דוד אלדד רו"ח',
  relatedLinks: [
    { to: '/clients', label: '👥 לקוחות' },
  ],
  steps: [
    {
      num: 1, emoji: '📩', title: 'קבלת דרישה מרשות המסים',
      subtitle: 'הלקוח מקבל הודעה / מייל מפקיד שומה — דרישה להגשת הצהרת הון',
      color: '#f59e0b',
      badge: { text: 'טריגר', type: 'law' },
      details: [
        { icon: '📬', iconBg: 'rgba(245,158,11,0.15)', title: 'ערוצי קבלת הדרישה', text: 'מייל מהלקוח, הודעה באיזור האישי, שיחת טלפון, הפניה מרו"ח אחר', tags: ['סעיף 135 לפקודה'] },
        { icon: '📋', iconBg: 'rgba(245,158,11,0.15)', title: 'פתיחת תיק', text: 'רישום בכרטיס לקוח, בדיקת לוחות זמנים, קביעת תאריך יעד להגשה', tags: ['30 יום מקבלת הדרישה'] },
        { icon: '🤝', iconBg: 'rgba(245,158,11,0.15)', title: 'תקשורת ראשונית עם הלקוח', text: 'שליחת רשימת מסמכים נדרשים, תיאום פגישה/שיחה ראשונית, הסבר על התהליך' },
        { icon: '📄', iconBg: 'rgba(245,158,11,0.15)', title: 'הצעת מחיר', text: 'הפקת הצעת מחיר מהמערכת (מודל קליטת לקוח חדש), אישור תנאי התקשרות' },
      ]
    },
    {
      num: 2, emoji: '📥', title: 'איסוף מסמכים מהלקוח',
      subtitle: 'קבלת כל המסמכים הנדרשים - נכסים, התחייבויות, הכנסות, הוצאות',
      color: '#3b82f6',
      details: [
        { icon: '🏦', iconBg: 'rgba(59,130,246,0.15)', title: 'דפי בנק ופיקדונות', text: 'אישורי יתרות מכל הבנקים ליום הקובע, פיקדונות, חסכונות, קרנות נאמנות', tags: ['ליום 31/12'] },
        { icon: '🏠', iconBg: 'rgba(59,130,246,0.15)', title: 'נכסי מקרקעין', text: 'נסח טאבו, חוזי רכישה, שומות מס שבח, היטלי השבחה, הלוואות משכנתא' },
        { icon: '🚗', iconBg: 'rgba(59,130,246,0.15)', title: 'כלי רכב ונכסים נוספים', text: 'רישיון רכב, חוזי ליסינג, ניירות ערך, מניות, קרנות פנסיה, ביטוחי חיים' },
        { icon: '💳', iconBg: 'rgba(59,130,246,0.15)', title: 'התחייבויות וחובות', text: 'אישורי משכנתא, הלוואות בנקאיות, כרטיסי אשראי, חובות אחרים', tags: ['כולל ערבויות'] },
        { icon: '📊', iconBg: 'rgba(59,130,246,0.15)', title: 'הכנסות שנתיות', text: 'טופס 106, דוחות שנתיים, הכנסות משכירות, דיבידנדים, רווחי הון' },
        { icon: '🧾', iconBg: 'rgba(59,130,246,0.15)', title: 'הוצאות מחייה ואחרות', text: 'הוצאות שוטפות, שכר דירה, חינוך, בריאות, ביטוחים, תרומות' },
      ]
    },
    {
      num: 3, emoji: '📋', title: 'קליטת נתונים למערכת',
      subtitle: 'הזנת כל המידע לנייר עבודה מסודר — טבלאות נכסים והתחייבויות',
      color: '#8b5cf6',
      details: [
        { icon: '📑', iconBg: 'rgba(139,92,246,0.15)', title: 'טבלת נכסים', text: 'מקרקעין, רכבים, ניירות ערך, פיקדונות, קרנות, ביטוחי חיים — עם שווי ליום הקובע' },
        { icon: '📑', iconBg: 'rgba(139,92,246,0.15)', title: 'טבלת התחייבויות', text: 'משכנתאות, הלוואות, חובות כרטיסי אשראי, ערבויות — עם יתרה ליום הקובע' },
        { icon: '🧮', iconBg: 'rgba(139,92,246,0.15)', title: 'חישוב הון נקי', text: 'סה"כ נכסים − סה"כ התחייבויות = הון נקי', tags: ['ליום הקובע'] },
        { icon: '✅', iconBg: 'rgba(139,92,246,0.15)', title: 'אימות צולב', text: 'השוואת נתונים מול אסמכתאות — כל שורה חייבת הפניה למסמך מקור' },
      ]
    },
    {
      num: 4, emoji: '🔍', title: 'בדיקת הצהרת הון קודמת',
      subtitle: 'השוואה להצהרה קודמת — בדיקת עקביות ושינויים',
      color: '#06b6d4',
      details: [
        { icon: '📂', iconBg: 'rgba(6,182,212,0.15)', title: 'אחזור הצהרה קודמת', text: 'מציאת ההצהרה האחרונה מהתיק, זיהוי תאריך הקובע הקודם, בדיקת הון נקי קודם' },
        { icon: '📊', iconBg: 'rgba(6,182,212,0.15)', title: 'טבלת השוואה', text: 'הצבת הנתונים זה מול זה — הצהרה קודמת vs. הצהרה נוכחית', tags: ['נכסים + התחייבויות + הון נקי'] },
        { icon: '🔎', iconBg: 'rgba(6,182,212,0.15)', title: 'זיהוי פערים', text: 'נכסים שנעלמו, נכסים חדשים שהופיעו, שינויים חריגים בערכים, התחייבויות שנסגרו' },
      ]
    },
    {
      num: 5, emoji: '📈', title: 'ניתוח שינויים בהון',
      subtitle: 'הסבר על כל שינוי בהון — הכנסות, הוצאות מחייה, רכישות, מכירות',
      color: '#10b981',
      details: [
        { icon: '💰', iconBg: 'rgba(16,185,129,0.15)', title: 'מקורות עליית ההון', text: 'הכנסות מעבודה (נטו), רווחי הון, הכנסות שכירות, ירושות/מתנות, תשואות השקעה' },
        { icon: '🏠', iconBg: 'rgba(16,185,129,0.15)', title: 'הוצאות מחייה', text: 'הוצאות שנתיות: מגורים, חינוך, בריאות, מזון, בילויים, ביטוחים, רכב — מול גודל משפחה', tags: ['טבלת מחייה סבירה'] },
        { icon: '📐', iconBg: 'rgba(16,185,129,0.15)', title: 'נוסחת האיזון', text: 'הון נקי נוכחי = הון קודם + הכנסות נטו − הוצאות מחייה ± שינויי ערך נכסים', tags: ['חייב להתאזן!'] },
        { icon: '⚠️', iconBg: 'rgba(16,185,129,0.15)', title: 'זיהוי חריגות', text: 'עלייה בהון שאינה מוסברת מההכנסות? צריך לחפש מקור: ירושה, מתנה, הלוואה, רווח הון' },
      ],
      formulas: {
        title: '⚡ נוסחת איזון הצהרת הון',
        lines: [
          { variable: 'currentEquity', operator: '=', expression: 'Σ(assets) − Σ(liabilities)', comment: 'הון נקי נוכחי' },
          { variable: 'previousEquity', operator: '=', expression: 'הצהרה קודמת', comment: 'הון נקי קודם' },
          { variable: 'equityChange', operator: '=', expression: 'currentEquity − previousEquity', comment: 'שינוי בהון' },
          { variable: 'explainedChange', operator: '=', expression: 'netIncome − livingExpenses ± assetChanges', comment: 'שינוי מוסבר' },
          { variable: 'unexplainedGap', operator: '=', expression: 'equityChange − explainedChange', comment: 'פער לא מוסבר (חייב = 0!)' },
        ]
      }
    },
    {
      num: 6, emoji: '🔬', title: 'ביקורת ובדיקה סופית',
      subtitle: 'ביקורת הנתונים, בדיקת סבירות, חתימת רו"ח',
      color: '#ef4444',
      details: [
        { icon: '✅', iconBg: 'rgba(239,68,68,0.15)', title: 'צ\'קליסט ביקורת', text: 'כל שורה מגובה באסמכתא? ✓<br>נוסחת האיזון מתאזנת? ✓<br>רמת מחייה סבירה? ✓<br>אין פערים לא מוסברים? ✓' },
        { icon: '👤', iconBg: 'rgba(239,68,68,0.15)', title: 'פגישה סופית עם הלקוח', text: 'הצגת הטיוטה, השלמת פערים, קבלת חתימה על הצהרה', tags: ['הלקוח חותם'] },
        { icon: '📝', iconBg: 'rgba(239,68,68,0.15)', title: 'חתימת רו"ח', text: 'חתימה וחותמת רו"ח על ההצהרה — אישור שהנתונים נבדקו ואומתו' },
      ]
    },
    {
      num: 7, emoji: '📤', title: 'הגשה לרשות המסים',
      subtitle: 'הגשת ההצהרה למס הכנסה — דיגיטלית או ידנית',
      color: '#d946ef',
      details: [
        { icon: '💻', iconBg: 'rgba(217,70,239,0.15)', title: 'הגשה דיגיטלית', text: 'הגשה דרך מערכת שע"מ — מילוי טופס 1219, צירוף אסמכתאות, אישור שליחה' },
        { icon: '📮', iconBg: 'rgba(217,70,239,0.15)', title: 'הגשה אישית / דואר', text: 'הגשה לפקיד שומה אזורי — עותק חתום + אסמכתאות מקוריות + אישור קבלה' },
        { icon: '📧', iconBg: 'rgba(217,70,239,0.15)', title: 'עדכון הלקוח', text: 'שליחת עותק ללקוח, סיכום התהליך, המלצות להצהרה הבאה' },
      ]
    },
    {
      num: 8, emoji: '📦', title: 'אריזת תיק דיגיטלי',
      subtitle: 'ארגון כל המסמכים בתיק מוגמר — מוכן לביקורת עתידית',
      color: '#6366f1',
      details: [
        { icon: '📁', iconBg: 'rgba(99,102,241,0.15)', title: 'מבנה תיק דיגיטלי', text: '1. הצהרת_הון_חתומה.pdf<br>2. טבלת_נכסים_והתחייבויות.xlsx<br>3. השוואה_להצהרה_קודמת.xlsx<br>4. ניתוח_שינויים_בהון.pdf<br>5. אסמכתאות/<br>6. אישור_הגשה_שעמ.pdf' },
        { icon: '🔒', iconBg: 'rgba(99,102,241,0.15)', title: 'שמירה ארכיונית', text: 'תיק נשמר ל-7 שנים (תקופת התיישנות)', tags: ['סעיף 145 לפקודה'] },
      ]
    },
  ],
  decisions: [
    {
      afterStep: 4,
      decision: {
        title: 'נקודת החלטה',
        question: 'האם זו הצהרת הון ראשונה או יש הצהרה קודמת?',
        branches: [
          { label: '📄 ראשונה', sub: 'ללא השוואה — נתונים בסיסיים בלבד', type: 'yes' },
          { label: '🔁 יש קודמת', sub: 'צריך ניתוח שינויים מפורט', type: 'no' },
        ]
      }
    }
  ],
  result: {
    title: 'הצהרת הון מאומתת ומגובה',
    text: 'כל שורה מגובה באסמכתא · נוסחת האיזון מתאזנת · חתימת לקוח + רו"ח · הוגש לפקיד שומה',
    emphasis: 'קביעון דוד אלדד רו"ח — תהליך הצהרת הון מקצה לקצה ✓',
  }
};

// #endregion

// #region Penalty Cancellation

/** תרשים #14 — ביטול קנסות */
export const penaltyCancellation: FlowchartData = {
  id: 'penalty-cancellation',
  flowNum: 14,
  badge: 'תרשים זרימה #14 | ביטול קנסות · רוביום',
  title: 'ביטול קנסות מס הכנסה — תהליך מלא',
  subtitle: 'מהודעת לקוח ועד סגירת חוב — 9 שלבים · צבא סוכנים · בוט בדיקות · מקרה אמיתי: דוד שמעון 2023-2024',
  relatedLinks: [
    { to: '/clients', label: '👥 לקוחות' },
    { to: '/flow/declaration-of-capital', label: '📜 הצהרת הון' },
  ],
  steps: [
    {
      num: 1, emoji: '🚨', title: 'קבלת הודעה מהלקוח',
      subtitle: 'הלקוח מקבל מכתב חוב / הודעה ושולח לאלדד — פתיחת טיפול',
      color: '#ef4444',
      badge: { text: 'טריגר', type: 'law' },
      details: [
        { icon: '📩', iconBg: 'rgba(239,68,68,0.15)', title: 'ערוצי קבלה', text: 'WhatsApp מהלקוח, מכתב רשות המיסים, הודעה באזור אישי', tags: ['📥 סוכן איסוף'] },
        { icon: '📞', iconBg: 'rgba(239,68,68,0.15)', title: 'בירור ראשוני — ⚡ אופציונלי', text: 'התקשרות לפקיד שומה / קשר אישי — לא תמיד נדרש!', tags: ['skip_logic'] },
        { icon: '📁', iconBg: 'rgba(239,68,68,0.15)', title: 'פתיחת תיק טיפול', text: 'תיקייה: {לקוח}/קנסות_{שנים}/ · אימות יפוי כוח קיים', tags: ['יפוי כוח.pdf'] },
      ]
    },
    {
      num: 2, emoji: '🔍', title: 'כניסה לשע"מ — בדיקת מצב חשבון',
      subtitle: 'כניסה לאזור האישי של הלקוח ברשות המסים — פירוט החוב',
      color: '#3b82f6',
      badge: { text: 'collecting_data', type: 'ai' },
      details: [
        { icon: '💻', iconBg: 'rgba(59,130,246,0.15)', title: 'כניסה לשע"מ / אזור אישי', text: 'באמצעות יפוי כוח דיגיטלי — גישה למצב חשבון מס הכנסה', tags: ['📥 סוכן איסוף'] },
        { icon: '📊', iconBg: 'rgba(59,130,246,0.15)', title: 'פירוט מרכיבי החוב', text: 'מהו קנס? מה ריבית? מה חוב מס אמיתי? אימות מול ההודעה', tags: ['✅ סוכן אימות'] },
        { icon: '📸', iconBg: 'rgba(59,130,246,0.15)', title: 'צילום מסך / הורדת דוח', text: 'שמירת מצב חשבון עדכני כאסמכתא בתיק', tags: ['מצב_חשבון_מס.pdf'] },
      ]
    },
    {
      num: 3, emoji: '⚖️', title: 'החלטה — מסלול טיפול',
      subtitle: 'הפרדה בין קנסות (ביטול) לחוב אמיתי (תשלום) — שני מסלולים במקביל',
      color: '#f59e0b',
      badge: { text: 'awaiting_decision', type: 'calc' },
      details: [
        { icon: '📞', iconBg: 'rgba(245,158,11,0.15)', title: 'עדכון הלקוח', text: '"יש חוב של X ₪ — מתוכו Y ₪ קנסות (ביטול), Z ₪ חוב מס (תשלום)"', tags: ['⚖️ סוכן החלטה'] },
        { icon: '💳', iconBg: 'rgba(245,158,11,0.15)', title: 'בקשת אמצעי תשלום', text: 'אם יש חוב מס אמיתי — בקשת כרטיס אשראי / אישור תשלום', tags: ['אזור אישי'] },
      ]
    },
    {
      num: 4, emoji: '✍️', title: 'מסלול A — כתיבת מכתב ביטול קנסות',
      subtitle: 'הכנת מכתב הסבר מפורט לפקיד שומה — בקשה לביטול/הפחתת קנסות',
      color: '#8b5cf6',
      badge: { text: 'generating_output', type: 'ai' },
      details: [
        { icon: '📝', iconBg: 'rgba(139,92,246,0.15)', title: 'מבנה המכתב', text: 'כותרת, פרטי נישום, מס\' תיק, נימוקים: סיבת איחור, נסיבות, היסטוריית ציות', tags: ['✍️ סוכן ניסוח'] },
        { icon: '📑', iconBg: 'rgba(139,92,246,0.15)', title: 'צירוף אסמכתאות', text: 'דוחות שהוגשו, אישורי תשלום קודמים, מכתבים קודמים', tags: ['מכתב_ביטול_קנסות.pdf'] },
        { icon: '📋', iconBg: 'rgba(139,92,246,0.15)', title: 'למידה מתיקים קודמים', text: 'קסלוביץ דניס — ביטול קנס הצהרת הון · צקשבה אולגה — ביטול קנס', tags: ['למידה מהשטח'] },
      ]
    },
    {
      num: 5, emoji: '💳', title: 'מסלול B — תשלום חוב מס אמיתי',
      subtitle: 'תשלום החלק שאינו קנסות — דרך האזור האישי ברשות המיסים',
      color: '#10b981',
      badge: { text: 'generating_output', type: 'ai' },
      details: [
        { icon: '💻', iconBg: 'rgba(16,185,129,0.15)', title: 'תשלום באזור האישי', text: 'כניסה → בחירת שנת מס → הזנת כרטיס → תשלום', tags: ['📤 סוכן הגשה'] },
        { icon: '🧾', iconBg: 'rgba(16,185,129,0.15)', title: 'שמירת אישור תשלום', text: 'אישור_תשלום.pdf — שמירה בתיק הלקוח + עדכון מצב חשבון', tags: ['אישור_תשלום.pdf'] },
      ]
    },
    {
      num: 6, emoji: '🧪', title: 'בוט בדיקות — QA',
      subtitle: 'בדיקה שהמכתב תקין, שהתשלום בוצע, שהתיק מתועד',
      color: '#84cc16',
      badge: { text: 'testing_phase', type: 'ai' },
      details: [
        { icon: '✅', iconBg: 'rgba(132,204,22,0.15)', title: 'צ\'קליסט בדיקות', text: 'מכתב כולל פרטי נישום? ✓ · נימוקים? ✓ · אסמכתאות? ✓ · חוב שולם? ✓ · אישור בתיק? ✓', tags: ['🧪 בוט בדיקות'] },
        { icon: '📁', iconBg: 'rgba(132,204,22,0.15)', title: 'בדיקת מבנה תיק', text: 'כל הקבצים בתיקייה הנכונה? ✓ · שמות תואמים קונבנציה? ✓ · לקוח עודכן? ✓', tags: ['test_report'] },
      ]
    },
    {
      num: 7, emoji: '📤', title: 'שליחת מכתב לפקיד שומה',
      subtitle: 'שליחה דרך שע"מ / אזור אישי / פקס — ממתינים לתשובה',
      color: '#ec4899',
      badge: { text: 'ready_for_submission', type: 'iron' },
      details: [
        { icon: '💻', iconBg: 'rgba(236,72,153,0.15)', title: 'ערוצי שליחה', text: 'שע"מ — שליחת מסמך · אזור אישי — העלאת קובץ · פקס', tags: ['📤 סוכן הגשה'] },
        { icon: '⏰', iconBg: 'rgba(236,72,153,0.15)', title: 'תזכורת מעקב', text: 'הגדרת תזכורת 30 יום — לבדוק אם התקבלה תשובה', tags: ['CEO Office → Task'] },
      ]
    },
    {
      num: 8, emoji: '⏳', title: 'המתנה לתשובת פקיד שומה',
      subtitle: 'תשובה מגיעה באזור האישי של המייצג בשע"מ + מייל מרשות המיסים',
      color: '#06b6d4',
      badge: { text: 'awaiting_response', type: 'calc' },
      details: [
        { icon: '📬', iconBg: 'rgba(6,182,212,0.15)', title: 'ערוצי קבלת תשובה', text: '1. אזור אישי של המייצג בשע"מ\n2. מייל מרשות המיסים (הודעה אוטומטית)', tags: ['📥 סוכן איסוף'] },
        { icon: '📄', iconBg: 'rgba(6,182,212,0.15)', title: 'ניתוח התשובה', text: 'ויתרו → עדכון + סגירה · ביטול חלקי → שקילת ערעור · סירוב → ערעור / תשלום', tags: ['⚖️ סוכן החלטה'] },
      ]
    },
    {
      num: 9, emoji: '✅', title: 'סגירת תיק — תיעוד ודיווח',
      subtitle: 'עדכון הלקוח, תיוק בתיק, דיווח ללשכת המנכ"ל',
      color: '#6366f1',
      badge: { text: 'completed', type: 'done' },
      details: [
        { icon: '📞', iconBg: 'rgba(99,102,241,0.15)', title: 'עדכון הלקוח', text: 'התקשרות / WhatsApp — "הקנסות בוטלו" / "שולם X ₪" + שליחת אסמכתאות' },
        { icon: '📁', iconBg: 'rgba(99,102,241,0.15)', title: 'תיוק בתיק', text: 'מכתב_ביטול_קנסות.pdf · תשובת_פקיד_שומה.pdf · אישור_תשלום.pdf · test_report', tags: ['{לקוח}/קנסות_{שנים}/'] },
        { icon: '📊', iconBg: 'rgba(99,102,241,0.15)', title: 'דיווח CEO Office', text: 'דוח אוטומטי: שם לקוח, סכום שנחסך, סטטוס — ישר ללשכת המנכ"ל', tags: ['📤 → CEO'] },
      ]
    },
  ],
  result: {
    title: 'טיפול בקנסות — הושלם',
    text: 'חוב מפורק · קנסות → מכתב ביטול · חוב אמיתי → שולם · לקוח מעודכן · תיק מתועד · CEO מדווח',
    emphasis: 'מנגנון צבא סוכנים — 9 שלבים · skip logic · early exit · QA bot ✓',
  }
};

// #endregion
