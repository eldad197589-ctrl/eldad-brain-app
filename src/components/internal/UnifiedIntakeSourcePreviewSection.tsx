/* ============================================
   FILE: UnifiedIntakeSourcePreviewSection.tsx
   PURPOSE: Read-only static source model preview for internal Unified Intake.
   DEPENDENCIES: React types, unified intake source seed
   EXPORTS: UnifiedIntakeSourcePreviewSection (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import { ALL_INTAKE_SOURCES } from '../../work-spine/intake/unified-intake-source-seed';
import type { IntakePayloadSummary, UnifiedIntakeSource } from '../../work-spine/intake/unified-intake-source-types';
// #endregion

// #region Styles
const panelStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.84)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 40px rgba(2, 6, 23, 0.22)',
};

const cardStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.16)',
  background: 'rgba(30, 41, 59, 0.58)',
  padding: 16,
  display: 'grid',
  gap: 12,
};

const labelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: '0.78rem',
  marginBottom: 4,
};

const safetyStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(251, 191, 36, 0.26)',
  background: 'rgba(251, 191, 36, 0.08)',
  color: '#fde68a',
  padding: 12,
  lineHeight: 1.7,
};
// #endregion

// #region Helpers
const formatPayloadSummary = (summary: IntakePayloadSummary): string => {
  const parts = [
    summary.fileType ? `fileType=${summary.fileType}` : null,
    typeof summary.sizeBytes === 'number' ? `sizeBytes=${summary.sizeBytes}` : null,
    typeof summary.attachmentCount === 'number' ? `attachmentCount=${summary.attachmentCount}` : null,
    summary.snippet ? `snippet=${summary.snippet}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' | ') : 'metadata only';
};

const formatBoundaryFlags = (source: UnifiedIntakeSource): string[] => [
  `allowedMode: ${source.boundaryFlags.allowedMode}`,
  `canCreateWorkItem: ${String(source.boundaryFlags.canCreateWorkItem)}`,
  `canCreateMatter: ${String(source.boundaryFlags.canCreateMatter)}`,
  `canCreateDocumentRef: ${String(source.boundaryFlags.canCreateDocumentRef)}`,
  `requiresEldadApproval: ${String(source.boundaryFlags.requiresEldadApproval)}`,
  `operationalActionBlocked: ${String(source.boundaryFlags.operationalActionBlocked)}`,
];
// #endregion

// #region Component
/** UnifiedIntakeSourcePreviewSection — Renders committed static source model mocks without actions or provider access. */
export default function UnifiedIntakeSourcePreviewSection() {
  return (
    <section data-testid="unified-intake-source-preview-section" style={panelStyle}>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <span style={{ color: '#93c5fd', fontWeight: 700 }}>Static preview only</span>
        <h2 style={{ margin: 0, color: '#f8fafc' }}>Unified Intake Source Preview — static / read-only</h2>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>
          No real provider connected. No operational action can be created from this preview.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {ALL_INTAKE_SOURCES.map((source) => (
          <article key={source.sourceId} data-testid="unified-intake-source-preview-card" style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={labelStyle}>sourceType</div>
                <strong style={{ color: '#f8fafc' }}>{source.sourceType}</strong>
              </div>
              <span style={{ color: '#bbf7d0', fontSize: '0.82rem', fontWeight: 700 }}>read-only static source</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 10 }}>
              <div>
                <div style={labelStyle}>sourceId</div>
                <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{source.sourceId}</div>
              </div>
              <div>
                <div style={labelStyle}>senderIdentity</div>
                <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{source.senderIdentity}</div>
              </div>
              <div>
                <div style={labelStyle}>timestamp</div>
                <div style={{ color: '#e2e8f0' }}>{source.timestamp}</div>
              </div>
              <div>
                <div style={labelStyle}>subjectOrFilename</div>
                <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{source.subjectOrFilename}</div>
              </div>
            </div>

            <div>
              <div style={labelStyle}>payloadSummary metadata only</div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.7 }}>{formatPayloadSummary(source.payloadSummary)}</div>
            </div>

            <div data-testid="unified-intake-source-preview-boundary" style={safetyStyle}>
              {formatBoundaryFlags(source).map((flag) => (
                <div key={`${source.sourceId}-${flag}`}>{flag}</div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
// #endregion
