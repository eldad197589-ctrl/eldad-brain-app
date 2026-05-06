/* ==== FILE: src/work-spine/systems-under-brain-index/systems-under-brain-index-seed.ts ==== */

// #region Imports
import {
  SYSTEMS_UNDER_BRAIN_INDEX_BLOCKED_ACTIONS,
  SYSTEMS_UNDER_BRAIN_INDEX_REQUIRED_GATE,
  SYSTEMS_UNDER_BRAIN_INDEX_SAFETY_STATUS,
} from './systems-under-brain-index-types';
import type { SystemsUnderBrainIndexArea, SystemsUnderBrainIndexRow } from './systems-under-brain-index-types';
// #endregion

// #region Types
interface RowFixtureInput {
  sourceId: string;
  label: string;
  locationHint: string;
  systemArea: SystemsUnderBrainIndexArea;
}
// #endregion

// #region Constants
const BASE_BLOCKED_ACTIONS = [...SYSTEMS_UNDER_BRAIN_INDEX_BLOCKED_ACTIONS] as const;

const BASE_SAFETY_FLAGS = {
  labelOnly: true,
  staticOnly: true,
  indexOnly: true,
  fileNamesOnly: true,
  contentRead: false,
  runtimeInvoked: false,
  providerConnected: false,
  operationalReady: false,
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canPersist: false,
  canAct: false,
  blockedActions: BASE_BLOCKED_ACTIONS,
  requiredGateBeforeUse: SYSTEMS_UNDER_BRAIN_INDEX_REQUIRED_GATE,
  safetyStatus: SYSTEMS_UNDER_BRAIN_INDEX_SAFETY_STATUS,
} as const;
// #endregion

// #region Fixtures
const rowFixture = (input: RowFixtureInput): SystemsUnderBrainIndexRow => ({
  ...input,
  ...BASE_SAFETY_FLAGS,
});

/** Static Stage 18E systems-under-brain label-only skeleton rows. */
export const SYSTEMS_UNDER_BRAIN_INDEX_ROWS = [
  rowFixture({
    sourceId: 'work-spine-providers',
    label: 'work-spine-providers',
    locationHint: 'src/work-spine/providers/',
    systemArea: 'work_spine_providers',
  }),
  rowFixture({
    sourceId: 'work-spine-intake',
    label: 'work-spine-intake',
    locationHint: 'src/work-spine/intake/',
    systemArea: 'work_spine_intake',
  }),
  rowFixture({
    sourceId: 'work-spine-projection',
    label: 'work-spine-projection',
    locationHint: 'src/work-spine/projection/',
    systemArea: 'work_spine_projection',
  }),
  rowFixture({
    sourceId: 'work-spine-read-model',
    label: 'work-spine-read-model',
    locationHint: 'src/work-spine/read-model/',
    systemArea: 'work_spine_read_model',
  }),
  rowFixture({
    sourceId: 'work-spine-runtime',
    label: 'work-spine-runtime',
    locationHint: 'src/work-spine/runtime/',
    systemArea: 'work_spine_runtime',
  }),
  rowFixture({
    sourceId: 'work-spine-use-cases',
    label: 'work-spine-use-cases',
    locationHint: 'src/work-spine/use-cases/',
    systemArea: 'work_spine_use_cases',
  }),
  rowFixture({
    sourceId: 'accounting-core',
    label: 'accounting-core',
    locationHint: 'src/accounting-core/',
    systemArea: 'accounting_core',
  }),
  rowFixture({
    sourceId: 'services',
    label: 'services',
    locationHint: 'src/services/',
    systemArea: 'services',
  }),
  rowFixture({
    sourceId: 'store',
    label: 'store',
    locationHint: 'src/store/',
    systemArea: 'store',
  }),
] as const satisfies readonly SystemsUnderBrainIndexRow[];
// #endregion
