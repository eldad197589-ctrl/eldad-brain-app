/* ============================================
   FILE: QuickAddTask.tsx
   PURPOSE: QuickAddTask component
   DEPENDENCIES: react, lucide-react
   EXPORTS: QuickAddTask (default)
   ============================================ */
// #region Imports

import { useState, useEffect, useRef } from 'react';
import { Zap, Plus } from 'lucide-react';
import type { Task } from '../types';
import { detectCategory } from '../constants';


// #endregion

// #region Types

interface Props {
  onAdd: (t: Omit<Task, 'id'>) => void;
  defaultDate: string;
}


// #endregion

// #region Component

/** QuickAddTask component — QuickAddTask component */
export default function QuickAddTask({ onAdd, defaultDate }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState(defaultDate);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDueDate(defaultDate); }, [defaultDate]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      dueDate,
      priority,
      status: 'todo',
      category: detectCategory(title),
    });
    setTitle('');
    setPriority('medium');
    inputRef.current?.focus();
  };

  return (
    <div className="quick-add-bar">
      <Zap size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
      <input
        ref={inputRef}
        className="quick-add-input"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="⚡ הוסף משימה מהירה... (Enter לשמירה)"
      />
      <select
        className="quick-add-select"
        value={priority}
        onChange={e => setPriority(e.target.value as Task['priority'])}
      >
        <option value="high">🔴 גבוהה</option>
        <option value="medium">🟡 בינונית</option>
        <option value="low">🟢 נמוכה</option>
      </select>
      <input
        className="quick-add-date"
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
      />
      <button className="quick-add-submit" onClick={submit} title="הוסף">
        <Plus size={16} />
      </button>
    </div>
  );
}

// #endregion
