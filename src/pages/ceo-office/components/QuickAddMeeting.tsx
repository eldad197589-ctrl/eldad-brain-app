/* ============================================
   FILE: QuickAddMeeting.tsx
   PURPOSE: QuickAddMeeting component
   DEPENDENCIES: react, lucide-react
   EXPORTS: QuickAddMeeting (default)
   ============================================ */
import { useState, useRef } from 'react';
import { Calendar, Plus } from 'lucide-react';
import type { Meeting } from '../types';

const COLORS = ['#f59e0b', '#7C3AED', '#3b82f6', '#10b981', '#ef4444', '#06b6d4'];

interface Props {
  onAdd: (m: Omit<Meeting, 'id'>) => void;
  defaultDate: string;
}

export default function QuickAddMeeting({ onAdd, defaultDate }: Props) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00');
  const [color, setColor] = useState(COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      date: defaultDate,
      time,
      duration: 60,
      participants: [],
      topics: [],
      color,
      completed: false,
    });
    setTitle('');
    inputRef.current?.focus();
  };

  return (
    <div className="quick-add-bar">
      <Calendar size={14} style={{ color: '#7C3AED', flexShrink: 0 }} />
      <input
        ref={inputRef}
        className="quick-add-input"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="⚡ הוסף פגישה מהירה... (Enter לשמירה)"
      />
      <input
        className="quick-add-date"
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
        style={{ maxWidth: 90 }}
      />
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)}
            style={{
              width: 18, height: 18, borderRadius: 5, background: c,
              border: color === c ? '2px solid #fff' : '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.1s',
            }} />
        ))}
      </div>
      <button className="quick-add-submit" onClick={submit} title="הוסף">
        <Plus size={16} />
      </button>
    </div>
  );
}
