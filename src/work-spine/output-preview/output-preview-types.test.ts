/* ====
   FILE: output-preview-types.test.ts
   PURPOSE: Focused tests for Stage 10 professional output preview contracts.
   DEPENDENCIES: Vitest, output preview static registry and mocks
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  OUTPUT_PREVIEW_TYPE_REGISTRY,
  STATIC_OUTPUT_PREVIEWS,
} from './output-preview-seed';
import {
  OUTPUT_GENERATION_BLOCKED_REASON,
  OUTPUT_PREVIEW_STATUSES,
  OUTPUT_PREVIEW_TYPES,
} from './output-preview-types';
// #endregion

// #region Test Helpers
const forbiddenStatuses = [
  'fi' + 'nal',
  'se' + 'nt',
  'fil' + 'ed',
  'sig' + 'ned',
  'deliv' + 'ered',
] as const;

const forbiddenGenerationTerms = [
  'DO' + 'CX',
  'P' + 'DF',
  'Ex' + 'cel',
  'HT' + 'ML',
  'build_native_' + 'docx',
  'gen_' + 'pdf',
] as const;

const forbiddenLiveTerms = [
  'local' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'google' + 'apis',
  'f' + 's',
  'pa' + 'th',
  'O' + 'Auth',
  'O' + 'CR',
] as const;

const collectRecordKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectRecordKeys);
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, childValue]) => [
    key,
    ...collectRecordKeys(childValue),
  ]);
};

const collectPrimitiveValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectPrimitiveValues);
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  return Object.values(value as Record<string, unknown>).flatMap(collectPrimitiveValues);
};
// #endregion

// #region Tests
describe('Stage 10 professional output preview contracts', () => {
  it('registers all required professional output types', () => {
    expect(OUTPUT_PREVIEW_TYPE_REGISTRY).toHaveLength(OUTPUT_PREVIEW_TYPES.length);
    expect(OUTPUT_PREVIEW_TYPE_REGISTRY.map((entry) => entry.outputType)).toEqual(
      OUTPUT_PREVIEW_TYPES,
    );
  });

  it('keeps every output preview fully linked to source provenance', () => {
    STATIC_OUTPUT_PREVIEWS.forEach((preview) => {
      expect(preview.outputPreviewId).toBeTruthy();
      expect(preview.sourceIntakeId).toBeTruthy();
      expect(preview.sourceApprovalId).toBeTruthy();
      expect(preview.sourceOperationalPreviewId).toBeTruthy();
      expect(preview.policyActionRef).toBeTruthy();
    });
  });

  it('uses only preview statuses and never forbidden statuses', () => {
    const allowedStatuses = new Set<string>(OUTPUT_PREVIEW_STATUSES);
    const previewValues = collectPrimitiveValues(STATIC_OUTPUT_PREVIEWS);

    STATIC_OUTPUT_PREVIEWS.forEach((preview) => {
      expect(allowedStatuses.has(preview.outputStatus)).toBe(true);
    });

    forbiddenStatuses.forEach((status) => {
      expect(previewValues).not.toContain(status);
    });
  });

  it('locks high-risk output reviews', () => {
    const letterPreview = STATIC_OUTPUT_PREVIEWS.find(
      (preview) => preview.outputType === 'letter',
    );
    const vatMemoPreview = STATIC_OUTPUT_PREVIEWS.find(
      (preview) => preview.outputType === 'vat_review_memo',
    );

    expect(letterPreview?.riskLevel).toBe('high');
    expect(letterPreview?.eldadMustReview).toBe(true);
    expect(letterPreview?.neverAutoGenerate).toBe(true);
    expect(vatMemoPreview?.riskLevel).toMatch(/^(medium|high)$/);
    expect(vatMemoPreview?.eldadMustReview).toBe(true);
  });

  it('keeps professional opinion drafts manual-only and blocked', () => {
    const opinionPreview = STATIC_OUTPUT_PREVIEWS.find(
      (preview) => preview.outputType === 'professional_opinion_draft',
    );

    expect(opinionPreview?.riskLevel).toBe('critical');
    expect(opinionPreview?.eldadMustReview).toBe(true);
    expect(opinionPreview?.neverAutoGenerate).toBe(true);
    expect(opinionPreview?.manualOnly).toBe(true);
    expect(opinionPreview?.generationBlocked).toBe(true);
  });

  it('does not allow any output preview to generate files', () => {
    STATIC_OUTPUT_PREVIEWS.forEach((preview) => {
      expect(preview.neverAutoGenerate).toBe(true);
      expect(preview.generationBlocked).toBe(true);
      expect(preview.generationBlockedReason).toBe(OUTPUT_GENERATION_BLOCKED_REASON);
    });

    OUTPUT_PREVIEW_TYPE_REGISTRY.forEach((entry) => {
      expect(entry.generationBlocked).toBe(true);
      expect(entry.exportBlocked).toBe(true);
      expect(entry.staticPreviewOnly).toBe(true);
    });
  });

  it('does not expose generation, live, storage, provider, or file surfaces', () => {
    const previewKeys = collectRecordKeys(STATIC_OUTPUT_PREVIEWS);
    const previewValues = collectPrimitiveValues(STATIC_OUTPUT_PREVIEWS);

    [...forbiddenGenerationTerms, ...forbiddenLiveTerms].forEach((term) => {
      expect(previewKeys).not.toContain(term);
      expect(previewValues).not.toContain(term);
    });
  });

  it('preserves Hebrew right-to-left metadata for Hebrew previews', () => {
    const hebrewPreview = STATIC_OUTPUT_PREVIEWS.find(
      (preview) => preview.outputPreviewId === 'output-preview-vat-review-memo-hebrew',
    );

    expect(hebrewPreview?.languageDirection).toBe('rtl');
    expect(hebrewPreview?.professionalPurpose).toContain('סקירת מע״מ');
    expect(hebrewPreview?.intendedAudience).toBe('אלדד');
  });
});
// #endregion
