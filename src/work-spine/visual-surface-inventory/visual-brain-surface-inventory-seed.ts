/* ==== FILE: src/work-spine/visual-surface-inventory/visual-brain-surface-inventory-seed.ts ==== */

// #region Imports
import { VISUAL_SURFACE_BLOCKED_ACTIONS } from './visual-brain-surface-inventory-types';
import type {
  VisualBrainSurfaceInventoryRecord,
  VisualSurfaceClassification,
  VisualSurfaceProofOfLifeStatus,
  VisualSurfaceType,
} from './visual-brain-surface-inventory-types';
// #endregion

// #region Constants
const COMMON_MUST_NOT_INFER = [
  'not approved for operational use',
  'not source verified',
  'not professionally correct',
  'not a completeness finding',
  'not permission for live action',
] as const;

const STATIC_RISKS = ['visual presence only', 'requires audit before broader use'] as const;
const PREVIEW_RISKS = ['preview-only surface', 'requires Eldad review before any later step'] as const;
const LIVE_RISKS = ['mutation-capable surface', 'requires targeted audit before use'] as const;
const UNKNOWN_RISKS = ['unknown behavior from this inventory', 'requires audit before use'] as const;

/** Input shape for building one visual surface inventory record. */
interface SurfaceRecordInput {
  /** Stable surface identifier. */
  surfaceId: string;
  /** Human-readable surface label. */
  label: string;
  /** Static route or code location pointer. */
  routeOrPath: string;
  /** Category of visual/code surface. */
  surfaceType: VisualSurfaceType;
  /** Conservative classification. */
  classification: VisualSurfaceClassification;
  /** Why the classification was assigned. */
  classificationReason: string;
  /** Current proof-of-life status. */
  proofOfLifeStatus: VisualSurfaceProofOfLifeStatus;
  /** Whether the surface may change local app state. */
  mutationCapable?: boolean;
  /** Whether the surface may expose live connector behavior. */
  liveProviderCapable?: boolean;
  /** Whether the surface may retain user/app state. */
  persistenceCapable?: boolean;
  /** Whether the surface may expose document or export behavior. */
  fileOperationCapable?: boolean;
  /** Whether the surface may expose object-shape behavior. */
  operationalCreationCapable?: boolean;
  /** Known risks from visual/code presence only. */
  knownRisks: readonly string[];
}
// #endregion

// #region Helpers
const buildSurfaceRecord = (input: SurfaceRecordInput): VisualBrainSurfaceInventoryRecord => ({
  surfaceId: input.surfaceId,
  label: input.label,
  routeOrPath: input.routeOrPath,
  surfaceType: input.surfaceType,
  visualPresenceOnly: true,
  classification: input.classification,
  classificationReason: input.classificationReason,
  audited: false,
  auditStatus: input.classification === 'unknown_needs_audit' ? 'requires_targeted_audit' : 'not_audited',
  proofOfLifeStatus: input.proofOfLifeStatus,
  mutationCapable: input.mutationCapable ?? false,
  liveProviderCapable: input.liveProviderCapable ?? false,
  persistenceCapable: input.persistenceCapable ?? false,
  fileOperationCapable: input.fileOperationCapable ?? false,
  operationalCreationCapable: input.operationalCreationCapable ?? false,
  blockedActions: VISUAL_SURFACE_BLOCKED_ACTIONS,
  requiredAuditBeforeUse: true,
  knownRisks: input.knownRisks,
  mustNotInfer: COMMON_MUST_NOT_INFER,
});
// #endregion

// #region Static Data
/** Static inventory of visual/code surfaces currently mapped for Eldad Brain. */
export const VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS: readonly VisualBrainSurfaceInventoryRecord[] = [
  buildSurfaceRecord({
    surfaceId: 'visual-dashboard-brain-v1',
    label: 'Dashboard brain visual',
    routeOrPath: 'src/pages/dashboard',
    surfaceType: 'dashboard_surface',
    classification: 'static_visual',
    classificationReason: 'visually present and exists in code as a visual pointer only',
    proofOfLifeStatus: 'visual_presence_only',
    knownRisks: STATIC_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-brain-router-flowcharts-v1',
    label: 'Brain Router / flowcharts',
    routeOrPath: 'src/data/flowcharts.ts',
    surfaceType: 'router_surface',
    classification: 'static_visual',
    classificationReason: 'visually present as static routing and flowchart assets',
    proofOfLifeStatus: 'visual_presence_only',
    knownRisks: STATIC_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-office-ops-flows-v1',
    label: 'Office ops flows',
    routeOrPath: 'src/pages/ceo-office/meetingMaterials.ts',
    surfaceType: 'flow_surface',
    classification: 'static_visual',
    classificationReason: 'visually present as office-flow context and requires audit',
    proofOfLifeStatus: 'visual_presence_only',
    knownRisks: STATIC_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-robium-business-pages-v1',
    label: 'Robium business visual pages',
    routeOrPath: 'src/pages/robium-hub',
    surfaceType: 'business_visual_surface',
    classification: 'static_visual',
    classificationReason: 'visually present as business visual pages and exists in code',
    proofOfLifeStatus: 'visual_presence_only',
    knownRisks: STATIC_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-internal-manual-workbench-v1',
    label: 'Internal Manual Workbench',
    routeOrPath: '/internal/manual-preview-workbench',
    surfaceType: 'internal_preview_surface',
    classification: 'preview_only',
    classificationReason: 'preview-only surface with static/manual signals and no action claim',
    proofOfLifeStatus: 'preview_presence_only',
    knownRisks: PREVIEW_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-internal-intake-previews-v1',
    label: 'Internal intake previews',
    routeOrPath: 'src/pages/internal',
    surfaceType: 'internal_preview_surface',
    classification: 'preview_only',
    classificationReason: 'preview-only intake surfaces require Eldad review',
    proofOfLifeStatus: 'preview_presence_only',
    knownRisks: PREVIEW_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-approval-learning-diagnostics-v1',
    label: 'Approval / learning / diagnostics previews',
    routeOrPath: 'src/components/internal',
    surfaceType: 'internal_preview_surface',
    classification: 'preview_only',
    classificationReason: 'preview-only review and diagnostic surfaces require audit',
    proofOfLifeStatus: 'preview_presence_only',
    knownRisks: PREVIEW_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-ceo-bureau-v1',
    label: 'CEO Bureau',
    routeOrPath: 'src/pages/ceo-office',
    surfaceType: 'ops_surface',
    classification: 'live_mutation_capable',
    classificationReason: 'mutation-capable office surface exists in code',
    proofOfLifeStatus: 'needs_visual_proof',
    mutationCapable: true,
    persistenceCapable: true,
    operationalCreationCapable: true,
    knownRisks: LIVE_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-global-navigation-active-cases-v1',
    label: 'Global navigation active cases',
    routeOrPath: 'src/components/Layout.tsx',
    surfaceType: 'navigation_surface',
    classification: 'live_mutation_capable',
    classificationReason: 'mutation-capable navigation surface exists in code',
    proofOfLifeStatus: 'needs_visual_proof',
    mutationCapable: true,
    persistenceCapable: true,
    knownRisks: LIVE_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-clients-cases-v1',
    label: 'Clients / cases',
    routeOrPath: 'src/pages/ClientsPage.tsx',
    surfaceType: 'case_surface',
    classification: 'live_mutation_capable',
    classificationReason: 'mutation-capable client and case surface exists in code',
    proofOfLifeStatus: 'needs_visual_proof',
    mutationCapable: true,
    persistenceCapable: true,
    operationalCreationCapable: true,
    knownRisks: LIVE_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-tools-engines-v1',
    label: 'Tools / engines',
    routeOrPath: 'src/services',
    surfaceType: 'tool_surface',
    classification: 'live_mutation_capable',
    classificationReason: 'mutation-capable tool surface exists in code',
    proofOfLifeStatus: 'needs_visual_proof',
    mutationCapable: true,
    fileOperationCapable: true,
    knownRisks: LIVE_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-work-spine-board-v1',
    label: 'Work Spine board',
    routeOrPath: 'src/work-spine/ui',
    surfaceType: 'board_surface',
    classification: 'live_mutation_capable',
    classificationReason: 'mutation-capable board surface exists in code',
    proofOfLifeStatus: 'needs_visual_proof',
    mutationCapable: true,
    persistenceCapable: true,
    operationalCreationCapable: true,
    knownRisks: LIVE_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-settings-integrations-v1',
    label: 'Settings / integrations',
    routeOrPath: 'src/pages/settings',
    surfaceType: 'settings_surface',
    classification: 'live_mutation_capable',
    classificationReason: 'mutation-capable settings surface exists in code',
    proofOfLifeStatus: 'needs_visual_proof',
    mutationCapable: true,
    liveProviderCapable: true,
    persistenceCapable: true,
    knownRisks: LIVE_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-dima-case-surface-v1',
    label: 'Dima case surface',
    routeOrPath: 'src/data/dimaCaseSeed.ts',
    surfaceType: 'case_surface',
    classification: 'unknown_needs_audit',
    classificationReason: 'visual/code presence requires audit before use',
    proofOfLifeStatus: 'needs_visual_proof',
    knownRisks: UNKNOWN_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-tsila-case-surface-v1',
    label: 'Tsila case surface',
    routeOrPath: 'src/data/tsilaCaseSeed.ts',
    surfaceType: 'case_surface',
    classification: 'unknown_needs_audit',
    classificationReason: 'visual/code presence requires audit before use',
    proofOfLifeStatus: 'needs_visual_proof',
    knownRisks: UNKNOWN_RISKS,
  }),
  buildSurfaceRecord({
    surfaceId: 'visual-matter-workspace-v1',
    label: 'Matter workspace',
    routeOrPath: 'src/pages/matter-workspace',
    surfaceType: 'workspace_surface',
    classification: 'unknown_needs_audit',
    classificationReason: 'workspace visual/code presence requires audit before use',
    proofOfLifeStatus: 'needs_visual_proof',
    knownRisks: UNKNOWN_RISKS,
  }),
];
// #endregion
