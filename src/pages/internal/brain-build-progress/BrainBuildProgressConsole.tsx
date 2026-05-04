/* ==== FILE: src/pages/internal/brain-build-progress/BrainBuildProgressConsole.tsx ==== */

// #region Imports
import {
  BRAIN_BUILD_LATEST_CHANGE_SUMMARY,
  BRAIN_BUILD_LATEST_CHANGE_WARNING,
  BRAIN_BUILD_PROGRESS_ITEMS,
  BRAIN_BUILD_PROGRESS_ROUTE,
  BRAIN_BUILD_PROGRESS_WARNING,
  BRAIN_BUILD_STAGE_ROADMAP_BANNER,
  BRAIN_BUILD_STAGE_ROADMAP_CONTROL,
  BRAIN_BUILD_STAGE_ROADMAP_DIVIDER,
  BRAIN_BUILD_STAGE_ROADMAP_GROUPS,
  BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS,
  BRAIN_BUILD_STAGE_ROADMAP_STATUSES,
  BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE,
} from '../../../work-spine/build-progress/brain-build-progress-console-seed';
import type {
  BrainBuildBlockedAction,
  BrainBuildProofStatus,
  BrainBuildProgressItem,
  BrainBuildProgressDomain,
  BrainBuildProgressLayer,
  BrainBuildProgressSafetyStatus,
  BrainBuildProgressStatus,
  BrainBuildSurfaceClassification,
} from '../../../work-spine/build-progress/brain-build-progress-console-types';
// #endregion

// #region Constants
const SAFETY_NOTICES = [
  'תצוגת התקדמות אינה מוכנות תפעולית',
  'Commit אומר שקוד קיים, לא שהוא נכון מקצועית',
  'אין חיבור ספקים',
  'אין אימות מקור',
  'אין משימה, תיוק, הגשה או שמירה',
  'נדרש שער Agent A לפני עבודה חיה או תפעולית',
] as const;

const DETAIL_LABELS = {
  title: 'כותרת',
  relatedCommit: 'Commit קשור',
  visibleRoute: 'איפה רואים',
  proofScenario: 'הוכחת תצוגה',
  whatChanged: 'מה השתנה',
  whatWasBuilt: 'מה נבנה',
  whatEldadCanSee: 'מה אלדד רואה',
  nextSafeStep: 'השלב הבטוח הבא',
  safetyStatus: 'סטטוס בטיחות',
  currentStatus: 'סטטוס נוכחי',
  proofStatus: 'סטטוס הוכחה',
  surfaceClassification: 'סיווג משטח',
  domain: 'תחום',
  layer: 'שכבה',
  responsibleAgent: 'סוכן אחראי',
} as const;

const STATUS_LABELS: Record<BrainBuildProgressStatus, string> = {
  built_and_visible: 'נבנה ונראה במסך',
  built_not_visible: 'נבנה אך טרם מוצג במסך',
  blocked: 'חסום',
  planned: 'מתוכנן',
};

const PROOF_STATUS_LABELS: Record<BrainBuildProofStatus, string> = {
  visible_static_preview: 'הוכחת תצוגה סטטית',
  static_reference_recorded: 'נרשם כמקור סטטי',
  not_visible_as_screen: 'לא מוצג כמסך עצמאי',
  blocked_by_design: 'חסום בתכנון',
};

const SURFACE_CLASSIFICATION_LABELS: Record<BrainBuildSurfaceClassification, string> = {
  preview_only: 'תצוגה מקדימה בלבד',
  static_visual: 'חזותי סטטי',
  live_mutation_capable: 'בעל יכולת שינוי חיה',
  unknown_needs_audit: 'לא ידוע, נדרש Audit',
};

const SAFETY_STATUS_LABELS: Record<BrainBuildProgressSafetyStatus, string> = {
  static_progress_console_only: 'לוח התקדמות סטטי בלבד',
};

const BLOCKED_ACTION_LABELS: Record<BrainBuildBlockedAction, string> = {
  execute: 'הרצה חסומה',
  submit: 'הגשה חסומה',
  send: 'שליחה חסומה',
  post: 'רישום/פרסום חסום',
  file: 'תיוק חסום',
  create_operational_record: 'יצירת רשומה תפעולית חסומה',
  create_work_item: 'יצירת משימת עבודה חסומה',
  create_matter: 'יצירת תיק חסומה',
  create_document_ref: 'יצירת הפניית מסמך חסומה',
  persist: 'שמירה חסומה',
  external_connection: 'חיבור חיצוני חסום',
  source_content_read: 'קריאת תוכן מקור חסומה',
  agent_autonomy: 'אוטונומיית סוכן חסומה',
};

const STILL_BLOCKED_LABELS: Record<string, string> = {
  'no live source access': 'אין גישה חיה למקור',
  'no source content reading': 'אין קריאת תוכן מקור',
  'no task or record creation': 'אין יצירת משימה או רשומה',
  'no filing or submission': 'אין תיוק או הגשה',
  'no retained state write': 'אין כתיבה למצב שמור',
};

const ROADMAP_STATUS_LABELS: Record<RoadmapStageStatus, string> = { built: 'נבנה', current: 'עכשיו', next: 'ממתין', blocked: 'חסום' };

const DOMAIN_LABELS: Record<BrainBuildProgressDomain, string> = {
  vat: 'מע״מ',
  scanned_evidence: 'ראיות סריקה',
  approval: 'אישור',
  knowledge: 'ידע',
  proof: 'הוכחה',
  intake: 'קלט',
  visual_surface: 'משטח חזותי',
};

const LAYER_LABELS: Record<BrainBuildProgressLayer, string> = {
  manual_workbench: 'המסך הידני',
  static_evidence: 'ראיות סטטיות',
  scanned_intake: 'קלט סריקות',
  approval_gate: 'שער אישור',
  knowledge_inventory: 'מלאי ידע',
  proof_inventory: 'מלאי הוכחות',
  surface_inventory: 'מלאי משטחים',
};
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

const translatedStillBlocked = (items: readonly string[]): readonly string[] =>
  items.map((item) => STILL_BLOCKED_LABELS[item] ?? item);

const translatedBlockedActions = (items: readonly BrainBuildBlockedAction[]): readonly string[] =>
  items.map((item) => BLOCKED_ACTION_LABELS[item]);

const renderList = (items: readonly string[], testId: string, label?: string) => (
  <section aria-label={label}>
    {label ? <h4 style={{ margin: '12px 0 4px' }}>{label}</h4> : null}
    <ul data-testid={testId} style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </section>
);
// #endregion

// #region Roadmap Helpers
const allRoadmapStages = () => BRAIN_BUILD_STAGE_ROADMAP_GROUPS.flatMap((group) => group.stages);

const roadmapSummaryCounter = (): string => {
  const stages = allRoadmapStages();
  const built = stages.filter((s) => s.status === 'built').length;
  const current = stages.filter((s) => s.status === 'current').length;
  const next = stages.filter((s) => s.status === 'next').length;
  const blocked = stages.filter((s) => s.status === 'blocked').length;
  return `${built} נבנו · ${current} עכשיו · ${next} ממתינים · ${blocked} חסום`;
};

// #region Types
type RoadmapStageStatus = (typeof BRAIN_BUILD_STAGE_ROADMAP_STATUSES)[number];
type BrainBuildRoadmapGroup = (typeof BRAIN_BUILD_STAGE_ROADMAP_GROUPS)[number];
type BrainBuildRoadmapStage = BrainBuildRoadmapGroup['stages'][number];

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
      <p style={{ color: '#b6c2d1', margin: 0 }}>מסך התקדמות בניית המוח · {BRAIN_BUILD_PROGRESS_ROUTE}</p>
      {renderList(SAFETY_NOTICES, 'build-progress-safety-notices')}
    </section>
  );
}

function ProgressMetrics() {
  return (
    <section data-testid="build-progress-top-metrics" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', marginTop: 18 }}>
      <MetricCard label="נקודות בנייה שננעלו" value={BRAIN_BUILD_PROGRESS_ITEMS.length} />
      <MetricCard label="הוכחות תצוגה פעילות" value={visibleProofScreenCount()} />
      <MetricCard label="פעולות חיות פעילות" value={0} />
    </section>
  );
}

function LatestChangeSummary() {
  const latestChangeDetails = [
    [DETAIL_LABELS.title, BRAIN_BUILD_LATEST_CHANGE_SUMMARY.title],
    [DETAIL_LABELS.relatedCommit, BRAIN_BUILD_LATEST_CHANGE_SUMMARY.relatedCommit],
    [DETAIL_LABELS.visibleRoute, BRAIN_BUILD_LATEST_CHANGE_SUMMARY.whereToSee],
    [DETAIL_LABELS.whatChanged, BRAIN_BUILD_LATEST_CHANGE_SUMMARY.whatChanged],
    [DETAIL_LABELS.proofScenario, BRAIN_BUILD_LATEST_CHANGE_SUMMARY.proofOfLife],
    [DETAIL_LABELS.nextSafeStep, BRAIN_BUILD_LATEST_CHANGE_SUMMARY.nextSafeStep],
    [DETAIL_LABELS.safetyStatus, BRAIN_BUILD_LATEST_CHANGE_SUMMARY.safetyStatus],
  ] as const;

  return (
    <section data-testid="build-progress-latest-change" style={{ background: 'rgba(8, 47, 73, 0.52)', border: '1px solid rgba(125, 211, 252, 0.28)', borderRadius: 12, marginTop: 18, padding: 18 }}>
      <h2 style={{ color: '#bae6fd', fontSize: 22, margin: '0 0 8px' }}>מה השתנה עכשיו</h2>
      <p style={{ color: '#fbbf24', fontWeight: 700, margin: '0 0 10px' }}>{BRAIN_BUILD_LATEST_CHANGE_WARNING}</p>
      {renderList(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.safetyNotes, 'build-progress-latest-safety-notes')}
      <dl style={{ display: 'grid', gap: 8, margin: '12px 0 0' }}>
        {latestChangeDetails.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {renderList(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.stillBlocked, 'build-progress-latest-blocked', 'מה עדיין חסום')}
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
    [DETAIL_LABELS.domain, DOMAIN_LABELS[progressItem.domain]],
    [DETAIL_LABELS.layer, LAYER_LABELS[progressItem.layer]],
    [DETAIL_LABELS.relatedCommit, progressItem.relatedCommit],
    [DETAIL_LABELS.visibleRoute, progressItem.visibleRoute ?? 'אין מסך עצמאי'],
    [DETAIL_LABELS.proofScenario, `${progressItem.proofScenario.input} · ${progressItem.proofScenario.expectedVisibleResult}`],
    [DETAIL_LABELS.currentStatus, STATUS_LABELS[progressItem.currentStatus]],
    [DETAIL_LABELS.proofStatus, PROOF_STATUS_LABELS[progressItem.proofStatus]],
    [DETAIL_LABELS.surfaceClassification, SURFACE_CLASSIFICATION_LABELS[progressItem.surfaceClassification]],
    [DETAIL_LABELS.whatWasBuilt, progressItem.whatWasBuilt],
    [DETAIL_LABELS.whatEldadCanSee, progressItem.whatEldadCanSee],
    [DETAIL_LABELS.nextSafeStep, progressItem.nextSafeStep],
    [DETAIL_LABELS.responsibleAgent, progressItem.responsibleAgent],
    [DETAIL_LABELS.safetyStatus, SAFETY_STATUS_LABELS[progressItem.safetyStatus]],
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
      <p style={{ margin: '0 0 10px', color: '#cbd5e1' }}>
        {STATUS_LABELS[progressItem.currentStatus]} · {PROOF_STATUS_LABELS[progressItem.proofStatus]} · {SURFACE_CLASSIFICATION_LABELS[progressItem.surfaceClassification]}
      </p>
      <ProgressDetails progressItem={progressItem} />
      {renderList(translatedStillBlocked(progressItem.whatIsStillBlocked), 'build-progress-still-blocked', 'מה עדיין חסום')}
      {renderList(translatedBlockedActions(progressItem.blockedActions), 'build-progress-blocked-actions', 'פעולות חסומות')}
    </article>
  );
}

function ProgressLayerSection({ layer, progressItems }: ProgressLayerSectionProps) {
  return (
    <section data-testid="build-progress-layer" style={{ marginTop: 24 }}>
      <h2 style={{ color: '#93c5fd', fontSize: 20 }}>{LAYER_LABELS[layer]}</h2>
      <div style={{ display: 'grid', gap: 14 }}>
        {progressItems.map((progressItem) => <ProgressItemCard key={progressItem.progressItemId} progressItem={progressItem} />)}
      </div>
    </section>
  );
}

interface RoadmapStageRowProps {
  stage: BrainBuildRoadmapStage;
}

interface RoadmapGroupSectionProps {
  group: BrainBuildRoadmapGroup;
}

// #region Roadmap Components
function CompactRoadmapRow({ stage }: RoadmapStageRowProps) {
  const icon = BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS[stage.status];
  const label = ROADMAP_STATUS_LABELS[stage.status];
  const blockedReason = stage.status === 'blocked' ? stage.whatIsNotDone[0] : null;
  const compactLine = blockedReason ? `${stage.compactLine} · ${blockedReason}` : stage.compactLine;

  return (
    <div data-testid="roadmap-stage" style={{ padding: '6px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>
        {icon}{' '}
        <span>{stage.order}. </span>
        <span>{stage.title}</span>
        {' — '}
        <span data-testid="roadmap-status-label" style={{ color: stage.status === 'current' ? '#60a5fa' : stage.status === 'blocked' ? '#f87171' : '#94a3b8' }}>{label}</span>
        {stage.relatedCommit ? <span style={{ color: '#94a3b8', fontSize: 12 }}> · {stage.relatedCommit}</span> : null}
        {stage.visibleRoute ? <span style={{ color: '#94a3b8', fontSize: 12 }}> · {stage.visibleRoute}</span> : null}
      </div>
      <p data-testid={blockedReason ? 'roadmap-blocked-reason' : 'roadmap-compact-line'} style={{ color: blockedReason ? '#fecaca' : '#cbd5e1', fontSize: 13, margin: '4px 0 0', paddingInlineStart: 24 }}>{compactLine}</p>
    </div>
  );
}

function CompactRoadmapGroupSection({ group }: RoadmapGroupSectionProps) {
  return (
    <section data-testid="roadmap-group" style={{ marginTop: 10 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#93c5fd' }}>{group.title}</h3>
      <p style={{ margin: '0 0 6px', color: '#94a3b8', fontSize: 13 }}>{group.subtitle}</p>
      {group.stages.map((stage) => <CompactRoadmapRow key={stage.roadmapStageId} stage={stage} />)}
    </section>
  );
}

function StageRoadmapSection() {
  return (
    <section data-testid="brain-build-stage-roadmap" style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>מפת שלבי בניית המוח</h2>
      <p data-testid="roadmap-banner" style={{ color: '#fbbf24', fontWeight: 700, margin: '0 0 14px', fontSize: 13 }}>{BRAIN_BUILD_STAGE_ROADMAP_BANNER}</p>
      <p data-testid="roadmap-working-plan-notice" style={{ color: '#bae6fd', fontWeight: 700, margin: '0 0 14px', fontSize: 13 }}>{BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE}</p>
      <p data-testid="roadmap-summary-counter" style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 14px', fontSize: 15 }}>{roadmapSummaryCounter()}</p>
      <p data-testid="roadmap-working-plan-flags" style={{ color: '#cbd5e1', margin: '0 0 14px', fontSize: 13 }}>roadmapStatus:{BRAIN_BUILD_STAGE_ROADMAP_CONTROL.roadmapStatus} · canBeReordered:{String(BRAIN_BUILD_STAGE_ROADMAP_CONTROL.canBeReordered)} · requiresEldadApprovalForRoadmapChange:{String(BRAIN_BUILD_STAGE_ROADMAP_CONTROL.requiresEldadApprovalForRoadmapChange)}</p>
      {BRAIN_BUILD_STAGE_ROADMAP_GROUPS.map((group) => (
        <div key={group.groupId}>
          {group.groupId === 'path-to-operation' ? (
            <div data-testid="roadmap-divider" style={{ background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 8, padding: '10px 14px', marginTop: 14, color: '#fde68a', fontWeight: 700, fontSize: 13 }}>
              {BRAIN_BUILD_STAGE_ROADMAP_DIVIDER}
            </div>
          ) : null}
          <CompactRoadmapGroupSection group={group} />
        </div>
      ))}
    </section>
  );
}
// #endregion

/**
 * BrainBuildProgressConsole — Static read-only project-control screen for Brain build progress.
 * @example
 * <BrainBuildProgressConsole />
 */
export default function BrainBuildProgressConsole() {
  return (
    <main data-testid="brain-build-progress-console" dir="rtl" style={{ color: '#e5edf7', padding: 24 }}>
      <ProgressHeader />
      <LatestChangeSummary />
      <StageRoadmapSection />
      <ProgressMetrics />
      {groupProgressItems().map(([layer, progressItems]) => (
        <ProgressLayerSection key={layer} layer={layer} progressItems={progressItems} />
      ))}
    </main>
  );
}
// #endregion
