/* ====
   FILE: evidence-spine-seed.ts
   PURPOSE: Static Stage 13 Evidence Spine mock evidence items.
   DEPENDENCIES: Evidence Spine contracts and policies
   EXPORTS: Static Evidence Spine mock records
   ==== */

// #region Imports
import {
  EVIDENCE_BOUNDARY_FLAGS,
} from './evidence-spine-types';
import type {
  EvidenceSpineItem,
  OfficialFolderRef,
  SourceTrace,
} from './evidence-spine-types';
// #endregion

// #region Shared Fixtures
const sharedFolderRef: OfficialFolderRef = {
  officialFolderRefId: 'official-folder-ref-client-case-001',
  clientCaseKey: 'client-case-001',
  folderLabel: 'Client Case 001 - official source folder',
  assignmentMode: 'metadata_only',
  resolvedToRealLocation: false,
};

const scanTrace: SourceTrace = {
  sourceTraceId: 'source-trace-scan-manifest-001',
  sourceIntakeId: 'scan:manifest-entry-invoice-001',
  sourceKind: 'scan',
  capturedAt: '2026-05-03T08:00:00.000Z',
  metadataOnly: true,
};
// #endregion

// #region Static Evidence Items
/** Static Stage 13 Evidence Spine items with all file operations blocked. */
export const STATIC_EVIDENCE_SPINE_ITEMS: readonly EvidenceSpineItem[] = [
  {
    evidenceId: 'evidence-original-scan-invoice-001',
    displayName: 'Original scan evidence candidate',
    sourceIntakeId: 'scan:manifest-entry-invoice-001',
    sourceTrace: scanTrace,
    currentStatus: 'candidate',
    confidenceLevel: 0.86,
    officialFolderRef: sharedFolderRef,
    versionLineage: [
      {
        lineageId: 'lineage-original-scan-invoice-001',
        evidenceId: 'evidence-original-scan-invoice-001',
        relation: 'original',
        lineageNote: 'Original scan candidate from static manifest metadata.',
      },
    ],
    isOriginal: true,
    approvalStatus: 'pending_eldad',
    boundaryFlags: EVIDENCE_BOUNDARY_FLAGS,
  },
  {
    evidenceId: 'evidence-reviewed-version-001',
    displayName: 'Derived reviewed evidence version',
    sourceIntakeId: 'scan:manifest-entry-invoice-001',
    sourceTrace: scanTrace,
    currentStatus: 'verified',
    confidenceLevel: 0.92,
    officialFolderRef: sharedFolderRef,
    versionLineage: [
      {
        lineageId: 'lineage-reviewed-version-001',
        evidenceId: 'evidence-reviewed-version-001',
        relation: 'derived_from',
        sourceEvidenceId: 'evidence-original-scan-invoice-001',
        lineageNote: 'Reviewed metadata version derived from original evidence.',
      },
    ],
    isOriginal: false,
    approvalStatus: 'eldad_approved',
    boundaryFlags: EVIDENCE_BOUNDARY_FLAGS,
  },
  {
    evidenceId: 'evidence-superseded-version-001',
    displayName: 'Superseded evidence metadata version',
    sourceIntakeId: 'scan:manifest-entry-invoice-001',
    sourceTrace: scanTrace,
    currentStatus: 'superseded',
    confidenceLevel: 0.75,
    officialFolderRef: sharedFolderRef,
    versionLineage: [
      {
        lineageId: 'lineage-superseded-version-001',
        evidenceId: 'evidence-superseded-version-001',
        relation: 'derived_from',
        sourceEvidenceId: 'evidence-original-scan-invoice-001',
        lineageNote: 'Earlier reviewed metadata version retained as superseded.',
      },
      {
        lineageId: 'lineage-superseded-by-reviewed-001',
        evidenceId: 'evidence-superseded-version-001',
        relation: 'superseded_by',
        replacementEvidenceId: 'evidence-reviewed-version-001',
        lineageNote: 'Superseded version points to the current reviewed version.',
      },
    ],
    isOriginal: false,
    approvalStatus: 'pending_eldad',
    boundaryFlags: EVIDENCE_BOUNDARY_FLAGS,
  },
  {
    evidenceId: 'evidence-low-confidence-scan-001',
    displayName: 'Low-confidence evidence candidate',
    sourceIntakeId: 'scan:manifest-entry-low-confidence-003',
    sourceTrace: {
      sourceTraceId: 'source-trace-scan-manifest-low-confidence-003',
      sourceIntakeId: 'scan:manifest-entry-low-confidence-003',
      sourceKind: 'scan',
      capturedAt: '2026-05-03T08:10:00.000Z',
      metadataOnly: true,
    },
    currentStatus: 'candidate',
    confidenceLevel: 0.42,
    officialFolderRef: {
      officialFolderRefId: 'official-folder-ref-client-case-002',
      clientCaseKey: 'client-case-002',
      folderLabel: 'Client Case 002 - official source folder',
      assignmentMode: 'metadata_only',
      resolvedToRealLocation: false,
    },
    versionLineage: [
      {
        lineageId: 'lineage-low-confidence-scan-001',
        evidenceId: 'evidence-low-confidence-scan-001',
        relation: 'original',
        lineageNote: 'Low-confidence static evidence candidate remains unapproved.',
      },
    ],
    isOriginal: true,
    approvalStatus: 'unapproved',
    boundaryFlags: EVIDENCE_BOUNDARY_FLAGS,
  },
] as const;
// #endregion
