/* ============================================
   FILE: classifier.ts
   PURPOSE: Document Classifier Logic
   DEPENDENCIES: IncomingDocument
   EXPORTS: classifyDocument
   ============================================ */
// Note: We'll import a generic Partial<IncomingDocument> or define a simplified DocumentInput.
// For now, let's define what we need here to stay decoupled.

export interface DocumentInput {
  hasVat?: boolean;
  amount?: number;
  description?: string;
  source?: string;
}

export type DocumentCategory = 
  | 'supplier_invoice' 
  | 'client_doc' 
  | 'tax_notice' 
  | 'contract' 
  | 'other'
  | 'unknown';

/**
 * Classifies a document STRICTLY based on hard conditions.
 * No AI. Pure logic.
 */
export function classifyDocument(doc: DocumentInput): DocumentCategory {
  if (doc.hasVat) {
    return 'supplier_invoice';
  }
  
  const desc = (doc.description || '').toLowerCase();
  
  if (desc.includes('מס') || desc.includes('מע"מ') || desc.includes('ביטוח לאומי')) {
    return 'tax_notice';
  }
  
  if (desc.includes('הסכם') || desc.includes('חוזה') || desc.includes('contract') || desc.includes('agreement')) {
    return 'contract';
  }

  // If we have an amount but no VAT, could be a general client doc or other invoice without tax.
  if (doc.amount && doc.amount > 0) {
    return 'client_doc';
  }

  return 'other';
}
