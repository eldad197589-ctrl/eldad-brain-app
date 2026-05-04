/* ==== FILE: src/pages/internal/brain-build-progress/BrainBuildProgressConsole.test.tsx ==== */

// @vitest-environment happy-dom

// #region Imports
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
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
  BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE,
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
const HEBREW_COPY = [
  'מסך התקדמות בניית המוח',
  'נקודות בנייה שננעלו',
  'הוכחות תצוגה פעילות',
  'פעולות חיות פעילות',
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
  'פעולות חסומות',
  'תצוגת טבלת מיפוי מע״מ',
  'מלאי משטחי מוח חזותיים',
] as const;

const INTERNAL_LABELS = [
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
  'create_work_item',
  'create_matter',
  'create_document_ref',
] as const;

const BANNED_WORDING = [
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
  /** Cleanup callback for the mounted console. */
  cleanup: () => void;
}
// #endregion

// #region Helpers
const renderConsole = (): string => renderToStaticMarkup(<BrainBuildProgressConsole />);

const roadmapStages = () => BRAIN_BUILD_STAGE_ROADMAP_GROUPS.flatMap((group) => group.stages);

const mountConsole = (): MountedConsole => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<BrainBuildProgressConsole />);
  });

  return {
    container,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const textWithoutAllowedNegativeSections = (container: HTMLElement): string => {
  const clone = container.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      [
        '[data-testid="build-progress-safety-notices"]',
        '[data-testid="build-progress-still-blocked"]',
        '[data-testid="build-progress-blocked-actions"]',
        '[data-testid="build-progress-top-metrics"]',
        '[data-testid="roadmap-not-done"]',
        '[data-testid="roadmap-blocked-reason"]',
        '[data-testid="roadmap-blocked-actions"]',
      ].join(', '),
    )
    .forEach((element) => element.remove());

  return clone.textContent?.toLowerCase() ?? '';
};
// #endregion

// #region Tests
describe('BrainBuildProgressConsole', () => {
  it('renders route, warnings, Hebrew labels, metrics, and latest change', () => {
    const html = renderConsole();

    expect(html).toContain(BRAIN_BUILD_PROGRESS_ROUTE);
    expect(html).toContain(BRAIN_BUILD_PROGRESS_WARNING);
    expect(html).toContain(BRAIN_BUILD_LATEST_CHANGE_WARNING);
    expect(html.indexOf('מה השתנה עכשיו')).toBeLessThan(html.indexOf('נקודות בנייה שננעלו'));
    expect(html).toContain(BRAIN_BUILD_LATEST_CHANGE_SUMMARY.title);
    expect(html).toContain('0132154');
    for (const text of HEBREW_COPY) {
      expect(html).toContain(text);
    }
  });

  it('renders the static progress item count and top metric values', () => {
    const { container, cleanup } = mountConsole();
    try {
      expect(container.querySelectorAll('[data-testid="build-progress-item"]')).toHaveLength(12);
      const metricsText = container.querySelector('[data-testid="build-progress-top-metrics"]')?.textContent ?? '';
      expect(metricsText).toContain(String(BRAIN_BUILD_PROGRESS_ITEMS.length));
      expect(metricsText).toContain('6');
      expect(metricsText).toContain('0');
    } finally {
      cleanup();
    }
  });

  it('does not render raw internal labels or action controls', () => {
    const { container, cleanup } = mountConsole();
    try {
      const renderedText = container.textContent ?? '';
      for (const internalLabel of INTERNAL_LABELS) {
        expect(renderedText).not.toContain(internalLabel);
      }
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelector('[role="progressbar"]')).toBeNull();
      expect(renderedText).not.toContain('%');
    } finally {
      cleanup();
    }
  });

  it('does not use banned wording outside blocked or negative contexts', () => {
    const { container, cleanup } = mountConsole();
    try {
      const searchableText = textWithoutAllowedNegativeSections(container);
      for (const bannedWord of BANNED_WORDING) {
        expect(searchableText).not.toMatch(new RegExp(`\\b${bannedWord}\\b`, 'i'));
      }
    } finally {
      cleanup();
    }
  });

  it('does not import or call forbidden live surfaces in component, summary, or roadmap data', () => {
    const componentText = BrainBuildProgressConsole.toString();
    const serializedStaticData = JSON.stringify([
      BRAIN_BUILD_PROGRESS_ITEMS,
      BRAIN_BUILD_LATEST_CHANGE_SUMMARY,
      BRAIN_BUILD_STAGE_ROADMAP_GROUPS,
    ]);

    for (const forbiddenPattern of FORBIDDEN_SOURCE_PATTERNS) {
      expect(componentText).not.toMatch(forbiddenPattern);
      expect(serializedStaticData).not.toMatch(forbiddenPattern);
    }
  });
});

describe('BrainBuildStageRoadmap', () => {
  it('renders the roadmap title, exact banner, groups, and divider', () => {
    const { container, cleanup } = mountConsole();
    try {
      const text = container.textContent ?? '';
      expect(text).toContain('מפת שלבי בניית המוח');
      expect(text).toContain(BRAIN_BUILD_STAGE_ROADMAP_BANNER);
      expect(text).toContain(BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE);
      expect(text).toContain(`roadmapStatus:${BRAIN_BUILD_STAGE_ROADMAP_CONTROL.roadmapStatus}`);
      expect(text).toContain(`canBeReordered:${String(BRAIN_BUILD_STAGE_ROADMAP_CONTROL.canBeReordered)}`);
      expect(text).toContain(
        `requiresEldadApprovalForRoadmapChange:${String(
          BRAIN_BUILD_STAGE_ROADMAP_CONTROL.requiresEldadApprovalForRoadmapChange,
        )}`,
      );
      expect(text).toContain(BRAIN_BUILD_STAGE_ROADMAP_DIVIDER);
      for (const group of BRAIN_BUILD_STAGE_ROADMAP_GROUPS) {
        expect(text).toContain(group.title);
        expect(text).toContain(group.subtitle);
      }
      expect(container.querySelectorAll('[data-testid="roadmap-group"]')).toHaveLength(3);
    } finally {
      cleanup();
    }
  });

  it('renders 20 vertical roadmap rows with the approved status labels', () => {
    const { container, cleanup } = mountConsole();
    try {
      const labels = Array.from(container.querySelectorAll('[data-testid="roadmap-status-label"]')).map(
        (element) => element.textContent,
      );
      expect(container.querySelectorAll('[data-testid="roadmap-stage"]')).toHaveLength(20);
      expect(labels).toContain('נבנה');
      expect(labels).toContain('עכשיו');
      expect(labels).toContain('ממתין');
      expect(labels).toContain('חסום');
    } finally {
      cleanup();
    }
  });

  it('shows commit hashes for built stages and the blocked reason for the final stage', () => {
    const { container, cleanup } = mountConsole();
    try {
      for (const hash of roadmapStages().filter((stage) => stage.status === 'built').map((stage) => stage.relatedCommit!)) {
        expect(container.textContent).toContain(hash);
      }
      const blockedReason = container.querySelector('[data-testid="roadmap-blocked-reason"]')?.textContent ?? '';
      expect(blockedReason).toContain('persistence');
      expect(blockedReason).toContain('WorkItem');
      expect(blockedReason).toContain('Matter');
      expect(blockedReason).toContain('DocumentRef');
    } finally {
      cleanup();
    }
  });

  it('keeps the roadmap free of progress UI and limits ETA to negative phrasing', () => {
    const { container, cleanup } = mountConsole();
    try {
      const roadmap = container.querySelector('[data-testid="brain-build-stage-roadmap"]')!;
      expect(roadmap.querySelectorAll('button')).toHaveLength(0);
      expect(roadmap.querySelector('[role="progressbar"]')).toBeNull();
      expect(roadmap.textContent).not.toContain('%');
      expect(roadmap.textContent).toContain('אין ETA');
      expect(roadmap.textContent).not.toMatch(/\bfinal\b/i);
      expect(roadmap.textContent).not.toMatch(/\bfixed\b/i);
      expect(roadmap.textContent).not.toMatch(/\bimmutable\b/i);
      expect(roadmap.textContent).not.toMatch(/\blocked roadmap\b/i);
    } finally {
      cleanup();
    }
  });
});
// #endregion
