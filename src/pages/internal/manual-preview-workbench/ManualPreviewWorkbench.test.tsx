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
import BrainKnowledgeInventoryPreview from './BrainKnowledgeInventoryPreview';
import HypotheticalScannedTaskShapePreview from './HypotheticalScannedTaskShapePreview';
import ManualPreviewWorkbench from './ManualPreviewWorkbench';
import ScannedEvidenceApprovalGatePreview from './ScannedEvidenceApprovalGatePreview';
import ScannedEvidenceBatchPreview from './ScannedEvidenceBatchPreview';
import VatMappingTablePreview from './VatMappingTablePreview';
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

const SCANNED_BATCH_INPUT = {
  title: 'תיקיית סריקות — מסמכים שנסרקו',
  sourceType: 'manual_text',
  metadataSummary: 'batch סטטי של סריקות לבדיקה מקדימה בלבד',
  clientOrCaseLabel: 'בדיקת סריקות',
  domainLabel: 'כללי',
} as const;

const SCANNED_BATCH_WARNING_TEXT =
  `תצוגה זו מבוססת על אצוות סריקות סטטית בלבד. אין קריאת תיקייה חיה, אין ${'O'}${'CR'}, ואין יצירת משימות.`;
const SCANNED_APPROVAL_WARNING_TEXT =
  'תצוגת אישור בלבד — לא נוצרת משימה, לא נשלח דבר, ולא מתבצעת פעולה.';
const HYPOTHETICAL_TASK_SHAPE_WARNING_TEXT =
  'תצוגת משימה היפותטית בלבד — לא נוצרה משימה, לא נוצר WorkItem, לא נוצר Matter, לא נוצר DocumentRef, ולא נשמר דבר.';

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
  'xl' + 'sx',
  'pro' + 'vider',
  'sto' + 're',
  'Accounting ' + 'Core',
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

const FORBIDDEN_APPROVAL_SOURCE_TERMS = [
  'f' + 's',
  'pa' + 'th',
  'xl' + 'sx',
  'O' + 'CR',
  'pro' + 'vider',
  'Gma' + 'il',
  'Dri' + 've',
  'Mav' + 'en',
  'fet' + 'ch',
  'Supa' + 'base',
  'sto' + 're',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
] as const;

const FORBIDDEN_ACTION_BUTTON_WORDS = [
  'cre' + 'ate',
  'se' + 'nd',
  'sub' + 'mit',
  'sa' + 've',
  'צור',
  'שלח',
  'הגש',
  'שמור',
  'post',
  'file',
  'execute',
  'sync',
  'import',
  'export',
] as const;

const FORBIDDEN_HYPOTHETICAL_BUTTON_WORDS = [
  'cre' + 'ate',
  'se' + 'nd',
  'sub' + 'mit',
  'sa' + 've',
  'po' + 'st',
  'fi' + 'le',
  'exe' + 'cute',
  'sy' + 'nc',
  'im' + 'port',
  'ex' + 'port',
] as const;

const FORBIDDEN_REAL_OBJECT_FIELD_NAMES = [
  'ta' + 'skId',
  'work' + 'ItemId',
  'matter' + 'Id',
  'document' + 'RefId',
] as const;

const FORBIDDEN_HYPOTHETICAL_SOURCE_TERMS = [
  'pro' + 'vider/',
  'A' + 'PI',
  'O' + 'Auth',
  'from "f' + 's"',
  "from 'f" + "s'",
  'O' + 'CRRuntime',
  'use' + 'Store',
  'persistence/',
  'Supa' + 'base',
  'D' + 'B',
  'runtime/',
  'Work' + 'Item;',
  'Mat' + 'ter;',
  'Document' + 'Ref;',
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

const fillScannedBatchInput = (container: HTMLElement): void => {
  changeField(container, '#manual-preview-title', SCANNED_BATCH_INPUT.title);
  changeField(container, '#manual-preview-source-type', SCANNED_BATCH_INPUT.sourceType);
  changeField(container, '#manual-preview-summary', SCANNED_BATCH_INPUT.metadataSummary);
  changeField(container, '#manual-preview-client', SCANNED_BATCH_INPUT.clientOrCaseLabel);
  changeField(container, '#manual-preview-domain', SCANNED_BATCH_INPUT.domainLabel);
};

const getButtonLabels = (container: HTMLElement): string[] =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('button')).map(
    (button) => button.textContent?.trim() ?? '',
  );

const getApprovalPreviews = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-testid="scanned-evidence-approval-gate-preview"]'));

const getHypotheticalTaskShapePreviews = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-testid="hypothetical-scanned-task-shape-preview"]'));

const getKnowledgeInventoryRecords = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-testid="brain-knowledge-inventory-record"]'));
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
      'סטטוס קליטה במערכת הנהלת החשבונות',
      'אצל אלדד כרגע מערכת הנהלת החשבונות החיצונית היא מייבן',
      'תקופות דיווח שונות',
      'אין להניח שכל 9 החשבונות שייכים לדוח מע״מ 03-04/2026',
      'טבלת מיפוי לכל חשבון',
      'לסמן חשבונות שכבר נקלטו',
      'לשייך כל חשבון לתקופת הדיווח המתאימה',
      'מה לקלוט במערכת הנהלת החשבונות',
      // The static seed values for Bezeq should appear
      '06/01/2026',
      '365.74',
      'נרשם במערכת הנהלת החשבונות',
      'ראיית מקור',
      'וודאות: high',
      'מוצגות רק ראיות סטטיות שכבר הומרו ל־seed. אין כאן עדיין דגימה מלאה של כל הסריקות.',
    ].forEach((expectedText) => {
      expect(container.textContent).toContain(expectedText);
    });
    cleanup();
  });

  it('displays Bezeq records from the static VAT evidence seed', () => {
    const { container, cleanup } = mountWorkbench();

    fillBezeqBatchInput(container);

    [
      'דצמבר 2025',
      'ינואר 2026',
      '365.74',
      '55.79',
      '390.45',
      '59.56',
      'נרשם במערכת הנהלת החשבונות',
      'סכום כפי שמופיע במקור',
    ].forEach((expectedText) => {
      expect(container.textContent).toContain(expectedText);
    });
    cleanup();
  });

  it('shows static source artifact and confidence when VAT evidence matches', () => {
    const { container, cleanup } = mountWorkbench();

    fillBezeqBatchInput(container);

    expect(container.textContent).toContain(
      'Knowledge_Base/tax/vat/maven_reconciliation_examples/2026_01_02_vat_close/דוח תנועות יומן 1-2.26.xlsx',
    );
    expect(container.textContent).toContain('high');
    cleanup();
  });

  it('keeps placeholder behavior for unrelated suppliers without false static evidence matches', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', '9 חשבונות ספק אלמוני');
    changeField(container, '#manual-preview-source-type', 'scan');
    changeField(
      container,
      '#manual-preview-summary',
      '9 חשבונות ספק אלמוני לצורך בדיקת מע״מ. יש סיכון כפילות ונדרש מיפוי פרטני.',
    );
    changeField(container, '#manual-preview-client', 'דוד אלדד');
    changeField(container, '#manual-preview-domain', 'vat');

    expect(container.textContent).toContain('טבלת מיפוי חשבוניות / הנהלת חשבונות');
    expect(container.textContent).toContain('חסר');
    expect(container.textContent).not.toContain('365.74');
    expect(container.textContent).not.toContain('390.45');
    expect(container.textContent).not.toContain('דוח תנועות יומן 1-2.26.xlsx');
    cleanup();
  });

  it('preserves placeholder behavior for unknown suppliers even with batch signals', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'חשבוניות של ספק_לא_מוכר — 4 קבלות');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'בדיקה');
    changeField(container, '#manual-preview-client', 'דוד אלדד');
    changeField(container, '#manual-preview-domain', 'vat');

    expect(container.textContent).toContain('טרם אומת');
    expect(container.textContent).toContain('חסר');
    // Should NOT have the static evidence badges
    expect(container.textContent).not.toContain('ראיית מקור');
    
    cleanup();
  });

  it('displays static scanned evidence candidates when scans input is present', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    expect(container.textContent).toContain('תצוגת אצוות סריקות סטטית');
    expect(container.textContent).toContain('supplier_invoice');
    expect(container.textContent).toContain('unknown');
    expect(container.textContent).toContain('unknown_scan_awaiting_review.jpg');
    expect(container.textContent).toContain(SCANNED_BATCH_WARNING_TEXT);
    cleanup();
  });

  it('narrows static scanned evidence candidates by document kind', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'סריקות חשבונית ספק');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'תיקיית סריקות עם חשבונית לבדיקה');
    changeField(container, '#manual-preview-client', 'בדיקת סריקות');
    changeField(container, '#manual-preview-domain', 'כללי');

    expect(container.textContent).toContain('תצוגת אצוות סריקות סטטית');
    expect(container.textContent).toContain('supplier_invoice');
    expect(container.textContent).not.toContain('demand_letter');
    expect(container.textContent).not.toContain('payroll_document');
    cleanup();
  });

  it('narrows static scanned evidence candidates by employee and payroll signals', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'סריקות דיני עבודה ושכר');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'מסמכים שנסרקו עם תלוש שכר לבדיקה');
    changeField(container, '#manual-preview-client', 'בדיקת עובדים');
    changeField(container, '#manual-preview-domain', 'דיני עבודה');

    expect(container.textContent).toContain('תצוגת אצוות סריקות סטטית');
    expect(container.textContent).toContain('payroll_document');
    expect(container.textContent).toContain('employee');
    expect(container.textContent).not.toContain('supplier_invoice');
    cleanup();
  });

  it('does not show static scanned evidence preview for unrelated input', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'בדיקה ידנית רגילה');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'תקציר רגיל לבדיקה פנימית');
    changeField(container, '#manual-preview-client', 'בדיקת עבודה');
    changeField(container, '#manual-preview-domain', 'כללי');

    expect(container.textContent).not.toContain('תצוגת אצוות סריקות סטטית');
    expect(container.querySelector('[data-testid="scanned-evidence-batch-preview"]')).toBeNull();
    cleanup();
  });

  it('shows Dima as partial_static and scanned intake as committed_static for scan Dima input', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'סריקות דימה');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'סריקות דימה לבדיקה סטטית בלבד');
    changeField(container, '#manual-preview-client', 'דימה');
    changeField(container, '#manual-preview-domain', 'כללי');

    expect(getKnowledgeInventoryRecords(container)).toHaveLength(2);
    expect(container.textContent).toContain('Dima case work context');
    expect(container.textContent).toContain('partial_static');
    expect(container.textContent).toContain('הקשר חלקי בלבד — נדרש אימות מקור');
    expect(container.textContent).toContain('Static scanned intake evidence batch');
    expect(container.textContent).toContain('committed_static');
    expect(container.textContent).toContain('Static historical inventory only. Not approved or binding knowledge.');
    cleanup();
  });

  it('shows Tsila payroll context as known_context_only only when Tsila and payroll are both present', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'צילה שכר');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'הקשר ידוע בלבד לתיק צילה ושכר');
    changeField(container, '#manual-preview-client', 'צילה');
    changeField(container, '#manual-preview-domain', 'שכר');

    expect(getKnowledgeInventoryRecords(container)).toHaveLength(1);
    expect(container.textContent).toContain('Tsila wage-rights and payroll context');
    expect(container.textContent).toContain('known_context_only');
    expect(container.textContent).toContain('הקשר ידוע בלבד — לא ראיה מחייבת');
    cleanup();
  });

  it('shows VAT static evidence with no-live-Maven warning for VAT Maven Bezeq input', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'מע״מ מייבן בזק');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'בדיקת מע״מ מייבן בזק בתצוגה סטטית');
    changeField(container, '#manual-preview-client', 'דוד אלדד');
    changeField(container, '#manual-preview-domain', 'VAT');

    expect(getKnowledgeInventoryRecords(container)).toHaveLength(1);
    expect(container.textContent).toContain('VAT static evidence and bookkeeping reconciliation examples');
    expect(container.textContent).toContain('vat_evidence');
    expect(container.textContent).toContain('אין גישה חיה למייבן. אין חיבור ספק. רמז סטטי בלבד.');
    cleanup();
  });

  it('shows static scanned intake only for scans input alone', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'סריקות');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'scan batch');
    changeField(container, '#manual-preview-client', 'כללי');
    changeField(container, '#manual-preview-domain', 'כללי');

    expect(getKnowledgeInventoryRecords(container)).toHaveLength(1);
    expect(container.textContent).toContain('Static scanned intake evidence batch');
    expect(container.textContent).not.toContain('VAT static evidence');
    expect(container.textContent).not.toContain('Dima case work context');
    cleanup();
  });

  it('does not trigger VAT or red-route knowledge from the substring in documents', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'מסמכים כלליים');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'רשימת מסמכים כלליים ללא מסלול מקצועי');
    changeField(container, '#manual-preview-client', 'כללי');
    changeField(container, '#manual-preview-domain', 'כללי');

    expect(container.textContent).toContain('ידע קשור שכבר קיים במוח');
    expect(getKnowledgeInventoryRecords(container)).toHaveLength(0);
    expect(container.textContent).not.toContain('VAT static evidence');
    expect(container.textContent).not.toContain('War compensation red route knowledge');
    cleanup();
  });

  it('does not overmatch payroll knowledge from payroll alone', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'שכר');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'בדיקה כללית');
    changeField(container, '#manual-preview-client', 'כללי');
    changeField(container, '#manual-preview-domain', 'שכר');

    expect(getKnowledgeInventoryRecords(container)).toHaveLength(0);
    expect(container.textContent).not.toContain('Tsila wage-rights and payroll context');
    expect(container.textContent).not.toContain('Attendance and payroll calculation context');
    cleanup();
  });

  it('shows blockedActions and all safety flags for every displayed knowledge record', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'סריקות דימה מע״מ מייבן בזק צילה שכר');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'סריקות דימה וגם מע״מ מייבן בזק וגם צילה שכר');
    changeField(container, '#manual-preview-client', 'דימה צילה');
    changeField(container, '#manual-preview-domain', 'VAT');

    const records = getKnowledgeInventoryRecords(container);
    expect(records.length).toBeGreaterThan(0);
    records.forEach((record) => {
      [
        'blockedActions:',
        'previewOnly:true',
        'staticOnly:true',
        'bindingKnowledge:false',
        'canExecute:false',
        'canPersist:false',
        'sourceVerified:false',
        'requiredVerification:',
        'sourceLocation:',
        'sourceTrace:',
      ].forEach((expectedText) => {
        expect(record.textContent).toContain(expectedText);
      });
    });
    cleanup();
  });

  it('displays approval preview for scanned evidence candidates', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    expect(getApprovalPreviews(container).length).toBeGreaterThan(0);
    expect(container.textContent).toContain(SCANNED_APPROVAL_WARNING_TEXT);
    expect(container.textContent).toContain('preview_only_not_executed');
    expect(container.textContent).toContain('scanned-evidence-001');
    cleanup();
  });

  it('shows missing fields inside scanned approval preview', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    const approvalPreview = getApprovalPreviews(container)[0];
    expect(approvalPreview).toBeDefined();
    expect(approvalPreview.textContent).toContain('missingFields');
    expect(approvalPreview.textContent).toContain('client_or_matter');
    expect(approvalPreview.textContent).toContain('document_date');
    cleanup();
  });

  it('keeps scanned approval preview passive without real action controls', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    getApprovalPreviews(container).forEach((approvalPreview) => {
      expect(approvalPreview.querySelector('button')).toBeNull();
    });
    FORBIDDEN_ACTION_BUTTON_WORDS.forEach((word) => {
      expect(getButtonLabels(container).join(' ')).not.toContain(word);
    });
    cleanup();
  });

  it('renders exact hypothetical scanned task shape warning', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    expect(getHypotheticalTaskShapePreviews(container).length).toBeGreaterThan(0);
    expect(container.textContent).toContain(HYPOTHETICAL_TASK_SHAPE_WARNING_TEXT);
    expect(container.textContent).toContain('תצוגת צורת משימה היפותטית');
    expect(container.textContent).toContain('PREVIEW ONLY');
    cleanup();
  });

  it('shows hypothetical-only flags and blocks every operational direction', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    const taskShapePreview = getHypotheticalTaskShapePreviews(container)[0];
    expect(taskShapePreview).toBeDefined();
    [
      'hypotheticalOnlytrue',
      'previewOnlytrue',
      'staticOnlytrue',
      'requiresEldadApprovaltrue',
      'approvedByEldadfalse',
      'canCreateWorkItemfalse',
      'canCreateMatterfalse',
      'canCreateDocumentReffalse',
      'canPersistfalse',
      'canExecutefalse',
      'canSubmitfalse',
      'canFilefalse',
      'evidenceStatusstatic_candidate_preview',
    ].forEach((expectedText) => {
      expect(taskShapePreview.textContent?.replace(/\s+/g, '')).toContain(expectedText);
    });
    cleanup();
  });

  it('shows required passive labels and blocked actions for hypothetical task shape', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    const taskShapePreview = getHypotheticalTaskShapePreviews(container)[0];
    [
      'Approved by Eldad: false',
      'Requires Eldad approval',
      'No operational object exists',
      'No scan/OCR/file/provider/persistence action occurred',
      'blockedActions',
      'create_work_item',
      'create_matter',
      'create_document_ref',
      'persist',
      'execute',
      'submit',
      'file',
    ].forEach((expectedText) => {
      expect(taskShapePreview.textContent).toContain(expectedText);
    });
    cleanup();
  });

  it('keeps hypothetical task shape preview without buttons or action button wording', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    getHypotheticalTaskShapePreviews(container).forEach((taskShapePreview) => {
      expect(taskShapePreview.querySelector('button')).toBeNull();
    });
    FORBIDDEN_HYPOTHETICAL_BUTTON_WORDS.forEach((word) => {
      expect(getButtonLabels(container).join(' ').toLowerCase()).not.toContain(word);
    });
    cleanup();
  });

  it('does not render forbidden real-object field names in hypothetical task shape preview', () => {
    const { container, cleanup } = mountWorkbench();

    fillScannedBatchInput(container);

    const taskShapeText = getHypotheticalTaskShapePreviews(container)
      .map((taskShapePreview) => taskShapePreview.textContent ?? '')
      .join(' ');
    FORBIDDEN_REAL_OBJECT_FIELD_NAMES.forEach((fieldName) => {
      expect(taskShapeText).not.toContain(fieldName);
    });
    cleanup();
  });

  it('keeps hypothetical task shape source free of runtime import surfaces', () => {
    const componentText = HypotheticalScannedTaskShapePreview.toString().replace(
      'No scan/OCR/file/provider/persistence action occurred',
      '',
    );

    FORBIDDEN_HYPOTHETICAL_SOURCE_TERMS.forEach((term) => {
      expect(componentText).not.toContain(term);
    });
  });

  it('proves scan Dima input shows only hypothetical preview visibility', () => {
    const { container, cleanup } = mountWorkbench();

    changeField(container, '#manual-preview-title', 'סריקות דימה');
    changeField(container, '#manual-preview-source-type', 'manual_text');
    changeField(container, '#manual-preview-summary', 'סריקות דימה לבדיקה סטטית בלבד');
    changeField(container, '#manual-preview-client', 'דימה');
    changeField(container, '#manual-preview-domain', 'כללי');

    const taskShapePreviews = getHypotheticalTaskShapePreviews(container);
    expect(taskShapePreviews.length).toBeGreaterThan(0);
    expect(container.textContent).toContain(HYPOTHETICAL_TASK_SHAPE_WARNING_TEXT);
    expect(container.textContent).toContain('No operational object exists');
    expect(container.textContent).toContain('approvedByEldadfalse');
    expect(container.textContent).not.toContain('preview_only_created');
    expect(container.textContent).not.toContain('ready_to_execute');
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
    const mappingComponentText = VatMappingTablePreview.toString();
    const scannedBatchComponentText = ScannedEvidenceBatchPreview.toString();
    const scannedApprovalComponentText = ScannedEvidenceApprovalGatePreview.toString();
    const knowledgeInventoryComponentText = BrainKnowledgeInventoryPreview.toString();

    FORBIDDEN_SURFACE_TERMS.forEach((term) => {
      expect(html).not.toContain(term);
      expect(componentText).not.toContain(term);
      expect(mappingComponentText).not.toContain(term);
      expect(scannedBatchComponentText).not.toContain(term);
      expect(scannedApprovalComponentText).not.toContain(term);
      expect(knowledgeInventoryComponentText).not.toContain(term);
    });
    FORBIDDEN_IMPORT_BOUNDARY_TERMS.forEach((term) => {
      expect(componentText).not.toContain(term);
      expect(mappingComponentText).not.toContain(term);
      expect(scannedBatchComponentText).not.toContain(term);
      expect(scannedApprovalComponentText).not.toContain(term);
      expect(knowledgeInventoryComponentText).not.toContain(term);
    });
    FORBIDDEN_APPROVAL_SOURCE_TERMS.forEach((term) => {
      expect(scannedApprovalComponentText).not.toContain(term);
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
