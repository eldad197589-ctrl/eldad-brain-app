/* ============================================
   FILE: HypotheticalScannedTaskShapePreview.tsx
   PURPOSE: Passive hypothetical task-shape preview for static scanned evidence.
   DEPENDENCIES: React
   EXPORTS: HypotheticalScannedTaskShapePreview component
   ============================================ */

// #region Imports
import type {
  DocumentKind,
  ProfessionalDomain,
  ScannedEvidenceCandidate,
} from '../../../work-spine/scanned-evidence/scanned-evidence-types';
// #endregion

// #region Types
type SuggestedPriority = 'low' | 'medium' | 'high';

/** Local-only hypothetical scanned task shape preview. */
interface HypotheticalScannedTaskShapePreview {
  /** Stable preview identifier, not an operational identifier. */
  previewId: string;
  /** Static scanned evidence id used as the preview source. */
  sourceEvidenceId: string;
  /** Passive suggested title for review display. */
  suggestedTaskTitle: string;
  /** Passive suggested type derived from the document kind. */
  suggestedTaskType: string;
  /** Passive priority hint derived from static risk and confidence only. */
  suggestedPriority: SuggestedPriority;
  /** Passive review owner label. */
  suggestedOwner: 'eldad_review';
  /** Evidence status proving this comes from a static candidate preview. */
  evidenceStatus: 'static_candidate_preview';
  /** Static source trace copied from the scanned evidence candidate. */
  sourceTrace: string;
  /** Preview marker. */
  previewOnly: true;
  /** Static marker. */
  staticOnly: true;
  /** Hypothetical marker. */
  hypotheticalOnly: true;
  /** Human review is required before any future step. */
  requiresEldadApproval: true;
  /** No human approval has been granted here. */
  approvedByEldad: false;
  /** Creation of a WorkItem is blocked. */
  canCreateWorkItem: false;
  /** Creation of a Matter is blocked. */
  canCreateMatter: false;
  /** Creation of a DocumentRef is blocked. */
  canCreateDocumentRef: false;
  /** Persistence is blocked. */
  canPersist: false;
  /** Execution is blocked. */
  canExecute: false;
  /** Submission is blocked. */
  canSubmit: false;
  /** Filing is blocked. */
  canFile: false;
  /** Blocked actions for this passive preview. */
  blockedActions: readonly string[];
}

/** Props for HypotheticalScannedTaskShapePreview. */
interface Props {
  /** Static scanned evidence candidate to preview. */
  candidate: ScannedEvidenceCandidate;
}

/** Passive display field for the hypothetical preview grid. */
interface PreviewField {
  /** Visible field label. */
  label: string;
  /** Visible field value. */
  value: string;
}

/** Props for PreviewFieldCell. */
interface PreviewFieldCellProps {
  /** Passive preview field to render. */
  field: PreviewField;
}
// #endregion

// #region Constants
const WARNING_TEXT =
  'תצוגת משימה היפותטית בלבד — לא נוצרה משימה, לא נוצר WorkItem, לא נוצר Matter, לא נוצר DocumentRef, ולא נשמר דבר.';

const BLOCKED_ACTIONS = [
  'create_work_item',
  'create_matter',
  'create_document_ref',
  'persist',
  'execute',
  'submit',
  'file',
  'provider_action',
  'scan_runtime_action',
  'ocr_runtime_action',
  'file_access',
] as const;

const TASK_TYPE_BY_DOCUMENT_KIND: Record<DocumentKind, string> = {
  supplier_invoice: 'hypothetical_supplier_invoice_review',
  demand_letter: 'hypothetical_demand_letter_review',
  fine_or_penalty: 'hypothetical_fine_or_penalty_review',
  debt_notice: 'hypothetical_debt_notice_review',
  payroll_document: 'hypothetical_payroll_document_review',
  legal_letter: 'hypothetical_legal_letter_review',
  tax_report: 'hypothetical_tax_report_review',
  bank_or_credit_document: 'hypothetical_bank_or_credit_review',
  unknown: 'hypothetical_unknown_document_review',
};

const TITLE_BY_DOMAIN: Record<ProfessionalDomain, string> = {
  accounting: 'בדיקת מסמך חשבונאי',
  legal: 'בדיקת מסמך משפטי',
  employee: 'בדיקת מסמך עובד',
  reports: 'בדיקת מסמך דיווח',
  support: 'בדיקת מסמך תמיכה',
  core: 'בדיקת מסמך ליבה',
  unknown: 'בדיקת מסמך לא מסווג',
};

const wrapperStyle = {
  border: '1px solid rgba(251, 191, 36, 0.24)',
  borderRadius: 8,
  background: 'rgba(69, 26, 3, 0.22)',
  color: '#fffbeb',
  marginTop: 10,
  padding: 12,
};

const warningStyle = {
  color: '#fde68a',
  fontWeight: 800,
  margin: '0 0 8px',
  fontSize: 13,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const labelStyle = {
  color: '#fcd34d',
  display: 'block',
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 4,
};
// #endregion

// #region Helpers
/**
 * Resolve a conservative priority hint from static candidate metadata only.
 * @param candidate - Static scanned evidence candidate.
 * @returns Passive priority hint.
 */
const resolveSuggestedPriority = (candidate: ScannedEvidenceCandidate): SuggestedPriority => {
  if (candidate.duplicateRisk === 'likely') return 'high';
  if (candidate.duplicateRisk === 'possible') return 'medium';
  if (candidate.confidence === 'low') return 'medium';

  return 'low';
};

/**
 * Build a passive title from static candidate labels only.
 * @param candidate - Static scanned evidence candidate.
 * @returns Suggested title text.
 */
const buildSuggestedTitle = (candidate: ScannedEvidenceCandidate): string => {
  const domainLabel = TITLE_BY_DOMAIN[candidate.professionalDomain];
  const clientLabel = candidate.clientOrMatterGuess ?? 'חסר לקוח / תיק';

  return `${domainLabel}: ${candidate.sourceFileName} (${clientLabel})`;
};

/**
 * Build the local hypothetical preview shape.
 * @param candidate - Static scanned evidence candidate.
 * @returns Hypothetical preview data.
 */
const buildHypotheticalPreview = (
  candidate: ScannedEvidenceCandidate,
): HypotheticalScannedTaskShapePreview => ({
  previewId: `hypothetical-preview-${candidate.evidenceId}`,
  sourceEvidenceId: candidate.evidenceId,
  suggestedTaskTitle: buildSuggestedTitle(candidate),
  suggestedTaskType: TASK_TYPE_BY_DOCUMENT_KIND[candidate.documentKind],
  suggestedPriority: resolveSuggestedPriority(candidate),
  suggestedOwner: 'eldad_review',
  evidenceStatus: 'static_candidate_preview',
  sourceTrace: candidate.sourceTrace,
  previewOnly: true,
  staticOnly: true,
  hypotheticalOnly: true,
  requiresEldadApproval: true,
  approvedByEldad: false,
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canPersist: false,
  canExecute: false,
  canSubmit: false,
  canFile: false,
  blockedActions: BLOCKED_ACTIONS,
});

/**
 * Format a readonly string list for passive display.
 * @param values - Values to format.
 * @returns Joined display text.
 */
const formatList = (values: readonly string[]): string => values.join(', ');

/**
 * Build passive display fields for the hypothetical preview grid.
 * @param preview - Hypothetical preview data.
 * @returns Passive display fields.
 */
const buildPreviewFields = (preview: HypotheticalScannedTaskShapePreview): readonly PreviewField[] => [
  { label: 'previewId', value: preview.previewId },
  { label: 'sourceEvidenceId', value: preview.sourceEvidenceId },
  { label: 'suggestedTaskTitle', value: preview.suggestedTaskTitle },
  { label: 'suggestedTaskType', value: preview.suggestedTaskType },
  { label: 'suggestedPriority', value: preview.suggestedPriority },
  { label: 'suggestedOwner', value: preview.suggestedOwner },
  { label: 'evidenceStatus', value: preview.evidenceStatus },
  { label: 'previewOnly', value: String(preview.previewOnly) },
  { label: 'staticOnly', value: String(preview.staticOnly) },
  { label: 'hypotheticalOnly', value: String(preview.hypotheticalOnly) },
  { label: 'requiresEldadApproval', value: String(preview.requiresEldadApproval) },
  { label: 'approvedByEldad', value: String(preview.approvedByEldad) },
  { label: 'canCreateWorkItem', value: String(preview.canCreateWorkItem) },
  { label: 'canCreateMatter', value: String(preview.canCreateMatter) },
  { label: 'canCreateDocumentRef', value: String(preview.canCreateDocumentRef) },
  { label: 'canPersist', value: String(preview.canPersist) },
  { label: 'canExecute', value: String(preview.canExecute) },
  { label: 'canSubmit', value: String(preview.canSubmit) },
  { label: 'canFile', value: String(preview.canFile) },
  { label: 'blockedActions', value: formatList(preview.blockedActions) },
  { label: 'sourceTrace', value: preview.sourceTrace },
];
// #endregion

// #region Component
function PreviewFieldCell({ field }: PreviewFieldCellProps) {
  return (
    <div>
      <span style={labelStyle}>{field.label}</span>
      {field.value}
    </div>
  );
}

/**
 * HypotheticalScannedTaskShapePreview — Passive task-shape preview, not a real operational object.
 * @param props - HypotheticalScannedTaskShapePreview props.
 * @returns Read-only hypothetical task-shape preview.
 */
export default function HypotheticalScannedTaskShapePreview({ candidate }: Props) {
  const preview = buildHypotheticalPreview(candidate);
  const fields = buildPreviewFields(preview);

  return (
    <section data-testid="hypothetical-scanned-task-shape-preview" style={wrapperStyle}>
      <p style={warningStyle}>{WARNING_TEXT}</p>
      <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>
        תצוגת צורת משימה היפותטית <span style={{ color: '#facc15' }}>PREVIEW ONLY</span>
      </h4>
      <p style={{ margin: '0 0 10px', color: '#fed7aa', fontWeight: 700 }}>
        Approved by Eldad: false | Requires Eldad approval | No operational object exists | No scan/OCR/file/provider/persistence action occurred
      </p>
      <div style={gridStyle}>
        {fields.map((field) => (
          <PreviewFieldCell key={field.label} field={field} />
        ))}
      </div>
    </section>
  );
}
// #endregion
