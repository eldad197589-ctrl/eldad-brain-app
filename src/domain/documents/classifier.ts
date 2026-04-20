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
  | 'taboo' // Promoted from Guardian
  | 'bank_statements' // Promoted from Guardian
  | 'other'
  | 'unknown';

/**
 * PROMOTED KNOWLEDGE: Guardian Reporting Document Categories.
 * Extracted from Guardian's aiDocumentProcessor.ts
 */
export const GUARDIAN_CATEGORIES = [
  { id: 'court', label: 'צווי בית משפט', description: 'צו מינוי אפוטרופוס, החלטות בית משפט' },
  { id: 'medical', label: 'מסמכים רפואיים', description: 'אישורים רפואיים, תעודות רפואיות, מכתבים מרופאים' },
  { id: 'financial', label: 'אסמכתאות פיננסיות', description: 'קבלות, חשבוניות, אישורי תשלום' },
  { id: 'correspondence', label: 'התכתבויות', description: 'מכתבים, הודעות' },
  { id: 'balance_confirmation', label: 'אישורי יתרה', description: 'אישור יתרה בנקאי ל-31/12' },
  { id: 'bank_statements', label: 'דפי בנק', description: 'תדפיס תנועות בנק, דפי חשבון' },
  { id: 'credit_cards', label: 'כרטיסי אשראי', description: 'פירוט חיובי כרטיס אשראי, דפי פירוט מאקס, כאל, ישראכרט' },
  { id: 'reports', label: 'דוחות קודמים', description: 'דוחות אפוטרופוס קודמים' },
  { id: 'taboo', label: 'נסח טאבו', description: 'נסח רישום מקרקעין, אישור זכויות בנכס' },
  { id: 'general', label: 'כללי', description: 'כל מסמך שאינו מתאים לקטגוריות לעיל' }
];

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

  // Guardian promoted heuristics
  if (desc.includes('טאבו') || desc.includes('פנקס הזכויות') || desc.includes('נסח רישום')) {
    return 'taboo';
  }
  
  if (desc.includes('דפי בנק') || desc.includes('תדפיס בנק') || desc.includes('בנק ה') || desc.includes('תנועות')) {
    return 'bank_statements';
  }

  // If we have an amount but no VAT, could be a general client doc or other invoice without tax.
  if (doc.amount && doc.amount > 0) {
    return 'client_doc';
  }

  return 'other';
}
