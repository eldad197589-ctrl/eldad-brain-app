/* ==== FILE: src/work-spine/build-progress/brain-build-progress-console-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  BRAIN_BUILD_LATEST_CHANGE_SUMMARY,
  BRAIN_BUILD_LATEST_CHANGE_WARNING,
  BRAIN_BUILD_PROGRESS_ITEMS,
  BRAIN_BUILD_PROGRESS_ROUTE,
  BRAIN_BUILD_PROGRESS_WARNING,
} from './brain-build-progress-console-seed';
import {
  BRAIN_BUILD_BLOCKED_ACTIONS,
  BRAIN_BUILD_PROGRESS_SAFETY_STATUS,
  BRAIN_BUILD_PROGRESS_STATUSES,
} from './brain-build-progress-console-types';
import type { BrainBuildProgressItem } from './brain-build-progress-console-types';
// #endregion

// #region Constants
const REQUIRED_PROGRESS_FIELDS = [
  'progressItemId',
  'title',
  'domain',
  'layer',
  'relatedCommit',
  'visibleRoute',
  'proofScenario',
  'currentStatus',
  'proofStatus',
  'surfaceClassification',
  'whatWasBuilt',
  'whatEldadCanSee',
  'whatIsStillBlocked',
  'nextSafeStep',
  'responsibleAgent',
  'safetyStatus',
  'blockedActions',
] as const satisfies readonly (keyof BrainBuildProgressItem)[];

const REQUIRED_PROGRESS_IDS = [
  'progress-vat-mapping-table-preview-v1',
  'progress-static-vat-evidence-seed-v1',
  'progress-scanned-evidence-batch-v1',
  'progress-scanned-batch-preview-v1',
  'progress-approval-gate-preview-v1',
  'progress-knowledge-inventory-phase1-v1',
  'progress-knowledge-inventory-preview-v1',
  'progress-static-visual-proof-checklist-v1',
  'progress-phase2-safe-knowledge-candidates-v1',
  'progress-hypothetical-task-shape-preview-v1',
  'progress-intake-signal-summary-v1',
  'progress-visual-brain-surface-inventory-v1',
] as const;

const BANNED_LIVE_WORDING = [
  'opera' + 'tional',
  'rea' + 'dy',
  'li' + 've',
  'connect' + 'ed',
  'ver' + 'ified',
  'app' + 'roved',
  'corr' + 'ect',
  'com' + 'plete',
  'production',
  'exe' + 'cute',
  'cre' + 'ate',
  'sub' + 'mit',
  'se' + 'nd',
  'po' + 'st',
  'fi' + 'le',
  'per' + 'sist',
  'sy' + 'nc',
  'auto' + 'mate',
  'deploy',
] as const;
// #endregion

// #region Helpers
const progressIds = (): readonly string[] =>
  BRAIN_BUILD_PROGRESS_ITEMS.map((progressItem) => progressItem.progressItemId);

const nonBlockedTextValues = (progressItem: BrainBuildProgressItem): readonly string[] =>
  Object.entries(progressItem)
    .filter(([fieldName]) => !['blockedActions', 'whatIsStillBlocked'].includes(fieldName))
    .flatMap(([, value]) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === 'object' && value !== null) {
        return Object.values(value);
      }

      return [value];
    })
    .filter((value): value is string => typeof value === 'string');

const serializedNonBlockedProgressText = (): string =>
  BRAIN_BUILD_PROGRESS_ITEMS.flatMap(nonBlockedTextValues).join(' ').toLowerCase();
// #endregion

// #region Tests
describe('BRAIN_BUILD_PROGRESS_ITEMS', () => {
  it('exports exactly the 12 approved build progress items', () => {
    expect(BRAIN_BUILD_PROGRESS_ITEMS).toHaveLength(12);
    expect(progressIds()).toEqual(REQUIRED_PROGRESS_IDS);
  });

  it('uses the exact progress route and warning', () => {
    expect(BRAIN_BUILD_PROGRESS_ROUTE).toBe('/internal/brain-build-progress');
    expect(BRAIN_BUILD_PROGRESS_WARNING).toBe(
      'התקדמות בנייה בלבד — לא מוכנות תפעולית, לא אימות מקצועי, לא חיבור חי, ולא הרשאה לפעול.',
    );
    expect(BRAIN_BUILD_LATEST_CHANGE_WARNING).toBe(
      'סיכום שינוי סטטי בלבד — לא פריסה חיה, לא מוכנות תפעולית, לא אימות מקור, לא חיבור ספקים, ולא הרשאה לפעול.',
    );
  });

  it('exports the latest committed change summary for the top console section', () => {
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.title).toBe('תיקון עברית מלא למסך התקדמות בניית המוח');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.relatedCommit).toBe('0132154');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.whereToSee).toBe(BRAIN_BUILD_PROGRESS_ROUTE);
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.proofOfLife).toContain(BRAIN_BUILD_PROGRESS_WARNING);
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.stillBlocked).toContain('אין פעולה חיה');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.stillBlocked).toContain('אין יצירת משימה');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.stillBlocked).toContain('אין יצירת תיק');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.stillBlocked).toContain('אין DocumentRef');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.stillBlocked).toContain('אין persistence');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.safetyStatus).toBe('סיכום התקדמות לקריאה בלבד');
  });

  it('includes every required field and static safety marker', () => {
    for (const progressItem of BRAIN_BUILD_PROGRESS_ITEMS) {
      for (const fieldName of REQUIRED_PROGRESS_FIELDS) {
        expect(progressItem).toHaveProperty(fieldName);
      }

      expect(progressItem.safetyStatus).toBe(BRAIN_BUILD_PROGRESS_SAFETY_STATUS);
      expect(progressItem.blockedActions).toEqual(BRAIN_BUILD_BLOCKED_ACTIONS);
      expect(BRAIN_BUILD_PROGRESS_STATUSES).toContain(progressItem.currentStatus);
    }
  });

  it('contains the recent commit anchors needed for the console proof chain', () => {
    const relatedCommits = BRAIN_BUILD_PROGRESS_ITEMS.map((progressItem) => progressItem.relatedCommit);

    expect(relatedCommits).toContain('ee3a06f');
    expect(relatedCommits).toContain('edf165d');
  });

  it('keeps proof scenarios and blocked actions visible in the static data', () => {
    for (const progressItem of BRAIN_BUILD_PROGRESS_ITEMS) {
      expect(progressItem.proofScenario.input.length).toBeGreaterThan(0);
      expect(progressItem.proofScenario.expectedVisibleResult.length).toBeGreaterThan(0);
      expect(progressItem.whatIsStillBlocked.length).toBeGreaterThan(0);
    }
  });

  it('does not use banned wording outside blocked or negative contexts', () => {
    const searchableText = serializedNonBlockedProgressText();

    for (const bannedWord of BANNED_LIVE_WORDING) {
      expect(searchableText).not.toContain(bannedWord.toLowerCase());
    }
  });
});
// #endregion
