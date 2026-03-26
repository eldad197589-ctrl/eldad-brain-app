/* ============================================
   FILE: TaskFilterBar.tsx
   PURPOSE: TaskFilterBar component
   DEPENDENCIES: lucide-react
   EXPORTS: TaskFilterBar (default)
   ============================================ */
/**
 * TaskFilterBar — Filtering controls for the tasks overview.
 * Supports category, priority, status pills + live search.
 */
import { Search } from 'lucide-react';

// #region Types

interface Props {
  categories: string[];
  activeCategory: string | null;
  activePriority: string | null;
  activeStatus: string | null;
  searchQuery: string;
  onCategoryChange: (cat: string | null) => void;
  onPriorityChange: (pri: string | null) => void;
  onStatusChange: (st: string | null) => void;
  onSearchChange: (q: string) => void;
}

// #endregion

const PRIORITY_PILLS = [
  { value: 'high', label: '🔴 גבוהה', color: '#ef4444' },
  { value: 'medium', label: '🟡 בינונית', color: '#f59e0b' },
  { value: 'low', label: '🟢 נמוכה', color: '#10b981' },
];

const STATUS_PILLS = [
  { value: 'not-done', label: '📂 פתוחות', color: '#c9a84c' },
  { value: 'todo', label: 'לביצוע', color: '#94a3b8' },
  { value: 'in-progress', label: 'בעבודה', color: '#3b82f6' },
  { value: 'done', label: 'הושלם', color: '#10b981' },
];

/** TaskFilterBar component — TaskFilterBar component */
export default function TaskFilterBar({
  categories, activeCategory, activePriority, activeStatus,
  searchQuery, onCategoryChange, onPriorityChange, onStatusChange, onSearchChange,
}: Props) {
  return (
    <div style={{ marginBottom: 14 }}>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 10, padding: '8px 12px',
      }}>
        <Search size={14} color="#64748b" />
        <input
          type="text"
          placeholder="חיפוש משימות..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#e2e8f0', fontSize: '0.82rem', width: '100%', fontFamily: 'inherit',
          }}
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} style={{
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem',
          }}>✕</button>
        )}
      </div>

      {/* Filter Pills Row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
        {/* Priority pills */}
        {PRIORITY_PILLS.map(p => (
          <button key={p.value} onClick={() => onPriorityChange(activePriority === p.value ? null : p.value)}
            style={{
              padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600,
              border: `1px solid ${activePriority === p.value ? p.color : 'rgba(148,163,184,0.15)'}`,
              background: activePriority === p.value ? `${p.color}20` : 'transparent',
              color: activePriority === p.value ? p.color : '#94a3b8',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {p.label}
          </button>
        ))}
        <span style={{ borderLeft: '1px solid rgba(148,163,184,0.15)', margin: '0 2px' }} />
        {/* Status pills */}
        {STATUS_PILLS.map(s => (
          <button key={s.value} onClick={() => onStatusChange(activeStatus === s.value ? null : s.value)}
            style={{
              padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600,
              border: `1px solid ${activeStatus === s.value ? s.color : 'rgba(148,163,184,0.15)'}`,
              background: activeStatus === s.value ? `${s.color}20` : 'transparent',
              color: activeStatus === s.value ? s.color : '#94a3b8',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => onCategoryChange(null)}
            style={{
              padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600,
              border: `1px solid ${!activeCategory ? '#c9a84c' : 'rgba(148,163,184,0.15)'}`,
              background: !activeCategory ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: !activeCategory ? '#c9a84c' : '#94a3b8',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            הכל
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
              style={{
                padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600,
                border: `1px solid ${activeCategory === cat ? '#7C3AED' : 'rgba(148,163,184,0.15)'}`,
                background: activeCategory === cat ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: activeCategory === cat ? '#a78bfa' : '#94a3b8',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              📁 {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
