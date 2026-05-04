/* ==== FILE: src/work-spine/proof-of-life/proof-of-life-standard.ts ==== */

// #region Imports
import {
  STATIC_VISUAL_PROOF_SAFETY_STATUS,
  STATIC_VISUAL_PROOF_STATUS,
} from './proof-of-life-types';
import type { ProofOfLifeScenario, VerificationMethod } from './proof-of-life-types';
// #endregion

// #region Constants
const MANUAL_WORKBENCH_ROUTE = '/internal/manual-preview-workbench';
const COMMIT_REFERENCE = '31facca Add knowledge inventory preview to manual workbench';

const COMMON_WARNINGS = [
  'תצוגה זו מציגה מפת ידע סטטית בלבד. אין כאן ידע מחייב, אין פעולה, ואין יצירת משימה.',
  'A proof only confirms that a preview is visibly rendered for a known input.',
] as const;

const COMMON_BLOCKED_ACTIONS = [
  'blocked_live_execution',
  'blocked_provider_connection',
  'blocked_persistence',
  'blocked_task_or_object_creation',
  'blocked_professional_correctness_claim',
] as const;

const COMMON_SAFETY_FLAGS = [
  'static_checklist_only',
  'preview_visible_only',
  'no_live_execution',
  'no_professional_correctness_proven',
  'no_binding_knowledge',
  'no_source_verification',
  'no_provider_connection',
  'no_operational_readiness',
  'no_task_or_object_creation',
] as const;

const COMMON_FORBIDDEN_OUTCOMES = [
  {
    outcomeId: 'no-action-creation',
    description: 'No action, task, matter, document reference, filing, or accounting entry is created.',
  },
  {
    outcomeId: 'no-live-provider',
    description: 'No live provider, Maven, Gmail, Drive, OCR, PDF, or Excel connection is proven or used.',
  },
  {
    outcomeId: 'no-persistence',
    description: 'No persistence, database write, store write, or ledger entry is created.',
  },
] as const;

const MANUAL_WORKBENCH_TEST: VerificationMethod = {
  methodId: 'manual-workbench-focused-vitest',
  label: 'npx.cmd vitest run src/pages/internal/manual-preview-workbench/ManualPreviewWorkbench.test.tsx --reporter=verbose',
  expectedResult: 'Manual Workbench preview tests pass for the known input scenario.',
};

const KNOWLEDGE_INVENTORY_TEST: VerificationMethod = {
  methodId: 'knowledge-inventory-focused-vitest',
  label: 'npx.cmd vitest run src/work-spine/knowledge-inventory/brain-knowledge-inventory-seed.test.ts --reporter=verbose --config vitest.brain-knowledge-inventory.config.mjs',
  expectedResult: 'Static knowledge inventory seed remains preview-only and non-executing.',
};
// #endregion

// #region Helpers
/**
 * Build a static visual proof scenario with the common safety baseline.
 * @param scenario - Scenario-specific proof fields.
 * @returns A static visual proof scenario.
 */
const buildScenario = (
  scenario: Omit<
    ProofOfLifeScenario,
    | 'route'
    | 'commitReference'
    | 'proofStatus'
    | 'safetyStatus'
    | 'staticChecklistOnly'
    | 'previewVisibleOnly'
    | 'noLiveExecution'
    | 'noProfessionalCorrectnessProven'
    | 'noBindingKnowledge'
    | 'noSourceVerification'
    | 'noProviderConnection'
    | 'noOperationalReadiness'
    | 'noTaskOrObjectCreation'
  >,
): ProofOfLifeScenario => ({
  ...scenario,
  route: MANUAL_WORKBENCH_ROUTE,
  commitReference: COMMIT_REFERENCE,
  proofStatus: STATIC_VISUAL_PROOF_STATUS,
  safetyStatus: STATIC_VISUAL_PROOF_SAFETY_STATUS,
  staticChecklistOnly: true,
  previewVisibleOnly: true,
  noLiveExecution: true,
  noProfessionalCorrectnessProven: true,
  noBindingKnowledge: true,
  noSourceVerification: true,
  noProviderConnection: true,
  noOperationalReadiness: true,
  noTaskOrObjectCreation: true,
});
// #endregion

// #region Seed
/** Static Visual Proof Checklist scenarios for known Manual Workbench demo inputs. */
export const STATIC_VISUAL_PROOF_CHECKLIST_SCENARIOS = [
  buildScenario({
    scenarioId: 'manual-workbench-scans-dima',
    checkpointName: 'Proof of Life - סריקות דימה',
    demoInput: 'סריקות דימה',
    expectedVisibleOutput: [
      'Dima case work context',
      'partial_static',
      'Static scanned intake evidence batch',
      'committed_static',
    ],
    forbiddenVisibleOutput: ['task creation', 'filing', 'source verification', 'provider connection'],
    whatMustNotAppear: ['נוצרה משימה', 'המסמך תויק', 'המקור אומת', 'חיבור ספק פעיל'],
    requiredSafetyWarnings: [
      ...COMMON_WARNINGS,
      'הקשר חלקי בלבד — נדרש אימות מקור',
      'Static historical inventory only. Not approved or binding knowledge.',
      'הקשר תיק אינו ראיה מחייבת ללא אישור ובדיקת מקור.',
    ],
    automatedTests: [MANUAL_WORKBENCH_TEST, KNOWLEDGE_INVENTORY_TEST],
    manualVerificationSteps: [
      'Open /internal/manual-preview-workbench.',
      'Type סריקות דימה in the manual input fields.',
      'Confirm both Dima context and static scanned intake context are visibly rendered.',
      'Confirm no creation, filing, source verification, or provider connection appears.',
    ],
    forbiddenOutcomes: COMMON_FORBIDDEN_OUTCOMES,
    blockedActions: COMMON_BLOCKED_ACTIONS,
    safetyFlags: COMMON_SAFETY_FLAGS,
    visibilityRules: [
      {
        ruleId: 'dima-and-scans-visible',
        shouldAppear: ['Dima case work context', 'Static scanned intake evidence batch'],
        mustNotAppear: ['task creation', 'filing', 'source verification', 'provider connection'],
        visualProofLimitation: 'This proves only that related static preview records are visible together.',
      },
    ],
    visualProofLimitation: 'This scenario proves only visible preview rendering for Dima and scans context.',
  }),
  buildScenario({
    scenarioId: 'manual-workbench-tsila-payroll',
    checkpointName: 'Proof of Life - צילה שכר',
    demoInput: 'צילה שכר',
    expectedVisibleOutput: ['Tsila wage-rights and payroll context', 'known_context_only'],
    forbiddenVisibleOutput: ['payroll calculation', 'professional conclusion', 'binding evidence'],
    whatMustNotAppear: ['חישוב שכר מחייב', 'מסקנה מקצועית', 'ראיה מחייבת'],
    requiredSafetyWarnings: [
      ...COMMON_WARNINGS,
      'הקשר ידוע בלבד — לא ראיה מחייבת',
      'הקשר תיק אינו ראיה מחייבת ללא אישור ובדיקת מקור.',
    ],
    automatedTests: [MANUAL_WORKBENCH_TEST, KNOWLEDGE_INVENTORY_TEST],
    manualVerificationSteps: [
      'Open /internal/manual-preview-workbench.',
      'Type צילה שכר in the manual input fields.',
      'Confirm Tsila appears only as known_context_only.',
      'Confirm no payroll calculation or professional conclusion appears.',
    ],
    forbiddenOutcomes: COMMON_FORBIDDEN_OUTCOMES,
    blockedActions: COMMON_BLOCKED_ACTIONS,
    safetyFlags: COMMON_SAFETY_FLAGS,
    visibilityRules: [
      {
        ruleId: 'tsila-known-context-visible',
        shouldAppear: ['Tsila wage-rights and payroll context', 'known_context_only'],
        mustNotAppear: ['payroll calculation', 'professional conclusion', 'binding evidence'],
        visualProofLimitation: 'This proves only that known Tsila context is visibly rendered as non-binding.',
      },
    ],
    visualProofLimitation: 'This scenario proves only visible preview rendering for Tsila wage context.',
  }),
  buildScenario({
    scenarioId: 'manual-workbench-vat-maven-bezeq',
    checkpointName: 'Proof of Life - מע״מ מייבן בזק',
    demoInput: 'מע״מ מייבן בזק',
    expectedVisibleOutput: [
      'VAT static evidence and bookkeeping reconciliation examples',
      'אין גישה חיה למייבן. אין חיבור ספק. רמז סטטי בלבד.',
    ],
    forbiddenVisibleOutput: ['Maven connection', 'posting', 'VAT filing', 'accounting entry'],
    whatMustNotAppear: ['חיבור חי למייבן', 'רישום בהנהלת חשבונות', 'דוח מע״מ הוגש', 'פקודת יומן נוצרה'],
    requiredSafetyWarnings: [
      ...COMMON_WARNINGS,
      'אין גישה חיה למייבן. אין חיבור ספק. רמז סטטי בלבד.',
      'Static historical inventory only. Not approved or binding knowledge.',
    ],
    automatedTests: [MANUAL_WORKBENCH_TEST, KNOWLEDGE_INVENTORY_TEST],
    manualVerificationSteps: [
      'Open /internal/manual-preview-workbench.',
      'Type מע״מ מייבן בזק in the manual input fields.',
      'Confirm VAT static evidence appears with the no-live-Maven warning.',
      'Confirm no Maven connection, posting, VAT filing, or accounting entry appears.',
    ],
    forbiddenOutcomes: COMMON_FORBIDDEN_OUTCOMES,
    blockedActions: COMMON_BLOCKED_ACTIONS,
    safetyFlags: COMMON_SAFETY_FLAGS,
    visibilityRules: [
      {
        ruleId: 'vat-static-evidence-visible',
        shouldAppear: ['VAT static evidence and bookkeeping reconciliation examples'],
        mustNotAppear: ['Maven connection', 'posting', 'VAT filing', 'accounting entry'],
        visualProofLimitation: 'This proves only that static VAT context is visibly rendered without live access.',
      },
    ],
    visualProofLimitation: 'This scenario proves only visible preview rendering for static VAT evidence.',
  }),
  buildScenario({
    scenarioId: 'manual-workbench-scans-only',
    checkpointName: 'Proof of Life - סריקות',
    demoInput: 'סריקות',
    expectedVisibleOutput: ['Static scanned intake evidence batch', 'committed_static'],
    forbiddenVisibleOutput: ['all evidence records', 'Dima false match', 'Tsila false match', 'VAT false match'],
    whatMustNotAppear: ['Dima case work context', 'Tsila wage-rights and payroll context', 'VAT static evidence'],
    requiredSafetyWarnings: [
      ...COMMON_WARNINGS,
      'Static historical inventory only. Not approved or binding knowledge.',
    ],
    automatedTests: [MANUAL_WORKBENCH_TEST, KNOWLEDGE_INVENTORY_TEST],
    manualVerificationSteps: [
      'Open /internal/manual-preview-workbench.',
      'Type סריקות in the manual input fields.',
      'Confirm static scanned intake appears by itself.',
      'Confirm Dima, Tsila, and VAT false matches do not appear.',
    ],
    forbiddenOutcomes: COMMON_FORBIDDEN_OUTCOMES,
    blockedActions: COMMON_BLOCKED_ACTIONS,
    safetyFlags: COMMON_SAFETY_FLAGS,
    visibilityRules: [
      {
        ruleId: 'scans-only-visible',
        shouldAppear: ['Static scanned intake evidence batch'],
        mustNotAppear: ['Dima case work context', 'Tsila wage-rights and payroll context', 'VAT static evidence'],
        visualProofLimitation: 'This proves only that scans input maps to static scanned intake preview.',
      },
    ],
    visualProofLimitation: 'This scenario proves only visible preview rendering for scans context.',
  }),
  buildScenario({
    scenarioId: 'manual-workbench-documents-false-positive',
    checkpointName: 'Proof of Life - מסמכים false-positive check',
    demoInput: 'מסמכים',
    expectedVisibleOutput: ['ידע קשור שכבר קיים במוח'],
    forbiddenVisibleOutput: ['VAT evidence', 'war compensation red route'],
    whatMustNotAppear: ['VAT static evidence', 'War compensation red route knowledge', 'מסלול אדום'],
    requiredSafetyWarnings: COMMON_WARNINGS,
    automatedTests: [MANUAL_WORKBENCH_TEST, KNOWLEDGE_INVENTORY_TEST],
    manualVerificationSteps: [
      'Open /internal/manual-preview-workbench.',
      'Type מסמכים in the manual input fields.',
      'Confirm the knowledge section is present but VAT and red-route records are absent.',
      'Confirm substring מס does not trigger a tax or red-route match.',
    ],
    forbiddenOutcomes: COMMON_FORBIDDEN_OUTCOMES,
    blockedActions: COMMON_BLOCKED_ACTIONS,
    safetyFlags: COMMON_SAFETY_FLAGS,
    visibilityRules: [
      {
        ruleId: 'documents-false-positive-blocked',
        shouldAppear: ['ידע קשור שכבר קיים במוח'],
        mustNotAppear: ['VAT static evidence', 'War compensation red route knowledge'],
        visualProofLimitation: 'This proves only that a known false-positive route stays visually blocked.',
      },
    ],
    visualProofLimitation: 'This scenario proves only visible false-positive prevention for מסמכים.',
  }),
] as const satisfies readonly ProofOfLifeScenario[];
// #endregion
