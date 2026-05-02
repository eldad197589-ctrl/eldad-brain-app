/* ============================================
   FILE: mock-gmail-drive-to-unified-intake.test.ts
   PURPOSE: Focused tests for static mock Gmail and Drive Unified Intake mapping.
   DEPENDENCIES: vitest, fs, mock mappers
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MOCK_DRIVE_UNIFIED_INTAKE_OUTPUT, createUnifiedIntakeFromMockDriveItems } from './mock-drive-to-unified-intake';
import { MOCK_GMAIL_UNIFIED_INTAKE_OUTPUT, createUnifiedIntakeFromMockGmailMessages } from './mock-gmail-to-unified-intake';
// #endregion

// #region Constants
const runtimeFiles = [
  'mock-gmail-drive-types.ts',
  'mock-gmail-data.ts',
  'mock-drive-data.ts',
  'mock-gmail-to-unified-intake.ts',
  'mock-drive-to-unified-intake.ts',
];
// #endregion

// #region Tests
describe('Mock Gmail / Drive Unified Intake mapping', () => {
  it('maps mock Gmail messages to Unified Intake candidates and evidence only', () => {
    const output = createUnifiedIntakeFromMockGmailMessages();

    expect(output).toEqual(MOCK_GMAIL_UNIFIED_INTAKE_OUTPUT);
    expect(Object.keys(output)).toEqual(['candidates', 'evidenceRefs']);
    expect(output.candidates.length).toBe(2);
    expect(output.evidenceRefs.length).toBe(4);
    expect(output.candidates.every((candidate) => candidate.sourceType === 'email')).toBe(true);
    expect(output.candidates.every((candidate) => candidate.candidateStatus === 'staging_candidate')).toBe(true);
    expect(output.evidenceRefs.map((evidence) => evidence.evidenceKind)).toEqual([
      'email_message',
      'email_attachment',
      'email_message',
      'email_attachment',
    ]);
  });

  it('maps mock Drive files and folders to Unified Intake candidates and evidence only', () => {
    const output = createUnifiedIntakeFromMockDriveItems();

    expect(output).toEqual(MOCK_DRIVE_UNIFIED_INTAKE_OUTPUT);
    expect(Object.keys(output)).toEqual(['candidates', 'evidenceRefs']);
    expect(output.candidates.length).toBe(3);
    expect(output.evidenceRefs.length).toBe(3);
    expect(output.candidates.every((candidate) => candidate.sourceType === 'google_drive')).toBe(true);
    expect(output.candidates.every((candidate) => candidate.matterResolutionStatus === 'unresolved')).toBe(true);
    expect(output.evidenceRefs.map((evidence) => evidence.evidenceKind)).toEqual(['drive_file', 'drive_file', 'drive_folder']);
  });

  it('keeps mock connector runtime files free of live services, credentials, storage, and creation calls', () => {
    for (const fileName of runtimeFiles) {
      const source = readFileSync(new URL(fileName, import.meta.url), 'utf8');

      expect(source).not.toContain('googleapis');
      expect(source).not.toContain('axios');
      expect(source).not.toContain('fetch(');
      expect(source).not.toContain('oauth');
      expect(source).not.toContain('token');
      expect(source).not.toContain('localStorage');
      expect(source).not.toContain('sessionStorage');
      expect(source).not.toContain('indexedDB');
      expect(source).not.toContain('useBrainStore');
      expect(source).not.toContain('useMatterStore');
      expect(source).not.toContain('createWorkItem(');
      expect(source).not.toContain('createMatter(');
      expect(source).not.toContain('createDocumentRef(');
    }
  });
});
// #endregion
