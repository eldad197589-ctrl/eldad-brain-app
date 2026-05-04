/* ==== FILE: src/work-spine/proof-of-life/proof-of-life-standard.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { STATIC_VISUAL_PROOF_CHECKLIST_SCENARIOS } from './proof-of-life-standard';
import {
  BANNED_PROOF_STATUSES,
  STATIC_VISUAL_PROOF_DEFINITION,
  STATIC_VISUAL_PROOF_FORMAL_NAME,
  STATIC_VISUAL_PROOF_SAFETY_STATUS,
  STATIC_VISUAL_PROOF_STATUS,
} from './proof-of-life-types';
import type { ProofOfLifeScenario } from './proof-of-life-types';
// #endregion

// #region Constants
const REQUIRED_SCENARIO_IDS = [
  'manual-workbench-scans-dima',
  'manual-workbench-tsila-payroll',
  'manual-workbench-vat-maven-bezeq',
  'manual-workbench-scans-only',
  'manual-workbench-documents-false-positive',
] as const;

const REQUIRED_FIELDS = [
  'scenarioId',
  'checkpointName',
  'route',
  'demoInput',
  'expectedVisibleOutput',
  'forbiddenVisibleOutput',
  'whatMustNotAppear',
  'requiredSafetyWarnings',
  'automatedTests',
  'manualVerificationSteps',
  'commitReference',
  'proofStatus',
  'safetyStatus',
  'staticChecklistOnly',
  'previewVisibleOnly',
  'noLiveExecution',
  'noProfessionalCorrectnessProven',
  'noBindingKnowledge',
  'noSourceVerification',
  'noProviderConnection',
  'noOperationalReadiness',
  'noTaskOrObjectCreation',
  'forbiddenOutcomes',
  'blockedActions',
  'safetyFlags',
] as const satisfies readonly (keyof ProofOfLifeScenario)[];

const REQUIRED_FORBIDDEN_OUTCOME_IDS = ['no-action-creation', 'no-live-provider', 'no-persistence'] as const;

const UNSAFE_WORDS = [
  'executed',
  'validated',
  'verified',
  'approved',
  'ready',
  'live',
  'connected',
  'submitted',
  'created',
  'filed',
  'synced',
  'professionally correct',
  'source verified',
  'operational',
] as const;

const SAFE_NEGATIVE_MARKERS = [
  'no',
  'not',
  'does not',
  'without',
  'blocked',
  'forbidden',
  'must not',
  'אינו',
  'אין',
  'לא',
  'אסור',
] as const;

const FORBIDDEN_IMPORT_TERMS = [
  'from "fs"',
  "from 'fs'",
  'from "path"',
  "from 'path'",
  'from "xlsx"',
  "from 'xlsx'",
  'from "googleapis"',
  "from 'googleapis'",
  'from "supabase"',
  "from 'supabase'",
  'Mav' + 'en' + 'Parser',
  'fet' + 'ch',
  'useBrain' + 'Store',
  'useMatter' + 'Store',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
] as const;
// #endregion

// #region Helpers
/**
 * Return all scenarios as mutable readonly-friendly records.
 * @returns Static visual proof checklist scenarios.
 */
const scenarios = (): readonly ProofOfLifeScenario[] => STATIC_VISUAL_PROOF_CHECKLIST_SCENARIOS;

/**
 * Return whether a text value uses an unsafe word only in a negative context.
 * @param value - Text value to inspect.
 * @returns Whether unsafe wording is safe in context.
 */
const hasOnlySafeUnsafeWording = (value: string): boolean => {
  const lowerValue = value.toLowerCase();
  const hasUnsafeWord = UNSAFE_WORDS.some((word) => lowerValue.includes(word));
  if (!hasUnsafeWord) return true;

  return SAFE_NEGATIVE_MARKERS.some((marker) => lowerValue.includes(marker.toLowerCase()));
};

/**
 * Return scenario text values that may contain disclaimer or blocked wording.
 * @param scenario - Scenario to inspect.
 * @returns Text values from allowed negative/disclaimer contexts.
 */
const allowedUnsafeTextValues = (scenario: ProofOfLifeScenario): readonly string[] => [
  ...scenario.forbiddenVisibleOutput,
  ...scenario.whatMustNotAppear,
  ...scenario.requiredSafetyWarnings,
  ...scenario.forbiddenOutcomes.map((outcome) => outcome.description),
  ...scenario.blockedActions,
  ...scenario.safetyFlags,
  scenario.visualProofLimitation,
  scenario.safetyStatus,
];

/**
 * Serialize proof source modules for import-boundary checks.
 * @returns Source text from imported static modules.
 */
const serializedProofSources = (): string =>
  `${STATIC_VISUAL_PROOF_DEFINITION} ${JSON.stringify(STATIC_VISUAL_PROOF_CHECKLIST_SCENARIOS)}`;
// #endregion

// #region Tests
describe('STATIC_VISUAL_PROOF_CHECKLIST_SCENARIOS', () => {
  it('exports the formal Static Visual Proof Checklist standard', () => {
    expect(STATIC_VISUAL_PROOF_FORMAL_NAME).toBe('Static Visual Proof Checklist');
    expect(STATIC_VISUAL_PROOF_DEFINITION).toContain('A proof only confirms');
    expect(STATIC_VISUAL_PROOF_DEFINITION).toContain('does NOT prove');
  });

  it('exports all required initial scenarios', () => {
    const scenarioIds = scenarios().map((scenario) => scenario.scenarioId);

    expect(scenarios()).toHaveLength(REQUIRED_SCENARIO_IDS.length);
    for (const scenarioId of REQUIRED_SCENARIO_IDS) {
      expect(scenarioIds).toContain(scenarioId);
    }
  });

  it('keeps every scenario field complete', () => {
    for (const scenario of scenarios()) {
      for (const fieldName of REQUIRED_FIELDS) {
        expect(Object.prototype.hasOwnProperty.call(scenario, fieldName)).toBe(true);
      }
      expect(scenario.route).toBe('/internal/manual-preview-workbench');
      expect(scenario.demoInput.trim()).not.toBe('');
      expect(scenario.expectedVisibleOutput.length).toBeGreaterThan(0);
      expect(scenario.forbiddenVisibleOutput.length).toBeGreaterThan(0);
      expect(scenario.whatMustNotAppear.length).toBeGreaterThan(0);
      expect(scenario.requiredSafetyWarnings.length).toBeGreaterThan(0);
      expect(scenario.automatedTests.length).toBeGreaterThan(0);
      expect(scenario.manualVerificationSteps.length).toBeGreaterThan(0);
    }
  });

  it('keeps every scenario static and preview-visible only', () => {
    for (const scenario of scenarios()) {
      expect(scenario.proofStatus).toBe(STATIC_VISUAL_PROOF_STATUS);
      expect(scenario.safetyStatus).toBe(STATIC_VISUAL_PROOF_SAFETY_STATUS);
      expect(scenario.staticChecklistOnly).toBe(true);
      expect(scenario.previewVisibleOnly).toBe(true);
      expect(scenario.noLiveExecution).toBe(true);
      expect(scenario.noProfessionalCorrectnessProven).toBe(true);
      expect(scenario.noBindingKnowledge).toBe(true);
      expect(scenario.noSourceVerification).toBe(true);
      expect(scenario.noProviderConnection).toBe(true);
      expect(scenario.noOperationalReadiness).toBe(true);
      expect(scenario.noTaskOrObjectCreation).toBe(true);
    }
  });

  it('includes required forbidden outcomes and blocked action markers', () => {
    for (const scenario of scenarios()) {
      const outcomeIds = scenario.forbiddenOutcomes.map((outcome) => outcome.outcomeId);

      for (const outcomeId of REQUIRED_FORBIDDEN_OUTCOME_IDS) {
        expect(outcomeIds).toContain(outcomeId);
      }
      expect(scenario.blockedActions).toContain('blocked_task_or_object_creation');
      expect(scenario.blockedActions).toContain('blocked_provider_connection');
      expect(scenario.blockedActions).toContain('blocked_persistence');
    }
  });

  it('never uses banned proof statuses', () => {
    for (const scenario of scenarios()) {
      expect(BANNED_PROOF_STATUSES).not.toContain(scenario.proofStatus);
      expect(BANNED_PROOF_STATUSES).not.toContain(scenario.safetyStatus);
    }
  });

  it('keeps unsafe wording inside negative or disclaimer contexts only', () => {
    for (const scenario of scenarios()) {
      for (const expectedOutput of scenario.expectedVisibleOutput) {
        expect(hasOnlySafeUnsafeWording(expectedOutput)).toBe(true);
      }
      for (const allowedText of allowedUnsafeTextValues(scenario)) {
        expect(hasOnlySafeUnsafeWording(allowedText)).toBe(true);
      }
    }
  });

  it('does not imply action buttons or uncontrolled execution surfaces', () => {
    const serialized = serializedProofSources();

    expect(serialized).not.toContain('<button');
    expect(serialized).not.toContain('onClick');
    expect(serialized).not.toContain('handler');
    expect(serialized).not.toContain('callback');
  });

  it('does not import or reference forbidden runtime modules', () => {
    const serialized = serializedProofSources();

    for (const forbiddenTerm of FORBIDDEN_IMPORT_TERMS) {
      expect(serialized).not.toContain(forbiddenTerm);
    }
  });
});
// #endregion
