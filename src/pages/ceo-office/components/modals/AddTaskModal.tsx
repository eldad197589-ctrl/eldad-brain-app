/* ============================================
   FILE: AddTaskModal.tsx
   PURPOSE: AddTaskModal component
   DEPENDENCIES: react, lucide-react
   EXPORTS: AddTaskModal (default)
   ============================================ */
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Task } from '../../types';

interface Props {
  onClose: () => void;
  onAdd: (t: Omit<Task, 'id'>) => void;
  defaultDate: string;
}

export default function AddTaskModal({ onClose, onAdd, defaultDate }: Props) {
  const [form, setForm] = useState({
    title: '',
    dueDate: defaultDate,
    priority: 'medium' as Task['priority'],
    category: '',
    notes: '',
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onAdd({
      title: form.title.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      status: 'todo',
      category: form.category.trim() || 'כללי',
      notes: form.notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">
          <CheckCircle size={22} style={{ color: '#10b981' }} />
          הוספת משימה חדשה
        </h2>

        <div className="form-group">
          <label className="form-label">כותרת המשימה</label>
          <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="למשל: שליחת הצעת מחיר" autoFocus />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">תאריך יעד</label>
            <input className="form-input" type="date" value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">עדיפות</label>
            <select className="form-input" value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}>
              <option value="high">🔴 גבוהה</option>
              <option value="medium">🟡 בינונית</option>
              <option value="low">🟢 נמוכה</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">קטגוריה</label>
          <input className="form-input" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="למשל: פלאפון, משפטי, טכנולוגי" />
        </div>

        <div className="form-group">
          <label className="form-label">הערות (אופציונלי)</label>
          <textarea className="form-input" rows={2} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="פרטים נוספים..." style={{ resize: 'vertical' }} />
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSubmit}>➕ הוסף משימה</button>
          <button className="btn-secondary" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
