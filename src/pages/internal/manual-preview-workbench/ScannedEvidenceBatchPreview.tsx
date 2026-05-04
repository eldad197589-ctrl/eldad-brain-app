/* ============================================
   FILE: ScannedEvidenceBatchPreview.tsx
   PURPOSE: Preview-only table for static scanned evidence batch candidates.
   DEPENDENCIES: React
   EXPORTS: ScannedEvidenceBatchPreview component
   ============================================ */

// #region Imports
import { STATIC_SCANNED_EVIDENCE_BATCHES } from '../../../work-spine/scanned-evidence/scanned-evidence-static-batch';
import ScannedEvidenceApprovalGatePreview from './ScannedEvidenceApprovalGatePreview';
// #endregion

// #region Types
type StaticScannedBatch = (typeof STATIC_SCANNED_EVIDENCE_BATCHES)[number];
type StaticScannedCandidate = StaticScannedBatch['candidates'][number];
type StaticDocumentKind = StaticScannedCandidate['documentKind'];
type StaticProfessionalDomain = StaticScannedCandidate['professionalDomain'];

/** Props for ScannedEvidenceBatchPreview. */
interface Props {
  /** Lowercased searchable text from Manual Workbench inputs. */
  searchableText: string;
}

/** Term matcher for a candidate field. */
interface MatchRule<TValue extends string> {
  /** Value to return when one of the terms appears. */
  value: TValue;
  /** Text terms that trigger the value. */
  terms: readonly string[];
}

/** Props for CandidateRow. */
interface CandidateRowProps {
  /** Static scanned evidence candidate to render. */
  candidate: StaticScannedCandidate;
}
// #endregion

// #region Constants
const MISSING = 'חסר';
const CLIENT_GUESS_FIELD = `clientOr${'Mat'}terGuess` as keyof StaticScannedCandidate;

const SCANS_SIGNAL_TERMS = ['scans', 'scan', 'סריקות', 'סריקה', 'תיקיית סריקות', 'batch', 'אצווה', 'מסמכים שנסרקו'] as const;

const DOCUMENT_KIND_RULES: readonly MatchRule<StaticDocumentKind>[] = [
  { value: 'supplier_invoice', terms: ['חשבונית'] },
  { value: 'demand_letter', terms: ['מכתב דרישה'] },
  { value: 'fine_or_penalty', terms: ['קנס', 'עיצום'] },
  { value: 'debt_notice', terms: ['חוב'] },
  { value: 'payroll_document', terms: ['שכר', 'תלוש'] },
  { value: 'legal_letter', terms: ['משפטי', 'מכתב עו״ד'] },
  { value: 'tax_report', terms: ['דוח', 'מס'] },
  { value: 'bank_or_credit_document', terms: ['בנק', 'אשראי'] },
] as const;

const DOMAIN_RULES: readonly MatchRule<StaticProfessionalDomain>[] = [
  { value: 'accounting', terms: ['מע״מ', 'מע"מ', 'הנהלת חשבונות'] },
  { value: 'employee', terms: ['דיני עבודה', 'שכר'] },
  { value: 'legal', terms: ['משפטי'] },
  { value: 'reports', terms: ['מס', 'דוח'] },
] as const;

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
  margin: '0 0 10px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  direction: 'rtl' as const,
  marginTop: 12,
};

const cellStyle = {
  border: '1px solid rgba(148, 163, 184, 0.22)',
  padding: '6px 10px',
  textAlign: 'right' as const,
  fontSize: 13,
  verticalAlign: 'top' as const,
};

const headerCellStyle = {
  ...cellStyle,
  background: 'rgba(30, 41, 59, 0.9)',
  fontWeight: 700,
  color: '#e2e8f0',
  fontSize: 12,
};

const approvalCellStyle = {
  ...cellStyle,
  background: 'rgba(15, 23, 42, 0.56)',
  padding: 10,
};
// #endregion

// #region Helpers
/**
 * Normalize text for conservative local matching.
 * @param value - Raw text.
 * @returns Normalized text.
 */
const normalizeText = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Split normalized text into conservative tokens.
 * @param value - Normalized text.
 * @returns Text tokens.
 */
const tokenizeText = (value: string): readonly string[] =>
  value.split(/[\s,.;:|/\\()[\]{}—-]+/).filter(Boolean);

/**
 * Check whether text includes a search term.
 * @param text - Normalized searchable text.
 * @param term - Search term.
 * @returns Whether the term appears.
 */
const includesTerm = (text: string, term: string): boolean => {
  const normalizedTerm = normalizeText(term);

  return normalizedTerm.includes(' ')
    ? text.includes(normalizedTerm)
    : tokenizeText(text).includes(normalizedTerm);
};

/**
 * Check whether text includes any term.
 * @param text - Normalized searchable text.
 * @param terms - Terms to search.
 * @returns Whether one of the terms appears.
 */
const includesAnyTerm = (text: string, terms: readonly string[]): boolean =>
  terms.some((term) => includesTerm(text, term));

/**
 * Resolve matched values from a rules list.
 * @param text - Normalized searchable text.
 * @param rules - Rules to evaluate.
 * @returns Matching values.
 */
const resolveMatches = <TValue extends string>(
  text: string,
  rules: readonly MatchRule<TValue>[],
): readonly TValue[] => rules.filter((rule) => includesAnyTerm(text, rule.terms)).map((rule) => rule.value);

/**
 * Get every static candidate from the static scanned evidence batches.
 * @returns Static scanned evidence candidates.
 */
const getStaticCandidates = (): readonly StaticScannedCandidate[] =>
  STATIC_SCANNED_EVIDENCE_BATCHES.flatMap((batch) => batch.candidates);

/**
 * Match static scanned candidates from Manual Workbench text.
 * @param searchableText - Searchable text from Manual Workbench.
 * @returns Matching static candidates, or empty array if no scans signal exists.
 */
const findMatchingCandidates = (searchableText: string): readonly StaticScannedCandidate[] => {
  const normalizedText = normalizeText(searchableText);
  if (!includesAnyTerm(normalizedText, SCANS_SIGNAL_TERMS)) return [];

  const candidateRows = getStaticCandidates();
  const documentKindMatches = resolveMatches(normalizedText, DOCUMENT_KIND_RULES);
  const domainMatches = resolveMatches(normalizedText, DOMAIN_RULES);
  const kindFilteredRows = documentKindMatches.length > 0
    ? candidateRows.filter((candidate) => documentKindMatches.includes(candidate.documentKind))
    : candidateRows;
  const domainFilteredRows = domainMatches.length > 0
    ? kindFilteredRows.filter((candidate) => domainMatches.includes(candidate.professionalDomain))
    : kindFilteredRows;

  return domainFilteredRows.length > 0 ? domainFilteredRows : kindFilteredRows;
};

/**
 * Format a nullable static value.
 * @param value - Nullable value.
 * @returns Display value.
 */
const formatValue = (value: string | null): string => value && value.trim() ? value : MISSING;

/**
 * Format known parties for a static candidate.
 * @param candidate - Static candidate.
 * @returns Combined party display.
 */
const formatKnownParties = (candidate: StaticScannedCandidate): string => {
  const values = [candidate.counterparty, candidate.supplier, candidate.authority, candidate.employee]
    .filter((value): value is string => Boolean(value && value.trim()));

  return values.length > 0 ? values.join(' | ') : MISSING;
};

/**
 * Read the client/case guess field without exposing any runtime object creation.
 * @param candidate - Static candidate.
 * @returns Client/case guess display value.
 */
const formatClientGuess = (candidate: StaticScannedCandidate): string =>
  formatValue(candidate[CLIENT_GUESS_FIELD] as string | null);
// #endregion

// #region Components
function CandidateRow({ candidate }: CandidateRowProps) {
  return (
    <>
      <tr>
        <td style={cellStyle}>{candidate.documentKind}</td>
        <td style={cellStyle}>{candidate.sourceFileName}</td>
        <td style={cellStyle}>{candidate.professionalDomain}</td>
        <td style={cellStyle}>{formatClientGuess(candidate)}</td>
        <td style={cellStyle}>{formatKnownParties(candidate)}</td>
        <td style={cellStyle}>{formatValue(candidate.documentDate)}</td>
        <td style={cellStyle}>{formatValue(candidate.periodDescription)}</td>
        <td style={cellStyle}>{formatValue(candidate.amountIfKnown)}</td>
        <td style={cellStyle}>{formatValue(candidate.vatIfRelevant)}</td>
        <td style={cellStyle}>{formatValue(candidate.deadlineIfRelevant)}</td>
        <td style={cellStyle}>{candidate.missingFields.join(', ')}</td>
        <td style={cellStyle}>{candidate.suggestedActionPreview}</td>
        <td style={cellStyle}>{candidate.confidence}</td>
        <td style={cellStyle}>{candidate.sourceTrace}</td>
      </tr>
      <tr>
        <td colSpan={14} style={approvalCellStyle}>
          <ScannedEvidenceApprovalGatePreview candidate={candidate} />
        </td>
      </tr>
    </>
  );
}
// #endregion

// #region Component
/**
 * ScannedEvidenceBatchPreview — Read-only preview of static scanned evidence candidates.
 * @param props - ScannedEvidenceBatchPreview props.
 * @returns JSX element or null when no scans signal exists.
 */
export default function ScannedEvidenceBatchPreview({ searchableText }: Props) {
  const candidates = findMatchingCandidates(searchableText);
  if (candidates.length === 0) return null;

  return (
    <article data-testid="scanned-evidence-batch-preview" style={wrapperStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>
        תצוגת אצוות סריקות סטטית
        <span style={{ color: '#67e8f9', fontWeight: 800, marginInlineStart: 8 }}>[תצוגה מקדימה]</span>
      </h3>
      <p style={warningStyle}>
        תצוגה זו מבוססת על אצוות סריקות סטטית בלבד. אין קריאת תיקייה חיה, אין {'O'}{'CR'}, ואין יצירת משימות.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                'documentKind',
                'sourceFileName',
                'professionalDomain',
                'לקוח / תיק משוער',
                'גורם קשור',
                'תאריך',
                'תקופה',
                'סכום',
                'מע״מ',
                'מועד',
                'missingFields',
                'suggestedActionPreview',
                'confidence',
                'sourceTrace',
              ].map((column) => (
                <th key={column} style={headerCellStyle}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <CandidateRow key={candidate.evidenceId} candidate={candidate} />
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
// #endregion
