import type {
  UniversalRoutingSuggestion,
  FilingCandidate,
  TaskCandidate,
  ProcessCandidate,
  CaseEvidenceCandidate,
  LearningCandidate,
  UnknownCandidate
} from './universal-routing-types';

const defaultBoundary = {
  allowedMode: 'local_preview_only' as const,
  canCreateWorkItem: false as const,
  canCreateMatter: false as const,
  canCreateDocumentRef: false as const,
  requiresEldadApproval: true as const,
};

export const simpleFilingInvoice: FilingCandidate = {
  kind: 'filing',
  input: {
    sourceChannel: 'scan',
    originalMetadata: { senderIdentity: 'scanner-1', timestamp: '2026-05-03T09:00:00Z' }
  },
  detectedEntities: [],
  detectedKeywords: [{ keyword: 'חשבונית', domain: 'general' }],
  confidenceScore: { score: 0.9, isHighConfidence: true },
  suggestedReason: 'Routine invoice, no special anomalies detected.',
  boundary: defaultBoundary
};

export const penaltyLetterTask: TaskCandidate = {
  kind: 'task',
  suggestedAction: 'Cancel penalty',
  input: {
    sourceChannel: 'email',
    originalMetadata: { senderIdentity: 'tax_authority@gov.il', timestamp: '2026-05-03T09:01:00Z' }
  },
  detectedEntities: [],
  detectedKeywords: [{ keyword: 'קנס', domain: 'tax' }],
  confidenceScore: { score: 0.95, isHighConfidence: true },
  suggestedReason: 'Contains penalty keywords requiring urgent action.',
  boundary: defaultBoundary
};

export const vatProcessDoc: ProcessCandidate = {
  kind: 'process',
  processDomain: 'VAT',
  input: {
    sourceChannel: 'portal',
    originalMetadata: { senderIdentity: 'client_portal', timestamp: '2026-05-03T09:02:00Z' }
  },
  detectedEntities: [{ entityId: 'c-123', name: 'Client A', confidence: 0.99 }],
  detectedKeywords: [{ keyword: 'מע"מ', domain: 'VAT' }],
  confidenceScore: { score: 0.98, isHighConfidence: true },
  suggestedReason: 'VAT document identified for monthly process.',
  boundary: defaultBoundary
};

export const dimaEvidence: CaseEvidenceCandidate = {
  kind: 'case_evidence',
  targetCaseId: 'dima-rodnitski',
  input: {
    sourceChannel: 'drive',
    originalMetadata: { senderIdentity: 'dima_drive', timestamp: '2026-05-03T09:03:00Z' }
  },
  detectedEntities: [{ entityId: 'subj-dima-rodnitski', name: 'דימה רודניצקי', confidence: 1.0 }],
  detectedKeywords: [{ keyword: 'פרוטוקול ועדה', domain: 'appeal' }],
  confidenceScore: { score: 0.99, isHighConfidence: true },
  suggestedReason: 'Matched Dima Rodnitski ID and appeal keywords.',
  boundary: defaultBoundary
};

export const tsilaEvidence: CaseEvidenceCandidate = {
  kind: 'case_evidence',
  targetCaseId: 'tsila-shvartz',
  input: {
    sourceChannel: 'scan',
    originalMetadata: { senderIdentity: 'scanner-1', timestamp: '2026-05-03T09:04:00Z' }
  },
  detectedEntities: [{ entityId: 'subj-tsila-shvartz', name: 'צילה שוורץ', confidence: 1.0 }],
  detectedKeywords: [{ keyword: 'אקדמיה', domain: 'academic' }],
  confidenceScore: { score: 0.97, isHighConfidence: true },
  suggestedReason: 'Matched Tsila Shvartz academic documents.',
  boundary: defaultBoundary
};

export const expertOpinionLearning: LearningCandidate = {
  kind: 'learning',
  learningDomain: 'expert_opinion',
  input: {
    sourceChannel: 'email',
    originalMetadata: { senderIdentity: 'legal_updates@law.il', timestamp: '2026-05-03T09:05:00Z' }
  },
  detectedEntities: [],
  detectedKeywords: [{ keyword: 'פסק דין', domain: 'legal' }, { keyword: 'הלכה', domain: 'legal' }],
  confidenceScore: { score: 0.88, isHighConfidence: true },
  suggestedReason: 'Legal precedent detected, candidate for Brain learning.',
  boundary: defaultBoundary
};

export const unknownScan: UnknownCandidate = {
  kind: 'unknown',
  input: {
    sourceChannel: 'scan',
    originalMetadata: { senderIdentity: 'scanner-2', timestamp: '2026-05-03T09:06:00Z' }
  },
  detectedEntities: [],
  detectedKeywords: [],
  confidenceScore: { score: 0.2, isHighConfidence: false },
  suggestedReason: 'Low confidence matching, requires manual triage.',
  boundary: defaultBoundary
};

export const ALL_SEED_SUGGESTIONS: UniversalRoutingSuggestion[] = [
  simpleFilingInvoice,
  penaltyLetterTask,
  vatProcessDoc,
  dimaEvidence,
  tsilaEvidence,
  expertOpinionLearning,
  unknownScan
];
