/* ============================================
   FILE: UnifiedIntakeLocalReview.tsx
   PURPOSE: Component-local review controls and preview-only gate for unified intake candidates.
   DEPENDENCIES: React, unified intake registry types
   EXPORTS: UnifiedIntakeLocalReview
   ============================================ */

// #region Imports
import { useMemo, useState, type CSSProperties } from 'react';
import type { UnifiedIntakeCandidate, UnifiedIntakeEvidenceRef } from '../../../work-spine/intake/unified-intake-registry';
// #endregion

// #region Types
type ReviewDecision = '' | 'open_task' | 'ignore' | 'defer' | 'merge';
type ReviewPriority = '' | 'low' | 'medium' | 'high' | 'urgent';

interface UnifiedIntakeLocalReviewState {
  reviewDecision: ReviewDecision;
  proposedTaskTitle: string;
  proposedOwner: string;
  proposedDueDate: string;
  proposedPriority: ReviewPriority;
  proposedMatterText: string;
  evidenceReviewed: boolean;
}

type UnifiedIntakeReviewBlocker =
  | 'reviewDecision'
  | 'proposedTaskTitle'
  | 'proposedOwner'
  | 'proposedDueDate'
  | 'proposedPriority'
  | 'proposedMatterText'
  | 'evidenceReviewed';

interface UnifiedIntakeLocalTaskCandidatePreview {
  title: string;
  sourceCandidateId: string;
  sourceType: string;
  sourceLabel: string;
  proposedOwner: string;
  proposedDueDate: string;
  proposedPriority: Exclude<ReviewPriority, ''>;
  proposedMatterText: string;
  evidenceCount: number;
  status: 'local_preview_only';
}

interface FormalApprovalGateDraft {
  candidateId: string;
  sourceType: string;
  taskPreviewTitle: string;
  matterDecision: string;
  ownerDecision: string;
  dueDateDecision: string;
  priorityDecision: string;
  evidenceReviewConfirmation: string;
  blockers: readonly string[];
  auditTextPreview: string;
}

interface UnifiedIntakeLocalReviewProps {
  candidate: UnifiedIntakeCandidate;
  evidenceRefs: readonly UnifiedIntakeEvidenceRef[];
}
// #endregion

// #region Styles
const panelStyle: CSSProperties = {
  borderTop: '1px solid rgba(148, 163, 184, 0.16)',
  paddingTop: 12,
  display: 'grid',
  gap: 12,
};

const fieldGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
};

const controlStyle: CSSProperties = {
  borderRadius: 10,
  border: '1px solid rgba(148, 163, 184, 0.26)',
  background: 'rgba(15, 23, 42, 0.68)',
  color: '#f8fafc',
  padding: '9px 10px',
  font: 'inherit',
};

const warningStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(245, 158, 11, 0.28)',
  background: 'rgba(245, 158, 11, 0.08)',
  color: '#fde68a',
  padding: 12,
  lineHeight: 1.7,
};

const readyStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(34, 197, 94, 0.26)',
  background: 'rgba(34, 197, 94, 0.08)',
  color: '#bbf7d0',
  padding: 12,
  lineHeight: 1.7,
};

const formalGateStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(56, 189, 248, 0.24)',
  background: 'rgba(8, 47, 73, 0.18)',
  color: '#dbeafe',
  padding: 12,
  lineHeight: 1.7,
  display: 'grid',
  gap: 10,
};
// #endregion

// #region Helpers
const createInitialState = (): UnifiedIntakeLocalReviewState => ({
  reviewDecision: '',
  proposedTaskTitle: '',
  proposedOwner: '',
  proposedDueDate: '',
  proposedPriority: '',
  proposedMatterText: '',
  evidenceReviewed: false,
});

const blockerLabels: Record<UnifiedIntakeReviewBlocker, string> = {
  reviewDecision: 'review decision is missing',
  proposedTaskTitle: 'proposed task title is missing',
  proposedOwner: 'proposed owner is missing',
  proposedDueDate: 'proposed due date is missing',
  proposedPriority: 'proposed priority is missing',
  proposedMatterText: 'proposed matter text is missing',
  evidenceReviewed: 'evidence has not been reviewed locally',
};

const isFilled = (value: string): boolean => value.trim() !== '';

const getBlockers = (state: UnifiedIntakeLocalReviewState): UnifiedIntakeReviewBlocker[] => {
  const blockers: UnifiedIntakeReviewBlocker[] = [];

  if (!state.reviewDecision) blockers.push('reviewDecision');
  if (state.reviewDecision !== 'open_task') return blockers;
  if (!isFilled(state.proposedTaskTitle)) blockers.push('proposedTaskTitle');
  if (!isFilled(state.proposedOwner)) blockers.push('proposedOwner');
  if (!isFilled(state.proposedDueDate)) blockers.push('proposedDueDate');
  if (!state.proposedPriority) blockers.push('proposedPriority');
  if (!isFilled(state.proposedMatterText)) blockers.push('proposedMatterText');
  if (!state.evidenceReviewed) blockers.push('evidenceReviewed');

  return blockers;
};

const createPreview = (
  state: UnifiedIntakeLocalReviewState,
  candidate: UnifiedIntakeCandidate,
  evidenceRefs: readonly UnifiedIntakeEvidenceRef[],
): UnifiedIntakeLocalTaskCandidatePreview | null => {
  const blockers = getBlockers(state);
  if (state.reviewDecision !== 'open_task' || blockers.length > 0 || !state.proposedPriority) return null;

  return {
    title: state.proposedTaskTitle.trim(),
    sourceCandidateId: candidate.candidateId,
    sourceType: candidate.sourceType,
    sourceLabel: candidate.sourceLabel,
    proposedOwner: state.proposedOwner.trim(),
    proposedDueDate: state.proposedDueDate,
    proposedPriority: state.proposedPriority,
    proposedMatterText: state.proposedMatterText.trim(),
    evidenceCount: evidenceRefs.length,
    status: 'local_preview_only',
  };
};

const formatReviewDecision = (decision: ReviewDecision): string => {
  if (decision === 'open_task') return 'open task later';
  if (decision === 'ignore') return 'ignore / noise';
  if (decision === 'defer') return 'defer review';
  if (decision === 'merge') return 'merge with another candidate';
  return 'not selected';
};

const createFormalApprovalGateDraft = (
  state: UnifiedIntakeLocalReviewState,
  candidate: UnifiedIntakeCandidate,
  evidenceRefs: readonly UnifiedIntakeEvidenceRef[],
  blockers: readonly UnifiedIntakeReviewBlocker[],
  preview: UnifiedIntakeLocalTaskCandidatePreview | null,
): FormalApprovalGateDraft => {
  const localBlockers = blockers.map((blocker) => blockerLabels[blocker]);
  const formalBlockers = [
    ...localBlockers,
    'explicit Eldad approval is not captured',
    'Agent A gate is required before any real promotion implementation',
    'promotion remains blocked in this mock display',
  ];

  return {
    candidateId: candidate.candidateId,
    sourceType: candidate.sourceType,
    taskPreviewTitle: preview?.title ?? 'no ready task preview',
    matterDecision: state.proposedMatterText.trim() || 'not resolved',
    ownerDecision: state.proposedOwner.trim() || 'not resolved',
    dueDateDecision: state.proposedDueDate || 'not resolved',
    priorityDecision: state.proposedPriority || 'not resolved',
    evidenceReviewConfirmation: state.evidenceReviewed ? 'evidence reviewed locally' : 'evidence not reviewed',
    blockers: formalBlockers,
    auditTextPreview:
      `Mock approval draft only: Eldad would need to review Unified Intake candidate ${candidate.candidateId} ` +
      `from source ${candidate.sourceType}, verify ${evidenceRefs.length} evidence refs, and explicitly approve ` +
      `promotion of the visible task preview before any operational WorkItem path could be considered.`,
  };
};
// #endregion

// #region Component
export function UnifiedIntakeLocalReview({ candidate, evidenceRefs }: UnifiedIntakeLocalReviewProps) {
  const [reviewState, setReviewState] = useState<UnifiedIntakeLocalReviewState>(createInitialState);
  const blockers = useMemo(() => getBlockers(reviewState), [reviewState]);
  const preview = useMemo(() => createPreview(reviewState, candidate, evidenceRefs), [candidate, evidenceRefs, reviewState]);
  const approvalDraft = useMemo(
    () => createFormalApprovalGateDraft(reviewState, candidate, evidenceRefs, blockers, preview),
    [blockers, candidate, evidenceRefs, preview, reviewState],
  );
  const isComplete = Boolean(preview);

  return (
    <section data-testid="unified-intake-local-review" style={panelStyle} dir="rtl">
      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>Local review layer — component state only</h4>
      <p data-testid="unified-intake-local-review-warning" style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>
        Local-only review state. Refresh clears it. No operational write is performed.
      </p>

      <div style={fieldGridStyle}>
        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Review decision</span>
          <select
            data-testid="unified-review-decision"
            aria-label="Review decision"
            value={reviewState.reviewDecision}
            onChange={(event) => setReviewState((current) => ({ ...current, reviewDecision: event.target.value as ReviewDecision }))}
            style={controlStyle}
          >
            <option value="">not selected</option>
            <option value="open_task">open task later</option>
            <option value="ignore">ignore / noise</option>
            <option value="defer">defer review</option>
            <option value="merge">merge with another candidate</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Proposed task title</span>
          <input
            data-testid="unified-review-proposed-title"
            aria-label="Proposed task title"
            value={reviewState.proposedTaskTitle}
            onChange={(event) => setReviewState((current) => ({ ...current, proposedTaskTitle: event.target.value }))}
            placeholder={candidate.sourceLabel}
            style={controlStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Proposed owner</span>
          <input
            data-testid="unified-review-proposed-owner"
            aria-label="Proposed owner"
            value={reviewState.proposedOwner}
            onChange={(event) => setReviewState((current) => ({ ...current, proposedOwner: event.target.value }))}
            style={controlStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Proposed due date</span>
          <input
            type="date"
            data-testid="unified-review-proposed-due-date"
            aria-label="Proposed due date"
            value={reviewState.proposedDueDate}
            onChange={(event) => setReviewState((current) => ({ ...current, proposedDueDate: event.target.value }))}
            style={controlStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Proposed priority</span>
          <select
            data-testid="unified-review-proposed-priority"
            aria-label="Proposed priority"
            value={reviewState.proposedPriority}
            onChange={(event) => setReviewState((current) => ({ ...current, proposedPriority: event.target.value as ReviewPriority }))}
            style={controlStyle}
          >
            <option value="">not selected</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Proposed matter text only</span>
          <input
            data-testid="unified-review-proposed-matter-text"
            aria-label="Proposed matter text only"
            value={reviewState.proposedMatterText}
            onChange={(event) => setReviewState((current) => ({ ...current, proposedMatterText: event.target.value }))}
            style={controlStyle}
          />
        </label>
      </div>

      <label style={{ ...fieldStyle, width: 'fit-content', color: '#e2e8f0' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Evidence reviewed locally</span>
        <input
          type="checkbox"
          data-testid="unified-review-evidence-reviewed"
          aria-label="Evidence reviewed locally"
          checked={reviewState.evidenceReviewed}
          onChange={(event) => setReviewState((current) => ({ ...current, evidenceReviewed: event.target.checked }))}
        />
      </label>

      <div data-testid="unified-review-completeness" style={{ color: '#e2e8f0', lineHeight: 1.7 }}>
        Local review complete: {isComplete ? 'yes' : 'no'} | Review decision: {formatReviewDecision(reviewState.reviewDecision)}
      </div>

      {preview ? (
        <div data-testid="unified-review-task-preview" style={readyStyle}>
          <strong>Task candidate preview — local only</strong>
          <div>title: {preview.title}</div>
          <div>sourceCandidateId: {preview.sourceCandidateId}</div>
          <div>sourceType: {preview.sourceType}</div>
          <div>sourceLabel: {preview.sourceLabel}</div>
          <div>proposedOwner: {preview.proposedOwner}</div>
          <div>proposedDueDate: {preview.proposedDueDate}</div>
          <div>proposedPriority: {preview.proposedPriority}</div>
          <div>proposedMatterText: {preview.proposedMatterText}</div>
          <div>evidenceCount: {preview.evidenceCount}</div>
          <div>status: {preview.status}</div>
        </div>
      ) : (
        <div data-testid="unified-review-blocked-preview" style={warningStyle}>
          <strong>Task candidate preview: blocked</strong>
          <div>canCreateWorkItem=false</div>
          <div>Approval gate: blocked until Eldad approval</div>
          <div>No operational write is performed</div>
          <ul style={{ margin: '8px 0 0', paddingInlineStart: 18, display: 'grid', gap: 4 }}>
            {blockers.length > 0 ? blockers.map((blocker) => <li key={blocker}>{blockerLabels[blocker]}</li>) : <li>decision is not applicable to task preview</li>}
          </ul>
        </div>
      )}

      <div data-testid="unified-formal-approval-gate" style={formalGateStyle}>
        <strong>Formal Approval Gate — mock/display-only</strong>
        <div>candidate id: {approvalDraft.candidateId}</div>
        <div>source type: {approvalDraft.sourceType}</div>
        <div>task preview title: {approvalDraft.taskPreviewTitle}</div>
        <div>matter decision: {approvalDraft.matterDecision}</div>
        <div>owner decision: {approvalDraft.ownerDecision}</div>
        <div>due date decision: {approvalDraft.dueDateDecision}</div>
        <div>priority decision: {approvalDraft.priorityDecision}</div>
        <div>evidence review confirmation: {approvalDraft.evidenceReviewConfirmation}</div>
        <div>approval is not persisted</div>
        <div>approval is not operational</div>
        <div>canCreateWorkItem=false</div>
        <div>promotion remains blocked</div>
        <div>Agent A required before any real implementation</div>
        <div>
          evidence refs:
          <ul style={{ margin: '4px 0 0', paddingInlineStart: 18, display: 'grid', gap: 4 }}>
            {evidenceRefs.map((evidence) => (
              <li key={`${candidate.candidateId}-${evidence.evidenceId}`}>
                {evidence.evidenceId} | {evidence.evidenceKind}: {evidence.title}
              </li>
            ))}
          </ul>
        </div>
        <div>
          blocker list:
          <ul style={{ margin: '4px 0 0', paddingInlineStart: 18, display: 'grid', gap: 4 }}>
            {approvalDraft.blockers.map((blocker) => (
              <li key={`${candidate.candidateId}-${blocker}`}>{blocker}</li>
            ))}
          </ul>
        </div>
        <div data-testid="unified-formal-approval-audit-text">audit text preview: {approvalDraft.auditTextPreview}</div>
      </div>

      <div data-testid="unified-review-approval-gate" style={warningStyle}>
        canCreateWorkItem=false | blocked until Eldad approval | no WorkItem, Matter, DocumentRef, IntakeEvent, or IntakeAttachment is created
      </div>
    </section>
  );
}
// #endregion
