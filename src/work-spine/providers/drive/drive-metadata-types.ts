/* ============================================
   FILE: drive-metadata-types.ts
   PURPOSE: Pure Google Drive metadata contracts for Stage 5B Unified Intake mapping.
   DEPENDENCIES: None
   EXPORTS: Drive provider metadata contracts
   ============================================ */

// #region Provider Identity
/** Google Drive provider identity used only inside Drive-specific metadata. */
export type DriveMetadataProvider = 'google_drive';
// #endregion

// #region Types
/** Metadata-only Google Drive file contract for Unified Intake source previews. */
export interface DriveFileMetadata {
  /** Provider identity metadata. */
  provider: DriveMetadataProvider;
  /** Google Drive file id. */
  fileId: string;
  /** Google Drive file name. */
  fileName: string;
  /** Google Drive MIME type metadata. */
  mimeType: string;
  /** Created timestamp from Drive metadata. */
  createdTime: string;
  /** Modified timestamp from Drive metadata, when available. */
  modifiedTime?: string;
  /** File owner identities. */
  owners: readonly string[];
  /** Last modifying user identity, when available. */
  lastModifyingUser?: string;
  /** File size in bytes, when Drive metadata exposes it. */
  sizeBytes?: number;
  /** Parent folder ids as metadata only. */
  parentFolderIds: readonly string[];
  /** Parent folder names as metadata only. */
  parentFolderNames: readonly string[];
  /** View/provenance URL metadata only, never a download/export URL. */
  provenanceUrl?: string;
  /** Timestamp when this static metadata snapshot was captured. */
  metadataCapturedAt: string;
}
// #endregion
