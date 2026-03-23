/**
 * FILE: FormFillerView.tsx
 * PURPOSE: UI for filling Form 2279 (ייפוי כוח רשות המיסים) using the PDF overlay engine.
 *          User fills client data → clicks generate → gets filled PDF downloaded.
 * DEPENDENCIES: pdfFormService, officeProfile
 */
import { useState, useCallback } from 'react';
import { generateForm2279, downloadBlob } from '../../../services/pdfFormService';
import type { Form2279Data } from '../../../services/pdfFormService';
import { getActiveProfile } from '../../../data/officeProfile';

// #region Types

/** Props for FormFillerView */
interface Props {
  /** Navigate back to documents main view */
  onBack: () => void;
}

// #endregion

// #region Component

/**
 * Form 2279 filler — user fills client details, selects primary/secondary,
 * clicks generate, and gets a filled PDF downloaded.
 */
export default function FormFillerView({ onBack }: Props) {
  const profile = getActiveProfile();

  const [formData, setFormData] = useState<Form2279Data>({
    clientName: '',
    clientIdNumber: '',
    clientPhone: '',
    accountantName: profile.accountants[0] || profile.firmName,
    accountantIdNumber: profile.idNumber,
    accountantLicenseNumber: profile.licenseNumber,
    firmName: profile.firmName,
    representationType: 'primary',
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Update a single field */
  const updateField = useCallback((key: keyof Form2279Data, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  /** Generate and download the filled PDF */
  const handleGenerate = useCallback(async () => {
    if (!formData.clientName || !formData.clientIdNumber) {
      setError('חובה למלא שם לקוח ומספר ת.ז / ח.פ');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const blob = await generateForm2279(formData);
      const typeName = formData.representationType === 'primary' ? 'ראשי' : 'נוסף';
      downloadBlob(blob, `ייפוי_כוח_${typeName}_${formData.clientName}.pdf`);
    } catch (err) {
      setError('שגיאה ביצירת ה-PDF: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setGenerating(false);
    }
  }, [formData]);

  // Shared input style
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0', fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
    direction: 'rtl', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', color: '#94a3b8',
    marginBottom: 4, fontWeight: 600,
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: '#60a5fa',
        cursor: 'pointer', fontSize: '0.85rem', marginBottom: 16, padding: 0,
      }}>
        → חזרה לבוט מסמכים
      </button>

      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 24, marginBottom: 20, textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📋</div>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>ייפוי כוח — טופס 2279</h2>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
          מילוי אוטומטי של ייפוי כוח לרשות המיסים
        </p>
      </div>

      {/* Representation Type Toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {(['primary', 'secondary'] as const).map(type => (
          <button key={type} onClick={() => updateField('representationType', type)} style={{
            flex: 1, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
            border: formData.representationType === type
              ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
            background: formData.representationType === type
              ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.04)',
            color: formData.representationType === type ? '#c7d2fe' : '#94a3b8',
            fontWeight: 600, fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
          }}>
            {type === 'primary' ? '🔵 ייצוג ראשי' : '🟢 ייצוג נוסף'}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 24,
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#e2e8f0', fontSize: '1rem' }}>פרטי הלקוח</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>שם הלקוח *</label>
            <input style={inputStyle} value={formData.clientName} placeholder="שם מלא"
              onChange={e => updateField('clientName', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>ת.ז / ח.פ *</label>
            <input style={inputStyle} value={formData.clientIdNumber} placeholder="מספר זהות"
              onChange={e => updateField('clientIdNumber', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>טלפון</label>
            <input style={inputStyle} value={formData.clientPhone || ''} placeholder="054-..."
              onChange={e => updateField('clientPhone', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>תיק מס</label>
            <input style={inputStyle} value={formData.taxFileNumber || ''} placeholder="מספר תיק"
              onChange={e => updateField('taxFileNumber', e.target.value)} />
          </div>
        </div>

        <h3 style={{ margin: '20px 0 16px 0', color: '#e2e8f0', fontSize: '1rem' }}>פרטי המייצג</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>שם המייצג</label>
            <input style={inputStyle} value={formData.accountantName}
              onChange={e => updateField('accountantName', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>ת.ז מייצג</label>
            <input style={inputStyle} value={formData.accountantIdNumber}
              onChange={e => updateField('accountantIdNumber', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>מספר רישיון</label>
            <input style={inputStyle} value={formData.accountantLicenseNumber}
              onChange={e => updateField('accountantLicenseNumber', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>שם המשרד</label>
            <input style={inputStyle} value={formData.firmName || ''}
              onChange={e => updateField('firmName', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 12, padding: '10px 16px', borderRadius: 8,
          background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '0.85rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Generate Button */}
      <button onClick={handleGenerate} disabled={generating} style={{
        width: '100%', marginTop: 16, padding: '14px 24px', borderRadius: 12,
        border: 'none', cursor: generating ? 'wait' : 'pointer',
        background: generating ? '#475569' : 'linear-gradient(135deg, #818cf8, #6366f1)',
        color: '#fff', fontSize: '1rem', fontWeight: 700,
        fontFamily: 'Heebo, sans-serif',
      }}>
        {generating ? '⏳ מייצר PDF...' : '📥 הפק ייפוי כוח PDF'}
      </button>
    </div>
  );
}

// #endregion
