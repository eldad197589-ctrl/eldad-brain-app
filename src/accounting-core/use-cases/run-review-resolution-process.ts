// ==========================================
// FILE: run-review-resolution-process.ts
// PURPOSE: Use-case orchestration executing the Human/Rule Review Resolution bounds.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  ReviewResolutionService,
  AuditTraceService,
  IClassificationResultRepository,
  IResolutionResultRepository,
  ReviewerDecision,
  ClassificationResult,
  ResolutionStatus,
  AuditTraceStatus
} from '../index';

export interface RunReviewResolutionProcessInput {
  actor_id: string; // The explicit human/system actor claiming accountability
  decisions: ReviewerDecision[];
}

export interface RunReviewResolutionProcessResult {
  is_success: boolean;
  resolutions_created: number;
  resolutions_blocked_count: number;
  resolution_result_ids: string[];
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Review Resolution Process
 * Responsibility: Transits proposed accounting components into verified truths 
 * EXCLUSIVELY via explicit reviewer/rule-assisted decision paths.
 * Enforces highest traceability. Validates the proposals against inputs natively.
 */
export class RunReviewResolutionProcess {
  
  constructor(
    private classificationResultRepo: IClassificationResultRepository,
    private resolutionResultRepo: IResolutionResultRepository,
    private auditTraceService: AuditTraceService
  ) {}

  public execute(input: RunReviewResolutionProcessInput): RunReviewResolutionProcessResult {
    try {
      // 1. Initial Gating and Pure Accountability Strictness
      if (!input.actor_id) {
        throw new Error('Orchestration Blocked: actor_id is mandatory. Anonymous human resolutions represent a severe governance risk.');
      }

      if (!input.decisions || input.decisions.length === 0) {
        throw new Error('Orchestration Blocked: Resolution use case invoked without decision payload.');
      }

      // 2. Load context proposals safely
      const loadedProposals: ClassificationResult[] = [];
      const missingIds: string[] = [];

      for (const decision of input.decisions) {
        const proposal = this.classificationResultRepo.getById(decision.classification_result_id);
        if (proposal) {
          loadedProposals.push(proposal);
        } else {
          missingIds.push(decision.classification_result_id);
        }
      }

      // Zero-Tolerance for ghost-decisions on vanished proposals
      if (missingIds.length > 0) {
        throw new Error(`Data Integrity Risk: Refused to authorize decisions against ${missingIds.length} vanished Classification Proposals.`);
      }

      // 3. Initiate isolated Domain Engine mapping
      const resolutionService = new ReviewResolutionService();
      
      const result = resolutionService.resolveClassifications(
         loadedProposals,
         input.decisions
      );

      const outputIds: string[] = [];
      let blockedOrFailedMetrics = result.unresolved.length; 

      // 4. Solidify Accounting Truth and Traceability
      for (const resolution of result.resolved) {
        
        // Push safely to final truths table
        this.resolutionResultRepo.create(resolution);
        outputIds.push(resolution.id);

        let traceReason = 'Classification verified robustly establishing structured accounting truth component.';
        
        if (resolution.final_resolution_status === ResolutionStatus.BLOCKED) {
           traceReason = 'Resolution explicitly identified as permanently blocked based on manual reviewer rejection logic.';
           blockedOrFailedMetrics++; 
        }

        // Execute hard tracing
        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunReviewResolutionProcess',
          target_object_type: 'ResolutionResult',
          target_object_id: resolution.id,
          new_state: resolution.final_resolution_status,
          reason: traceReason,
          prior_state_if_any: 'CLASSIFICATION_PROPOSAL'
        });
      }

      // 5. Track unresolved items for trace transparency
      for (const unresolved of result.unresolved) {
         this.auditTraceService.record({
            actor_id: input.actor_id,
            service_name: 'RunReviewResolutionProcess',
            target_object_type: 'ClassificationResult',
            target_object_id: unresolved.id,
            new_state: 'RESOLUTION_UNRESOLVED',
            reason: `Classification proposal remained unresolved (no matching decision, invalid decision, or ineligible status).`
         });
      }

      return {
        is_success: true,
        resolutions_created: result.resolved.length,
        resolutions_blocked_count: blockedOrFailedMetrics,
        resolution_result_ids: outputIds
      };

    } catch (error: any) {
      
      // Strict Anti-Silent-Crash Guarantee
      this.auditTraceService.record({
        actor_id: input.actor_id || 'UNKNOWN_ACTOR_FAILURE',
        service_name: 'RunReviewResolutionProcess',
        target_object_type: 'OrchestrationContext',
        target_object_id: 'SYSTEM_RESOLUTION_BATCH_FAILURE',
        new_state: 'BLOCKED',
        reason: `Process orchestration halted abruptly securing ledger state integrity: ${error.message}`
      });

      return {
        is_success: false,
        resolutions_created: 0,
        resolutions_blocked_count: 0,
        resolution_result_ids: [],
        error_message: error.message
      };
    }
  }
}
