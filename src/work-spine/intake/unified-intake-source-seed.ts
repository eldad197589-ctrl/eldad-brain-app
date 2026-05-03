import { UnifiedIntakeSource, IntakeBoundaryFlags } from './unified-intake-source-types';

export const INTAKE_BOUNDARY_LOCKED: IntakeBoundaryFlags = {
  allowedMode: 'local_preview_only',
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  requiresEldadApproval: true,
  operationalActionBlocked: true,
};

export const MOCK_SOURCE_EMAIL: UnifiedIntakeSource = {
  sourceId: 'src-email-101',
  sourceType: 'email',
  senderIdentity: 'client@example.com',
  timestamp: '2026-05-03T10:00:00Z',
  subjectOrFilename: 'Invoice for April',
  payloadSummary: { fileType: 'application/pdf', attachmentCount: 1, snippet: 'Please find attached...' },
  boundaryFlags: INTAKE_BOUNDARY_LOCKED
};

export const MOCK_SOURCE_DRIVE: UnifiedIntakeSource = {
  sourceId: 'src-drive-202',
  sourceType: 'drive',
  senderIdentity: 'shared_folder_user',
  timestamp: '2026-05-03T10:05:00Z',
  subjectOrFilename: 'Bank_Statement_Q1.pdf',
  payloadSummary: { fileType: 'application/pdf', sizeBytes: 1048576 },
  boundaryFlags: INTAKE_BOUNDARY_LOCKED
};

export const MOCK_SOURCE_SCAN: UnifiedIntakeSource = {
  sourceId: 'src-scan-303',
  sourceType: 'scan',
  senderIdentity: 'office_scanner_1',
  timestamp: '2026-05-03T10:10:00Z',
  subjectOrFilename: 'Scan_20260503_1010.pdf',
  payloadSummary: { fileType: 'application/pdf', sizeBytes: 500000 },
  boundaryFlags: INTAKE_BOUNDARY_LOCKED
};

export const MOCK_SOURCE_MANUAL_UPLOAD: UnifiedIntakeSource = {
  sourceId: 'src-up-404',
  sourceType: 'manual_upload',
  senderIdentity: 'eldad_dashboard',
  timestamp: '2026-05-03T10:15:00Z',
  subjectOrFilename: 'Tax_Circular_12.pdf',
  payloadSummary: { fileType: 'application/pdf', sizeBytes: 250000 },
  boundaryFlags: INTAKE_BOUNDARY_LOCKED
};

export const MOCK_SOURCE_MANUAL_TEXT: UnifiedIntakeSource = {
  sourceId: 'src-txt-505',
  sourceType: 'manual_text',
  senderIdentity: 'eldad_dashboard',
  timestamp: '2026-05-03T10:20:00Z',
  subjectOrFilename: 'Quick Note',
  payloadSummary: { fileType: 'text/plain', snippet: 'Called client to verify VAT...' },
  boundaryFlags: INTAKE_BOUNDARY_LOCKED
};

export const MOCK_SOURCE_UNKNOWN: UnifiedIntakeSource = {
  sourceId: 'src-unk-606',
  sourceType: 'unknown',
  senderIdentity: 'unknown_origin',
  timestamp: '2026-05-03T10:25:00Z',
  subjectOrFilename: 'untitled.dat',
  payloadSummary: { fileType: 'application/octet-stream', sizeBytes: 1024 },
  boundaryFlags: INTAKE_BOUNDARY_LOCKED
};

export const ALL_INTAKE_SOURCES: UnifiedIntakeSource[] = [
  MOCK_SOURCE_EMAIL,
  MOCK_SOURCE_DRIVE,
  MOCK_SOURCE_SCAN,
  MOCK_SOURCE_MANUAL_UPLOAD,
  MOCK_SOURCE_MANUAL_TEXT,
  MOCK_SOURCE_UNKNOWN
];
