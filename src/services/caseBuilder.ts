/* ============================================
   FILE: caseBuilder.ts
   PURPOSE: Builds a CaseEntity from raw sources.
            Single entry point: buildCaseFromSources(input) → CaseEntity.
            Normalizes emails, documents, computes stats/risks/missing/timeline.
   DEPENDENCIES: ../data/caseTypes, ../services/emailClassifier,
                 ../integrations/gmail/caseBundle
   EXPORTS: buildCaseFromSources, deriveSuggestedBlocks, CaseSourceInput, RawEmail, RawDocument
   ============================================ */
import type { CaseEntity, CaseDocument } from '../data/caseTypes';
import { buildAttackMap, AttackPoint } from './decisionAttackEngine';
import { parseAuthoredResponse, ParsedResponseOutput } from './authoredResponseParser';
import type { CaseSourceInput } from './caseBuilderTypes';
import {
  normalizeEmails, normalizeDocuments, computeRiskFlags,
  computeMissingItems, computeStatus, computeTimeline,
  findCaseBundle, computeInitialDraft
} from './caseBuilderHelpers';

// #region Exports
export * from './caseBuilderTypes';
export { deriveSuggestedBlocks } from './caseBuilderHelpers';
// #endregion

// #region Main Builder

export const CASE_BUILDER_VERSION = 9;

/**
 * Build a complete CaseEntity from raw sources.
 * Normalized emails + documents + computed stats/risks/missing.
 * @param input - Raw source data
 * @returns Fully assembled CaseEntity
 */
export function buildCaseFromSources(input: CaseSourceInput): CaseEntity {
  const emails = normalizeEmails(input.rawEmails);
  const documents = normalizeDocuments(input.rawDocuments);
  const riskFlags = computeRiskFlags(input, emails, documents);
  const missingItems = computeMissingItems(input.processType, documents);
  const status = computeStatus(documents, input.deadline);
  const timeline = computeTimeline(emails, documents, input.deadline);
  const caseBundle = findCaseBundle(input.clientName);
  
  const {
    attackMap, attackSummary, authoredArguments, uncoveredAuthorityClaims, draft
  } = buildAttackDataAndDraft(input, documents, caseBundle);
  
  const now = new Date().toISOString();

  return {
    caseId: input.caseId,
    clientName: input.clientName,
    processType: input.processType,
    status,
    deadline: input.deadline,
    officialCaseNumber: input.officialCaseNumber,
    emails,
    documents,
    missingItems,
    draft,
    caseBundle,
    attackMap,
    attackSummary,
    authoredArguments,
    uncoveredAuthorityClaims,
    timeline,
    notes: input.notes || '',
    riskFlags,
    createdAt: input.createdAt || now,
    updatedAt: now,
    builtWithVersion: CASE_BUILDER_VERSION,
    builtAt: now,
  };
}

/** Helper extracted to satisfy function length rule */
function buildAttackDataAndDraft(input: CaseSourceInput, documents: CaseDocument[], caseBundle: ReturnType<typeof findCaseBundle>) {
  let attackMap: AttackPoint[] | undefined;
  let attackSummary: CaseEntity['attackSummary'];
  
  const decisionDoc = documents.find((d) => d.type === 'decision_document');
  const responseDoc = documents.find((d) => d.type === 'response_letter');

  const decisionText = input.decisionContent || decisionDoc?.description || '';
  const responseText = input.authoredResponseContent || responseDoc?.description || '';

  let parsedResponse: ParsedResponseOutput | undefined;
  if (responseText.length > 30) {
    parsedResponse = parseAuthoredResponse({
      authoredResponseText: responseText,
      decisionText,
      caseDocuments: documents,
    });
  }

  if (decisionDoc || input.decisionContent) {
    attackMap = buildAttackMap({
      decisionText,
      authoredResponseText: responseText || null,
      authoredArguments: parsedResponse?.arguments,
      caseDocuments: documents,
      caseBundle,
      processType: input.processType
    });
    
    attackSummary = {
      totalClaims: attackMap.length,
      strongPoints: attackMap.filter(a => a.strengthLevel === 'strong').length,
      mediumPoints: attackMap.filter(a => a.strengthLevel === 'medium').length,
      weakPoints: attackMap.filter(a => a.strengthLevel === 'weak').length,
      missingEvidencePoints: attackMap.filter(a => a.strengthLevel === 'missing_evidence').length,
    };
  }
  
  const draft = computeInitialDraft(input.processType, documents, attackMap);
  
  return { attackMap, attackSummary, authoredArguments: parsedResponse?.arguments, uncoveredAuthorityClaims: parsedResponse?.uncoveredAuthorityClaims, draft };
}

// #endregion

// No internal helpers below (moved to caseBuilderHelpers.ts)

