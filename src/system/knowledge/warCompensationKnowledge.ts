/* ============================================
   FILE: warCompensationKnowledge.ts
   PURPOSE: שכבת ידע מובנית — פיצויי מלחמה, מיסוי ורגולציה.
            מקור אמת לכל המנועים: classifier, caseBundle, draftGenerator, caseHistory.
   DEPENDENCIES: None (pure data)
   EXPORTS: WAR_COMP_SUBTYPES, WAR_COMP_KEYWORDS, WAR_COMP_AUTHORITY_BODIES,
            WAR_COMP_REQUIRED_MATERIALS, WAR_COMP_EVIDENCE_MATRIX,
            WAR_COMP_DOCUMENT_TYPES, WAR_COMP_DEADLINES, WAR_COMP_APPEAL_RULES,
            WAR_COMP_SANCTIONS, WAR_COMP_OFFICIAL_FORMS, WAR_COMP_SENDER_DOMAINS,
            WAR_COMP_WARS, WAR_COMP_DAMAGE_TYPES, WAR_COMP_LEGAL_PRECEDENTS,
            WAR_COMP_DRAFT_TEMPLATES, WarCompSubtype
   ============================================ */

// #region Types

/** תת-סוג פיצוי מלחמה */
export type WarCompSubtype =
  | 'war_compensation_red_track'
  | 'war_compensation_appeal'
  | 'war_compensation_response'
  | 'am_kelavi_compensation'
  | 'shaagat_haari_relief';

/** סוג נזק */
export type DamageType = 'direct' | 'indirect';

/** רמת אימות ידע */
export type KnowledgeVerification = 'knowledge_rule' | 'knowledge_candidate' | 'marketing_or_newsletter';

// #endregion

// #region Subtypes

/** הגדרת תתי-סוגים */
export const WAR_COMP_SUBTYPES: Record<WarCompSubtype, {
  title: string;
  description: string;
  damageType: DamageType;
  keywords: string[];
}> = {
  war_compensation_red_track: {
    title: 'מסלול אדום — נזק עקיף',
    description: 'תביעת פיצויים עקב מלחמה: ירידה במחזור, אובדן הכנסה, נזק עקיף',
    damageType: 'indirect',
    keywords: ['מסלול אדום', 'נזק עקיף', 'תביעת פיצויים', 'ירידה במחזור', 'מכתב החלטה', 'ערר', 'מכתב תגובה', 'חרבות ברזל'],
  },
  war_compensation_appeal: {
    title: 'ערר / השגה',
    description: 'ערר או השגה על החלטת רשות בעניין פיצוי מלחמה',
    damageType: 'indirect',
    keywords: ['ערר', 'השגה', 'מכתב תגובה', 'החלטת רשות', 'דחייה', 'אישור חלקי', 'נימוקי הערר'],
  },
  war_compensation_response: {
    title: 'מכתב תגובה / השלמת מסמכים',
    description: 'תגובה לפני או במהלך בחינת התביעה',
    damageType: 'indirect',
    keywords: ['מענה', 'תגובה', 'מסמכים נוספים', 'דרישת הבהרה', 'הבהרות', 'אסמכתאות', 'השלמת מסמכים'],
  },
  am_kelavi_compensation: {
    title: 'פיצויים — מבצע עם כלביא',
    description: 'מתווה פיצויים למבצע עם כלביא יוני 2025',
    damageType: 'indirect',
    keywords: ['עם כלביא', 'יוני 2025', 'ירידה במחזור', 'רכיב שכר', 'רכיב תשומות', 'טופס 102'],
  },
  shaagat_haari_relief: {
    title: 'הקלות — שאגת הארי',
    description: 'הקלות בנקאיות/רגולטוריות הקשורות למבצע שאגת הארי',
    damageType: 'indirect',
    keywords: ['שאגת הארי', 'דחיית הלוואות', 'דחיית משכנתא', 'פטור מריבית', 'אוברדרפט', 'פצועים', 'מפונים'],
  },
};

// #endregion

// #region Keywords (Unified for Classifier)

/** מילות מפתח אחודות — לשימוש ב-emailClassifier */
export const WAR_COMP_KEYWORDS: string[] = [
  // כללי
  'פיצוי מלחמה', 'פיצויי מלחמה', 'קרן פיצויים', 'מס רכוש', 'נזק עקיף', 'מסלול אדום',
  'נזק ישיר', 'נזקי מלחמה', 'פיצוי בגין נזק', 'תביעת פיצוי', 'תביעת פיצויים',
  // מבצעים
  'חרבות ברזל', 'צוק איתן', 'עם כלביא', 'שאגת הארי',
  // השגה / ערר
  'ערר', 'השגה', 'ועדת ערר', 'נימוקי ערר', 'דחייה חלקית',
  // מסמכים
  'השלמת מסמכים', 'חישוב הפסד', 'אישור רו"ח', 'מכתב החלטה',
  // רשויות
  'קרן הפיצויים', 'מס רכוש וקרן פיצויים',
  // כלכלי
  'ירידה במחזור', 'אובדן הכנסה', 'יישוב ספר',
  // הקלות
  'דחיית משכנתא', 'דחיית הלוואות', 'מענק עידוד תעסוקה',
];

// #endregion

// #region Authority Bodies

/** גופי רשות רלוונטיים */
export const WAR_COMP_AUTHORITY_BODIES = [
  { id: 'tax_authority', name: 'רשות המסים בישראל', role: 'תביעות, החלטות, השגות, מסלולי פיצוי', domain: 'taxes.gov.il' },
  { id: 'compensation_fund', name: 'קרן הפיצויים', role: 'החלטות פיצוי, השגות, עררים', domain: 'rfrp.gov.il' },
  { id: 'property_tax', name: 'מס רכוש', role: 'נזק ישיר / נזק עקיף / פיצויי מלחמה', domain: 'mas-rechush.gov.il' },
  { id: 'bank_of_israel', name: 'בנק ישראל', role: 'הקלות פיננסיות/בנקאיות — שאגת הארי', domain: 'boi.org.il' },
  { id: 'btl', name: 'המוסד לביטוח לאומי', role: 'מענקי עידוד תעסוקה, דמי אבטלה', domain: 'btl.gov.il' },
] as const;

// #endregion

// #region Sender Domains (for emailClassifier)

/** דומיינים מזוהים מתוך המיילים האמיתיים */
export const WAR_COMP_SENDER_DOMAINS: Record<string, { category: string; label: string }> = {
  'taxes.gov.il': { category: 'government', label: 'רשות המסים' },
  'rfrp.gov.il': { category: 'legal', label: 'קרן הפיצויים — מס רכוש' },
  'mas-rechush.gov.il': { category: 'legal', label: 'מס רכוש — פיצויי מלחמה' },
  'btl.gov.il': { category: 'government', label: 'ביטוח לאומי' },
  'icpas.org.il': { category: 'legal', label: 'לשכת רואי חשבון' },
};

// #endregion

// #region Required Materials (per subtype)

/** מסמכים נדרשים לפי תת-סוג */
export const WAR_COMP_REQUIRED_MATERIALS: Record<string, string[]> = {
  war_compensation_red_track: [
    'החלטת הרשות / המכתב שהתקבל',
    'מכתב תגובה קודם (אם קיים)',
    'טיוטת ערר',
    'אסמכתאות תומכות',
    'חישובים / נתוני נזק',
    'מסמכי לקוח רלוונטיים',
    'דוחות כספיים',
    'אישורי רו"ח',
    'נתוני מחזור',
  ],
  war_compensation_appeal: [
    'החלטת הרשות / המכתב שהתקבל',
    'מכתב תגובה קודם',
    'טיוטת ערר',
    'אסמכתאות תומכות',
    'חישובים / נתוני נזק',
    'נימוקי הערר',
  ],
  war_compensation_response: [
    'מכתב שהתקבל / דרישת ההבהרה',
    'מסמכים חסרים שנדרשו',
    'אסמכתאות נוספות',
    'הסבר / הבהרה כתובה',
  ],
  am_kelavi_compensation: [
    'דוחות מע"מ (תקופת בסיס + תקופת זכאות)',
    'טופס 102 (הוצאות שכר)',
    'דוחות כספיים',
    'מסמכי שכירות / פינוי / השבתה',
    'אישור רו"ח על מחזורים',
  ],
  shaagat_haari_relief: [
    'אישור תושבות / פינוי',
    'מסמכי הלוואה / משכנתא',
    'אישור בנק',
    'מסמכי שירות מילואים (אם רלוונטי)',
  ],
};

// #endregion

// #region Evidence Matrix

/** מטריצת ראיות — מה צריך להוכיח ואיך */
export const WAR_COMP_EVIDENCE_MATRIX = {
  turnoverDecline: {
    title: 'הוכחת ירידה במחזור',
    documents: ['דוחות מע"מ', 'השוואת מחזורים', 'נתוני בסיס מול תקופת זכאות'],
  },
  salaryExpenses: {
    title: 'הוכחת הוצאות שכר',
    documents: ['טופס 102', 'עלות שכר בתקופה הרלוונטית', 'נתוני עובדים שנפגעו'],
  },
  causalLink: {
    title: 'הוכחת קשר סיבתי',
    documents: ['מיקום העסק', 'השפעת המצב הביטחוני', 'פינוי / השבתה / פגיעה בתפקוד', 'תיעוד עסקי ותפעולי'],
  },
  incomeLoss: {
    title: 'הוכחת נזק / אובדן הכנסה',
    documents: ['דוחות כספיים', 'ספרי עסק', 'מסמכי הנהלת חשבונות', 'חישובים', 'הסברים ונספחים'],
  },
  clientBackground: {
    title: 'מסמכי רקע ללקוח',
    documents: ['ייפוי כוח / ייצוג', 'מסמכי לקוח', 'החלטות קודמות', 'מכתבים קודמים'],
  },
} as const;

// #endregion

// #region Document Types

/** סוגי מסמכים מוכרים */
export const WAR_COMP_DOCUMENT_TYPES = [
  'החלטת רשות', 'מכתב תגובה', 'ערר', 'השגה',
  'אסמכתאות נזק', 'חישוב נזק', 'דוחות כספיים',
  'טופס 102', 'דוחות מע"מ', 'מסמכי לקוח',
  'אישורי רו"ח', 'מסמכי שכירות / פינוי / השבתה',
] as const;

// #endregion

// #region Official Forms

/** טפסים ודיווחים חיוניים */
export const WAR_COMP_OFFICIAL_FORMS = [
  { id: 'form_101', name: 'טופס 101', purpose: 'כרטיס עובד מעודכן' },
  { id: 'form_102', name: 'טופס 102', purpose: 'דיווח שכר וניכויים — הוכחת הוצאות שכר בפיצויים' },
  { id: 'form_126', name: 'טופס 126', purpose: 'דיווח שנתי על תשלומים' },
  { id: 'form_856', name: 'טופס 856', purpose: 'דיווח שנתי על תשלומים' },
  { id: 'vat_reports', name: 'דוחות מע"מ', purpose: 'תנאי מוקדם בתביעות מסוימות' },
] as const;

// #endregion

// #region Deadlines

/** מועדים — כל מועד מסומן אם דורש review */
export const WAR_COMP_DEADLINES = [
  {
    operation: 'swords_of_iron',
    track: 'red_track',
    rule: 'תביעה תוך 3 חודשים מסיום המלחמה',
    needsReview: true,
    note: 'מועדים הוארכו מספר פעמים — לבדוק מול פרסומי רשות המסים',
  },
  {
    operation: 'am_kelavi',
    track: 'indirect_damage',
    rule: 'תביעה בגין נזק עקיף בין 13.6.2025 ל-24.6.2025',
    needsReview: true,
    note: 'מסלול יוני 2025 — לוודא חלון הגשה עדכני',
  },
  {
    operation: 'general',
    track: 'appeal',
    rule: 'זכות השגה תוך 60 ימים ממועד קבלת ההחלטה',
    needsReview: false,
    note: 'מועד קבוע בחוק',
  },
] as const;

// #endregion

// #region Appeal Rules

/** כללי ערר / השגה */
export const WAR_COMP_APPEAL_RULES = {
  deadlineDays: 60,
  deadlineDescription: 'זכות השגה תוך 60 ימים ממועד קבלת ההחלטה',
  triggerConditions: ['דחייה', 'אישור חלקי', 'דרישת מסמכים'],
  preferredTemplate: 'war_compensation_appeal',
  appealStructure: [
    'רקע ותיאור ההחלטה',
    'תיאור הנזק העקיף',
    'חישובי הנזק',
    'אסמכתאות',
    'נימוקי הערר',
    'חתימת רו"ח / מייצג',
  ],
  addressees: ['קרן הפיצויים', 'מס רכוש', 'רשות המסים'],
} as const;

// #endregion

// #region Sanctions / Risk Flags

/** סנקציות ודגלי סיכון */
export const WAR_COMP_SANCTIONS = {
  penalties: [
    { trigger: 'הגשת תביעת סרק', severity: 'high' },
    { trigger: 'פער מהותי בין תביעה לסכום מאושר', severity: 'high' },
    { trigger: 'סטייה העולה על 50% בין סכום נתבע למאושר', severity: 'critical', penaltyRate: '25%-40%' },
  ],
  riskFlags: [
    'חסר במסמכי בסיס',
    'חישוב נזק לא נתמך',
    'ירידה במחזור לא מוכחת',
    'שימוש בתבנית מכתב לא מתאימה',
    'מסלול שגוי',
    'חסר בטופסי שכר / מע"מ',
    'מועד השגה קרוב / חלף',
  ],
  humanReviewRequired: [
    'חסרות אסמכתאות קריטיות',
    'סתירה בין המיילים למסמכים',
    'אין ודאות במסלול הנכון',
    'סיכון סנקציה',
    'מועד הגשה / ערר קרוב מאוד',
  ],
} as const;

// #endregion

// #region Damage Types

/** סוגי נזק */
export const WAR_COMP_DAMAGE_TYPES = {
  direct: {
    title: 'נזק ישיר',
    definition: 'נזק פיזי לרכוש / מבנה / תכולה / השבתה בעקבות פגיעה ישירה',
    legalBasis: 'סעיף 35, חוק מס רכוש',
  },
  indirect: {
    title: 'נזק עקיף',
    definition: 'הפסד או מניעת רווח, ירידה במחזור, הוצאות רלוונטיות, קושי בניצול נכסים, קשר סיבתי למצב המלחמה',
    legalBasis: 'סעיף 36, חוק מס רכוש',
  },
} as const;

// #endregion

// #region Wars / Operations

/** מבצעים / מלחמות */
export const WAR_COMP_WARS = [
  { id: 'swords_of_iron', name: 'חרבות ברזל', startDate: '2023-10-07', keywords: ['חרבות ברזל', 'iron swords'] },
  { id: 'protective_edge', name: 'צוק איתן', startDate: '2014-07-08', keywords: ['צוק איתן', 'protective edge'] },
  { id: 'am_kelavi', name: 'עם כלביא', startDate: '2025-06-13', keywords: ['עם כלביא', 'im kalbia'] },
  { id: 'shaagat_haari', name: 'שאגת הארי', startDate: '2025-06-13', keywords: ['שאגת הארי'] },
] as const;

// #endregion

// #region Legal Precedents

/** תקדימים משפטיים (מתוך תיקי אלדד) */
export const WAR_COMP_LEGAL_PRECEDENTS = [
  { id: '749_87', citation: 'ע"א 749/87 מוסך המרכז בע"מ', principle: 'המבחן אובייקטיבי-כלכלי, לא בוחנים מניע אישי' },
  { id: 'tsuk_eitan_hb', citation: 'הוראת ביצוע צוק איתן 10.8.14', principle: 'הנחיות מפורטות לתביעות פיצויים' },
] as const;

// #endregion

// #region Draft Templates Metadata

/** מטא-דאטה לתבניות Draft — מטרות, נמענים, מבנה */
export const WAR_COMP_DRAFT_TEMPLATES = {
  war_compensation_appeal: {
    title: 'ערר על החלטה — פיצוי מלחמה',
    addressee: 'קרן הפיצויים — מס רכוש וקרן פיצויים, רשות המסים בישראל',
    sections: ['רקע', 'תיאור הנזק העקיף', 'חישובי הנזק', 'אסמכתאות מצורפות', 'נימוקי הערר'],
    signature: 'אלדד ברגר, רו"ח — מייצג מורשה',
    legalRef: 'ע"א 749/87 — המבחן אובייקטיבי-כלכלי',
  },
  war_compensation_supplement: {
    title: 'מכתב נלווה / השלמת מסמכים — פיצוי מלחמה',
    addressee: 'מס רכוש ונזקי מלחמה — רשות המסים',
    sections: ['הנדון ומספר בקשה', 'פירוט המסמכים המצורפים', 'הסבר נסיבות', 'פירוט רכיבי תביעה'],
    signature: 'אלדד ברגר, רו"ח',
    legalRef: null,
  },
  war_compensation_response: {
    title: 'מענה לפניית רשות — פיצוי מלחמה',
    addressee: 'רשות המסים — מס רכוש ונזקי מלחמה',
    sections: ['הנדון', 'התייחסות לנקודות שנדרשו', 'אסמכתאות מצורפות'],
    signature: 'אלדד ברגר, רו"ח',
    legalRef: null,
  },
} as const;

// #endregion
