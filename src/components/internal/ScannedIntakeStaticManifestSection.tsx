/* ============================================
   FILE: ScannedIntakeStaticManifestSection.tsx
   PURPOSE: Read-only static Scan Manifest section for the internal scanned intake inspector.
   DEPENDENCIES: react types, scanned-intake-static-manifest
   EXPORTS: ScannedIntakeStaticManifestSection (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import { SCANNED_INTAKE_STATIC_MANIFEST } from './scanned-intake-static-manifest';
import type { ScannedIntakeManifestStatus } from './scanned-intake-static-manifest';
// #endregion

// #region Helpers
const sectionStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.82)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 40px rgba(2, 6, 23, 0.22)',
};

const entryStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.16)',
  background: 'rgba(30, 41, 59, 0.58)',
  padding: 16,
  display: 'grid',
  gap: 10,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 10,
};

const manualReviewStatuses: ScannedIntakeManifestStatus[] = ['needs_eldad_review', 'unreviewed'];

const formatStatus = (status: ScannedIntakeManifestStatus): string => {
  if (status === 'ready_for_local_review') return 'ready_for_local_review';
  if (status === 'needs_eldad_review') return 'needs_eldad_review';
  if (status === 'ignore_for_now') return 'ignore_for_now';
  return 'unreviewed';
};

const renderField = (label: string, value: string | number | null) => (
  <div>
    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>{label}</div>
    <div style={{ color: '#e2e8f0', fontWeight: 650 }}>{value ?? 'unknown'}</div>
  </div>
);
// #endregion

// #region Component
/** ScannedIntakeStaticManifestSection — Displays static scan-folder intake candidates without actions. */
export default function ScannedIntakeStaticManifestSection() {
  return (
    <section data-testid="scan-static-manifest" style={sectionStyle} dir="rtl">
      <h2 style={{ marginTop: 0, color: '#f8fafc' }}>Scan Manifest — read-only</h2>
      <p style={{ margin: '0 0 14px', color: '#fde68a', lineHeight: 1.7 }}>
        Static manifest only. No scanning, OCR, file movement, persistence, or WorkItem creation.
      </p>
      <div style={{ display: 'grid', gap: 14 }}>
        {SCANNED_INTAKE_STATIC_MANIFEST.map((entry) => (
          <article key={entry.id} data-testid="scan-static-manifest-entry" style={entryStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>folder</div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem' }}>{entry.folderName}</h3>
              </div>
              {manualReviewStatuses.includes(entry.status) ? (
                <strong data-testid="scan-manual-review-badge" style={{ color: '#fde68a' }}>
                  manual review needed
                </strong>
              ) : null}
            </div>
            <div style={gridStyle}>
              {renderField('path', entry.folderPath)}
              {renderField('guessed entity', entry.relatedEntityGuess)}
              {renderField('intake type', entry.intakeType)}
              {renderField('status', formatStatus(entry.status))}
              {renderField('risk level', entry.riskLevel)}
              {renderField('evidence count', entry.evidenceCount)}
              {renderField('last updated', entry.lastUpdated)}
              {renderField('allowed mode', entry.allowedMode)}
            </div>
            <div style={{ color: '#cbd5e1', lineHeight: 1.7 }}>{entry.notes}</div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 6 }}>forbidden actions</div>
              <div style={{ color: '#fca5a5', lineHeight: 1.7 }}>{entry.forbiddenActions.join(', ')}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
// #endregion
