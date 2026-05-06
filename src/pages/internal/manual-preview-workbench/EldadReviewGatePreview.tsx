/* ==== FILE: src/pages/internal/manual-preview-workbench/EldadReviewGatePreview.tsx ==== */

// #region Imports
import { buildMetadataReviewGatePreview } from '../../../work-spine/intake/metadata-review-gate-helper';
// #endregion

// #region Types
/** Props for the EldadReviewGatePreview component. */
interface Props {
  /** Stable metadata source identifier for the static review gate. */
  sourceId: string;
  /** Static snapshot file name or label shown beside the preview gate. */
  candidateLabel: string;
  /** Static source type label for the review gate. */
  sourceType: string;
  /** Possible category from metadata-only classification. */
  possibleCategory: string;
  /** Metadata-only confidence label. */
  confidence: string;
  /** Metadata timestamp label when available. */
  timestampLabel: string | null;
}
// #endregion

// #region Constants
const REVIEW_GATE_BADGES = [
  'שער אישור אלדד',
  'תצוגה בלבד',
  'אין שמירה',
  'אין יצירת משימה / תיק / הפניית מסמך',
  'אין פעולה תפעולית',
] as const;

const gateStyle = {
  border: '1px solid rgba(251, 191, 36, 0.3)',
  borderRadius: 8,
  background: 'rgba(69, 26, 3, 0.22)',
  padding: 10,
  display: 'grid',
  gap: 8,
} as const;

const badgeListStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;

const badgeStyle = {
  border: '1px solid rgba(252, 211, 77, 0.34)',
  borderRadius: 999,
  color: '#fde68a',
  padding: '3px 7px',
  fontSize: 11,
  fontWeight: 800,
} as const;
// #endregion

// #region Component
/**
 * EldadReviewGatePreview — Shows a passive Stage 19D review-gate preview only.
 *
 * @param props - Component props.
 * @returns Static review-gate preview for a metadata-classified scan candidate.
 *
 * @example
 * <EldadReviewGatePreview sourceId="scan.pdf" candidateLabel="scan.pdf" sourceType="scan" possibleCategory="scan_metadata" confidence="low" timestampLabel={null} />
 */
export default function EldadReviewGatePreview({
  sourceId,
  candidateLabel,
  sourceType,
  possibleCategory,
  confidence,
  timestampLabel,
}: Props) {
  const reviewGate = buildMetadataReviewGatePreview({
    sourceId,
    sourceLabel: candidateLabel,
    sourceType,
    timestampLabel,
  });
  const flagLines = [
    `previewOnly:${String(reviewGate.previewOnly)}`,
    `noPersistence:${String(reviewGate.noPersistence)}`,
    `staticReviewGateOnly:${String(reviewGate.staticReviewGateOnly)}`,
    `operationalExecution:${String(reviewGate.operationalExecution)}`,
    `contentRead:${String(reviewGate.contentRead)}`,
    `ocrPerformed:${String(reviewGate.ocrPerformed)}`,
    `providerConnected:${String(reviewGate.providerConnected)}`,
    `reviewStatus:${reviewGate.reviewStatus}`,
  ] as const;

  return (
    <aside data-testid="eldad-review-gate-preview" style={gateStyle}>
      <header>
        <p style={{ margin: '0 0 2px', color: '#fbbf24', fontSize: 12, fontWeight: 800 }}>Stage 19D</p>
        <h4 style={{ margin: 0, fontSize: 15 }}>שער אישור אלדד</h4>
      </header>
      <ul aria-label="Stage 19D safety badges" style={badgeListStyle}>
        {REVIEW_GATE_BADGES.map((badge) => (
          <li key={badge} style={badgeStyle}>{badge}</li>
        ))}
      </ul>
      <p style={{ margin: 0, color: '#fde68a', lineHeight: 1.55 }}>
        תצוגה בלבד: מועמד "{candidateLabel}" נשאר לבדיקה ידנית של אלדד לפני כל שימוש עתידי.
      </p>
      <p style={{ margin: 0, color: '#e2e8f0', fontSize: 12 }}>
        reviewGateId:{reviewGate.reviewGateId} · sourceType:{reviewGate.sourceType} · possibleCategory:{possibleCategory} · confidence:{confidence} · requiresEldadReview:true
      </p>
      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', lineHeight: 1.5 }}>
        {flagLines.map((flag) => <li key={flag}>{flag}</li>)}
        <li>blockedActions:{reviewGate.blockedActions.join(', ')}</li>
      </ul>
    </aside>
  );
}
// #endregion
