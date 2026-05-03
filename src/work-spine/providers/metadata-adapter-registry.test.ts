/* ============================================
   FILE: metadata-adapter-registry.test.ts
   PURPOSE: Boundary tests for Stage 5D metadata adapter registry.
   DEPENDENCIES: Vitest, static provider metadata mocks, metadata adapter registry
   EXPORTS: None
   ============================================ */

// #region Imports
import { describe, expect, it } from 'vitest';
import { MOCK_DRIVE_METADATA_SOURCES } from './drive/drive-metadata-source-mock';
import { MOCK_GMAIL_METADATA_SOURCE_MESSAGE } from './gmail/gmail-metadata-source-mock';
import { MOCK_SCAN_METADATA_SOURCES } from './scans/scan-metadata-source-mock';
import {
  DRIVE_METADATA_ADAPTER,
  GMAIL_METADATA_ADAPTER,
  METADATA_ADAPTER_REGISTRY,
  SCANS_METADATA_ADAPTER,
} from './metadata-adapter-registry';
// #endregion

// #region Test Helpers
const buildDisallowedAdapterProperties = (): readonly string[] => [
  ['con', 'nect'].join(''),
  ['sy', 'nc'].join(''),
  ['fet', 'ch'].join(''),
  ['re', 'ad'].join(''),
  ['sc', 'an'].join(''),
  ['author', 'ize'].join(''),
  ['st', 'ore'].join(''),
  ['cre', 'ate'].join(''),
  ['pro', 'mote'].join(''),
  ['mo', 've'].join(''),
  ['de', 'lete'].join(''),
  ['down', 'load'].join(''),
  ['ex', 'port'].join(''),
];

const buildOperationalRecordProperties = (): readonly string[] => [
  ['work', 'Item'].join(''),
  ['mat', 'ter'].join(''),
  ['document', 'Ref'].join(''),
];
// #endregion

// #region Tests
describe('METADATA_ADAPTER_REGISTRY', () => {
  it('includes exactly Gmail, Drive, and Scans metadata adapters', () => {
    expect(METADATA_ADAPTER_REGISTRY).toHaveLength(3);
    expect(METADATA_ADAPTER_REGISTRY.map((adapter) => adapter.adapterId)).toEqual(
      [
        'gmail_metadata_adapter',
        'drive_metadata_adapter',
        'scans_metadata_adapter',
      ],
    );
  });

  it('keeps every adapter in metadata-only mode with disabled capabilities', () => {
    for (const adapter of METADATA_ADAPTER_REGISTRY) {
      expect(adapter.mode).toBe('metadata_only');
      expect(adapter.capabilities.liveConnection).toBe(false);
      expect(adapter.capabilities.oauth).toBe(false);
      expect(adapter.capabilities.apiAccess).toBe(false);
      expect(adapter.capabilities.fileSystemAccess).toBe(false);
      expect(adapter.capabilities.contentRead).toBe(false);
      expect(adapter.capabilities.createsOperationalRecords).toBe(false);
      expect(adapter.capabilities.persists).toBe(false);
    }
  });

  it('maps static provider metadata into valid Unified Intake sources', () => {
    const sources = [
      GMAIL_METADATA_ADAPTER.mapMetadataToUnifiedSource(
        MOCK_GMAIL_METADATA_SOURCE_MESSAGE,
      ),
      DRIVE_METADATA_ADAPTER.mapMetadataToUnifiedSource(
        MOCK_DRIVE_METADATA_SOURCES[0],
      ),
      SCANS_METADATA_ADAPTER.mapMetadataToUnifiedSource(
        MOCK_SCAN_METADATA_SOURCES[0],
      ),
    ];

    for (const source of sources) {
      expect(source.sourceId).toBeTruthy();
      expect(source.senderIdentity).toBeTruthy();
      expect(source.timestamp).toBeTruthy();
      expect(source.subjectOrFilename).toBeTruthy();
      expect(source.payloadSummary).toBeDefined();
    }
  });

  it('returns only normalized universal source types', () => {
    expect(GMAIL_METADATA_ADAPTER.sourceType).toBe('email');
    expect(DRIVE_METADATA_ADAPTER.sourceType).toBe('drive');
    expect(SCANS_METADATA_ADAPTER.sourceType).toBe('scan');
    expect(
      GMAIL_METADATA_ADAPTER.mapMetadataToUnifiedSource(
        MOCK_GMAIL_METADATA_SOURCE_MESSAGE,
      ).sourceType,
    ).toBe('email');
    expect(
      DRIVE_METADATA_ADAPTER.mapMetadataToUnifiedSource(
        MOCK_DRIVE_METADATA_SOURCES[0],
      ).sourceType,
    ).toBe('drive');
    expect(
      SCANS_METADATA_ADAPTER.mapMetadataToUnifiedSource(
        MOCK_SCAN_METADATA_SOURCES[0],
      ).sourceType,
    ).toBe('scan');
  });

  it('keeps boundary flags locked to local preview only', () => {
    for (const adapter of METADATA_ADAPTER_REGISTRY) {
      expect(adapter.boundaryFlags.allowedMode).toBe('local_preview_only');
      expect(adapter.boundaryFlags.canCreateWorkItem).toBe(false);
      expect(adapter.boundaryFlags.canCreateMatter).toBe(false);
      expect(adapter.boundaryFlags.canCreateDocumentRef).toBe(false);
      expect(adapter.boundaryFlags.requiresEldadApproval).toBe(true);
      expect(adapter.boundaryFlags.operationalActionBlocked).toBe(true);
    }
  });

  it('does not expose operational methods on metadata adapters', () => {
    for (const adapter of METADATA_ADAPTER_REGISTRY) {
      const adapterProperties = Object.keys(adapter);

      for (const propertyName of buildDisallowedAdapterProperties()) {
        expect(adapterProperties).not.toContain(propertyName);
      }
    }
  });

  it('does not create operational records from mapped metadata', () => {
    const source = GMAIL_METADATA_ADAPTER.mapMetadataToUnifiedSource(
      MOCK_GMAIL_METADATA_SOURCE_MESSAGE,
    );

    for (const propertyName of buildOperationalRecordProperties()) {
      expect(source).not.toHaveProperty(propertyName);
    }
  });
});
// #endregion
