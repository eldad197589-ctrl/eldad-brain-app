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
  BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS,
  BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE,
} from '../../../work-spine/build-progress/brain-build-progress-console-seed';
import {
  BRAIN_SYSTEM_SOURCE_MAP_ROW_WARNING,
  BRAIN_SYSTEM_SOURCE_MAP_ROWS,
  BRAIN_SYSTEM_SOURCE_MAP_TITLE,
  BRAIN_SYSTEM_SOURCE_MAP_WARNING,
} from '../../../work-spine/build-progress/brain-system-source-map-seed';
import {
  BRAIN_VISUAL_PROCESS_PENDING_CANDIDATES,
  BRAIN_VISUAL_PROCESS_REGISTRY_ROWS,
  BRAIN_VISUAL_PROCESS_REGISTRY_TITLE,
  BRAIN_VISUAL_PROCESS_REGISTRY_WARNING,
} from '../../../work-spine/build-progress/brain-visual-process-registry-seed';
import {
  EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS,
  EXTERNAL_KNOWLEDGE_SOURCE_ROW_WARNING,
  EXTERNAL_KNOWLEDGE_SOURCES_MAP_TITLE,
  EXTERNAL_KNOWLEDGE_SOURCES_MAP_WARNING,
} from '../../../work-spine/build-progress/external-knowledge-sources-map-seed';
import brainBuildProgressConsoleSource from './BrainBuildProgressConsole.tsx?raw';
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
  'מסכים מוצגים פעילים',
  'פעולות חיות פעילות',
  'Commit קשור',
  'איפה רואים',
  'מה מוצג במסך',
  'מה נבנה',
  'מה אלדד רואה',
  'השלב הבטוח הבא',
  'סטטוס בטיחות',
  'סטטוס נוכחי',
  'סטטוס תצוגה',
  'סיווג משטח',
  'פעולות חסומות',
  'תצוגת טבלת מיפוי מע״מ',
  'מלאי משטחי מוח חזותיים',
  'מפת מצב המוח ומקורותיו',
  'רשימת תהליכי המוח הוויזואלי',
  'מפת מקורות ידע חיצוניים',
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
  /brainStore/,
  /work-spine\/.*repository/i,
  /work-spine\/.*use-cases/i,
  /from ['"]fs['"]/,
  /from ['"]path['"]/,
  /from ['"]xlsx['"]/,
  /from ['"].*provider/i,
  /fetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /OAuth/,
  /OCR/,
  /Supabase/,
  /\bDB\b/,
  /from ['"].*runtime/i,
  /import\s+.*WorkItem/,
  /import\s+.*Matter/,
  /import\s+.*DocumentRef/,
] as const;

const REQUIRED_HEBREW_STAGE_TITLES = [
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
  'הרחבת ראיות סריקה אמיתיות',
  'שער תפעולי מוגבל ראשון',
] as const;

const COMPACT_FORBIDDEN_DETAIL_LABELS = [
  'משמעות סטטית / preview',
  'מה עדיין לא קיים',
  'פעולות חסומות',
  'שער הבא',
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
        '[data-testid="brain-system-source-map"]',
        '[data-testid="brain-visual-process-registry"]',
        '[data-testid="external-knowledge-sources-map"]',
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
    expect(html).toContain('16bfd89');
    for (const text of HEBREW_COPY) {
      expect(html).toContain(text);
    }
  });

  it('renders the static progress item count and top metric values', () => {
    const { container, cleanup } = mountConsole();
    try {
      expect(container.querySelectorAll('[data-testid="build-progress-item"]')).toHaveLength(14);
      const metricsText = container.querySelector('[data-testid="build-progress-top-metrics"]')?.textContent ?? '';
      expect(metricsText).toContain(String(BRAIN_BUILD_PROGRESS_ITEMS.length));
      expect(metricsText).toContain('8');
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

  it('does not import or call forbidden live surfaces in the component source', () => {
    for (const forbiddenPattern of FORBIDDEN_SOURCE_PATTERNS) {
      expect(brainBuildProgressConsoleSource).not.toMatch(forbiddenPattern);
    }
  });

  it('renders the Work Spine bootstrap stability checkpoint without action controls', () => {
    const { container, cleanup } = mountConsole();
    try {
      const renderedText = container.textContent ?? '';
      expect(renderedText).toContain('תיקון יציבות אתחול Work Spine');
      expect(renderedText).toContain('e6c15e9');
      expect(renderedText).toContain('המסך עולה ללא מסך כחול לאחר רענון');
      expect(renderedText).toContain('אין יצירת WorkItem אמיתי ללא אישור');
      expect(renderedText).toContain('אין DocumentRef');
      expect(renderedText).toContain('אין חיבור ספקים');
      expect(container.querySelectorAll('button')).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it('renders the Stage 17 source and process map checkpoint without action controls', () => {
    const { container, cleanup } = mountConsole();
    try {
      const renderedText = container.textContent ?? '';
      expect(renderedText).toContain('מפת מצב המוח ומקורותיו');
      expect(renderedText).toContain('4b05db3');
      expect(renderedText).toContain('מה מוצג במסך: מוצגת מפת מקורות ומערכות, יחד עם רשימת תהליכי המוח הוויזואלי.');
      expect(renderedText).toContain('מפת שלבי בניית המוח: 17 נבנו · 1 עכשיו · 1 ממתין · 1 חסום.');
      expect(renderedText).toContain(
        'רשימת תהליכי המוח הוויזואלי: 7 קטגוריות · 22 תהליכים · 17 נבנו · 2 בבנייה · 3 ממתינים.',
      );
      expect(renderedText).toContain('נתוני התהליכים מתארים את המוח הוויזואלי בלבד, ולא מוכנות תפעולית של המערכת.');
      expect(renderedText).not.toContain('סטטוס תהליכים 17/2/3');
      expect(renderedText).not.toContain('הוכחת תצוגה');
      expect(renderedText).toContain('אין קריאת תיקיות');
      expect(renderedText).toContain('אין OCR');
      expect(renderedText).toContain('אין חיבור Gmail/Drive/Maven');
      expect(renderedText).toContain('אין WorkItem');
      expect(renderedText).toContain('אין Matter');
      expect(renderedText).toContain('אין DocumentRef');
      expect(container.querySelectorAll('button')).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it('renders the source ecosystem map after the roadmap and before the long history', () => {
    const { container, cleanup } = mountConsole();
    try {
      const sourceMap = container.querySelector('[data-testid="brain-system-source-map"]');
      const roadmap = container.querySelector('[data-testid="brain-build-stage-roadmap"]');
      const firstHistoryItem = container.querySelector('[data-testid="build-progress-item"]');

      expect(sourceMap).not.toBeNull();
      expect(roadmap).not.toBeNull();
      expect(firstHistoryItem).not.toBeNull();
      expect(Boolean(roadmap!.compareDocumentPosition(sourceMap!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
      expect(Boolean(sourceMap!.compareDocumentPosition(firstHistoryItem!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('renders the exact source map warnings and 20 index-only rows', () => {
    const { container, cleanup } = mountConsole();
    try {
      const sourceMap = container.querySelector('[data-testid="brain-system-source-map"]');
      expect(sourceMap).not.toBeNull();
      const sourceMapText = sourceMap!.textContent ?? '';
      expect(sourceMapText).toContain(BRAIN_SYSTEM_SOURCE_MAP_TITLE);
      expect(sourceMapText).toContain(BRAIN_SYSTEM_SOURCE_MAP_WARNING);
      expect(sourceMapText).toContain(BRAIN_SYSTEM_SOURCE_MAP_ROW_WARNING);
      expect(sourceMap!.querySelectorAll('[data-testid="brain-system-source-row"]')).toHaveLength(20);
      expect(BRAIN_SYSTEM_SOURCE_MAP_ROWS).toHaveLength(20);
    } finally {
      cleanup();
    }
  });

  it('renders conservative source statuses without action controls', () => {
    const { container, cleanup } = mountConsole();
    try {
      const sourceMapText = container.querySelector('[data-testid="brain-system-source-map"]')?.textContent ?? '';
      expect(sourceMapText).toContain('Gmail/Drive exports');
      expect(sourceMapText).toContain('חיבור חי חסום');
      expect(sourceMapText).toContain('סריקות');
      expect(sourceMapText).toContain('לא נקראה תיקייה');
      expect(sourceMapText).toContain('לא הופעל OCR');
      expect(sourceMapText).toContain('דימה');
      expect(sourceMapText).toContain('צילה');
      expect(sourceMapText).toContain('לא מאשרת שתוכן תיק נקרא');
      expect(sourceMapText).toContain('לא מאשרת תלושים');
      expect(container.querySelectorAll('button')).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it('renders the visual Brain process registry as a static/index-only snapshot', () => {
    const { container, cleanup } = mountConsole();
    try {
      const registry = container.querySelector('[data-testid="brain-visual-process-registry"]');
      expect(registry).not.toBeNull();
      const registryText = registry!.textContent ?? '';
      expect(registryText).toContain(BRAIN_VISUAL_PROCESS_REGISTRY_TITLE);
      expect(registryText).toContain(BRAIN_VISUAL_PROCESS_REGISTRY_WARNING);
      expect(registryText).toContain(
        'רשימת תהליכי המוח הוויזואלי: 7 קטגוריות · 22 תהליכים · 17 נבנו · 2 בבנייה · 3 ממתינים.',
      );
      expect(registry!.querySelectorAll('[data-testid="brain-visual-process-group"]')).toHaveLength(7);
      expect(registry!.querySelectorAll('[data-testid="brain-visual-process-row"]')).toHaveLength(22);
      expect(BRAIN_VISUAL_PROCESS_REGISTRY_ROWS).toHaveLength(22);
    } finally {
      cleanup();
    }
  });

  it('renders the external knowledge sources map after Stage 17 sections and before history', () => {
    const { container, cleanup } = mountConsole();
    try {
      const visualRegistry = container.querySelector('[data-testid="brain-visual-process-registry"]');
      const externalMap = container.querySelector('[data-testid="external-knowledge-sources-map"]');
      const firstHistoryItem = container.querySelector('[data-testid="build-progress-item"]');

      expect(visualRegistry).not.toBeNull();
      expect(externalMap).not.toBeNull();
      expect(firstHistoryItem).not.toBeNull();
      expect(Boolean(visualRegistry!.compareDocumentPosition(externalMap!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
      expect(Boolean(externalMap!.compareDocumentPosition(firstHistoryItem!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('renders the exact external source warnings and approved compact rows', () => {
    const { container, cleanup } = mountConsole();
    try {
      const externalMap = container.querySelector('[data-testid="external-knowledge-sources-map"]');
      expect(externalMap).not.toBeNull();
      const externalMapText = externalMap!.textContent ?? '';
      expect(externalMapText).toContain(EXTERNAL_KNOWLEDGE_SOURCES_MAP_TITLE);
      expect(externalMapText).toContain(EXTERNAL_KNOWLEDGE_SOURCES_MAP_WARNING);
      expect(externalMapText).toContain(EXTERNAL_KNOWLEDGE_SOURCE_ROW_WARNING);
      expect(externalMapText).toContain('Section 102/102A income tax knowledge');
      expect(externalMapText).toContain('Urgent scans 2026-05-05 mixed intake');
      expect(externalMap!.querySelectorAll('[data-testid="external-knowledge-source-row"]')).toHaveLength(21);
      expect(EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS).toHaveLength(21);
      expect(container.querySelectorAll('button')).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it('renders provider and folder source candidates as blocked index rows', () => {
    const { container, cleanup } = mountConsole();
    try {
      const externalMapText = container.querySelector('[data-testid="external-knowledge-sources-map"]')?.textContent ?? '';
      expect(externalMapText).toContain('Gmail data exports');
      expect(externalMapText).toContain('Drive data exports');
      expect(externalMapText).toContain('חיבור חי חסום');
      expect(externalMapText).toContain('סריקות folder');
      expect(externalMapText).toContain('לקוחות folder');
      expect(externalMapText).toContain('Maven/VAT source folders');
      expect(externalMapText).toContain('גישה לקובץ/תיקייה חסומה');
      expect(externalMapText).toContain('legacy/generated Dima source folders');
      expect(externalMapText).toContain('legacy/generated Tsila source folders');
      expect(externalMapText).toContain('לא ידוע, נדרש Audit');
      expect(externalMapText).toContain('indexOnly:true');
      expect(externalMapText).toContain('contentRead:false');
      expect(externalMapText).toContain('sourceParsed:false');
      expect(externalMapText).toContain('ocrPerformed:false');
      expect(externalMapText).toContain('providerConnected:false');
      expect(externalMapText).toContain('sourceVerified:false');
      expect(externalMapText).toContain('dataCurrentVerified:false');
      expect(externalMapText).toContain('canCreateRecord:false');
      expect(externalMapText).toContain('canActOnSource:false');
      expect(container.querySelectorAll('button')).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it('renders required visual process labels and pending candidates', () => {
    const { container, cleanup } = mountConsole();
    try {
      const registryText = container.querySelector('[data-testid="brain-visual-process-registry"]')?.textContent ?? '';
      const requiredProcesses = [
        'פיצויי מלחמה',
        'ביטול קנסות',
        'מחזור חיי עובד',
        'בוט מכתבים',
        'אפוטרופוס',
        'רווח הון ממקרקעין בחו"ל',
        'דוחות מוסדיים',
        'קליטת לקוחות ותמחור',
      ];
      const requiredPendingCandidates = ['מע"מ חודשי', 'דוח שנתי', 'ביטוח לאומי', 'דמי הבראה', 'חישובי פיצויים', 'הסכם קיבוצי'];

      for (const processLabel of requiredProcesses) {
        expect(registryText).toContain(processLabel);
      }
      for (const candidate of requiredPendingCandidates) {
        expect(BRAIN_VISUAL_PROCESS_PENDING_CANDIDATES).toContain(candidate);
        expect(registryText).toContain(candidate);
      }
      expect(registryText).toContain('visualPresenceOnly:true');
      expect(registryText).toContain('indexOnly:true');
      expect(registryText).toContain('operationalReady:false');
      expect(registryText).toContain('canExecute:false');
      expect(registryText).toContain('canCreateRecord:false');
      expect(container.querySelectorAll('button')).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it('uses exported roadmap status icons without a local symbol table', () => {
    expect(brainBuildProgressConsoleSource).toContain('BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS');
    expect(brainBuildProgressConsoleSource).not.toContain('ROADMAP_STATUS_SYMBOLS');
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
      expect(text).toContain('מפת שלבי בניית המוח: 17 נבנו · 1 עכשיו · 1 ממתין · 1 חסום.');
      for (const group of BRAIN_BUILD_STAGE_ROADMAP_GROUPS) {
        expect(text).toContain(group.title);
        expect(text).toContain(group.subtitle);
      }
      expect(container.querySelectorAll('[data-testid="roadmap-group"]')).toHaveLength(3);
    } finally {
      cleanup();
    }
  });

  it('renders 20 compact roadmap stages with the approved status labels', () => {
    const { container, cleanup } = mountConsole();
    try {
      const compactStages = container.querySelectorAll('[data-testid="roadmap-stage"]');
      expect(compactStages).toHaveLength(20);
      for (const stage of compactStages) {
        expect(stage.children.length).toBeLessThanOrEqual(2);
      }
      const labels = Array.from(container.querySelectorAll('[data-testid="roadmap-status-label"]')).map(
        (element) => element.textContent,
      );
      expect(labels).toContain('נבנה');
      expect(labels).toContain('עכשיו');
      expect(labels).toContain('ממתין');
      expect(labels).toContain('חסום');
      expect(container.textContent).toContain(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.built);
      expect(container.textContent).toContain(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.current);
      expect(container.textContent).toContain(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.next);
      expect(container.textContent).toContain(BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS.blocked);
    } finally {
      cleanup();
    }
  });

  it('renders the exact roadmap summary counter', () => {
    const { container, cleanup } = mountConsole();
    try {
      const counterText = container.querySelector('[data-testid="roadmap-summary-counter"]')?.textContent ?? '';
      expect(counterText).toBe('מפת שלבי בניית המוח: 17 נבנו · 1 עכשיו · 1 ממתין · 1 חסום.');
    } finally {
      cleanup();
    }
  });

  it('renders compactLine text for stage 1 and stage 17', () => {
    const { container, cleanup } = mountConsole();
    try {
      const stages = roadmapStages();
      const roadmapText = container.querySelector('[data-testid="brain-build-stage-roadmap"]')?.textContent ?? '';
      expect(roadmapText).toContain(stages[0].compactLine);
      expect(roadmapText).toContain(stages[16].compactLine);
    } finally {
      cleanup();
    }
  });

  it('renders stage 17 title and status separated, not concatenated', () => {
    const { container, cleanup } = mountConsole();
    try {
      const compactStages = Array.from(container.querySelectorAll('[data-testid="roadmap-stage"]'));
      const stage17 = compactStages.find((el) => el.textContent?.includes('17.'));
      expect(stage17).toBeDefined();
      const text = stage17!.textContent ?? '';
      expect(text).toContain('מפת מצב המוח ומקורותיו');
      expect(text).toContain('נבנה');
      // Verify they are NOT concatenated — there must be a separator between title and status
      expect(text).not.toContain('מקורותיונבנה');
      expect(text).not.toContain('מצב המוח הוויזואלי');
    } finally {
      cleanup();
    }
  });

  it('renders stage 18 as the current roadmap pointer and keeps stage 20 blocked', () => {
    const { container, cleanup } = mountConsole();
    try {
      const compactStages = Array.from(container.querySelectorAll('[data-testid="roadmap-stage"]'));
      const stage18 = compactStages.find((el) => el.textContent?.includes('18.'));
      const stage20 = compactStages.find((el) => el.textContent?.includes('20.'));
      expect(stage18).toBeDefined();
      expect(stage20).toBeDefined();
      expect(stage18!.textContent ?? '').toContain('מפת מקורות ידע חיצוניים');
      expect(stage18!.textContent ?? '').toContain('עכשיו');
      expect(stage20!.textContent ?? '').toContain('שער תפעולי מוגבל ראשון');
      expect(stage20!.textContent ?? '').toContain('חסום');
    } finally {
      cleanup();
    }
  });

  it('renders all 20 Hebrew stage titles in the compact roadmap', () => {
    const { container, cleanup } = mountConsole();
    try {
      const roadmapText = container.querySelector('[data-testid="brain-build-stage-roadmap"]')?.textContent ?? '';
      for (const title of REQUIRED_HEBREW_STAGE_TITLES) {
        expect(roadmapText).toContain(title);
      }
    } finally {
      cleanup();
    }
  });

  it('does NOT render repeated detail labels in the compact roadmap section', () => {
    const { container, cleanup } = mountConsole();
    try {
      const roadmapText = container.querySelector('[data-testid="brain-build-stage-roadmap"]')?.textContent ?? '';
      for (const forbidden of COMPACT_FORBIDDEN_DETAIL_LABELS) {
        expect(roadmapText).not.toContain(forbidden);
      }
    } finally {
      cleanup();
    }
  });

  it('long progress history below the roadmap still renders detailed fields', () => {
    const { container, cleanup } = mountConsole();
    try {
      const roadmap = container.querySelector('[data-testid="brain-build-stage-roadmap"]');
      const firstHistoryItemElement = container.querySelector('[data-testid="build-progress-item"]');
      expect(roadmap).not.toBeNull();
      expect(firstHistoryItemElement).not.toBeNull();
      expect(Boolean(roadmap!.compareDocumentPosition(firstHistoryItemElement!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
      const firstHistoryItem = firstHistoryItemElement!.textContent ?? '';
      expect(firstHistoryItem).toContain('מה מוצג במסך');
      expect(firstHistoryItem).toContain('מה נבנה');
      expect(firstHistoryItem).toContain('מה אלדד רואה');
      expect(firstHistoryItem).toContain('השלב הבטוח הבא');
      expect(firstHistoryItem).toContain('מה עדיין חסום');
      expect(firstHistoryItem).toContain('פעולות חסומות');
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

  it('keeps the roadmap free of progress UI and ETA text', () => {
    const { container, cleanup } = mountConsole();
    try {
      const roadmap = container.querySelector('[data-testid="brain-build-stage-roadmap"]')!;
      expect(roadmap.querySelectorAll('button')).toHaveLength(0);
      expect(roadmap.querySelector('[role="progressbar"]')).toBeNull();
      expect(roadmap.textContent).not.toContain('%');
      expect(roadmap.textContent).not.toContain('ETA');
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
