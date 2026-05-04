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
  'תצוגת קלט',
  'סיכום עבודה מעשי',
  'סיווג מקצועי',
  'הצעת ניתוב',
  'הנחיית מע״מ והנהלת חשבונות',
  'תצוגת אישור / סימולציה',
  'תצוגה תפעולית',
  'הצעת תוצר',
  'סיכום בקרת איכות',
  'רשימת בדיקת ראיות',
  'רמזי ראיות',
  'רמזי למידה',
  'הצעד הבא המוצע לאלדד',
  'פאנל בטיחות',
] as const;

const VAT_INVOICE_INPUT = {
  title: 'חשבונית בזק לחודש 04/2026',
  sourceType: 'scan',
  metadataSummary: 'חשבונית ספק שנסרקה לצורך בדיקת מע״מ והנהלת חשבונות',
  clientOrCaseLabel: 'דוד אלדד מע״מ',
  domainLabel: 'VAT',
} as const;

const BEZEQ_BATCH_INPUT = {
  title: 'חשבונות בזק דוד אלדד — 9 חשבונות',
  sourceType: 'scan',
  metadataSummary: '9 חשבונות בזק הכוללים תקופות 12.25, ינואר 2026, מרץ 2026 ועוד. לצורך הדוגמה נניח שטרם נקלטו במערכת הנהלת החשבונות. סיכון כפילות גבוה — יש לבדוק אילו חשבונות כבר נקלטו ואילו שייכים לדוח מע״מ 03-04/2026.',
  clientOrCaseLabel: 'דוד אלדד',
  domainLabel: 'vat',
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

const FORBIDDEN_IMPORT_BOUNDARY_TERMS = [
  'accounting' + '-core',
  'src/serv' + 'ices',
  'work-spine/persist' + 'ence',
  'use-c' + 'ases',
  'read-m' + 'odel',
  'proj' + 'ection',
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

const fillBezeqBatchInput = (container: HTMLElement): void => {
  changeField(container, '#manual-preview-title', BEZEQ_BATCH_INPUT.title);
  changeField(container, '#manual-preview-source-type', BEZEQ_BATCH_INPUT.sourceType);
  changeField(container, '#manual-preview-summary', BEZEQ_BATCH_INPUT.metadataSummary);
  changeField(container, '#manual-preview-client', BEZEQ_BATCH_INPUT.clientOrCaseLabel);
  changeField(container, '#manual-preview-domain', BEZEQ_BATCH_INPUT.domainLabel);
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
      expect(section.textContent).toContain('[תצוגה מקדימה]');
    });
    cleanup();
  });

  it('marks approval preview with the simulation badge', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-summary', 'בדיקת מטא-דאטה בלבד');

    expect(container.textContent).toContain('תצוגת אישור / סימולציה');
    expect(container.textContent).toContain('[סימולציה]');
    cleanup();
  });

  it('renders practical VAT bookkeeping guidance for the exact invoice input', () => {
    const { container, cleanup } = mountWorkbench();

    fillVatInvoiceInput(container);

    [
      'סיכום עבודה מעשי',
      'הנחיית מע״מ והנהלת חשבונות',
      'רשימת בדיקת ראיות',
      'סיכום בקרת איכות',
      'הצעד הבא המוצע לאלדד',
      'פאנל בטיחות',
      'תאריך חשבונית',
      'שם ספק',
      'סכום מע״מ',
      'תקופת דיווח',
      'כפילות',
      'בדוק אם החשבונית שייכת לתקופת המע״מ הנכונה',
      'ודא שהחשבונית לא נקלטה כבר',
      'אין שמירה במערכת',
      'אין חיבור לספקי מידע',
      'אין גישה לקבצים',
      'לא נוצרה משימה תפעולית',
      'לא נרשמה פקודת הנהלת חשבונות',
      'לא תויק מסמך',
    ].forEach((expectedText) => {
      expect(container.textContent).toContain(expectedText);
    });
    cleanup();
  });

  it('references static Work Spine workflow, output, policy, and evidence knowledge', () => {
    const { container, cleanup } = mountWorkbench();

    fillVatInvoiceInput(container);

    [
      'workflow-map-vat',
      'מע״מ (vat)',
      'scan_intake_report',
      'vat_review_memo',
      'task_summary',
      'evidence_summary',
      'real-action-policy-submit-vat-report',
      'submit_vat_report',
      'חסומה, ידנית בלבד',
      'evidence-folder-policy-stage13',
      'evidence-file-operation-block-policy-stage13',
      'תיק מקור רשמי הוא מושג מטא-דאטה בלבד',
      'אין הרצת תהליך ואין יצירת פעולה מתוך סביבת העבודה',
    ].forEach((expectedText) => {
      expect(container.textContent).toContain(expectedText);
    });
    cleanup();
  });

  it('renders batch, bookkeeping-system, duplicate, and VAT-period guidance for Bezeq packages', () => {
    const { container, cleanup } = mountWorkbench();

    fillBezeqBatchInput(container);

    [
      'בדיקת חבילת מסמכים / כפילות / מערכת הנהלת החשבונות',
      'זוהתה חבילת מסמכים ולא פריט בודד',
      'סיכון כפילות',
      'טרם נקלט',
      'סטטוס קליטה במערכת הנהלת החשבונות',
      'אצל אלדד כרגע מערכת הנהלת החשבונות החיצונית היא מייבן',
      'תקופות דיווח שונות',
      'אין להניח שכל 9 החשבונות שייכים לדוח מע״מ 03-04/2026',
      'טבלת מיפוי לכל חשבון',
      'לסמן חשבונות שכבר נקלטו',
      'לשייך כל חשבון לתקופת הדיווח המתאימה',
      'מה לקלוט במערכת הנהלת החשבונות',
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
    FORBIDDEN_IMPORT_BOUNDARY_TERMS.forEach((term) => {
      expect(componentText).not.toContain(term);
    });
  });

  it('keeps click behavior limited to Reset and Clear', () => {
    const { container, cleanup } = mountWorkbench();

    fillVatInvoiceInput(container);
    expect(container.textContent).toContain('תצוגת קלט');

    const resetButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent === 'איפוס',
    );
    expect(resetButton).toBeDefined();

    act(() => {
      resetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).not.toContain('תצוגת קלט');

    fillVatInvoiceInput(container);
    expect(container.textContent).toContain('תצוגת קלט');

    const clearButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent === 'נקה',
    );
    expect(clearButton).toBeDefined();

    act(() => {
      clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).not.toContain('תצוגת קלט');
    cleanup();
  });
});
// #endregion
