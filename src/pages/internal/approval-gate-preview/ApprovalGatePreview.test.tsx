/* ============================================
   FILE: ApprovalGatePreview.test.tsx
   PURPOSE: Focused render tests for the Stage 7C local Approval Gate simulation.
   DEPENDENCIES: Vitest, React DOM test renderer, static ApprovalDecision fixtures
   EXPORTS: Test suite
   ============================================ */

// @vitest-environment happy-dom

// #region Imports
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { STATIC_APPROVAL_DECISIONS } from '../../../work-spine/approval/approval-decision-seed';
import ApprovalGatePreview from './ApprovalGatePreview';
// #endregion

// #region Constants
const REQUIRED_STATUSES = [
  'pending_review',
  'approved_for_candidate_preview',
  'rejected',
  'needs_more_evidence',
  'blocked',
] as const;

const REQUIRED_BLOCKED_EFFECTS = [
  'canCreateWorkItem=false',
  'canCreateMatter=false',
  'canCreateDocumentRef=false',
  'canPersist=false',
  'canRoute=false',
  'canExecuteProviderAction=false',
  'canCreateTask=false',
  'canCreateCalendarItem=false',
  'canCreateWorkflowItem=false',
] as const;

const FIRST_DECISION = STATIC_APPROVAL_DECISIONS[0];
// #endregion

// #region Types
/** Mounted ApprovalGatePreview test harness. */
interface MountedPreview {
  /** Rendered container element. */
  container: HTMLDivElement;
  /** React root instance. */
  root: Root;
  /** Cleanup callback for the mounted preview. */
  cleanup: () => void;
}
// #endregion

// #region Helpers
const renderPreview = (): string => renderToStaticMarkup(<ApprovalGatePreview />);

const mountPreview = (): MountedPreview => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<ApprovalGatePreview />);
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

const getDecisionCard = (container: HTMLElement, decisionId: string): HTMLElement => {
  const cards = Array.from(
    container.querySelectorAll<HTMLElement>('[data-testid="approval-gate-preview-decision"]'),
  );
  const card = cards.find((candidateCard) => candidateCard.textContent?.includes(decisionId));

  expect(card).toBeDefined();
  return card as HTMLElement;
};

const getDecisionStatus = (container: HTMLElement, decisionId: string): string => {
  const statusElement = container.querySelector<HTMLElement>(
    `[data-testid="decision-status-${decisionId}"]`,
  );

  expect(statusElement).not.toBeNull();
  return statusElement?.textContent ?? '';
};

const getSimulatedBadge = (container: HTMLElement, decisionId: string): HTMLElement | null =>
  container.querySelector<HTMLElement>(`[data-testid="simulated-badge-${decisionId}"]`);

const clickSimulationButton = (
  container: HTMLElement,
  decisionId: string,
  buttonText: string,
): void => {
  const card = getDecisionCard(container, decisionId);
  const button = Array.from(card.querySelectorAll<HTMLButtonElement>('button')).find(
    (candidateButton) => candidateButton.textContent?.includes(buttonText),
  );

  expect(button).toBeDefined();

  act(() => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};
// #endregion

// #region Tests
describe('ApprovalGatePreview', () => {
  it('renders every static approval decision fixture', () => {
    const html = renderPreview();
    const renderedDecisions = html.match(/data-testid="approval-gate-preview-decision"/g) ?? [];

    expect(renderedDecisions).toHaveLength(STATIC_APPROVAL_DECISIONS.length);

    STATIC_APPROVAL_DECISIONS.forEach((decision) => {
      expect(html).toContain(decision.decisionId);
      expect(html).toContain(decision.sourceId);
      expect(html).toContain(decision.sourceType);
      expect(html).toContain(decision.status);
      expect(html).toContain(decision.reviewedBy);
      expect(html).toContain(decision.reviewedAt);
      expect(html).toContain(decision.decisionReason);
      expect(html).toContain(decision.allowedNextStep);
    });
  });

  it('shows metadata-preview-only approval scope for every fixture', () => {
    const html = renderPreview();
    const scopeMatches = html.match(/metadata_preview_only/g) ?? [];

    expect(scopeMatches).toHaveLength(STATIC_APPROVAL_DECISIONS.length);
  });

  it('shows every required approval status', () => {
    const html = renderPreview();

    REQUIRED_STATUSES.forEach((status) => {
      expect(html).toContain(status);
    });
  });

  it('shows all blocked operational effects as false', () => {
    const html = renderPreview();

    REQUIRED_BLOCKED_EFFECTS.forEach((effect) => {
      expect(html).toContain(effect);
    });
  });

  it('shows read-only stage warnings', () => {
    const html = renderPreview();

    expect(html).toContain('Read-only approval preview');
    expect(html).toContain('Static fixtures only');
    expect(html).toContain('Local UI simulation only');
    expect(html).toContain('No persistence');
    expect(html).toContain('No WorkItem / Matter / DocumentRef creation');
    expect(html).toContain('No provider action');
    expect(html).toContain('No operational object can be created from this preview');
  });

  it('renders the permanent simulation banner', () => {
    const html = renderPreview();

    expect(html).toContain('⚠️ סימולציה בלבד — שום פעולה לא נשמרת');
  });

  it('marks every local action button as simulation', () => {
    const html = renderPreview();

    expect(html).toContain('🧪 Approve simulation');
    expect(html).toContain('🧪 Reject simulation');
    expect(html).toContain('🧪 Needs More Evidence simulation');
    expect(html).toContain('🧪 Blocked simulation');
    expect(html).toContain('🧪 Reset simulation');
  });

  it('sets Approve simulation to approved_for_candidate_preview only', () => {
    const mountedPreview = mountPreview();

    clickSimulationButton(mountedPreview.container, FIRST_DECISION.decisionId, 'Approve');

    expect(getDecisionStatus(mountedPreview.container, FIRST_DECISION.decisionId)).toBe(
      'approved_for_candidate_preview',
    );
    expect(getDecisionStatus(mountedPreview.container, FIRST_DECISION.decisionId)).not.toBe('approved');
    expect(getSimulatedBadge(mountedPreview.container, FIRST_DECISION.decisionId)?.textContent).toBe(
      '[SIMULATED]',
    );

    mountedPreview.cleanup();
  });

  it('sets Reject simulation to rejected', () => {
    const mountedPreview = mountPreview();

    clickSimulationButton(mountedPreview.container, FIRST_DECISION.decisionId, 'Reject');

    expect(getDecisionStatus(mountedPreview.container, FIRST_DECISION.decisionId)).toBe('rejected');
    expect(getSimulatedBadge(mountedPreview.container, FIRST_DECISION.decisionId)?.textContent).toBe(
      '[SIMULATED]',
    );

    mountedPreview.cleanup();
  });

  it('sets Needs More Evidence simulation to needs_more_evidence', () => {
    const mountedPreview = mountPreview();

    clickSimulationButton(mountedPreview.container, FIRST_DECISION.decisionId, 'Needs More Evidence');

    expect(getDecisionStatus(mountedPreview.container, FIRST_DECISION.decisionId)).toBe(
      'needs_more_evidence',
    );
    expect(getSimulatedBadge(mountedPreview.container, FIRST_DECISION.decisionId)?.textContent).toBe(
      '[SIMULATED]',
    );

    mountedPreview.cleanup();
  });

  it('sets Blocked simulation to blocked', () => {
    const mountedPreview = mountPreview();

    clickSimulationButton(mountedPreview.container, FIRST_DECISION.decisionId, 'Blocked');

    expect(getDecisionStatus(mountedPreview.container, FIRST_DECISION.decisionId)).toBe('blocked');
    expect(getSimulatedBadge(mountedPreview.container, FIRST_DECISION.decisionId)?.textContent).toBe(
      '[SIMULATED]',
    );

    mountedPreview.cleanup();
  });

  it('resets a simulated status to the original static fixture status', () => {
    const mountedPreview = mountPreview();

    clickSimulationButton(mountedPreview.container, FIRST_DECISION.decisionId, 'Approve');
    clickSimulationButton(mountedPreview.container, FIRST_DECISION.decisionId, 'Reset');

    expect(getDecisionStatus(mountedPreview.container, FIRST_DECISION.decisionId)).toBe(
      FIRST_DECISION.status,
    );
    expect(getSimulatedBadge(mountedPreview.container, FIRST_DECISION.decisionId)).toBeNull();

    mountedPreview.cleanup();
  });

  it('does not expose forbidden runtime integration markers', () => {
    const html = renderPreview();
    const forbiddenRuntimeMarkers = [
      'useBrainStore',
      'useMatterStore',
      'brainStore',
      'matterStore',
      'localStorage',
      'Supabase',
      'googleapis',
      'sessionStorage',
      'OAuth',
      'OCR',
      'fetch',
      'useEffect',
    ] as const;

    forbiddenRuntimeMarkers.forEach((marker) => {
      expect(html).not.toContain(marker);
    });
  });
});
// #endregion
