/* ============================================
   FILE: CalendarGrid.tsx
   PURPOSE: CalendarGrid component
   DEPENDENCIES: lucide-react
   EXPORTS: CalendarGrid (default)
   ============================================ */
// #region Imports

import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { CalendarDay, DayEvents } from '../types';
import { DAYS_HE, MONTHS_HE } from '../constants';


// #endregion

// #region Types

interface Props {
  calendarDays: CalendarDay[];
  eventsByDate: Record<string, DayEvents>;
  currentMonth: number;
  currentYear: number;
  selectedDate: string;
  todayStr: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
}


// #endregion

// #region Component

/** CalendarGrid component — CalendarGrid component */
export default function CalendarGrid({
  calendarDays, eventsByDate, currentMonth, currentYear,
  selectedDate, todayStr, onPrevMonth, onNextMonth, onSelectDate,
}: Props) {
  return (
    <div className="glass-card" style={{ padding: '20px 22px' }}>
      {/* Calendar Nav */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={onNextMonth}><ChevronRight size={18} /></button>
        <span className="cal-month-title">{MONTHS_HE[currentMonth]} {currentYear}</span>
        <button className="cal-nav-btn" onClick={onPrevMonth}><ChevronLeft size={18} /></button>
      </div>

      {/* Day Headers */}
      <div className="cal-grid">
        {DAYS_HE.map(d => (
          <div key={d} className="cal-header-cell">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="cal-grid">
        {calendarDays.map((day, i) => {
          const events = eventsByDate[day.date];
          const isToday = day.date === todayStr;
          const isSelected = day.date === selectedDate;
          const classes = ['cal-day'];
          if (isToday) classes.push('today');
          if (isSelected) classes.push('selected');
          if (!day.isCurrentMonth) classes.push('other-month');

          return (
            <div
              key={i}
              className={classes.join(' ')}
              onClick={() => onSelectDate(day.date)}
            >
              <div className="cal-day-num">{day.day}</div>
              {events && (
                <div className="cal-events-list">
                  {events.meetings.slice(0, 2).map(m => (
                    <span key={m.id} className="cal-event-mini"
                      style={{ background: `${m.color}25`, color: m.color, border: `1px solid ${m.color}40` }}>
                      {m.time} {m.title.length > 8 ? m.title.slice(0, 8) + '…' : m.title}
                    </span>
                  ))}
                  {events.tasks.filter(t => t.status !== 'done').slice(0, 1).map(t => (
                    <span key={t.id} className="cal-event-mini"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                      ✓ {t.title.length > 10 ? t.title.slice(0, 10) + '…' : t.title}
                    </span>
                  ))}
                  {(events.meetings.length > 2 || events.tasks.length > 1) && (
                    <span style={{ fontSize: '0.55rem', color: '#a0aec0', textAlign: 'center' }}>
                      +{events.meetings.length + events.tasks.length - (events.meetings.length > 2 ? 2 : events.meetings.length) - (events.tasks.length > 1 ? 1 : events.tasks.filter(t => t.status !== 'done').length)} עוד
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// #endregion
