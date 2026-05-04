/* ==== FILE: src/pages/internal/brain-build-progress/BrainBuildProgressConsole.test.tsx ==== */

// @vitest-environment happy-dom

// #region Imports
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BRAIN_BUILD_LATEST_CHANGE_SUMMARY,
  BRAIN_BUILD_LATEST_CHANGE_WARNING,
  BRAIN_BUILD_PROGRESS_ITEMS,
  BRAIN_BUILD_PROGRESS_ROUTE,
  BRAIN_BUILD_PROGRESS_WARNING,
} from '../../../work-spine/build-progress/brain-build-progress-console-seed';
import BrainBuildProgressConsole from './BrainBuildProgressConsole';
// #endregion

// #region Test Environment
const reactActEnvironment = globalThis as typeof globalThis & {
  /** React act environment flag used by focused DOM tests. */
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
// #endregion

// #region Constants
const REQUIRED_SAFETY_NOTICES = [
  'תצוגת התקדמות אינה מוכנות תפעולית',
  'Commit אומר שקוד קיים, לא שהוא נכון מקצועית',
  'אין חיבור ספקים',
  'אין אימות מקור',
  'אין משימה, תיוק, הגשה או שמירה',
  'נדרש שער Agent A לפני עבודה חיה או תפעולית',
] as const;

const REQUIRED_HEBREW_FIELD_LABELS = [
  'Commit קשור',
  'איפה רואים',
  'הוכחת תצוגה',
  'מה נבנה',
  'מה אלדד רואה',
  'השלב הבטוח הבא',
  'סטטוס בטיחות',
  'סטטוס נוכחי',
  'סטטוס הוכחה',
  'סיווג משטח',
  'תחום',
  'שכבה',
  'סוכן אחראי',
  'פעולות חסומות',
] as const;

const REQUIRED_HEBREW_STATUS_VALUES = [
  'נבנה ונראה במסך',
  'נבנה אך טרם מוצג במסך',
  'הוכחת תצוגה סטטית',
  'נרשם כמקור סטטי',
  'לא מוצג כמסך עצמאי',
  'תצוגה מקדימה בלבד',
  'חזותי סטטי',
  'לוח התקדמות סטטי בלבד',
] as const;

const REQUIRED_HEBREW_BLOCKED_ACTIONS = [
  'אין גישה חיה למקור',
  'אין קריאת תוכן מקור',
  'אין יצירת משימה או רשומה',
  'אין תיוק או הגשה',
  'אין כתיבה למצב שמור',
  'הרצה חסומה',
  'הגשה חסומה',
  'שליחה חסומה',
  'רישום/פרסום חסום',
  'תיוק חסום',
  'יצירת רשומה תפעולית חסומה',
  'יצירת משימת עבודה חסומה',
  'יצירת תיק חסומה',
  'יצירת הפניית מסמך חסומה',
  'שמירה חסומה',
  'חיבור חיצוני חסום',
  'קריאת תוכן מקור חסומה',
  'אוטונומיית סוכן חסומה',
] as const;

const REQUIRED_HEBREW_ITEM_TITLES = [
  'תצוגת טבלת מיפוי מע״מ',
  'מאגר ראיות מע״מ סטטי',
  'אצוות ראיות סריקה סטטית',
  'תצוגת אצוות סריקות',
  'תצוגת שער אישור',
  'מלאי ידע שלב 1',
  'תצוגת מלאי ידע',
  'רשימת בדיקת הוכחת תצוגה סטטית',
  'מועמדי ידע בטוחים שלב 2',
  'תצוגת צורת משימה היפותטית',
  'סיכום רמזי קלט',
  'מלאי משטחי מוח חזותיים',
] as const;

const FORBIDDEN_VISIBLE_INTERNAL_LABELS = [
  'relatedCommit',
  'visibleRoute',
  'proofScenario',
  'whatWasBuilt',
  'whatEldadCanSee',
  'nextSafeStep',
  'safetyStatus',
  'built_and_visible',
  'built_not_visible',
  'visible_static_preview',
  'static_reference_recorded',
  'preview_only',
  'static_progress_console_only',
  'execute',
  'submit',
  'create_work_item',
  'create_matter',
  'create_document_ref',
] as const;

const BANNED_ACTION_WORDING = [
  'operational',
  'ready',
  'live',
  'connected',
  'verified',
  'approved',
  'correct',
  'complete',
  'production',
  'execute',
  'create',
  'submit',
  'send',
  'post',
  'file',
  'persist',
  'sync',
  'automate',
  'deploy',
] as const;

const BANNED_LATEST_CHANGE_WORDING = [
  'live',
  'deployed',
  'activated',
  'enabled',
  'ready',
  'operational',
  'verified',
  'approved',
  'correct',
  'connected',
  'synced',
  'persisted',
  'executed',
  'created',
  'submitted',
  'sent',
  'posted',
  'filed',
  'production',
] as const;

const FORBIDDEN_SOURCE_PATTERNS = [
  /from ['"]fs['"]/,
  /from ['"]path['"]/,
  /fetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /OAuth/,
  /Supabase/,
  /\bDB\b/,
  /runtime/,
  /import\s+.*WorkItem/,
  /import\s+.*Matter/,
  /import\s+.*DocumentRef/,
] as const;
// #endregion

// #region Types
/** Mounted BrainBuildProgressConsole test harness. */
interface MountedConsole {
  /** Rendered container element. */
  container: HTMLDivElement;
  /** React root instance. */
  root: Root;
  /** Cleanup callback for the mounted console. */
  cleanup: () => void;
}
// #endregion

// #region Helpers
const renderConsole = (): string => renderToStaticMarkup(<BrainBuildProgressConsole />);

const mountConsole = (): MountedConsole => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<BrainBuildProgressConsole />);
  });

  return {
    container,
    root,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const textWithoutAllowedNegativeSections = (container: HTMLElement): string => {
  const clonedContainer = container.cloneNode(true) as HTMLElement;

  clonedContainer
    .querySelectorAll(
      '[data-testid="build-progress-safety-notices"], [data-testid="build-progress-still-blocked"], [data-testid="build-progress-blocked-actions"], [data-testid="build-progress-top-metrics"]',
    )
    .forEach((element) => element.remove());

  return clonedContainer.textContent?.toLowerCase() ?? '';
};
// #endregion

// #region Tests
describe('BrainBuildProgressConsole', () => {
  it('renders the console route and exact global warning', () => {
    const html = renderConsole();

    expect(html).toContain(BRAIN_BUILD_PROGRESS_ROUTE);
    expect(html).toContain(BRAIN_BUILD_PROGRESS_WARNING);
    expect(html).toContain('מסך התקדמות בניית המוח');
  });

  it('renders all static progress items and top metrics', () => {
    const { container, cleanup } = mountConsole();

    try {
      expect(container.querySelectorAll('[data-testid="build-progress-item"]')).toHaveLength(12);
      const metricsText = container.querySelector('[data-testid="build-progress-top-metrics"]')?.textContent ?? '';

      expect(metricsText).toContain('נקודות בנייה שננעלו');
      expect(metricsText).toContain('12');
      expect(metricsText).toContain('הוכחות תצוגה פעילות');
      expect(metricsText).toContain('6');
      expect(metricsText).toContain('פעולות חיות פעילות');
      expect(metricsText).toContain('0');
    } finally {
      cleanup();
    }
  });

  it('renders the latest change summary before metrics', () => {
    const html = renderConsole();

    expect(html.indexOf('מה השתנה עכשיו')).toBeLessThan(html.indexOf('נקודות בנייה שננעלו'));
    expect(html).toContain(BRAIN_BUILD_LATEST_CHANGE_WARNING);
    expect(html).toContain(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.title);
    expect(html).toContain('0132154');
    expect(html).toContain('/internal/brain-build-progress');
    expect(html).toContain(BRAIN_BUILD_PROGRESS_WARNING);
    expect(html).toContain('מידע בנייה פנימי אמיתי לקריאה בלבד');
    expect(html).toContain('אין פעולה חיה');
    expect(html).toContain('אין DocumentRef');
    expect(html).toContain('אין persistence');
    expect(html).toContain('ביקורת חזותית בלבד לפני הרחבה נוספת.');
    expect(html).toContain('סיכום התקדמות לקריאה בלבד');
  });

  it('does not use banned live deployment wording in the latest change summary', () => {
    const { container, cleanup } = mountConsole();

    try {
      const latestChange = container.querySelector('[data-testid="build-progress-latest-change"]')?.cloneNode(true) as HTMLElement;
      latestChange.querySelectorAll('[data-testid="build-progress-latest-blocked"]').forEach((element) => element.remove());
      const latestChangeText = latestChange.textContent?.toLowerCase() ?? '';

      for (const bannedWord of BANNED_LATEST_CHANGE_WORDING) {
        expect(latestChangeText).not.toMatch(new RegExp(`\\b${bannedWord}\\b`, 'i'));
      }
    } finally {
      cleanup();
    }
  });

  it('shows visible route, proof scenario, blocked actions, and recent commits in Hebrew-first copy', () => {
    const html = renderConsole();

    expect(html).toContain('/internal/manual-preview-workbench');
    expect(html).toContain('סריקות דימה');
    expect(html).toContain('ee3a06f');
    expect(html).toContain('edf165d');
    expect(html).toContain('הרצה חסומה');
    expect(html).toContain('חיבור חיצוני חסום');
  });

  it('renders the required Hebrew safety notices, labels, statuses, and item titles', () => {
    const html = renderConsole();

    for (const notice of REQUIRED_SAFETY_NOTICES) {
      expect(html).toContain(notice);
    }

    for (const label of REQUIRED_HEBREW_FIELD_LABELS) {
      expect(html).toContain(label);
    }

    for (const status of REQUIRED_HEBREW_STATUS_VALUES) {
      expect(html).toContain(status);
    }

    for (const blockedAction of REQUIRED_HEBREW_BLOCKED_ACTIONS) {
      expect(html).toContain(blockedAction);
    }

    for (const title of REQUIRED_HEBREW_ITEM_TITLES) {
      expect(html).toContain(title);
    }
  });

  it('does not render raw English or internal progress labels', () => {
    const renderedText = renderConsole();

    for (const internalLabel of FORBIDDEN_VISIBLE_INTERNAL_LABELS) {
      expect(renderedText).not.toContain(internalLabel);
    }
  });

  it('does not render action controls, progress bars, percentages, or ETA text', () => {
    const { container, cleanup } = mountConsole();

    try {
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelector('[role="progressbar"]')).toBeNull();
      expect(container.textContent).not.toContain('%');
      expect(container.textContent).not.toContain('ETA');
    } finally {
      cleanup();
    }
  });

  it('does not use banned wording outside blocked or negative contexts', () => {
    const { container, cleanup } = mountConsole();

    try {
      const searchableText = textWithoutAllowedNegativeSections(container);

      for (const bannedWord of BANNED_ACTION_WORDING) {
        expect(searchableText).not.toMatch(new RegExp(`\\b${bannedWord}\\b`, 'i'));
      }
    } finally {
      cleanup();
    }
  });

  it('does not import or call forbidden live surfaces in the component source', () => {
    const componentText = BrainBuildProgressConsole.toString();
    const serializedItems = JSON.stringify(BRAIN_BUILD_PROGRESS_ITEMS);
    const serializedLatestChange = JSON.stringify(BRAIN_BUILD_LATEST_CHANGE_SUMMARY);

    for (const forbiddenPattern of FORBIDDEN_SOURCE_PATTERNS) {
      expect(componentText).not.toMatch(forbiddenPattern);
      expect(serializedItems).not.toMatch(forbiddenPattern);
      expect(serializedLatestChange).not.toMatch(forbiddenPattern);
    }
  });
});
// #endregion
