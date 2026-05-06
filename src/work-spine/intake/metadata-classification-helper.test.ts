/* ==== FILE: src/work-spine/intake/metadata-classification-helper.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  METADATA_CLASSIFICATION_CONFIDENCE,
  classifyScannedIntakeMetadata,
} from './metadata-classification-helper';
// #endregion

// #region Constants
const forbiddenOutputWords = ['verified', 'final', 'evidence', 'belongs to client', 'professional conclusion'];

const forbiddenRuntimeFragments = [
  "from 'fs'",
  'from "fs"',
  "from 'path'",
  'from "path"',
  'require("fs")',
  "require('fs')",
  'provider',
  'ocr',
  'api',
  'agent.run',
  'persist',
  'localStorage',
  'createMatter',
  'createWorkItem',
  'createDocumentRef',
] as const;
// #endregion

// #region Helpers
const serializedResult = (value: unknown): string => JSON.stringify(value).toLowerCase();
// #endregion

// #region Tests
describe('classifyScannedIntakeMetadata', () => {
  it('classifies by file name, extension, folder label, and snapshot group metadata only', () => {
    const result = classifyScannedIntakeMetadata({
      fileName: 'חשבונית_מע״מ_2026.pdf',
      extension: '.pdf',
      folderLabel: 'מייבן מעמ',
      relativePathLabel: 'סריקות/מע״מ',
      snapshotGroupLabels: ['VAT static metadata'],
    });

    expect(result.possibleCategory).toBe('vat_metadata');
    expect(result.confidence).toBe('medium');
    expect(result.sourceSignals).toContain('fileName:מע״מ');
    expect(result.sourceSignals).toContain('folderLabel:מעמ');
    expect(result.sourceSignals).toContain('relativePathLabel:מע״מ');
    expect(result.sourceSignals).toContain('snapshotGroupLabel:vat');
    expect(result.sourceSignals).toContain('extension:pdf');
    expect(result.reason).toContain('metadata signal');
  });

  it('never reads or returns supplied content-like properties', () => {
    const metadataWithIgnoredContent = {
      fileName: 'unknown.bin',
      extension: 'bin',
      folderLabel: 'landing-zone',
      content: 'מע״מ verified final professional conclusion',
    };
    const result = classifyScannedIntakeMetadata(metadataWithIgnoredContent);

    expect(result.possibleCategory).toBe('unknown_metadata');
    expect(serializedResult(result)).not.toContain('professional conclusion');
    expect(serializedResult(result)).not.toContain('verified');
    expect(serializedResult(result)).not.toContain('final');
  });

  it('returns the required preview safety flags on every result', () => {
    const result = classifyScannedIntakeMetadata({
      fileName: 'דימה_סריקה.jpg',
      extension: 'jpg',
      folderLabel: 'סריקות דימה',
      relativePathLabel: 'תיק דימה/סריקות',
      snapshotGroupLabels: ['scan metadata'],
    });

    expect(result.previewOnly).toBe(true);
    expect(result.noLiveExecution).toBe(true);
    expect(result.staticClassificationOnly).toBe(true);
    expect(result.noSourceVerification).toBe(true);
    expect(result.needsEldadReview).toBe(true);
  });

  it('never returns high confidence from metadata alone', () => {
    const result = classifyScannedIntakeMetadata({
      fileName: 'salary_payroll_attendance_שכר_נוכחות.pdf',
      extension: 'pdf',
      folderLabel: 'payroll salary attendance שכר',
      relativePathLabel: 'נוכחות/שכר/payroll',
      snapshotGroupLabels: ['payroll', 'attendance', 'salary'],
    });

    expect(METADATA_CLASSIFICATION_CONFIDENCE).not.toContain('high');
    expect(result.confidence).toBe('medium');
  });

  it('keeps output wording defensive and non-professional', () => {
    const result = classifyScannedIntakeMetadata({
      fileName: 'צילה_שכר.pdf',
      folderLabel: 'צילה שכר',
    });
    const outputText = serializedResult(result);

    for (const forbiddenWord of forbiddenOutputWords) {
      expect(outputText).not.toContain(forbiddenWord);
    }
  });

  it('does not expose runtime, provider, or operational object surfaces', () => {
    const helperSource = classifyScannedIntakeMetadata.toString();

    for (const forbiddenFragment of forbiddenRuntimeFragments) {
      expect(helperSource).not.toContain(forbiddenFragment);
    }
  });
});
// #endregion
