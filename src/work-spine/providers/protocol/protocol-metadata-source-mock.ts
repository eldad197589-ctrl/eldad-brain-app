/* ============================================
   FILE: protocol-metadata-source-mock.ts
   PURPOSE: Static protocol metadata fixtures for Stage 6D-1 Unified Intake mapping.
   DEPENDENCIES: Protocol metadata contracts
   EXPORTS: Static protocol metadata mocks
   ============================================ */

// #region Imports
import type { ProtocolRecordMetadata } from './protocol-metadata-types';
// #endregion

// #region Static Mocks
/** Static metadata-only protocol records with counts and meeting metadata only. */
export const STATIC_PROTOCOL_METADATA_MOCKS: readonly ProtocolRecordMetadata[] = [
  {
    provider: 'robium_protokol',
    protocolId: 'protocol-stage6d1-founders-001',
    meetingTitle: 'Robium founders operating review',
    meetingDate: '2026-05-03T08:30:00.000Z',
    participants: [
      { name: 'Eldad', role: 'founder' },
      { name: 'Robium team', role: 'operations' },
    ],
    durationMinutes: 42,
    recordingSource: 'zoom',
    extractedItemCount: 5,
    languageCode: 'en',
  },
  {
    provider: 'robium_protokol',
    protocolId: 'protocol-stage6d1-client-call-002',
    subject: 'שיחת לקוח - בדיקת סטטוס',
    timestamp: '2026-05-03T10:15:00.000Z',
    participants: [
      { name: 'Eldad', role: 'advisor' },
      { name: 'Client contact', role: 'client' },
    ],
    durationMinutes: 18,
    recordingSource: 'phone',
    extractedItemCount: 3,
    languageCode: 'he',
  },
  {
    provider: 'robium_protokol',
    protocolId: 'protocol-stage6d1-internal-review-003',
    meetingTitle: 'Internal review and responsibility distribution',
    meetingDate: '2026-05-03T12:45:00.000Z',
    participants: [
      { name: 'Eldad', role: 'reviewer' },
      { name: 'Office coordinator', role: 'coordination' },
      { name: 'Research assistant', role: 'research' },
    ],
    durationMinutes: 27,
    recordingSource: 'in_person',
    extractedItemCount: 7,
    languageCode: 'en',
  },
] as const;
// #endregion
