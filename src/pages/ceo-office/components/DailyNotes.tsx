/**
 * DailyNotes — Quick notes pad for the selected day.
 * Auto-saves to localStorage via the useDailyNotes hook.
 */
import { FileText } from 'lucide-react';

interface Props {
  selectedDate: string;
  selectedDateLabel: string;
  note: string;
  onNoteChange: (date: string, text: string) => void;
}

export default function DailyNotes({ selectedDate, selectedDateLabel, note, onNoteChange }: Props) {
  return (
    <div className="glass-card" style={{ padding: '16px 18px' }}>
      <h3 style={{
        margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <FileText size={16} color="#c9a84c" />
        📝 פתק יומי
        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>
          {selectedDateLabel}
        </span>
      </h3>
      <textarea
        value={note}
        onChange={e => onNoteChange(selectedDate, e.target.value)}
        placeholder="רשום הערות, תזכורות, או מחשבות ליום הזה..."
        style={{
          width: '100%', minHeight: 80, maxHeight: 160,
          background: 'rgba(15,23,42,0.5)',
          border: '1px solid rgba(148,163,184,0.15)',
          borderRadius: 10, padding: '10px 14px',
          color: '#e2e8f0', fontSize: '0.82rem',
          fontFamily: 'inherit', lineHeight: 1.6,
          resize: 'vertical', outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
      />
      {note && (
        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4, textAlign: 'left' }}>
          💾 נשמר אוטומטית · {note.length} תווים
        </div>
      )}
    </div>
  );
}
