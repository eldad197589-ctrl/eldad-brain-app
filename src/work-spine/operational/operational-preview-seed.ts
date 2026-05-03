/* ====
   FILE: operational-preview-seed.ts
   PURPOSE: Static Stage 8 operational preview bundles.
   DEPENDENCIES: Approval Gate fixtures, Unified Intake fixtures, operational preview contracts
   EXPORTS: Static operational preview bundles
   ==== */

// #region Imports
import { STATIC_APPROVAL_DECISIONS } from '../approval/approval-decision-seed';
import {
  MOCK_SOURCE_DRIVE,
  MOCK_SOURCE_EMAIL,
  MOCK_SOURCE_SCAN,
} from '../intake/unified-intake-source-seed';
import type { ApprovalDecision } from '../approval/approval-decision-types';
import type { UnifiedIntakeSource } from '../intake/unified-intake-source-types';
import type { OperationalPreviewBundle } from './operational-preview-types';
import {
  OPERATIONAL_PREVIEW_BLOCKED_REASON,
  OPERATIONAL_PREVIEW_BUNDLE_STATUS,
  OPERATIONAL_PREVIEW_STATUS,
} from './operational-preview-types';
// #endregion

// #region Helpers
const getDecisionById = (decisionId: string): ApprovalDecision => {
  const decision = STATIC_APPROVAL_DECISIONS.find(
    (approvalDecision) => approvalDecision.decisionId === decisionId,
  );

  if (!decision) {
    throw new Error(`Missing static approval decision: ${decisionId}`);
  }

  return decision;
};

const previewBase = (
  previewId: string,
  sourceApprovalDecision: ApprovalDecision,
  sourceIntake: UnifiedIntakeSource,
) => ({
  previewId,
  previewStatus: OPERATIONAL_PREVIEW_STATUS,
  sourceApprovalId: sourceApprovalDecision.decisionId,
  sourceIntakeId: sourceIntake.sourceId,
  creationBlocked: true,
  creationBlockedReason: OPERATIONAL_PREVIEW_BLOCKED_REASON,
} as const);
// #endregion

// #region Static Decisions
const approvedDriveDecision = getDecisionById('approval-stage7a-drive-approved-preview');
const pendingEmailDecision = getDecisionById('approval-stage7a-email-pending');
const rejectedScanDecision = getDecisionById('approval-stage7a-scan-rejected');
// #endregion

// #region Static Bundles
/** Static preview-only bundles for Stage 8 operational object review. */
export const STATIC_OPERATIONAL_PREVIEW_BUNDLES: readonly OperationalPreviewBundle[] = [
  {
    bundleId: 'operational-preview-bundle-drive-vat',
    sourceApprovalDecision: approvedDriveDecision,
    sourceIntake: MOCK_SOURCE_DRIVE,
    workItemPreviews: [
      {
        ...previewBase('work-preview-drive-vat-review', approvedDriveDecision, MOCK_SOURCE_DRIVE),
        suggestedTitle: 'Review VAT reconciliation metadata',
        suggestedDescription: 'Hypothetical follow-up based on approved metadata preview.',
        suggestedPriority: 'high',
        suggestedAssignee: 'Eldad',
        suggestedDueDate: '2026-05-07',
      },
    ],
    matterLinkPreviews: [
      {
        ...previewBase('matter-link-preview-drive-vat', approvedDriveDecision, MOCK_SOURCE_DRIVE),
        suggestedMatterId: 'matter-preview-vat-2026-05',
        suggestedMatterName: 'VAT May Metadata Review',
        suggestedLinkType: 'evidence',
      },
    ],
    documentRefPreviews: [
      {
        ...previewBase('document-ref-preview-drive-vat', approvedDriveDecision, MOCK_SOURCE_DRIVE),
        suggestedFilename: 'Bank_Statement_Q1.pdf',
        suggestedFileType: 'application/pdf',
        suggestedClassification: 'vat_supporting_document',
        suggestedEntityId: 'entity-preview-universal',
      },
    ],
    bundleStatus: OPERATIONAL_PREVIEW_BUNDLE_STATUS,
    canExecute: false,
    canPersist: false,
    requiresEldadApproval: true,
  },
  {
    bundleId: 'operational-preview-bundle-email-pending',
    sourceApprovalDecision: pendingEmailDecision,
    sourceIntake: MOCK_SOURCE_EMAIL,
    workItemPreviews: [
      {
        ...previewBase('work-preview-email-vat-question', pendingEmailDecision, MOCK_SOURCE_EMAIL),
        suggestedTitle: 'Clarify VAT email metadata',
        suggestedDescription: 'Hypothetical follow-up while approval remains pending.',
        suggestedPriority: 'medium',
        suggestedAssignee: 'Eldad',
      },
    ],
    matterLinkPreviews: [],
    documentRefPreviews: [],
    bundleStatus: OPERATIONAL_PREVIEW_BUNDLE_STATUS,
    canExecute: false,
    canPersist: false,
    requiresEldadApproval: true,
  },
  {
    bundleId: 'operational-preview-bundle-scan-rejected',
    sourceApprovalDecision: rejectedScanDecision,
    sourceIntake: MOCK_SOURCE_SCAN,
    workItemPreviews: [],
    matterLinkPreviews: [],
    documentRefPreviews: [
      {
        ...previewBase('document-ref-preview-scan-quality', rejectedScanDecision, MOCK_SOURCE_SCAN),
        suggestedFilename: 'Scan_20260503_1010.pdf',
        suggestedFileType: 'application/pdf',
        suggestedClassification: 'low_quality_scan_review',
      },
    ],
    bundleStatus: OPERATIONAL_PREVIEW_BUNDLE_STATUS,
    canExecute: false,
    canPersist: false,
    requiresEldadApproval: true,
  },
] as const;
// #endregion
