/* ============================================
   FILE: protocol-metadata-types.ts
   PURPOSE: Metadata-only Robium Protokol contracts for Stage 6D-1 Unified Intake mapping.
   DEPENDENCIES: None
   EXPORTS: Protocol provider metadata contracts
   ============================================ */

// #region Provider Identity
/** Robium Protokol provider identity used only inside Protocol-specific metadata. */
export type ProtocolMetadataProvider = 'robium_protokol';
// #endregion

// #region Types
/** Recording source metadata for a protocol record. */
export type ProtocolRecordingSource = 'phone' | 'zoom' | 'in_person' | 'teams';

/** Participant metadata for a protocol record. */
export interface ProtocolParticipantMetadata {
  /** Display name metadata. */
  name: string;
  /** Optional role metadata. */
  role?: string;
}

/** Shared metadata-only protocol record fields. */
interface ProtocolRecordMetadataBase {
  /** Provider identity metadata. */
  provider: ProtocolMetadataProvider;
  /** Synthetic or external protocol record id. */
  protocolId: string;
  /** Participant metadata only. */
  participants: readonly ProtocolParticipantMetadata[];
  /** Duration metadata in minutes. */
  durationMinutes: number;
  /** Recording source metadata. */
  recordingSource: ProtocolRecordingSource;
  /** Count of extracted items only. */
  extractedItemCount: number;
  /** Language code metadata. */
  languageCode: string;
}

/** Protocol record variant with meeting title metadata. */
interface ProtocolMeetingTitleMetadata {
  /** Meeting title metadata. */
  meetingTitle: string;
  /** Optional subject metadata. */
  subject?: string;
}

/** Protocol record variant with subject metadata. */
interface ProtocolSubjectMetadata {
  /** Optional meeting title metadata. */
  meetingTitle?: string;
  /** Subject metadata. */
  subject: string;
}

/** Protocol record variant with meeting date metadata. */
interface ProtocolMeetingDateMetadata {
  /** Meeting date metadata. */
  meetingDate: string;
  /** Optional timestamp metadata. */
  timestamp?: string;
}

/** Protocol record variant with timestamp metadata. */
interface ProtocolTimestampMetadata {
  /** Optional meeting date metadata. */
  meetingDate?: string;
  /** Timestamp metadata. */
  timestamp: string;
}

/** Metadata-only protocol record contract for Unified Intake source previews. */
export type ProtocolRecordMetadata =
  ProtocolRecordMetadataBase &
  (ProtocolMeetingTitleMetadata | ProtocolSubjectMetadata) &
  (ProtocolMeetingDateMetadata | ProtocolTimestampMetadata);
// #endregion
