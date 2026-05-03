/* ============================================
   FILE: UnifiedProviderPreviewSection.tsx
   PURPOSE: Read-only unified provider metadata preview for internal Unified Intake.
   DEPENDENCIES: React types, Stage 5D metadata adapter registry, static metadata mocks
   EXPORTS: UnifiedProviderPreviewSection (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import { MOCK_DRIVE_METADATA_SOURCES } from '../../work-spine/providers/drive/drive-metadata-source-mock';
import { MOCK_GMAIL_METADATA_SOURCE_MESSAGE } from '../../work-spine/providers/gmail/gmail-metadata-source-mock';
import {
  DRIVE_METADATA_ADAPTER,
  GMAIL_METADATA_ADAPTER,
  METADATA_ADAPTER_REGISTRY,
  SCANS_METADATA_ADAPTER,
} from '../../work-spine/providers/metadata-adapter-registry';
import { MOCK_SCAN_METADATA_SOURCES } from '../../work-spine/providers/scans/scan-metadata-source-mock';
import type { UnifiedIntakeSource } from '../../work-spine/intake/unified-intake-source-types';
// #endregion

// #region Types
type MetadataRegistryAdapter = (typeof METADATA_ADAPTER_REGISTRY)[number];

/** Display model for one provider metadata preview card. */
interface ProviderPreview {
  /** Adapter descriptor from the committed Stage 5D registry. */
  adapter: MetadataRegistryAdapter;
  /** Unified Intake source emitted by the adapter. */
  source: UnifiedIntakeSource;
}

/** Props for provider preview card rendering. */
interface ProviderPreviewCardProps {
  /** Provider preview data. */
  preview: ProviderPreview;
}

/** Props for one metadata field. */
interface MetadataFieldProps {
  /** Field label. */
  label: string;
  /** Field value. */
  value: string;
  /** Optional test id for precise assertions. */
  testId?: string;
}

/** Props for one safety flag block. */
interface FlagBlockProps {
  /** Test id for this flag block. */
  testId: string;
  /** Read-only flag lines. */
  values: readonly string[];
}
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
const buildProviderPreview = (
  adapter: MetadataRegistryAdapter,
): ProviderPreview => {
  switch (adapter.adapterId) {
    case 'gmail_metadata_adapter':
      return {
        adapter,
        source: GMAIL_METADATA_ADAPTER.mapMetadataToUnifiedSource(
          MOCK_GMAIL_METADATA_SOURCE_MESSAGE,
        ),
      };
    case 'drive_metadata_adapter':
      return {
        adapter,
        source: DRIVE_METADATA_ADAPTER.mapMetadataToUnifiedSource(
          MOCK_DRIVE_METADATA_SOURCES[2],
        ),
      };
    case 'scans_metadata_adapter':
      return {
        adapter,
        source: SCANS_METADATA_ADAPTER.mapMetadataToUnifiedSource(
          MOCK_SCAN_METADATA_SOURCES[0],
        ),
      };
  }
};

const providerPreviews: readonly ProviderPreview[] =
  METADATA_ADAPTER_REGISTRY.map(buildProviderPreview);

const formatPayloadSummary = (source: UnifiedIntakeSource): string => {
  const summary = source.payloadSummary;
  const parts = [
    summary.fileType ? `fileType=${summary.fileType}` : null,
    typeof summary.sizeBytes === 'number' ? `sizeBytes=${summary.sizeBytes}` : null,
    typeof summary.attachmentCount === 'number'
      ? `attachmentCount=${summary.attachmentCount}`
      : null,
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

const formatCapabilities = (preview: ProviderPreview): string[] => {
  const { capabilities } = preview.adapter;
  return [
    `liveConnection: ${String(capabilities.liveConnection)}`,
    `oauth: ${String(capabilities.oauth)}`,
    `apiAccess: ${String(capabilities.apiAccess)}`,
    `fileSystemAccess: ${String(capabilities.fileSystemAccess)}`,
    `contentRead: ${String(capabilities.contentRead)}`,
    `createsOperationalRecords: ${String(capabilities.createsOperationalRecords)}`,
    `persists: ${String(capabilities.persists)}`,
  ];
};
// #endregion

// #region Components
/** ProviderPreviewCard — Renders one metadata-only provider adapter preview. */
function ProviderPreviewCard({ preview }: ProviderPreviewCardProps) {
  const { adapter, source } = preview;

  return (
    <article data-testid="unified-provider-preview-card" style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={labelStyle}>displayName</div>
          <h3 style={{ margin: 0, color: '#f8fafc' }}>{adapter.displayName}</h3>
        </div>
        <span style={{ color: '#bbf7d0', fontSize: '0.82rem', fontWeight: 700 }}>Metadata only</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <MetadataField label="adapterId" value={adapter.adapterId} />
        <MetadataField label="providerKind" value={adapter.providerKind} />
        <MetadataField label="sourceType" value={source.sourceType} testId={`unified-provider-source-type-${adapter.adapterId}`} />
        <MetadataField label="mode" value={adapter.mode} />
        <MetadataField label="sourceId" value={source.sourceId} />
        <MetadataField label="timestamp" value={source.timestamp} />
        <MetadataField label="subjectOrFilename" value={source.subjectOrFilename} />
      </div>

      <div>
        <div style={labelStyle}>payloadSummary metadata only</div>
        <div style={{ color: '#cbd5e1', lineHeight: 1.7 }}>{formatPayloadSummary(source)}</div>
      </div>

      <FlagBlock testId="unified-provider-preview-boundary" values={formatBoundaryFlags(source)} />
      <FlagBlock testId="unified-provider-preview-capabilities" values={formatCapabilities(preview)} />
    </article>
  );
}

/** MetadataField — Renders one compact metadata label/value pair. */
function MetadataField({
  label,
  value,
  testId,
}: MetadataFieldProps) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <strong data-testid={testId} style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>
        {value}
      </strong>
    </div>
  );
}

/** FlagBlock — Renders read-only safety and capability flag lines. */
function FlagBlock({
  testId,
  values,
}: FlagBlockProps) {
  return (
    <div data-testid={testId} style={safetyStyle}>
      {values.map((value) => (
        <div key={value}>{value}</div>
      ))}
    </div>
  );
}
// #endregion

// #region Component
/** UnifiedProviderPreviewSection — Renders Stage 5D adapters as one metadata-only provider preview. */
export default function UnifiedProviderPreviewSection() {
  return (
    <section data-testid="unified-provider-preview-section" style={panelStyle}>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <span style={{ color: '#93c5fd', fontWeight: 700 }}>Metadata only</span>
        <h2 style={{ margin: 0, color: '#f8fafc' }}>Unified provider preview</h2>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>
          No live provider connected. No operational action can be created from this preview.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {providerPreviews.map((preview) => (
          <ProviderPreviewCard key={preview.adapter.adapterId} preview={preview} />
        ))}
      </div>
    </section>
  );
}
// #endregion
