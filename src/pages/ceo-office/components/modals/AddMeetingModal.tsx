/* ============================================
   FILE: AddMeetingModal.tsx
   PURPOSE: AddMeetingModal component
   DEPENDENCIES: react, lucide-react
   EXPORTS: AddMeetingModal (default)
   ============================================ */
import { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { Meeting } from '../../types';
import { MEETING_COLORS } from '../../constants';

interface Props {
  onClose: () => void;
  onAdd: (m: Omit<Meeting, 'id'>) => void;
  defaultDate: string;
}

export default function AddMeetingModal({ onClose, onAdd, defaultDate }: Props) {
  const [form, setForm] = useState({
    title: '',
    date: defaultDate,
    time: '10:00',
    duration: 60,
    participants: '',
    topics: '',
    color: MEETING_COLORS[0],
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onAdd({
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      duration: form.duration,
      participants: form.participants.split(',').map(s => s.trim()).filter(Boolean),
      topics: form.topics.split('\n').map(s => s.trim()).filter(Boolean).map(text => ({ text })),
      color: form.color,
      completed: false,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">
          <Calendar size={22} style={{ color: '#7C3AED' }} />
          הוספת פגישה חדשה
        </h2>

        <div className="form-group">
          <label className="form-label">שם הפגישה</label>
          <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="למשל: ישיבת צוות שבועית" autoFocus />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">תאריך</label>
            <input className="form-input" type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">שעה</label>
            <input className="form-input" type="time" value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">משך (דקות)</label>
          <input className="form-input" type="number" value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))} />
        </div>

        <div className="form-group">
          <label className="form-label">משתתפים (מופרדים בפסיק)</label>
          <input className="form-input" value={form.participants}
            onChange={e => setForm(f => ({ ...f, participants: e.target.value }))}
            placeholder="אלדד, אוסנת, קיריל" />
        </div>

        <div className="form-group">
          <label className="form-label">נושאים (שורה לכל נושא)</label>
          <textarea className="form-input" rows={3} value={form.topics}
            onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
            placeholder={'נושא 1\nנושא 2'} style={{ resize: 'vertical' }} />
        </div>

        <div className="form-group">
          <label className="form-label">צבע</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {MEETING_COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                style={{
                  width: 28, height: 28, borderRadius: 8, background: c,
                  border: form.color === c ? '3px solid #fff' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }} />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSubmit}>➕ הוסף פגישה</button>
          <button className="btn-secondary" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
