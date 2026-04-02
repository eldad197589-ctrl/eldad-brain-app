/* ============================================
   FILE: engine.ts
   PURPOSE: Main entry point for Document Domain
   DEPENDENCIES: core/result, classifier, rules, extractor
   EXPORTS: processDocument
   ============================================ */
import { createResult, DomainResult } from '../core/result';
import { extractDocumentFeatures } from './extractor';
import { classifyDocument, DocumentCategory } from './classifier';
import { applyDocumentRules } from './rules';

/**
 * Domain Engine Entry Point: processDocument
 * -> extract
 * -> classify
 * -> apply rules
 * -> return structured result
 */
export function processDocument(rawDoc: any): DomainResult<DocumentCategory> {
  console.log('[Domain Engine] Processing Document...');
  
  // 1. Extract & Normalize
  const features = extractDocumentFeatures(rawDoc);

  // 2. Classify
  const category = classifyDocument(features);

  // 3. Initialize Result (Base)
  const baseResult = createResult<DocumentCategory>(category, 'high');

  // 4. Apply Business Rules
  const finalResult = applyDocumentRules(features, baseResult);

  console.log('[Domain Engine] Process Result:', finalResult);
  return finalResult;
}
