/* ============================================
   FILE: metadata-adapter-registry.ts
   PURPOSE: Static provider-agnostic metadata adapter registry for Unified Intake.
   DEPENDENCIES: Stage 5A/5B/5C metadata mappers and adapter contracts
   EXPORTS: Static metadata adapters and registry
   ============================================ */

// #region Imports
import type { DriveFileMetadata } from './drive/drive-metadata-types';
import {
  DRIVE_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  mapDriveMetadataToUnifiedIntakeSource,
} from './drive/drive-metadata-to-unified-intake-source';
import type { GmailUnifiedIntakeSourceMetadata } from './gmail/gmail-metadata-to-unified-intake-source';
import {
  GMAIL_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  mapGmailMetadataToUnifiedIntakeSource,
} from './gmail/gmail-metadata-to-unified-intake-source';
import type { ScanFileMetadata } from './scans/scan-metadata-types';
import {
  SCAN_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  mapScanMetadataToUnifiedIntakeSource,
} from './scans/scan-metadata-to-unified-intake-source';
import type {
  MetadataAdapterCapabilities,
  MetadataSourceAdapter,
} from './metadata-adapter-types';
// #endregion

// #region Capabilities
/** Locked disabled runtime capabilities for all Stage 5D metadata adapters. */
export const METADATA_ONLY_DISABLED_CAPABILITIES: MetadataAdapterCapabilities = {
  liveConnection: false,
  oauth: false,
  apiAccess: false,
  fileSystemAccess: false,
  contentRead: false,
  createsOperationalRecords: false,
  persists: false,
};
// #endregion

// #region Adapters
/** Static Gmail metadata adapter wrapping the Stage 5A mapper. */
export const GMAIL_METADATA_ADAPTER: MetadataSourceAdapter<GmailUnifiedIntakeSourceMetadata> = {
  adapterId: 'gmail_metadata_adapter',
  providerKind: 'gmail_metadata',
  sourceType: 'email',
  displayName: 'Gmail metadata adapter',
  mode: 'metadata_only',
  boundaryFlags: GMAIL_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  capabilities: METADATA_ONLY_DISABLED_CAPABILITIES,
  mapMetadataToUnifiedSource: (metadata) =>
    mapGmailMetadataToUnifiedIntakeSource({ message: metadata }),
};

/** Static Drive metadata adapter wrapping the Stage 5B mapper. */
export const DRIVE_METADATA_ADAPTER: MetadataSourceAdapter<DriveFileMetadata> = {
  adapterId: 'drive_metadata_adapter',
  providerKind: 'drive_metadata',
  sourceType: 'drive',
  displayName: 'Drive metadata adapter',
  mode: 'metadata_only',
  boundaryFlags: DRIVE_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  capabilities: METADATA_ONLY_DISABLED_CAPABILITIES,
  mapMetadataToUnifiedSource: (metadata) =>
    mapDriveMetadataToUnifiedIntakeSource({ file: metadata }),
};

/** Static Scans metadata adapter wrapping the Stage 5C mapper. */
export const SCANS_METADATA_ADAPTER: MetadataSourceAdapter<ScanFileMetadata> = {
  adapterId: 'scans_metadata_adapter',
  providerKind: 'scans_metadata',
  sourceType: 'scan',
  displayName: 'Scans metadata adapter',
  mode: 'metadata_only',
  boundaryFlags: SCAN_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  capabilities: METADATA_ONLY_DISABLED_CAPABILITIES,
  mapMetadataToUnifiedSource: (metadata) =>
    mapScanMetadataToUnifiedIntakeSource({ scan: metadata }),
};

/** Static Stage 5D metadata adapter registry. */
export const METADATA_ADAPTER_REGISTRY = [
  GMAIL_METADATA_ADAPTER,
  DRIVE_METADATA_ADAPTER,
  SCANS_METADATA_ADAPTER,
] as const;
// #endregion
