/* ============================================
   FILE: DocumentEditor.tsx
   PURPOSE: DocumentEditor component
   DEPENDENCIES: lucide-react
   EXPORTS: DocumentEditor (default)
   ============================================ */
/**
 * DocumentEditor — Dynamic form for filling in document template fields
 *
 * FILE: components/DocumentEditor.tsx
 * PURPOSE: Renders form fields based on the selected template's field definitions.
 *          Each field type (text, date, textarea, select, currency, phone, email)
 *          gets the appropriate input control.
 * DEPENDENCIES: ../types
 */
import { ArrowRight } from 'lucide-react';
import type { LetterField, LetterTemplate } from '../types';

// #region Types

/** Props for DocumentEditor */
interface Props {
  /** The currently selected template */
  template: LetterTemplate;
  /** Current form field values */
  formData: Record<string, string>;
  /** Callback when a field value changes */
  onFieldChange: (fieldId: string, value: string) => void;
  /** Callback to go back to template selection */
  onBack: () => void;
  /** Callback to proceed to preview */
  onPreview: () => void;
}

// #endregion

// #region Styles

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)', color: '#e2e8f0',
  fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#94a3b8', fontSize: '0.85rem',
  fontWeight: 600, marginBottom: 6,
};

// #endregion

// #region Component

/**
 * Renders a dynamic form whose fields are defined by the template.
 *
 * @example
 * <DocumentEditor template={tmpl} formData={data} onFieldChange={update} onBack={f} onPreview={f} />
 */
export default function DocumentEditor({ template, formData, onFieldChange, onBack, onPreview }: Props) {
  const Icon = template.icon;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          background: 'none', border: 'none', color: '#60a5fa',
          fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          fontWeight: 600,
        }}
      >
        <ArrowRight size={16} /> חזרה לרשימת תבניות
      </button>

      {/* Template title */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
        padding: '16px 20px', borderRadius: 14,
        background: 'rgba(99,102,241,0.06)',
        boxShadow: '0 0 0 1px rgba(99,102,241,0.15)',
      }}>
        <Icon size={24} style={{ color: '#818cf8' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' }}>
            {template.title}
          </h2>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{template.description}</span>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {template.fields.map(field => (
          <FieldInput
            key={field.id}
            field={field}
            value={formData[field.id] || ''}
            onChange={val => onFieldChange(field.id, val)}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={onPreview}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          📄 תצוגה מקדימה
        </button>
      </div>
    </div>
  );
}

// #endregion

// #region Field Components

/** Renders a single form field based on its type */
function FieldInput({ field, value, onChange }: {
  field: LetterField; value: string; onChange: (val: string) => void;
}) {
  const required = field.required;

  return (
    <div style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
      <label style={labelStyle}>
        {field.label}
        {required && <span style={{ color: '#f87171', marginRight: 4 }}>*</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
        />
      ) : field.type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="">— בחר —</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === 'currency' ? 'number' : field.type === 'phone' ? 'tel' : field.type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}

// #endregion
