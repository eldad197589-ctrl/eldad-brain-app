/* ============================================
   FILE: metadata-adapter-types.ts
   PURPOSE: Provider-agnostic metadata-only adapter contracts for Unified Intake.
   DEPENDENCIES: Unified Intake source contracts
   EXPORTS: Metadata adapter contracts
   ============================================ */

// #region Imports
import type {
  IntakeBoundaryFlags,
  IntakeSourceType,
  UnifiedIntakeSource,
} from '../intake/unified-intake-source-types';
// #endregion

// #region Adapter Identity
/** Metadata-only adapter ids allowed in the Stage 5D static registry. */
export type MetadataAdapterId =
  | 'gmail_metadata_adapter'
  | 'drive_metadata_adapter'
  | 'scans_metadata_adapter';

/** Metadata provider kinds allowed in the Stage 5D static registry. */
export type MetadataProviderKind =
  | 'gmail_metadata'
  | 'drive_metadata'
  | 'scans_metadata';

/** Runtime mode for Stage 5D metadata adapters. */
export type MetadataAdapterMode = 'metadata_only';

/** Normalized source types produced by Stage 5D metadata adapters. */
export type MetadataAdapterSourceType = Extract<
  IntakeSourceType,
  'email' | 'drive' | 'scan'
>;
// #endregion

// #region Capabilities
/** Explicit disabled capabilities for metadata-only adapter boundaries. */
export interface MetadataAdapterCapabilities {
  /** No live provider session is available. */
  liveConnection: false;
  /** No authorization flow is available. */
  oauth: false;
  /** No provider API access is available. */
  apiAccess: false;
  /** No filesystem access is available. */
  fileSystemAccess: false;
  /** No raw content reading is available. */
  contentRead: false;
  /** No operational records can be produced. */
  createsOperationalRecords: false;
  /** No persistence can occur. */
  persists: false;
}
// #endregion

// #region Adapter Contract
/** Provider-agnostic metadata adapter contract for static Unified Intake mapping. */
export interface MetadataSourceAdapter<ProviderMetadata> {
  /** Stable adapter id. */
  adapterId: MetadataAdapterId;
  /** Provider kind metadata for the adapter descriptor only. */
  providerKind: MetadataProviderKind;
  /** Normalized Unified Intake source type produced by this adapter. */
  sourceType: MetadataAdapterSourceType;
  /** Human-readable adapter label. */
  displayName: string;
  /** Stage 5D mode is metadata-only. */
  mode: MetadataAdapterMode;
  /** Locked local-only boundary flags. */
  boundaryFlags: IntakeBoundaryFlags;
  /** Explicit disabled runtime capabilities. */
  capabilities: MetadataAdapterCapabilities;
  /** Maps provider-specific metadata into a Unified Intake source preview. */
  mapMetadataToUnifiedSource: (
    metadata: ProviderMetadata,
  ) => UnifiedIntakeSource;
}
// #endregion
