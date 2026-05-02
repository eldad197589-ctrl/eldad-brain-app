/* ============================================
   FILE: MockGmailDriveUnifiedIntakeSection.tsx
   PURPOSE: Read-only mock Gmail and Drive connector preview for Unified Intake.
   DEPENDENCIES: React types, mock Gmail/Drive Unified Intake outputs
   EXPORTS: MockGmailDriveUnifiedIntakeSection (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import { MOCK_DRIVE_CONNECTOR_STATUS } from '../../work-spine/intake/mock/mock-drive-data';
import { MOCK_DRIVE_UNIFIED_INTAKE_OUTPUT } from '../../work-spine/intake/mock/mock-drive-to-unified-intake';
import { MOCK_GMAIL_CONNECTOR_STATUS } from '../../work-spine/intake/mock/mock-gmail-data';
import { MOCK_GMAIL_UNIFIED_INTAKE_OUTPUT } from '../../work-spine/intake/mock/mock-gmail-to-unified-intake';
import type {
  MockConnectorStatus,
  MockUnifiedIntakeOutput,
} from '../../work-spine/intake/mock/mock-gmail-drive-types';
import type {
  EmailSourceMetadata,
  GoogleDriveSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
} from '../../work-spine/intake/unified-intake-registry';
// #endregion

// #region Types
interface MockConnectorPanelProps {
  status: MockConnectorStatus;
  output: MockUnifiedIntakeOutput<EmailSourceMetadata | GoogleDriveSourceMetadata>;
}
// #endregion

// #region Styles
const sectionStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.84)',
  border: '1px solid rgba(56, 189, 248, 0.24)',
  borderRadius: 18,
  padding: 18,
  display: 'grid',
  gap: 16,
};

const cardStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.16)',
  background: 'rgba(30, 41, 59, 0.58)',
  padding: 14,
  display: 'grid',
  gap: 10,
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '5px 9px',
  color: '#bfdbfe',
  background: 'rgba(59, 130, 246, 0.14)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  fontSize: '0.78rem',
  fontWeight: 700,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: 10,
};

const labelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: '0.78rem',
};
// #endregion

// #region Helpers
const formatCount = (value: number): string => value.toLocaleString('he-IL');

const evidenceForCandidate = (
  candidate: UnifiedIntakeCandidate,
  evidenceRefs: readonly UnifiedIntakeEvidenceRef[],
): UnifiedIntakeEvidenceRef[] =>
  evidenceRefs.filter((evidence) => evidence.sourceCandidateId === candidate.candidateId);
// #endregion

// #region Subcomponents
const MockConnectorPanel = ({ status, output }: MockConnectorPanelProps) => (
  <article data-testid="mock-gmail-drive-connector-panel" style={cardStyle}>
    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
      <div>
        <div style={labelStyle}>{status.connectorName} mock status</div>
        <h3 style={{ margin: '4px 0 0', color: '#f8fafc' }}>{status.connectorName}</h3>
      </div>
      <span style={badgeStyle}>mock only / live disabled / OAuth disabled</span>
    </div>

    <div style={gridStyle}>
      <div>
        <div style={labelStyle}>Allowed output</div>
        <strong style={{ color: '#bbf7d0' }}>{status.safetyLabel}</strong>
      </div>
      <div>
        <div style={labelStyle}>Mapped candidates</div>
        <strong style={{ color: '#f8fafc' }}>{formatCount(output.candidates.length)}</strong>
      </div>
      <div>
        <div style={labelStyle}>Evidence refs</div>
        <strong style={{ color: '#f8fafc' }}>{formatCount(output.evidenceRefs.length)}</strong>
      </div>
    </div>

    <div style={{ display: 'grid', gap: 10 }}>
      {output.candidates.map((candidate) => {
        const refs = evidenceForCandidate(candidate, output.evidenceRefs);

        return (
          <section key={candidate.candidateId} data-testid="mock-gmail-drive-candidate" style={cardStyle}>
            <div>
              <div style={labelStyle}>Mapped candidate</div>
              <strong style={{ color: '#f8fafc' }}>{candidate.sourceLabel}</strong>
            </div>
            <div style={gridStyle}>
              <div>
                <div style={labelStyle}>sourceType</div>
                <span style={{ color: '#e2e8f0' }}>{candidate.sourceType}</span>
              </div>
              <div>
                <div style={labelStyle}>candidateStatus</div>
                <span style={{ color: '#bbf7d0' }}>{candidate.candidateStatus}</span>
              </div>
              <div>
                <div style={labelStyle}>matterResolutionStatus</div>
                <span style={{ color: '#fde68a' }}>{candidate.matterResolutionStatus}</span>
              </div>
            </div>
            <div>
              <div style={labelStyle}>Evidence refs</div>
              <ul style={{ margin: 0, paddingInlineStart: 18, color: '#e2e8f0', display: 'grid', gap: 5 }}>
                {refs.map((evidence) => (
                  <li key={evidence.evidenceId}>
                    {evidence.evidenceKind}: {evidence.title} | ocr={evidence.ocrStatus} | classification=
                    {evidence.classificationStatus} | review={evidence.reviewStatus}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  </article>
);
// #endregion

// #region Component
/** MockGmailDriveUnifiedIntakeSection — Shows static mock connector output without live connection or promotion. */
export default function MockGmailDriveUnifiedIntakeSection() {
  return (
    <section data-testid="mock-gmail-drive-unified-intake-section" style={sectionStyle}>
      <div>
        <span style={badgeStyle}>read-only mock connector preview</span>
        <h2 style={{ margin: '10px 0 0', color: '#f8fafc' }}>Mock Gmail / Drive — read-only / no live connection</h2>
        <p data-testid="mock-gmail-drive-safety-notice" style={{ margin: '8px 0 0', color: '#fde68a', lineHeight: 1.7 }}>
          No live Gmail/Drive connection. No OAuth. No sync. No promotion.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <MockConnectorPanel status={MOCK_GMAIL_CONNECTOR_STATUS} output={MOCK_GMAIL_UNIFIED_INTAKE_OUTPUT} />
        <MockConnectorPanel status={MOCK_DRIVE_CONNECTOR_STATUS} output={MOCK_DRIVE_UNIFIED_INTAKE_OUTPUT} />
      </div>
    </section>
  );
}
// #endregion
