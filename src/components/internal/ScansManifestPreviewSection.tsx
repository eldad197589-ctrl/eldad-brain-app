/* ============================================
   FILE: ScansManifestPreviewSection.tsx
   PURPOSE: Read-only Stage 6C-2 scans manifest preview for internal scanned intake.
   DEPENDENCIES: React types, static scan manifest seed
   EXPORTS: ScansManifestPreviewSection
   ============================================ */

// #region Imports
import type { CSSProperties, ReactNode } from 'react';
import { STATIC_SCAN_MANIFEST } from '../../work-spine/providers/scans/scan-manifest-seed';
import type { ScanManifestEntry } from '../../work-spine/providers/scans/scan-manifest-types';
// #endregion

// #region Styles
const panelStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.82)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 40px rgba(2, 6, 23, 0.22)',
};

const metadataGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const metadataItemStyle: CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(148, 163, 184, 0.14)',
  background: 'rgba(30, 41, 59, 0.54)',
  padding: 12,
  display: 'grid',
  gap: 5,
};

const warningStyle: CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(245, 158, 11, 0.28)',
  background: 'rgba(245, 158, 11, 0.08)',
  color: '#fde68a',
  padding: 14,
  lineHeight: 1.7,
};

const entryStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.16)',
  background: 'rgba(30, 41, 59, 0.58)',
  padding: 16,
  display: 'grid',
  gap: 12,
};
// #endregion

// #region Types
/** Display metadata row for the static scans manifest preview. */
interface MetadataItem {
  /** Human-readable field label. */
  label: string;
  /** Rendered metadata value. */
  value: ReactNode;
}
// #endregion

// #region Helpers
const formatOptional = (value: string | number | undefined): string =>
  value === undefined ? 'not provided' : String(value);

const renderMetadataItem = ({ label, value }: MetadataItem) => (
  <div key={label} style={metadataItemStyle}>
    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{label}</span>
    <strong style={{ color: '#f8fafc', wordBreak: 'break-word' }}>{value}</strong>
  </div>
);

const getEntryMetadata = (entry: ScanManifestEntry): MetadataItem[] => [
  { label: 'scanId', value: entry.scanId },
  { label: 'filename', value: entry.filename },
  { label: 'scannerIdentity', value: entry.scannerIdentity },
  { label: 'timestamp', value: entry.timestamp },
  { label: 'fileType', value: entry.fileType },
  { label: 'pageCount', value: formatOptional(entry.pageCount) },
  { label: 'fileSizeBytes', value: formatOptional(entry.fileSizeBytes) },
  { label: 'confidenceLabel', value: formatOptional(entry.confidenceLabel) },
];
// #endregion

// #region Component
/**
 * ScansManifestPreviewSection — Displays the static scans manifest fixture as a read-only internal preview.
 *
 * @example
 * <ScansManifestPreviewSection />
 */
export default function ScansManifestPreviewSection() {
  return (
    <section data-testid="scans-manifest-preview" style={panelStyle} dir="rtl">
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Stage 6C-2
          </div>
          <h2 style={{ margin: 0, color: '#f8fafc' }}>Scans Manifest Preview — static only</h2>
        </div>

        <div data-testid="scans-manifest-preview-warnings" style={warningStyle}>
          Static manifest preview only. No file read. No OCR. No file movement. No operational record creation.
        </div>

        <div data-testid="scans-manifest-preview-summary" style={metadataGridStyle}>
          {[
            { label: 'manifestId', value: STATIC_SCAN_MANIFEST.manifestId },
            { label: 'schemaVersion', value: STATIC_SCAN_MANIFEST.schemaVersion },
            { label: 'generatedAt', value: STATIC_SCAN_MANIFEST.generatedAt },
            { label: 'sourceType', value: STATIC_SCAN_MANIFEST.sourceType },
          ].map(renderMetadataItem)}
        </div>

        <div data-testid="scans-manifest-preview-entries" style={{ display: 'grid', gap: 14 }}>
          {STATIC_SCAN_MANIFEST.entries.map((entry) => (
            <article key={entry.scanId} data-testid="scans-manifest-preview-entry" style={entryStyle}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem' }}>{entry.filename}</h3>
              <div style={metadataGridStyle}>{getEntryMetadata(entry).map(renderMetadataItem)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
// #endregion
