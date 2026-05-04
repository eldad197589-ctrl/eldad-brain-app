/**
 * VAT static evidence types for already extracted bookkeeping journal rows.
 *
 * Stage scope: static seed only. No runtime Excel, PDF, OCR, provider, store, or
 * accounting-system access is represented here.
 */

/** Accounting-system status captured from existing static evidence artifacts. */
export type VatAccountingSystemStatus =
  | 'recorded_in_accounting_system'
  | 'not_found'
  | 'unknown';

/** Confidence level for a static VAT evidence record. */
export type VatEvidenceConfidence = 'high' | 'medium' | 'low';

/** Canonical missing-value marker for fields that were not explicitly verified. */
export const VAT_STATIC_EVIDENCE_MISSING = 'חסר';

/** Existing source artifact used for this first static VAT evidence seed. */
export const VAT_STATIC_EVIDENCE_SOURCE_ARTIFACT =
  'Knowledge_Base/tax/vat/maven_reconciliation_examples/2026_01_02_vat_close/דוח תנועות יומן 1-2.26.xlsx';

/** Static VAT evidence record captured from already extracted journal evidence. */
export interface VatStaticEvidenceRecord {
  evidenceId: string;
  clientOrMatter: string;
  supplier: string;
  invoiceDate: string;
  periodDescription: string;
  reportMonth: string;
  amountFieldAsInSource: string;
  vatAmount: string;
  totalIfKnown: string;
  accountingSystemStatus: VatAccountingSystemStatus;
  accountingReference: string;
  vatReportAssignment: string;
  expenseClassification: string;
  sourceArtifact: string;
  confidence: VatEvidenceConfidence;
  reviewNote: string;
}
