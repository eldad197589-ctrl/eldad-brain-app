/* ============================================
   FILE: ManualScanReview.tsx
   PURPOSE: Local-only manual review UI for one static scan manifest entry.
   DEPENDENCIES: react, scanned-intake-static-manifest
   EXPORTS: ManualScanReview (default)
   ============================================ */

// #region Imports
import { useState, type CSSProperties } from 'react';
import type { ScannedIntakeManifestType, ScannedIntakeStaticManifestEntry } from './scanned-intake-static-manifest';
// #endregion

// #region Types
type ReviewDecision = '' | 'review_later' | 'ready_for_task_preview' | 'ignore_for_now' | 'needs_more_info';
type ReviewPriority = '' | 'low' | 'medium' | 'high';
type ReviewUrgency = '' | 'not_urgent' | 'soon' | 'urgent';
type ReviewProcess = '' | 'not_applicable' | 'war_compensation' | 'vat_reporting' | 'accounting_analysis' | 'business_review' | 'unknown';

interface LocalScanReviewState {
  confirmedEntity: string;
  confirmedIntakeType: '' | ScannedIntakeManifestType;
  confirmedProcess: ReviewProcess;
  priority: ReviewPriority;
  urgency: ReviewUrgency;
  reviewer: string;
  evidenceChecked: boolean;
  reviewNote: string;
  decision: ReviewDecision;
}

interface ReviewSummary {
  missingFields: string[];
  previewStatus: 'blocked' | 'local_preview_only';
  canCreateWorkItem: false;
  requiresExplicitEldadApproval: true;
}

interface TextInputFieldProps {
  label: string;
  testId: string;
  value: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
}

interface SelectFieldProps {
  label: string;
  testId: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
}

interface EvidenceFieldProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

interface ReviewSummaryProps {
  summary: ReviewSummary;
}

interface ReviewPreviewProps {
  entry: ScannedIntakeStaticManifestEntry;
  review: LocalScanReviewState;
  summary: ReviewSummary;
}

/** Props for ManualScanReview. */
interface Props {
  /** Static manifest entry being reviewed locally. */
  entry: ScannedIntakeStaticManifestEntry;
  /** Optional initial state for local-only tests or seeded display. */
  initialReview?: Partial<LocalScanReviewState>;
}
// #endregion

// #region Constants
const defaultReview: LocalScanReviewState = {
  confirmedEntity: '',
  confirmedIntakeType: '',
  confirmedProcess: '',
  priority: '',
  urgency: '',
  reviewer: '',
  evidenceChecked: false,
  reviewNote: '',
  decision: '',
};

const intakeTypeOptions = ['', 'case', 'process', 'personal', 'business', 'unknown'];
const processOptions = ['', 'not_applicable', 'war_compensation', 'vat_reporting', 'accounting_analysis', 'business_review', 'unknown'];
const priorityOptions = ['', 'low', 'medium', 'high'];
const urgencyOptions = ['', 'not_urgent', 'soon', 'urgent'];
const decisionOptions = ['', 'review_later', 'ready_for_task_preview', 'ignore_for_now', 'needs_more_info'];

const panelStyle: CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(56, 189, 248, 0.18)',
  background: 'rgba(8, 47, 73, 0.2)',
  padding: 14,
  display: 'grid',
  gap: 12,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 5,
  color: '#cbd5e1',
  fontSize: '0.86rem',
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 10,
  border: '1px solid rgba(148, 163, 184, 0.26)',
  background: 'rgba(15, 23, 42, 0.7)',
  color: '#f8fafc',
  padding: '9px 10px',
};
// #endregion

// #region Helpers
const createReviewState = (initialReview?: Partial<LocalScanReviewState>): LocalScanReviewState => ({
  ...defaultReview,
  ...initialReview,
});

const createReviewSummary = (review: LocalScanReviewState): ReviewSummary => {
  const missingFields = [
    review.decision === 'ready_for_task_preview' ? null : 'decision ready_for_task_preview',
    review.confirmedEntity.trim() ? null : 'confirmedEntity',
    review.confirmedIntakeType ? null : 'confirmedIntakeType',
    review.confirmedProcess ? null : 'confirmedProcess',
    review.priority ? null : 'priority',
    review.urgency ? null : 'urgency',
    review.reviewer.trim() ? null : 'reviewer',
    review.evidenceChecked ? null : 'evidenceChecked',
  ].filter((field): field is string => Boolean(field));

  return {
    missingFields,
    previewStatus: missingFields.length === 0 ? 'local_preview_only' : 'blocked',
    canCreateWorkItem: false,
    requiresExplicitEldadApproval: true,
  };
};

const formatOptionLabel = (value: string): string => value || 'choose';
// #endregion

// #region Subcomponents
const TextInputField = ({ label, testId, value, placeholder, onValueChange }: TextInputFieldProps) => (
  <label style={fieldStyle}>
    {label}
    <input
      data-testid={testId}
      style={inputStyle}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onValueChange(event.target.value)}
    />
  </label>
);

const SelectField = ({ label, testId, value, options, onValueChange }: SelectFieldProps) => (
  <label style={fieldStyle}>
    {label}
    <select data-testid={testId} style={inputStyle} value={value} onChange={(event) => onValueChange(event.target.value)}>
      {options.map((option) => (
        <option key={`${testId}-${option || 'empty'}`} value={option}>
          {formatOptionLabel(option)}
        </option>
      ))}
    </select>
  </label>
);

const EvidenceField = ({ checked, onCheckedChange }: EvidenceFieldProps) => (
  <label style={{ ...fieldStyle, alignContent: 'end' }}>
    <span>
      <input
        data-testid="manual-scan-evidence-checked"
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />{' '}
      evidenceChecked
    </span>
  </label>
);

const ReviewSummaryPanel = ({ summary }: ReviewSummaryProps) => (
  <div data-testid="manual-scan-review-summary" style={{ color: '#e2e8f0', display: 'grid', gap: 6 }}>
    <strong>Blocked Preview Only</strong>
    <span>previewStatus: {summary.previewStatus}</span>
    <span>canCreateWorkItem=false</span>
    <span>requires explicit Eldad approval</span>
    <span>missingFields: {summary.missingFields.length ? summary.missingFields.join(', ') : 'none'}</span>
  </div>
);

const ReviewPreview = ({ entry, review, summary }: ReviewPreviewProps) => {
  if (summary.previewStatus !== 'local_preview_only') return null;

  return (
    <div data-testid="manual-scan-local-preview" style={{ color: '#bbf7d0', lineHeight: 1.7 }}>
      local_preview_only: {entry.folderName} | {review.confirmedEntity} | {review.confirmedProcess} | {review.priority} | {review.urgency}
    </div>
  );
};
// #endregion

// #region Component
/** ManualScanReview — Captures local scan naming decisions without persistence or promotion. */
export default function ManualScanReview({ entry, initialReview }: Props) {
  const [review, setReview] = useState<LocalScanReviewState>(() => createReviewState(initialReview));
  const summary = createReviewSummary(review);
  const updateReview = (patch: Partial<LocalScanReviewState>) => setReview((current) => ({ ...current, ...patch }));

  return (
    <section data-testid="manual-scan-review" style={panelStyle}>
      <div>
        <h4 style={{ margin: 0, color: '#f8fafc' }}>Manual Scan Review — local only</h4>
        <p style={{ margin: '6px 0 0', color: '#fde68a', lineHeight: 1.6 }}>State resets on reload</p>
      </div>
      <div style={gridStyle}>
        <TextInputField label="confirmedEntity" testId="manual-scan-confirmed-entity" value={review.confirmedEntity} placeholder={entry.relatedEntityGuess} onValueChange={(value) => updateReview({ confirmedEntity: value })} />
        <SelectField label="confirmedIntakeType" testId="manual-scan-confirmed-intake-type" value={review.confirmedIntakeType} options={intakeTypeOptions} onValueChange={(value) => updateReview({ confirmedIntakeType: value as LocalScanReviewState['confirmedIntakeType'] })} />
        <SelectField label="confirmedProcess" testId="manual-scan-confirmed-process" value={review.confirmedProcess} options={processOptions} onValueChange={(value) => updateReview({ confirmedProcess: value as ReviewProcess })} />
        <SelectField label="priority" testId="manual-scan-priority" value={review.priority} options={priorityOptions} onValueChange={(value) => updateReview({ priority: value as ReviewPriority })} />
        <SelectField label="urgency" testId="manual-scan-urgency" value={review.urgency} options={urgencyOptions} onValueChange={(value) => updateReview({ urgency: value as ReviewUrgency })} />
        <TextInputField label="reviewer" testId="manual-scan-reviewer" value={review.reviewer} onValueChange={(value) => updateReview({ reviewer: value })} />
        <SelectField label="decision" testId="manual-scan-decision" value={review.decision} options={decisionOptions} onValueChange={(value) => updateReview({ decision: value as ReviewDecision })} />
        <EvidenceField checked={review.evidenceChecked} onCheckedChange={(value) => updateReview({ evidenceChecked: value })} />
      </div>
      <label style={fieldStyle}>
        reviewNote
        <textarea data-testid="manual-scan-review-note" style={{ ...inputStyle, minHeight: 70 }} value={review.reviewNote} onChange={(event) => updateReview({ reviewNote: event.target.value })} />
      </label>
      <ReviewSummaryPanel summary={summary} />
      <ReviewPreview entry={entry} review={review} summary={summary} />
    </section>
  );
}
// #endregion
