/* ============================================
   FILE: lead-to-unified-intake.ts
   PURPOSE: Pure mapper from lead metadata fixtures to unified intake candidates.
   DEPENDENCIES: unified-intake-registry types
   EXPORTS: createUnifiedIntakeFromLeads and related input/result types
   ============================================ */

// #region Imports
import type {
  LeadSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
  UnifiedIntakeSuggestedContext,
  UnifiedIntakeWarning,
} from './unified-intake-registry';
// #endregion

// #region Input Types
export interface LeadIntakeInput {
  leadId?: string;
  leadSource?: string;
  contactFields?: Record<string, string>;
  submittedAt?: string;
  declaredInterest?: string;
  declaredClientName?: string;
  declaredCompanyName?: string;
  email?: string;
  phone?: string;
  messageText?: string;
  sourceCampaign?: string;
  referrer?: string;
  notes?: string;
}
// #endregion

// #region Result Types
export interface LeadToUnifiedIntakeSkippedItem {
  sourceId: string;
  reason: 'missing_lead_id';
}

export interface LeadToUnifiedIntakeError {
  sourceId: string;
  message: string;
}

export interface LeadToUnifiedIntakeDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  leadCount: number;
  warnings: UnifiedIntakeWarning[];
  skippedItems: LeadToUnifiedIntakeSkippedItem[];
  errors: LeadToUnifiedIntakeError[];
}

export interface LeadToUnifiedIntakeResult {
  candidates: UnifiedIntakeCandidate<LeadSourceMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: LeadToUnifiedIntakeDiagnostics;
}
// #endregion

// #region Helpers
const LEAD_FORM_FALLBACK = 'Lead form without declared interest';

const stableHash = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const isMissing = (value?: string): boolean => !value || value.trim() === '';

const hasContactFields = (contactFields?: Record<string, string>): boolean =>
  Object.values(contactFields ?? {}).some((value) => !isMissing(value));

const sourceIdentity = (lead: LeadIntakeInput): string =>
  lead.leadId || lead.email || lead.phone || lead.declaredClientName || 'unknown-lead';

const createCandidateId = (
  lead: Required<Pick<LeadIntakeInput, 'leadId'>> & LeadIntakeInput
): string =>
  `unified-lead-candidate-${stableHash(
    ['lead', lead.leadId, lead.leadSource ?? '', lead.submittedAt ?? ''].join('|')
  )}`;

const createEvidenceId = (
  candidateId: string,
  lead: Required<Pick<LeadIntakeInput, 'leadId'>> & LeadIntakeInput
): string =>
  `unified-lead-evidence-${stableHash(['lead_form', candidateId, lead.leadId].join('|'))}`;

const createWarning = (warningCode: string, message: string): UnifiedIntakeWarning => ({
  warningCode,
  message,
  severity: 'warning',
});

const createLeadWarnings = (lead: LeadIntakeInput): UnifiedIntakeWarning[] => {
  const warnings: UnifiedIntakeWarning[] = [];

  if (isMissing(lead.submittedAt)) {
    warnings.push(createWarning('missing_submitted_at', 'Lead metadata is missing submittedAt.'));
  }
  if (!hasContactFields(lead.contactFields)) {
    warnings.push(createWarning('missing_contact_fields', 'Lead metadata is missing contact fields.'));
  }
  if (isMissing(lead.declaredInterest)) {
    warnings.push(createWarning('missing_declared_interest', 'Lead metadata is missing declaredInterest.'));
  }
  if (isMissing(lead.messageText)) {
    warnings.push(createWarning('missing_message_text', 'Lead metadata is missing messageText.'));
  }

  return warnings;
};

const createSuggestedContext = (lead: LeadIntakeInput): UnifiedIntakeSuggestedContext[] => {
  const contexts: UnifiedIntakeSuggestedContext[] = [];
  const addHint = (label: string | undefined, source: string): void => {
    const trimmed = label?.trim();
    if (!trimmed) return;
    contexts.push({
      label: trimmed,
      source,
      confidence: 'low',
      isConfirmed: false,
    });
  };

  addHint(lead.leadSource, 'lead_source');
  for (const [fieldName, fieldValue] of Object.entries(lead.contactFields ?? {})) {
    addHint(fieldValue, `lead_contact_field:${fieldName}`);
  }
  addHint(lead.declaredInterest, 'lead_declared_interest');
  addHint(lead.declaredClientName, 'lead_declared_client_name');
  addHint(lead.declaredCompanyName, 'lead_declared_company_name');
  addHint(lead.email, 'lead_email');
  addHint(lead.phone, 'lead_phone');
  addHint(lead.messageText, 'lead_message_text');
  addHint(lead.sourceCampaign, 'lead_source_campaign');
  addHint(lead.referrer, 'lead_referrer');
  addHint(lead.notes, 'lead_notes');

  return contexts;
};

const createEvidenceRef = (
  candidateId: string,
  lead: Required<Pick<LeadIntakeInput, 'leadId'>> & LeadIntakeInput
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createEvidenceId(candidateId, lead),
  sourceType: 'lead',
  sourceCandidateId: candidateId,
  evidenceKind: 'lead_form',
  title: lead.declaredInterest?.trim() || lead.messageText?.trim() || LEAD_FORM_FALLBACK,
  leadId: lead.leadId,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createSourceMetadata = (
  lead: Required<Pick<LeadIntakeInput, 'leadId'>> & LeadIntakeInput
): LeadSourceMetadata => ({
  sourceType: 'lead',
  leadId: lead.leadId,
  leadSource: lead.leadSource ?? '',
  contactFields: lead.contactFields ?? {},
  submittedAt: lead.submittedAt ?? '',
  declaredInterest: lead.declaredInterest ?? '',
});

const createCandidate = (
  lead: Required<Pick<LeadIntakeInput, 'leadId'>> & LeadIntakeInput,
  candidateId: string,
  evidenceRefs: UnifiedIntakeEvidenceRef[],
  warnings: UnifiedIntakeWarning[]
): UnifiedIntakeCandidate<LeadSourceMetadata> => ({
  candidateId,
  sourceType: 'lead',
  sourceId: lead.leadId,
  sourceLabel: lead.declaredInterest?.trim() || lead.declaredClientName?.trim() || lead.email?.trim() || lead.leadId,
  receivedAt: lead.submittedAt ?? '',
  createdAt: lead.submittedAt ?? '',
  updatedAt: lead.submittedAt ?? '',
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext: createSuggestedContext(lead),
  evidenceRefs,
  warnings,
  sourceMetadata: createSourceMetadata(lead),
});
// #endregion

// #region Public Exports
/**
 * Maps lead metadata fixtures into unified intake candidates in memory only.
 * This function does not connect to external services, classify, persist, or create records.
 */
export function createUnifiedIntakeFromLeads(leads: readonly LeadIntakeInput[]): LeadToUnifiedIntakeResult {
  const candidates: UnifiedIntakeCandidate<LeadSourceMetadata>[] = [];
  const evidenceRefs: UnifiedIntakeEvidenceRef[] = [];
  const warnings: UnifiedIntakeWarning[] = [];
  const skippedItems: LeadToUnifiedIntakeSkippedItem[] = [];
  const errors: LeadToUnifiedIntakeError[] = [];

  for (const lead of leads) {
    const sourceId = sourceIdentity(lead);

    if (isMissing(lead.leadId)) {
      skippedItems.push({ sourceId, reason: 'missing_lead_id' });
      errors.push({ sourceId, message: 'Lead metadata is missing leadId.' });
      continue;
    }

    const normalizedLead = {
      ...lead,
      leadId: lead.leadId,
    };
    const leadWarnings = createLeadWarnings(lead);
    warnings.push(...leadWarnings);

    const candidateId = createCandidateId(normalizedLead);
    const evidenceRef = createEvidenceRef(candidateId, normalizedLead);

    evidenceRefs.push(evidenceRef);
    candidates.push(createCandidate(normalizedLead, candidateId, [evidenceRef], leadWarnings));
  }

  return {
    candidates,
    evidenceRefs,
    diagnostics: {
      candidateCount: candidates.length,
      evidenceCount: evidenceRefs.length,
      leadCount: leads.length,
      warnings,
      skippedItems,
      errors,
    },
  };
}
// #endregion
