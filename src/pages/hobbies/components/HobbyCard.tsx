/**
 * FILE: HobbyCard.tsx
 * PURPOSE: Display individual hobby cards with CRUD actions
 * DEPENDENCIES: react, lucide-react, ../types, ../constants
 */

// #region Imports
import { useState } from 'react';
import { Plus, Trash2, Edit3, X, Check } from 'lucide-react';
import type { Hobby, HobbyFrequency } from '../types';
import { FREQUENCY_LABELS, FREQUENCY_COLORS } from '../constants';
// #endregion

// #region Types
/** Props for the HobbyCard component */
interface Props {
  /** List of hobbies */
  hobbies: Hobby[];
  /** Callback to add a hobby */
  onAdd: (hobby: Omit<Hobby, 'id'>) => void;
  /** Callback to update a hobby */
  onUpdate: (id: string, updates: Partial<Hobby>) => void;
  /** Callback to delete a hobby */
  onDelete: (id: string) => void;
}
// #endregion

// #region Emoji Picker Options
const HOBBY_EMOJIS = ['🎤', '🎸', '🎹', '🏃', '🏋️', '📚', '🎨', '🧘', '🚴', '⚽', '🎮', '🎯', '🧑‍🍳', '🌱', '📷', '✈️'];
// #endregion

// #region Add Hobby Form

/** Form for adding a new hobby */
function AddHobbyForm({ onAdd, onCancel }: { onAdd: (h: Omit<Hobby, 'id'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HobbyFrequency>('weekly');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), emoji, description: description.trim(), frequency });
    onCancel();
  };

  return (
    <div className="hobbies-add-form glass-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>🎯 תחביב חדש</h4>
        <button onClick={onCancel} className="hobbies-icon-btn"><X size={16} /></button>
      </div>
      {/* Emoji selector */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {HOBBY_EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`hobbies-emoji-btn ${emoji === e ? 'active' : ''}`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="hobbies-form-grid">
        <input placeholder="שם התחביב" value={name} onChange={e => setName(e.target.value)} className="hobbies-input" />
        <select value={frequency} onChange={e => setFrequency(e.target.value as HobbyFrequency)} className="hobbies-input">
          {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input placeholder="תיאור קצר (אופציונלי)" value={description} onChange={e => setDescription(e.target.value)} className="hobbies-input" style={{ gridColumn: '1 / -1' }} />
      </div>
      <button onClick={handleSubmit} className="hobbies-btn-primary" style={{ marginTop: 12 }}>
        <Plus size={16} /> הוסף תחביב
      </button>
    </div>
  );
}

// #endregion

// #region Single Card

/** Single hobby display card */
function SingleHobbyCard({ hobby, onUpdate, onDelete }: { hobby: Hobby; onUpdate: (id: string, u: Partial<Hobby>) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(hobby.name);
  const [editDesc, setEditDesc] = useState(hobby.description);

  const handleSave = () => {
    onUpdate(hobby.id, { name: editName.trim(), description: editDesc.trim() });
    setEditing(false);
  };

  return (
    <div className="hobbies-hobby-card glass-card">
      <div style={{ fontSize: '2rem', marginBottom: 8, textAlign: 'center' }}>{hobby.emoji}</div>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={editName} onChange={e => setEditName(e.target.value)} className="hobbies-input" style={{ fontSize: '0.85rem' }} />
          <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="hobbies-input" style={{ fontSize: '0.8rem' }} />
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button onClick={handleSave} className="hobbies-icon-btn" style={{ color: '#4ade80' }}><Check size={16} /></button>
            <button onClick={() => setEditing(false)} className="hobbies-icon-btn"><X size={16} /></button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', textAlign: 'center', marginBottom: 4 }}>{hobby.name}</div>
          {hobby.description && (
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginBottom: 8 }}>{hobby.description}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <span
              className="hobbies-tag"
              style={{
                background: `${FREQUENCY_COLORS[hobby.frequency]}18`,
                color: FREQUENCY_COLORS[hobby.frequency],
                borderColor: `${FREQUENCY_COLORS[hobby.frequency]}40`,
              }}
            >
              {FREQUENCY_LABELS[hobby.frequency]}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button onClick={() => { setEditName(hobby.name); setEditDesc(hobby.description); setEditing(true); }} className="hobbies-icon-btn" title="ערוך">
              <Edit3 size={14} />
            </button>
            <button onClick={() => onDelete(hobby.id)} className="hobbies-icon-btn hobbies-icon-btn-danger" title="מחק">
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// #endregion

// #region Component

/**
 * HobbyCard — Grid of hobby cards with add/edit/delete.
 *
 * @example
 * <HobbyCard hobbies={hobbies} onAdd={add} onUpdate={update} onDelete={del} />
 */
export default function HobbyCard({ hobbies, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          🎯 תחביבים ({hobbies.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="hobbies-btn-secondary">
          <Plus size={16} /> תחביב חדש
        </button>
      </div>

      {showForm && <AddHobbyForm onAdd={(h) => { onAdd(h); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

      <div className="hobbies-hobby-grid">
        {hobbies.map(hobby => (
          <SingleHobbyCard key={hobby.id} hobby={hobby} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
        {hobbies.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b', gridColumn: '1 / -1' }}>
            🎯 אין תחביבים — הוסף את הראשון!
          </div>
        )}
      </div>
    </div>
  );
}

// #endregion
