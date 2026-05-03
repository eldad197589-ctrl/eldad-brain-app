/* ============================================
   FILE: ManualPreviewWorkbench.test.tsx
   PURPOSE: Focused tests for the internal Manual Preview Workbench.
   DEPENDENCIES: Vitest, React DOM test renderer
   EXPORTS: Test suite
   ============================================ */

// @vitest-environment happy-dom

// #region Dependencies
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ManualPreviewWorkbench from './ManualPreviewWorkbench';
// #endregion

// #region Test Environment
const reactActEnvironment = globalThis as typeof globalThis & {
  /** React act environment flag used by focused DOM tests. */
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
// #endregion

// #region Constants
const ALLOWED_SOURCE_TYPES = ['manual_text', 'scan', 'email', 'drive', 'protocol'] as const;

const REQUIRED_PREVIEW_SECTIONS = [
  'Intake Preview',
  'Routing Suggestion',
  'Approval Preview / Simulation',
  'Operational Preview',
  'Output Suggestion',
  'QC Summary',
  'Evidence Hints',
  'Learning Hints',
] as const;

const FORBIDDEN_BUTTON_LABELS = [
  'Sa' + 've',
  'Sub' + 'mit',
  'Cre' + 'ate',
  'Se' + 'nd',
  'Fi' + 'le',
  'Ex' + 'port',
  'Approve' + ' All',
  'Exe' + 'cute',
  'Sy' + 'nc',
  'Im' + 'port',
] as const;

const FORBIDDEN_SURFACE_TERMS = [
  'local' + 'Storage',
  'session' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'fet' + 'ch',
  'google' + 'apis',
  'O' + 'Auth',
  'f' + 's',
  'pa' + 'th',
  'O' + 'CR',
  'File' + 'Reader',
  'use' + 'BrainStore',
  'use' + 'Mat' + 'terStore',
  'brain' + 'Store',
  'matter' + 'Store',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
  'CEO ' + 'Bureau',
  'Dash' + 'board',
] as const;
// #endregion

// #region Types
/** Mounted workbench test harness. */
interface MountedWorkbench {
  /** Rendered container element. */
  container: HTMLDivElement;
  /** React root instance. */
  root: Root;
  /** Cleanup callback. */
  cleanup: () => void;
}
// #endregion

// #region Helpers
const renderWorkbench = (): string => renderToStaticMarkup(<ManualPreviewWorkbench />);

const mountWorkbench = (): MountedWorkbench => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<ManualPreviewWorkbench />);
  });

  return {
    container,
    root,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
};

const changeField = (
  container: HTMLElement,
  selector: string,
  value: string,
): void => {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
  expect(field).not.toBeNull();

  act(() => {
    if (field) {
      const prototype = Object.getPrototypeOf(field) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      valueSetter?.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
};

const getButtonLabels = (container: HTMLElement): string[] =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('button')).map(
    (button) => button.textContent?.trim() ?? '',
  );
// #endregion

// #region Tests
describe('ManualPreviewWorkbench', () => {
  it('renders every allowed form field', () => {
    const html = renderWorkbench();

    ['title', 'sourceType', 'metadataSummary', 'clientOrCaseLabel', 'domainLabel'].forEach((field) => {
      expect(html).toContain(field);
    });
  });

  it('limits sourceType options to the approved set', () => {
    const { container, cleanup } = mountWorkbench();
    const options = Array.from(container.querySelectorAll<HTMLOptionElement>('option')).map(
      (option) => option.value,
    );

    expect(options).toEqual([...ALLOWED_SOURCE_TYPES]);
    cleanup();
  });

  it('renders the permanent warning banner', () => {
    const html = renderWorkbench();

    expect(html).toContain('⚠️ סביבת עבודה פנימית — תצוגה מקדימה בלבד — שום דבר לא נשמר');
  });

  it('entering metadata produces every preview section', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'Internal salary intake');
    changeField(container, '#manual-preview-summary', 'Manual metadata summary');

    REQUIRED_PREVIEW_SECTIONS.forEach((sectionTitle) => {
      expect(container.textContent).toContain(sectionTitle);
    });
    cleanup();
  });

  it('marks every preview section with PREVIEW', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'Internal salary intake');
    const previewSections = container.querySelectorAll('[data-testid="manual-preview-section"]');

    expect(previewSections).toHaveLength(REQUIRED_PREVIEW_SECTIONS.length);
    previewSections.forEach((section) => {
      expect(section.textContent).toContain('[PREVIEW]');
    });
    cleanup();
  });

  it('marks approval preview with the simulation badge', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-summary', 'Review this metadata only');

    expect(container.textContent).toContain('Approval Preview / Simulation');
    expect(container.textContent).toContain('[סימולציה]');
    cleanup();
  });

  it('renders only Reset and Clear buttons', () => {
    const { container, cleanup } = mountWorkbench();

    expect(getButtonLabels(container)).toEqual(['Reset', 'Clear']);
    cleanup();
  });

  it('does not render forbidden button labels', () => {
    const { container, cleanup } = mountWorkbench();
    const buttonLabels = getButtonLabels(container).join(' ');

    FORBIDDEN_BUTTON_LABELS.forEach((label) => {
      expect(buttonLabels).not.toContain(label);
    });
    cleanup();
  });

  it('does not render a binary input or drag attributes', () => {
    const { container, cleanup } = mountWorkbench();

    expect(container.querySelector('input[type="' + 'fi' + 'le"]')).toBeNull();
    expect(container.querySelector('[draggable="true"]')).toBeNull();
    expect(container.querySelector('[on' + 'drop]')).toBeNull();
    expect(container.querySelector('[on' + 'dragover]')).toBeNull();
    cleanup();
  });

  it('does not expose forbidden runtime surfaces in component output', () => {
    const html = renderWorkbench();
    const componentText = ManualPreviewWorkbench.toString();

    FORBIDDEN_SURFACE_TERMS.forEach((term) => {
      expect(html).not.toContain(term);
      expect(componentText).not.toContain(term);
    });
  });

  it('keeps click behavior limited to Reset and Clear', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'Temporary preview');
    expect(container.textContent).toContain('Intake Preview');

    const clearButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent === 'Clear',
    );
    expect(clearButton).toBeDefined();

    act(() => {
      clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).not.toContain('Intake Preview');
    cleanup();
  });
});
// #endregion
