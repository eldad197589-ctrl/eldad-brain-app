/* ============================================
   FILE: LearningInboxView.tsx
   PURPOSE: Static read-only internal Learning Inbox display.
   DEPENDENCIES: Brain learning static seed and type contracts
   EXPORTS: LearningInboxView (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import { LEARNING_STATIC_SEED } from '../../system/learning/learning-static-seed';
import { KNOWLEDGE_DOMAINS, type KnowledgeDomain, type LearningCandidate, type LearningStatus } from '../../system/learning/learning-types';
// #endregion

// #region Types
/** Grouped static learning candidates for read-only display. */
interface LearningInboxGroups {
  pendingReview: readonly LearningCandidate[];
  approvedMock: readonly LearningCandidate[];
  rejectedOrObsolete: readonly LearningCandidate[];
  otherCandidates: readonly LearningCandidate[];
}

/** Props for a learning candidate list section. */
interface LearningSectionProps {
  title: string;
  description: string;
  candidates: readonly LearningCandidate[];
  emptyMessage: string;
}

/** Props for a single learning candidate card. */
interface LearningCardProps {
  candidate: LearningCandidate;
}
// #endregion

// #region Styles
const panelStyle: CSSProperties = { background: 'rgba(15, 23, 42, 0.86)', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: 18, padding: 18, display: 'grid', gap: 14 };
const cardStyle: CSSProperties = { borderRadius: 16, border: '1px solid rgba(148, 163, 184, 0.16)', background: 'rgba(30, 41, 59, 0.58)', padding: 14, display: 'grid', gap: 10 };
const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 };
const labelStyle: CSSProperties = { color: '#94a3b8', fontSize: '0.78rem' };
const badgeStyle: CSSProperties = { display: 'inline-flex', width: 'fit-content', borderRadius: 999, padding: '5px 9px', color: '#bbf7d0', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.28)', fontSize: '0.78rem', fontWeight: 700 };
const warningStyle: CSSProperties = { color: '#fde68a', border: '1px solid rgba(245, 158, 11, 0.28)', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 14, padding: 14, lineHeight: 1.7 };
// #endregion

// #region Helpers
const groupCandidates = (candidates: readonly LearningCandidate[]): LearningInboxGroups => ({
  pendingReview: candidates.filter((candidate) => candidate.status === 'pending_eldad_review' || candidate.status === 'needs_source'),
  approvedMock: candidates.filter((candidate) => candidate.status === 'approved_by_eldad'),
  rejectedOrObsolete: candidates.filter((candidate) => candidate.status === 'rejected' || candidate.status === 'obsolete'),
  otherCandidates: candidates.filter((candidate) => candidate.status === 'draft'),
});

const formatBoundary = (candidate: LearningCandidate): string => {
  const boundary = candidate.approvalBoundary;
  return [
    `boundary=${boundary.boundary}`,
    `canBindKnowledge=${String(boundary.canBindKnowledge)}`,
    `requiresEldadApproval=${String(boundary.requiresEldadApproval)}`,
    `approvedByEldad=${String(boundary.approvedByEldad)}`,
  ].join(' | ');
};

const formatEvidence = (candidate: LearningCandidate): string =>
  candidate.sourceEvidence
    .map((evidence) => `${evidence.sourceLabel} | ${evidence.allowedAccess} | ${evidence.reviewStatus}`)
    .join(', ');

const formatDecisionLog = (candidate: LearningCandidate): string =>
  candidate.decisionLog.length > 0
    ? candidate.decisionLog.map((entry) => `${entry.decision}: ${entry.what} | ${entry.why}`).join(', ')
    : 'No Eldad decision recorded. Preview only.';

const countByStatus = (status: LearningStatus): number =>
  LEARNING_STATIC_SEED.filter((candidate) => candidate.status === status).length;
// #endregion

// #region Component Parts
function LearningHeader() {
  return (
    <div style={{ ...panelStyle, background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(51,65,85,0.9))' }}>
      <span style={badgeStyle}>static/read-only/mock</span>
      <h1 style={{ margin: 0, color: '#f8fafc' }}>Learning Inbox</h1>
      <p data-testid="learning-inbox-safety-notice" style={{ margin: 0, ...warningStyle }}>
        Static learning seed only. No brainStore, no Zustand, no persistence, no Supabase, no approval, no knowledgeLog update, and no WorkItem creation.
      </p>
    </div>
  );
}

function DomainFilters() {
  return (
    <div data-testid="learning-inbox-domain-filters" style={panelStyle}>
      <h2 style={{ margin: 0, color: '#f8fafc' }}>Domain filters</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {KNOWLEDGE_DOMAINS.map((domain: KnowledgeDomain) => (
          <span key={domain} style={badgeStyle}>
            {domain}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusSummary() {
  return (
    <div data-testid="learning-inbox-status-summary" style={panelStyle}>
      <h2 style={{ margin: 0, color: '#f8fafc' }}>Status summary</h2>
      <div style={gridStyle}>
        {(['draft', 'needs_source', 'pending_eldad_review', 'approved_by_eldad', 'rejected', 'obsolete'] as const).map((status) => (
          <div key={status} style={cardStyle}>
            <span style={labelStyle}>{status}</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.35rem' }}>{countByStatus(status)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearningSection({ title, description, candidates, emptyMessage }: LearningSectionProps) {
  return (
    <section data-testid="learning-inbox-section" style={panelStyle}>
      <div>
        <h2 style={{ margin: 0, color: '#f8fafc' }}>{title}</h2>
        <p style={{ margin: '6px 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>{description}</p>
      </div>
      {candidates.length > 0 ? candidates.map((candidate) => <LearningCard key={candidate.candidateId} candidate={candidate} />) : <p style={{ margin: 0, color: '#94a3b8' }}>{emptyMessage}</p>}
    </section>
  );
}

function LearningCard({ candidate }: LearningCardProps) {
  return (
    <article data-testid="learning-inbox-candidate-card" style={cardStyle}>
      <div style={gridStyle}>
        <Info label="status" value={candidate.status} />
        <Info label="domain" value={candidate.domain} />
        <Info label="title" value={candidate.title} />
        <Info label="bindingUse" value={candidate.bindingUse} />
      </div>
      <Info label="summary" value={candidate.hypothesis} />
      <Info label="source/evidence" value={formatEvidence(candidate)} />
      <Info label="approval boundary" value={formatBoundary(candidate)} />
      <Info label="Eldad Decision Log preview" value={formatDecisionLog(candidate)} />
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ color: '#e2e8f0', lineHeight: 1.7 }}>{value}</div>
    </div>
  );
}
// #endregion

// #region Component
/** LearningInboxView — Renders static Brain Learning candidates without approval or persistence actions. */
export default function LearningInboxView() {
  const groups = groupCandidates(LEARNING_STATIC_SEED);

  return (
    <section data-testid="learning-inbox-view" dir="rtl" style={{ display: 'grid', gap: 18 }}>
      <LearningHeader />
      <StatusSummary />
      <DomainFilters />
      <LearningSection title="Pending Eldad Review" description="Candidates waiting for Eldad review or source confirmation." candidates={groups.pendingReview} emptyMessage="No pending static candidates." />
      <LearningSection title="Approved Knowledge mock" description="Static display bucket only; no real knowledge is approved here." candidates={groups.approvedMock} emptyMessage="No approved mock items in static seed." />
      <LearningSection title="Rejected / Obsolete" description="Static rejected or obsolete display bucket only." candidates={groups.rejectedOrObsolete} emptyMessage="No rejected or obsolete mock items in static seed." />
      <LearningSection title="Draft candidates" description="Static draft learning candidates that cannot bind Brain behavior." candidates={groups.otherCandidates} emptyMessage="No draft candidates." />
    </section>
  );
}
// #endregion
