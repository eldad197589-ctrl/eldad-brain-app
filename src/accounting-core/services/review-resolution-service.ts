// ==========================================
// FILE: review-resolution-service.ts
// PURPOSE: Backend/domain service for resolving classification proposals into final verified outcomes.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  ClassificationResult,
  ResolutionResult,
  ClassificationStatus,
  ResolutionStatus
} from '../types/accounting-core-types';

/**
 * Explicit reviewer decision payload.
 * Must be supplied by a human operator or an approved rule-assisted path.
 * Silent/empty decisions are structurally rejected.
 */
export interface ReviewerDecision {
  classification_result_id: string;
  action: 'APPROVE' | 'REJECT' | 'RECLASSIFY';
  override_component_if_reclassify?: string;
  reason: string;
  reviewer_actor_id: string;
  rule_assisted: boolean;
}

export interface ResolutionServiceResult {
  resolved: ResolutionResult[];
  unresolved: ClassificationResult[];
}

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
 * Validates that a reviewer decision carries non-empty justification.
 */
function isDecisionValid(decision: ReviewerDecision): boolean {
  if (!decision.reviewer_actor_id || !decision.reason) {
    return false;
  }
  if (decision.action === 'RECLASSIFY' && !decision.override_component_if_reclassify) {
    return false;
  }
  return true;
}

/**
 * CORE SERVICE 5: Review Resolution Service
 * Responsibility: The supreme resolution gateway. Elevates provisional classification proposals
 * to VERIFIED_CLASSIFICATION exclusively through explicit human or rule-assisted decisions.
 * Silent promotion from AUTO_CLASSIFIED to VERIFIED is structurally impossible in this module.
 */
export class ReviewResolutionService {

  /**
   * Resolves classification proposals by matching them against explicit reviewer decisions.
   * Items without a matching decision remain unresolved.
   */
  public resolveClassifications(
    proposals: ClassificationResult[],
    decisions: ReviewerDecision[]
  ): ResolutionServiceResult {

    const resolved: ResolutionResult[] = [];
    const unresolved: ClassificationResult[] = [];

    // Index decisions by classification_result_id for lookup
    const decisionMap = new Map<string, ReviewerDecision>();
    for (const d of decisions) {
      decisionMap.set(d.classification_result_id, d);
    }

    for (const proposal of proposals) {
      // 1. Accept only AUTO_CLASSIFIED or NEEDS_REVIEW
      if (
        proposal.classification_status !== ClassificationStatus.AUTO_CLASSIFIED &&
        proposal.classification_status !== ClassificationStatus.NEEDS_REVIEW
      ) {
        unresolved.push(proposal);
        continue;
      }

      // 2. Locate explicit reviewer decision
      const decision = decisionMap.get(proposal.id);

      if (!decision) {
        // No decision supplied — item stays unresolved. Silent promotion is forbidden.
        unresolved.push(proposal);
        continue;
      }

      // 3. Validate decision integrity
      if (!isDecisionValid(decision)) {
        unresolved.push(proposal);
        continue;
      }

      // 4. Apply decision
      let finalStatus: ResolutionStatus;
      let finalComponent: string | undefined;
      let overrideApplied = false;

      switch (decision.action) {
        case 'APPROVE':
          finalStatus = ResolutionStatus.VERIFIED_CLASSIFICATION;
          finalComponent = proposal.proposed_accounting_component;
          break;

        case 'REJECT':
          finalStatus = ResolutionStatus.BLOCKED;
          break;

        case 'RECLASSIFY':
          finalStatus = ResolutionStatus.VERIFIED_CLASSIFICATION;
          finalComponent = decision.override_component_if_reclassify;
          overrideApplied = true;
          break;

        default:
          unresolved.push(proposal);
          continue;
      }

      // 5. Create ResolutionResult with full upstream trace linkage
      const result: ResolutionResult = {
        id: generateUuid(),
        classification_result_id: proposal.id,
        final_resolution_status: finalStatus,
        final_accounting_component_if_verified: finalComponent,
        override_applied_yes_no: overrideApplied,
        reusable_rule_participated_yes_no: decision.rule_assisted,
        audit_trace_id: `pending_audit_${generateUuid()}`, // Placeholder linkage — actual trace written by Audit Trace Service
        resolution_reason: decision.reason
      };

      resolved.push(result);
    }

    return { resolved, unresolved };
  }
}
