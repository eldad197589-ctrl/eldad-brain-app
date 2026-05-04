/* ==== FILE: src/pages/internal/brain-build-progress/BrainBuildProgressConsole.test.tsx ==== */

// @vitest-environment happy-dom

// #region Imports
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
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
  'Progress visible does not mean operational readiness',
  'Committed means code exists, not that it is professionally correct',
  'No provider connection',
  'No source verification',
  'No task, filing, submission, or persistence action',
  'Agent A gate required before live or operational work',
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
  /WorkItem/,
  /Matter/,
  /DocumentRef/,
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

      expect(metricsText).toContain('committed checkpoints count');
      expect(metricsText).toContain('12');
      expect(metricsText).toContain('visible proof screens count');
      expect(metricsText).toContain('6');
      expect(metricsText).toContain('live actions active');
      expect(metricsText).toContain('0');
    } finally {
      cleanup();
    }
  });

  it('shows visible route, proof scenario, blocked actions, and recent commits', () => {
    const html = renderConsole();

    expect(html).toContain('/internal/manual-preview-workbench');
    expect(html).toContain('סריקות דימה');
    expect(html).toContain('ee3a06f');
    expect(html).toContain('edf165d');
    expect(html).toContain('execute');
    expect(html).toContain('external_connection');
  });

  it('renders the required safety notices', () => {
    const html = renderConsole();

    for (const notice of REQUIRED_SAFETY_NOTICES) {
      expect(html).toContain(notice);
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

    for (const forbiddenPattern of FORBIDDEN_SOURCE_PATTERNS) {
      expect(componentText).not.toMatch(forbiddenPattern);
      expect(serializedItems).not.toMatch(forbiddenPattern);
    }
  });
});
// #endregion
