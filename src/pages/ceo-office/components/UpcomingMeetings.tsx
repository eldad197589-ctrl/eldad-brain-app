import type { Meeting } from '../types';

interface Props {
  meetings: Meeting[];
  onSelectDate: (date: string) => void;
}

export default function UpcomingMeetings({ meetings, onSelectDate }: Props) {
  if (meetings.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        🗓️ פגישות קרובות (7 ימים)
      </h3>
      {meetings.slice(0, 5).map(m => {
        const d = new Date(m.date + 'T00:00:00');
        const label = d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });
        return (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onClick={() => onSelectDate(m.date)}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{label} · {m.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
