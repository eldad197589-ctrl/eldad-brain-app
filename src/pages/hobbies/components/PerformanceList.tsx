/* ============================================
   FILE: PerformanceList.tsx
   PURPOSE: PerformanceList component
   DEPENDENCIES: react, lucide-react
   EXPORTS: PerformanceList (default)
   ============================================ */
/**
 * FILE: PerformanceList.tsx
 * PURPOSE: Manage upcoming and past performances/events
 * DEPENDENCIES: react, lucide-react, ../types, ../constants
 */

// #region Imports
import { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, Calendar, MapPin, CheckCircle, X, Clock, XCircle } from 'lucide-react';
import type { Performance, PerformanceType, PerformanceStatus } from '../types';
import { PERFORMANCE_TYPE_LABELS } from '../constants';
// #endregion

// #region Types
/** Props for the PerformanceList component */
interface Props {
  /** List of performances */
  performances: Performance[];
  /** Callback to add a performance */
  onAdd: (perf: Omit<Performance, 'id'>) => void;
  /** Callback to update a performance */
  onUpdate: (id: string, updates: Partial<Performance>) => void;
  /** Callback to delete a performance */
  onDelete: (id: string) => void;
}
// #endregion

// #region Status Config

const STATUS_CONFIG: Record<PerformanceStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  planned: { label: 'מתוכנן', color: '#38bdf8', icon: Clock },
  done: { label: 'בוצע', color: '#4ade80', icon: CheckCircle },
  cancelled: { label: 'בוטל', color: '#f87171', icon: XCircle },
};

// #endregion

// #region Add Form

/** Form to add a new performance */
function AddPerformanceForm({ onAdd, onCancel }: { onAdd: (perf: Omit<Performance, 'id'>) => void; onCancel: () => void }) {
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [type, setType] = useState<PerformanceType>('event');

  const handleSubmit = () => {
    if (!date || !venue.trim()) return;
    onAdd({
      date,
      venue: venue.trim(),
      type,
      songIds: [],
      status: 'planned',
    });
    onCancel();
  };

  return (
    <div className="hobbies-add-form glass-card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>🎭 הופעה חדשה</h4>
        <button onClick={onCancel} className="hobbies-icon-btn"><X size={16} /></button>
      </div>
      <div className="hobbies-form-grid">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="hobbies-input" />
        <input placeholder="מקום ההופעה" value={venue} onChange={e => setVenue(e.target.value)} className="hobbies-input" />
        <select value={type} onChange={e => setType(e.target.value as PerformanceType)} className="hobbies-input">
          {Object.entries(PERFORMANCE_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <button onClick={handleSubmit} className="hobbies-btn-primary" style={{ marginTop: 12 }}>
        <Plus size={16} /> הוסף הופעה
      </button>
    </div>
  );
}

// #endregion

// #region Component

/**
 * PerformanceList — Manages upcoming and past performances.
 *
 * @example
 * <PerformanceList performances={perfs} onAdd={add} onUpdate={update} onDelete={del} />
 */
export default function PerformanceList({ performances, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = useCallback((perf: Omit<Performance, 'id'>) => {
    onAdd(perf);
    setShowForm(false);
  }, [onAdd]);

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sorted = [...performances].sort((a, b) => a.date.localeCompare(b.date));
    return {
      upcoming: sorted.filter(p => p.date >= today && p.status === 'planned'),
      past: sorted.filter(p => p.date < today || p.status !== 'planned').reverse(),
    };
  }, [performances]);

  /** Format date in Hebrew */
  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} color="#a78bfa" /> הופעות ({performances.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="hobbies-btn-secondary">
          <Plus size={16} /> הופעה חדשה
        </button>
      </div>

      {showForm && <AddPerformanceForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            🗓️ הופעות קרובות
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {upcoming.map(perf => (
              <PerformanceCard
                key={perf.id}
                performance={perf}
                formatDate={formatDate}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            📋 היסטוריה
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {past.map(perf => (
              <PerformanceCard
                key={perf.id}
                performance={perf}
                formatDate={formatDate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                compact
              />
            ))}
          </div>
        </>
      )}

      {performances.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          🎭 אין הופעות — הוסף את ההופעה הראשונה!
        </div>
      )}
    </div>
  );
}

// #endregion

// #region Performance Card

/** Props for PerformanceCard */
interface CardProps {
  /** The performance data */
  performance: Performance;
  /** Date formatter */
  formatDate: (d: string) => string;
  /** Update callback */
  onUpdate: (id: string, updates: Partial<Performance>) => void;
  /** Delete callback */
  onDelete: (id: string) => void;
  /** Compact mode for past performances */
  compact?: boolean;
}

/** Single performance card */
function PerformanceCard({ performance, formatDate, onUpdate, onDelete, compact }: CardProps) {
  const statusInfo = STATUS_CONFIG[performance.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`hobbies-perf-card ${compact ? 'compact' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div className="hobbies-perf-date-badge">
          <Calendar size={14} />
          <span>{formatDate(performance.date)}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={14} color="#94a3b8" />
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{performance.venue}</span>
          </div>
          <span className="hobbies-tag" style={{ marginTop: 4, display: 'inline-block' }}>
            {PERFORMANCE_TYPE_LABELS[performance.type]}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: statusInfo.color }}>
          <StatusIcon size={14} /> {statusInfo.label}
        </span>
        {performance.status === 'planned' && (
          <button
            onClick={() => onUpdate(performance.id, { status: 'done' })}
            className="hobbies-icon-btn"
            title="סמן כבוצע"
            style={{ color: '#4ade80' }}
          >
            <CheckCircle size={16} />
          </button>
        )}
        <button onClick={() => onDelete(performance.id)} className="hobbies-icon-btn hobbies-icon-btn-danger" title="מחק">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// #endregion
