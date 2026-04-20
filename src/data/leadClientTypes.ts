/* ============================================
   FILE: leadClientTypes.ts
   PURPOSE: Entity model for the Lead → Client lifecycle.
            Defines Lead, Client, IntakeQuestionnaire,
            DocumentRequest, and EngagementStatus.
   DEPENDENCIES: None (pure types)
   EXPORTS: LeadEntity, ClientEntity, IntakeQuestionnaire,
            DocumentRequest, EngagementStatus, LeadSource,
            LeadStatus, ClientStatus, ServiceType,
            EntityType, VATCycle, DocumentRequestStatus,
            LEAD_STATUS_TRANSITIONS, CLIENT_STATUS_TRANSITIONS
   ============================================ */

// #region Enums & Union Types

/** מקור ליד */
export type LeadSource =
  | 'referral'       // הפניה מלקוח קיים / מכר
  | 'website'        // אתר / טופס דיגיטלי
  | 'whatsapp'       // פנייה ב-WhatsApp
  | 'phone'          // טלפון
  | 'walk_in'        // הגיע למשרד
  | 'returning'      // לקוח חוזר
  | 'lawyer'         // הפניה מעו"ד
  | 'other';

/** סוג שירות — מה הליד צריך */
export type ServiceType =
  | 'war_compensation'     // פיצויי מלחמה — תביעה ראשונית
  | 'war_appeal'           // ערר על דחייה
  | 'expert_opinion'       // חוות דעת כלכלית
  | 'tax_return'           // דוח שנתי / החזר מס
  | 'capital_gains'        // רווח הון
  | 'bookkeeping'          // הנהלת חשבונות שוטפת
  | 'payroll'              // שכר
  | 'guardian'             // אפוטרופסות
  | 'pension_advisory'     // ייעוץ פנסיוני
  | 'consulting'           // ייעוץ מס כללי
  | 'other';

/** סוג ישות עסקית */
export type EntityType =
  | 'individual'      // יחיד / עצמאי
  | 'osek_patur'      // עוסק פטור
  | 'osek_murshe'     // עוסק מורשה
  | 'company'         // חברה בע"מ
  | 'partnership'     // שותפות
  | 'amuta'           // עמותה
  | 'cooperative'     // אגודה שיתופית
  | 'other';

/** מחזור דיווח מע"מ */
export type VATCycle =
  | 'monthly'         // חד-חודשי
  | 'bimonthly'       // דו-חודשי
  | 'exempt'          // פטור
  | 'none';           // לא רלוונטי

/**
 * מסלול פיצויים — לפי סיווג רשות המסים (gov.il).
 *
 * 5 סוגי מסלולות בסיסיים (57 מופעים לפי תקופות זכאות):
 * 1. אדום — יישובי ספר, אין תקרה
 * 2. ירוק — אזור מיוחד, כולל תתי-מסלולי שכר ומחזורים
 * 3. הוצאות מזכות — כלל-ארצי, ירידת מחזורים מוכחת
 * 4. מילואים — עוסקים ששירתו בצו 8
 * 5. עסקי/מחזורים — הפרש מחזורים תקופת נזק vs בסיס
 */
export type CompensationTrack =
  | 'red'              // מסלול אדום — יישובי ספר, נזק ישיר, אין תקרה
  | 'green'            // מסלול ירוק — אזור מיוחד (כולל שכר + מחזורים)
  | 'green_salary'     // תת-מסלול ירוק — שכר / היעדרות עובדים
  | 'green_revenue'    // תת-מסלול ירוק — ירידת מחזורים
  | 'eligible_expense' // מסלול הוצאות מזכות — כלל-ארצי
  | 'reserve_duty'     // מענק משרתי מילואים — צו 8
  | 'business'         // מסלול עסקי — ירידת מחזורים כללי
  | 'employee'         // מסלול שכיר — פגיעה בפרנסה (יחיד)
  | 'salary'           // רכיב שכר — עלויות שכר בתביעת מעסיק
  | 'other';

/**
 * בסיס פיצוי — רכיב נוסף לסינון מסמכים.
 * עסק יכול לתבוע על יותר ממסלול אחד בו-זמנית:
 * למשל מסלול עסקי (ירידת מחזורים) + רכיב שכר (עובדים בחל"ת).
 */
export type CompensationBasis =
  | 'revenue_loss'       // ירידת מחזורים
  | 'direct_damage'      // נזק ישיר
  | 'salary_costs'       // עלויות שכר / חל"ת / היעדרויות
  | 'eligible_expenses'  // הוצאה מזכה (הוצאות ישירות שהוכרו)
  | 'fixed_costs';       // הוצאות קבועות

/**
 * סוג ענף — משפיע על מקדם פיצוי ענפי.
 * מקדמים: general = 1.0, construction = 0.68, fuel = 0.35, gems = 0.19
 */
export type IndustryType =
  | 'general'            // כללי (ללא מקדם ענפי)
  | 'construction'       // קבלני ביצוע (×0.68)
  | 'fuel'               // סיטונאי/קמעונאי דלק (×0.35)
  | 'gems'               // יבוא/יצוא אבנים יקרות — סעיף 33 (×0.19)
  | 'other';

/**
 * הקשר מבצעי — באיזה מלחמה/מבצע נגרם הנזק.
 */
export type OperationContext =
  | 'swords_of_iron'     // חרבות ברזל (10/2023+)
  | 'rising_lion'        // עם כלביא (6/2025)
  | 'lions_roar'         // שאגת הארי (2/2026+)
  | 'multiple';          // יותר ממבצע אחד

// #endregion

// #region War Compensation Hierarchical Taxonomy (v2)

/**
 * 1. סוג מסלול בסיסי (Track Type)
 */
export type TrackType =
  | 'red'              // מסלול אדום — יישובי ספר
  | 'green'            // מסלול ירוק — אזור מיוחד
  | 'eligible_expense' // הוצאות מזכות — כלל-ארצי
  | 'reserve_duty'     // מענק מילואים — צו 8
  | 'business'         // עסקי — נזק עקיף רגיל
  | 'unknown';

/**
 * 2. תת-מסלול (Sub-Track)
 */
export type SubTrack =
  | 'salary'           // מסלול שכר
  | 'revenue'          // מסלול מחזורים
  | 'none';

/**
 * 3. סוג זכאי (Claimant Type)
 */
export type ClaimantType =
  | 'employer'         // מעסיק
  | 'self_employed'    // עצמאי
  | 'employee'         // שכיר
  | 'company'          // חברה (תאגיד)
  | 'other';

/**
 * פונקציית מיפוי — תאימות לאחור מה-Enum השטוח למבנה ההיררכי.
 */
export function mapLegacyTrackToHierarchy(legacyTrack: CompensationTrack): {
  trackType: TrackType;
  subTrack: SubTrack;
  defaultBasis: CompensationBasis[];
} {
  switch (legacyTrack) {
    case 'red':
      return { trackType: 'red', subTrack: 'none', defaultBasis: ['direct_damage'] };
    case 'green':
      return { trackType: 'green', subTrack: 'none', defaultBasis: ['revenue_loss', 'salary_costs'] };
    case 'green_salary':
      return { trackType: 'green', subTrack: 'salary', defaultBasis: ['salary_costs'] };
    case 'green_revenue':
      return { trackType: 'green', subTrack: 'revenue', defaultBasis: ['revenue_loss'] };
    case 'eligible_expense':
      return { trackType: 'eligible_expense', subTrack: 'none', defaultBasis: ['eligible_expenses'] };
    case 'reserve_duty':
      return { trackType: 'reserve_duty', subTrack: 'none', defaultBasis: [] };
    case 'business':
      return { trackType: 'business', subTrack: 'none', defaultBasis: ['revenue_loss'] };
    case 'employee':
      return { trackType: 'unknown', subTrack: 'none', defaultBasis: [] };
    case 'salary':
      return { trackType: 'unknown', subTrack: 'salary', defaultBasis: ['salary_costs'] };
    default:
      return { trackType: 'unknown', subTrack: 'none', defaultBasis: [] };
  }
}

// #endregion

// #region Lead Status Machine

/**
 * סטטוס ליד — מכניסה ראשונית ועד המרה ללקוח או סגירה.
 *
 * Flow:
 * new → contacted → intake_sent → intake_received → docs_requested
 *     → docs_received → qualified → converted | disqualified | archived
 */
export type LeadStatus =
  | 'new'              // פנייה חדשה — טרם נוצר קשר
  | 'contacted'        // יצרנו קשר ראשוני
  | 'intake_sent'      // שאלון אפיון נשלח
  | 'intake_received'  // שאלון אפיון התקבל
  | 'docs_requested'   // דרישת מסמכים נשלחה
  | 'docs_received'    // מסמכים התקבלו (חלקית או מלא)
  | 'qualified'        // הושלמה הערכת כדאיות — מוכן להמרה
  | 'converted'        // הומר ללקוח ✅
  | 'disqualified'     // נפסל (לא רלוונטי / לא כדאי)
  | 'archived';        // ארכיון — לא פעיל

/** מעברים חוקיים בין סטטוסי ליד */
export const LEAD_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new:             ['contacted', 'disqualified', 'archived'],
  contacted:       ['intake_sent', 'disqualified', 'archived'],
  intake_sent:     ['intake_received', 'contacted', 'archived'],
  intake_received: ['docs_requested', 'qualified', 'disqualified'],
  docs_requested:  ['docs_received', 'intake_received', 'archived'],
  docs_received:   ['qualified', 'docs_requested', 'disqualified'],
  qualified:       ['converted', 'disqualified', 'archived'],
  converted:       [],  // terminal
  disqualified:    ['new', 'archived'],  // reopen possible
  archived:        ['new'],              // reopen possible
};

// #endregion

// #region Client Status Machine

/**
 * סטטוס לקוח — מהרגע שהומר מליד ועד סגירת שירות.
 *
 * Flow:
 * onboarding → active → in_process → completed | paused | churned
 */
export type ClientStatus =
  | 'onboarding'      // קליטה ראשונית — חתימת הסכם, הגדרות
  | 'active'          // לקוח פעיל — שירות שוטף
  | 'in_process'      // בתהליך ספציפי (ערר, חוו"ד, דוח)
  | 'completed'       // תהליך הושלם
  | 'paused'          // מושהה (ממתין ללקוח / לרשות)
  | 'churned';        // נטש / הפסיק שירות

/** מעברים חוקיים בין סטטוסי לקוח */
export const CLIENT_STATUS_TRANSITIONS: Record<ClientStatus, ClientStatus[]> = {
  onboarding:  ['active', 'churned'],
  active:      ['in_process', 'paused', 'churned'],
  in_process:  ['completed', 'active', 'paused'],
  completed:   ['active', 'churned'],  // can start new process
  paused:      ['active', 'in_process', 'churned'],
  churned:     ['active'],             // win-back
};

// #endregion

// #region Document Request

/** סטטוס דרישת מסמך בודד */
export type DocumentRequestStatus =
  | 'pending'      // ממתין מהלקוח
  | 'received'     // התקבל
  | 'rejected'     // נפסל (לא תקין / לא רלוונטי)
  | 'waived';      // לא נדרש (וויתור)

/**
 * שלב מחזור חיים — מתי המסמך נדרש.
 *
 * הבחנה מפורשת:
 * - lead_intake / pre_assessment / pricing → מסמכים להבנת התיק ותמחור
 * - post_engagement → מסמכים לאחר חתימת הסכם, לפני ייצוג
 * - representation → מסמכים לצורך ייצוג (ייפוי כוח, כתב מינוי)
 * - submission → מסמכים לצורך הגשה בפועל לרשות / בית דין
 */
export type DocumentLifecycleStage =
  | 'lead_intake'       // שלב ליד — מסמכים להבנת מי הפונה ומה צריך
  | 'pre_assessment'    // שלב אומדן — מסמכים להערכת כדאיות וסיכויים
  | 'pricing'           // שלב תמחור — מסמכים לצורך הצעת מחיר
  | 'post_engagement'   // שלב קליטה — לאחר הסכם, לפני ייצוג
  | 'representation'    // שלב ייצוג — ייפוי כוח, כתב מינוי, הרשאות
  | 'submission';       // שלב הגשה — מסמכים שנדרשים בהגשה עצמה

/**
 * מטרת המסמך — למה הוא נדרש.
 * נגזר מ-stage אבל מפורש כדי שיהיה ברור בלי חישוב.
 */
export type DocumentPurpose =
  | 'to_assess'      // נדרש להבנת התיק והערכת כדאיות
  | 'to_represent'   // נדרש לצורך ייצוג (ייפוי כוח, כתב מינוי)
  | 'to_submit';     // נדרש לצורך הגשה בפועל

/**
 * דרישת מסמך בודדת — שורה ברשימת מסמכים נדרשים.
 *
 * כל מסמך מסווג לפי 5 צירים:
 * 1. stage — באיזה שלב במחזור החיים נדרש
 * 2. purpose — למה נדרש (assess / represent / submit)
 * 3. requiredFor — לאיזה סוג שירות
 * 4. requiredForTrack — לאיזה מסלול פיצויים (אם רלוונטי)
 * 5. requiredForBasis — לאיזה בסיס פיצוי (salary_costs, eligible_expenses, etc.)
 */
export interface DocumentRequest {
  /** מזהה ייחודי */
  id: string;
  /** תיאור המסמך הנדרש */
  label: string;
  /** הסבר ללקוח — למה צריך, מאיפה להשיג */
  helpText?: string;
  /** סטטוס */
  status: DocumentRequestStatus;
  /** שלב במחזור חיים — מתי המסמך נדרש */
  stage: DocumentLifecycleStage;
  /** מטרת המסמך — assess / represent / submit */
  purpose: DocumentPurpose;
  /** סוג שירות שמחייב את המסמך */
  requiredFor: ServiceType[];
  /** מסלול פיצויים שמחייב את המסמך (null = כל המסלולים) */
  requiredForTrack?: CompensationTrack[];
  /** בסיס פיצוי שמחייב את המסמך (null = לא תלוי בבסיס) */
  requiredForBasis?: CompensationBasis[];
  /** האם חובה (true) או אופציונלי (false) */
  isMandatory: boolean;
  /** מזהה קובץ שהועלה (כשהתקבל) */
  uploadedFileId?: string;
  /** תאריך קבלה */
  receivedAt?: string;
  /** הערות פנימיות */
  internalNote?: string;
}

// #endregion

// #region Intake Questionnaire

/**
 * שאלון אפיון — מילוי ע"י ליד/לקוח בשלב הכניסה.
 * מותאם לפיצויי מלחמה, אבל כללי מספיק לשירותים אחרים.
 */
export interface IntakeQuestionnaire {
  /** מזהה ייחודי */
  id: string;
  /** מזהה הליד */
  leadId: string;
  /** מתי נשלח */
  sentAt: string;
  /** מתי הושלם (null = טרם הושלם) */
  completedAt: string | null;

  // ── פרטים אישיים ──
  /** שם מלא */
  fullName: string;
  /** ת.ז. */
  idNumber: string;
  /** טלפון */
  phone: string;
  /** אימייל */
  email: string;

  // ── פרטי העסק ──
  /** סוג ישות */
  entityType: EntityType;
  /** שם העסק (אם לא יחיד) */
  businessName?: string;
  /** מספר ח.פ. / עוסק (אם רלוונטי) */
  businessNumber?: string;
  /** מחזור דיווח מע"מ */
  vatCycle: VATCycle;

  // ── גוף השירות ──
  /** סוג שירות מבוקש */
  requestedService: ServiceType;
  /** מה הלקוח מבקש: אומדן בלבד, ערר, טיפול מלא */
  requestedScope: 'estimate_only' | 'appeal_only' | 'full_handling';
  /** האם כבר הוגשה תביעה/בקשה */
  alreadyFiled: boolean;
  /** מי הגיש בפועל את ההגשה הקודמת (שם) */
  previousFilerName?: string;
  /** מי הגיש: הלקוח עצמו, רו"ח, עו"ד, אחר */
  previousFilerType?: 'self' | 'cpa' | 'lawyer' | 'other';
  /** באיזה מסלול (אם הוגש) — אדום / עסקי / ירוק */
  filingTrack?: CompensationTrack;
  /** סכום שנתבע (אם ידוע, NIS) */
  claimedAmount?: number;
  /** סכום שאושר (אם חלקי, NIS) */
  approvedAmount?: number;
  /** מה נדחה (אם נדחה) */
  rejectionReason?: string;
  /** תאריך דחייה */
  rejectionDate?: string;
  /** מספר בקשה ברשות */
  officialCaseNumber?: string;
  /** האם יש מכתב דחייה / החלטת רשות */
  hasRejectionLetter: boolean;
  /** האם התקבלה דרישת השלמה מהרשות */
  hasCompletionRequest: boolean;
  /** תקופת הנזק (תאריך התחלה) */
  damagePeriodStart?: string;
  /** תקופת הנזק (תאריך סיום) */
  damagePeriodEnd?: string;
  /** האם שירת הלקוח / בעל העסק במילואים (צו 8) */
  isReserveDuty: boolean;
  /** תקופת שירות מילואים (אם רלוונטי) */
  reserveDutyPeriod?: string;
  /** סיווג אזורי — אזור מיוחד / יישוב ספר / כלל-ארצי */
  zoneClassification?: 'border_town' | 'special_zone' | 'nationwide';

  // ── עובדים ושכר ──
  /** האם הישות העסיקה עובדים בתקופה הרלוונטית */
  hasEmployees: boolean;
  /** כמה עובדים (null = לא ידוע) */
  employeeCount?: number;
  /** האם היה שכר / חל"ת / היעדרויות שנפגעו */
  payrollAffected: boolean;
  /** האם יש רלוונטיות למסלול שכר */
  salaryClaimsRelevant: boolean;
  /** האם יש רלוונטיות למסלול הוצאה מזכה */
  eligibleExpenseClaimsRelevant: boolean;
  /** האם קיימים דיווחי שכר (טופס 102 / ריכוזים) */
  payrollReportingAvailable: boolean;
  /** האם קיימים דוחות שכר מפורטים */
  wageReportsAvailable: boolean;

  // ── נתוני רקע ──
  /** האם יש רו"ח / מייצג חיצוני כרגע */
  hasExistingCPA: boolean;
  /** שם רו"ח / מייצג חיצוני */
  existingCPAName?: string;
  /** האם קיימות תכתובות עם הרשות (מיילים, מכתבים) */
  hasAuthorityCorrespondence: boolean;
  /** האם קיימים תחשיבים קודמים */
  hasPriorCalculations: boolean;
  /** מסמכים שכבר קיימים אצל הליד (רשימת תיאורים) */
  existingDocuments: string[];
  /** מסמכים שהליד חושב שחסרים */
  missingDocuments: string[];

  // ── הערות ──
  /** הערות חופשיות של הליד */
  notes?: string;
  /** הערות פנימיות (צוות) */
  internalNotes?: string;

  // ── B4 — Eligibility Layer ──
  /** מחזור עסקאות שנתי (NIS) — לקביעת מסלול קטן/גדול + תקרות */
  annualRevenue?: number;
  /** מועד פתיחת העסק (ISO date) — לקביעת שנת בסיס */
  businessOpenDate?: string;
  /** אחוז ירידה במחזור (0-100) — לקביעת מקדם פיצוי */
  revenueDeclinePercent?: number;
  /** סוג ענף — לקביעת מקדם ענפי */
  industryType?: IndustryType;
  /** הקשר מבצעי — באיזה מלחמה/מבצע נגרם הנזק */
  operationContext?: OperationContext;
  /** ממוצע תשומות חודשי (NIS) — לנוסחת הוצאות מזכות */
  vatInputsAverage?: number;
  /** האם יש אובדן הכנסות משכירות (נזק ישיר לנכס מושכר) */
  hasRentalIncomeLoss: boolean;
}

// #endregion

// #region Engagement

/**
 * סטטוס התקשרות — מתי ההסכם נחתם, מה התמחור, מה השירות.
 *
 * מודלי תמחור:
 * - fixed: סכום קבוע מראש (fixedFee)
 * - hourly: לפי שעה (hourlyRate x estimatedHours)
 * - success_fee: אחוז מהתוצאה (successFeePercent)
 * - monthly_retainer: ריטיינר חודשי (fixedFee = סכום חודשי)
 * - mixed: שילוב — למשל fixedFee בסיס + success_fee על החלק שמעל
 */
export interface EngagementStatus {
  /** מזהה ייחודי */
  id: string;
  /** מזהה לקוח */
  clientId: string;
  /** סוג שירות */
  serviceType: ServiceType;
  /** תאריך התחלה */
  startDate: string;
  /** תאריך סיום (null = שוטף) */
  endDate: string | null;
  /** מודל תמחור */
  pricingModel: 'fixed' | 'hourly' | 'success_fee' | 'monthly_retainer' | 'mixed' | 'consultation';
  /** סכום קבוע — fixed fee או ריטיינר חודשי (NIS) */
  fixedFee?: number;
  /** תעריף שעתי (NIS) */
  hourlyRate?: number;
  /** שעות מוערכות */
  estimatedHours?: number;
  /** אחוז עמלת הצלחה */
  successFeePercent?: number;
  /** סכום מינימום — גם ב-success fee (NIS) */
  minimumFee?: number;
  /** סכום מוסכם סה"כ — חישוב ידני או אוטומטי (NIS) */
  agreedAmount?: number;
  /** האם נחתם הסכם */
  contractSigned: boolean;
  /** תאריך חתימה */
  contractSignedAt?: string;
  /** הערות */
  notes?: string;
}

// #endregion

// #region Lead Entity

/**
 * ישות ליד — מרגע הפנייה הראשונה ועד המרה ללקוח.
 * הליד מחזיק את כל המידע שנאסף לפני שהוא הופך ללקוח.
 */
export interface LeadEntity {
  /** מזהה ייחודי — UUID */
  id: string;
  /** שם מלא */
  fullName: string;
  /** טלפון */
  phone: string;
  /** אימייל */
  email?: string;
  /** מקור הפנייה */
  source: LeadSource;
  /** שם המפנה (אם referral) */
  referredBy?: string;
  /** סטטוס נוכחי */
  status: LeadStatus;
  /** סוג שירות מבוקש (אומדן ראשוני) */
  estimatedService: ServiceType;
  /** שאלון אפיון (אם מולא) */
  intake: IntakeQuestionnaire | null;
  /** רשימת מסמכים נדרשים */
  documentRequests: DocumentRequest[];
  /** הערות פנימיות */
  internalNotes: string;
  /** ציון עדיפות (1=דחוף, 5=נמוך) */
  priority: 1 | 2 | 3 | 4 | 5;
  /** תאריך פנייה ראשונה */
  createdAt: string;
  /** תאריך עדכון אחרון */
  updatedAt: string;
  /** תאריך המרה ללקוח (אם הומר) */
  convertedAt?: string;
  /** מזהה לקוח שנוצר (אם הומר) */
  convertedToClientId?: string;
}

// #endregion

// #region Client Entity

/**
 * ישות לקוח — נוצרת מהמרת ליד.
 * מחזיקה את פרטי הלקוח, ההתקשרויות, ותיקים פעילים.
 */
export interface ClientEntity {
  /** מזהה ייחודי — UUID */
  id: string;
  /** מזהה ליד מקור */
  originLeadId: string;
  /** שם מלא */
  fullName: string;
  /** ת.ז. */
  idNumber: string;
  /** טלפון */
  phone: string;
  /** אימייל */
  email?: string;
  /** סוג ישות */
  entityType: EntityType;
  /** שם עסק (אם לא יחיד) */
  businessName?: string;
  /** מספר ח.פ. / עוסק */
  businessNumber?: string;
  /** מחזור מע"מ */
  vatCycle: VATCycle;
  /** סטטוס נוכחי */
  status: ClientStatus;
  /** התקשרויות (שירותים פעילים ולשעבר) */
  engagements: EngagementStatus[];
  /** מזהי תיקים (caseId) משויכים — קישור ל-CaseEntity */
  caseIds: string[];
  /** הערות פנימיות */
  internalNotes: string;
  /** תאריך יצירה */
  createdAt: string;
  /** תאריך עדכון */
  updatedAt: string;
}

// #endregion
