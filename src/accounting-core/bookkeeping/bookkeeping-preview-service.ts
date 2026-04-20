// ==========================================
// FILE: bookkeeping-preview-service.ts
// PURPOSE: Stateless preview generation boundary creating double-entry candidate structural representations safely matching the blueprint limits. No physical posting is permitted.
// DEPENDENCIES: AccountingCoreTypes, BookkeepingPreviewTypes
// ==========================================

import { ResolutionResult, ClientCaseMapping, ResolutionStatus, MappingStatus } from '../types/accounting-core-types';
import { BookkeepingPreviewResult, CandidateJournalEntry, CandidateJournalLine } from './bookkeeping-preview-types';

export class BookkeepingPreviewService {
  
  /**
   * Generates a safe preview entry from strictly approved structural limits.
   * Discards mismatched totals and enforces double-checking.
   */
  public generatePreview(
    resolution: ResolutionResult,
    mapping: ClientCaseMapping,
    periodId: string,
    extractedGrossAmount: number,
    extractedVatAmount: number = 0
  ): BookkeepingPreviewResult {
    
    // 1. Blueprint Constraint Validation
    if (resolution.final_resolution_status !== ResolutionStatus.VERIFIED_CLASSIFICATION) {
      return {
        is_success: false,
        error_reason: 'PREVIEW_BLOCKED: Source resolution is not explicitly verified.'
      };
    }

    if (mapping.mapping_status !== MappingStatus.LINKED) {
      return {
        is_success: false,
        error_reason: 'PREVIEW_BLOCKED: Source mapping is not explicitly linked to a client case.'
      };
    }

    if (resolution.id !== mapping.resolution_result_id) {
       return {
         is_success: false,
         error_reason: 'PREVIEW_BLOCKED: Resolution and Mapping do not match.'
       };
    }

    // 2. Draft Candidate Building
    const candidateId = `preview_je_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const componentTarget = resolution.final_accounting_component_if_verified || 'UNKNOWN_COMPONENT';
    const currency = 'ILS'; // Assuming base standard for now

    const debits: CandidateJournalLine[] = [];
    const credits: CandidateJournalLine[] = [];

    // Simulate mapping the default double entry based on an expense blueprint:
    // Debit: Target expense account (net amount)
    // Debit: Target VAT account (tax amount)
    // Credit: Target supplier account (gross total)

    const netAmount = extractedGrossAmount - extractedVatAmount;

    debits.push({
      target_account_id: componentTarget, // the mapped chart of accounts target
      amount: netAmount,
      currency,
      line_description: `${componentTarget} Allocation`
    });

    if (extractedVatAmount > 0) {
      debits.push({
        target_account_id: 'COMPONENT_VAT_RECEIVABLE',
        amount: extractedVatAmount,
        currency,
        line_description: `VAT Declaration Output`
      });
    }

    credits.push({
      target_account_id: 'COMPONENT_SUPPLIER_PAYABLE',
      amount: extractedGrossAmount,
      currency,
      line_description: `Supplier Liability`
    });

    const totalDebits = debits.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCredits = credits.reduce((acc, curr) => acc + curr.amount, 0);
    
    // JS decimal precision safeguard (epsilon approach representation)
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;

    const entry: CandidateJournalEntry = {
      candidate_journal_entry_id: candidateId,
      entry_date: new Date().toISOString(),
      client_id: mapping.linked_client_id!,
      accounting_period_id: periodId,
      source_resolution_result_id: resolution.id,
      source_mapping_id: mapping.id,
      debit_lines: debits,
      credit_lines: credits,
      balancing_status: isBalanced ? 'BALANCED' : 'UNBALANCED',
      preview_status: isBalanced ? 'PREVIEW_READY' : 'PREVIEW_NEEDS_REVIEW'
    };

    return {
      is_success: true,
      candidate_entry: entry
    };
  }

}
