/* ==== FILE: src/pages/internal/manual-preview-workbench/EldadDecisionQueuePreview.tsx ==== */

// #region Types
/** Static item shown inside the Stage 19E Eldad decision queue preview. */
export interface EldadDecisionQueuePreviewItem {
  /** Stable static queue preview identifier. */
  queueItemId: string;
  /** Static source label copied from metadata-only intake. */
  sourceLabel: string;
  /** Possible category from metadata-only classification. */
  possibleCategory: string;
  /** Metadata-only confidence label. */
  confidence: string;
  /** Source signals used by metadata-only classification. */
  sourceSignals: readonly string[];
  /** Review gate preview identifier from Stage 19D helper. */
  reviewGateId: string;
  /** Review status copied from the static review gate helper. */
  reviewStatus: 'pending_eldad_review';
}

/** Props for the EldadDecisionQueuePreview component. */
interface Props {
  /** Static decision queue items derived from metadata-only review gates. */
  items: readonly EldadDecisionQueuePreviewItem[];
}
// #endregion

// #region Constants
const DECISION_QUEUE_WARNING =
  'תור החלטות אלדד — תצוגה בלבד. ממתין לאישור אלדד. אין שמירה, אין אישור/דחייה אמיתיים, ואין יצירת משימה / תיק / הפניית מסמך.';

const DECISION_QUEUE_BADGES = [
  'תור החלטות אלדד',
  'תצוגה בלבד',
  'ממתין לאישור אלדד',
  'אין שמירה',
  'אין אישור/דחייה אמיתיים',
  'אין יצירת משימה / תיק / הפניית מסמך',
] as const;

const DECISION_QUEUE_FLAGS = [
  'previewOnly:true',
  'decisionPreviewOnly:true',
  'noPersistence:true',
  'staticQueueOnly:true',
  'noRealApproval:true',
  'operationalExecution:false',
  'canCreateMatter:false',
  'canCreateWorkItem:false',
  'canCreateDocumentRef:false',
] as const;

const wrapperStyle = {
  border: '1px solid rgba(251, 191, 36, 0.34)',
  borderRadius: 8,
  background: 'rgba(69, 26, 3, 0.18)',
  padding: 14,
  display: 'grid',
  gap: 10,
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
  border: '1px solid rgba(252, 211, 77, 0.32)',
  borderRadius: 999,
  color: '#fde68a',
  padding: '3px 8px',
  fontSize: 11,
  fontWeight: 800,
} as const;

const queueItemStyle = {
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.46)',
  padding: 10,
  display: 'grid',
  gap: 4,
} as const;
// #endregion

// #region Component
/**
 * EldadDecisionQueuePreview — Shows Stage 19E decision queue preview rows only.
 *
 * @param props - Component props.
 * @returns Preview-only Eldad decision queue, or null when no static items exist.
 *
 * @example
 * <EldadDecisionQueuePreview items={[]} />
 */
export default function EldadDecisionQueuePreview({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section data-testid="eldad-decision-queue-preview" style={wrapperStyle}>
      <header>
        <p style={{ margin: '0 0 2px', color: '#fbbf24', fontSize: 12, fontWeight: 800 }}>Stage 19E</p>
        <h3 style={{ margin: 0, fontSize: 18 }}>תור החלטות אלדד</h3>
      </header>
      <p style={{ margin: 0, color: '#fef3c7', lineHeight: 1.6 }}>{DECISION_QUEUE_WARNING}</p>
      <ul aria-label="Stage 19E decision queue badges" style={badgeListStyle}>
        {DECISION_QUEUE_BADGES.map((badge) => (
          <li key={badge} style={badgeStyle}>{badge}</li>
        ))}
      </ul>
      <ul aria-label="Stage 19E decision queue flags" style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', lineHeight: 1.55 }}>
        {DECISION_QUEUE_FLAGS.map((flag) => <li key={flag}>{flag}</li>)}
      </ul>
      <ol aria-label="Stage 19E static decision queue rows" style={{ margin: 0, paddingInlineStart: 18, display: 'grid', gap: 8 }}>
        {items.map((item) => (
          <li key={item.queueItemId} data-testid="eldad-decision-queue-item" style={queueItemStyle}>
            <strong>{item.sourceLabel}</strong>
            <span>queueStatus:ממתין לאישור אלדד</span>
            <span>possibleCategory:{item.possibleCategory} · confidence:{item.confidence}</span>
            <span>reviewGateId:{item.reviewGateId}</span>
            <span>reviewStatus:{item.reviewStatus}</span>
            <span>sourceSignals:{item.sourceSignals.join(', ') || 'metadata labels only'}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
// #endregion
