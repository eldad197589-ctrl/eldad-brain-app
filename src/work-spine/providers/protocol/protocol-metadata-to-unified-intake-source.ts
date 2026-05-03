/* ============================================
   FILE: protocol-metadata-to-unified-intake-source.ts
   PURPOSE: Pure mapper from protocol metadata to Unified Intake source previews.
   DEPENDENCIES: Unified Intake source contracts and protocol metadata contracts
   EXPORTS: Protocol metadata source mapper and locked local preview boundary flags
   ============================================ */

// #region Imports
import type {
  IntakeBoundaryFlags,
  IntakePayloadSummary,
  UnifiedIntakeSource,
} from '../../intake/unified-intake-source-types';
import type { ProtocolRecordMetadata } from './protocol-metadata-types';
// #endregion

// #region Types
/** Input for mapping protocol record metadata into a Unified Intake source preview. */
export interface ProtocolMetadataToUnifiedIntakeSourceInput {
  /** Protocol record metadata with counts and meeting metadata only. */
  record: ProtocolRecordMetadata;
}

/** Protocol-specific payload summary metadata for Unified Intake previews. */
export interface ProtocolIntakePayloadSummary extends IntakePayloadSummary {
  /** Duration metadata in minutes. */
  durationMinutes: number;
  /** Number of participant metadata records. */
  participantCount: number;
  /** Count of extracted items only. */
  extractedItemCount: number;
  /** Recording source metadata. */
  recordingSource: ProtocolRecordMetadata['recordingSource'];
  /** Language code metadata. */
  languageCode: string;
}
// #endregion

// #region Constants
/** Locked local-only boundary flags for protocol metadata source previews. */
export const PROTOCOL_UNIFIED_INTAKE_BOUNDARY_FLAGS: IntakeBoundaryFlags = {
  allowedMode: 'local_preview_only',
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  requiresEldadApproval: true,
  operationalActionBlocked: true,
};
// #endregion

// #region Helpers
const getProtocolTimestamp = (record: ProtocolRecordMetadata): string =>
  record.meetingDate ?? record.timestamp ?? 'unknown_protocol_timestamp';

const getProtocolTitle = (record: ProtocolRecordMetadata): string =>
  record.meetingTitle ?? record.subject ?? `protocol-${record.protocolId}`;

const summarizeParticipants = (record: ProtocolRecordMetadata): string => {
  const namedParticipants = record.participants
    .map((participant) => participant.name.trim())
    .filter((name) => name.length > 0);

  if (namedParticipants.length === 0) {
    return 'Protocol record';
  }

  const visibleNames = namedParticipants.slice(0, 2).join(', ');
  const remainingCount = namedParticipants.length - 2;

  return remainingCount > 0
    ? `${visibleNames} + ${remainingCount} more`
    : visibleNames;
};

const buildProtocolSnippet = (record: ProtocolRecordMetadata): string =>
  [
    `Participants: ${record.participants.length}`,
    `Duration: ${record.durationMinutes} minutes`,
    `Items: ${record.extractedItemCount}`,
    `Source: ${record.recordingSource}`,
    `Language: ${record.languageCode}`,
  ].join(' | ');

const buildProtocolPayloadSummary = (
  record: ProtocolRecordMetadata,
): ProtocolIntakePayloadSummary => ({
  fileType: 'protocol/metadata',
  snippet: buildProtocolSnippet(record),
  durationMinutes: record.durationMinutes,
  participantCount: record.participants.length,
  extractedItemCount: record.extractedItemCount,
  recordingSource: record.recordingSource,
  languageCode: record.languageCode,
});
// #endregion

// #region Mapper
/**
 * Maps safe protocol record metadata into the committed Unified Intake source model.
 */
export const mapProtocolMetadataToUnifiedIntakeSource = ({
  record,
}: ProtocolMetadataToUnifiedIntakeSourceInput): UnifiedIntakeSource => ({
  sourceId: `protocol:${record.protocolId}`,
  sourceType: 'protocol',
  senderIdentity: summarizeParticipants(record),
  timestamp: getProtocolTimestamp(record),
  subjectOrFilename: getProtocolTitle(record),
  payloadSummary: buildProtocolPayloadSummary(record),
  boundaryFlags: PROTOCOL_UNIFIED_INTAKE_BOUNDARY_FLAGS,
});
// #endregion
