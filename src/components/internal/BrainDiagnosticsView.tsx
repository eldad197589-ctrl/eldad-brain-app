/* ============================================
   FILE: BrainDiagnosticsView.tsx
   PURPOSE: Read-only internal diagnostics view comparing Brain read-model counts with folder reality.
   DEPENDENCIES: React types, brain-spine-projection, brain-diagnostics-static-manifest
   EXPORTS: BrainDiagnosticsView (default)
   ============================================ */

// #region Imports
import type { CSSProperties, ReactNode } from 'react';
import type { BrainSpineProjectionResult } from '../../work-spine/projection/brain-spine-projection';
import type { BrainDiagnosticsStaticManifest } from './brain-diagnostics-static-manifest';
// #endregion

// #region Types
/** Props for the BrainDiagnosticsView component. */
interface Props {
  /** Read-only live Brain projection snapshot. */
  snapshot: BrainSpineProjectionResult;
  /** Static folder-reality manifest from approved metadata-only audit. */
  manifest: BrainDiagnosticsStaticManifest;
}

/** Display count row for live Brain model counters. */
interface LiveCountRow {
  /** Internal counter key. */
  key: string;
  /** User-facing label. */
  label: string;
  /** Count value. */
  value: number;
}

/** Derived gap values for the diagnostics panel. */
interface GapSummary {
  /** Total known folder files. */
  folderFiles: number;
  /** Total known folder directories. */
  folderDirs: number;
  /** Known folder files not represented as DocumentRef records. */
  documentRefGap: number;
  /** Known active work items or processes not represented in the Brain projection. */
  activeWorkGap: number;
}

/** Props for sections that render the static diagnostics manifest. */
interface ManifestSectionProps {
  /** Static folder-reality manifest. */
  manifest: BrainDiagnosticsStaticManifest;
}

/** Props for the live Brain count section. */
interface BrainLiveCountsSectionProps {
  /** Live projection counters to display. */
  counts: LiveCountRow[];
}

/** Props for the gap panel section. */
interface GapPanelSectionProps {
  /** Derived disk-vs-model gap summary. */
  gapSummary: GapSummary;
}
// #endregion

// #region Styles
const panelStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.84)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 14,
  padding: 18,
  boxShadow: '0 18px 42px rgba(2, 6, 23, 0.24)',
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '8px 12px',
  border: '1px solid rgba(16, 185, 129, 0.38)',
  background: 'rgba(16, 185, 129, 0.14)',
  color: '#bbf7d0',
  fontWeight: 700,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
};
// #endregion

// #region Helpers
const createLiveCounts = (snapshot: BrainSpineProjectionResult): LiveCountRow[] => [
  { key: 'entities', label: 'entities / projected subjects', value: snapshot.projection.subjects.length },
  { key: 'matters', label: 'matters', value: snapshot.projection.matters.length },
  { key: 'documentRefs', label: 'documentRefs', value: snapshot.projection.documentRefs.length },
  { key: 'incomingDocuments', label: 'incomingDocuments / intakeAttachments', value: snapshot.projection.intakeAttachments.length },
  { key: 'workItems', label: 'workItems', value: snapshot.projection.workItems.length },
  { key: 'knowledgeLog', label: 'knowledgeLog / knowledgeItems', value: snapshot.projection.knowledgeItems.length },
  { key: 'subjects', label: 'subjects', value: snapshot.projection.subjects.length },
  { key: 'processInstances', label: 'processInstances', value: snapshot.projection.processInstances.length },
];

const countFolderFiles = (manifest: BrainDiagnosticsStaticManifest): number =>
  manifest.folderCounts.reduce((total, folderCount) => total + folderCount.files, 0);

const countFolderDirs = (manifest: BrainDiagnosticsStaticManifest): number =>
  manifest.folderCounts.reduce((total, folderCount) => total + folderCount.dirs, 0);

const renderMetricCard = (label: string, value: number | string, detail?: string) => (
  <div style={{ ...panelStyle, padding: 14 }}>
    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 6 }}>{label}</div>
    <strong style={{ color: '#f8fafc', fontSize: '1.35rem' }}>{value}</strong>
    {detail ? <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: 6, lineHeight: 1.5 }}>{detail}</div> : null}
  </div>
);

const renderSection = (title: string, children: ReactNode) => (
  <section style={panelStyle}>
    <h3 style={{ margin: '0 0 12px', color: '#f8fafc' }}>{title}</h3>
    {children}
  </section>
);

const createGapSummary = (snapshot: BrainSpineProjectionResult, manifest: BrainDiagnosticsStaticManifest): GapSummary => {
  const folderFiles = countFolderFiles(manifest);
  const folderDirs = countFolderDirs(manifest);

  return {
    folderFiles,
    folderDirs,
    documentRefGap: Math.max(folderFiles - snapshot.projection.documentRefs.length, 0),
    activeWorkGap: Math.max(manifest.activeWorkingSet.length - snapshot.projection.processInstances.length, 0),
  };
};
// #endregion

// #region Sections
const HeaderSection = () => (
  <header style={{ ...panelStyle, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
    <div>
      <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.8rem' }}>Brain Diagnostics — Read Only</h1>
      <p style={{ margin: '8px 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>
        This view compares the live Brain read-model with the known static folder-reality index.
      </p>
    </div>
    <div data-testid="brain-diagnostics-read-only-badge" style={badgeStyle}>
      Locked / read-only
    </div>
  </header>
);

const SafetyNoticeSection = () =>
  renderSection(
    'Safety Notice',
    <p style={{ margin: 0, color: '#fde68a', lineHeight: 1.7 }}>
      This view does not sync, promote, persist, or create operational records.
    </p>
  );

const BrainLiveCountsSection = ({ counts }: BrainLiveCountsSectionProps) =>
  renderSection(
    'Brain Live Model Counts',
    <div style={gridStyle}>
      {counts.map((count) => (
        <div key={count.key} data-testid={`brain-live-count-${count.key}`} style={{ ...panelStyle, padding: 14 }}>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 6 }}>{count.label}</div>
          <strong style={{ color: '#f8fafc', fontSize: '1.35rem' }}>{count.value}</strong>
        </div>
      ))}
    </div>
  );

const FolderRealitySection = ({ manifest }: ManifestSectionProps) =>
  renderSection(
    'Folder Reality Counts',
    <div style={gridStyle}>
      {manifest.folderCounts.map((folderCount) =>
        renderMetricCard(folderCount.path, `${folderCount.dirs} dirs / ${folderCount.files} files`, folderCount.role)
      )}
    </div>
  );

const GapPanelSection = ({ gapSummary }: GapPanelSectionProps) =>
  renderSection(
    'Gap Panel',
    <div style={gridStyle} data-testid="brain-diagnostics-gap-panel">
      {renderMetricCard('Folder files not represented as documentRefs', gapSummary.documentRefGap)}
      {renderMetricCard('Known active work items/processes not represented as processInstances', gapSummary.activeWorkGap)}
      {renderMetricCard('Folder reality total', `${gapSummary.folderDirs} dirs / ${gapSummary.folderFiles} files`)}
    </div>
  );

const ActiveWorkingSetSection = ({ manifest }: ManifestSectionProps) =>
  renderSection(
    'Active Working Set',
    <div style={gridStyle}>
      {manifest.activeWorkingSet.map((item) => renderMetricCard(item.name, item.kind, item.role))}
    </div>
  );

const IntakeInboxSection = ({ manifest }: ManifestSectionProps) =>
  renderSection(
    'Intake Inbox Status',
    <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>{manifest.intakeInboxStatus}</p>
  );

const WorkflowDomainsSection = ({ manifest }: ManifestSectionProps) =>
  renderSection(
    'Workflow Domains',
    <div style={gridStyle}>
      {manifest.workflowDomains.map((domain) => renderMetricCard(domain.name, 'workflow / learning corpus', domain.role))}
    </div>
  );

const FrozenGroupsSection = ({ manifest }: ManifestSectionProps) =>
  renderSection(
    'Frozen / No-Touch Groups',
    <div style={gridStyle}>
      {manifest.frozenNoTouchGroups.map((group) => renderMetricCard(group.name, 'blocked', group.reason))}
    </div>
  );
// #endregion

// #region Component
/** BrainDiagnosticsView — Displays read-only gaps between live Brain model and folder reality. */
export default function BrainDiagnosticsView({ snapshot, manifest }: Props) {
  return (
    <main data-testid="brain-diagnostics-view" style={{ display: 'grid', gap: 18 }} dir="rtl">
      <HeaderSection />
      <SafetyNoticeSection />
      <BrainLiveCountsSection counts={createLiveCounts(snapshot)} />
      <FolderRealitySection manifest={manifest} />
      <GapPanelSection gapSummary={createGapSummary(snapshot, manifest)} />
      <ActiveWorkingSetSection manifest={manifest} />
      <IntakeInboxSection manifest={manifest} />
      <WorkflowDomainsSection manifest={manifest} />
      <FrozenGroupsSection manifest={manifest} />
    </main>
  );
}
// #endregion
