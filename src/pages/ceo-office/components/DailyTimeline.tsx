/* ============================================
   FILE: DailyTimeline.tsx
   PURPOSE: DailyTimeline component
   DEPENDENCIES: None (local only)
   EXPORTS: DailyTimeline (default)
   ============================================ */
/**
 * DailyTimeline — Vertical timeline view showing meetings as time blocks
 * and undated tasks at the top.
 */
import type { Meeting, Task } from '../types';

interface Props {
  selectedDate: string;
  selectedDateLabel: string;
  meetings: Meeting[];
  tasks: Task[];
}

/** Hours displayed in the timeline (8AM to 8PM) */
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8..20

/** Convert HH:mm to pixel offset (60px per hour) */
function timeToOffset(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - 8) * 60 + m;
}

export default function DailyTimeline({ selectedDate: _selectedDate, selectedDateLabel, meetings, tasks }: Props) {
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const totalHeight = 12 * 60; // 12 hours * 60px

  return (
    <div className="glass-card" style={{ padding: '16px 18px' }}>
      <h3 style={{
        margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        🕐 ציר זמן יומי
        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>
          {selectedDateLabel}
        </span>
      </h3>

      {/* Tasks without time (top section) */}
      {pendingTasks.length > 0 && (
        <div style={{
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 10, padding: '8px 12px', marginBottom: 12,
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>
            📋 משימות לביצוע היום ({pendingTasks.length})
          </div>
          {pendingTasks.map(t => (
            <div key={t.id} style={{
              fontSize: '0.78rem', color: '#cbd5e1', padding: '3px 0',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981',
              }} />
              {t.title}
            </div>
          ))}
        </div>
      )}

      {/* Timeline grid */}
      {meetings.length === 0 && pendingTasks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          color: '#475569', fontSize: '0.82rem',
        }}>
          📭 אין אירועים ליום הזה
        </div>
      ) : (
        <div style={{
          position: 'relative', height: Math.min(totalHeight, 420),
          overflowY: 'auto', overflowX: 'hidden',
        }}>
          <div style={{ position: 'relative', height: totalHeight }}>
            {/* Hour lines */}
            {HOURS.map(h => (
              <div key={h} style={{
                position: 'absolute', top: (h - 8) * 60, left: 0, right: 0,
                borderTop: '1px solid rgba(148,163,184,0.08)',
                display: 'flex', alignItems: 'flex-start',
              }}>
                <span style={{
                  fontSize: '0.62rem', color: '#475569', fontWeight: 600,
                  fontFamily: 'monospace', minWidth: 32, paddingTop: 2,
                }}>
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}

            {/* Meeting blocks */}
            {meetings.map(m => {
              const top = timeToOffset(m.time);
              const height = Math.max(m.duration, 20);
              return (
                <div key={m.id} style={{
                  position: 'absolute',
                  top, left: 36, right: 4,
                  height,
                  background: `${m.color}25`,
                  border: `1px solid ${m.color}50`,
                  borderRight: `3px solid ${m.color}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  overflow: 'hidden',
                  cursor: 'default',
                }}>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700, color: m.color,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                    {m.time} · {m.duration} דקות
                    {m.participants.length > 0 && ` · ${m.participants.join(', ')}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Free time indicator */}
      {meetings.length > 0 && (() => {
        const totalMeetingTime = meetings.reduce((sum, m) => sum + m.duration, 0);
        const freeMinutes = 10 * 60 - totalMeetingTime; // Assuming 10-hour workday
        const freeHours = Math.floor(freeMinutes / 60);
        const freeRemainder = freeMinutes % 60;
        return (
          <div style={{
            marginTop: 10, padding: '6px 12px', borderRadius: 8,
            background: freeMinutes > 180 ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${freeMinutes > 180 ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
            fontSize: '0.72rem', fontWeight: 600,
            color: freeMinutes > 180 ? '#34d399' : '#f87171',
            textAlign: 'center',
          }}>
            ⏱️ זמן פנוי: {freeHours} שעות {freeRemainder > 0 ? `ו-${freeRemainder} דקות` : ''}
          </div>
        );
      })()}
    </div>
  );
}
