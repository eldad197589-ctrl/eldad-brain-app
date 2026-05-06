/* ==== FILE: src/work-spine/build-progress/brain-build-progress-console-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  BRAIN_BUILD_LATEST_CHANGE_SUMMARY,
  BRAIN_BUILD_LATEST_CHANGE_WARNING,
  BRAIN_BUILD_PROGRESS_ITEMS,
  BRAIN_BUILD_PROGRESS_ROUTE,
  BRAIN_BUILD_PROGRESS_WARNING,
  BRAIN_BUILD_STAGE_ROADMAP_BANNER,
  BRAIN_BUILD_STAGE_ROADMAP_CONTROL,
  BRAIN_BUILD_STAGE_ROADMAP_DIVIDER,
  BRAIN_BUILD_STAGE_ROADMAP_GROUPS,
  BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS,
  BRAIN_BUILD_STAGE_ROADMAP_STATUSES,
  BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE,
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
  'progress-work-spine-bootstrap-idempotency-fix-v1',
  'progress-brain-system-source-map-v1',
  'progress-stage-21a-internal-agent-workforce-v1',
  'progress-stage-21c-process-library-blueprints-v1',
  'progress-stage-21d-agent-process-assignment-map-v1',
  'progress-stage-19a-metadata-only-scan-intake-preview-v1',
  'progress-stage-19-metadata-only-preview-status-v1',
] as const;

const REQUIRED_ROADMAP_STAGE_TITLES = [
  'מאגר ראיות מע״מ סטטי',
  'אצוות ראיות סריקה סטטית',
  'אמת תפעולית של המוח',
  'רשימת בדיקת תצוגה סטטית',
  'מלאי ידע שלב 1',
  'מלאי ידע שלב 2',
  'מלאי משטחי מוח חזותיים',
  'מסך התקדמות בניית המוח',
  'תקציר שינוי אחרון',
  'המסך הידני — Preview מע״מ',
  'תצוגת טבלת מיפוי מע״מ',
  'תצוגת אצוות סריקות',
  'תצוגת שער אישור',
  'תצוגת מלאי ידע',
  'סיכום רמזי קלט',
  'תצוגת צורת משימה היפותטית',
  'מפת מצב המוח ומקורותיו',
  'מפת מקורות ידע חיצוניים',
  'תצוגת מטא־דאטה לסריקות',
  'שער תפעולי מוגבל ראשון',
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

const roadmapStages = () => BRAIN_BUILD_STAGE_ROADMAP_GROUPS.flatMap((group) => group.stages);

const serializedRoadmapText = (): string => JSON.stringify(BRAIN_BUILD_STAGE_ROADMAP_GROUPS);
// #endregion

// #region Tests
describe('BRAIN_BUILD_PROGRESS_ITEMS', () => {
  it('exports exactly the 19 approved build progress items', () => {
    expect(BRAIN_BUILD_PROGRESS_ITEMS).toHaveLength(19);
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
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.title).toBe('Stage 21D — Agent ↔ Process Assignment Map');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.relatedCommit).toBe('pending-stage-21d');
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.whereToSee).toBe('/internal/brain-build-progress');
    for (const expectedText of ['מפת שיוך סטטית', '30 הסוכנים', '13 תהליכי']) {
      expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.whatChanged).toContain(expectedText);
    }
    for (const expectedText of ['מה מוצג במסך', '13 static assignments', '30 internal agents', '13 process blueprints', 'operationalExecution:false', 'canRun:false', 'טרם ננעל ב־commit']) {
      expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.proofOfLife).toContain(expectedText);
    }
    for (const expectedText of ['18D remains HOLD', '18D Visual Brain Alignment: deferred/HOLD due dirty neurons.ts', 'Stage 20 remains blocked', 'No operational capability introduced', 'Stage 21D is a static agent-process assignment layer only', 'אין runtime agents', 'אין workflow execution', 'אין UI/navigation changes', 'אין שינוי Sidebar/Layout/Dashboard', 'אין שינוי routes', 'אין שינוי neurons.ts', 'אין provider', 'אין WorkItem', 'אין Matter', 'אין DocumentRef', 'אין persistence']) {
      expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.stillBlocked).toContain(expectedText);
    }
    expect(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.safetyStatus).toBe('Stage 21D Agent Process Assignment Map — static preview only, operationalExecution:false');
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

  it('contains the recent commit and pending anchors needed for the console proof chain', () => {
    const relatedCommits = BRAIN_BUILD_PROGRESS_ITEMS.map((progressItem) => progressItem.relatedCommit);

    for (const relatedCommit of ['ee3a06f', 'edf165d', 'e6c15e9', '4b05db3', 'b25d276', '3dbf61f', '7feb0c2', 'pending-stage-21d']) {
      expect(relatedCommits).toContain(relatedCommit);
    }
  });

  it('includes the Work Spine bootstrap idempotency fix checkpoint', () => {
    const checkpoint = BRAIN_BUILD_PROGRESS_ITEMS.find(
      (progressItem) => progressItem.progressItemId === 'progress-work-spine-bootstrap-idempotency-fix-v1',
    );

    expect(checkpoint).toBeDefined();
    expect(checkpoint!.title).toBe('תיקון יציבות אתחול Work Spine');
    expect(checkpoint!.relatedCommit).toBe('e6c15e9');
    expect(checkpoint!.visibleRoute).toBe(BRAIN_BUILD_PROGRESS_ROUTE);
    expect(checkpoint!.currentStatus).toBe('built_and_visible');
    expect(checkpoint!.proofStatus).toBe('visible_static_preview');
    expect(checkpoint!.surfaceClassification).toBe('preview_only');
    expect(checkpoint!.whatIsStillBlocked).toContain('אין יצירת WorkItem אמיתי ללא אישור');
    expect(checkpoint!.whatIsStillBlocked).toContain('אין שימוש ב־Matter');
    expect(checkpoint!.whatIsStillBlocked).toContain('אין DocumentRef');
    expect(checkpoint!.whatIsStillBlocked).toContain('אין חיבור ספקים');
    expect(checkpoint!.whatIsStillBlocked).toContain('אין פעולה חיה');
  });

  it('includes the Stage 17 Brain System Source Map checkpoint', () => {
    const checkpoint = BRAIN_BUILD_PROGRESS_ITEMS.find(
      (progressItem) => progressItem.progressItemId === 'progress-brain-system-source-map-v1',
    );

    expect(checkpoint).toBeDefined();
    expect(checkpoint!.title).toBe('מפת מצב המוח ומקורותיו');
    expect(checkpoint!.relatedCommit).toBe('4b05db3');
    expect(checkpoint!.visibleRoute).toBe(BRAIN_BUILD_PROGRESS_ROUTE);
    expect(checkpoint!.currentStatus).toBe('built_and_visible');
    expect(checkpoint!.proofStatus).toBe('visible_static_preview');
    expect(checkpoint!.surfaceClassification).toBe('preview_only');
    for (const expectedText of ['20 מקורות', '7 קטגוריות', '22 תהליכים', 'מה מוצג במסך', 'מפת שלבי בניית המוח: 17 נבנו · 1 עכשיו · 1 ממתין · 1 חסום.', 'רשימת תהליכי המוח הוויזואלי: 7 קטגוריות · 22 תהליכים · 17 נבנו · 2 בבנייה · 3 ממתינים.', 'נתוני התהליכים מתארים את המוח הוויזואלי בלבד, ולא מוכנות תפעולית של המערכת.']) {
      expect(checkpoint!.proofScenario.expectedVisibleResult).toContain(expectedText);
    }
    expect(checkpoint!.proofScenario.expectedVisibleResult).not.toContain('17/2/3');
    expect(checkpoint!.proofScenario.expectedVisibleResult).not.toContain('סטטוס תהליכים');
    for (const expectedText of ['אין קריאת תיקיות', 'אין OCR', 'אין חיבור Gmail/Drive/Maven', 'אין WorkItem', 'אין Matter', 'אין DocumentRef', 'אין פעולה חיה']) {
      expect(checkpoint!.whatIsStillBlocked).toContain(expectedText);
    }
  });

  it('includes the Stage 21A internal agent workforce checkpoint', () => {
    const checkpoint = BRAIN_BUILD_PROGRESS_ITEMS.find(
      (progressItem) => progressItem.progressItemId === 'progress-stage-21a-internal-agent-workforce-v1',
    );

    expect(checkpoint).toBeDefined();
    expect(checkpoint!.title).toBe('Stage 21A — אינדקס כוח סוכנים פנימי');
    expect(checkpoint!.relatedCommit).toBe('b25d276');
    expect(checkpoint!.visibleRoute).toBe(BRAIN_BUILD_PROGRESS_ROUTE);
    expect(checkpoint!.currentStatus).toBe('built_and_visible');
    expect(checkpoint!.proofStatus).toBe('visible_static_preview');
    expect(checkpoint!.surfaceClassification).toBe('preview_only');
    expect(checkpoint!.proofScenario.expectedVisibleResult).toContain('30 סוכנים פנימיים');
    expect(checkpoint!.proofScenario.expectedVisibleResult).toContain('דגל הפעלה false');
    expect(checkpoint!.whatIsStillBlocked).toContain('אין runtime agents');
    expect(checkpoint!.whatIsStillBlocked).toContain('אין UI integration');
    expect(checkpoint!.whatIsStillBlocked).toContain('Stage 19 נרשם כ־preview-complete_metadata_only בלבד');
    expect(checkpoint!.whatIsStillBlocked).toContain('Stage 20 חסום');
  });

  it('includes the Stage 21D static agent-process assignment checkpoint', () => {
    const checkpoint = BRAIN_BUILD_PROGRESS_ITEMS.find((progressItem) => progressItem.progressItemId === 'progress-stage-21d-agent-process-assignment-map-v1');

    expect(checkpoint).toMatchObject({
      title: 'Stage 21D — Agent ↔ Process Assignment Map',
      relatedCommit: 'pending-stage-21d',
      visibleRoute: BRAIN_BUILD_PROGRESS_ROUTE,
      currentStatus: 'built_and_visible',
      proofStatus: 'visible_static_preview',
      surfaceClassification: 'preview_only',
    });
    for (const expectedText of ['13 static assignments', '30 internal agents', '13 process blueprints', 'operationalExecution:false', 'canRun:false']) expect(checkpoint!.proofScenario.expectedVisibleResult).toContain(expectedText);
    for (const expectedText of ['מפת שיוך סטטית', 'סוכנים פנימיים', 'תהליכי Blueprint']) expect(checkpoint!.whatWasBuilt).toContain(expectedText);
    for (const expectedText of ['אין runtime agents', 'אין workflow execution', 'אין UI/navigation changes', 'אין Sidebar/Layout/Dashboard changes', 'אין routes changes', 'אין neurons.ts changes', 'אין WorkItem', 'אין Matter', 'אין DocumentRef', 'Stage 20 remains blocked']) expect(checkpoint!.whatIsStillBlocked).toContain(expectedText);
  });

  it('includes the Stage 19A metadata-only scan intake preview checkpoint', () => {
    const checkpoint = BRAIN_BUILD_PROGRESS_ITEMS.find(
      (progressItem) => progressItem.progressItemId === 'progress-stage-19a-metadata-only-scan-intake-preview-v1',
    );

    expect(checkpoint).toBeDefined();
    expect(checkpoint!.title).toBe('Stage 19A — תצוגת מטא־דאטה סריקות סטטית');
    expect(checkpoint!.relatedCommit).toBe('3dbf61f');
    expect(checkpoint!.visibleRoute).toBe('/internal/manual-preview-workbench');
    expect(checkpoint!.currentStatus).toBe('built_and_visible');
    expect(checkpoint!.proofStatus).toBe('visible_static_preview');
    expect(checkpoint!.surfaceClassification).toBe('preview_only');
    for (const expectedText of ['61 מועמדי מטא־דאטה', '18 קבוצות סריקה', 'SCANNED_INTAKE_STATIC_SNAPSHOT בלבד']) {
      expect(checkpoint!.proofScenario.expectedVisibleResult).toContain(expectedText);
    }
    expect(checkpoint!.whatWasBuilt).toContain('SCANNED_INTAKE_STATIC_SNAPSHOT בלבד');
    expect(checkpoint!.whatEldadCanSee).toContain('snapshot סטטי בלבד');
    for (const expectedText of ['אין קריאת תיקייה חיה', 'אין OCR', 'אין קריאת תוכן מקור', 'אין הסקת סוג מסמך/לקוח/מס/שכר/דחיפות', 'אין Matter', 'אין WorkItem', 'אין DocumentRef', 'Stage 19 נרשם כ־preview-complete_metadata_only בלבד', 'Stage 20 חסום']) {
      expect(checkpoint!.whatIsStillBlocked).toContain(expectedText);
    }
  });

  it('keeps proof scenarios and blocked actions visible in the static data', () => {
    for (const progressItem of BRAIN_BUILD_PROGRESS_ITEMS) {
      expect(progressItem.proofScenario.input.length).toBeGreaterThan(0);
      expect(progressItem.proofScenario.expectedVisibleResult.length).toBeGreaterThan(0);
      expect(progressItem.whatIsStillBlocked.length).toBeGreaterThan(0);
    }
  });

  it('does not use banned wording outside blocked or negative contexts', () => {
    const searchableText = serializedNonBlockedProgressText()
      .replaceAll('preview-complete_metadata_only', '')
      .replaceAll('operationalexecution:false', '');

    for (const bannedWord of BANNED_LIVE_WORDING) {
      expect(searchableText).not.toContain(bannedWord.toLowerCase());
    }
  });
});

describe('BRAIN_BUILD_STAGE_ROADMAP', () => {
  it('exports exactly 20 roadmap stages', () => {
    expect(roadmapStages()).toHaveLength(20);
  });

  it('uses the approved Hebrew stage titles in order', () => {
    expect(roadmapStages().map((stage) => stage.title)).toEqual(REQUIRED_ROADMAP_STAGE_TITLES);
    expect(serializedRoadmapText()).not.toContain('Visual Brain Surface Section');
    expect(serializedRoadmapText()).not.toContain('מצב המוח הוויזואלי');
  });

  it('exports exactly three roadmap groups with Hebrew titles', () => {
    expect(BRAIN_BUILD_STAGE_ROADMAP_GROUPS).toHaveLength(3);
    const titles = BRAIN_BUILD_STAGE_ROADMAP_GROUPS.map((group) => group.title);
    expect(titles).toContain('יסודות סטטיים');
    expect(titles).toContain('תצוגות מקדימות');
    expect(titles).toContain('דרך לתפעול');
  });

  it('assigns stage statuses matching the approved table', () => {
    const expected: Record<number, (typeof BRAIN_BUILD_STAGE_ROADMAP_STATUSES)[number]> = {};
    for (let i = 1; i <= 17; i += 1) {
      expected[i] = 'built';
    }
    expected[18] = 'current';
    expected[19] = 'built';
    expected[20] = 'blocked';

    for (const stage of roadmapStages()) {
      expect(stage.status).toBe(expected[stage.order]);
    }
  });

  it('marks stage 17 built and moves the current pointer to stage 18', () => {
    const stage17 = roadmapStages().find((stage) => stage.order === 17);
    const stage18 = roadmapStages().find((stage) => stage.order === 18);
    expect(stage17).toBeDefined();
    expect(stage18).toBeDefined();
    expect(stage17!.title).toBe('מפת מצב המוח ומקורותיו');
    expect(stage17!.status).toBe('built');
    expect(stage17!.relatedCommit).toBe('4b05db3');
    expect(stage17!.compactLine).toBe('מפת מקורות + רשימת תהליכי המוח הוויזואלי — אינדקס בלבד, לא פעולה.');
    expect(stage18!.title).toBe('מפת מקורות ידע חיצוניים');
    expect(stage18!.status).toBe('current');
    expect(stage18!.compactLine).toContain('Stage 18: index-complete_with_18D_deferred');
    expect(stage18!.compactLine).toContain('18D deferred/HOLD');
    expect(stage18!.compactLine).toContain('Stage 19 preview-complete_metadata_only');
    expect(stage18!.proofScenario).toContain('18D deferred/HOLD');
    expect(stage18!.proofScenario).toContain('src/data/neurons.ts dirty');
    expect(stage18!.whatIsNotDone).toContain('18D Visual Brain Alignment: deferred/HOLD due dirty neurons.ts');
    expect(stage18!.whatIsNotDone).toContain('Stage 20 remains blocked');
    expect(stage18!.whatIsNotDone).toContain('No operational capability introduced');
    const stage19 = roadmapStages().find((stage) => stage.order === 19);
    expect(stage19).toBeDefined();
    expect(stage19!.title).toBe('תצוגת מטא־דאטה לסריקות');
    expect(stage19!.status).toBe('built');
    expect(stage19!.relatedCommit).toBe('cce44f0');
    ['Stage 19: preview-complete_metadata_only', 'הושלמה תצוגת מטא-דאטה בלבד', 'אין סריקת תוכן', 'Stage 20 remains blocked'].forEach((text) => expect(stage19!.compactLine).toContain(text));
    ['אין OCR', 'אין שמירת נתונים במסד', 'אין Matter / WorkItem / DocumentRef'].forEach((text) => expect(stage19!.proofScenario).toContain(text));
    ['Stage 19: preview-complete_metadata_only', 'Stage 19E Eldad decision queue preview מוצג כתור החלטות סטטי בלבד ללא persistence וללא queue state אמיתי'].forEach((text) => expect(stage19!.whatIsDone).toContain(text));
    ['18D remains HOLD', 'Stage 20 remains blocked', 'אין confidence גבוה', 'אין אישור/דחייה אמיתיים'].forEach((text) => expect(stage19!.whatIsNotDone).toContain(text));
  });

  it('marks every roadmap stage as static roadmap only', () => {
    for (const stage of roadmapStages()) {
      expect(stage.safetyStatus).toBe('static_roadmap_only');
    }
  });

  it('includes commit hashes for all built stages', () => {
    const builtStages = roadmapStages().filter((stage) => stage.status === 'built');
    expect(builtStages.length).toBe(18);
    for (const stage of builtStages) {
      expect(stage.relatedCommit).not.toBeNull();
      expect((stage.relatedCommit ?? '').length).toBeGreaterThan(0);
    }
  });

  it('does not include commit hashes for non-built stages', () => {
    const nonBuilt = roadmapStages().filter((stage) => stage.status !== 'built');
    for (const stage of nonBuilt) {
      expect(stage.relatedCommit).toBeNull();
    }
  });

  it('includes blocked reason on the blocked stage', () => {
    const blockedStage = roadmapStages().find((stage) => stage.status === 'blocked');
    expect(blockedStage).toBeDefined();
    const blockedText = blockedStage!.whatIsNotDone.join(' ');
    expect(blockedText).toContain('persistence');
    expect(blockedText).toContain('WorkItem');
    expect(blockedText).toContain('Matter');
    expect(blockedText).toContain('DocumentRef');
    expect(blockedStage!.proofScenario).toContain('Stage 20A');
    expect(blockedStage!.whatIsDone).toContain('תצוגת חבילת אישור בלבד — מבוסס מטא־דאטה סטטי');
  });

  it('exports the exact roadmap banner', () => {
    expect(BRAIN_BUILD_STAGE_ROADMAP_BANNER).toBe(
      'מפת שלבי יסוד — תצוגת מבנה בלבד. כל מה שמסומן "נבנה" הוכח חזותית על קלט סטטי ידוע בלבד. המוח לא תפעולי. אין שמירה. אין פעולה חיה.',
    );
  });

  it('exports the working roadmap clarification and static control flags', () => {
    expect(BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE).toBe(
      'מפת שלבים זו היא מפת עבודה ניתנת לעדכון. שינוי במפה אינו פעולה תפעולית ואינו משנה נתונים במערכת.',
    );
    expect(BRAIN_BUILD_STAGE_ROADMAP_CONTROL.roadmapStatus).toBe('working_plan_only');
    expect(BRAIN_BUILD_STAGE_ROADMAP_CONTROL.canBeReordered).toBe(true);
    expect(BRAIN_BUILD_STAGE_ROADMAP_CONTROL.requiresEldadApprovalForRoadmapChange).toBe(true);
  });

  it('exports the exact roadmap divider', () => {
    expect(BRAIN_BUILD_STAGE_ROADMAP_DIVIDER).toContain('תשתית שלא קיימת');
    expect(BRAIN_BUILD_STAGE_ROADMAP_DIVIDER).toContain('preview');
  });

  it('does not contain percentage signs in roadmap data', () => {
    expect(serializedRoadmapText()).not.toContain('%');
  });

  it('does not contain ETA in roadmap data except in negative phrasing', () => {
    for (const stage of roadmapStages()) {
      const allText = [
        stage.title,
        stage.proofScenario,
        ...stage.whatIsDone,
        ...stage.whatIsNotDone,
        stage.nextGate,
      ].join(' ');
      if (allText.includes('ETA')) {
        expect(allText).toContain('אין ETA');
      }
    }
  });

  it('does not use positive readiness or approval wording in roadmap stage meanings', () => {
    const banned = ['opera' + 'tional', 'rea' + 'dy', 'app' + 'roved', 'com' + 'plete', 'deploy', 'production'];
    const searchableText = roadmapStages()
      .flatMap((stage) => [stage.title, stage.proofScenario, ...stage.whatIsDone])
      .join(' ')
      .replaceAll('preview-complete_metadata_only', '')
      .toLowerCase();

    for (const word of banned) {
      expect(searchableText).not.toContain(word.toLowerCase());
    }
  });

  it('keeps the stage list in vertical groups without action wording fields', () => {
    const serializedRoadmap = [
      serializedRoadmapText(),
      BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE,
      JSON.stringify(BRAIN_BUILD_STAGE_ROADMAP_CONTROL),
    ].join(' ');

    expect(serializedRoadmap).not.toMatch(/\bfinal\b/i);
    expect(serializedRoadmap).not.toMatch(/\bfixed\b/i);
    expect(serializedRoadmap).not.toMatch(/\bimmutable\b/i);
    expect(serializedRoadmap).not.toMatch(/\blocked roadmap\b/i);

    for (const stage of roadmapStages()) {
      expect(stage).not.toHaveProperty('taskId');
      expect(stage).not.toHaveProperty('workItemId');
      expect(stage).not.toHaveProperty('matterId');
      expect(stage).not.toHaveProperty('documentRefId');
    }
  });

  it('includes a compactLine for every roadmap stage', () => {
    for (const stage of roadmapStages()) {
      expect(typeof stage.compactLine).toBe('string');
      expect(stage.compactLine.length).toBeGreaterThan(0);
    }
  });

  it('exports status icons for all four roadmap statuses', () => {
    expect(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.built).toBe('✅');
    expect(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.current).toBe('◀');
    expect(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.next).toBe('○');
    expect(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.blocked).toBe('🔒');
  });

});
// #endregion
