/* ============================================
   FILE: rules.ts
   PURPOSE: Business rules for documents
   DEPENDENCIES: core/types
   EXPORTS: applyDocumentRules
   ============================================ */
import { DomainResult, addIssue, addAction } from '../core/result';
import { DocumentInput, DocumentCategory } from './classifier';

const HIGH_AMOUNT_THRESHOLD = 10000;

/**
 * Applies business rules based on the classification and data.
 * Returns mutated result.
 */
export function applyDocumentRules(
  doc: DocumentInput,
  result: DomainResult<DocumentCategory>
): DomainResult<DocumentCategory> {
  
  // Rule 1: High Amount -> Flag for manual check
  if (doc.amount && doc.amount >= HIGH_AMOUNT_THRESHOLD) {
    addIssue(result, {
      code: 'HIGH_AMOUNT_FLAG',
      message: `Document amount is extremely high (${doc.amount}). Requires CEO / CFO approval.`,
      severity: 'warning'
    });
    addAction(result, {
      type: 'REQUIRE_APPROVAL',
      description: 'Send to Manager Dashboard for review'
    });
  }

  // Rule 2: Supplier Invoice without amount -> Data missing
  if (result.type === 'supplier_invoice' && (!doc.amount || doc.amount <= 0)) {
     addIssue(result, {
       code: 'MISSING_INVOICE_AMOUNT',
       message: 'Supplier Invoice detected (VAT present), but amount is 0 or missing.',
       severity: 'critical'
     });
     addAction(result, {
       type: 'REQUEST_DATA',
       description: 'Ask user to provide the exact invoice amount.'
     });
  }

  // Rule 3: Tax notices must be routed correctly
  if (result.type === 'tax_notice') {
    addAction(result, {
      type: 'ROUTE_TO_ACCOUNTING',
      description: 'Route directly to the accounting queue.'
    });
  }

  return result;
}
