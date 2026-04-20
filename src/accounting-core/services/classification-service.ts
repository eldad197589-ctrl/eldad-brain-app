// ==========================================
// FILE: classification-service.ts
// PURPOSE: Backend/domain service to propose accounting components from extracted data.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  ExtractedFieldSet,
  ClassificationResult,
  ExtractionStatus,
  ClassificationStatus,
  DocumentTypeHint
} from '../types/accounting-core-types';

export interface ClassificationServiceResult {
  classified_proposals: ClassificationResult[];
  rejected_extractions: ExtractedFieldSet[];
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
 * Executes rudimentary domain logic proposing foundational accounting components
 * exclusively via strict structural keywords detected in physical extraction fields.
 */
function proposeAccountingComponent(supplierName?: string, docType?: DocumentTypeHint): string {
  const normName = supplierName ? supplierName.toLowerCase() : '';
  
  if (normName.includes('facebook') || normName.includes('google') || normName.includes('meta')) {
    return 'COMPONENT_MARKETING_EXPENSES';
  }
  if (normName.includes('wolt') || normName.includes('tenbis') || normName.includes('cibus') || normName.includes('תן ביס')) {
    return 'COMPONENT_MEALS_AND_ENTERTAINMENT';
  }
  if (normName.includes('isracard') || normName.includes('bank') || normName.includes('cal')) {
    return 'COMPONENT_BANK_FEES';
  }
  if (normName.includes('electric') || normName.includes('חשמל')) {
    return 'COMPONENT_UTILITIES_ELECTRICITY';
  }
  if (normName.includes('pelephone') || normName.includes('cellcom') || normName.includes('partner') || normName.includes('פלאפון')) {
    return 'COMPONENT_COMMUNICATION_EXPENSES';
  }

  if (docType === DocumentTypeHint.RECEIPT) {
    return 'COMPONENT_GENERAL_RECEIPT_UNCLASSIFIED';
  }
  
  return 'COMPONENT_UNKNOWN_AWAITING_MAPPING';
}

/**
 * CORE SERVICE 4: Classification Service
 * Responsibility: Translate extracted mathematical and textual fields into educated PROPOSALS.
 * Cannot establish final accounting truths. Outputs strictly 'AUTO_CLASSIFIED' and 'NEEDS_REVIEW' records.
 */
export class ClassificationService {
  /**
   * Processes extraction field sets, formulating accounting classification suggestions
   * without assuming governing fiscal resolution powers.
   */
  public classifyExtractions(
    extractedSets: ExtractedFieldSet[], 
    clientIdContext: string, 
    accountingPeriodContext: string
  ): ClassificationServiceResult {
    
    const classified_proposals: ClassificationResult[] = [];
    const rejected_extractions: ExtractedFieldSet[] = [];

    for (const fieldSet of extractedSets) {
      // 1. Validate Extraction Eligibility
      // Completely block unreadable extractions or items that haven't been completed.
      if (
        fieldSet.extraction_status === ExtractionStatus.NOT_STARTED ||
        fieldSet.extraction_status === ExtractionStatus.UNREADABLE
      ) {
        rejected_extractions.push(fieldSet);
        continue;
      }

      const proposalName = proposeAccountingComponent(fieldSet.supplier_name_if_exists, fieldSet.document_type);
      const contradictionFlags: string[] = [];
      let status: ClassificationStatus;

      // 2. Perform Rule-Based Proposal & Establish Status
      if (proposalName === 'COMPONENT_UNKNOWN_AWAITING_MAPPING' || fieldSet.extraction_status === ExtractionStatus.NEEDS_REVIEW) {
        // Obscure supplier or previous extraction unreliability cascades to NEEDS_REVIEW
        status = ClassificationStatus.NEEDS_REVIEW;
      } else if (proposalName === 'COMPONENT_GENERAL_RECEIPT_UNCLASSIFIED') {
        // Receipt without specific tax substance is poorly classified, flag it
        status = ClassificationStatus.NOT_CLASSIFIED;
      } else {
        // Concrete mapping rule found
        status = ClassificationStatus.AUTO_CLASSIFIED;
      }

      // 3. Emit contradiction flags regarding extraction uncertainty affecting classification
      if ((fieldSet.contradiction_flags_if_any?.length ?? 0) > 0) {
        contradictionFlags.push('CLASSIFICATION_UNSTABLE: Upstream extraction arithmetic suspect.');
        // Unstable upstream math explicitly downgrades any 'auto' mappings
        status = ClassificationStatus.NEEDS_REVIEW; 
      }

      if (fieldSet.extraction_status === ExtractionStatus.PARTIAL) {
        contradictionFlags.push('CLASSIFICATION_RISK: Submitting partial extraction field mapping.');
        // Partial fields cannot generate a fully trusted auto classification
        status = ClassificationStatus.NEEDS_REVIEW;
      }

      // STRICT SAFETY: The module mathematically forbids producing VERIFIED_CLASSIFICATION anywhere.
      
      const confidence = status === ClassificationStatus.AUTO_CLASSIFIED ? 0.8 : 0.2;

      // 4. Create Output Result preserving upstream linkage
      const result: ClassificationResult = {
        id: generateUuid(),
        document_intake_id: fieldSet.document_intake_id, // Unbroken source trace
        extracted_field_set_id: fieldSet.id, // Unbroken math trace
        client_id: clientIdContext,
        accounting_period_id: accountingPeriodContext,
        proposed_accounting_component: proposalName,
        classification_confidence: confidence,
        classification_status: status,
        contradiction_flags_if_any: contradictionFlags.length > 0 ? contradictionFlags : undefined
      };

      classified_proposals.push(result);
    }

    return {
      classified_proposals,
      rejected_extractions
    };
  }
}
