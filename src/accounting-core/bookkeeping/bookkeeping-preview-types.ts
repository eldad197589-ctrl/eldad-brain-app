// ==========================================
// FILE: bookkeeping-preview-types.ts
// PURPOSE: Structurally defines the candidate journal preview domain preventing premature ledger mutation.
// DEPENDENCIES: None (Strict primitive boundaries)
// ==========================================

export type BalancingStatus = 'BALANCED' | 'UNBALANCED' | 'EVALUATING';

export type BookkeepingPreviewStatus = 
  | 'PREVIEW_READY' 
  | 'PREVIEW_NEEDS_REVIEW' 
  | 'PREVIEW_BLOCKED';

export interface CandidateJournalLine {
  target_account_id: string;
  amount: number;
  currency: string;
  line_description: string;
}

export interface CandidateJournalEntry {
  candidate_journal_entry_id: string;
  entry_date: string; // ISO 8601
  client_id: string;
  accounting_period_id: string;
  
  // Provenance Hooks strictly referencing approved data
  source_resolution_result_id: string;
  source_mapping_id: string;
  
  // Ledger Arrays
  debit_lines: CandidateJournalLine[];
  credit_lines: CandidateJournalLine[];

  // Mechanical States
  balancing_status: BalancingStatus;
  preview_status: BookkeepingPreviewStatus;
  
  audit_trace_reference?: string;
}

export interface BookkeepingPreviewResult {
  is_success: boolean;
  candidate_entry?: CandidateJournalEntry;
  error_reason?: string;
}
