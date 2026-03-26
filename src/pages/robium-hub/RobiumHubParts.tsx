/* ============================================
   FILE: RobiumHubParts.tsx
   PURPOSE: Sub-components for the RobiumHub Command Center page
   DEPENDENCIES: react, lucide-react, MeetingPrepView, calendarTypes
   EXPORTS: NextMeetingHero, NoMeetingsPlaceholder, MeetingRow, QuickLink, SyncStatusBadge, MeetingAgenda
   ============================================ */
import {
  Calendar, Clock, Users, Rocket, ExternalLink,
  ChevronLeft, AlertCircle, CheckCircle, Edit3, Cloud, HardDrive, Loader2,
  AlertTriangle, ListChecks,
} from 'lucide-react';
import MeetingPrepView from '../ceo-office/components/MeetingPrepView';
import type { Meeting, MeetingTopic } from '../../data/calendarTypes';
import type { SyncStatus } from '../../store/brainStore';

// #region Helpers

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

// #region SyncStatusBadge

/** Shows current data sync status — cloud, local, or error */
export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config: Record<SyncStatus, { icon: React.ReactNode; label: string; color: string }> = {
    cloud:   { icon: <Cloud size={12} />, label: 'מסונכרן לענן', color: '#10b981' },
    local:   { icon: <HardDrive size={12} />, label: 'מקומי בלבד', color: '#f59e0b' },
    syncing: { icon: <Loader2 size={12} className="spin-icon" />, label: 'מסנכרן...', color: '#3b82f6' },
    error:   { icon: <AlertTriangle size={12} />, label: 'שגיאת סנכרון', color: '#ef4444' },
  };
  const c = config[status];

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      marginTop: 10, padding: '4px 12px', borderRadius: 20,
      background: `${c.color}12`, border: `1px solid ${c.color}30`,
      fontSize: '0.72rem', fontWeight: 600, color: c.color,
    }}>
      {c.icon}
      {c.label}
    </div>
  );
}

// #endregion

// #region MeetingAgenda

/** Dynamic meeting agenda pulled from meeting topics — clickable links */
export function MeetingAgenda({ topics, onNavigate }: {
  topics: MeetingTopic[]; onNavigate: (path: string) => void;
}) {
  return (
    <div className="glass-card" style={{ padding: '18px 22px', marginTop: 16 }}>
      <h3 style={{
        margin: '0 0 14px', fontSize: '0.92rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <ListChecks size={18} color="#c9a84c" />
        📋 סדר יום
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {topics.map((topic, i) => (
          <div
            key={i}
            onClick={() => topic.link && onNavigate(topic.link)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              cursor: topic.link ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (topic.link) e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            }}
          >
            <span style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'rgba(201,168,76,0.1)', color: '#c9a84c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <span style={{
              flex: 1, fontSize: '0.88rem', fontWeight: 500, color: '#e2e8f0',
            }}>
              {topic.text}
            </span>
            {topic.link && (
              <ExternalLink size={14} color="#64748b" style={{ flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// #endregion

// #region NextMeetingHero

/** Hero section for the next meeting — shows details + prep stages + action buttons */
export function NextMeetingHero({ meeting, onNavigate, onComplete, onEditInCeo }: {
  meeting: Meeting;
  onNavigate: (path: string) => void;
  onComplete?: () => void;
  onEditInCeo?: () => void;
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

        {/* ═══ Action Buttons — real controls ═══ */}
        <div style={{
          display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap',
        }}>
          {!meeting.completed && onComplete && (
            <button
              onClick={onComplete}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 10,
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              <CheckCircle size={16} />
              סמן כהושלמה
            </button>
          )}
          {onEditInCeo && (
            <button
              onClick={onEditInCeo}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 10,
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#a78bfa', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              <Edit3 size={16} />
              ערוך בלשכת המנכ"ל
            </button>
          )}
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

// #endregion

// #region NoMeetingsPlaceholder

/** Placeholder when there are no upcoming meetings */
export function NoMeetingsPlaceholder() {
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

// #endregion

// #region MeetingRow

/** A compact row for other upcoming meetings */
export function MeetingRow({ meeting, onClick }: { meeting: Meeting; onClick: () => void }) {
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

// #endregion

// #region QuickLink

/** Quick access link card */
export function QuickLink({ emoji, title, sub, href, internal, onNavigate }: {
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

