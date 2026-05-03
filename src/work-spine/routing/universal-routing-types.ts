export type RoutingSourceChannel = 'scan' | 'email' | 'drive' | 'portal' | 'manual';
export type RoutingCandidateKind = 'filing' | 'task' | 'process' | 'case_evidence' | 'learning' | 'unknown';

export interface RoutingOriginalMetadata {
  senderIdentity: string;
  timestamp: string;
  rawSubject?: string;
}

export interface RoutingDetectedEntity {
  entityId: string;
  name: string;
  confidence: number;
}

export interface RoutingDetectedKeyword {
  keyword: string;
  domain: string;
}

export interface RoutingConfidence {
  score: number; // 0.0 to 1.0
  isHighConfidence: boolean;
}

export interface UniversalRoutingInput {
  sourceChannel: RoutingSourceChannel;
  originalMetadata: RoutingOriginalMetadata;
  rawText?: string;
  ocrText?: string;
}

export interface RoutingApprovalBoundary {
  allowedMode: 'local_preview_only';
  canCreateWorkItem: false;
  canCreateMatter: false;
  canCreateDocumentRef: false;
  requiresEldadApproval: true;
}

export interface BaseCandidate {
  kind: RoutingCandidateKind;
  input: UniversalRoutingInput;
  detectedEntities: RoutingDetectedEntity[];
  detectedKeywords: RoutingDetectedKeyword[];
  confidenceScore: RoutingConfidence;
  suggestedReason: string;
  boundary: RoutingApprovalBoundary;
}

export interface FilingCandidate extends BaseCandidate {
  kind: 'filing';
}

export interface TaskCandidate extends BaseCandidate {
  kind: 'task';
  suggestedAction: string;
}

export interface ProcessCandidate extends BaseCandidate {
  kind: 'process';
  processDomain: string;
}

export interface CaseEvidenceCandidate extends BaseCandidate {
  kind: 'case_evidence';
  targetCaseId: string;
}

export interface LearningCandidate extends BaseCandidate {
  kind: 'learning';
  learningDomain: string;
}

export interface UnknownCandidate extends BaseCandidate {
  kind: 'unknown';
}

export type UniversalRoutingSuggestion =
  | FilingCandidate
  | TaskCandidate
  | ProcessCandidate
  | CaseEvidenceCandidate
  | LearningCandidate
  | UnknownCandidate;
