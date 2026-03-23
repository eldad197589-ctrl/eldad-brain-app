/**
 * FILE: RobiumHub.tsx
 * PURPOSE: Dynamic "Command Center" — shows the next upcoming meeting as a war room
 * DEPENDENCIES: brainStore, MeetingPrepView, useNavigate
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, Rocket, ExternalLink,
  ChevronLeft, AlertCircle,
} from 'lucide-react';
import { useBrainStore } from '../../store/brainStore';
import MeetingPrepView from '../ceo-office/components/MeetingPrepView';
import type { Meeting } from '../../data/calendarTypes';

// #region Constants

/** Permanent quick-access links (always shown) */
const QUICK_LINKS = [
  { emoji: '📄', title: 'הסכם מייסדים', sub: 'הסכם סופי + חתימות', href: '/agreement', internal: true },
  { emoji: '📦', title: 'תיק מוצרים', sub: 'כל המוצרים שנבנו', href: '/products', internal: true },
  { emoji: '🏢', title: 'לשכת מנכ"ל', sub: 'יומן, משימות, ידע', href: '/ceo', internal: true },
  { emoji: '🎙️', title: 'פרוטוקול', sub: 'protokol.robium.net', href: 'https://protokol.robium.net' },
];

// #endregion

// #region Helpers

/**
 * Find the next upcoming (non-completed) meeting from the store.
 * Falls back to the most recent completed meeting if none are upcoming.
 */
function findNextMeeting(meetings: Meeting[]): Meeting | null {
  const today = new Date().toISOString().slice(0, 10);

  // Upcoming = not completed, date >= today
  const upcoming = meetings
    .filter(m => !m.completed && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  if (upcoming.length > 0) return upcoming[0];

  // Fallback: most-recent completed
  const past = meetings
    .filter(m => m.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  return past[0] || null;
}

/** Human-readable countdown string */
function getCountdown(dateStr: string): string {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `לפני ${Math.abs(diffDays)} ימים`;
  if (diffDays === 0) return 'היום! 🔥';
  if (diffDays === 1) return 'מחר';
  if (diffDays === 2) return 'בעוד יומיים';
  return `בעוד ${diffDays} ימים`;
}

/** Format meeting date in Hebrew */
function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// #endregion

// #region Component

/**
 * Dynamic Command Center — shows the next meeting as a full war room.
 * Pulls data from brainStore; reuses MeetingPrepView for prep stages.
 */
export default function RobiumHub() {
  const meetings = useBrainStore(s => s.meetings);
  const navigate = useNavigate();

  const nextMeeting = useMemo(() => findNextMeeting(meetings), [meetings]);

  const otherUpcoming = useMemo(() => {
    if (!nextMeeting) return [];
    const today = new Date().toISOString().slice(0, 10);
    return meetings
      .filter(m => !m.completed && m.date >= today && m.id !== nextMeeting.id)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [meetings, nextMeeting]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Badge */}
      <header style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 40, padding: '6px 16px', marginBottom: 16,
        }}>
          <div className="pulse-dot" style={{
            width: 8, height: 8, borderRadius: '50%', background: '#10b981',
          }} />
          <span style={{
            fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700,
            color: '#7C3AED', letterSpacing: 2,
          }}>COMMAND CENTER</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 6px' }}>
          מרכז שליטה
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          הפגישה הבאה שלך — כל מה שצריך במקום אחד
        </p>
      </header>

      {/* ═══ Next Meeting Hero ═══ */}
      {nextMeeting ? (
        <NextMeetingHero meeting={nextMeeting} onNavigate={p => navigate(p)} />
      ) : (
        <NoMeetingsPlaceholder />
      )}

      {/* ═══ Other Upcoming Meetings ═══ */}
      {otherUpcoming.length > 0 && (
        <div className="glass-card" style={{ padding: '18px 22px', marginTop: 24 }}>
          <h3 style={{
            margin: '0 0 14px', fontSize: '0.92rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🗓️ פגישות נוספות קרובות
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {otherUpcoming.map(m => (
              <MeetingRow key={m.id} meeting={m} onClick={() => navigate('/ceo')} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ Quick Access Links ═══ */}
      <div className="glass-card" style={{ padding: '18px 22px', marginTop: 24 }}>
        <h3 style={{
          margin: '0 0 14px', fontSize: '0.92rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🔗 גישה מהירה
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 10,
        }}>
          {QUICK_LINKS.map((l, i) => (
            <QuickLink key={i} {...l} onNavigate={p => navigate(p)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// #endregion

// #region Sub-Components

/** Hero section for the next meeting — shows details + prep stages */
function NextMeetingHero({ meeting, onNavigate }: {
  meeting: Meeting; onNavigate: (path: string) => void;
}) {
  const countdown = getCountdown(meeting.date);
  const isToday = countdown === 'היום! 🔥';
  const isPast = countdown.startsWith('לפני');

  return (
    <div className="glass-card" style={{
      padding: 0, overflow: 'hidden',
      borderTop: `3px solid ${meeting.color}`,
    }}>
      {/* Meeting Header */}
      <div style={{ padding: '24px 28px 20px' }}>
        {/* Status + countdown */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, flexWrap: 'wrap', gap: 10,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
            background: meeting.completed
              ? 'rgba(16,185,129,0.12)' : isToday
                ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.12)',
            color: meeting.completed
              ? '#34d399' : isToday
                ? '#f87171' : '#60a5fa',
          }}>
            {meeting.completed ? '✅ הושלמה' : isToday ? '🔴 היום!' : '🔵 מתוכננת'}
          </span>
          {!isPast && (
            <span style={{
              fontSize: '0.85rem', fontWeight: 700,
              color: isToday ? '#f87171' : '#c9a84c',
              fontFamily: 'monospace',
            }}>
              ⏱ {countdown}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800, margin: '0 0 14px',
          color: '#f1f5f9', lineHeight: 1.4,
        }}>
          <Rocket size={20} style={{ marginLeft: 8, verticalAlign: 'middle', color: meeting.color }} />
          {meeting.title}
        </h2>

        {/* Meta */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 18,
          color: '#94a3b8', fontSize: '0.85rem',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} /> {formatDate(meeting.date)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={15} /> {meeting.time} · {meeting.duration} דקות
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={15} /> {meeting.participants.join(', ')}
          </span>
        </div>
      </div>

      {/* Prep Stages — reuse the existing component */}
      {meeting.prepStages && meeting.prepStages.length > 0 && (
        <MeetingPrepView
          meetingId={meeting.id}
          stages={meeting.prepStages}
          onNavigate={onNavigate}
        />
      )}

      {/* No prep stages message */}
      {(!meeting.prepStages || meeting.prepStages.length === 0) && (
        <div style={{
          padding: '20px 28px', borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center', color: '#64748b', fontSize: '0.85rem',
        }}>
          <AlertCircle size={18} style={{ marginLeft: 6, verticalAlign: 'middle' }} />
          לפגישה הזו אין עדיין חומרי הכנה — ניתן להוסיף דרך{' '}
          <span
            onClick={() => onNavigate('/ceo')}
            style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}
          >
            לשכת המנכ"ל
          </span>
        </div>
      )}
    </div>
  );
}

/** Placeholder when there are no upcoming meetings */
function NoMeetingsPlaceholder() {
  return (
    <div className="glass-card" style={{
      padding: '48px 28px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
      <h2 style={{
        fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8,
      }}>
        אין פגישות מתוכננות
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
        כשתוסיף פגישות בלשכת המנכ"ל, הפגישה הבאה תופיע כאן אוטומטית
      </p>
    </div>
  );
}

/** A compact row for other upcoming meetings */
function MeetingRow({ meeting, onClick }: { meeting: Meeting; onClick: () => void }) {
  const d = new Date(meeting.date + 'T00:00:00');
  const label = d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: meeting.color, flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
          {meeting.title}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
          {label} · {meeting.time} · {meeting.participants.join(', ')}
        </div>
      </div>
      <ChevronLeft size={16} color="#475569" />
    </div>
  );
}

/** Quick access link card */
function QuickLink({ emoji, title, sub, href, internal, onNavigate }: {
  emoji: string; title: string; sub: string; href: string;
  internal?: boolean; onNavigate: (path: string) => void;
}) {
  const handleClick = () => {
    if (internal) {
      onNavigate(href);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'rgba(201,168,76,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', flexShrink: 0,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{title}</div>
        <div style={{
          fontSize: '0.72rem', color: '#64748b', marginTop: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{sub}</div>
      </div>
      {!internal && <ExternalLink size={14} color="#475569" style={{ flexShrink: 0 }} />}
    </div>
  );
}

// #endregion
