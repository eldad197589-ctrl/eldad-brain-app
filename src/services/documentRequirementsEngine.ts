/* ============================================
   FILE: documentRequirementsEngine.ts
   PURPOSE: Smart document requirements generation.
            Given an IntakeQuestionnaire, produces the correct
            DocumentRequest[] based on service type, track,
            entity type, and lifecycle stage.
   DEPENDENCIES: ../data/leadClientTypes
   EXPORTS: generateDocumentRequests, DOC_CATALOG
   ============================================ */

import type {
  IntakeQuestionnaire, DocumentRequest, ServiceType,
  CompensationTrack, CompensationBasis, EntityType,
  DocumentLifecycleStage, DocumentPurpose,
} from '../data/leadClientTypes';

// #region Catalog Entry

/**
 * Master catalog entry — one per document type.
 * The engine filters these based on intake answers.
 */
interface CatalogEntry {
  /** Unique catalog key */
  key: string;
  /** Display label */
  label: string;
  /** Help text for client */
  helpText: string;
  /** Lifecycle stage */
  stage: DocumentLifecycleStage;
  /** Purpose */
  purpose: DocumentPurpose;
  /** Which services require this */
  services: ServiceType[] | 'all';
  /** Which tracks require this (null = all tracks) */
  tracks?: CompensationTrack[];
  /** Which entity types require this (null = all) */
  entityTypes?: EntityType[];
  /** Mandatory or optional */
  mandatory: boolean;
  /** Which compensation basis requires this (null = not basis-dependent) */
  basis?: CompensationBasis[];
  /**
   * Condition function — extra logic beyond service/track/entity.
   * Returns true if this document should be included.
   */
  condition?: (intake: IntakeQuestionnaire) => boolean;
}

// #endregion

// #region Master Catalog

/**
 * רשימת מסמכים מאסטר — כל המסמכים שהמערכת יודעת לדרוש.
 * כל entry מסווג לפי stage / purpose / service / track.
 */
export const DOC_CATALOG: CatalogEntry[] = [
  // ═══════════════════════════════════
  // שלב ליד — להבנת התיק (to_assess)
  // ═══════════════════════════════════
  {
    key: 'id_card',
    label: 'צילום תעודת זהות + ספח',
    helpText: 'צילום ברור משני הצדדים כולל ספח כתובת',
    stage: 'lead_intake',
    purpose: 'to_assess',
    services: 'all',
    mandatory: true,
  },
  {
    key: 'rejection_letter',
    label: 'מכתב דחייה / החלטת הרשות',
    helpText: 'ההחלטה המקורית שהתקבלה מהרשות',
    stage: 'lead_intake',
    purpose: 'to_assess',
    services: ['war_appeal'],
    mandatory: true,
    condition: (intake) => intake.hasRejectionLetter,
  },
  {
    key: 'completion_request',
    label: 'דרישת השלמה מהרשות',
    helpText: 'מכתב הדורש השלמת מסמכים',
    stage: 'lead_intake',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    mandatory: false,
    condition: (intake) => intake.hasCompletionRequest,
  },
  {
    key: 'original_claim',
    label: 'טופס הבקשה / התביעה המקורית',
    helpText: 'העתק מהבקשה שהוגשה לרשות',
    stage: 'lead_intake',
    purpose: 'to_assess',
    services: ['war_appeal'],
    mandatory: true,
    condition: (intake) => intake.alreadyFiled,
  },
  {
    key: 'authority_correspondence',
    label: 'תכתובות עם הרשות',
    helpText: 'כל המיילים, מכתבים או הודעות שהתקבלו',
    stage: 'lead_intake',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    mandatory: false,
    condition: (intake) => intake.hasAuthorityCorrespondence,
  },

  // ═══════════════════════════════════
  // שלב אומדן — הערכת כדאיות (to_assess)
  // ═══════════════════════════════════
  {
    key: 'financial_statements',
    label: 'דוחות כספיים — שנתיים',
    helpText: 'דוחות כספיים ל-2-3 שנים אחרונות',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal', 'expert_opinion'],
    tracks: ['business', 'red'],
    entityTypes: ['osek_murshe', 'company', 'partnership', 'amuta', 'cooperative'],
    mandatory: true,
  },
  {
    key: 'vat_reports',
    label: 'דוחות מע"מ — תקופתיים',
    helpText: 'דוחות מע"מ לתקופת הנזק ותקופת ההשוואה',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    tracks: ['business'],
    mandatory: true,
    condition: (intake) => intake.vatCycle !== 'exempt' && intake.vatCycle !== 'none',
  },
  {
    key: 'revenue_comparison',
    label: 'השוואת מחזורים — תקופת נזק vs תקופת בסיס',
    helpText: 'טבלה או דוח מסכם של מחזורים לפני ואחרי',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    tracks: ['business'],
    mandatory: true,
  },
  {
    key: 'payslips',
    label: 'תלושי שכר — 12 חודשים',
    helpText: 'תלושי שכר לשנה שלפני ולתקופת הנזק',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    tracks: ['employee'],
    mandatory: true,
  },
  {
    key: 'damage_evidence',
    label: 'ראיות נזק ישיר',
    helpText: 'תמונות, חוות דעת שמאי, הערכות נזק',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    tracks: ['red'],
    mandatory: true,
  },
  {
    key: 'prior_calculations',
    label: 'תחשיבים קודמים',
    helpText: 'תחשיבים שהוכנו בעבר ע"י רו"ח או יועץ',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal', 'expert_opinion'],
    mandatory: false,
    condition: (intake) => intake.hasPriorCalculations,
  },
  {
    key: 'lease_contract',
    label: 'חוזה שכירות / בעלות על הנכס',
    helpText: 'חוזה שכירות או נסח טאבו',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    tracks: ['red', 'business'],
    mandatory: false,
  },
  {
    key: 'business_license',
    label: 'רישיון עסק',
    helpText: 'רישיון עסק מהרשות המקומית',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    tracks: ['business', 'red'],
    entityTypes: ['osek_murshe', 'company', 'partnership'],
    mandatory: false,
  },

  // ═══════════════════════════════════
  // שלב קליטה — אחרי הסכם (to_assess)
  // ═══════════════════════════════════
  {
    key: 'bank_details',
    label: 'אישור ניהול חשבון בנק',
    helpText: 'אישור רשמי מהבנק עם פרטי חשבון',
    stage: 'post_engagement',
    purpose: 'to_assess',
    services: 'all',
    mandatory: true,
  },
  {
    key: 'hashavshevet_export',
    label: 'גיבוי חשבשבת / מערכת הנה"ח',
    helpText: 'ייצוא נתונים ממערכת ההנה"ח',
    stage: 'post_engagement',
    purpose: 'to_assess',
    services: ['bookkeeping', 'tax_return', 'expert_opinion'],
    mandatory: false,
  },

  // ═══════════════════════════════════
  // שלב ייצוג — ייפוי כוח (to_represent)
  // ═══════════════════════════════════
  {
    key: 'power_of_attorney',
    label: 'ייפוי כוח',
    helpText: 'ייפוי כוח חתום לצורך ייצוג מול הרשות',
    stage: 'representation',
    purpose: 'to_represent',
    services: ['war_compensation', 'war_appeal', 'tax_return', 'capital_gains'],
    mandatory: true,
  },
  {
    key: 'appointment_letter',
    label: 'כתב מינוי',
    helpText: 'כתב מינוי רו"ח לצורך ביקורת / חוות דעת',
    stage: 'representation',
    purpose: 'to_represent',
    services: ['expert_opinion', 'guardian'],
    mandatory: true,
  },

  // ═══════════════════════════════════
  // שלב הגשה — מסמכי הגשה (to_submit)
  // ═══════════════════════════════════
  {
    key: 'signed_appeal_form',
    label: 'טופס ערר חתום',
    helpText: 'טופס ערר מלא וחתום ע"י הלקוח',
    stage: 'submission',
    purpose: 'to_submit',
    services: ['war_appeal'],
    mandatory: true,
  },
  {
    key: 'signed_claim_form',
    label: 'טופס תביעה חתום',
    helpText: 'טופס תביעה מלא וחתום',
    stage: 'submission',
    purpose: 'to_submit',
    services: ['war_compensation'],
    mandatory: true,
  },
  {
    key: 'calculation_appendix',
    label: 'נספח תחשיב מפורט',
    helpText: 'תחשיב הנזק / הפיצוי שנערך ע"י המשרד',
    stage: 'submission',
    purpose: 'to_submit',
    services: ['war_compensation', 'war_appeal', 'expert_opinion'],
    mandatory: true,
  },

  // ═══════════════════════════════════
  // רכיב שכר — מסמכים לעובדים ועלויות שכר
  // ═══════════════════════════════════
  {
    key: 'payroll_reports_102',
    label: 'דיווחי שכר — טופס 102',
    helpText: 'טופסי 102 לתקופת הנזק ותקופת השוואה',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    basis: ['salary_costs'],
    mandatory: true,
    condition: (intake) => intake.hasEmployees && intake.salaryClaimsRelevant,
  },
  {
    key: 'wage_summaries',
    label: 'ריכוזי שכר מפורטים',
    helpText: 'סיכום עלויות שכר לפי חודשים — תקופת נזק והשוואה',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    basis: ['salary_costs'],
    mandatory: true,
    condition: (intake) => intake.hasEmployees && intake.wageReportsAvailable,
  },
  {
    key: 'employee_list',
    label: 'רשימת עובדים',
    helpText: 'רשימת עובדים בתקופה הרלוונטית — שם, ת.ז., תפקיד, סטטוס',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    basis: ['salary_costs'],
    mandatory: true,
    condition: (intake) => intake.hasEmployees,
  },
  {
    key: 'leave_records',
    label: 'אישורי חל"ת / היעדרויות',
    helpText: 'אישורי חופשה ללא שכר / חל"ת / היעדרויות עובדים',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    basis: ['salary_costs'],
    mandatory: false,
    condition: (intake) => intake.hasEmployees && intake.payrollAffected,
  },
  {
    key: 'eligible_expense_receipts',
    label: 'אסמכתאות הוצאה מזכה',
    helpText: 'קבלות, חשבוניות, אסמכתאות להוצאות שהוכרו בתקופת הנזק',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    basis: ['eligible_expenses'],
    mandatory: true,
    condition: (intake) => intake.eligibleExpenseClaimsRelevant,
  },
  {
    key: 'salary_claim_appendix',
    label: 'נספח תחשיב רכיב שכר',
    helpText: 'תחשיב עלויות שכר נוספות — חל"ת, היעדרויות, שעות נוספות',
    stage: 'submission',
    purpose: 'to_submit',
    services: ['war_compensation', 'war_appeal'],
    basis: ['salary_costs'],
    mandatory: true,
    condition: (intake) => intake.hasEmployees && intake.salaryClaimsRelevant,
  },

  // ═══════════════════════════════════
  // מענק מילואים — צו 8
  // ═══════════════════════════════════
  {
    key: 'reserve_duty_confirmation',
    label: 'אישור שירות מילואים — צו 8',
    helpText: 'אישור רשמי מצה"ל על שירות מילואים בתקופת חרבות ברזל',
    stage: 'lead_intake',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    mandatory: true,
    condition: (intake) => intake.isReserveDuty,
  },
  {
    key: 'reserve_duty_period',
    label: 'סיכום תקופת שירות מילואים',
    helpText: 'פירוט ימי השירות — תאריכי התחלה וסיום',
    stage: 'pre_assessment',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    mandatory: true,
    condition: (intake) => intake.isReserveDuty,
  },

  // ═══════════════════════════════════
  // מסלול ירוק — אזור מיוחד
  // ═══════════════════════════════════
  {
    key: 'zone_classification',
    label: 'אישור סיווג אזורי — אזור מיוחד / יישוב ספר',
    helpText: 'אישור שהעסק נמצא באזור מיוחד או ביישוב ספר',
    stage: 'lead_intake',
    purpose: 'to_assess',
    services: ['war_compensation', 'war_appeal'],
    mandatory: true,
    condition: (intake) => intake.zoneClassification === 'border_town' || intake.zoneClassification === 'special_zone',
  },
];

// #endregion

// #region Engine

let _nextId = 1;

/**
 * Generate DocumentRequest[] from a completed IntakeQuestionnaire.
 *
 * Filters the master catalog by:
 * 1. Service type match
 * 2. Compensation track match (if applicable)
 * 3. Entity type match (if applicable)
 * 4. Custom condition function
 *
 * @param intake - Completed intake questionnaire
 * @returns Array of DocumentRequest ready for assignment to LeadEntity
 */
export function generateDocumentRequests(
  intake: IntakeQuestionnaire,
): DocumentRequest[] {
  const results: DocumentRequest[] = [];

  for (const entry of DOC_CATALOG) {
    // ── Service filter ──
    if (entry.services !== 'all') {
      if (!entry.services.includes(intake.requestedService)) continue;
    }

    // ── Track filter ──
    if (entry.tracks && intake.filingTrack) {
      if (!entry.tracks.includes(intake.filingTrack)) continue;
    }

    // ── Entity type filter ──
    if (entry.entityTypes) {
      if (!entry.entityTypes.includes(intake.entityType)) continue;
    }

    // ── Condition filter ──
    if (entry.condition && !entry.condition(intake)) continue;

    // ── Basis filter ──
    if (entry.basis) {
      const intakeBases: CompensationBasis[] = [];
      if (intake.salaryClaimsRelevant) intakeBases.push('salary_costs');
      if (intake.eligibleExpenseClaimsRelevant) intakeBases.push('eligible_expenses');
      // Revenue loss / direct damage inferred from track
      if (intake.filingTrack === 'business') intakeBases.push('revenue_loss');
      if (intake.filingTrack === 'red') intakeBases.push('direct_damage');
      const hasMatch = entry.basis.some(b => intakeBases.includes(b));
      if (!hasMatch) continue;
    }

    results.push({
      id: `doc-req-${_nextId++}`,
      label: entry.label,
      helpText: entry.helpText,
      status: 'pending',
      stage: entry.stage,
      purpose: entry.purpose,
      requiredFor: entry.services === 'all' ? [intake.requestedService] : entry.services,
      requiredForTrack: entry.tracks,
      requiredForBasis: entry.basis,
      isMandatory: entry.mandatory,
    });
  }

  return results;
}

// #endregion
