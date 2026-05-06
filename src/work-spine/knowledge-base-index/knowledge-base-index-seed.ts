/* ==== FILE: src/work-spine/knowledge-base-index/knowledge-base-index-seed.ts ==== */

// #region Imports
import {
  KNOWLEDGE_BASE_INDEX_BLOCKED_ACTIONS,
  KNOWLEDGE_BASE_INDEX_REQUIRED_GATE,
  KNOWLEDGE_BASE_INDEX_SAFETY_STATUS,
} from './knowledge-base-index-types';
import type { KnowledgeBaseIndexDomain, KnowledgeBaseIndexRow } from './knowledge-base-index-types';
// #endregion

// #region Types
interface RowFixtureInput {
  sourceId: string;
  label: string;
  locationHint: string;
  parentSourceId: string | null;
  domain: KnowledgeBaseIndexDomain;
  depth: number;
}
// #endregion

// #region Constants
const BASE_BLOCKED_ACTIONS = [...KNOWLEDGE_BASE_INDEX_BLOCKED_ACTIONS] as const;

const BASE_SAFETY_FLAGS = {
  labelOnly: true,
  staticOnly: true,
  contentRead: false,
  folderRead: false,
  contentMined: false,
  ocrPerformed: false,
  providerConnected: false,
  professionalConclusion: false,
  clientEvidence: false,
  sourceVerified: false,
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canPersist: false,
  canAct: false,
  blockedActions: BASE_BLOCKED_ACTIONS,
  requiredGateBeforeAccess: KNOWLEDGE_BASE_INDEX_REQUIRED_GATE,
  safetyStatus: KNOWLEDGE_BASE_INDEX_SAFETY_STATUS,
} as const;
// #endregion

// #region Fixtures
const rowFixture = (input: RowFixtureInput): KnowledgeBaseIndexRow => ({
  ...input,
  ...BASE_SAFETY_FLAGS,
});

/** Static Stage 18B Knowledge_Base label-only skeleton rows. */
export const KNOWLEDGE_BASE_INDEX_ROWS = [
  rowFixture({
    sourceId: 'kb-root-knowledge-base-v1',
    label: 'Knowledge_Base',
    locationHint: 'Knowledge_Base/',
    parentSourceId: null,
    domain: 'knowledge_base',
    depth: 0,
  }),
  rowFixture({
    sourceId: 'kb-tax-root-v1',
    label: 'tax',
    locationHint: 'Knowledge_Base/tax/',
    parentSourceId: 'kb-root-knowledge-base-v1',
    domain: 'tax',
    depth: 1,
  }),
  rowFixture({
    sourceId: 'kb-tax-income-tax-v1',
    label: 'income_tax',
    locationHint: 'Knowledge_Base/tax/income_tax/',
    parentSourceId: 'kb-tax-root-v1',
    domain: 'income_tax',
    depth: 2,
  }),
  rowFixture({
    sourceId: 'kb-tax-income-tax-section-102-102a-v1',
    label: 'section_102_102a',
    locationHint: 'Knowledge_Base/tax/income_tax/section_102_102a/',
    parentSourceId: 'kb-tax-income-tax-v1',
    domain: 'income_tax_section_102_102a',
    depth: 3,
  }),
  rowFixture({
    sourceId: 'kb-tax-vat-v1',
    label: 'vat',
    locationHint: 'Knowledge_Base/tax/vat/',
    parentSourceId: 'kb-tax-root-v1',
    domain: 'vat',
    depth: 2,
  }),
  rowFixture({
    sourceId: 'kb-tax-vat-maven-reconciliation-examples-v1',
    label: 'maven_reconciliation_examples',
    locationHint: 'Knowledge_Base/tax/vat/maven_reconciliation_examples/',
    parentSourceId: 'kb-tax-vat-v1',
    domain: 'vat_maven_reconciliation',
    depth: 3,
  }),
  rowFixture({
    sourceId: 'kb-tax-vat-maven-reconciliation-2026-01-02-v1',
    label: '2026_01_02_vat_close',
    locationHint: 'Knowledge_Base/tax/vat/maven_reconciliation_examples/2026_01_02_vat_close/',
    parentSourceId: 'kb-tax-vat-maven-reconciliation-examples-v1',
    domain: 'vat_maven_reconciliation_batch',
    depth: 4,
  }),
  rowFixture({
    sourceId: 'kb-tax-vat-maven-training-v1',
    label: 'maven_training',
    locationHint: 'Knowledge_Base/tax/vat/maven_training/',
    parentSourceId: 'kb-tax-vat-v1',
    domain: 'vat_maven_training',
    depth: 3,
  }),
] as const satisfies readonly KnowledgeBaseIndexRow[];
// #endregion
