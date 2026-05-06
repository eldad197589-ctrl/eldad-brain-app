/* ============================================
   FILE: ScannedIntakeMetadataPreview.tsx
   PURPOSE: Stage 19A static metadata-only scan intake preview.
   DEPENDENCIES: Static scanned intake snapshot
   EXPORTS: ScannedIntakeMetadataPreview component
   ============================================ */

// #region Imports
import { classifyScannedIntakeMetadata } from '../../../work-spine/intake/metadata-classification-helper';
import { buildMetadataReviewGatePreview } from '../../../work-spine/intake/metadata-review-gate-helper';
import { SCANNED_INTAKE_STATIC_SNAPSHOT } from '../../../work-spine/intake/scanned-intake-static-snapshot';
import EldadDecisionQueuePreview from './EldadDecisionQueuePreview';
import type { EldadDecisionQueuePreviewItem } from './EldadDecisionQueuePreview';
import EldadReviewGatePreview from './EldadReviewGatePreview';
import MetadataApprovalPackagePreview from './MetadataApprovalPackagePreview';
// #endregion

// #region Types
/** Props for the ScannedIntakeMetadataPreview component. */
interface Props {
  /** Manual workbench text used only for local scan-signal matching. */
  searchableText: string;
}

/** Static snapshot group rendered in Stage 19A preview rows. */
interface MetadataGroupPreview {
  parentFolderName: string;
  relativeFolder: string;
  candidatesCount: number;
  sampleFileNames: readonly string[];
}

/** Props for the CountMetric component. */
interface CountMetricProps {
  label: string;
  value: number;
}

/** Props for the CountsSection component. */
interface CountsSectionProps {
  totalCandidates: number;
  groupsCount: number;
  supportedFiles: number;
  scannedFolders: number;
  errors: number;
}

/** Props for the GroupRow component. */
interface GroupRowProps {
  group: MetadataGroupPreview;
}

/** Props for the GroupsSection component. */
interface GroupsSectionProps {
  groups: readonly MetadataGroupPreview[];
}
// #endregion

// #region Constants
const SCAN_SIGNAL_TERMS = ['scan', 'scans', 'סריקות', 'סריקה', 'תיקיית סריקות', 'אצווה', 'batch', 'מסמכים שנסרקו'] as const;

const STAGE_19A_WARNING =
  'תצוגת Stage 19A מבוססת על SCANNED_INTAKE_STATIC_SNAPSHOT בלבד. אין קריאת תיקייה חיה, אין OCR, אין קריאת תוכן קבצים, אין הסקת סוג מסמך/לקוח/מס/שכר/דחיפות, ואין יצירת Matter / WorkItem / DocumentRef.';

const SAFETY_BADGES = [
  'STATIC SNAPSHOT ONLY',
  'METADATA ONLY',
  'No live folder read',
  'No OCR',
  'No file content read',
  'No Matter / WorkItem / DocumentRef',
  'לא נקרא תוכן',
  'לא בוצע OCR',
  'דורש אישור אלדד',
  'לא נוצרה משימה / תיק / הפניית מסמך',
] as const;

const SAFETY_FLAGS = [
  'previewOnly:true',
  'staticOnly:true',
  'metadataOnly:true',
  'contentRead:false',
  'liveFolderRead:false',
  'ocrRun:false',
  'sourceVerified:false',
  'documentTypeInferred:false',
  'clientInferred:false',
  'taxMeaningInferred:false',
  'payrollMeaningInferred:false',
  'urgencyInferred:false',
  'canCreateMatter:false',
  'canCreateWorkItem:false',
  'canCreateDocumentRef:false',
  'canPersist:false',
  'canMoveOrRenameFiles:false',
] as const;

const wrapperStyle = {
  border: '1px solid rgba(34, 211, 238, 0.34)',
  borderRadius: 8,
  background: 'rgba(8, 47, 73, 0.32)',
  padding: 18,
  display: 'grid',
  gap: 14,
} as const;

const badgeListStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;

const badgeStyle = {
  border: '1px solid rgba(103, 232, 249, 0.32)',
  borderRadius: 999,
  color: '#a5f3fc',
  padding: '4px 8px',
  fontSize: 12,
  fontWeight: 800,
} as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
} as const;

const metricStyle = {
  border: '1px solid rgba(148, 163, 184, 0.22)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.55)',
  padding: 10,
} as const;

const rowStyle = {
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 8,
  background: 'rgba(2, 6, 23, 0.42)',
  padding: 12,
  display: 'grid',
  gap: 6,
} as const;
// #endregion

// #region Helpers
const hasScanSignal = (searchableText: string): boolean => {
  const normalizedText = searchableText.toLowerCase();
  return SCAN_SIGNAL_TERMS.some((term) => normalizedText.includes(term.toLowerCase()));
};

const getSnapshotGroups = (): readonly MetadataGroupPreview[] =>
  SCANNED_INTAKE_STATIC_SNAPSHOT.groups.map((group) => ({
    parentFolderName: group.parentFolderName,
    relativeFolder: group.relativeFolder,
    candidatesCount: group.candidatesCount,
    sampleFileNames: group.sampleFileNames,
  }));

const classifySampleFile = (group: MetadataGroupPreview, fileName: string) =>
  classifyScannedIntakeMetadata({
    fileName,
    folderLabel: group.parentFolderName,
    relativePathLabel: group.relativeFolder,
    snapshotGroupLabels: [group.parentFolderName, group.relativeFolder],
  });

const buildDecisionQueueItems = (groups: readonly MetadataGroupPreview[]): readonly EldadDecisionQueuePreviewItem[] =>
  groups.flatMap((group) =>
    group.sampleFileNames.map((fileName) => {
      const sourceId = `${group.relativeFolder}/${fileName}`;
      const classification = classifySampleFile(group, fileName);
      const reviewGate = buildMetadataReviewGatePreview({
        sourceId,
        sourceLabel: fileName,
        sourceType: 'static_scan_metadata_snapshot',
        timestampLabel: null,
      });

      return {
        queueItemId: `decision-queue-preview:${reviewGate.reviewGateId}`,
        sourceLabel: fileName,
        possibleCategory: classification.possibleCategory,
        confidence: classification.confidence,
        sourceSignals: classification.sourceSignals,
        reviewGateId: reviewGate.reviewGateId,
        reviewStatus: reviewGate.reviewStatus,
      };
    }),
  );
// #endregion

// #region Subcomponents
function SafetyBadges() {
  return (
    <ul aria-label="Stage 19A safety badges" style={badgeListStyle}>
      {SAFETY_BADGES.map((badge) => (
        <li key={badge} style={badgeStyle}>{badge}</li>
      ))}
    </ul>
  );
}

function CountMetric({ label, value }: CountMetricProps) {
  return (
    <div style={metricStyle}>
      <strong>{label}</strong>
      <div>{value}</div>
    </div>
  );
}

function CountsSection({ totalCandidates, groupsCount, supportedFiles, scannedFolders, errors }: CountsSectionProps) {
  return (
    <section aria-label="Stage 19A counts" style={gridStyle}>
      <CountMetric label="מועמדי מטא־דאטה" value={totalCandidates} />
      <CountMetric label="קבוצות סריקה" value={groupsCount} />
      <CountMetric label="קבצים נתמכים ב־snapshot" value={supportedFiles} />
      <CountMetric label="תיקיות שנספרו ב־snapshot" value={scannedFolders} />
      <CountMetric label="שגיאות ב־snapshot" value={errors} />
    </section>
  );
}

function SafetyFlags() {
  return (
    <section aria-label="Stage 19A safety flags">
      <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>דגלי בטיחות</h3>
      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', lineHeight: 1.6 }}>
        {SAFETY_FLAGS.map((flag) => <li key={flag}>{flag}</li>)}
      </ul>
    </section>
  );
}

function GroupRow({ group }: GroupRowProps) {
  return (
    <article data-testid="scanned-intake-metadata-group" style={rowStyle}>
      <strong>{group.parentFolderName}</strong>
      <span>תווית יחסית: {group.relativeFolder}</span>
      <span>מועמדים בקבוצה: {group.candidatesCount}</span>
      <span>שמות קבצים לדוגמה מתוך snapshot בלבד:</span>
      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', lineHeight: 1.55 }}>
        {group.sampleFileNames.map((fileName) => {
          const classification = classifySampleFile(group, fileName);
          return (
            <li key={`${group.relativeFolder}-${fileName}`} data-testid="scanned-intake-metadata-classification">
              <strong>{fileName}</strong>
              <div style={{ color: '#bfdbfe', fontSize: 12 }}>
                סיווג אפשרי לפי מטא־דאטה בלבד · possibleCategory:{classification.possibleCategory} · confidence:{classification.confidence} · needsEldadReview:{String(classification.needsEldadReview)}
              </div>
              <div style={{ color: '#e2e8f0', fontSize: 12 }}>reason:{classification.reason}</div>
              <div style={{ color: '#a5f3fc', fontSize: 12 }}>sourceSignals:{classification.sourceSignals.join(', ') || 'metadata labels only'}</div>
              <EldadReviewGatePreview
                sourceId={`${group.relativeFolder}/${fileName}`}
                candidateLabel={fileName}
                sourceType="static_scan_metadata_snapshot"
                possibleCategory={classification.possibleCategory}
                confidence={classification.confidence}
                timestampLabel={null}
              />
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function GroupsSection({ groups }: GroupsSectionProps) {
  return (
    <section aria-label="Stage 19A groups" style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ margin: 0, fontSize: 16 }}>קבוצות מטא־דאטה מתוך snapshot סטטי</h3>
      {groups.map((group) => <GroupRow key={group.relativeFolder} group={group} />)}
    </section>
  );
}
// #endregion

// #region Component
/**
 * ScannedIntakeMetadataPreview — Shows Stage 19A scan metadata from a static snapshot only.
 *
 * @param props - Component props.
 * @returns Static metadata-only scan intake preview, or null when no scan signal exists.
 *
 * @example
 * <ScannedIntakeMetadataPreview searchableText="סריקות" />
 */
export default function ScannedIntakeMetadataPreview({ searchableText }: Props) {
  if (!hasScanSignal(searchableText)) return null;

  const { summary, listing } = SCANNED_INTAKE_STATIC_SNAPSHOT;
  const groups = getSnapshotGroups();
  const decisionQueueItems = buildDecisionQueueItems(groups);
  const approvalPackageCandidate = decisionQueueItems[0] ?? null;

  return (
    <article data-testid="scanned-intake-metadata-preview" style={wrapperStyle}>
      <header>
        <p style={{ margin: '0 0 4px', color: '#67e8f9', fontWeight: 800 }}>Stage 19A</p>
        <h2 style={{ margin: 0, fontSize: 22 }}>תצוגת מטא־דאטה סריקות סטטית</h2>
      </header>

      <p data-testid="scanned-intake-metadata-warning" style={{ margin: 0, color: '#fef3c7', lineHeight: 1.65 }}>
        {STAGE_19A_WARNING}
      </p>

      <SafetyBadges />
      <p style={{ margin: 0, color: '#bae6fd', fontWeight: 800 }}>
        סיווג אפשרי לפי מטא־דאטה בלבד — לא נקרא תוכן, לא בוצע OCR, דורש אישור אלדד, ולא נוצרה משימה / תיק / הפניית מסמך.
      </p>
      <CountsSection
        totalCandidates={summary.totalCandidates}
        groupsCount={summary.groupsCount}
        supportedFiles={listing.supportedFiles}
        scannedFolders={listing.scannedFolders}
        errors={summary.errors + listing.errors}
      />
      <SafetyFlags />
      <EldadDecisionQueuePreview items={decisionQueueItems} />
      {approvalPackageCandidate ? <MetadataApprovalPackagePreview candidate={approvalPackageCandidate} /> : null}
      <GroupsSection groups={groups} />
    </article>
  );
}
// #endregion
