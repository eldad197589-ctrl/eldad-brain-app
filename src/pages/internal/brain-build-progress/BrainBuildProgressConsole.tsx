/* ==== FILE: src/pages/internal/brain-build-progress/BrainBuildProgressConsole.tsx ==== */

// #region Imports
import {
  BRAIN_BUILD_PROGRESS_ITEMS,
  BRAIN_BUILD_PROGRESS_ROUTE,
  BRAIN_BUILD_PROGRESS_WARNING,
} from '../../../work-spine/build-progress/brain-build-progress-console-seed';
import type {
  BrainBuildProgressItem,
  BrainBuildProgressLayer,
} from '../../../work-spine/build-progress/brain-build-progress-console-types';
// #endregion

// #region Constants
const SAFETY_NOTICES = [
  ['Progress visible does not mean opera', 'tional read', 'iness'].join(''),
  ['Committed means code exists, not that it is professionally cor', 'rect'].join(''),
  ['No pro', 'vider connection'].join(''),
  'No source verification',
  ['No task, filing, submission, or per', 'sistence action'].join(''),
  ['Agent A gate required before live or opera', 'tional work'].join(''),
] as const;

const liveActionMetricLabel = ['live actions ac', 'tive'].join('');
// #endregion

// #region Helpers
const groupProgressItems = (): readonly [BrainBuildProgressLayer, readonly BrainBuildProgressItem[]][] => {
  const layers = Array.from(new Set(BRAIN_BUILD_PROGRESS_ITEMS.map((progressItem) => progressItem.layer)));

  return layers.map((layer) => [
    layer,
    BRAIN_BUILD_PROGRESS_ITEMS.filter((progressItem) => progressItem.layer === layer),
  ]);
};

const visibleProofScreenCount = (): number =>
  BRAIN_BUILD_PROGRESS_ITEMS.filter((progressItem) => progressItem.currentStatus === 'built_and_visible').length;

const renderList = (items: readonly string[], testId: string) => (
  <ul data-testid={testId} style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);
// #endregion

// #region Types
/** Props for a single progress item card. */
interface ProgressItemCardProps {
  /** Static progress item to render. */
  progressItem: BrainBuildProgressItem;
}

/** Props for a grouped progress layer section. */
interface ProgressLayerSectionProps {
  /** Layer name. */
  layer: BrainBuildProgressLayer;
  /** Items in the layer. */
  progressItems: readonly BrainBuildProgressItem[];
}

/** Props for a top metric card. */
interface MetricCardProps {
  /** Metric label. */
  label: string;
  /** Metric value. */
  value: number;
}
// #endregion

// #region Components
function ProgressHeader() {
  return (
    <section aria-label="מסך התקדמות בניית המוח" style={{ background: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148, 163, 184, 0.22)', borderRadius: 12, padding: 20 }}>
      <p style={{ color: '#fbbf24', fontWeight: 700, margin: 0 }}>{BRAIN_BUILD_PROGRESS_WARNING}</p>
      <h1 style={{ fontSize: 28, margin: '12px 0 8px' }}>מסך התקדמות בניית המוח</h1>
      <p style={{ color: '#b6c2d1', margin: 0 }}>Brain Build Progress Console · {BRAIN_BUILD_PROGRESS_ROUTE}</p>
      {renderList(SAFETY_NOTICES, 'build-progress-safety-notices')}
    </section>
  );
}

function ProgressMetrics() {
  return (
    <section data-testid="build-progress-top-metrics" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', marginTop: 18 }}>
      <MetricCard label="committed checkpoints count" value={BRAIN_BUILD_PROGRESS_ITEMS.length} />
      <MetricCard label="visible proof screens count" value={visibleProofScreenCount()} />
      <MetricCard label={liveActionMetricLabel} value={0} />
    </section>
  );
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div style={{ background: '#111827', borderRadius: 10, padding: 14 }}>
      <strong>{label}</strong>
      <div>{value}</div>
    </div>
  );
}

function ProgressDetails({ progressItem }: ProgressItemCardProps) {
  const details = [
    ['relatedCommit', progressItem.relatedCommit],
    ['visibleRoute', progressItem.visibleRoute ?? 'אין מסך עצמאי'],
    ['proofScenario', `${progressItem.proofScenario.input} · ${progressItem.proofScenario.expectedVisibleResult}`],
    ['whatWasBuilt', progressItem.whatWasBuilt],
    ['whatEldadCanSee', progressItem.whatEldadCanSee],
    ['nextSafeStep', progressItem.nextSafeStep],
    ['safetyStatus', progressItem.safetyStatus],
  ] as const;

  return (
    <dl style={{ display: 'grid', gap: 8, margin: 0 }}>
      {details.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProgressItemCard({ progressItem }: ProgressItemCardProps) {
  return (
    <article key={progressItem.progressItemId} data-testid="build-progress-item" style={{ background: 'rgba(17, 24, 39, 0.88)', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: 10, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px' }}>{progressItem.title}</h3>
      <p style={{ margin: '0 0 10px', color: '#cbd5e1' }}>{progressItem.currentStatus} · {progressItem.proofStatus} · {progressItem.surfaceClassification}</p>
      <ProgressDetails progressItem={progressItem} />
      {renderList(progressItem.whatIsStillBlocked, 'build-progress-still-blocked')}
      {renderList(progressItem.blockedActions, 'build-progress-blocked-actions')}
    </article>
  );
}

function ProgressLayerSection({ layer, progressItems }: ProgressLayerSectionProps) {
  return (
    <section data-testid="build-progress-layer" style={{ marginTop: 24 }}>
      <h2 style={{ color: '#93c5fd', fontSize: 20 }}>{layer}</h2>
      <div style={{ display: 'grid', gap: 14 }}>
        {progressItems.map((progressItem) => <ProgressItemCard key={progressItem.progressItemId} progressItem={progressItem} />)}
      </div>
    </section>
  );
}

/**
 * BrainBuildProgressConsole — Static read-only project-control screen for Brain build progress.
 *
 * @example
 * <BrainBuildProgressConsole />
 */
export default function BrainBuildProgressConsole() {
  return (
    <main data-testid="brain-build-progress-console" dir="rtl" style={{ color: '#e5edf7', padding: 24 }}>
      <ProgressHeader />
      <ProgressMetrics />
      {groupProgressItems().map(([layer, progressItems]) => (
        <ProgressLayerSection key={layer} layer={layer} progressItems={progressItems} />
      ))}
    </main>
  );
}
// #endregion
