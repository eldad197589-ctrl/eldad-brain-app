/* ============================================
   FILE: DynamicWorkspaceParts.tsx
   PURPOSE: Sub-components for DynamicWorkspace — TaskRow and MeetingNotesArea
   DEPENDENCIES: react, lucide-react, brainStore, calendarTypes
   EXPORTS: TaskRow, MeetingNotesArea
   ============================================ */

// #region Imports
import { useState, useCallback } from 'react';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  ExternalLink, StickyNote,
} from 'lucide-react';
import type { Task } from '../../../../data/calendarTypes';
import { useBrainStore } from '../../../../store/brainStore';
// #endregion

// #region TaskRow

/**
 * A single task row with toggleable sub-tasks.
 *
 * @param task — The task to render
 * @param onToggle — Toggle task done/undone
 * @param onToggleSub — Toggle a sub-task
 * @param onNavigate — Navigate to task action link
 */
export function TaskRow({ task, onToggle, onToggleSub, onNavigate }: {
  task: Task;
  onToggle: (id: string) => void;
  onToggleSub: (taskId: string, subIdx: number) => void;
  onNavigate?: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSubs = task.subTasks && task.subTasks.length > 0;
  const doneSubs = task.subTasks?.filter(s => s.done).length || 0;
  const totalSubs = task.subTasks?.length || 0;
  const isDone = task.status === 'done';
  const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981';

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${isDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
      background: isDone ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
      transition: 'all 0.2s',
    }}>
      {/* Main row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', cursor: 'pointer',
        }}
        onClick={() => hasSubs ? setExpanded(!expanded) : onToggle(task.id)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
          {isDone
            ? <CheckCircle2 size={18} color="#10b981" />
            : <Circle size={18} color={priorityColor} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.85rem', fontWeight: 600,
            color: isDone ? '#64748b' : '#e2e8f0',
            textDecoration: isDone ? 'line-through' : 'none',
          }}>
            {task.title}
          </div>
          {task.assignee && (
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
              👤 {task.assignee}
              {task.dueDate && <> • עד {task.dueDate}</>}
            </div>
          )}
        </div>
        {/* Priority badge */}
        <span style={{
          padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
          background: `${priorityColor}15`, color: priorityColor,
          flexShrink: 0,
        }}>
          {task.priority === 'high' ? 'דחוף' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
        </span>
        {/* Sub-task counter + action link */}
        {hasSubs && (
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', flexShrink: 0 }}>
            {doneSubs}/{totalSubs}
          </span>
        )}
        {task.actionLink && onNavigate && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(task.actionLink!); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              color: '#60a5fa', flexShrink: 0,
            }}
            title="פתח דף קשור"
          >
            <ExternalLink size={14} />
          </button>
        )}
        {hasSubs && (expanded ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />)}
      </div>

      {/* Sub-tasks */}
      {expanded && task.subTasks && (
        <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Progress bar */}
          <div style={{
            height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)',
            marginBottom: 6, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: totalSubs > 0 ? `${(doneSubs / totalSubs) * 100}%` : '0%',
              background: doneSubs === totalSubs && totalSubs > 0
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : `linear-gradient(90deg, ${priorityColor}, ${priorityColor}cc)`,
              transition: 'width 0.3s',
            }} />
          </div>
          {task.subTasks.map((sub, i) => (
            <div
              key={i}
              onClick={() => onToggleSub(task.id, i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                background: sub.done ? 'rgba(16,185,129,0.04)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {sub.done
                ? <CheckCircle2 size={14} color="#10b981" />
                : <Circle size={14} color="#475569" />}
              <span style={{
                fontSize: '0.8rem',
                color: sub.done ? '#64748b' : '#cbd5e1',
                textDecoration: sub.done ? 'line-through' : 'none',
              }}>
                {sub.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// #endregion

// #region MeetingNotesArea

/**
 * Free-text notes area for the meeting.
 *
 * @param meetingId — Meeting ID for persistence
 * @param initialNotes — Existing notes
 */
export function MeetingNotesArea({ meetingId, initialNotes }: {
  meetingId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);
  const updateMeeting = useBrainStore(s => s.updateMeeting);

  const handleSave = useCallback(() => {
    updateMeeting(meetingId, { meetingNotes: notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [meetingId, notes, updateMeeting]);

  return (
    <div style={{
      borderRadius: 12, padding: '14px 16px',
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0',
        }}>
          <StickyNote size={16} color="#f59e0b" />
          הערות לפגישה
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: '4px 12px', borderRadius: 6,
            background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.1)',
            color: saved ? '#34d399' : '#a78bfa',
            border: `1px solid ${saved ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.25)'}`,
            fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
          }}
        >
          {saved ? '✓ נשמר' : 'שמור'}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="רשום כאן הערות, נקודות לדיון, תובנות..."
        dir="rtl"
        style={{
          width: '100%', minHeight: 100, borderRadius: 8,
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.7,
          padding: '12px 14px', resize: 'vertical',
          fontFamily: 'Heebo, sans-serif',
          outline: 'none',
        }}
      />
    </div>
  );
}

// #endregion
