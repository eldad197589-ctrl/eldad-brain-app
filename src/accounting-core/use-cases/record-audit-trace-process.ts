// ==========================================
// FILE: record-audit-trace-process.ts
// PURPOSE: Use-case orchestration for explicit, dedicated audit trace recording.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  AuditTraceService,
  AuditTraceInput,
  IAuditTraceRepository,
  AuditTraceStatus
} from '../index';

export interface RecordAuditTraceProcessInput {
  actor_id: string;
  trace_payload: AuditTraceInput;
}

export interface RecordAuditTraceProcessResult {
  is_success: boolean;
  trace_id: string | null;
  trace_status: AuditTraceStatus;
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Record Audit Trace Process
 * Responsibility: Dedicated use-case for recording immutable audit trace entries
 * through the AuditTraceService and persisting them to the AuditTraceRepository.
 * Strictly append-only. No UPDATE. No DELETE.
 */
export class RecordAuditTraceProcess {

  constructor(
    private auditTraceService: AuditTraceService,
    private auditTraceRepo: IAuditTraceRepository
  ) {}

  public execute(input: RecordAuditTraceProcessInput): RecordAuditTraceProcessResult {
    // 1. Mandatory identity gating
    if (!input.actor_id) {
      return {
        is_success: false,
        trace_id: null,
        trace_status: AuditTraceStatus.BLOCKED,
        error_message: 'Orchestration Blocked: actor_id is mandatory. Anonymous traces are forbidden.'
      };
    }

    if (!input.trace_payload) {
      return {
        is_success: false,
        trace_id: null,
        trace_status: AuditTraceStatus.BLOCKED,
        error_message: 'Orchestration Blocked: trace_payload is required.'
      };
    }

    // 2. Enforce actor consistency — the use-case actor overrides any payload actor
    const normalizedPayload: AuditTraceInput = {
      ...input.trace_payload,
      actor_id: input.actor_id
    };

    // 3. Invoke AuditTraceService
    const result = this.auditTraceService.record(normalizedPayload);

    // 4. Handle service-level rejection
    if (!result.trace) {
      return {
        is_success: false,
        trace_id: null,
        trace_status: result.status,
        error_message: result.error_reason || 'AuditTraceService rejected the trace without explicit reason.'
      };
    }

    // 5. Persist to repository (append-only)
    this.auditTraceRepo.create(result.trace);

    return {
      is_success: true,
      trace_id: result.trace.id,
      trace_status: result.status
    };
  }
}
