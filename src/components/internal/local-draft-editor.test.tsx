/* ============================================
   FILE: local-draft-editor.test.tsx
   PURPOSE: Focused tests for the local-only scanned intake draft editor.
   DEPENDENCIES: vitest, react, react-dom/client, fs, LocalDraftEditor
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createManualDecisionDraftFromTaskCandidate } from '../../work-spine/intake/manual-decision-draft';
import LocalDraftEditor from './LocalDraftEditor';
// #endregion

// #region Test Helpers
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const initialDecisionDraft = createManualDecisionDraftFromTaskCandidate({
  taskCandidateId: 'scan-task-test',
});

let container: HTMLDivElement;
let root: Root;

function renderEditor() {
  act(() => {
    root.render(
      <LocalDraftEditor
        taskCandidateId="scan-task-test"
        suggestedTitle="תיקיית סריקה: בדיקה"
        suggestedDescription="תיאור מקומי בלבד"
        sourceGroupName="בדיקה"
        sampleSourceFileNames={['file-a.pdf', 'file-b.pdf']}
        sourceFilesCount={2}
        initialDecisionDraft={initialDecisionDraft}
      />,
    );
  });
}

function byTestId<T extends Element>(testId: string): T {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) throw new Error(`Missing test id: ${testId}`);
  return element as T;
}

function maybeByTestId<T extends Element>(testId: string): T | null {
  return container.querySelector(`[data-testid="${testId}"]`) as T | null;
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

function expandEditor() {
  const toggle = byTestId<HTMLButtonElement>('local-draft-toggle');
  act(() => {
    toggle.click();
  });
}
// #endregion

// #region Tests
describe('LocalDraftEditor', () => {
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

  it('is collapsed by default and renders local-only warning plus completeness summary', () => {
    renderEditor();

    expect(container.textContent).toContain('⚠️ טיוטה מקומית בלבד — לא נשמרת. נעלמת ברענון.');
    expect(container.textContent).toContain('החלטה מקומית: טרם נבחרה');
    expect(container.textContent).toContain('טיוטה מקומית מלאה: לא');
    expect(container.textContent).toContain('פתח עריכת טיוטה מקומית');
    expect(container.textContent).toContain('תצוגת משימה: חסומה');
    expect(container.textContent).toContain('חסרים שדות בטיוטה המקומית');
    expect(maybeByTestId('local-draft-expanded-fields')).toBeNull();
    expect(maybeByTestId('local-draft-selected-decision')).toBeNull();
    expect(maybeByTestId('local-draft-reset')).toBeNull();
  });

  it('opens local fields with the expand toggle and keeps the toggle local', () => {
    renderEditor();

    expandEditor();

    expect(byTestId('local-draft-expanded-fields')).toBeTruthy();
    expect(container.textContent).toContain('סגור עריכת טיוטה מקומית');
    expect(byTestId<HTMLSelectElement>('local-draft-selected-decision').value).toBe('');
    expect(byTestId<HTMLInputElement>('local-draft-proposed-title').value).toBe('');
    expect(byTestId<HTMLSelectElement>('local-draft-matter-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-owner-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-due-date-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-priority-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-evidence-review-status').value).toBe('not_reviewed');
  });

  it('renders conditional local fields only when their decision requires them', () => {
    renderEditor();
    expandEditor();

    expect(maybeByTestId('local-draft-proposed-matter-id')).toBeNull();
    expect(maybeByTestId('local-draft-proposed-owner')).toBeNull();
    expect(maybeByTestId('local-draft-proposed-due-date')).toBeNull();
    expect(maybeByTestId('local-draft-proposed-priority')).toBeNull();

    changeSelect('local-draft-matter-decision', 'assign_existing_matter');
    changeSelect('local-draft-owner-decision', 'assign_owner');
    changeSelect('local-draft-due-date-decision', 'set_due_date');
    changeSelect('local-draft-priority-decision', 'set_priority');

    expect(byTestId<HTMLInputElement>('local-draft-proposed-matter-id')).toBeTruthy();
    expect(byTestId<HTMLInputElement>('local-draft-proposed-owner')).toBeTruthy();
    expect(byTestId<HTMLInputElement>('local-draft-proposed-due-date')).toBeTruthy();
    expect(byTestId<HTMLSelectElement>('local-draft-proposed-priority')).toBeTruthy();
  });

  it('updates local state and can show a ready local preview without creating a WorkItem', () => {
    renderEditor();
    expandEditor();

    expect(byTestId('local-draft-complete').textContent).toContain('טיוטה מקומית מלאה: לא');

    changeSelect('local-draft-selected-decision', 'open_task');
    changeInput('local-draft-proposed-title', 'כותרת מקומית לבדיקה');
    changeSelect('local-draft-matter-decision', 'assign_existing_matter');
    changeInput('local-draft-proposed-matter-id', 'matter-local-only');
    changeSelect('local-draft-owner-decision', 'assign_owner');
    changeInput('local-draft-proposed-owner', 'אלדד');
    changeSelect('local-draft-due-date-decision', 'set_due_date');
    changeInput('local-draft-proposed-due-date', '2026-05-15');
    changeSelect('local-draft-priority-decision', 'set_priority');
    changeSelect('local-draft-proposed-priority', 'high');
    changeSelect('local-draft-evidence-review-status', 'reviewed_sufficient');

    expect(byTestId('local-draft-complete').textContent).toContain('טיוטה מקומית מלאה: כן');
    expect(container.textContent).toContain('תצוגת משימה — טיוטה בלבד');
    expect(container.textContent).toContain('לא נשמר. לא נפתחה משימה.');
    expect(container.textContent).toContain('טיוטה בלבד — לא נשמרה ולא נפתחה משימה');
    expect(container.textContent).toContain('כותרת: כותרת מקומית לבדיקה');
    expect(container.textContent).toContain('status: draft_preview_only');
    expect(container.textContent).toContain('ניתן ליצור משימה: לא');
    expect(container.querySelectorAll('button')).toHaveLength(2);
    expect(container.textContent).not.toContain('צור משימה>');
  });

  it('shows not applicable local preview for non-open-task decisions', () => {
    renderEditor();
    expandEditor();

    changeSelect('local-draft-selected-decision', 'ignore');

    expect(container.textContent).toContain('אין תצוגת משימה');
    expect(container.textContent).toContain('ההחלטה המקומית אינה פתיחת משימה');
    expect(container.textContent).toContain('WorkItem שייווצר: אין');
  });

  it('resets all local fields and returns completeness to no', () => {
    renderEditor();
    expandEditor();

    changeSelect('local-draft-selected-decision', 'open_task');
    changeInput('local-draft-proposed-title', 'כותרת שנמחקת באיפוס');
    changeSelect('local-draft-matter-decision', 'assign_existing_matter');
    changeInput('local-draft-proposed-matter-id', 'matter-local-only');
    changeSelect('local-draft-owner-decision', 'assign_owner');
    changeInput('local-draft-proposed-owner', 'אלדד');
    changeSelect('local-draft-due-date-decision', 'set_due_date');
    changeInput('local-draft-proposed-due-date', '2026-05-15');
    changeSelect('local-draft-priority-decision', 'set_priority');
    changeSelect('local-draft-proposed-priority', 'urgent');
    changeSelect('local-draft-evidence-review-status', 'reviewed_sufficient');

    expect(byTestId('local-draft-complete').textContent).toContain('טיוטה מקומית מלאה: כן');

    act(() => {
      byTestId<HTMLButtonElement>('local-draft-reset').click();
    });

    expect(byTestId<HTMLSelectElement>('local-draft-selected-decision').value).toBe('');
    expect(byTestId<HTMLInputElement>('local-draft-proposed-title').value).toBe('');
    expect(byTestId<HTMLSelectElement>('local-draft-matter-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-owner-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-due-date-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-priority-decision').value).toBe('unresolved');
    expect(byTestId<HTMLSelectElement>('local-draft-evidence-review-status').value).toBe('not_reviewed');
    expect(maybeByTestId('local-draft-proposed-matter-id')).toBeNull();
    expect(maybeByTestId('local-draft-proposed-owner')).toBeNull();
    expect(maybeByTestId('local-draft-proposed-due-date')).toBeNull();
    expect(maybeByTestId('local-draft-proposed-priority')).toBeNull();
    expect(byTestId('local-draft-complete').textContent).toContain('טיוטה מקומית מלאה: לא');
  });

  it('does not write to storage or call network-like persistence APIs', () => {
    const localSetItem = vi.fn();
    const sessionSetItem = vi.fn();
    const indexedOpen = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: localSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('sessionStorage', { getItem: vi.fn(), setItem: sessionSetItem, removeItem: vi.fn(), clear: vi.fn() });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: vi.fn() });
    vi.stubGlobal('fetch', fetchSpy);

    renderEditor();
    expandEditor();
    changeSelect('local-draft-selected-decision', 'defer');
    changeInput('local-draft-proposed-title', 'טיוטה מקומית');
    changeSelect('local-draft-matter-decision', 'no_matter_needed');
    act(() => {
      byTestId<HTMLButtonElement>('local-draft-reset').click();
    });

    expect(localSetItem).not.toHaveBeenCalled();
    expect(sessionSetItem).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps the editor free of stores, persistence, and professional creation imports', () => {
    const source = readFileSync(`${projectRoot}/src/components/internal/LocalDraftEditor.tsx`, 'utf8');

    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('createWorkItem');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('createIntakeEvent');
    expect(source).not.toContain('createIntakeAttachment');
  });
});
// #endregion
