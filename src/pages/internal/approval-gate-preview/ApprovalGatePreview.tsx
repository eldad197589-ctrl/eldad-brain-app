/* ============================================
   FILE: ApprovalGatePreview.tsx
   PURPOSE: Hidden internal read-only Approval Gate preview for Stage 7B.
   DEPENDENCIES: Static ApprovalDecision fixtures
   EXPORTS: ApprovalGatePreview (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import { STATIC_APPROVAL_DECISIONS } from '../../../work-spine/approval/approval-decision-seed';
import type {
  ApprovalBlockedOperationalEffects,
  ApprovalDecision,
  ApprovalDecisionSafetyFlags,
} from '../../../work-spine/approval/approval-decision-types';
// #endregion

// #region Constants
const BLOCKED_EFFECT_KEYS: readonly (keyof ApprovalBlockedOperationalEffects)[] = [
  'canCreateWorkItem',
  'canCreateMatter',
  'canCreateDocumentRef',
  'canPersist',
  'canRoute',
  'canExecuteProviderAction',
  'canCreateTask',
  'canCreateCalendarItem',
  'canCreateWorkflowItem',
];

const SAFETY_FLAG_KEYS: readonly (keyof ApprovalDecisionSafetyFlags)[] = [
  'metadataPreviewOnly',
  'staticMockOnly',
  'operationalCreationBlocked',
  'providerActionBlocked',
  'persistenceBlocked',
  'requiresEldadReview',
];

const pageShellStyle = {
  display: 'grid',
  gap: 20,
  direction: 'ltr',
} satisfies CSSProperties;

const heroStyle = {
  display: 'grid',
  gap: 10,
  padding: 20,
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.72)',
} satisfies CSSProperties;

const gridStyle = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 14,
  padding: 16,
  border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: 8,
  background: 'rgba(2, 6, 23, 0.64)',
} satisfies CSSProperties;

const metadataGridStyle = {
  display: 'grid',
  gap: 8,
} satisfies CSSProperties;

const pillRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
} satisfies CSSProperties;

const pillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  padding: '4px 8px',
  border: '1px solid rgba(45, 212, 191, 0.24)',
  borderRadius: 6,
  color: '#d1fae5',
  background: 'rgba(20, 184, 166, 0.1)',
  fontSize: 12,
  lineHeight: 1.4,
} satisfies CSSProperties;
// #endregion

// #region Types
/** Label/value row used inside the Approval Gate preview cards. */
interface DetailRowProps {
  /** Row label. */
  label: string;
  /** Row value. */
  value: string;
}

/** Decision card props for the static Approval Gate preview. */
interface DecisionCardProps {
  /** Static approval decision fixture to display. */
  decision: ApprovalDecision;
}
// #endregion

// #region Helpers
/** Formats a readonly string list for read-only display. */
const formatList = (values: readonly string[]): string =>
  values.length > 0 ? values.join(', ') : 'none';

/** Formats boolean values in the exact safety boundary text form. */
const formatFlag = (key: string, value: boolean): string => `${key}=${String(value)}`;
// #endregion

// #region Components
/** DetailRow renders one immutable approval decision field. */
function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      <span style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 0 }}>{label}</span>
      <span style={{ color: '#f8fafc', fontSize: 13, overflowWrap: 'anywhere' }}>{value}</span>
    </div>
  );
}

/** DecisionCard renders one static ApprovalDecision fixture without actions. */
function DecisionCard({ decision }: DecisionCardProps) {
  return (
    <article data-testid="approval-gate-preview-decision" style={cardStyle}>
      <header style={{ display: 'grid', gap: 4 }}>
        <h2 style={{ margin: 0, color: '#f8fafc', fontSize: 18, letterSpacing: 0 }}>
          {decision.decisionId}
        </h2>
        <span style={{ color: '#67e8f9', fontSize: 13 }}>{decision.status}</span>
      </header>

      <section aria-label="Approval decision metadata" style={metadataGridStyle}>
        <DetailRow label="sourceId" value={decision.sourceId} />
        <DetailRow label="sourceType" value={decision.sourceType} />
        <DetailRow label="approvalScope" value={decision.approvalScope} />
        <DetailRow label="reviewedBy" value={decision.reviewedBy} />
        <DetailRow label="reviewedAt" value={decision.reviewedAt} />
        <DetailRow label="reviewedEvidenceRefs" value={formatList(decision.reviewedEvidenceRefs)} />
        <DetailRow label="decisionReason" value={decision.decisionReason} />
        <DetailRow label="allowedNextStep" value={decision.allowedNextStep} />
      </section>

      <section aria-label="Blocked operational effects" style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 14, letterSpacing: 0 }}>
          blockedOperationalEffects
        </h3>
        <div style={pillRowStyle}>
          {BLOCKED_EFFECT_KEYS.map((key) => (
            <span key={key} style={pillStyle}>
              {formatFlag(key, decision.blockedOperationalEffects[key])}
            </span>
          ))}
        </div>
      </section>

      <section aria-label="Safety flags" style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 14, letterSpacing: 0 }}>
          safetyFlags
        </h3>
        <div style={pillRowStyle}>
          {SAFETY_FLAG_KEYS.map((key) => (
            <span key={key} style={pillStyle}>
              {formatFlag(key, decision.safetyFlags[key])}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
}

/** ApprovalGatePreview renders Stage 7B static read-only approval decisions. */
export default function ApprovalGatePreview() {
  return (
    <main dir="ltr" style={pageShellStyle}>
      <section style={heroStyle}>
        <p style={{ margin: 0, color: '#67e8f9', fontSize: 13 }}>Read-only approval preview</p>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: 28, letterSpacing: 0 }}>
          Approval Gate Preview
        </h1>
        <div style={pillRowStyle}>
          <span style={pillStyle}>Static fixtures only</span>
          <span style={pillStyle}>No approval interaction in this stage</span>
          <span style={pillStyle}>No operational object can be created from this preview</span>
        </div>
      </section>

      <section aria-label="Static approval decisions" style={gridStyle}>
        {STATIC_APPROVAL_DECISIONS.map((decision) => (
          <DecisionCard key={decision.decisionId} decision={decision} />
        ))}
      </section>
    </main>
  );
}
// #endregion
