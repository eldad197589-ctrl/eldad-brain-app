/* ============================================
   FILE: extractor.ts
   PURPOSE: Extract data from raw documents
   DEPENDENCIES: none
   EXPORTS: extractDocumentFeatures
   ============================================ */
import { DocumentInput } from './classifier';

/**
 * A purely deterministic extractor to normalize inputs before classification.
 * e.g., mapping incoming raw object to a standard shape.
 */
export function extractDocumentFeatures(rawPayload: any): DocumentInput {
  return {
    hasVat: Boolean(rawPayload?.hasVat),
    amount: Number(rawPayload?.amount) || 0,
    description: String(rawPayload?.description || '').trim(),
    source: String(rawPayload?.source || 'unknown')
  };
}
