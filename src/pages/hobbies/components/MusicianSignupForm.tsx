/**
 * FILE: MusicianSignupForm.tsx
 * PURPOSE: Personal details form for musician/audience signup — name, phone, instruments, notes
 * DEPENDENCIES: react, lucide-react, ../types, ../constants
 */

// #region Imports
import { useState } from 'react';
import { User, Phone, MessageSquare } from 'lucide-react';
import type { InstrumentType } from '../types';
import { INSTRUMENT_LABELS, INSTRUMENT_EMOJIS } from '../constants';
// #endregion

// #region Types

/** Signup form data */
export interface SignupFormData {
  /** Full name */
  name: string;
  /** Phone number */
  phone: string;
  /** Selected instruments (empty = audience/singer) */
  instruments: InstrumentType[];
  /** Role: musician or audience */
  role: 'musician' | 'audience';
  /** Free-text notes */
  notes: string;
}

/** Props for the MusicianSignupForm component */
interface Props {
  /** Current form values */
  formData: SignupFormData;
  /** Callback when any field changes */
  onChange: (data: SignupFormData) => void;
}

// #endregion

// #region Component

/**
 * MusicianSignupForm — Personal details form for the signup flow.
 * Includes name, phone, role selection, instrument picker, and notes.
 */
export default function MusicianSignupForm({ formData, onChange }: Props) {
  const [instrumentsOpen, setInstrumentsOpen] = useState(false);

  /** Update a single field */
  const updateField = <K extends keyof SignupFormData>(key: K, value: SignupFormData[K]) => {
    onChange({ ...formData, [key]: value });
  };

  /** Toggle an instrument */
  const toggleInstrument = (inst: InstrumentType) => {
    const current = formData.instruments;
    if (current.includes(inst)) {
      updateField('instruments', current.filter(i => i !== inst));
    } else {
      updateField('instruments', [...current, inst]);
    }
  };

  return (
    <div className="signup-form-section">
      <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <User size={20} color="#38bdf8" />
        הפרטים שלך
      </h3>

      {/* Role Selector */}
      <div className="signup-role-selector">
        <button
          onClick={() => updateField('role', 'musician')}
          className={`signup-role-btn ${formData.role === 'musician' ? 'active musician' : ''}`}
        >
          🎸 נגן / זמר
        </button>
        <button
          onClick={() => updateField('role', 'audience')}
          className={`signup-role-btn ${formData.role === 'audience' ? 'active audience' : ''}`}
        >
          🎵 קהל / מאזין
        </button>
      </div>

      {/* Name */}
      <div className="signup-field">
        <div className="signup-field-icon"><User size={16} /></div>
        <input
          placeholder="השם המלא שלך *"
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          className="signup-input"
          autoComplete="name"
        />
      </div>

      {/* Phone */}
      <div className="signup-field">
        <div className="signup-field-icon"><Phone size={16} /></div>
        <input
          placeholder="טלפון (אופציונלי)"
          value={formData.phone}
          onChange={e => updateField('phone', e.target.value)}
          className="signup-input"
          type="tel"
          autoComplete="tel"
          dir="ltr"
          style={{ textAlign: 'right' }}
        />
      </div>

      {/* Instruments (only for musicians) */}
      {formData.role === 'musician' && (
        <div className="signup-instruments-section">
          <button
            onClick={() => setInstrumentsOpen(!instrumentsOpen)}
            className="signup-instruments-toggle"
          >
            🎵 כלי נגינה {formData.instruments.length > 0 && `(${formData.instruments.length})`}
            <span className={`signup-chevron ${instrumentsOpen ? 'open' : ''}`}>▾</span>
          </button>

          {instrumentsOpen && (
            <div className="signup-instruments-grid">
              {(Object.entries(INSTRUMENT_LABELS) as [InstrumentType, string][]).map(([key, label]) => {
                const isSelected = formData.instruments.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleInstrument(key)}
                    className={`signup-instrument-chip ${isSelected ? 'selected' : ''}`}
                  >
                    {INSTRUMENT_EMOJIS[key]} {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="signup-field" style={{ alignItems: 'flex-start' }}>
        <div className="signup-field-icon" style={{ marginTop: 10 }}><MessageSquare size={16} /></div>
        <textarea
          placeholder="הערות, בקשות מיוחדות, או סתם מה שבא לך לכתוב..."
          value={formData.notes}
          onChange={e => updateField('notes', e.target.value)}
          className="signup-input signup-textarea"
          rows={3}
        />
      </div>
    </div>
  );
}

// #endregion
