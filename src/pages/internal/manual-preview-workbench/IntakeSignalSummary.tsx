/* ============================================
   FILE: IntakeSignalSummary.tsx
   PURPOSE: Read-only manual text signal summary for the Manual Preview Workbench.
   DEPENDENCIES: React
   EXPORTS: IntakeSignalSummary component
   ============================================ */

// #region Types
type SignalSummaryKind = 'scans_dima' | 'tsila_payroll' | 'vat_maven_bezeq' | 'general_manual_signal';

/** Local-only preview shape for manual input signal display. */
interface IntakeSignalSummaryPreview {
  /** Stable preview marker. */
  previewId: string;
  /** Human-readable signal summary. */
  summaryText: string;
  /** Static matched signal labels only. */
  matchedSignals: readonly string[];
  /** Static context labels that may already be visible elsewhere in the Workbench. */
  staticContexts: readonly string[];
  /** Review-only next step marker. */
  nextSafeStep: 'eldad_review_required';
  /** Preview-only marker. */
  previewOnly: true;
  /** Static-only marker. */
  staticOnly: true;
  /** Manual text signal marker. */
  manualSignalsOnly: true;
  /** Content-reading blocker. */
  contentRead: false;
  /** OCR blocker. */
  ocrRun: false;
  /** Source verification blocker. */
  sourceVerified: false;
  /** Calculation blocker. */
  calculationPerformed: false;
  /** Reconciliation blocker. */
  reconciliationPerformed: false;
  /** Live provider blocker. */
  liveProviderConnected: false;
  /** Task creation blocker. */
  canCreateTask: false;
  /** Record creation blocker. */
  canCreateRecord: false;
  /** Persistence blocker. */
  canPersist: false;
}

/** Props for IntakeSignalSummary. */
interface Props {
  /** Lowercased searchable text from Manual Workbench inputs. */
  searchableText: string;
}

/** Passive display field for safety flags. */
interface FlagField {
  /** Visible flag name. */
  label: string;
  /** Visible flag value. */
  value: string;
}
// #endregion

// #region Constants
const GLOBAL_WARNING =
  'סיכום רמזי קלט בלבד — זוהו מילים/רמזים בטקסט ידני. לא בוצע ניתוח תוכן, לא נקראו קבצים, לא הופעל OCR, לא אומת מקור, לא בוצע חישוב, לא בוצעה התאמה, ולא נוצרה משימה או רשומה.';

const BADGES = [
  'זיהוי רמזים בלבד',
  'PREVIEW ONLY',
  'No source content read',
  'No OCR',
  'No live provider',
  'No calculation',
  'No reconciliation',
  'No task or record creation',
  'Requires Eldad review',
] as const;

const COPY_BY_KIND: Record<SignalSummaryKind, string> = {
  scans_dima:
    'הקלט מכיל רמז לסריקות ולתיק דימה. מוצגת אצוות סריקות סטטית והקשר דימה סטטי/חלקי בלבד. לא נקראה תיקייה, לא נקראו קבצים, לא הופעל OCR, ולא נוצרה משימה.',
  tsila_payroll:
    'הקלט מכיל רמז לצילה ולהקשר שכר. מוצג הקשר ידוע בלבד, לא ראיה מחייבת. לא בוצע חישוב שכר, לא נקראו תלושים, ולא הופקה מסקנה מקצועית.',
  vat_maven_bezeq:
    'הקלט מכיל רמז למע״מ, מייבן ובזק. מוצג הקשר VAT סטטי בלבד. אין גישה חיה למייבן, לא בוצעה התאמה, לא בוצע חישוב, ולא נרשמה פקודת הנהלת חשבונות.',
  general_manual_signal:
    'הקלט מכיל רמז לקלט ידני. מוצג הקשר סטטי בלבד. לא בוצעה קריאת קבצים, לא בוצע OCR, ולא נוצרה משימה.',
};

const SIGNALS_BY_KIND: Record<SignalSummaryKind, readonly string[]> = {
  scans_dima: ['סריקות', 'דימה'],
  tsila_payroll: ['צילה', 'שכר'],
  vat_maven_bezeq: ['מע״מ', 'מייבן', 'בזק'],
  general_manual_signal: ['קלט ידני'],
};

const CONTEXTS_BY_KIND: Record<SignalSummaryKind, readonly string[]> = {
  scans_dima: ['static scanned intake batch', 'Dima partial static context'],
  tsila_payroll: ['Tsila known context only', 'payroll signal context'],
  vat_maven_bezeq: ['VAT static context', 'bookkeeping-system text signal'],
  general_manual_signal: ['manual preview context'],
};

const wrapperStyle = {
  border: '1px solid rgba(56, 189, 248, 0.28)',
  borderRadius: 8,
  background: 'rgba(12, 74, 110, 0.26)',
  color: '#e0f2fe',
  padding: 16,
};

const warningStyle = {
  color: '#fde68a',
  fontWeight: 800,
  margin: '0 0 10px',
  fontSize: 13,
};

const badgeRowStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 8,
  margin: '10px 0',
};

const badgeStyle = {
  border: '1px solid rgba(125, 211, 252, 0.32)',
  borderRadius: 999,
  color: '#bae6fd',
  fontSize: 12,
  fontWeight: 800,
  padding: '4px 8px',
};

const flagGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 8,
  marginTop: 12,
};

const flagStyle = {
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.34)',
  color: '#cbd5e1',
  fontSize: 12,
  padding: '6px 8px',
};
// #endregion

// #region Helpers
/**
 * Normalize text for conservative local signal matching.
 * @param value - Raw text.
 * @returns Normalized text.
 */
const normalizeText = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Check if normalized text contains any term.
 * @param text - Normalized searchable text.
 * @param terms - Terms to match.
 * @returns Whether one of the terms appears.
 */
const includesAny = (text: string, terms: readonly string[]): boolean =>
  terms.some((term) => text.includes(normalizeText(term)));

/**
 * Resolve the safest summary kind from manual text signals only.
 * @param searchableText - Manual searchable text.
 * @returns Signal summary kind.
 */
const resolveSignalKind = (searchableText: string): SignalSummaryKind => {
  const text = normalizeText(searchableText);
  const hasScans = includesAny(text, ['סריקות', 'סריקה', 'scans', 'scan', 'batch']);
  const hasDima = includesAny(text, ['דימה', 'dima']);
  const hasTsila = includesAny(text, ['צילה', 'tsila']);
  const hasPayroll = includesAny(text, ['שכר', 'תלוש', 'payroll']);
  const hasVat = includesAny(text, ['מע״מ', 'מע"מ', 'vat']);
  const hasMaven = includesAny(text, ['מייבן']);
  const hasBezeq = includesAny(text, ['בזק']);

  if (hasScans && hasDima) return 'scans_dima';
  if (hasTsila && hasPayroll) return 'tsila_payroll';
  if (hasVat && hasMaven && hasBezeq) return 'vat_maven_bezeq';

  return 'general_manual_signal';
};

/**
 * Build local-only summary data.
 * @param searchableText - Manual searchable text.
 * @returns Static signal summary preview.
 */
const buildSignalSummaryPreview = (searchableText: string): IntakeSignalSummaryPreview => {
  const signalKind = resolveSignalKind(searchableText);

  return {
    previewId: `intake-signal-summary-${signalKind}`,
    summaryText: COPY_BY_KIND[signalKind],
    matchedSignals: SIGNALS_BY_KIND[signalKind],
    staticContexts: CONTEXTS_BY_KIND[signalKind],
    nextSafeStep: 'eldad_review_required',
    previewOnly: true,
    staticOnly: true,
    manualSignalsOnly: true,
    contentRead: false,
    ocrRun: false,
    sourceVerified: false,
    calculationPerformed: false,
    reconciliationPerformed: false,
    liveProviderConnected: false,
    canCreateTask: false,
    canCreateRecord: false,
    canPersist: false,
  };
};

/**
 * Build passive visible safety flags.
 * @param preview - Signal summary preview.
 * @returns Safety flag fields.
 */
const buildFlagFields = (preview: IntakeSignalSummaryPreview): readonly FlagField[] => [
  { label: 'previewOnly', value: String(preview.previewOnly) },
  { label: 'staticOnly', value: String(preview.staticOnly) },
  { label: 'manualSignalsOnly', value: String(preview.manualSignalsOnly) },
  { label: 'contentRead', value: String(preview.contentRead) },
  { label: 'ocrRun', value: String(preview.ocrRun) },
  { label: 'sourceVerified', value: String(preview.sourceVerified) },
  { label: 'calculationPerformed', value: String(preview.calculationPerformed) },
  { label: 'reconciliationPerformed', value: String(preview.reconciliationPerformed) },
  { label: 'liveProviderConnected', value: String(preview.liveProviderConnected) },
  { label: 'canCreateTask', value: String(preview.canCreateTask) },
  { label: 'canCreateRecord', value: String(preview.canCreateRecord) },
  { label: 'canPersist', value: String(preview.canPersist) },
];

/**
 * Format static labels for passive display.
 * @param values - Values to format.
 * @returns Display text.
 */
const formatList = (values: readonly string[]): string => values.join(', ');
// #endregion

// #region Component
/**
 * IntakeSignalSummary — Read-only summary of manual text signals only.
 * @param props - IntakeSignalSummary props.
 * @returns Passive signal summary.
 */
export default function IntakeSignalSummary({ searchableText }: Props) {
  const preview = buildSignalSummaryPreview(searchableText);
  const flagFields = buildFlagFields(preview);

  return (
    <article data-testid="intake-signal-summary" style={wrapperStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>סיכום רמזי קלט</h3>
      <p style={warningStyle}>{GLOBAL_WARNING}</p>
      <div style={badgeRowStyle}>
        {BADGES.map((badge) => (
          <span key={badge} style={badgeStyle}>{badge}</span>
        ))}
      </div>
      <p style={{ margin: '0 0 8px', color: '#f8fafc', fontWeight: 700 }}>{preview.summaryText}</p>
      <p style={{ margin: '0 0 6px', color: '#bae6fd' }}>matchedSignals: {formatList(preview.matchedSignals)}</p>
      <p style={{ margin: 0, color: '#bae6fd' }}>staticContexts: {formatList(preview.staticContexts)}</p>
      <div style={flagGridStyle}>
        {flagFields.map((field) => (
          <span key={field.label} style={flagStyle}>{field.label}:{field.value}</span>
        ))}
      </div>
      <p style={{ margin: '10px 0 0', color: '#fde68a', fontWeight: 800 }}>
        nextSafeStep:{preview.nextSafeStep}
      </p>
    </article>
  );
}
// #endregion
