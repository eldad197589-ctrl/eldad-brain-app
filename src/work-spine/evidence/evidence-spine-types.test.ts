/* ====
   FILE: evidence-spine-types.test.ts
   PURPOSE: Focused tests for Stage 13 static Evidence Spine contracts.
   DEPENDENCIES: Vitest, Evidence Spine static contracts and fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  EVIDENCE_APPROVAL_REQUIREMENTS,
  EVIDENCE_ARCHIVE_DECISION_POLICY,
  EVIDENCE_FILE_OPERATION_BLOCK_POLICY,
  EVIDENCE_FOLDER_RELATIONSHIP_POLICY,
} from './evidence-spine-policy';
import {
  STATIC_EVIDENCE_SPINE_ITEMS,
} from './evidence-spine-seed';
import {
  BLOCKED_FILE_OPERATION_NAMES,
  EVIDENCE_APPROVAL_STATUSES,
  EVIDENCE_SPINE_STATUSES,
} from './evidence-spine-types';
import type {
  ArchiveDecisionPolicy,
  EvidenceApprovalRequirement,
  EvidenceSpineItem,
  FileOperationBlockPolicy,
  FolderRelationshipPolicy,
  SourceTrace,
  VersionLineageRecord,
} from './evidence-spine-types';
// #endregion

// #region Test Helpers
const forbiddenImportTerms = [
  'f' + 's',
  'pa' + 'th',
  'local' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'use' + 'BrainStore',
  'use' + 'M' + 'atterStore',
  'brain' + 'Store',
  'm' + 'atterStore',
  'fe' + 'tch',
  'google' + 'apis',
  'O' + 'Auth',
  'O' + 'CR',
  'Work' + 'Item',
  'M' + 'atter',
  'Document' + 'R' + 'ef',
  'mk' + 'dir',
] as const;

const evidenceIds = new Set(STATIC_EVIDENCE_SPINE_ITEMS.map((item) => item.evidenceId));

const collectRecordKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectRecordKeys);
  if (typeof value !== 'object' || value === null) return [];

  return Object.entries(value as Record<string, unknown>).flatMap(([key, childValue]) => [
    key,
    ...collectRecordKeys(childValue),
  ]);
};

const collectPrimitiveValues = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectPrimitiveValues);
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];

  return Object.values(value as Record<string, unknown>).flatMap(collectPrimitiveValues);
};
// #endregion

// #region Tests
describe('Stage 13 static Evidence Spine contracts', () => {
  it('keeps every mock EvidenceSpineItem aligned with the contract', () => {
    const item: EvidenceSpineItem = STATIC_EVIDENCE_SPINE_ITEMS[0]!;
    const trace: SourceTrace = item.sourceTrace;
    const lineage: VersionLineageRecord = item.versionLineage[0]!;

    expect(item.evidenceId).toBeTruthy();
    expect(trace.metadataOnly).toBe(true);
    expect(lineage.evidenceId).toBe(item.evidenceId);
    STATIC_EVIDENCE_SPINE_ITEMS.forEach((evidenceItem) => {
      expect(EVIDENCE_SPINE_STATUSES).toContain(evidenceItem.currentStatus);
      expect(EVIDENCE_APPROVAL_STATUSES).toContain(evidenceItem.approvalStatus);
      expect(evidenceItem.officialFolderRef.assignmentMode).toBe('metadata_only');
      expect(evidenceItem.officialFolderRef.resolvedToRealLocation).toBe(false);
    });
  });

  it('blocks all mutation capabilities on original evidence items', () => {
    STATIC_EVIDENCE_SPINE_ITEMS.filter((item) => item.isOriginal).forEach((item) => {
      expect(Object.values(item.boundaryFlags).every((flagValue) => flagValue === false)).toBe(
        true,
      );
    });
  });

  it('requires every derived version to reference an existing evidence id', () => {
    STATIC_EVIDENCE_SPINE_ITEMS.filter((item) => !item.isOriginal).forEach((item) => {
      const sourceEvidenceIds = item.versionLineage
        .map((lineage) => lineage.sourceEvidenceId)
        .filter(Boolean);

      expect(sourceEvidenceIds.length).toBeGreaterThan(0);
      sourceEvidenceIds.forEach((sourceEvidenceId) => {
        expect(evidenceIds.has(sourceEvidenceId!)).toBe(true);
      });
    });
  });

  it('keeps version lineage connected with no orphaned references', () => {
    STATIC_EVIDENCE_SPINE_ITEMS.flatMap((item) => item.versionLineage).forEach((lineage) => {
      expect(evidenceIds.has(lineage.evidenceId)).toBe(true);
      if (lineage.sourceEvidenceId) expect(evidenceIds.has(lineage.sourceEvidenceId)).toBe(true);
      if (lineage.replacementEvidenceId) {
        expect(evidenceIds.has(lineage.replacementEvidenceId)).toBe(true);
      }
    });
  });

  it('keeps low-confidence evidence unapproved', () => {
    STATIC_EVIDENCE_SPINE_ITEMS.filter((item) => item.confidenceLevel < 0.7).forEach((item) => {
      expect(item.approvalStatus).toBe('unapproved');
    });
  });

  it('locks every mock boundary flag to false', () => {
    STATIC_EVIDENCE_SPINE_ITEMS.forEach((item) => {
      expect(item.boundaryFlags).toEqual({
        canMoveFile: false,
        canCopyFile: false,
        canDeleteFile: false,
        canRenameFile: false,
        canCreateFolder: false,
        canArchive: false,
      });
    });
  });

  it('enforces one official source folder per client/case as metadata only', () => {
    const policy: FolderRelationshipPolicy = EVIDENCE_FOLDER_RELATIONSHIP_POLICY;

    expect(policy.scope).toBe('one_official_source_folder_per_client_case');
    expect(policy.folderAssignmentMode).toBe('metadata_only');
    expect(policy.folderCreationBlocked).toBe(true);
    expect(policy.officialFolderMutationBlocked).toBe(true);
  });

  it('keeps archive as proposal-only and approval-gated', () => {
    const policy: ArchiveDecisionPolicy = EVIDENCE_ARCHIVE_DECISION_POLICY;

    expect(policy.proposedStateOnly).toBe(true);
    expect(policy.archiveReasonRequired).toBe(true);
    expect(policy.proposedByRequired).toBe(true);
    expect(policy.eldadApprovalRequired).toBe(true);
    expect(policy.automaticArchiveBlocked).toBe(true);
  });

  it('blocks every file operation behind a future gate', () => {
    const policy: FileOperationBlockPolicy = EVIDENCE_FILE_OPERATION_BLOCK_POLICY;
    const requirement: EvidenceApprovalRequirement = EVIDENCE_APPROVAL_REQUIREMENTS[0]!;

    expect(policy.blockedOperations).toEqual(BLOCKED_FILE_OPERATION_NAMES);
    expect(policy.allFileOperationsBlocked).toBe(true);
    expect(policy.futureGateRequired).toBe(true);
    expect(requirement.createsOperationalRecord).toBe(false);
  });

  it('does not expose forbidden live, storage, provider, or record surfaces', () => {
    const fixtures = [
      STATIC_EVIDENCE_SPINE_ITEMS,
      EVIDENCE_FOLDER_RELATIONSHIP_POLICY,
      EVIDENCE_ARCHIVE_DECISION_POLICY,
      EVIDENCE_FILE_OPERATION_BLOCK_POLICY,
      EVIDENCE_APPROVAL_REQUIREMENTS,
    ];
    const searchable = [
      ...collectRecordKeys(fixtures),
      ...collectPrimitiveValues(fixtures),
    ].join(' ');

    forbiddenImportTerms.forEach((term) => {
      expect(searchable).not.toContain(term);
    });
  });
});
// #endregion
