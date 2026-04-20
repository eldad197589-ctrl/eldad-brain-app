/* ============================================
   FILE: brainLearningQueue.ts
   PURPOSE: Live brain learning intake queue
   DEPENDENCIES: none
   EXPORTS: BrainQueueItem, addToQueue, getByStatus,
            getByType, routeQueueItem, dropQueueItem,
            deferQueueItem, brainLearningQueue
   ============================================ */

// #region Types & Vocabularies

/** Queue item types — from approved queue seed */
export type QueueItemType =
  | 'seed_case'
  | 'structural_pattern'
  | 'experience_heuristic'
  | 'normative_source_signal'
  | 'template_observation'
  | 'timing_observation'
  | 'failure_pattern'
  | 'system_harvest'
  | 'legacy_backfill';

/** Source channels CH-1 through CH-6 */
export type SourceChannel = 'CH-1' | 'CH-2' | 'CH-3' | 'CH-4' | 'CH-5' | 'CH-6';

/** Queue statuses — from approved queue seed */
export type QueueStatus = 'queued' | 'under_review' | 'routed' | 'dropped' | 'deferred';

/** Drop reasons */
export type DropReason =
  | 'no_content'
  | 'duplicate'
  | 'case_only'
  | 'source_missing'
  | 'corrupted'
  | 'operator_reject';

/** Defer reasons */
export type DeferReason =
  | 'domain_not_started'
  | 'needs_second_case'
  | 'source_pending';

/** Routing targets */
export type RoutingTarget =
  | 'seed_case_review'
  | 'extraction_review'
  | 'labeling_review'
  | 'source_isolation_review'
  | 'classification_review';

// #endregion

// #region Queue Item Interface

/** Minimal queue item shape — from approved spec */
export interface BrainQueueItem {
  queueItemId: string;
  itemType: QueueItemType;
  sourceChannel: SourceChannel;
  sourceCaseId: string | null;
  domainScope: string;
  rawContent: string;
  capturedBy: string;
  capturedAt: string;
  queueStatus: QueueStatus;
  notes: string;
  routingTarget: RoutingTarget | null;
  dropReason: DropReason | null;
  deferReason: DeferReason | null;
}

// #endregion

// #region Routing Map

const ROUTING_MAP: Record<QueueItemType, RoutingTarget> = {
  seed_case: 'seed_case_review',
  structural_pattern: 'extraction_review',
  experience_heuristic: 'labeling_review',
  normative_source_signal: 'source_isolation_review',
  template_observation: 'classification_review',
  timing_observation: 'labeling_review',
  failure_pattern: 'extraction_review',
  system_harvest: 'extraction_review',
  legacy_backfill: 'classification_review',
};

// #endregion

// #region Seed Data

/** Live queue — seeded with BLIQ-001, BLIQ-002, BLIQ-003 */
export const brainLearningQueue: BrainQueueItem[] = [
  {
    queueItemId: 'BLIQ-001',
    itemType: 'seed_case',
    sourceChannel: 'CH-5',
    sourceCaseId: 'dima',
    domainScope: 'appeals',
    rawContent:
      'Dima Rodnitsky war compensation appeal (Red Track, Ashkelon). ' +
      'Completed intake, full document set, finalized appeal document ' +
      '(QA passed), case-specific calculations, authority decision analyzed. ' +
      'First fully governed matter in the brain system. Candidate for seed ' +
      'case designation pending review per appeal_seed_case_protocol.',
    capturedBy: 'system_seed',
    capturedAt: '2026-04-08',
    queueStatus: 'queued',
    notes:
      'No automatic promotion. Staging only. Must pass seed case review ' +
      'before any pattern extraction may begin.',
    routingTarget: null,
    dropReason: null,
    deferReason: null,
  },
  {
    queueItemId: 'BLIQ-002',
    itemType: 'structural_pattern',
    sourceChannel: 'CH-5',
    sourceCaseId: 'dima',
    domainScope: 'appeals',
    rawContent:
      'Appeal 8-chapter structure: (1) פתח דבר (2) מסגרת נורמטיבית ' +
      '(3) רקע עובדתי (4) תשתית ראייתית (5) פגמים בהחלטה ' +
      '(6) דיון בטענות הרשות (7) סיכום וסעד (8) נספחים. ' +
      'Flow: identity → legal frame → chronology → evidence → ' +
      'flaws → rebuttal → relief.',
    capturedBy: 'system_seed',
    capturedAt: '2026-04-08',
    queueStatus: 'queued',
    notes:
      'Single-case observation. Cannot promote to Layer 3 until validated ' +
      'against at least one additional independent appeal matter.',
    routingTarget: null,
    dropReason: null,
    deferReason: null,
  },
  {
    queueItemId: 'BLIQ-003',
    itemType: 'structural_pattern',
    sourceChannel: 'CH-5',
    sourceCaseId: 'dima',
    domainScope: 'appeals',
    rawContent:
      'Evidence chain pattern: claim component → required proof type → ' +
      'supporting document category. Observed chains: revenue loss → ' +
      'periodic comparison → VAT/invoicing; expense increase → itemized ' +
      'differential → receipts/bank; salary cost → payroll comparison → ' +
      'Form 102/leave; causal link → geographic/temporal overlap → ' +
      'registration/directives; continuity disruption → cessation evidence → ' +
      'correspondence/contracts.',
    capturedBy: 'system_seed',
    capturedAt: '2026-04-08',
    queueStatus: 'queued',
    notes:
      'Single-case observation. No promotion before multi-case validation. ' +
      'No client facts, amounts, or identifying data included.',
    routingTarget: null,
    dropReason: null,
    deferReason: null,
  },
];

// #endregion

// #region Queue Operations

/**
 * Adds a new item to the queue.
 * @param item - The queue item to add (queueStatus forced to 'queued')
 */
export function addToQueue(item: Omit<BrainQueueItem, 'queueStatus' | 'routingTarget' | 'dropReason' | 'deferReason'>): void {
  brainLearningQueue.push({
    ...item,
    queueStatus: 'queued',
    routingTarget: null,
    dropReason: null,
    deferReason: null,
  });
}

/**
 * Returns all queue items matching the given status.
 * @param status - The queue status to filter by
 */
export function getByStatus(status: QueueStatus): BrainQueueItem[] {
  return brainLearningQueue.filter(i => i.queueStatus === status);
}

/**
 * Returns all queue items matching the given item type.
 * @param type - The item type to filter by
 */
export function getByType(type: QueueItemType): BrainQueueItem[] {
  return brainLearningQueue.filter(i => i.itemType === type);
}

/**
 * Routes a queue item to its designated review target.
 * @param itemId - The queue item ID to route
 * @returns true if routed, false if item not found or not in 'queued' status
 */
export function routeQueueItem(itemId: string): boolean {
  const item = brainLearningQueue.find(i => i.queueItemId === itemId);
  if (!item || item.queueStatus !== 'queued') return false;
  item.queueStatus = 'routed';
  item.routingTarget = ROUTING_MAP[item.itemType];
  return true;
}

/**
 * Drops a queue item with a reason.
 * @param itemId - The queue item ID to drop
 * @param reason - The reason for dropping
 * @returns true if dropped, false if item not found
 */
export function dropQueueItem(itemId: string, reason: DropReason): boolean {
  const item = brainLearningQueue.find(i => i.queueItemId === itemId);
  if (!item) return false;
  item.queueStatus = 'dropped';
  item.dropReason = reason;
  return true;
}

/**
 * Defers a queue item with a reason.
 * @param itemId - The queue item ID to defer
 * @param reason - The reason for deferring
 * @returns true if deferred, false if item not found
 */
export function deferQueueItem(itemId: string, reason: DeferReason): boolean {
  const item = brainLearningQueue.find(i => i.queueItemId === itemId);
  if (!item) return false;
  item.queueStatus = 'deferred';
  item.deferReason = reason;
  return true;
}

// #endregion
