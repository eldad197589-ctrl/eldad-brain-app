/* ============================================
// #region Module

   FILE: neurons.ts
   PURPOSE: Type definitions
   DEPENDENCIES: None (local only)
   EXPORTS: NeuronLink, Neuron, NeuronCategory, CATEGORIES, NEURONS, Synapse, SYNAPSES, PENDING
   ============================================ */
export interface NeuronLink {
  type: 'flowchart' | 'tool' | 'case';
  href: string;
  title: string;
  sub: string;
}

export interface Neuron {
  id: string;
  emoji: string;
  label: string;
  sublabel: string;
  color: string;
  count: number;
  category: string;
  buildStatus: 'built' | 'in-progress' | 'pending';
  links: NeuronLink[];
}

export interface NeuronCategory {
  id: string;
  emoji: string;
  label: string;
  color: string;
  description: string;
}

/** CATEGORIES — Type definitions */
export const CATEGORIES: NeuronCategory[] = [
  { id: 'employees', emoji: '👷', label: 'עובדים', color: '#3b82f6', description: 'נוכחות · שכר · דיני עבודה · מחזור חיים' },
  { id: 'accounting', emoji: '📊', label: 'הנהלת חשבונות', color: '#10b981', description: 'לקוחות · חשבוניות · ניהול ספרים · ספקים' },
  { id: 'financial', emoji: '📋', label: 'דוחות כספיים ומיסוי', color: '#06b6d4', description: 'דוחות שנתיים · מס · פנסיה' },
  { id: 'special', emoji: '⚖️', label: 'חישובים מיוחדים', color: '#f59e0b', description: 'רווח הון · מלחמה · אפוטרופוס · חדל"פ' },
  { id: 'tools', emoji: '🤖', label: 'כלים וטכנולוגיה', color: '#8b5cf6', description: 'AI · מסמכים · מערכות ניהול' },
  { id: 'robium', emoji: '🚀', label: 'רוביום', color: '#ec4899', description: 'תיק מוצרים · מייסדים · חממה' },
  { id: 'personal', emoji: '🎤', label: 'אישי ומערכת', color: '#06b6d4', description: 'מוזיקה · הגדרות' },
];

/** NEURONS — Type definitions */
export const NEURONS: Neuron[] = [
  /* ═══ עובדים ═══ */
  {
    id: 'attendance', emoji: '⏱️', label: 'נוכחות ושכר',
    sublabel: 'דיני עבודה · לשכה חכמה',
    color: '#3b82f6', count: 0, category: 'employees', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/attendance', title: 'תרשים זרימה — מנוע נוכחות', sub: '6 שלבים · משמרות · שעות נוספות' },
      { type: 'flowchart', href: '/flow/worklaw', title: 'תרשים זרימה — דיני עבודה', sub: '6 שלבים · חוקים · מחשבונים' },
      { type: 'flowchart', href: '/flow/payroll-processing', title: 'תרשים זרימה — עיבוד שכר', sub: '7 שלבים · חישוב · ייצוא' },
      { type: 'flowchart', href: '/flow/attendance-agents', title: 'מערכת הפעלה — סוכני נוכחות', sub: '7 סוכנים · 15 תת-סוכנים · 28 מיומנויות' },
      { type: 'tool', href: '#', title: 'מחשבון פיצויים — Attendance Engine', sub: 'אלגוריתם חישוב דיני עבודה — הבראה, חופשה, פנסיה' },
    ]
  },
  {
    id: 'expert-opinion', emoji: '📝', label: 'חוות דעת כלכלית',
    sublabel: '84 תיקים · 9 ענפים',
    color: '#3b82f6', count: 0, category: 'employees', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/expert-opinion', title: 'תרשים זרימה — חוות דעת', sub: '8 שלבים · תובע/נתבע · 9 ענפים' }
    ]
  },
  {
    id: 'employee-lifecycle', emoji: '🔄', label: 'מחזור חיי עובד',
    sublabel: 'קליטה · שימוע · סיום · טופס 161',
    color: '#3b82f6', count: 0, category: 'employees', buildStatus: 'in-progress',
    links: [
      { type: 'tool', href: '/onboarding', title: 'קליטת עובד/לקוח — Onboarding Wizard', sub: '8 שלבים: חוקי סינון ממשק קליטת לקוח מובנה' },
      { type: 'tool', href: '/coming-soon', title: 'סיום העסקה — Termination Wizard', sub: '7 שלבים: בחירה → שימוע → מסמכים → טפסים → גבייה' },
    ]
  },

  /* ═══ הנהלת חשבונות ═══ */
  {
    id: 'accounting', emoji: '📊', label: 'הנהלת חשבונות',
    sublabel: '41 לקוח · דיווח שוטף',
    color: '#10b981', count: 0, category: 'accounting', buildStatus: 'pending',
    links: []
  },
  {
    id: 'reports', emoji: '🏢', label: 'דיווחי מוסדות',
    sublabel: 'מס הכנסה · ביט"ל · מע"מ',
    color: '#10b981', count: 0, category: 'accounting', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/institutional-reports', title: 'תרשים זרימה — דיווחי מוסדות', sub: '6 שלבים · 2017-2025' }
    ]
  },

  /* ═══ דוחות כספיים ═══ */
  {
    id: 'declaration-of-capital', emoji: '📜', label: 'הצהרת הון',
    sublabel: 'נכסים · התחייבויות · הון נקי',
    color: '#06b6d4', count: 0, category: 'financial', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/declaration-of-capital', title: 'תרשים זרימה — הצהרת הון', sub: '8 שלבים · איסוף מסמכים · נוסחת איזון' },
      { type: 'tool', href: '#', title: 'נוהל עבודה משפטי (Knowledge Node)', sub: 'השוואת הון (טופס 1209) · נכסים דיגיטליים (קריפטו) · חקירה כלילית' },
    ]
  },
  {
    id: 'penalty-cancellation', emoji: '🚨', label: 'ביטול קנסות',
    sublabel: 'מס הכנסה · מכתב ביטול · שע"מ',
    color: '#10b981', count: 0, category: 'accounting', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/penalty-cancellation', title: 'תרשים זרימה — ביטול קנסות מס הכנסה', sub: '9 שלבים · skip logic · early exit · QA bot' },
      { type: 'tool', href: '#', title: 'מודל המרת הסברי לקוח לעילות חוקיות', sub: 'כוח עליון · תקלות שע"מ · סיבות רפואיות · מילואים' },
    ]
  },

  /* ═══ חישובים מיוחדים ═══ */
  {
    id: 'capital-gains', emoji: '💰', label: 'רווח הון',
    sublabel: 'מקרקעין בחו"ל · סעיף 91',
    color: '#f59e0b', count: 0, category: 'special', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/capital-gains', title: 'תרשים זרימה — רווח הון', sub: '7 שלבים · פורמולות · טופס 1399' },
      { type: 'tool', href: '/calculator', title: 'נייר עבודה — חישוב רווח הון', sub: 'מחשבון אינטראקטיבי' },
      { type: 'case', href: '/case/helman', title: 'הלמן — Texas, USA', sub: 'רבקה + אברהם · 333 Daleview Dr' },
      { type: 'tool', href: '/letter', title: 'מכתב שחרור כספים לבנק', sub: 'מכתב רשמי · חתימת רו"ח' }
    ]
  },
  {
    id: 'guardian', emoji: '🛡️', label: 'אפוטרופוס',
    sublabel: 'Guardian Pro · דוח שנתי',
    color: '#f59e0b', count: 0, category: 'special', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/guardian-pro', title: 'תרשים זרימה — Guardian Pro', sub: '9 שלבים · AI סיווג · חוות דעת' },
      { type: 'case', href: '/case/guardian', title: 'תיק: אנריקה (2023-2024)', sub: 'דוח שינויים בהון · חוות דעת חתומה' }
    ]
  },
  {
    id: 'insolvency', emoji: '⚖️', label: 'חדלות פירעון',
    sublabel: 'דוח חודשי · Guardian Mini',
    color: '#f59e0b', count: 0, category: 'special', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/insolvency', title: 'תרשים זרימה — חדלות פירעון', sub: '7 שלבים · מנוע Guardian · אישור רו"ח' }
    ]
  },
  {
    id: 'war', emoji: '🎖️', label: 'פיצויי מלחמה',
    sublabel: 'חרבות ברזל · צוק איתן',
    color: '#f59e0b', count: 0, category: 'special', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/war-compensation', title: 'תרשים זרימה — פיצויי מלחמה', sub: '8 שלבים · 3 מסלולים' }
    ]
  },

  /* ═══ דוחות כספיים ומיסוי ═══ */
  {
    id: 'pension', emoji: '💎', label: 'ייעוץ פנסיוני',
    sublabel: 'קרנות · ביטוח מנהלים · קופות',
    color: '#06b6d4', count: 0, category: 'financial', buildStatus: 'pending',
    links: [
      { type: 'tool', href: '/coming-soon', title: 'מודול פנסיה — Smart Office', sub: 'חישובי פנסיה · ביטוח מנהלים · קופות גמל' },
    ]
  },
  {
    id: 'quotes', emoji: '💰', label: 'קליטת לקוחות ותמחור',
    sublabel: 'מחירון · KYC · קליטת לקוח',
    color: '#10b981', count: 0, category: 'accounting', buildStatus: 'built',
    links: [
      { type: 'tool', href: '#', title: 'מחירון משרד רשמי — Smart Bareau', sub: 'עמלות הצלחה · חבילות ריטיינר · שירותים בודדים' },
      { type: 'tool', href: '/onboarding', title: 'אשף קליטת לקוח (KYC)', sub: 'צ\'קליסט מסמכים חכם לפי ישות מסוג + מעבר מייצג דינמי' },
      { type: 'tool', href: '/quotes-generator', title: 'מחולל הצעות מחיר (Generator)', sub: 'הפקת הצעת מחיר אוטומטית לפי מחירון Smart Bareau' },
    ]
  },

  /* ═══ כלים וטכנולוגיה ═══ */
  {
    id: 'brain-router', emoji: '🧠', label: 'Brain Router',
    sublabel: 'נתב מרכזי · 7 מערכות · AI',
    color: '#8b5cf6', count: 0, category: 'tools', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '/flow/brain-router', title: 'תרשים זרימה — נתב המוח', sub: '4 שלבים · קלט → ניתוב → עיבוד → פלט' },
    ]
  },
  {
    id: 'letter-bot', emoji: '✉️', label: 'בוט מכתבים',
    sublabel: '20+ סוגי מכתבים · AI',
    color: '#8b5cf6', count: 20, category: 'tools', buildStatus: 'built',
    links: [
      { type: 'tool', href: '/letter', title: 'מרכז מכתבים — Smart Letter Hub', sub: 'פיטורין · נטישה · אישור העסקה · שחרור · ועוד' },
    ]
  },
  {
    id: 'doc-collector', emoji: '📥', label: 'בוט איסוף מסמכים',
    sublabel: 'AI · בדיקה + בקשה אוטומטית',
    color: '#8b5cf6', count: 0, category: 'tools', buildStatus: 'pending',
    links: [
      { type: 'tool', href: '/coming-soon', title: 'מרכז איסוף מסמכים', sub: 'בדיקה במערכת → בקשה מלקוח → מעקב' },
    ]
  },

  /* ═══ רוביום ═══ */
  {
    id: 'business-plan', emoji: '📈', label: 'תוכנית עסקית',
    sublabel: 'שבלונה · Pelephone · מוצר לשיווק',
    color: '#ec4899', count: 1, category: 'robium', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: 'https://protokol-invite-murex.vercel.app/business-plan', title: 'תוכנית עסקית דיגיטלית — Protokol × Robium', sub: '13 שלבים · מ-א\' עד ת\' · שבלונה לשכפול' },
      { type: 'tool', href: 'https://protokol-invite-murex.vercel.app/business-plan/collect/agent', title: 'סוכן AI — השלמת נתונים לתוכנית', sub: 'שיחה קצרה · 2 דקות · איסוף אוטומטי' },
      { type: 'tool', href: 'https://protokol-invite-murex.vercel.app/business-plan/survey', title: 'שאלון סקר שוק — משרדי עו"ד ורו"ח', sub: 'דיוק התחזית והמודל המסחרי' },
    ]
  },
  {
    id: 'robium-products', emoji: '📦', label: 'תיק מוצרים',
    sublabel: '6 מוצרים · Protokol · Attendance · Capital Gains',
    color: '#ec4899', count: 6, category: 'robium', buildStatus: 'built',
    links: [
      { type: 'tool', href: '/products', title: 'תיק מוצרים — Robium 2026', sub: '6 מוצרים חיים · שותפויות · Roadmap Q1-Q4' },
    ]
  },
  {
    id: 'robium-agreement', emoji: '📄', label: 'הסכם מייסדים',
    sublabel: 'טיוטות לדיון · 3 מייסדים',
    color: '#ec4899', count: 0, category: 'robium', buildStatus: 'built',
    links: [
      { type: 'tool', href: '/agreement', title: 'טיוטה א׳ לדיון', sub: 'טיוטת הסכם לקראת פגישת המייסדים ב-25/03 · 26.6%×3' },
      { type: 'tool', href: '/agreement/legacy', title: 'טיוטה א׳ (11/03/26)', sub: 'הגרסה ההיסטורית מפגישת המייסדים — ארכיון בלבד (אקוויטי 37.5%)' },
      { type: 'tool', href: '/founders', title: 'פורטל מייסדים — תיאום ציפיות', sub: 'עימות חוזי · אישור התחייבויות · Robium 2.0' },
    ]
  },
  {
    id: 'robium-analysis', emoji: '📊', label: 'ניתוח מתחרים',
    sublabel: 'Robium vs השוק',
    color: '#ec4899', count: 0, category: 'robium', buildStatus: 'built',
    links: [
      { type: 'tool', href: '/comparison', title: 'ניתוח מתחרים — Robium vs השוק', sub: 'השוואה מקצועית · יתרונות תחרותיים' },
      { type: 'tool', href: '/incubator', title: 'חממה טכנולוגית — Robium', sub: 'צוות · טכנולוגיה · תשתיות' },
    ]
  },
  {
    id: 'seminar-tzila', emoji: '🎭', label: 'סימנריון צילה',
    sublabel: 'מרקטפלייס תרבות · סקר שוק',
    color: '#ec4899', count: 0, category: 'robium', buildStatus: 'built',
    links: [
      { type: 'flowchart', href: '#', title: 'הפלטפורמה הדיגיטלית (PRD)', sub: 'ארכיטקטורה · מודל עסקי תלת-שכבתי' },
      { type: 'case', href: '#', title: 'סקר צרכי גיוס (Knowledge Node)', sub: 'מיפוי שרשרת האספקה של רשויות הדרום' },
    ]
  },

  /* ═══ אישי ומערכת ═══ */
  {
    id: 'music', emoji: '🎵', label: 'זמר ומוזיקה',
    sublabel: 'שירים · צ\'ארלי בראון · חובבים',
    color: '#06b6d4', count: 0, category: 'personal', buildStatus: 'built',
    links: [
      { type: 'tool', href: '/hobbies', title: 'זמר ומוזיקה — האישי של אלדד', sub: 'שירים · להקות · צ\'ארלי בראון' },
    ]
  },
];

export interface Synapse {
  from: string;
  to: string;
  label: string;
  delay: number;
}

/** SYNAPSES — Type definitions */
export const SYNAPSES: Synapse[] = [
  { from: 'capital-gains', to: 'reports', label: 'טופס 1399', delay: 0 },
  { from: 'guardian', to: 'insolvency', label: 'Guardian', delay: 1 },
  { from: 'attendance', to: 'employee-lifecycle', label: 'קליטה→תלוש', delay: 2 },
  { from: 'expert-opinion', to: 'attendance', label: 'דיני עבודה', delay: 0.5 },
  { from: 'accounting', to: 'reports', label: 'דוחות שנתיים', delay: 1.5 },
  { from: 'war', to: 'reports', label: 'מס רכוש', delay: 2.5 },
  { from: 'employee-lifecycle', to: 'accounting', label: 'ניהול שכר', delay: 3 },
  { from: 'capital-gains', to: 'guardian', label: 'נכסים', delay: 3.5 },
  { from: 'declaration-of-capital', to: 'accounting', label: 'הון נקי', delay: 4 },
  /* ─ tools connections ─ */
  { from: 'brain-router', to: 'attendance', label: 'ניתוב', delay: 0.3 },
  { from: 'brain-router', to: 'letter-bot', label: 'מכתבים', delay: 0.8 },
  { from: 'brain-router', to: 'doc-collector', label: 'מסמכים', delay: 1.2 },
  { from: 'letter-bot', to: 'employee-lifecycle', label: 'מכתבי פיטורין', delay: 1.8 },
  { from: 'doc-collector', to: 'declaration-of-capital', label: 'איסוף', delay: 2.2 },
  { from: 'pension', to: 'employee-lifecycle', label: 'פנסיה', delay: 2.8 },
  { from: 'quotes', to: 'accounting', label: 'הצעות', delay: 3.2 },
  { from: 'letter-bot', to: 'war', label: 'מכתב תביעה', delay: 3.8 },
  /* ─ robium connections ─ */
  { from: 'robium-products', to: 'brain-router', label: 'פלטפורמה', delay: 1.0 },
  { from: 'robium-agreement', to: 'robium-products', label: 'הסכם', delay: 2.0 },
  { from: 'robium-analysis', to: 'robium-products', label: 'אנליזה', delay: 3.0 },
  { from: 'business-plan', to: 'robium-products', label: 'תוכנית עסקית', delay: 1.5 },
  { from: 'business-plan', to: 'quotes', label: 'תמחור', delay: 2.5 },
];

/** PENDING — Type definitions */
export const PENDING = [
  'מיסוי מקרקעין', 'החזרי מס', 'הכנת דוחות כספיים',
  'התחשבנות בשותפות', 'ביקורת ספרים', 'מע"מ חודשי',
  'דוח שנתי', 'ביטוח לאומי', 'קרן השתלמות', 'דמי הבראה',
  'חישובי פיצויים', 'הסכם קיבוצי', 'צו הרחבה',
  '106 שנתי', 'אישור ניכוי', 'תיקון 190',
  'מאזן בוחן', 'רווח והפסד', 'תזרים מזומנים',
  'ניהול מלאי WMS', 'ניהול אתרי בנייה', 'ניהול תביעות',
  'רגולציה וציות', 'פורטל עובד', 'עוד הרבה...',
];

// #endregion
