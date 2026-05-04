/* ============================================
   FILE: ScannedEvidenceApprovalGatePreview.tsx
   PURPOSE: Passive approval-gate preview for static scanned evidence candidates.
   DEPENDENCIES: React
   EXPORTS: ScannedEvidenceApprovalGatePreview component
   ============================================ */

// #region Imports
import type {
  DuplicateRiskLevel,
  ScannedEvidenceCandidate,
  SuggestedActionPreview,
} from '../../../work-spine/scanned-evidence/scanned-evidence-types';
// #endregion

// #region Types
type ExecutionStatus = 'preview_only_not_executed';
type RiskPreview = `duplicate_risk_${DuplicateRiskLevel}`;

/** Local read-only preview shape for the passive approval gate. */
interface ApprovalPreview {
  /** Static scanned evidence candidate identifier. */
  candidateEvidenceId: string;
  /** Static preview suggestion from the candidate. */
  suggestedActionPreview: SuggestedActionPreview;
  /** Human-readable passive review label. */
  proposedReviewLabel: string;
  /** Conservative reason for showing this preview. */
  reason: string;
  /** Static evidence lines that support the passive preview. */
  supportingEvidence: readonly string[];
  /** Missing fields that still require human review. */
  missingFields: readonly string[];
  /** Duplicate-risk preview derived from static data only. */
  riskPreview: RiskPreview;
  /** Marker proving the preview has not been executed. */
  executionStatus: ExecutionStatus;
}

/** Props for ScannedEvidenceApprovalGatePreview. */
interface Props {
  /** Static scanned evidence candidate to preview. */
  candidate: ScannedEvidenceCandidate;
}
// #endregion

// #region Constants
const EXECUTION_STATUS: ExecutionStatus = 'preview_only_not_executed';
const WARNING_TEXT = 'תצוגת אישור בלבד — לא נוצרת משימה, לא נשלח דבר, ולא מתבצעת פעולה.';
const MISSING = 'חסר';

const REVIEW_LABEL_BY_SUGGESTION: Record<SuggestedActionPreview, string> = {
  preview_only_review: 'סקירה ידנית מקדימה',
  preview_only_vat_mapping: 'בדיקת מיפוי מע״מ',
  preview_only_deadline_check: 'בדיקת מועד וסיכון',
  preview_only_classification: 'בדיקת סיווג',
  preview_only_missing_info: 'בדיקת שדות חסרים',
  preview_only_payroll_review: 'בדיקת שכר',
  preview_only_legal_review: 'בדיקה משפטית',
  preview_only_unknown_triage: 'מיון ראשוני',
};

const wrapperStyle = {
  border: '1px solid rgba(34, 211, 238, 0.22)',
  borderRadius: 8,
  background: 'rgba(8, 47, 73, 0.34)',
  color: '#e0f2fe',
  padding: 12,
};

const warningStyle = {
  color: '#fde68a',
  fontWeight: 800,
  margin: '0 0 8px',
  fontSize: 13,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const labelStyle = {
  color: '#bae6fd',
  display: 'block',
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 4,
};
// #endregion

// #region Helpers
/**
 * Build passive supporting evidence lines from a static candidate.
 * @param candidate - Static scanned evidence candidate.
 * @returns Supporting evidence lines.
 */
const buildSupportingEvidence = (candidate: ScannedEvidenceCandidate): readonly string[] => [
  `evidenceId: ${candidate.evidenceId}`,
  `sourceFileName: ${candidate.sourceFileName}`,
  `documentKind: ${candidate.documentKind}`,
  `professionalDomain: ${candidate.professionalDomain}`,
  `confidence: ${candidate.confidence}`,
  `sourceTrace: ${candidate.sourceTrace}`,
];

/**
 * Build the local passive approval preview shape.
 * @param candidate - Static scanned evidence candidate.
 * @returns Passive approval preview data.
 */
const buildApprovalPreview = (candidate: ScannedEvidenceCandidate): ApprovalPreview => ({
  candidateEvidenceId: candidate.evidenceId,
  suggestedActionPreview: candidate.suggestedActionPreview,
  proposedReviewLabel: REVIEW_LABEL_BY_SUGGESTION[candidate.suggestedActionPreview],
  reason: 'קיים מועמד סטטי עם סוג מסמך, תחום מקצועי וכיוון בדיקה מקדים.',
  supportingEvidence: buildSupportingEvidence(candidate),
  missingFields: candidate.missingFields,
  riskPreview: `duplicate_risk_${candidate.duplicateRisk}`,
  executionStatus: EXECUTION_STATUS,
});

/**
 * Format list values for passive display.
 * @param values - Values to format.
 * @returns Display text.
 */
const formatList = (values: readonly string[]): string => (values.length > 0 ? values.join(', ') : MISSING);
// #endregion

// #region Component
/**
 * ScannedEvidenceApprovalGatePreview — Passive approval-gate preview for one static candidate.
 * @param props - ScannedEvidenceApprovalGatePreview props.
 * @returns Read-only approval gate preview.
 */
export default function ScannedEvidenceApprovalGatePreview({ candidate }: Props) {
  const preview = buildApprovalPreview(candidate);

  return (
    <section data-testid="scanned-evidence-approval-gate-preview" style={wrapperStyle}>
      <p style={warningStyle}>{WARNING_TEXT}</p>
      <div style={gridStyle}>
        <div>
          <span style={labelStyle}>candidateEvidenceId</span>
          {preview.candidateEvidenceId}
        </div>
        <div>
          <span style={labelStyle}>proposedReviewLabel</span>
          {preview.proposedReviewLabel}
        </div>
        <div>
          <span style={labelStyle}>suggestedActionPreview</span>
          {preview.suggestedActionPreview}
        </div>
        <div>
          <span style={labelStyle}>executionStatus</span>
          {preview.executionStatus}
        </div>
        <div>
          <span style={labelStyle}>riskPreview</span>
          {preview.riskPreview}
        </div>
        <div>
          <span style={labelStyle}>missingFields</span>
          {formatList(preview.missingFields)}
        </div>
        <div>
          <span style={labelStyle}>reason</span>
          {preview.reason}
        </div>
        <div>
          <span style={labelStyle}>supportingEvidence</span>
          {formatList(preview.supportingEvidence)}
        </div>
      </div>
    </section>
  );
}
// #endregion
