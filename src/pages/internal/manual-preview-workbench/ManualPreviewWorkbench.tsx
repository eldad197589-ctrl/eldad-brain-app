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
  /** Display body. */
  body: string;
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
  /** Input value. */
  value: string;
  /** Input change callback. */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Props for FieldTextArea. */
interface FieldTextAreaProps {
  /** Textarea id. */
  id: string;
  /** Textarea value. */
  value: string;
  /** Textarea change callback. */
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}
// #endregion

// #region Constants
const SOURCE_TYPES: readonly ManualPreviewSourceType[] = [
  'manual_text',
  'scan',
  'email',
  'drive',
  'protocol',
];

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

const buildPreviewSections = (form: ManualPreviewFormState): readonly PreviewSection[] => {
  const title = form.title.trim() || 'Untitled manual preview';
  const domain = form.domainLabel.trim() || 'Unassigned domain';
  const client = form.clientOrCaseLabel.trim() || 'No client or case label';
  const summary = form.metadataSummary.trim() || 'No metadata summary entered';

  return [
    { title: 'Intake Preview', body: `${form.sourceType} | ${title} | ${summary}` },
    { title: 'Routing Suggestion', body: `${domain} | ${client} | local preview route only` },
    { title: 'Approval Preview / Simulation', body: 'metadata_preview_only | local review required', simulation: true },
    { title: 'Operational Preview', body: 'hypothetical preview bundle | all real effects blocked' },
    { title: 'Output Suggestion', body: `preview draft suggestion for ${title}` },
    { title: 'QC Summary', body: 'manual review required | no durable decision' },
    { title: 'Evidence Hints', body: `${client} | source trace hint only` },
    { title: 'Learning Hints', body: `${domain} | non-binding observation hint` },
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
      <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6 }}>{section.body}</p>
    </article>
  );
}

function FieldTextInput({ id, label, value, onChange }: FieldTextInputProps) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 7 }}>
      <span>{label}</span>
      <input id={id} aria-label={label} value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function FieldTextArea({ id, value, onChange }: FieldTextAreaProps) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 7 }}>
      <span>metadataSummary</span>
      <textarea
        id={id}
        aria-label="metadataSummary"
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
    <main style={shellStyle}>
      <section style={panelStyle}>
        <div style={{ ...cardStyle, borderColor: 'rgba(251, 191, 36, 0.55)' }}>
          <strong>⚠️ סביבת עבודה פנימית — תצוגה מקדימה בלבד — שום דבר לא נשמר</strong>
        </div>

        <form style={{ ...cardStyle, display: 'grid', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Manual Preview Workbench</h1>
          <div style={formGridStyle}>
            <FieldTextInput id="manual-preview-title" label="title" value={form.title} onChange={updateText('title')} />
            <label htmlFor="manual-preview-source-type" style={{ display: 'grid', gap: 7 }}>
              <span>sourceType</span>
              <select id="manual-preview-source-type" aria-label="sourceType" value={form.sourceType} onChange={updateSourceType} style={inputStyle}>
                {SOURCE_TYPES.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>{sourceType}</option>
                ))}
              </select>
            </label>
            <FieldTextInput id="manual-preview-client" label="clientOrCaseLabel" value={form.clientOrCaseLabel} onChange={updateText('clientOrCaseLabel')} />
            <FieldTextInput id="manual-preview-domain" label="domainLabel" value={form.domainLabel} onChange={updateText('domainLabel')} />
          </div>
          <FieldTextArea id="manual-preview-summary" value={form.metadataSummary} onChange={updateText('metadataSummary')} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setForm(INITIAL_FORM_STATE)}>Reset</button>
            <button type="button" onClick={() => setForm({ ...INITIAL_FORM_STATE })}>Clear</button>
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
