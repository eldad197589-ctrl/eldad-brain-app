/* ============================================
   FILE: TaskCard.tsx
   PURPOSE: TaskCard component
   DEPENDENCIES: lucide-react
   EXPORTS: TaskCard (default)
   ============================================ */
import { CheckCircle, Trash2 } from 'lucide-react';
import type { Task } from '../types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../../data/calendarTypes';

interface Props {
  task: Task;
  todayStr?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onExpand?: (task: Task) => void;
  /** Compact mode used in AllTasksOverview */
  compact?: boolean;
}

export default function TaskCard({ task: t, todayStr, onToggle, onDelete, onExpand, compact }: Props) {
  const pr = PRIORITY_CONFIG[t.priority];
  const st = STATUS_CONFIG[t.status];
  const isDone = t.status === 'done';
  const overdue = todayStr && t.dueDate < todayStr && !isDone;

  if (compact) {
    return (
      <div className="agenda-item" style={{
        padding: '8px 10px',
        marginBottom: 4,
        opacity: isDone ? 0.5 : 1,
      }}>
        <button
          className={`task-checkbox ${isDone ? 'done' : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(t.id); }}
          style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 1.5 }}
        >
          {isDone && <CheckCircle size={10} color="#34d399" />}
        </button>
        <div style={{ flex: 1, cursor: 'pointer' }}
          onClick={() => onExpand?.(t)}
        >
          <div style={{
            fontSize: '0.82rem', fontWeight: 600,
            textDecoration: isDone ? 'line-through' : 'none',
          }}>{t.title}</div>
          <div style={{ fontSize: '0.68rem', color: overdue ? '#ef4444' : '#64748b' }}>
            {overdue ? '⚠️ באיחור · ' : ''}{t.dueDate}
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: pr.color, flexShrink: 0 }} />
        <button className="delete-btn" onClick={() => onDelete(t.id)} title="מחק משימה">
          <Trash2 size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="agenda-item">
      <button
        className={`task-checkbox ${isDone ? 'done' : ''}`}
        onClick={() => onToggle(t.id)}
      >
        {isDone && <CheckCircle size={12} color="#34d399" />}
      </button>
      <div className="agenda-content" style={{ flex: 1 }}>
        <h4 style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.5 : 1 }}>
          {t.title}
        </h4>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <span className="agenda-badge" style={{ background: pr.bg, color: pr.color }}>
            {pr.label}
          </span>
          <span className="agenda-badge" style={{ background: `${st.color}15`, color: st.color }}>
            {st.label}
          </span>
          {t.category && (
            <span className="agenda-badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
              {t.category}
            </span>
          )}
        </div>
        {t.notes && (
          <p style={{ marginTop: 6 }}>{t.notes}</p>
        )}
      </div>
      <button className="delete-btn" onClick={() => onDelete(t.id)} title="מחק">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
