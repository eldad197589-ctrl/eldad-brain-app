// #region Imports
import { buildMetadataApprovalPackagePreview } from '../../../work-spine/intake/metadata-approval-package-preview';
import type { EldadDecisionQueuePreviewItem } from './EldadDecisionQueuePreview';
// #endregion

// #region Types
/** Props for the MetadataApprovalPackagePreview component. */
interface Props {
  /** Single static metadata candidate selected for the package preview. */
  candidate: EldadDecisionQueuePreviewItem;
}
// #endregion

// #region Constants
const PACKAGE_BADGES = [
  'תצוגת חבילת אישור בלבד',
  'לא בוצעה פעולה במערכת',
  'מבוסס מטא־דאטה סטטי',
  'אין שמירה',
  'אין יצירת תיק / משימה / הפניית מסמך',
  'אין OCR / קריאת תוכן',
] as const;

const wrapperStyle = {
  border: '1px solid rgba(45, 212, 191, 0.34)',
  borderRadius: 8,
  background: 'rgba(20, 184, 166, 0.1)',
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
  border: '1px solid rgba(94, 234, 212, 0.34)',
  borderRadius: 999,
  color: '#99f6e4',
  padding: '3px 8px',
  fontSize: 11,
  fontWeight: 800,
} as const;
// #endregion

// #region Component
/**
 * MetadataApprovalPackagePreview — Shows one Stage 20A metadata-only package preview.
 *
 * @param props - Component props.
 * @returns Preview-only approval package display for one static candidate.
 *
 * @example
 * <MetadataApprovalPackagePreview candidate={candidate} />
 */
export default function MetadataApprovalPackagePreview({ candidate }: Props) {
  const confidence = candidate.confidence === 'medium' ? 'medium' : 'low';
  const packagePreview = buildMetadataApprovalPackagePreview({
    sourceId: candidate.queueItemId,
    sourceLabel: candidate.sourceLabel,
    possibleCategory: candidate.possibleCategory,
    confidence,
    sourceSignals: candidate.sourceSignals,
    reviewGateId: candidate.reviewGateId,
    reviewStatus: candidate.reviewStatus,
  });

  return (
    <section data-testid="metadata-approval-package-preview" style={wrapperStyle}>
      <header>
        <p style={{ margin: '0 0 2px', color: '#5eead4', fontSize: 12, fontWeight: 800 }}>Stage 20A</p>
        <h3 style={{ margin: 0, fontSize: 18 }}>תצוגת חבילת אישור בלבד</h3>
      </header>
      <p style={{ margin: 0, color: '#ccfbf1', lineHeight: 1.6 }}>
        חבילת אישור אחת מוצגת לצפייה בלבד. לא בוצעה פעולה במערכת, אין שמירה, אין OCR / קריאת תוכן,
        ואין יצירת תיק / משימה / הפניית מסמך.
      </p>
      <ul aria-label="Stage 20A approval package badges" style={badgeListStyle}>
        {PACKAGE_BADGES.map((badge) => (
          <li key={badge} style={badgeStyle}>{badge}</li>
        ))}
      </ul>
      <dl style={{ margin: 0, display: 'grid', gap: 4, color: '#d1fae5', lineHeight: 1.55 }}>
        <div><dt>approvalPackageId</dt><dd>{packagePreview.approvalPackageId}</dd></div>
        <div><dt>sourceLabel</dt><dd>{packagePreview.sourceLabel}</dd></div>
        <div><dt>possibleCategory</dt><dd>{packagePreview.possibleCategory}</dd></div>
        <div><dt>confidence</dt><dd>{packagePreview.confidence}</dd></div>
        <div><dt>reviewGateId</dt><dd>{packagePreview.reviewGateId}</dd></div>
        <div><dt>packageStatus</dt><dd>{packagePreview.packageStatus}</dd></div>
      </dl>
      <ul aria-label="Stage 20A approval package flags" style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', lineHeight: 1.55 }}>
        <li>previewPackageOnly:{String(packagePreview.previewPackageOnly)}</li>
        <li>persistenceAllowed:{String(packagePreview.persistenceAllowed)}</li>
        <li>entityCreationBlocked:{String(packagePreview.entityCreationBlocked)}</li>
        <li>contentUnverified:{String(packagePreview.contentUnverified)}</li>
        <li>contentRead:{String(packagePreview.contentRead)}</li>
        <li>ocrPerformed:{String(packagePreview.ocrPerformed)}</li>
        <li>providerConnected:{String(packagePreview.providerConnected)}</li>
        <li>blockedActions:{packagePreview.blockedActions.join(', ')}</li>
      </ul>
    </section>
  );
}
// #endregion
