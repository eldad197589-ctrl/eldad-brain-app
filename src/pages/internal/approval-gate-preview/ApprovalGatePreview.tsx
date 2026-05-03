/* ============================================
   FILE: ApprovalGatePreview.tsx
   PURPOSE: Hidden internal local-only Approval Gate simulation for Stage 7C.
   DEPENDENCIES: Static ApprovalDecision fixtures
   EXPORTS: ApprovalGatePreview (default)
   ============================================ */

// #region Imports
import { useCallback, useState } from 'react';
import type { CSSProperties } from 'react';
import { STATIC_APPROVAL_DECISIONS } from '../../../work-spine/approval/approval-decision-seed';
import {
  APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP,
  APPROVAL_NO_NEXT_STEP,
} from '../../../work-spine/approval/approval-decision-types';
import type {
  ApprovalBlockedOperationalEffects,
  ApprovalDecisionStatus,
  ApprovalDecision,
  ApprovalDecisionSafetyFlags,
  ApprovalAllowedNextStep,
} from '../../../work-spine/approval/approval-decision-types';
// #endregion

// #region Constants
const SIMULATION_ACTIONS: readonly { label: string; status: ApprovalDecisionStatus }[] = [
  { label: '🧪 Approve simulation', status: 'approved_for_candidate_preview' },
  { label: '🧪 Reject simulation', status: 'rejected' },
  { label: '🧪 Needs More Evidence simulation', status: 'needs_more_evidence' },
  { label: '🧪 Blocked simulation', status: 'blocked' },
];

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
  'metadataPreviewOnly', 'staticMockOnly', 'operationalCreationBlocked',
  'providerActionBlocked', 'persistenceBlocked', 'requiresEldadReview',
];

const SAFETY_COPY = ['Static fixtures only', 'Local UI simulation only', 'No persistence',
  'No WorkItem / Matter / DocumentRef creation', 'No provider action',
  'No operational object can be created from this preview'] as const;

const pageShellStyle = { display: 'grid', gap: 20, direction: 'ltr' } satisfies CSSProperties;
const heroStyle = {
  display: 'grid', gap: 10, padding: 20, border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: 8, background: 'rgba(15, 23, 42, 0.72)',
} satisfies CSSProperties;
const simulationBannerStyle = {
  padding: 14, border: '1px solid rgba(251, 191, 36, 0.42)', borderRadius: 8,
  color: '#fef3c7', background: 'rgba(146, 64, 14, 0.2)', fontSize: 15, fontWeight: 700,
} satisfies CSSProperties;
const gridStyle = {
  display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
} satisfies CSSProperties;
const cardStyle = {
  display: 'grid', gap: 14, padding: 16, border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: 8, background: 'rgba(2, 6, 23, 0.64)',
} satisfies CSSProperties;
const metadataGridStyle = { display: 'grid', gap: 8 } satisfies CSSProperties;
const pillRowStyle = { display: 'flex', flexWrap: 'wrap', gap: 8 } satisfies CSSProperties;
const pillStyle = {
  display: 'inline-flex', alignItems: 'center', minHeight: 28, padding: '4px 8px',
  border: '1px solid rgba(45, 212, 191, 0.24)', borderRadius: 6, color: '#d1fae5',
  background: 'rgba(20, 184, 166, 0.1)', fontSize: 12, lineHeight: 1.4,
} satisfies CSSProperties;
const simulationButtonStyle = {
  minHeight: 34, padding: '6px 10px', border: '1px solid rgba(251, 191, 36, 0.34)',
  borderRadius: 6, color: '#fef3c7', background: 'rgba(120, 53, 15, 0.28)',
  cursor: 'pointer', fontSize: 12, letterSpacing: 0,
} satisfies CSSProperties;
const simulatedBadgeStyle = {
  display: 'inline-flex', width: 'fit-content', padding: '4px 8px',
  border: '1px solid rgba(251, 191, 36, 0.36)', borderRadius: 6, color: '#fde68a',
  background: 'rgba(146, 64, 14, 0.24)', fontSize: 12, fontWeight: 700,
} satisfies CSSProperties;
// #endregion

// #region Types
interface SimulatedStatusByDecisionId {
  [decisionId: string]: ApprovalDecisionStatus | undefined;
}

interface DetailRowProps {
  label: string;
  value: string;
}

interface DecisionCardProps {
  decision: ApprovalDecision;
  simulatedStatus: ApprovalDecisionStatus | undefined;
  onSimulate: (decisionId: string, status: ApprovalDecisionStatus) => void;
  onReset: (decisionId: string) => void;
}

interface DecisionHeaderProps {
  decision: ApprovalDecision;
  currentStatus: ApprovalDecisionStatus;
  isSimulated: boolean;
}

interface DecisionMetadataProps {
  decision: ApprovalDecision;
  allowedNextStep: ApprovalAllowedNextStep;
}

interface SimulationActionsProps {
  decisionId: string;
  onSimulate: (decisionId: string, status: ApprovalDecisionStatus) => void;
  onReset: (decisionId: string) => void;
}

interface FlagSectionProps<FlagKey extends string> {
  title: string;
  keys: readonly FlagKey[];
  values: Record<FlagKey, boolean>;
}
// #endregion

// #region Helpers
const formatList = (values: readonly string[]): string =>
  values.length > 0 ? values.join(', ') : 'none';

const formatFlag = (key: string, value: boolean): string => `${key}=${String(value)}`;

const getAllowedNextStepForStatus = (
  status: ApprovalDecisionStatus,
): ApprovalAllowedNextStep =>
  status === 'approved_for_candidate_preview'
    ? APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP
    : APPROVAL_NO_NEXT_STEP;
// #endregion

// #region Components
function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      <span style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 0 }}>{label}</span>
      <span style={{ color: '#f8fafc', fontSize: 13, overflowWrap: 'anywhere' }}>{value}</span>
    </div>
  );
}

function DecisionHeader({ decision, currentStatus, isSimulated }: DecisionHeaderProps) {
  return (
    <header style={{ display: 'grid', gap: 4 }}>
      <h2 style={{ margin: 0, color: '#f8fafc', fontSize: 18, letterSpacing: 0 }}>
        {decision.decisionId}
      </h2>
      <span data-testid={`decision-status-${decision.decisionId}`} style={{ color: '#67e8f9', fontSize: 13 }}>
        {currentStatus}
      </span>
      {isSimulated ? (
        <span data-testid={`simulated-badge-${decision.decisionId}`} style={simulatedBadgeStyle}>
          [SIMULATED]
        </span>
      ) : null}
    </header>
  );
}

function DecisionMetadata({ decision, allowedNextStep }: DecisionMetadataProps) {
  return (
    <section aria-label="Approval decision metadata" style={metadataGridStyle}>
      <DetailRow label="sourceId" value={decision.sourceId} />
      <DetailRow label="sourceType" value={decision.sourceType} />
      <DetailRow label="approvalScope" value={decision.approvalScope} />
      <DetailRow label="reviewedBy" value={decision.reviewedBy} />
      <DetailRow label="reviewedAt" value={decision.reviewedAt} />
      <DetailRow label="reviewedEvidenceRefs" value={formatList(decision.reviewedEvidenceRefs)} />
      <DetailRow label="decisionReason" value={decision.decisionReason} />
      <DetailRow label="allowedNextStep" value={allowedNextStep} />
    </section>
  );
}

function SimulationActions({ decisionId, onSimulate, onReset }: SimulationActionsProps) {
  return (
    <section aria-label="Local simulation actions" style={{ display: 'grid', gap: 8 }}>
      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 14, letterSpacing: 0 }}>
        Local UI simulation only
      </h3>
      <div style={pillRowStyle}>
        {SIMULATION_ACTIONS.map((action) => (
          <button
            key={action.status}
            type="button"
            style={simulationButtonStyle}
            onClick={() => onSimulate(decisionId, action.status)}
          >
            {action.label}
          </button>
        ))}
        <button type="button" style={simulationButtonStyle} onClick={() => onReset(decisionId)}>
          🧪 Reset simulation
        </button>
      </div>
    </section>
  );
}

function FlagSection<FlagKey extends string>({ title, keys, values }: FlagSectionProps<FlagKey>) {
  return (
    <section aria-label={title} style={{ display: 'grid', gap: 8 }}>
      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 14, letterSpacing: 0 }}>
        {title}
      </h3>
      <div style={pillRowStyle}>
        {keys.map((key) => (
          <span key={key} style={pillStyle}>
            {formatFlag(key, values[key])}
          </span>
        ))}
      </div>
    </section>
  );
}

function DecisionCard({ decision, simulatedStatus, onSimulate, onReset }: DecisionCardProps) {
  const currentStatus = simulatedStatus ?? decision.status;
  const isSimulated = simulatedStatus !== undefined;
  const allowedNextStep = isSimulated
    ? getAllowedNextStepForStatus(currentStatus)
    : decision.allowedNextStep;

  return (
    <article data-testid="approval-gate-preview-decision" style={cardStyle}>
      <DecisionHeader decision={decision} currentStatus={currentStatus} isSimulated={isSimulated} />
      <DecisionMetadata decision={decision} allowedNextStep={allowedNextStep} />
      <SimulationActions decisionId={decision.decisionId} onSimulate={onSimulate} onReset={onReset} />
      <FlagSection title="blockedOperationalEffects" keys={BLOCKED_EFFECT_KEYS} values={decision.blockedOperationalEffects} />
      <FlagSection title="safetyFlags" keys={SAFETY_FLAG_KEYS} values={decision.safetyFlags} />
    </article>
  );
}

/** ApprovalGatePreview renders Stage 7C local-only approval decision simulation. */
export default function ApprovalGatePreview() {
  const [simulatedStatuses, setSimulatedStatuses] = useState<SimulatedStatusByDecisionId>({});

  const handleSimulate = useCallback((decisionId: string, status: ApprovalDecisionStatus) => {
    setSimulatedStatuses((currentStatuses) => ({
      ...currentStatuses,
      [decisionId]: status,
    }));
  }, []);

  const handleReset = useCallback((decisionId: string) => {
    setSimulatedStatuses((currentStatuses) => {
      const nextStatuses = { ...currentStatuses };
      delete nextStatuses[decisionId];
      return nextStatuses;
    });
  }, []);

  return (
    <main dir="ltr" style={pageShellStyle}>
      <section aria-label="Simulation safety banner" style={simulationBannerStyle}>
        ⚠️ סימולציה בלבד — שום פעולה לא נשמרת
      </section>

      <section style={heroStyle}>
        <p style={{ margin: 0, color: '#67e8f9', fontSize: 13 }}>Read-only approval preview</p>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: 28, letterSpacing: 0 }}>
          Approval Gate Preview
        </h1>
        <div style={pillRowStyle}>
          {SAFETY_COPY.map((copy) => (
            <span key={copy} style={pillStyle}>{copy}</span>
          ))}
        </div>
      </section>

      <section aria-label="Static approval decisions" style={gridStyle}>
        {STATIC_APPROVAL_DECISIONS.map((decision) => (
          <DecisionCard
            key={decision.decisionId}
            decision={decision}
            simulatedStatus={simulatedStatuses[decision.decisionId]}
            onSimulate={handleSimulate}
            onReset={handleReset}
          />
        ))}
      </section>
    </main>
  );
}
// #endregion
