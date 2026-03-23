/* ============================================
   FILE: MusicianList.tsx
   PURPOSE: MusicianList component
   DEPENDENCIES: react, lucide-react
   EXPORTS: MusicianList (default)
   ============================================ */
/**
 * FILE: MusicianList.tsx
 * PURPOSE: Manage musicians — names, phones, instruments
 * DEPENDENCIES: react, lucide-react, ../types, ../constants
 */

// #region Imports
import { useState } from 'react';
import { Plus, Trash2, X, Phone, Users } from 'lucide-react';
import type { Musician, InstrumentType } from '../types';
import { INSTRUMENT_LABELS, INSTRUMENT_EMOJIS } from '../constants';
// #endregion

// #region Types
/** Props for MusicianList */
interface Props {
  /** List of musicians */
  musicians: Musician[];
  /** Add a musician */
  onAdd: (m: Omit<Musician, 'id'>) => void;
  /** Delete a musician */
  onDelete: (id: string) => void;
}
// #endregion

// #region Add Form

/** Form for adding a new musician */
function AddMusicianForm({ onAdd, onCancel }: { onAdd: (m: Omit<Musician, 'id'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [instruments, setInstruments] = useState<InstrumentType[]>([]);
  const [notes, setNotes] = useState('');

  const toggleInstrument = (inst: InstrumentType) => {
    setInstruments(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const handleSubmit = () => {
    if (!name.trim() || instruments.length === 0) return;
    onAdd({ name: name.trim(), phone: phone.trim() || undefined, instruments, notes: notes.trim() || undefined });
    onCancel();
  };

  return (
    <div className="hobbies-add-form glass-card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>🎸 נגן חדש</h4>
        <button onClick={onCancel} className="hobbies-icon-btn"><X size={16} /></button>
      </div>
      <div className="hobbies-form-grid">
        <input placeholder="שם הנגן *" value={name} onChange={e => setName(e.target.value)} className="hobbies-input" />
        <input placeholder="טלפון" value={phone} onChange={e => setPhone(e.target.value)} className="hobbies-input" dir="ltr" style={{ textAlign: 'right' }} />
      </div>
      {/* Instruments multi-select */}
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6 }}>כלי נגינה *</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(Object.entries(INSTRUMENT_LABELS) as [InstrumentType, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleInstrument(key)}
              className={`hobbies-chip ${instruments.includes(key) ? 'active' : ''}`}
              style={instruments.includes(key) ? { borderColor: '#a78bfa', background: 'rgba(167,139,250,0.15)', color: '#c4b5fd' } : undefined}
            >
              {INSTRUMENT_EMOJIS[key]} {label}
            </button>
          ))}
        </div>
      </div>
      <input placeholder="הערות (אופציונלי)" value={notes} onChange={e => setNotes(e.target.value)} className="hobbies-input" style={{ width: '100%', marginBottom: 12 }} />
      <button onClick={handleSubmit} className="hobbies-btn-primary">
        <Plus size={16} /> הוסף נגן
      </button>
    </div>
  );
}

// #endregion

// #region Component

/**
 * MusicianList — Manage musicians with instruments and contact info.
 */
export default function MusicianList({ musicians, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={20} color="#a78bfa" /> נגנים ({musicians.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="hobbies-btn-secondary">
          <Plus size={16} /> נגן חדש
        </button>
      </div>

      {showForm && <AddMusicianForm onAdd={(m) => { onAdd(m); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {musicians.map(musician => (
          <div key={musician.id} className="hobbies-musician-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <div className="hobbies-musician-avatar">
                {INSTRUMENT_EMOJIS[musician.instruments[0]] || '🎵'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{musician.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {musician.instruments.map(inst => (
                      <span key={inst} className="hobbies-tag" style={{ background: 'rgba(167,139,250,0.12)', color: '#c4b5fd', borderColor: 'rgba(167,139,250,0.25)' }}>
                        {INSTRUMENT_EMOJIS[inst]} {INSTRUMENT_LABELS[inst]}
                      </span>
                    ))}
                  </div>
                </div>
                {musician.notes && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{musician.notes}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {musician.phone && (
                <a href={`tel:${musician.phone}`} className="hobbies-icon-btn" title="התקשר" style={{ color: '#4ade80' }}>
                  <Phone size={16} />
                </a>
              )}
              <button onClick={() => onDelete(musician.id)} className="hobbies-icon-btn hobbies-icon-btn-danger" title="מחק">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {musicians.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            🎸 אין נגנים — הוסף את הנגן הראשון!
          </div>
        )}
      </div>
    </div>
  );
}

// #endregion
