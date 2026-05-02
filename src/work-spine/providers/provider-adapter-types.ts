/* ============================================
   FILE: provider-adapter-types.ts
   PURPOSE: Pure type contracts for inbound read-only provider adapters.
   DEPENDENCIES: Unified Intake registry types
   EXPORTS: Provider adapter, capability, scope, account, request, result, status, and failure contracts
   ============================================ */

// #region Imports
import type {
  EmailSourceMetadata,
  GoogleDriveSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
} from '../intake/unified-intake-registry';
// #endregion

// #region Provider Identity
export type EmailProviderKind = 'gmail' | 'outlook' | 'microsoft365' | 'imap' | 'exchange' | 'other';

export type DriveProviderKind = 'google_drive' | 'other_cloud_storage';

export type ProviderKind = EmailProviderKind | DriveProviderKind;

export type ProviderAdapterStatus = 'not_configured' | 'gated' | 'ready_read_only' | 'needs_reauthorization' | 'disabled' | 'error';

export type ProviderAdapterFailureReason =
  | 'not_configured'
  | 'missing_consent'
  | 'wrong_account'
  | 'scope_mismatch'
  | 'credential_unavailable'
  | 'provider_unavailable'
  | 'read_denied'
  | 'disabled_by_policy';
// #endregion

// #region Capabilities And Scopes
export interface ProviderCapabilityDescriptor {
  readonly canReadMetadata: true;
  readonly canReadRawContent: false;
  readonly canSend: false;
  readonly canDelete: false;
  readonly canArchive: false;
  readonly canModifyLabels: false;
  readonly canUpload: false;
  readonly canMove: false;
  readonly canRename: false;
}

export interface ProviderForbiddenActions {
  readonly send: false;
  readonly delete: false;
  readonly archive: false;
  readonly modifyLabels: false;
  readonly upload: false;
  readonly move: false;
  readonly rename: false;
  readonly readRawContent: false;
}

export interface ProviderScopeAllowlist {
  readonly provider: ProviderKind;
  readonly readOnlyMetadataScopes: readonly string[];
  readonly forbiddenActions: ProviderForbiddenActions;
  readonly capability: ProviderCapabilityDescriptor;
}
// #endregion

// #region Account And Read Contracts
export interface ProviderAccountMetadata {
  readonly provider: ProviderKind;
  readonly providerAccountId: string;
  readonly accountDisplayName?: string;
  readonly accountEmail?: string;
  readonly userId: string;
  readonly officeWorkspaceId: string;
}

export interface ProviderReadMetadataRequest {
  readonly provider: ProviderKind;
  readonly account: ProviderAccountMetadata;
  readonly requestedScopes: readonly string[];
  readonly runId: string;
  readonly since?: string;
  readonly limit?: number;
}

export interface ProviderReadMetadataResult<TSourceMetadata extends EmailSourceMetadata | GoogleDriveSourceMetadata> {
  readonly provider: ProviderKind;
  readonly account: ProviderAccountMetadata;
  readonly runId: string;
  readonly candidates: readonly UnifiedIntakeCandidate<TSourceMetadata>[];
  readonly evidenceRefs: readonly UnifiedIntakeEvidenceRef[];
  readonly status: ProviderAdapterStatus;
  readonly failureReason?: ProviderAdapterFailureReason;
}
// #endregion

// #region Adapter Interfaces
export interface EmailProviderAdapter {
  readonly provider: EmailProviderKind;
  readonly sourceType: 'email';
  readonly status: ProviderAdapterStatus;
  readonly scopes: ProviderScopeAllowlist;
  readonly capabilities: ProviderCapabilityDescriptor;
}

export interface DriveProviderAdapter {
  readonly provider: DriveProviderKind;
  readonly sourceType: 'google_drive';
  readonly status: ProviderAdapterStatus;
  readonly scopes: ProviderScopeAllowlist;
  readonly capabilities: ProviderCapabilityDescriptor;
}
// #endregion
