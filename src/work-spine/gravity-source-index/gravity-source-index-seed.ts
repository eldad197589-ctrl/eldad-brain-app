/* ==== FILE: src/work-spine/gravity-source-index/gravity-source-index-seed.ts ==== */

// #region Imports
import {
  GRAVITY_SOURCE_INDEX_BLOCKED_ACTIONS,
  GRAVITY_SOURCE_INDEX_REQUIRED_GATE,
  GRAVITY_SOURCE_INDEX_SAFETY_STATUS,
} from './gravity-source-index-types';
import type { GravitySourceIndexClass, GravitySourceIndexRow } from './gravity-source-index-types';
// #endregion

// #region Types
interface RowFixtureInput {
  sourceId: string;
  label: string;
  locationHint: string;
  parentSourceId: string | null;
  sourceClass: GravitySourceIndexClass;
}
// #endregion

// #region Constants
const BASE_BLOCKED_ACTIONS = [...GRAVITY_SOURCE_INDEX_BLOCKED_ACTIONS] as const;

const BASE_SAFETY_FLAGS = {
  labelOnly: true,
  staticOnly: true,
  indexOnly: true,
  sourceAuditRequired: true,
  nonOperational: true,
  contentUseAllowed: false,
  contentAccessAllowed: false,
  ocrAllowed: false,
  providerAccessAllowed: false,
  finalUseAllowed: false,
  evidenceUseAllowed: false,
  operationalObjectAllowed: false,
  stateWriteAllowed: false,
  canAct: false,
  blockedActions: BASE_BLOCKED_ACTIONS,
  requiredGateBeforeUse: GRAVITY_SOURCE_INDEX_REQUIRED_GATE,
  safetyStatus: GRAVITY_SOURCE_INDEX_SAFETY_STATUS,
} as const;
// #endregion

// #region Fixtures
const rowFixture = (input: RowFixtureInput): GravitySourceIndexRow => ({
  ...input,
  ...BASE_SAFETY_FLAGS,
});

/** Static Stage 18C Gravity source label-only skeleton rows. */
export const GRAVITY_SOURCE_INDEX_ROWS = [
  rowFixture({
    sourceId: 'gravity-ingestion-vault-root-v1',
    label: 'Gravity ingestion vault root',
    locationHint: 'gravity_ingestion_vault/',
    parentSourceId: null,
    sourceClass: 'ingestion_vault',
  }),
  rowFixture({
    sourceId: 'gravity-ingestion-raw-queue-v1',
    label: 'raw mining queue',
    locationHint: 'gravity_ingestion_vault/1_raw_mining_queue/',
    parentSourceId: 'gravity-ingestion-vault-root-v1',
    sourceClass: 'ingestion_queue',
  }),
  rowFixture({
    sourceId: 'gravity-ingestion-processing-v1',
    label: 'processing by brain',
    locationHint: 'gravity_ingestion_vault/2_processing_by_brain/',
    parentSourceId: 'gravity-ingestion-vault-root-v1',
    sourceClass: 'processing_queue',
  }),
  rowFixture({
    sourceId: 'gravity-ingestion-archived-v1',
    label: 'extracted and archived',
    locationHint: 'gravity_ingestion_vault/3_extracted_and_archived/',
    parentSourceId: 'gravity-ingestion-vault-root-v1',
    sourceClass: 'ingestion_queue',
  }),
  rowFixture({
    sourceId: 'gravity-generated-output-root-v1',
    label: 'generated output folder',
    locationHint: 'brain-app/output/',
    parentSourceId: null,
    sourceClass: 'generated_output',
  }),
  rowFixture({
    sourceId: 'gravity-generated-output-archive-v1',
    label: 'generated output archive',
    locationHint: 'brain-app/output/archive/',
    parentSourceId: 'gravity-generated-output-root-v1',
    sourceClass: 'generated_output_archive',
  }),
  rowFixture({
    sourceId: 'gravity-public-legacy-v1',
    label: 'public legacy generated HTML',
    locationHint: 'brain-app/public/legacy/',
    parentSourceId: null,
    sourceClass: 'legacy_generated',
  }),
  rowFixture({
    sourceId: 'gravity-case-packages-root-v1',
    label: 'case packages root',
    locationHint: 'brain-app/cases/',
    parentSourceId: null,
    sourceClass: 'case_package_area',
  }),
  rowFixture({
    sourceId: 'gravity-dima-case-package-final-v1',
    label: 'Dima final package area',
    locationHint: 'brain-app/cases/dima-rodnitski/final/',
    parentSourceId: 'gravity-case-packages-root-v1',
    sourceClass: 'case_package_area',
  }),
  rowFixture({
    sourceId: 'gravity-general-case-package-final-v1',
    label: 'general final package area',
    locationHint: 'brain-app/cases/general/final/',
    parentSourceId: 'gravity-case-packages-root-v1',
    sourceClass: 'case_package_area',
  }),
  rowFixture({
    sourceId: 'gravity-dima-engine-artifacts-v1',
    label: 'Dima engine artifacts',
    locationHint: 'engine_dima_case/',
    parentSourceId: null,
    sourceClass: 'case_artifact_area',
  }),
  rowFixture({
    sourceId: 'gravity-dima-source-docs-label-v1',
    label: 'Dima source docs label',
    locationHint: 'engine_dima_case/source-docs/',
    parentSourceId: 'gravity-dima-engine-artifacts-v1',
    sourceClass: 'source_folder_label',
  }),
  rowFixture({
    sourceId: 'gravity-static-case-data-artifacts-v1',
    label: 'static case data artifacts',
    locationHint: 'brain-app/src/data/*dima*; brain-app/src/data/*tsila*; brain-app/src/data/Dima_Submission_Bundle.zip',
    parentSourceId: null,
    sourceClass: 'static_code_artifact',
  }),
  rowFixture({
    sourceId: 'gravity-parallel-build-areas-v1',
    label: 'parallel build areas',
    locationHint: 'parallel_build_*/',
    parentSourceId: null,
    sourceClass: 'legacy_build_area',
  }),
  rowFixture({
    sourceId: 'gravity-screenshot-artifacts-v1',
    label: 'purchase and sale screenshots',
    locationHint: 'purchase_screenshots/; sale_screenshots/',
    parentSourceId: null,
    sourceClass: 'screenshot_artifact_area',
  }),
  rowFixture({
    sourceId: 'gravity-scans-root-v1',
    label: 'scans root',
    locationHint: 'סריקות/',
    parentSourceId: null,
    sourceClass: 'document_label_area',
  }),
  rowFixture({
    sourceId: 'gravity-scans-dima-red-route-v1',
    label: 'Dima red-route scan label',
    locationHint: 'סריקות/בניית ערר או השגה דימה פיצוי מלחמה מסלול אדום/',
    parentSourceId: 'gravity-scans-root-v1',
    sourceClass: 'document_batch_label',
  }),
  rowFixture({
    sourceId: 'gravity-scans-vat-periods-v1',
    label: 'VAT period scan labels',
    locationHint: 'סריקות/חומר למע דוד אלדד 3-4.26/; סריקות/חומר למעמ דוד אלדד 1-2.26/',
    parentSourceId: 'gravity-scans-root-v1',
    sourceClass: 'document_batch_label',
  }),
  rowFixture({
    sourceId: 'gravity-scans-robium-v1',
    label: 'Robium scan label',
    locationHint: 'סריקות/טיפול שוטף רוביום/',
    parentSourceId: 'gravity-scans-root-v1',
    sourceClass: 'document_batch_label',
  }),
  rowFixture({
    sourceId: 'gravity-scans-labor-law-v1',
    label: 'labor-law scan labels',
    locationHint: 'סריקות/מסמכים בכורי פריש בדיקת דיני עבודה/; סריקות/מסמכים שונים סיירת א.ח ראשון בביטחון בעמ/',
    parentSourceId: 'gravity-scans-root-v1',
    sourceClass: 'document_batch_label',
  }),
  rowFixture({
    sourceId: 'gravity-scans-email-downloads-v1',
    label: 'email-download scan batches',
    locationHint: 'סריקות/סריקות2026-05-05_דחוף_מסמכים_מהמייל/; סריקות/סריקות2026-05-06_הורדה מדפי בנק אישור העברה לקיריל הלוואה 5000 שח/',
    parentSourceId: 'gravity-scans-root-v1',
    sourceClass: 'document_batch_label',
  }),
] as const satisfies readonly GravitySourceIndexRow[];
// #endregion
