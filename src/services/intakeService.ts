/* ============================================
   FILE: intakeService.ts
   PURPOSE: Intake questionnaire validation, lead status guards,
            and Lead → Client conversion logic.
   DEPENDENCIES: ../data/leadClientTypes, ./documentRequirementsEngine
   EXPORTS: validateIntake, IntakeValidationResult,
            canTransition, convertLeadToClient
   ============================================ */

import type {
  IntakeQuestionnaire, LeadEntity, ClientEntity,
  LeadStatus, ClientStatus, EngagementStatus,
} from '../data/leadClientTypes';
import {
  LEAD_STATUS_TRANSITIONS, CLIENT_STATUS_TRANSITIONS,
} from '../data/leadClientTypes';
import { generateDocumentRequests } from './documentRequirementsEngine';

// #region Validation Types

/** Single validation error */
export interface ValidationError {
  /** Field name that failed */
  field: string;
  /** Error message in Hebrew */
  message: string;
  /** Severity — error blocks submission, warning is informational */
  severity: 'error' | 'warning';
}

/** Result of intake validation */
export interface IntakeValidationResult {
  /** Overall pass/fail */
  isValid: boolean;
  /** List of errors and warnings */
  errors: ValidationError[];
  /** Count of blocking errors */
  errorCount: number;
  /** Count of non-blocking warnings */
  warningCount: number;
}

// #endregion

// #region Intake Validation

/**
 * Validate a completed IntakeQuestionnaire.
 * Returns errors/warnings with field-level detail.
 *
 * @param intake - The questionnaire to validate
 * @returns Validation result with errors and warnings
 */
export function validateIntake(intake: IntakeQuestionnaire): IntakeValidationResult {
  const errors: ValidationError[] = [];

  // ── Required fields ──
  if (!intake.fullName.trim()) {
    errors.push({ field: 'fullName', message: 'שם מלא חסר', severity: 'error' });
  }
  if (!intake.idNumber.trim()) {
    errors.push({ field: 'idNumber', message: 'מספר ת.ז. חסר', severity: 'error' });
  } else if (!/^\d{9}$/.test(intake.idNumber.trim())) {
    errors.push({ field: 'idNumber', message: 'מספר ת.ז. חייב להיות 9 ספרות', severity: 'error' });
  }
  if (!intake.phone.trim()) {
    errors.push({ field: 'phone', message: 'טלפון חסר', severity: 'error' });
  }
  if (!intake.email.trim()) {
    errors.push({ field: 'email', message: 'אימייל חסר', severity: 'error' });
  }

  // ── Entity type logic ──
  const needsBusiness = !['individual', 'other'].includes(intake.entityType);
  if (needsBusiness && !intake.businessName?.trim()) {
    errors.push({ field: 'businessName', message: 'שם עסק חסר — נדרש לסוג ישות שנבחר', severity: 'error' });
  }

  // ── Service-specific ──
  if (intake.requestedService === 'war_appeal') {
    if (!intake.alreadyFiled) {
      errors.push({ field: 'alreadyFiled', message: 'ערר דורש שכבר הוגשה בקשה קודמת', severity: 'error' });
    }
    if (!intake.hasRejectionLetter) {
      errors.push({ field: 'hasRejectionLetter', message: 'ערר דורש מכתב דחייה / החלטה', severity: 'warning' });
    }
    if (!intake.rejectionReason?.trim()) {
      errors.push({ field: 'rejectionReason', message: 'מומלץ לציין סיבת דחייה', severity: 'warning' });
    }
  }

  if (['war_compensation', 'war_appeal'].includes(intake.requestedService)) {
    if (intake.alreadyFiled && !intake.filingTrack) {
      errors.push({ field: 'filingTrack', message: 'חובה לציין מסלול הגשה', severity: 'error' });
    }
    if (!intake.damagePeriodStart) {
      errors.push({ field: 'damagePeriodStart', message: 'תקופת נזק — תאריך התחלה חסר', severity: 'warning' });
    }

    // ── Employee / salary checks ──
    if (intake.hasEmployees && !intake.employeeCount) {
      errors.push({ field: 'employeeCount', message: 'מעסיק עובדים — חובה לציין כמה', severity: 'warning' });
    }
    if (intake.hasEmployees && !intake.salaryClaimsRelevant && !intake.eligibleExpenseClaimsRelevant) {
      errors.push({ field: 'salaryClaimsRelevant', message: 'יש עובדים — בדוק אם יש רלוונטיות למסלול שכר או הוצאה מזכה', severity: 'warning' });
    }
    if (intake.salaryClaimsRelevant && !intake.payrollReportingAvailable) {
      errors.push({ field: 'payrollReportingAvailable', message: 'מסלול שכר רלוונטי — אין דיווחי שכר. חובה להשיג טופס 102 / ריכוזי שכר', severity: 'warning' });
    }
    if (intake.eligibleExpenseClaimsRelevant && intake.existingDocuments.length === 0) {
      errors.push({ field: 'existingDocuments', message: 'הוצאה מזכה רלוונטית — אין אסמכתאות. חובה לאסוף קבלות והוצאות', severity: 'warning' });
    }
  }

  // ── VAT consistency ──
  if (intake.entityType === 'osek_patur' && intake.vatCycle !== 'exempt') {
    errors.push({ field: 'vatCycle', message: 'עוסק פטור — מחזור מע"מ צריך להיות "פטור"', severity: 'warning' });
  }

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return {
    isValid: errorCount === 0,
    errors,
    errorCount,
    warningCount,
  };
}

// #endregion

// #region Status Guards

/**
 * Check if a lead status transition is legal.
 *
 * @param from - Current status
 * @param to - Target status
 * @returns true if transition is allowed
 */
export function canLeadTransition(from: LeadStatus, to: LeadStatus): boolean {
  const allowed = LEAD_STATUS_TRANSITIONS[from];
  return allowed.includes(to);
}

/**
 * Check if a client status transition is legal.
 *
 * @param from - Current status
 * @param to - Target status
 * @returns true if transition is allowed
 */
export function canClientTransition(from: ClientStatus, to: ClientStatus): boolean {
  const allowed = CLIENT_STATUS_TRANSITIONS[from];
  return allowed.includes(to);
}

// #endregion

// #region Lead → Client Conversion

/** Result of conversion attempt */
export interface ConversionResult {
  success: boolean;
  client: ClientEntity | null;
  errors: string[];
}

/**
 * Convert a qualified Lead into a Client.
 *
 * Prerequisites:
 * - Lead.status must be 'qualified'
 * - Lead.intake must exist and be valid
 *
 * Side effects on LeadEntity:
 * - status → 'converted'
 * - convertedAt → now
 * - convertedToClientId → new client ID
 * - documentRequests regenerated (adds representation/submission docs)
 *
 * @param lead - The lead to convert (mutated in place)
 * @returns ConversionResult with new ClientEntity or errors
 */
export function convertLeadToClient(lead: LeadEntity): ConversionResult {
  const errors: string[] = [];

  // ── Pre-checks ──
  if (lead.status !== 'qualified') {
    errors.push(`סטטוס ליד חייב להיות "qualified", נמצא "${lead.status}"`);
  }
  if (!lead.intake) {
    errors.push('אין שאלון אפיון מלא — חובה לפני המרה');
  }
  if (errors.length > 0) {
    return { success: false, client: null, errors };
  }

  const intake = lead.intake!;

  // ── Validate intake ──
  const validation = validateIntake(intake);
  if (!validation.isValid) {
    return {
      success: false,
      client: null,
      errors: validation.errors
        .filter(e => e.severity === 'error')
        .map(e => `${e.field}: ${e.message}`),
    };
  }

  // ── Build client ──
  const now = new Date().toISOString();
  const clientId = crypto.randomUUID();

  const engagement: EngagementStatus = {
    id: crypto.randomUUID(),
    clientId,
    serviceType: intake.requestedService,
    startDate: now.split('T')[0],
    endDate: null,
    pricingModel: 'success_fee', // default — Eldad sets actual pricing
    contractSigned: false,
  };

  const client: ClientEntity = {
    id: clientId,
    originLeadId: lead.id,
    fullName: intake.fullName,
    idNumber: intake.idNumber,
    phone: intake.phone,
    email: intake.email || undefined,
    entityType: intake.entityType,
    businessName: intake.businessName,
    businessNumber: intake.businessNumber,
    vatCycle: intake.vatCycle,
    status: 'onboarding',
    engagements: [engagement],
    caseIds: [],
    internalNotes: '',
    createdAt: now,
    updatedAt: now,
  };

  // ── Update lead ──
  lead.status = 'converted';
  lead.convertedAt = now;
  lead.convertedToClientId = clientId;

  // ── Regenerate document requests (includes representation/submission) ──
  lead.documentRequests = generateDocumentRequests(intake);

  return { success: true, client, errors: [] };
}

// #endregion
