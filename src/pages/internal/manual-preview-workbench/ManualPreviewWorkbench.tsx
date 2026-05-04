/* ============================================
   FILE: ManualPreviewWorkbench.tsx
   PURPOSE: Internal manual preview workbench for local-only Brain preview cascade.
   DEPENDENCIES: React
   EXPORTS: ManualPreviewWorkbench component
   ============================================ */

// #region Dependencies
import { useState } from 'react';
import type { ChangeEvent } from 'react';
// #endregion

// #region Types
/** Source types available for the manual preview workbench. */
type ManualPreviewSourceType = 'manual_text' | 'scan' | 'email' | 'drive' | 'protocol';

/** Local form state for the manual preview workbench. */
interface ManualPreviewFormState {
  /** User-entered title metadata. */
  title: string;
  /** Local source type metadata. */
  sourceType: ManualPreviewSourceType;
  /** User-entered metadata summary. */
  metadataSummary: string;
  /** Optional client or case label. */
  clientOrCaseLabel: string;
  /** Optional domain label. */
  domainLabel: string;
}

/** Preview section derived from local form metadata only. */
interface PreviewSection {
  /** Display title. */
  title: string;
  /** Display guidance lines. */
  body: readonly string[];
  /** Optional marker for local simulation. */
  simulation?: boolean;
}

/** Props for PreviewBadge. */
interface PreviewBadgeProps {
  /** Optional simulation marker. */
  simulation?: boolean;
}

/** Props for PreviewCard. */
interface PreviewCardProps {
  /** Preview section to display. */
  section: PreviewSection;
}

/** Props for FieldTextInput. */
interface FieldTextInputProps {
  /** Input id. */
  id: string;
  /** Input label. */
  label: string;
  /** Placeholder example for the input. */
  placeholder: string;
  /** Input value. */
  value: string;
  /** Input change callback. */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Props for FieldTextArea. */
interface FieldTextAreaProps {
  /** Textarea id. */
  id: string;
  /** Textarea label. */
  label: string;
  /** Placeholder example for the textarea. */
  placeholder: string;
  /** Textarea value. */
  value: string;
  /** Textarea change callback. */
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}
// #endregion

// #region Constants
const SOURCE_TYPES: readonly ManualPreviewSourceType[] = ['manual_text', 'scan', 'email', 'drive', 'protocol'];

const SOURCE_TYPE_LABELS: Record<ManualPreviewSourceType, string> = { manual_text: 'טקסט ידני', scan: 'סריקה', email: 'מייל', drive: 'Drive', protocol: 'פרוטוקול' };
const FIELD_LABELS = { title: 'כותרת המסמך / המשימה', sourceType: 'סוג מקור', metadataSummary: 'תקציר / תיאור קצר', clientOrCaseLabel: 'לקוח / תיק', domainLabel: 'תחום מקצועי' } as const;
const PLACEHOLDERS = { title: 'לדוגמה: חשבונית בזק לחודש 04/2026', metadataSummary: 'לדוגמה: חשבונית ספק שנסרקה לצורך בדיקת מע״מ והנהלת חשבונות', clientOrCaseLabel: 'לדוגמה: דוד אלדד מע״מ / דימה / צילה', domainLabel: 'לדוגמה: VAT / שכר / דיני עבודה' } as const;

const INITIAL_FORM_STATE: ManualPreviewFormState = {
  title: '',
  sourceType: 'manual_text',
  metadataSummary: '',
  clientOrCaseLabel: '',
  domainLabel: '',
};

const shellStyle = {
  minHeight: '100vh',
  padding: '32px',
  color: '#e5edf7',
  background: '#0a0e1a',
  direction: 'rtl',
  textAlign: 'right',
} as const;

const panelStyle = {
  maxWidth: 1180,
  margin: '0 auto',
  display: 'grid',
  gap: 20,
} as const;

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14,
} as const;

const cardStyle = {
  border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.82)',
  padding: 18,
} as const;

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: 8,
  background: 'rgba(2, 6, 23, 0.76)',
  color: '#f8fafc',
  padding: '10px 12px',
} as const;
// #endregion

// #region Helpers
const hasPreviewInput = (form: ManualPreviewFormState): boolean =>
  Boolean(form.title.trim() || form.metadataSummary.trim() || form.clientOrCaseLabel.trim());

const includesAny = (value: string, terms: readonly string[]): boolean =>
  terms.some((term) => value.includes(term.toLowerCase()));

const isVatBookkeepingCandidate = (form: ManualPreviewFormState): boolean => {
  const searchable = [
    form.title,
    form.sourceType,
    form.metadataSummary,
    form.clientOrCaseLabel,
    form.domainLabel,
  ].join(' ').toLowerCase();

  return includesAny(searchable, ['vat', 'מע"מ', 'מע״מ', 'הנהלת חשבונות', 'חשבונית', 'ספק']);
};

const detectLikelyDocumentType = (form: ManualPreviewFormState, vatCandidate: boolean): string => {
  if (vatCandidate) return 'supplier invoice / VAT bookkeeping evidence';
  if (form.sourceType === 'protocol') return 'meeting protocol metadata';
  if (form.sourceType === 'email') return 'email metadata intake';
  if (form.sourceType === 'drive') return 'drive document metadata';
  if (form.sourceType === 'scan') return 'scanned document metadata';
  return 'manual text metadata';
};

const detectConfidenceLabel = (form: ManualPreviewFormState, vatCandidate: boolean): 'low' | 'medium' | 'high' => {
  if (vatCandidate && form.title.trim() && form.metadataSummary.trim()) return 'high';
  if (form.title.trim() || form.metadataSummary.trim()) return 'medium';
  return 'low';
};

const detectOutputSuggestions = (form: ManualPreviewFormState, vatCandidate: boolean): string => {
  if (vatCandidate && form.sourceType === 'scan') return 'scan_intake_report + VAT_review_memo + evidence_summary';
  if (vatCandidate) return 'VAT_review_memo + task_summary';
  if (form.sourceType === 'protocol') return 'protocol_action_summary + task_summary';
  return 'task_summary + evidence_summary';
};

const buildVatGuidance = (vatCandidate: boolean): readonly string[] =>
  vatCandidate
    ? [
        'VAT relevance warning: this looks relevant to bookkeeping and period review.',
        'Bookkeeping classification suggestion: supplier expense invoice candidate.',
        'Required checks: invoice date, supplier identity, VAT amount, business/private/mixed expense, period matching, duplicate check.',
        'Preview only, not accounting advice; Eldad review required before any professional conclusion.',
      ]
    : [
        'No VAT/bookkeeping signal detected yet.',
        'Add tax, invoice, supplier, amount, or period metadata if this belongs to VAT review.',
      ];

const buildPreviewSections = (form: ManualPreviewFormState): readonly PreviewSection[] => {
  const title = form.title.trim() || 'Untitled manual preview';
  const domain = form.domainLabel.trim() || 'Unassigned domain';
  const client = form.clientOrCaseLabel.trim() || 'No client or case label';
  const summary = form.metadataSummary.trim() || 'No metadata summary entered';
  const vatCandidate = isVatBookkeepingCandidate(form);
  const likelyDocumentType = detectLikelyDocumentType(form, vatCandidate);
  const confidenceLabel = detectConfidenceLabel(form, vatCandidate);
  const outputSuggestion = detectOutputSuggestions(form, vatCandidate);

  return [
    {
      title: 'Intake Preview',
      body: [`${form.sourceType} | ${title} | ${summary}`],
    },
    {
      title: 'Practical Work Summary',
      body: [
        `Appears to be: ${likelyDocumentType}.`,
        `Why it matters: ${client} may need a reviewed, source-traced bookkeeping/evidence decision.`,
        'What Eldad should check next: amount, date, supplier, VAT period, and whether this item already exists elsewhere.',
      ],
    },
    {
      title: 'Professional Classification',
      body: [
        `suggested domain: ${domain}`,
        `likely document type: ${likelyDocumentType}`,
        `likely workflow family: ${vatCandidate ? 'VAT / bookkeeping review' : 'manual intake triage'}`,
        `confidence label: ${confidenceLabel}`,
      ],
    },
    { title: 'Routing Suggestion', body: [`${domain} | ${client} | local preview route only`] },
    {
      title: 'VAT / Bookkeeping Guidance',
      body: buildVatGuidance(vatCandidate),
    },
    {
      title: 'Approval Preview / Simulation',
      body: ['metadata_preview_only | local review required', 'No durable approval state is created from this screen.'],
      simulation: true,
    },
    {
      title: 'Operational Preview',
      body: ['hypothetical preview bundle | all real effects blocked', 'No operational object is created.'],
    },
    {
      title: 'Output Suggestion',
      body: [`Suggested preview output: ${outputSuggestion}`, `Based on ${form.sourceType}, ${domain}, and the entered metadata only.`],
    },
    {
      title: 'QC Summary',
      body: [
        'QC Warnings: missing amount, missing supplier, missing date, missing original file, source entered manually, no persistence.',
      ],
    },
    {
      title: 'Evidence Checklist',
      body: [
        'source trace needed',
        'original document needed',
        'supplier name needed',
        'amount/date/VAT fields needed',
        'proof of payment if relevant',
        'client/case label verification',
      ],
    },
    {
      title: 'Evidence Hints',
      body: [`${client} | source trace hint only`, 'Keep the real document in the official source location outside this preview.'],
    },
    {
      title: 'Learning Hints',
      body: [`${domain} | non-binding observation hint`, 'This does not write to memory or a knowledge log.'],
    },
    {
      title: 'Suggested Next Step For Eldad',
      body: [
        'בדוק אם החשבונית שייכת לתקופת המע״מ הנכונה',
        'ודא שהחשבונית לא נקלטה כבר',
        'הוסף סכום, תאריך וספק אם רוצים להפיק תצוגה מדויקת יותר',
        'אם זה מסמך אמיתי — שמור אותו בתיק המקור הרשמי מחוץ למערכת עד שיהיה Gate לקבצים',
      ],
    },
    {
      title: 'Safety Panel',
      body: [
        'no persistence',
        'no provider connection',
        'no file access',
        'no operational object created',
        'no official accounting entry created',
        'no document filed',
      ],
    },
  ];
};
// #endregion

// #region Components
function PreviewBadge({ simulation }: PreviewBadgeProps) {
  return (
    <span style={{ color: '#67e8f9', fontWeight: 800, marginInlineStart: 8 }}>
      [PREVIEW]{simulation ? ' [סימולציה]' : ''}
    </span>
  );
}

function PreviewCard({ section }: PreviewCardProps) {
  return (
    <article data-testid="manual-preview-section" style={cardStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>
        {section.title}
        <PreviewBadge simulation={section.simulation} />
      </h3>
      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', lineHeight: 1.6 }}>
        {section.body.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </article>
  );
}

function FieldTextInput({ id, label, placeholder, value, onChange }: FieldTextInputProps) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 7 }}>
      <span>{label}</span>
      <input id={id} aria-label={label} placeholder={placeholder} value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function FieldTextArea({ id, label, placeholder, value, onChange }: FieldTextAreaProps) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 7 }}>
      <span>{label}</span>
      <textarea
        id={id}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={5}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
    </label>
  );
}
// #endregion

// #region Component
/**
 * ManualPreviewWorkbench — Local-only internal workbench for previewing manual Brain metadata.
 *
 * @example
 * <ManualPreviewWorkbench />
 */
export default function ManualPreviewWorkbench() {
  const [form, setForm] = useState<ManualPreviewFormState>(INITIAL_FORM_STATE);
  const previewSections = buildPreviewSections(form);
  const previewReady = hasPreviewInput(form);

  const updateText = (field: keyof ManualPreviewFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const updateSourceType = (event: ChangeEvent<HTMLSelectElement>) =>
    setForm((current) => ({ ...current, sourceType: event.target.value as ManualPreviewSourceType }));

  return (
    <main style={shellStyle} dir="rtl" lang="he">
      <section style={panelStyle}>
        <div style={{ ...cardStyle, borderColor: 'rgba(251, 191, 36, 0.55)' }}>
          <strong>⚠️ סביבת עבודה פנימית — תצוגה מקדימה בלבד — שום דבר לא נשמר</strong>
        </div>

        <form style={{ ...cardStyle, display: 'grid', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Manual Preview Workbench</h1>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6 }}>הזן כאן קלט ידני כדי לראות כיצד המוח היה מסווג, בודק ומציע המשך טיפול — ללא שמירה וללא פעולה אמיתית.</p>
          <div style={formGridStyle}>
            <FieldTextInput id="manual-preview-title" label={FIELD_LABELS.title} placeholder={PLACEHOLDERS.title} value={form.title} onChange={updateText('title')} />
            <label htmlFor="manual-preview-source-type" style={{ display: 'grid', gap: 7 }}>
              <span>{FIELD_LABELS.sourceType}</span>
              <select id="manual-preview-source-type" aria-label={FIELD_LABELS.sourceType} value={form.sourceType} onChange={updateSourceType} style={inputStyle}>
                {SOURCE_TYPES.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>{SOURCE_TYPE_LABELS[sourceType]}</option>
                ))}
              </select>
            </label>
            <FieldTextInput id="manual-preview-client" label={FIELD_LABELS.clientOrCaseLabel} placeholder={PLACEHOLDERS.clientOrCaseLabel} value={form.clientOrCaseLabel} onChange={updateText('clientOrCaseLabel')} />
            <FieldTextInput id="manual-preview-domain" label={FIELD_LABELS.domainLabel} placeholder={PLACEHOLDERS.domainLabel} value={form.domainLabel} onChange={updateText('domainLabel')} />
          </div>
          <FieldTextArea id="manual-preview-summary" label={FIELD_LABELS.metadataSummary} placeholder={PLACEHOLDERS.metadataSummary} value={form.metadataSummary} onChange={updateText('metadataSummary')} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setForm(INITIAL_FORM_STATE)}>איפוס</button>
            <button type="button" onClick={() => setForm({ ...INITIAL_FORM_STATE })}>נקה</button>
          </div>
        </form>

        {previewReady ? (
          <section aria-label="preview cascade" style={{ display: 'grid', gap: 14 }}>
            {previewSections.map((section) => <PreviewCard key={section.title} section={section} />)}
          </section>
        ) : null}
      </section>
    </main>
  );
}
// #endregion
