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
const SOURCE_TYPE_DISPLAY_LABELS = ['טקסט ידני', 'סריקה', 'מייל', 'Drive', 'פרוטוקול'] as const;
const HEBREW_FIELD_LABELS = ['כותרת המסמך / המשימה', 'סוג מקור', 'תקציר / תיאור קצר', 'לקוח / תיק', 'תחום מקצועי'] as const;

const REQUIRED_PREVIEW_SECTIONS = [
  'Intake Preview',
  'Practical Work Summary',
  'Professional Classification',
  'Routing Suggestion',
  'VAT / Bookkeeping Guidance',
  'Approval Preview / Simulation',
  'Operational Preview',
  'Output Suggestion',
  'QC Summary',
  'Evidence Checklist',
  'Evidence Hints',
  'Learning Hints',
  'Suggested Next Step For Eldad',
  'Safety Panel',
] as const;

const VAT_INVOICE_INPUT = {
  title: 'חשבונית בזק לחודש 04/2026',
  sourceType: 'scan',
  metadataSummary: 'חשבונית ספק שנסרקה לצורך בדיקת מע״מ והנהלת חשבונות',
  clientOrCaseLabel: 'דוד אלדד מע״מ',
  domainLabel: 'VAT',
} as const;

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

const fillVatInvoiceInput = (container: HTMLElement): void => {
  changeField(container, '#manual-preview-title', VAT_INVOICE_INPUT.title);
  changeField(container, '#manual-preview-source-type', VAT_INVOICE_INPUT.sourceType);
  changeField(container, '#manual-preview-summary', VAT_INVOICE_INPUT.metadataSummary);
  changeField(container, '#manual-preview-client', VAT_INVOICE_INPUT.clientOrCaseLabel);
  changeField(container, '#manual-preview-domain', VAT_INVOICE_INPUT.domainLabel);
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

    HEBREW_FIELD_LABELS.forEach((label) => {
      expect(html).toContain(label);
    });
    [
      'הזן כאן קלט ידני כדי לראות כיצד המוח היה מסווג',
      'לדוגמה: חשבונית בזק לחודש 04/2026',
      'לדוגמה: חשבונית ספק שנסרקה לצורך בדיקת מע״מ והנהלת חשבונות',
      'לדוגמה: דוד אלדד מע״מ / דימה / צילה',
      'לדוגמה: VAT / שכר / דיני עבודה',
    ].forEach((text) => {
      expect(html).toContain(text);
    });
  });

  it('limits sourceType options to the approved set', () => {
    const { container, cleanup } = mountWorkbench();
    const options = Array.from(container.querySelectorAll<HTMLOptionElement>('option')).map(
      (option) => option.value,
    );
    const optionLabels = Array.from(container.querySelectorAll<HTMLOptionElement>('option')).map(
      (option) => option.textContent,
    );

    expect(options).toEqual([...ALLOWED_SOURCE_TYPES]);
    expect(optionLabels).toEqual([...SOURCE_TYPE_DISPLAY_LABELS]);
    cleanup();
  });

  it('renders the permanent warning banner', () => {
    const html = renderWorkbench();

    expect(html).toContain('⚠️ סביבת עבודה פנימית — תצוגה מקדימה בלבד — שום דבר לא נשמר');
  });

  it('entering metadata produces every preview section', () => {
    const { container, cleanup } = mountWorkbench();

    fillVatInvoiceInput(container);

    REQUIRED_PREVIEW_SECTIONS.forEach((sectionTitle) => {
      expect(container.textContent).toContain(sectionTitle);
    });
    cleanup();
  });

  it('marks every preview section with PREVIEW', () => {
    const { container, cleanup } = mountWorkbench();

    fillVatInvoiceInput(container);
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

  it('renders practical VAT bookkeeping guidance for the exact invoice input', () => {
    const { container, cleanup } = mountWorkbench();

    fillVatInvoiceInput(container);

    [
      'Practical Work Summary',
      'VAT / Bookkeeping Guidance',
      'Evidence Checklist',
      'QC Summary',
      'Suggested Next Step For Eldad',
      'Safety Panel',
      'invoice date',
      'supplier identity',
      'VAT amount',
      'period matching',
      'duplicate check',
      'בדוק אם החשבונית שייכת לתקופת המע״מ הנכונה',
      'ודא שהחשבונית לא נקלטה כבר',
      'no persistence',
      'no provider connection',
      'no file access',
      'no operational object created',
      'no official accounting entry created',
      'no document filed',
    ].forEach((expectedText) => {
      expect(container.textContent).toContain(expectedText);
    });
    cleanup();
  });

  it('renders only Reset and Clear buttons', () => {
    const { container, cleanup } = mountWorkbench();

    expect(getButtonLabels(container)).toEqual(['איפוס', 'נקה']);
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

    fillVatInvoiceInput(container);
    expect(container.textContent).toContain('Intake Preview');

    const resetButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent === 'איפוס',
    );
    expect(resetButton).toBeDefined();

    act(() => {
      resetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).not.toContain('Intake Preview');

    fillVatInvoiceInput(container);
    expect(container.textContent).toContain('Intake Preview');

    const clearButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent === 'נקה',
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
