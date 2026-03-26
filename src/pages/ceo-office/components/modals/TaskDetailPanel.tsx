/* ============================================
   FILE: TaskDetailPanel.tsx
   PURPOSE: TaskDetailPanel component
   DEPENDENCIES: react, lucide-react
   EXPORTS: TaskDetailPanel (default)
   ============================================ */
/**
 * TaskDetailPanel — Modal for viewing and editing task details.
 * Supports view mode (default) and edit mode.
 */
// #region Imports

import { useState } from 'react';
import { ExternalLink, ListChecks, FileText, Check, X, Edit3, Save, Plus, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../../../data/calendarTypes';


// #endregion

// #region Types

interface Props {
  task: Task;
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (path: string) => void;
  onUpdateSubTask: (taskId: string, subIdx: number) => void;
  onUpdateTask?: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
}


// #endregion

// #region Component

/** TaskDetailPanel component — TaskDetailPanel component */
export default function TaskDetailPanel({
  task, onClose, onToggle, onDelete, onNavigate, onUpdateSubTask, onUpdateTask,
}: Props) {
  const pr = PRIORITY_CONFIG[task.priority];
  const st = STATUS_CONFIG[task.status];
  const isDone = task.status === 'done';

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editCategory, setEditCategory] = useState(task.category);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [editSubTasks, setEditSubTasks] = useState(task.subTasks || []);
  const [newSubTask, setNewSubTask] = useState('');

  const handleSave = () => {
    if (!onUpdateTask) return;
    onUpdateTask(task.id, {
      title: editTitle,
      dueDate: editDueDate,
      priority: editPriority,
      category: editCategory,
      notes: editNotes || undefined,
      subTasks: editSubTasks.length > 0 ? editSubTasks : undefined,
    });
    setEditing(false);
    onClose();
  };

  const addSubTask = () => {
    if (!newSubTask.trim()) return;
    setEditSubTasks(prev => [...prev, { text: newSubTask.trim(), done: false }]);
    setNewSubTask('');
  };

  const removeSubTask = (idx: number) => {
    setEditSubTasks(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            {editing ? (
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                style={{
                  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.3)',
                  borderRadius: 8, padding: '8px 12px', color: '#e2e8f0',
                  fontSize: '1.1rem', fontWeight: 700, width: '100%', fontFamily: 'inherit', outline: 'none',
                }}
              />
            ) : (
              <h2 className="modal-title" style={{ margin: 0 }}>
                <ListChecks size={22} style={{ color: pr.color }} />
                {task.title}
              </h2>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {editing ? (
                <>
                  <select value={editPriority} onChange={e => setEditPriority(e.target.value as Task['priority'])}
                    style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: '0.78rem', fontFamily: 'inherit' }}>
                    <option value="high">🔴 גבוהה</option>
                    <option value="medium">🟡 בינונית</option>
                    <option value="low">🟢 נמוכה</option>
                  </select>
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)}
                    style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: '0.78rem', fontFamily: 'inherit' }} />
                  <input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="קטגוריה"
                    style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: '0.78rem', fontFamily: 'inherit', width: 100 }} />
                </>
              ) : (
                <>
                  <span className="badge" style={{ background: pr.bg, color: pr.color, border: `1px solid ${pr.color}30` }}>{pr.label}</span>
                  <span className="badge" style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}30` }}>{st.label}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📅 {task.dueDate}</span>
                  {task.category && <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📁 {task.category}</span>}
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {onUpdateTask && (
              <button onClick={() => editing ? handleSave() : setEditing(true)}
                style={{ background: 'none', border: 'none', color: editing ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>
                {editing ? <Save size={18} /> : <Edit3 size={18} />}
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notes */}
        {editing ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} /> הערות
            </div>
            <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
              placeholder="הוסף הערות..."
              style={{
                width: '100%', minHeight: 60, background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10,
                padding: '10px 14px', color: '#e2e8f0', fontSize: '0.82rem',
                fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none',
              }}
            />
          </div>
        ) : task.notes ? (
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 16,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} /> הערות
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>{task.notes}</p>
          </div>
        ) : null}

        {/* Sub Tasks */}
        {(editing ? editSubTasks.length > 0 || true : task.subTasks && task.subTasks.length > 0) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ListChecks size={13} /> תת-משימות
              {!editing && task.subTasks && ` (${task.subTasks.filter(s => s.done).length}/${task.subTasks.length})`}
            </div>
            {!editing && task.subTasks && task.subTasks.length > 0 && (
              <div style={{ height: 4, background: '#334155', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  height: '100%',
                  width: `${(task.subTasks.filter(s => s.done).length / task.subTasks.length) * 100}%`,
                  background: 'linear-gradient(to left, #34d399, #10b981)',
                  borderRadius: 10, transition: 'width 0.3s',
                }} />
              </div>
            )}

            {editing ? (
              <>
                {editSubTasks.map((sub, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.82rem', color: sub.done ? '#64748b' : '#e2e8f0', flex: 1, textDecoration: sub.done ? 'line-through' : 'none' }}>{sub.text}</span>
                    <button onClick={() => removeSubTask(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <input value={newSubTask} onChange={e => setNewSubTask(e.target.value)}
                    placeholder="תת-משימה חדשה..."
                    onKeyDown={e => e.key === 'Enter' && addSubTask()}
                    style={{
                      flex: 1, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.15)',
                      borderRadius: 6, padding: '6px 10px', color: '#e2e8f0', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                  <button onClick={addSubTask} style={{
                    background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                    borderRadius: 6, padding: '6px 10px', color: '#34d399', cursor: 'pointer', fontSize: '0.78rem',
                  }}>
                    <Plus size={14} />
                  </button>
                </div>
              </>
            ) : task.subTasks?.map((sub, idx) => (
              <div key={idx} onClick={() => onUpdateSubTask(task.id, idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                  marginBottom: 2, transition: 'background 0.15s',
                  opacity: sub.done ? 0.5 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: sub.done ? '2px solid #34d399' : '2px solid rgba(148,163,184,0.3)',
                  background: sub.done ? 'rgba(52,211,153,0.2)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {sub.done && <Check size={10} color="#34d399" />}
                </div>
                <span style={{
                  fontSize: '0.85rem', textDecoration: sub.done ? 'line-through' : 'none',
                  color: sub.done ? '#64748b' : '#e2e8f0',
                }}>{sub.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions" style={{ flexDirection: 'column', gap: 8 }}>
          {editing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleSave}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', flex: 1 }}>
                <Save size={16} /> שמור שינויים
              </button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>ביטול</button>
            </div>
          ) : (
            <>
              {task.actionLink && (
                <button className="btn-primary" onClick={() => onNavigate(task.actionLink!)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #7C3AED, #6d28d9)' }}>
                  <ExternalLink size={16} /> פתח עמוד עבודה
                </button>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={isDone ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => { onToggle(task.id); onClose(); }}
                  style={isDone ? {} : { background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {isDone ? '↩️ החזר לביצוע' : '✅ סמן כהושלם'}
                </button>
                <button className="btn-secondary"
                  onClick={() => { onDelete(task.id); onClose(); }}
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', flex: 'none', padding: '12px 16px' }}>
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// #endregion
