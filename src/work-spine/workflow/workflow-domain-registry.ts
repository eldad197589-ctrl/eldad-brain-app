/* ====
   FILE: workflow-domain-registry.ts
   PURPOSE: Static Stage 11 workflow domain registry.
   DEPENDENCIES: Workflow map contracts
   EXPORTS: Static workflow domain registry
   ==== */

// #region Imports
import type { WorkflowDomainRegistryEntry } from './workflow-map-types';
// #endregion

// #region Registry
/** Static registry for the eight approved Stage 11 workflow domains. */
export const WORKFLOW_DOMAIN_REGISTRY: readonly WorkflowDomainRegistryEntry[] = [
  {
    domain: 'protocol_task_management',
    hebrewLabel: 'ניהול משימות מפרוטוקול',
    englishLabel: 'Protocol Task Management',
    goal: 'Map protocol metadata into a read-only action summary workflow.',
    defaultRiskLevel: 'medium',
    professionalReviewRequired: false,
    reviewerRequirement: 'Eldad review before any later task operation.',
    expectedOutputTypes: ['protocol_action_summary', 'task_summary'],
  },
  {
    domain: 'client_case_filing',
    hebrewLabel: 'תיוק תיק לקוח',
    englishLabel: 'Client Case Filing',
    goal: 'Map approved metadata into a read-only client filing workflow.',
    defaultRiskLevel: 'high',
    professionalReviewRequired: true,
    reviewerRequirement: 'Eldad review before any matter or filing operation.',
    expectedOutputTypes: ['evidence_summary', 'task_summary'],
  },
  {
    domain: 'bookkeeping',
    hebrewLabel: 'הנהלת חשבונות',
    englishLabel: 'Bookkeeping',
    goal: 'Map accounting metadata into a read-only bookkeeping review workflow.',
    defaultRiskLevel: 'medium',
    professionalReviewRequired: false,
    reviewerRequirement: 'Eldad review before any bookkeeping operation.',
    expectedOutputTypes: ['task_summary', 'evidence_summary'],
  },
  {
    domain: 'vat',
    hebrewLabel: 'מע״מ',
    englishLabel: 'VAT',
    goal: 'Map VAT metadata into a read-only review memo workflow.',
    defaultRiskLevel: 'high',
    professionalReviewRequired: true,
    reviewerRequirement: 'Eldad review before any VAT output or submission gate.',
    expectedOutputTypes: ['vat_review_memo', 'task_summary'],
  },
  {
    domain: 'payroll',
    hebrewLabel: 'שכר',
    englishLabel: 'Payroll',
    goal: 'Map payroll metadata into a read-only payroll review workflow.',
    defaultRiskLevel: 'high',
    professionalReviewRequired: true,
    reviewerRequirement: 'Eldad review before any payroll operation.',
    expectedOutputTypes: ['task_summary', 'letter'],
  },
  {
    domain: 'war_compensation',
    hebrewLabel: 'פיצויי מלחמה',
    englishLabel: 'War Compensation',
    goal: 'Map compensation metadata into a read-only evidence workflow.',
    defaultRiskLevel: 'high',
    professionalReviewRequired: true,
    reviewerRequirement: 'Eldad review before any claim or evidence operation.',
    expectedOutputTypes: ['evidence_summary', 'letter'],
  },
  {
    domain: 'labor_law',
    hebrewLabel: 'דיני עבודה',
    englishLabel: 'Labor Law',
    goal: 'Map labor-law metadata into a read-only professional review workflow.',
    defaultRiskLevel: 'high',
    professionalReviewRequired: true,
    reviewerRequirement: 'Eldad professional review required before any legal output.',
    expectedOutputTypes: ['letter', 'professional_opinion_draft'],
  },
  {
    domain: 'expert_opinions',
    hebrewLabel: 'חוות דעת מומחה',
    englishLabel: 'Expert Opinions',
    goal: 'Map expert-opinion metadata into a critical read-only review workflow.',
    defaultRiskLevel: 'critical',
    professionalReviewRequired: true,
    reviewerRequirement: 'Eldad professional review required before any opinion draft.',
    expectedOutputTypes: ['professional_opinion_draft', 'evidence_summary'],
  },
] as const;
// #endregion
