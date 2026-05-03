/* ============================================
   FILE: unified-intake-inspector.test.tsx
   PURPOSE: Focused tests for the internal read-only unified intake inspector UI.
   DEPENDENCIES: vitest, react-dom/server, fs, UnifiedIntakeInspectorPage
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UnifiedIntakeInspectorPage from '../../pages/internal/UnifiedIntakeInspectorPage';
import { UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT } from '../../work-spine/intake/unified-intake-static-fixtures';
// #endregion

// #region Constants
const projectRoot = process.cwd().replace(/\\/g, '/');
const requiredSourceTypes = [
  'scan',
  'email',
  'google_drive',
  'client_portal',
  'lead',
  'manual',
  'uploaded_file',
];
const forbiddenImportPatterns = [
  /from\s+['"][^'"]*gmailService[^'"]*['"]/,
  /from\s+['"][^'"]*driveService[^'"]*['"]/,
  /from\s+['"][^'"]*integrationStore[^'"]*['"]/,
  /from\s+['"][^'"]*run-create-work-item[^'"]*['"]/,
  /from\s+['"][^'"]*work item repository[^'"]*['"]/i,
  /from\s+['"][^'"]*work-item-repository[^'"]*['"]/i,
];
const forbiddenSymbols = [
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'googleapis',
  'axios',
  'fetch(',
  'oauth',
  'token',
  'supabase',
  'zustand',
  'useBrainStore',
  'useMatterStore',
  'createWorkItem',
  'createMatter',
  'createDocumentRef',
  'createIntakeEvent',
  'createIntakeAttachment',
  'MatterWorkspace',
  'DocumentsPage',
  'CeoOffice',
  'Dashboard',
  'Sidebar',
];

let container: HTMLDivElement;
let root: Root;

function renderInteractiveInspector() {
  act(() => {
    root.render(React.createElement(UnifiedIntakeInspectorPage));
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

function changeSelect(testId: string, value: string) {
  const select = byTestId<HTMLSelectElement>(testId);
  act(() => {
    setNativeValue(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  return select;
}

function changeInput(testId: string, value: string) {
  const input = byTestId<HTMLInputElement>(testId);
  act(() => {
    setNativeValue(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  return input;
}
// #endregion

// #region Tests
describe('Unified Intake Inspector', () => {
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

  it('builds a static fixture snapshot for all seven unified intake sources', () => {
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.title).toBe('Unified Intake Inspector — read-only / static fixtures');
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.safetyStatus).toBe('static_fixture_read_only');
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.sources.map((source) => source.sourceType)).toEqual(requiredSourceTypes);
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.summary.sourcesCount).toBe(7);
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.summary.candidatesCount).toBe(8);
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.summary.evidenceCount).toBe(9);
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.summary.skippedItemsCount).toBe(0);
    expect(UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT.summary.errorsCount).toBe(0);
  });

  it('renders the read-only header, summary, all source sections, candidates, and evidence refs', () => {
    const setItem = vi.fn();
    const indexedOpen = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem,
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: vi.fn() });
    vi.stubGlobal('fetch', fetchSpy);

    const markup = renderToStaticMarkup(React.createElement(UnifiedIntakeInspectorPage));

    expect(markup).toContain('Unified Intake Inspector — read-only / static fixtures');
    expect(markup).toContain('Static fixtures only. No connectors, no stores, no persistence');
    expect(markup).toContain('static_fixture_read_only');
    expect(markup).toContain('Sources');
    expect(markup).toContain('Candidates');
    expect(markup).toContain('Evidence refs');
    expect((markup.match(/data-testid="unified-intake-source-section"/g) ?? []).length).toBe(7);
    expect((markup.match(/data-testid="unified-intake-candidate-card"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-intake-evidence-list"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-intake-local-review"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="universal-routing-approval-gate"/g) ?? []).length).toBe(1);

    for (const sourceType of requiredSourceTypes) {
      expect(markup).toContain(`>${sourceType}<`);
    }

    expect(markup).toContain('email_message');
    expect(markup).toContain('email_attachment');
    expect(markup).toContain('drive_file');
    expect(markup).toContain('drive_folder');
    expect(markup).toContain('portal_upload');
    expect(markup).toContain('lead_form');
    expect(markup).toContain('manual_note');
    expect(markup).toContain('file: Static uploaded file');
    expect(markup).toContain('fileName=uploaded-static-file.pdf');
    expect(markup).toContain('confidence=low');
    expect(markup).toContain('confirmed=false');
    expect(setItem).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders the mock Email and Drive connector section as read-only candidate preview', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedIntakeInspectorPage));

    expect(markup).toContain('Mock Email / Drive — read-only / no live connection');
    expect(markup).toContain('No live Email/Drive connection. No OAuth. No sync. No promotion.');
    expect(markup).toContain('Email mock status');
    expect(markup).toContain('Email provider: gmail');
    expect(markup).toContain('Live email disabled');
    expect(markup).toContain('OAuth disabled');
    expect(markup).toContain('Drive mock status');
    expect((markup.match(/mock only \/ live disabled \/ OAuth disabled/g) ?? []).length).toBe(2);
    expect((markup.match(/data-testid="mock-email-drive-candidate"/g) ?? []).length).toBe(5);
    expect(markup).toContain('Mock Dima war-compensation material');
    expect(markup).toContain('Mock VAT reporting documents');
    expect(markup).toContain('mock-tsila-summary.pdf');
    expect(markup).toContain('mock-dima-bundle');
    expect(markup).toContain('email_message');
    expect(markup).toContain('email_attachment');
    expect(markup).toContain('drive_file');
    expect(markup).toContain('drive_folder');
    expect(markup).not.toContain('>Connect<');
    expect(markup).not.toContain('>Sync<');
    expect(markup).not.toContain('>Fetch<');
    expect(markup).not.toContain('>Create<');
    expect(markup).not.toContain('>Promote<');
  });

  it('renders local review controls for every unified intake candidate across all sources', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedIntakeInspectorPage));

    expect((markup.match(/data-testid="unified-review-decision"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-proposed-title"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-proposed-owner"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-proposed-due-date"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-proposed-priority"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-proposed-matter-text"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-evidence-reviewed"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-blocked-preview"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-formal-approval-gate"/g) ?? []).length).toBe(8);
    expect((markup.match(/data-testid="unified-review-approval-gate"/g) ?? []).length).toBe(8);
    expect(markup).toContain('Local review layer — component state only');
    expect(markup).toContain('Formal Approval Gate — mock/display-only');
    expect(markup).toContain('approval is not persisted');
    expect(markup).toContain('approval is not operational');
    expect(markup).toContain('canCreateWorkItem=false');
    expect(markup).toContain('promotion remains blocked');
    expect(markup).toContain('Agent A required before any real implementation');
    expect(markup).toContain('Approval gate: blocked until Eldad approval');
    expect(markup).toContain('Routing Approval Gate — mock / local only');
    expect(markup).toContain('operationalActionBlocked=true');
  });

  it('renders locked safety statuses for every displayed candidate and evidence ref', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedIntakeInspectorPage));

    expect((markup.match(/candidateStatus=staging_candidate/g) ?? []).length).toBe(8);
    expect((markup.match(/professionalStatus=not_reviewed/g) ?? []).length).toBe(8);
    expect((markup.match(/matterResolutionStatus=unresolved/g) ?? []).length).toBe(8);
    expect((markup.match(/subjectResolutionStatus=unresolved/g) ?? []).length).toBe(8);
    expect((markup.match(/ocr=not_processed/g) ?? []).length).toBe(16);
    expect((markup.match(/classification=not_classified/g) ?? []).length).toBe(16);
    expect((markup.match(/review=not_reviewed/g) ?? []).length).toBe(16);
  });

  it('does not render action buttons or operational action labels', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedIntakeInspectorPage));

    expect((markup.match(/<button/g) ?? []).length).toBe(0);
    expect((markup.match(/<textarea/g) ?? []).length).toBe(0);
    expect(markup).not.toContain('צור משימה');
    expect(markup).not.toContain('פתח משימה');
    expect(markup).not.toContain('שייך לתיק');
    expect(markup).not.toContain('שמור');
    expect(markup).not.toContain('אשר');
    expect(markup).not.toContain('הפעל OCR');
    expect(markup).not.toContain('סווג');
  });

  it('keeps incomplete local review blocked without writes', () => {
    const localSetItem = vi.fn();
    const sessionSetItem = vi.fn();
    const indexedOpen = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: localSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('sessionStorage', { getItem: vi.fn(), setItem: sessionSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: vi.fn() });
    vi.stubGlobal('fetch', fetchSpy);

    renderInteractiveInspector();

    expect(container.textContent).toContain('Task candidate preview: blocked');
    expect(container.textContent).toContain('canCreateWorkItem=false');
    expect(container.textContent).toContain('Formal Approval Gate — mock/display-only');
    expect(container.textContent).toContain('task preview title: no ready task preview');

    changeSelect('unified-review-decision', 'open_task');
    changeInput('unified-review-proposed-title', 'Local title only');

    expect(container.textContent).toContain('Local review complete: no');
    expect(container.textContent).toContain('proposed owner is missing');
    expect(container.textContent).toContain('blocker list');
    expect(container.textContent).toContain('explicit Eldad approval is not captured');
    expect(container.textContent).toContain('audit text preview: Mock approval draft only');
    expect(container.querySelector('[data-testid="unified-review-task-preview"]')).toBeNull();
    expect(localSetItem).not.toHaveBeenCalled();
    expect(sessionSetItem).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('creates a local preview only for complete local task review and keeps creation blocked', () => {
    const localSetItem = vi.fn();
    const sessionSetItem = vi.fn();
    const indexedOpen = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: localSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('sessionStorage', { getItem: vi.fn(), setItem: sessionSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: vi.fn() });
    vi.stubGlobal('fetch', fetchSpy);

    renderInteractiveInspector();

    changeSelect('unified-review-decision', 'open_task');
    changeInput('unified-review-proposed-title', 'Unified intake local task preview');
    changeInput('unified-review-proposed-owner', 'Eldad');
    changeInput('unified-review-proposed-due-date', '2026-05-20');
    changeSelect('unified-review-proposed-priority', 'medium');
    changeInput('unified-review-proposed-matter-text', 'Matter text only, no assignment');
    act(() => {
      byTestId<HTMLInputElement>('unified-review-evidence-reviewed').click();
    });

    expect(container.textContent).toContain('Local review complete: yes');
    expect(container.textContent).toContain('Task candidate preview — local only');
    expect(container.textContent).toContain('title: Unified intake local task preview');
    expect(container.textContent).toContain('status: local_preview_only');
    expect(container.textContent).toContain('Formal Approval Gate — mock/display-only');
    expect(container.textContent).toContain('task preview title: Unified intake local task preview');
    expect(container.textContent).toContain('candidate id:');
    expect(container.textContent).toContain('source type: scan');
    expect(container.textContent).toContain('evidence refs:');
    expect(container.textContent).toContain('matter decision: Matter text only, no assignment');
    expect(container.textContent).toContain('owner decision: Eldad');
    expect(container.textContent).toContain('due date decision: 2026-05-20');
    expect(container.textContent).toContain('priority decision: medium');
    expect(container.textContent).toContain('evidence review confirmation: evidence reviewed locally');
    expect(container.textContent).toContain('audit text preview: Mock approval draft only');
    expect(container.textContent).toContain('approval is not persisted');
    expect(container.textContent).toContain('approval is not operational');
    expect(container.textContent).toContain('canCreateWorkItem=false');
    expect(container.textContent).toContain('promotion remains blocked');
    expect(container.textContent).toContain('Agent A required before any real implementation');
    expect(container.textContent).toContain('blocked until Eldad approval');
    expect(localSetItem).not.toHaveBeenCalled();
    expect(sessionSetItem).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps the inspector and static fixtures free of real connectors, stores, persistence, and creation imports', () => {
    const inspectedSources = [
      `${projectRoot}/src/components/internal/UnifiedIntakeInspector.tsx`,
      `${projectRoot}/src/components/internal/MockEmailDriveUnifiedIntakeSection.tsx`,
      `${projectRoot}/src/components/internal/unified-intake-review/UnifiedIntakeLocalReview.tsx`,
      `${projectRoot}/src/pages/internal/UnifiedIntakeInspectorPage.tsx`,
      `${projectRoot}/src/work-spine/intake/unified-intake-static-fixtures.ts`,
      `${projectRoot}/src/work-spine/intake/mock/mock-email-drive-types.ts`,
      `${projectRoot}/src/work-spine/intake/mock/mock-email-data.ts`,
      `${projectRoot}/src/work-spine/intake/mock/mock-drive-data.ts`,
      `${projectRoot}/src/work-spine/intake/mock/mock-email-to-unified-intake.ts`,
      `${projectRoot}/src/work-spine/intake/mock/mock-drive-to-unified-intake.ts`,
    ].map((path) => readFileSync(path, 'utf8'));

    for (const source of inspectedSources) {
      for (const pattern of forbiddenImportPatterns) {
        expect(source).not.toMatch(pattern);
      }
      for (const symbol of forbiddenSymbols) {
        expect(source).not.toContain(symbol);
      }
      expect(source).not.toContain('gmailService');
      expect(source).not.toContain('driveService');
      expect(source).not.toContain('integrationStore');
      expect(source).not.toContain('run-create-work-item');
      expect(source).not.toContain('node:fs');
      expect(source).not.toContain('node:path');
    }
  });

  it('adds only the hidden internal route without sidebar or operational screen adoption', () => {
    const mainSource = readFileSync(`${projectRoot}/src/main.tsx`, 'utf8');
    const sidebarSource = readFileSync(`${projectRoot}/src/data/sidebarNav.ts`, 'utf8');
    const matterWorkspaceSource = readFileSync(`${projectRoot}/src/pages/matter-workspace/MatterWorkspace.tsx`, 'utf8');
    const documentsPageSource = readFileSync(`${projectRoot}/src/pages/documents/DocumentsPage.tsx`, 'utf8');
    const ceoOfficeSource = readFileSync(`${projectRoot}/src/pages/ceo-office/CeoOffice.tsx`, 'utf8');

    expect(mainSource).toContain('/internal/unified-intake');
    expect(mainSource).toContain('UnifiedIntakeInspectorPage');
    expect(sidebarSource).not.toContain('/internal/unified-intake');
    expect(matterWorkspaceSource).not.toContain('UnifiedIntakeInspector');
    expect(documentsPageSource).not.toContain('UnifiedIntakeInspector');
    expect(ceoOfficeSource).not.toContain('UnifiedIntakeInspector');
  });
});
// #endregion
