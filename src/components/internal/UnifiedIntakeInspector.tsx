/* ============================================
   FILE: UnifiedIntakeInspector.tsx
   PURPOSE: Internal read-only display for unified intake static fixture candidates.
   DEPENDENCIES: React types, unified intake static fixture snapshot types
   EXPORTS: UnifiedIntakeInspector (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import type {
  UnifiedIntakeStaticFixtureSnapshot,
  UnifiedIntakeStaticSourceSection,
} from '../../work-spine/intake/unified-intake-static-fixtures';
import type { UnifiedIntakeCandidate, UnifiedIntakeEvidenceRef } from '../../work-spine/intake/unified-intake-registry';
import MockEmailDriveUnifiedIntakeSection from './MockEmailDriveUnifiedIntakeSection';
import UniversalRoutingApprovalGate from './UniversalRoutingApprovalGate';
import UniversalRoutingSuggestionSection from './UniversalRoutingSuggestionSection';
import { UnifiedIntakeLocalReview } from './unified-intake-review/UnifiedIntakeLocalReview';
// #endregion

// #region Helpers
export interface UnifiedIntakeInspectorProps {
  snapshot: UnifiedIntakeStaticFixtureSnapshot;
}

const panelStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.84)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 40px rgba(2, 6, 23, 0.22)',
};

const metricStyle: CSSProperties = {
  ...panelStyle,
  padding: 14,
  display: 'grid',
  gap: 6,
};

const pillStyle: CSSProperties = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '6px 10px',
  color: '#bbf7d0',
  background: 'rgba(34, 197, 94, 0.12)',
  border: '1px solid rgba(34, 197, 94, 0.28)',
  fontSize: '0.82rem',
  fontWeight: 700,
};

const mutedLabelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: '0.82rem',
  marginBottom: 4,
};

const formatNumber = (value: number): string => value.toLocaleString('he-IL');

const formatSafetyStatus = (candidate: UnifiedIntakeCandidate): string =>
  [
    `candidateStatus=${candidate.candidateStatus}`,
    `professionalStatus=${candidate.professionalStatus}`,
    `matterResolutionStatus=${candidate.matterResolutionStatus}`,
    `subjectResolutionStatus=${candidate.subjectResolutionStatus}`,
  ].join(' | ');

const candidateEvidence = (
  candidate: UnifiedIntakeCandidate,
  source: UnifiedIntakeStaticSourceSection,
): UnifiedIntakeEvidenceRef[] =>
  source.evidenceRefs.filter((evidence) => evidence.sourceCandidateId === candidate.candidateId);
// #endregion

// #region Component
export default function UnifiedIntakeInspector({ snapshot }: UnifiedIntakeInspectorProps) {
  return (
    <section data-testid="unified-intake-inspector" style={{ display: 'grid', gap: 18 }} dir="rtl">
      <div
        style={{
          ...panelStyle,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(8,47,73,0.9))',
        }}
      >
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
          מסך פנימי מוסתר
        </div>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '2rem' }}>{snapshot.title}</h1>
        <p
          data-testid="unified-intake-read-only-warning"
          style={{
            margin: '12px 0 0',
            color: '#fde68a',
            lineHeight: 1.7,
            border: '1px solid rgba(245, 158, 11, 0.28)',
            background: 'rgba(245, 158, 11, 0.08)',
            borderRadius: 14,
            padding: 14,
          }}
        >
          Static fixtures only. No connectors, no stores, no persistence, no WorkItem, no Matter, no DocumentRef, no OCR, and no professional classification.
        </p>
      </div>

      <div style={panelStyle}>
        <h2 style={{ marginTop: 0, color: '#f8fafc' }}>Summary</h2>
        <div
          data-testid="unified-intake-summary"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12 }}
        >
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>Sources</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.sourcesCount)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>Candidates</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.candidatesCount)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>Evidence refs</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.evidenceCount)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>Warnings</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.warningsCount)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>Skipped</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.skippedItemsCount)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>Errors</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.errorsCount)}</strong>
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={{ marginTop: 0, color: '#f8fafc' }}>Safety status</h2>
        <p data-testid="unified-intake-safety-status" style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>
          {snapshot.safetyStatus}: candidates are staging-only, evidence is not processed, classification is not performed, and all identity/matter fields remain unresolved.
        </p>
      </div>

      <MockEmailDriveUnifiedIntakeSection />

      <UniversalRoutingSuggestionSection />

      <UniversalRoutingApprovalGate />

      <div data-testid="unified-intake-source-list" style={{ display: 'grid', gap: 16 }}>
        {snapshot.sources.map((source) => (
          <article
            key={source.sourceType}
            data-testid="unified-intake-source-section"
            style={{
              ...panelStyle,
              display: 'grid',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={mutedLabelStyle}>Source type</div>
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>{source.sourceType}</h2>
                <div style={{ color: '#cbd5e1', marginTop: 4 }}>{source.sourceLabel}</div>
              </div>
              <span style={pillStyle}>read-only static fixture</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              <div>
                <div style={mutedLabelStyle}>Candidates</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formatNumber(source.diagnostics.candidateCount)}</div>
              </div>
              <div>
                <div style={mutedLabelStyle}>Evidence refs</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formatNumber(source.diagnostics.evidenceCount)}</div>
              </div>
              <div>
                <div style={mutedLabelStyle}>Warnings</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formatNumber(source.diagnostics.warningsCount)}</div>
              </div>
              <div>
                <div style={mutedLabelStyle}>Errors</div>
                <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formatNumber(source.diagnostics.errorsCount)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {source.candidates.map((candidate) => {
                const evidenceRefs = candidateEvidence(candidate, source);

                return (
                  <section
                    key={candidate.candidateId}
                    data-testid="unified-intake-candidate-card"
                    style={{
                      borderRadius: 16,
                      border: '1px solid rgba(148, 163, 184, 0.16)',
                      background: 'rgba(30, 41, 59, 0.58)',
                      padding: 16,
                      display: 'grid',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={mutedLabelStyle}>Candidate title / label</div>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.08rem' }}>{candidate.sourceLabel}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                      <div>
                        <div style={mutedLabelStyle}>Candidate id</div>
                        <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{candidate.candidateId}</div>
                      </div>
                      <div>
                        <div style={mutedLabelStyle}>Received / created</div>
                        <div style={{ color: '#e2e8f0' }}>{candidate.receivedAt || candidate.createdAt || 'not provided'}</div>
                      </div>
                      <div>
                        <div style={mutedLabelStyle}>Evidence count</div>
                        <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formatNumber(evidenceRefs.length)}</div>
                      </div>
                      <div>
                        <div style={mutedLabelStyle}>Safety status</div>
                        <div style={{ color: '#bbf7d0', lineHeight: 1.6 }}>{formatSafetyStatus(candidate)}</div>
                      </div>
                    </div>

                    <div>
                      <div style={mutedLabelStyle}>Hint-only suggested context</div>
                      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', display: 'grid', gap: 5 }}>
                        {candidate.suggestedContext.length > 0 ? (
                          candidate.suggestedContext.map((context) => (
                            <li key={`${candidate.candidateId}-${context.source}-${context.label}`}>
                              {context.label} | source={context.source} | confidence={context.confidence} | confirmed={String(context.isConfirmed)}
                            </li>
                          ))
                        ) : (
                          <li>No context hints provided.</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <div style={mutedLabelStyle}>Evidence refs</div>
                      <ul data-testid="unified-intake-evidence-list" style={{ margin: 0, paddingInlineStart: 18, color: '#e2e8f0', display: 'grid', gap: 6 }}>
                        {evidenceRefs.map((evidence) => (
                          <li key={evidence.evidenceId}>
                            {evidence.evidenceKind}: {evidence.title}
                            {evidence.fileName ? ` | fileName=${evidence.fileName}` : ''} | ocr={evidence.ocrStatus} | classification=
                            {evidence.classificationStatus} | review={evidence.reviewStatus}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <UnifiedIntakeLocalReview candidate={candidate} evidenceRefs={evidenceRefs} />
                  </section>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
// #endregion
