import type { FlowchartData } from './flowchartTypes';

/* ═══════════════════════════════════════════
   תרשים #1 — חישוב רווח הון ממכירת נכס בחו"ל
   ═══════════════════════════════════════════ */
const capitalGains: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #2 — Guardian Pro — דיווח לאפוטרופוס
   ═════════════════════════════════════════ */
const guardianPro: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #3 — מנוע נוכחות — חוק עבודה
   ═════════════════════════════════════════ */
const attendance: FlowchartData = {
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



/* ═════════════════════════════════════════
   תרשים #4 — דיני עבודה וחוות דעת (Worklaw OS)
   ═════════════════════════════════════════ */
const worklaw: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #5 — מיקרו-תהליך עיבוד שכר (א.א. עוגנים)
   ═════════════════════════════════════════ */
const payrollProcessing: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #6 — חדלות פירעון — דוח חודשי לעו"ד
   ═════════════════════════════════════════ */
const insolvency: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #7 — חוות דעת כלכלית — דיני עבודה
   ═════════════════════════════════════════ */
const expertOpinion: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #8 — פיצויי מלחמה — מס רכוש ונזקי מלחמה
   ═════════════════════════════════════════ */
const warCompensation: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #9 — דיווחי מוסדות — עץ דיווחים מלא
   ═════════════════════════════════════════ */
const institutionalReports: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #10 — Brain Router — ארכיטקטורת מערכות
   ═════════════════════════════════════════ */
const brainRouter: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #11 — מנוע נוכחות — סוכנים (Attendance OS Agents)
   ═════════════════════════════════════════ */
const attendanceAgents: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #12 — הצהרת הון — תהליך מלא
   ═════════════════════════════════════════ */
const declarationOfCapital: FlowchartData = {
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


/* ═════════════════════════════════════════
   תרשים #14 — ביטול קנסות מס הכנסה
   ═════════════════════════════════════════ */
const penaltyCancellation: FlowchartData = {
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


/* ═══ Registry ═══ */
export const FLOWCHARTS: Record<string, FlowchartData> = {
  'capital-gains': capitalGains,
  'guardian-pro': guardianPro,
  'attendance': attendance,
  'worklaw': worklaw,
  'payroll-processing': payrollProcessing,
  'insolvency': insolvency,
  'expert-opinion': expertOpinion,
  'war-compensation': warCompensation,
  'institutional-reports': institutionalReports,
  'brain-router': brainRouter,
  'attendance-agents': attendanceAgents,
  'declaration-of-capital': declarationOfCapital,
  'penalty-cancellation': penaltyCancellation,
};

