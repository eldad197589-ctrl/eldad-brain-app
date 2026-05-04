/* ============================================
   FILE: VatMappingTablePreview.tsx
   PURPOSE: Preview-only VAT/bookkeeping mapping table for batch/duplicate-risk signals.
   DEPENDENCIES: React
   EXPORTS: VatMappingTablePreview component
   ============================================ */

// #region Types
/** A single row in the preview mapping table. */
interface MappingRow {
  /** Row index. */
  index: number;
  /** Supplier name or חסר. */
  supplier: string;
  /** Period derived from input or חסר. */
  periodFromInput: string;
  /** Invoice date or חסר. */
  invoiceDate: string;
  /** Amount before VAT or חסר. */
  amountBeforeVat: string;
  /** VAT amount or חסר. */
  vatAmount: string;
  /** Total amount or חסר. */
  totalAmount: string;
  /** Accounting system status. */
  accountingSystemStatus: string;
  /** VAT report assignment. */
  vatReportAssignment: string;
  /** Expense classification. */
  expenseClassification: string;
  /** Review note. */
  reviewNote: string;
}

/** Props for VatMappingTablePreview. */
interface VatMappingTablePreviewProps {
  /** Whether batch/multiple-document signal is detected. */
  hasBatchSignal: boolean;
  /** Whether duplicate risk is detected. */
  hasDuplicateRisk: boolean;
  /** The searchable text from form inputs. */
  searchableText: string;
}
// #endregion

// #region Constants
const TABLE_COLUMNS = [
  '#',
  'ספק',
  'תקופה לפי הקלט',
  'תאריך חשבונית',
  'סכום לפני מע״מ',
  'סכום מע״מ',
  'סכום כולל',
  'סטטוס במערכת הנהלת החשבונות',
  'שיוך לדוח מע״מ',
  'סיווג הוצאה',
  'הערת בדיקה',
] as const;

const MISSING = 'חסר';
const NOT_VERIFIED = 'טרם אומת';
const NEEDS_ASSIGNMENT = 'דורש שיוך';
const NEEDS_REVIEW = 'דורש בדיקה';

const WARNING_TEXT = 'טבלה זו היא תצוגת עבודה בלבד. אין קליטה, אין שמירה, ואין רישום בהנהלת חשבונות.';

const cellStyle = {
  border: '1px solid rgba(148, 163, 184, 0.22)',
  padding: '6px 10px',
  textAlign: 'right' as const,
  fontSize: 13,
  whiteSpace: 'nowrap' as const,
};

const headerCellStyle = {
  ...cellStyle,
  background: 'rgba(30, 41, 59, 0.9)',
  fontWeight: 700,
  color: '#e2e8f0',
  fontSize: 12,
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  direction: 'rtl' as const,
  marginTop: 12,
};

const wrapperStyle = {
  border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.82)',
  padding: 18,
  overflowX: 'auto' as const,
};

const warningStyle = {
  color: '#fbbf24',
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 10,
};
// #endregion

// #region Helpers
/**
 * Infer supplier name from searchable text.
 * @param text - Lowercased searchable text from form.
 * @returns Detected supplier name or MISSING.
 */
const inferSupplier = (text: string): string => {
  if (text.includes('בזק')) return 'בזק';
  if (text.includes('חשמל')) return 'חברת החשמל';
  if (text.includes('נטוויזן') || text.includes('נט וויזן')) return 'נטוויזן';
  if (text.includes('מי אשקלון') || text.includes('מים')) return 'מי אשקלון';
  if (text.includes('ארנונה')) return 'עיריית אשקלון';
  if (text.includes('google') || text.includes('גוגל')) return 'Google';
  if (text.includes('צמיגי')) return 'צמיגי המילניום';
  return MISSING;
};

/**
 * Infer expense classification from searchable text.
 * @param text - Lowercased searchable text from form.
 * @returns Expense classification label.
 */
const inferExpenseClassification = (text: string): string => {
  if (text.includes('רכב') || text.includes('צמיג')) return 'עסקית מלאה';
  if (text.includes('חשמל') || text.includes('מים') || text.includes('ארנונה') || text.includes('בזק') || text.includes('נטוויזן') || text.includes('נט וויזן')) return 'מעורבת';
  return NEEDS_REVIEW;
};

/**
 * Detect row count from batch signal in text.
 * @param text - Lowercased searchable text from form.
 * @returns Number of placeholder rows to generate.
 */
const detectRowCount = (text: string): number => {
  const match = text.match(/(\d+)\s*(חשבונות|חשבוניות|קבלות|מסמכים|קבצים)/);
  if (match) {
    const count = parseInt(match[1], 10);
    if (count > 0 && count <= 50) return count;
  }
  return 3;
};

/**
 * Infer period from searchable text.
 * @param text - Lowercased searchable text from form.
 * @returns Detected period string or MISSING.
 */
const inferPeriod = (text: string): string => {
  const periodMatch = text.match(/(\d{1,2}-\d{1,2}\/\d{4})/);
  if (periodMatch) return periodMatch[1];

  const biMonthlyMatch = text.match(/(\d{1,2})[-.](\d{2,4})/);
  if (biMonthlyMatch) return `${biMonthlyMatch[1]}/${biMonthlyMatch[2]}`;

  return MISSING;
};

/**
 * Build placeholder mapping rows from detected signals.
 * @param text - Lowercased searchable text from form.
 * @returns Array of mapping rows.
 */
const buildMappingRows = (text: string): readonly MappingRow[] => {
  const rowCount = detectRowCount(text);
  const supplier = inferSupplier(text);
  const period = inferPeriod(text);
  const classification = inferExpenseClassification(text);

  return Array.from({ length: rowCount }, (_, i): MappingRow => ({
    index: i + 1,
    supplier,
    periodFromInput: period,
    invoiceDate: MISSING,
    amountBeforeVat: MISSING,
    vatAmount: MISSING,
    totalAmount: MISSING,
    accountingSystemStatus: NOT_VERIFIED,
    vatReportAssignment: NEEDS_ASSIGNMENT,
    expenseClassification: classification,
    reviewNote: i === 0 ? 'לבדוק כפילות מול מערכת הנהלת החשבונות' : NEEDS_REVIEW,
  }));
};
// #endregion

// #region Component
/**
 * VatMappingTablePreview — Preview-only mapping table for batch/duplicate VAT signals.
 * Renders placeholder rows when batch or duplicate-risk signals are detected.
 * No persistence, no accounting actions, no file operations.
 *
 * @param props - VatMappingTablePreviewProps
 * @returns JSX element or null
 */
export default function VatMappingTablePreview({ hasBatchSignal, hasDuplicateRisk, searchableText }: VatMappingTablePreviewProps) {
  if (!hasBatchSignal && !hasDuplicateRisk) return null;

  const rows = buildMappingRows(searchableText);

  return (
    <article data-testid="vat-mapping-table-preview" style={wrapperStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>
        טבלת מיפוי חשבוניות / הנהלת חשבונות
        <span style={{ color: '#67e8f9', fontWeight: 800, marginInlineStart: 8 }}>[תצוגה מקדימה]</span>
      </h3>
      <p style={warningStyle}>⚠️ {WARNING_TEXT}</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {TABLE_COLUMNS.map((col) => (
                <th key={col} style={headerCellStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.index}>
                <td style={cellStyle}>{row.index}</td>
                <td style={cellStyle}>{row.supplier}</td>
                <td style={cellStyle}>{row.periodFromInput}</td>
                <td style={cellStyle}>{row.invoiceDate}</td>
                <td style={cellStyle}>{row.amountBeforeVat}</td>
                <td style={cellStyle}>{row.vatAmount}</td>
                <td style={cellStyle}>{row.totalAmount}</td>
                <td style={cellStyle}>{row.accountingSystemStatus}</td>
                <td style={cellStyle}>{row.vatReportAssignment}</td>
                <td style={cellStyle}>{row.expenseClassification}</td>
                <td style={cellStyle}>{row.reviewNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: '12px 0 0', color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
        שדות חסרים דורשים בדיקה ידנית או OCR. הטבלה לא מייצגת רישום חשבונאי.
        <br />
        אצל אלדד כרגע מערכת הנהלת החשבונות החיצונית היא מייבן.
      </p>
    </article>
  );
}
// #endregion
