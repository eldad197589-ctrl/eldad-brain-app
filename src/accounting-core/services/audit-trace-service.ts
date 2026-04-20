// ==========================================
// FILE: audit-trace-service.ts
// PURPOSE: Backend/domain service for immutable audit tracing across all accounting-core services.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  ImmutableAuditTraceRecord,
  AuditTraceStatus
} from '../types/accounting-core-types';

export interface AuditTraceInput {
  actor_id: string;
  service_name: string;
  target_object_type: string;
  target_object_id: string;
  prior_state_if_any?: string;
  new_state: string;
  reason: string;
  related_client_if_any?: string;
  related_accounting_period_if_any?: string;
  related_batch_or_run_id_if_any?: string;
}

export interface AuditTraceResult {
  trace: ImmutableAuditTraceRecord | null;
  status: AuditTraceStatus;
  error_reason?: string;
}

/** Actions that require a mandatory reason field. */
const REASON_MANDATORY_ACTIONS = ['OVERRIDE', 'BLOCK', 'RECLASSIFY', 'REJECT'];

/**
 * Universal UUID generator fallback.
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * CORE SERVICE 8: Audit Trace Service
 * Responsibility: Immutable flight recorder wrapping all accounting-core operations.
 * Records are append-only. No UPDATE. No DELETE. No accounting truth modification.
 */
export class AuditTraceService {

  private readonly traces: ImmutableAuditTraceRecord[] = [];

  /**
   * Records a single immutable audit trace entry.
   * Validates actor existence, target existence, explicit state transition, and reason presence.
   */
  public record(input: AuditTraceInput): AuditTraceResult {

    // 1. Actor must exist
    if (!input.actor_id) {
      return {
        trace: null,
        status: AuditTraceStatus.BLOCKED,
        error_reason: 'Missing actor_id. Anonymous traces are forbidden.'
      };
    }

    // 2. Target object must exist
    if (!input.target_object_id || !input.target_object_type) {
      return {
        trace: null,
        status: AuditTraceStatus.BLOCKED,
        error_reason: 'Missing target object identity. Ghost traces are forbidden.'
      };
    }

    // 3. State transition must be explicit
    if (!input.new_state) {
      return {
        trace: null,
        status: AuditTraceStatus.BLOCKED,
        error_reason: 'Missing new_state. State transition must be explicit.'
      };
    }

    // 4. Reason required for override/block/reclassification actions
    const isHighStakesAction = REASON_MANDATORY_ACTIONS.some(
      action => input.new_state.toUpperCase().includes(action)
    );
    if (isHighStakesAction && !input.reason) {
      return {
        trace: null,
        status: AuditTraceStatus.NEEDS_REVIEW,
        error_reason: 'High-stakes state transition requires explicit reason.'
      };
    }

    // 5. Timestamp generated at recording time — not user-supplied
    const timestamp = new Date().toISOString();

    // 6. Create immutable trace record
    const traceRecord: ImmutableAuditTraceRecord = {
      id: generateUuid(),
      actor_id: input.actor_id,
      service_name: input.service_name,
      target_object_type: input.target_object_type,
      target_object_id: input.target_object_id,
      prior_state_if_any: input.prior_state_if_any,
      new_state: input.new_state,
      reason: input.reason,
      timestamp,
      related_client_if_any: input.related_client_if_any,
      related_accounting_period_if_any: input.related_accounting_period_if_any,
      related_batch_or_run_id_if_any: input.related_batch_or_run_id_if_any,
      trace_status: AuditTraceStatus.RECORDED,
      trace_link_reference: `${input.service_name}::${input.target_object_type}::${input.target_object_id}`
    };

    // 7. Append-only storage — no mutation path exists
    this.traces.push(traceRecord);

    return {
      trace: traceRecord,
      status: AuditTraceStatus.RECORDED
    };
  }

  /**
   * Read-only query: retrieve all traces for a specific target object.
   */
  public getTracesForObject(targetObjectId: string): ImmutableAuditTraceRecord[] {
    return this.traces.filter(t => t.target_object_id === targetObjectId);
  }

  /**
   * Read-only query: retrieve all traces by a specific actor.
   */
  public getTracesByActor(actorId: string): ImmutableAuditTraceRecord[] {
    return this.traces.filter(t => t.actor_id === actorId);
  }

  /**
   * Read-only: total trace count. No deletion capability exposed.
   */
  public getTraceCount(): number {
    return this.traces.length;
  }
}
