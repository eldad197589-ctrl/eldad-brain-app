/* ============================================
   FILE: protocol-metadata-to-unified-intake-source.test.ts
   PURPOSE: Focused tests for Stage 6D-1 protocol metadata Unified Intake mapping.
   DEPENDENCIES: Vitest, protocol metadata mocks, protocol metadata mapper
   EXPORTS: Test suite
   ============================================ */

// #region Imports
import { describe, expect, it } from 'vitest';
import { STATIC_PROTOCOL_METADATA_MOCKS } from './protocol-metadata-source-mock';
import { mapProtocolMetadataToUnifiedIntakeSource } from './protocol-metadata-to-unified-intake-source';
import type { ProtocolRecordMetadata } from './protocol-metadata-types';
// #endregion

// #region Helpers
const forbiddenFieldNames = [
  'transcriptText',
  'fullTranscript',
  'rawAudio',
  'audioBuffer',
  'videoUrl',
  'extractedTasks',
  'extractedDecisions',
  'actionItems',
  'taskList',
  'decisions',
  'calendarItems',
  'workflowItems',
  'content',
  'body',
  'text',
  'rawContent',
  'base64',
  'buffer',
] as const;

const forbiddenOperationalNames = [
  'WorkItem',
  'Matter',
  'DocumentRef',
  'api',
  'webhook',
  'store',
  'persistence',
  'ui',
] as const;

const collectKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectKeys);
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, childValue]) => [
    key,
    ...collectKeys(childValue),
  ]);
};
// #endregion

// #region Tests
describe('Protocol metadata Unified Intake mapping', () => {
  it('maps static protocol metadata into valid UnifiedIntakeSource previews', () => {
    const sources = STATIC_PROTOCOL_METADATA_MOCKS.map((record) =>
      mapProtocolMetadataToUnifiedIntakeSource({ record }),
    );

    expect(sources).toHaveLength(3);

    sources.forEach((source, index) => {
      const record = STATIC_PROTOCOL_METADATA_MOCKS[index];
      expect(source.sourceId).toBe(`protocol:${record.protocolId}`);
      expect(source.sourceType).toBe('protocol');
      expect(source.timestamp).toBe(record.meetingDate ?? record.timestamp);
      expect(source.subjectOrFilename).toBe(record.meetingTitle ?? record.subject);
    });
  });

  it('keeps provider only inside ProtocolRecordMetadata', () => {
    const source = mapProtocolMetadataToUnifiedIntakeSource({
      record: STATIC_PROTOCOL_METADATA_MOCKS[0],
    });
    const serializedSource = JSON.stringify(source);
    const payloadSummary = source.payloadSummary as Record<string, unknown>;

    expect(STATIC_PROTOCOL_METADATA_MOCKS[0].provider).toBe('robium_protokol');
    expect(collectKeys(source)).not.toContain('provider');
    expect(serializedSource).not.toContain('robium_protokol');
    expect(payloadSummary.snippet).not.toContain('robium_protokol');
  });

  it('does not fall back to provider for sender identity', () => {
    const recordWithoutParticipants: ProtocolRecordMetadata = {
      provider: 'robium_protokol',
      protocolId: 'protocol-stage6d1-no-participants',
      meetingTitle: 'Protocol metadata fallback check',
      meetingDate: '2026-05-03T14:00:00.000Z',
      participants: [],
      durationMinutes: 9,
      recordingSource: 'teams',
      extractedItemCount: 1,
      languageCode: 'en',
    };

    const source = mapProtocolMetadataToUnifiedIntakeSource({
      record: recordWithoutParticipants,
    });

    expect(source.senderIdentity).toBe('Protocol record');
    expect(JSON.stringify(source)).not.toContain('robium_protokol');
  });

  it('keeps boundary flags locked to local preview only', () => {
    STATIC_PROTOCOL_METADATA_MOCKS.forEach((record) => {
      const boundaryFlags = mapProtocolMetadataToUnifiedIntakeSource({ record }).boundaryFlags;

      expect(boundaryFlags.allowedMode).toBe('local_preview_only');
      expect(boundaryFlags.canCreateWorkItem).toBe(false);
      expect(boundaryFlags.canCreateMatter).toBe(false);
      expect(boundaryFlags.canCreateDocumentRef).toBe(false);
      expect(boundaryFlags.requiresEldadApproval).toBe(true);
      expect(boundaryFlags.operationalActionBlocked).toBe(true);
    });
  });

  it('summarizes participants and extracted item count as metadata only', () => {
    const source = mapProtocolMetadataToUnifiedIntakeSource({
      record: STATIC_PROTOCOL_METADATA_MOCKS[2],
    });
    const payloadSummary = source.payloadSummary as Record<string, unknown>;

    expect(source.senderIdentity).toBe('Eldad, Office coordinator + 1 more');
    expect(payloadSummary.participantCount).toBe(3);
    expect(payloadSummary.extractedItemCount).toBe(7);
    expect(payloadSummary.durationMinutes).toBe(27);
    expect(payloadSummary.recordingSource).toBe('in_person');
    expect(payloadSummary.languageCode).toBe('en');
  });

  it('does not expose forbidden content or extracted operational fields', () => {
    const mappedSources = STATIC_PROTOCOL_METADATA_MOCKS.map((record) =>
      mapProtocolMetadataToUnifiedIntakeSource({ record }),
    );
    const keys = [
      ...collectKeys(STATIC_PROTOCOL_METADATA_MOCKS),
      ...collectKeys(mappedSources),
    ];

    forbiddenFieldNames.forEach((fieldName) => {
      expect(keys).not.toContain(fieldName);
    });
  });

  it('does not create operational record paths or live integration keys', () => {
    const mappedSources = STATIC_PROTOCOL_METADATA_MOCKS.map((record) =>
      mapProtocolMetadataToUnifiedIntakeSource({ record }),
    );
    const keys = [
      ...collectKeys(STATIC_PROTOCOL_METADATA_MOCKS),
      ...collectKeys(mappedSources),
    ];

    forbiddenOperationalNames.forEach((fieldName) => {
      expect(keys).not.toContain(fieldName);
    });
  });

  it('handles Hebrew and RTL meeting titles safely', () => {
    const clientCall = STATIC_PROTOCOL_METADATA_MOCKS.find((record) =>
      record.protocolId === 'protocol-stage6d1-client-call-002',
    );

    expect(clientCall).toBeDefined();

    const source = mapProtocolMetadataToUnifiedIntakeSource({
      record: clientCall ?? STATIC_PROTOCOL_METADATA_MOCKS[0],
    });

    expect(source.subjectOrFilename).toBe('שיחת לקוח - בדיקת סטטוס');
    expect(source.sourceType).toBe('protocol');
  });
});
// #endregion
