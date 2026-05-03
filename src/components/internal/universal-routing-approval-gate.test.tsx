/* ============================================
   FILE: universal-routing-approval-gate.test.tsx
   PURPOSE: Focused tests for the local-only Universal Routing approval gate mock UI.
   DEPENDENCIES: Vitest, React, react-dom, react-dom/server, fs, UniversalRoutingApprovalGate
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UniversalRoutingApprovalGate from './UniversalRoutingApprovalGate';
// #endregion

// #region Constants
const projectRoot = process.cwd().replace(/\\/g, '/');
const componentSource = readFileSync(`${projectRoot}/src/components/internal/UniversalRoutingApprovalGate.tsx`, 'utf8');
const approvalFields = [
  'approvedBy',
  'approvedOutcome',
  'approvedEntity',
  'approvedCaseOrProcess',
  'approvedTargetFolder',
  'approvedReason',
  'evidenceReviewed',
];
const blockerLabels = [
  'missing entity/client',
  'missing case/process',
  'evidence not checked',
  'low confidence',
  'unknown outcome',
  'conflicting suggestions',
  'missing target folder for filing',
];
const forbiddenActionLabels = ['Create', 'Promote', 'Execute', 'File', 'Route'];
const forbiddenImportPatterns = [
  /from\s+['"][^'"]*store[^'"]*['"]/i,
  /from\s+['"][^'"]*persistence[^'"]*['"]/i,
  /from\s+['"][^'"]*gmailService[^'"]*['"]/,
  /from\s+['"][^'"]*driveService[^'"]*['"]/,
  /from\s+['"][^'"]*ocr[^'"]*['"]/i,
  /from\s+['"][^'"]*run-create-work-item[^'"]*['"]/,
];
const forbiddenSourceSnippets = [
  'fetch(',
  'googleapis',
  'axios',
  'useBrainStore',
  'useMatterStore',
  'createWorkItem(',
  'createMatter(',
  'createDocumentRef(',
  'node:path',
];

let container: HTMLDivElement;
let root: Root;
// #endregion

// #region Helpers
function renderInteractiveGate() {
  act(() => {
    root.render(React.createElement(UniversalRoutingApprovalGate));
  });
}

function byTestId<T extends Element>(testId: string): T {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) throw new Error(`Missing test id: ${testId}`);
  return element as T;
}

function setNativeValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element) as HTMLInputElement | HTMLSelectElement;
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
    return;
  }

  valueSetter?.call(element, value);
}

function changeInput(testId: string, value: string) {
  const input = byTestId<HTMLInputElement>(testId);
  act(() => {
    setNativeValue(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function changeSelect(testId: string, value: string) {
  const select = byTestId<HTMLSelectElement>(testId);
  act(() => {
    setNativeValue(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
// #endregion

// #region Tests
describe('Universal Routing Approval Gate', () => {
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
  });

  it('renders the local-only approval gate, approval fields, blockers, and audit preview', () => {
    const markup = renderToStaticMarkup(React.createElement(UniversalRoutingApprovalGate));

    expect(markup).toContain('Routing Approval Gate — mock / local only');
    expect(markup).toContain('mock gate / local state only');
    expect(markup).toContain('Audit text preview');
    expect(markup).toContain('Mock audit preview only');

    for (const field of approvalFields) {
      expect(markup).toContain(field);
    }

    for (const blocker of blockerLabels) {
      expect(markup).toContain(blocker);
    }
  });

  it('shows hard safety flags and keeps operational action blocked', () => {
    const markup = renderToStaticMarkup(React.createElement(UniversalRoutingApprovalGate));

    expect(markup).toContain('canCreateWorkItem=false');
    expect(markup).toContain('canCreateMatter=false');
    expect(markup).toContain('canCreateDocumentRef=false');
    expect(markup).toContain('requiresEldadApproval=true');
    expect(markup).toContain('operationalActionBlocked=true');
    expect(markup).toContain('Allowed later action: none until a separate real-action gate is approved.');
  });

  it('allows local typing only and does not write to browser storage or network', () => {
    const localSetItem = vi.fn();
    const sessionSetItem = vi.fn();
    const indexedOpen = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: localSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('sessionStorage', { getItem: vi.fn(), setItem: sessionSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: vi.fn() });
    vi.stubGlobal('fetch', fetchSpy);

    renderInteractiveGate();

    changeInput('routing-approval-approved-by', 'Eldad');
    changeSelect('routing-approval-approved-outcome', 'task');
    changeInput('routing-approval-approved-entity', 'Runtime mock entity');
    changeInput('routing-approval-approved-case-or-process', 'Runtime mock process');
    changeInput('routing-approval-approved-reason', 'Local mock approval only');
    act(() => {
      byTestId<HTMLInputElement>('routing-approval-evidence-reviewed').click();
    });

    expect(container.textContent).toContain('Eldad reviewed a task routing outcome');
    expect(container.textContent).toContain('Entity/client: Runtime mock entity.');
    expect(container.textContent).toContain('Reason: Local mock approval only.');
    expect(container.textContent).toContain('Evidence reviewed: true.');
    expect(container.textContent).toContain('operationalActionBlocked=true');
    expect(localSetItem).not.toHaveBeenCalled();
    expect(sessionSetItem).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders no forbidden operational action buttons', () => {
    const markup = renderToStaticMarkup(React.createElement(UniversalRoutingApprovalGate));

    expect((markup.match(/<button/g) ?? []).length).toBe(0);
    for (const label of forbiddenActionLabels) {
      expect(markup).not.toContain(`>${label}<`);
    }
  });

  it('keeps source free of store, persistence, API, OCR, and operational creation imports', () => {
    for (const pattern of forbiddenImportPatterns) {
      expect(componentSource).not.toMatch(pattern);
    }

    for (const snippet of forbiddenSourceSnippets) {
      expect(componentSource).not.toContain(snippet);
    }
  });
});
// #endregion
