/* ====
   FILE: operational-preview-types.ts
   PURPOSE: Preview-only operational object contracts for Stage 8.
   DEPENDENCIES: Approval Gate and Unified Intake contracts
   EXPORTS: Operational preview types and locked constants
   ==== */

// #region Imports
import type { ApprovalDecision } from '../approval/approval-decision-types';
import type { UnifiedIntakeSource } from '../intake/unified-intake-source-types';
// #endregion

// #region Constants
/** Locked preview status for every Stage 8 preview object. */
export const OPERATIONAL_PREVIEW_STATUS = 'hypothetical';

/** Locked blocker reason for every Stage 8 preview object. */
export const OPERATIONAL_PREVIEW_BLOCKED_REASON = 'preview_only_no_persistence';

/** Locked bundle status for Stage 8 preview bundles. */
export const OPERATIONAL_PREVIEW_BUNDLE_STATUS = 'preview_only';

/** Allowed suggested priority values for preview-only work items. */
export const WORK_ITEM_PREVIEW_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

/** Allowed suggested link values for preview-only matter links. */
export const MATTER_LINK_PREVIEW_TYPES = [
  'evidence',
  'reference',
  'correspondence',
] as const;
// #endregion

// #region Types
/** Suggested priority values for a preview-only work item. */
export type WorkItemPreviewPriority = (typeof WORK_ITEM_PREVIEW_PRIORITIES)[number];

/** Suggested link values for a preview-only matter relation. */
export type MatterLinkPreviewType = (typeof MATTER_LINK_PREVIEW_TYPES)[number];

/** Preview-only work item shape that cannot be persisted or executed. */
export interface WorkItemPreview {
  /** Stable preview id. */
  previewId: string;
  /** Locked preview status. */
  previewStatus: typeof OPERATIONAL_PREVIEW_STATUS;
  /** Source approval decision id. */
  sourceApprovalId: string;
  /** Suggested title for later review. */
  suggestedTitle: string;
  /** Suggested description for later review. */
  suggestedDescription: string;
  /** Suggested priority for later review. */
  suggestedPriority: WorkItemPreviewPriority;
  /** Suggested assignee for later review. */
  suggestedAssignee: string;
  /** Optional suggested due date for later review. */
  suggestedDueDate?: string;
  /** Source intake preview id. */
  sourceIntakeId: string;
  /** Locked blocker confirming no real object can be made here. */
  creationBlocked: true;
  /** Locked blocker reason. */
  creationBlockedReason: typeof OPERATIONAL_PREVIEW_BLOCKED_REASON;
}

/** Preview-only matter link shape that cannot be persisted or executed. */
export interface MatterLinkPreview {
  /** Stable preview id. */
  previewId: string;
  /** Locked preview status. */
  previewStatus: typeof OPERATIONAL_PREVIEW_STATUS;
  /** Source approval decision id. */
  sourceApprovalId: string;
  /** Suggested matter id for later review. */
  suggestedMatterId: string;
  /** Suggested matter display name for later review. */
  suggestedMatterName: string;
  /** Suggested link type for later review. */
  suggestedLinkType: MatterLinkPreviewType;
  /** Source intake preview id. */
  sourceIntakeId: string;
  /** Locked blocker confirming no real object can be made here. */
  creationBlocked: true;
  /** Locked blocker reason. */
  creationBlockedReason: typeof OPERATIONAL_PREVIEW_BLOCKED_REASON;
}

/** Preview-only document reference shape that cannot be persisted or executed. */
export interface DocumentRefPreview {
  /** Stable preview id. */
  previewId: string;
  /** Locked preview status. */
  previewStatus: typeof OPERATIONAL_PREVIEW_STATUS;
  /** Source approval decision id. */
  sourceApprovalId: string;
  /** Suggested filename for later review. */
  suggestedFilename: string;
  /** Suggested file type for later review. */
  suggestedFileType: string;
  /** Suggested classification for later review. */
  suggestedClassification: string;
  /** Optional suggested entity id for later review. */
  suggestedEntityId?: string;
  /** Source intake preview id. */
  sourceIntakeId: string;
  /** Locked blocker confirming no real object can be made here. */
  creationBlocked: true;
  /** Locked blocker reason. */
  creationBlockedReason: typeof OPERATIONAL_PREVIEW_BLOCKED_REASON;
}

/** Preview-only bundle for hypothetical operational object candidates. */
export interface OperationalPreviewBundle {
  /** Stable bundle id. */
  bundleId: string;
  /** Static approval decision reviewed before this preview. */
  sourceApprovalDecision: ApprovalDecision;
  /** Static metadata-only source intake preview. */
  sourceIntake: UnifiedIntakeSource;
  /** Preview-only work item suggestions. */
  workItemPreviews: readonly WorkItemPreview[];
  /** Preview-only matter link suggestions. */
  matterLinkPreviews: readonly MatterLinkPreview[];
  /** Preview-only document reference suggestions. */
  documentRefPreviews: readonly DocumentRefPreview[];
  /** Locked bundle status. */
  bundleStatus: typeof OPERATIONAL_PREVIEW_BUNDLE_STATUS;
  /** Locked execution blocker. */
  canExecute: false;
  /** Locked persistence blocker. */
  canPersist: false;
  /** Confirms Eldad approval remains required for later gates. */
  requiresEldadApproval: true;
}
// #endregion
