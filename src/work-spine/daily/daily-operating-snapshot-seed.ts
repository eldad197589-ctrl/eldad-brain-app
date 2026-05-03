/* ====
   FILE: daily-operating-snapshot-seed.ts
   PURPOSE: Static Stage 17 daily operating snapshot fixtures.
   DEPENDENCIES: Daily operating snapshot contracts
   EXPORTS: Static daily operating snapshots
   ==== */

// #region Imports
import type {
  DailyOperatingItemGroup,
  DailyOperatingRiskLabel,
  DailyOperatingSnapshot,
  DailyOperatingUrgencyLevel,
} from './daily-operating-snapshot-types';
import {
  DAILY_OPERATING_CAPABILITY_LOCKS,
  DAILY_OPERATING_SOURCE_STAGE_REFS,
} from './daily-operating-snapshot-types';
// #endregion

// #region Helpers
const groupFixture = (
  count: number,
  ids: readonly string[],
  summaryLabels: readonly string[],
  urgencyLabels: readonly DailyOperatingUrgencyLevel[],
  riskLabels: readonly DailyOperatingRiskLabel[],
): DailyOperatingItemGroup => ({
  count,
  ids,
  summaryLabels,
  urgencyLabels,
  riskLabels,
});
// #endregion

// #region Static Groups
const dailySnapshotGroups = {
  newIntake: groupFixture(
    3,
    ['stage6-intake-gmail-001', 'stage6-intake-drive-002', 'stage6-intake-scan-003'],
    ['3 metadata-only intake previews arrived', 'No live source connection used'],
    ['medium'],
    ['medium'],
  ),
  pendingApprovals: groupFixture(
    4,
    ['stage7-approval-001', 'stage10-output-review-002', 'stage12-qc-review-003'],
    ['4 preview approvals require Eldad review', 'No approve action is available here'],
    ['high'],
    ['high'],
  ),
  blockedItems: groupFixture(
    3,
    ['stage9-policy-block-001', 'stage13-evidence-gap-002', 'stage14-learning-block-003'],
    ['3 items are blocked by gates or missing source trace'],
    ['high'],
    ['critical', 'high'],
  ),
  qcWarnings: groupFixture(
    2,
    ['stage12-qc-warning-001', 'stage12-qc-warning-002'],
    ['2 QC warnings need review before the next preview stage'],
    ['medium'],
    ['high'],
  ),
  workflowPreviews: groupFixture(
    8,
    ['stage11-workflow-map-001', 'stage11-workflow-map-002', 'stage11-workflow-map-003'],
    ['8 static workflow maps are available for read-only review'],
    ['low'],
    ['high', 'critical'],
  ),
  outputPreviews: groupFixture(
    5,
    ['stage10-output-preview-001', 'stage10-output-preview-002'],
    ['5 output previews remain generation-blocked'],
    ['medium'],
    ['high'],
  ),
  evidenceGaps: groupFixture(
    2,
    ['stage13-evidence-gap-001', 'stage13-evidence-gap-002'],
    ['2 evidence gaps need source trace review'],
    ['high'],
    ['high'],
  ),
  learningCandidates: groupFixture(
    2,
    ['stage14-learning-candidate-001', 'stage14-learning-candidate-002'],
    ['2 learning candidates require Eldad review', 'למידה נשארת תצוגה בלבד'],
    ['medium'],
    ['high'],
  ),
  safeNextCandidates: groupFixture(
    4,
    ['safe-next-preview-001', 'safe-next-preview-002', 'safe-next-preview-003'],
    ['4 safe next candidates can be prepared as previews only'],
    ['low'],
    ['medium'],
  ),
} as const;
// #endregion

// #region Static Snapshots
/** Static Stage 17 daily operating snapshots for read-only review. */
export const DAILY_OPERATING_SNAPSHOTS: readonly DailyOperatingSnapshot[] = [
  {
    snapshotId: 'daily-operating-snapshot-2026-05-04',
    snapshotDate: '2026-05-04',
    generatedAt: '2026-05-04T08:00:00.000+03:00',
    previewOnly: true,
    readOnly: true,
    itemGroups: dailySnapshotGroups,
    totalPendingCount: 4,
    totalBlockedCount: 3,
    totalWarningCount: 2,
    eldadAttentionRequired: true,
    highestUrgencyLevel: 'high',
    sourceStageRefs: DAILY_OPERATING_SOURCE_STAGE_REFS,
    capabilities: DAILY_OPERATING_CAPABILITY_LOCKS,
  },
] as const;
// #endregion
