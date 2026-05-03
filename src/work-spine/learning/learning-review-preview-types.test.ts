/* ====
   FILE: learning-review-preview-types.test.ts
   PURPOSE: Focused tests for Stage 14 static learning review previews.
   DEPENDENCIES: Vitest, learning review preview fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { STATIC_LEARNING_REVIEW_PREVIEWS } from './learning-review-preview-seed';
import {
  LEARNING_REVIEW_KINDS,
  LEARNING_REVIEW_STATUSES,
} from './learning-review-preview-types';
// #endregion

// #region Test Helpers
const lockedFalseFlagNames = [
  'bindingKnowledge',
  'persistenceAllowed',
  'automaticLearningAllowed',
  'memoryWriteAllowed',
  'ragWriteAllowed',
  'knowledgeLogWriteAllowed',
  'brainStoreWriteAllowed',
] as const;

const nonReusableStatuses = [
  'rejected',
  'deferred',
  'blocked',
  'needs_source_trace',
] as const;

const forbiddenSurfaceTerms = [
  'brain' + 'Store',
  'knowledge' + 'Log',
  'mem' + 'ory',
  'R' + 'AG',
  'Supa' + 'base',
  'Gem' + 'ini',
  'persist' + 'ence',
  'local' + 'Storage',
  'f' + 's',
  'O' + 'CR',
  'O' + 'Auth',
  'pro' + 'vider',
  'A' + 'PI',
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
describe('Stage 14 learning review previews', () => {
  it('covers every required learning status in static fixtures', () => {
    expect(STATIC_LEARNING_REVIEW_PREVIEWS.map((preview) => preview.reviewStatus)).toEqual(
      LEARNING_REVIEW_STATUSES,
    );
  });

  it('uses only the required learning kinds', () => {
    const allowedKinds = new Set<string>(LEARNING_REVIEW_KINDS);

    STATIC_LEARNING_REVIEW_PREVIEWS.forEach((preview) => {
      expect(allowedKinds.has(preview.learningKind)).toBe(true);
    });

    expect(STATIC_LEARNING_REVIEW_PREVIEWS.some(
      (preview) => preview.learningKind === 'blocked_learning',
    )).toBe(true);
  });

  it('locks all non-binding and no-write flags to false', () => {
    STATIC_LEARNING_REVIEW_PREVIEWS.forEach((preview) => {
      lockedFalseFlagNames.forEach((flagName) => {
        expect(preview[flagName]).toBe(false);
      });
      expect(preview.approvalRequired).toBe(true);
    });
  });

  it('never exposes binding knowledge or persistence permissions', () => {
    STATIC_LEARNING_REVIEW_PREVIEWS.forEach((preview) => {
      expect(preview.bindingKnowledge).toBe(false);
      expect(preview.persistenceAllowed).toBe(false);
      expect(preview.memoryWriteAllowed).toBe(false);
      expect(preview.ragWriteAllowed).toBe(false);
      expect(preview.knowledgeLogWriteAllowed).toBe(false);
      expect(preview.brainStoreWriteAllowed).toBe(false);
    });
  });

  it('requires Eldad decision ids for approved reuse previews', () => {
    STATIC_LEARNING_REVIEW_PREVIEWS.forEach((preview) => {
      if (preview.reviewStatus === 'approved_for_reuse_preview') {
        expect(preview.eldadDecisionId).toMatch(/^eldad-learning-decision-/);
        expect(preview.suggestedReuseScope).not.toBe('none');
      }
    });
  });

  it('blocks reuse for rejected, deferred, blocked, and missing-source previews', () => {
    STATIC_LEARNING_REVIEW_PREVIEWS.forEach((preview) => {
      if (nonReusableStatuses.includes(preview.reviewStatus as never)) {
        expect(preview.suggestedReuseScope).toBe('none');
        expect(preview.eldadDecisionId).toBeNull();
        expect(preview.forbiddenReuseReasons.length).toBeGreaterThan(0);
      }
    });
  });

  it('keeps blocked learning blocked', () => {
    const blockedPreview = STATIC_LEARNING_REVIEW_PREVIEWS.find(
      (preview) => preview.learningKind === 'blocked_learning',
    );

    expect(blockedPreview?.reviewStatus).toBe('blocked');
    expect(blockedPreview?.suggestedReuseScope).toBe('none');
    expect(blockedPreview?.automaticLearningAllowed).toBe(false);
  });

  it('requires professional review for high-risk and critical previews', () => {
    STATIC_LEARNING_REVIEW_PREVIEWS.forEach((preview) => {
      if (preview.riskLevel === 'high' || preview.riskLevel === 'critical') {
        expect(preview.professionalReviewRequired).toBe(true);
      }
    });
  });

  it('keeps Stage 13 coupling string-id only', () => {
    STATIC_LEARNING_REVIEW_PREVIEWS.forEach((preview) => {
      expect(typeof preview.evidenceBundleId).toBe('string');
      preview.sourceTraceIds.forEach((sourceTraceId) => {
        expect(typeof sourceTraceId).toBe('string');
      });
      preview.evidenceItemIds.forEach((evidenceItemId) => {
        expect(typeof evidenceItemId).toBe('string');
      });
    });
  });

  it('does not expose forbidden implementation surfaces beyond locked flag names', () => {
    const fixtureKeys = collectRecordKeys(STATIC_LEARNING_REVIEW_PREVIEWS).filter(
      (key) => !lockedFalseFlagNames.includes(key as never),
    );
    const fixtureValues = collectPrimitiveValues(STATIC_LEARNING_REVIEW_PREVIEWS);
    const searchableText = [...fixtureKeys, ...fixtureValues].join(' ');

    forbiddenSurfaceTerms.forEach((surfaceTerm) => {
      expect(searchableText).not.toContain(surfaceTerm);
    });
  });

  it('preserves Hebrew proposed learning text for display review', () => {
    const hebrewPreview = STATIC_LEARNING_REVIEW_PREVIEWS.find(
      (preview) => preview.previewId === 'learning-preview-candidate-bookkeeping',
    );

    expect(hebrewPreview?.proposedLearning).toContain('חשבונית');
    expect(hebrewPreview?.proposedLearning).toContain('בדיקת');
  });
});
// #endregion
