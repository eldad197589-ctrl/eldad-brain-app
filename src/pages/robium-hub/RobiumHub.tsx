/* ============================================
   FILE: RobiumHub.tsx
   PURPOSE: Dynamic "Command Center" — live operational hub synced to brainStore
   DEPENDENCIES: react, react-router-dom, lucide-react, brainStore, RobiumHubParts
   EXPORTS: RobiumHub (default)
   ============================================ */
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrainStore } from '../../store/brainStore';
import type { Meeting } from '../../data/calendarTypes';
import {
  NextMeetingHero, NoMeetingsPlaceholder, MeetingRow, QuickLink,
  SyncStatusBadge, MeetingAgenda,
} from './RobiumHubParts';

// #region Constants

/** Permanent quick-access links (always shown) */
const QUICK_LINKS = [
  { emoji: '📄', title: 'הסכם מייסדים', sub: 'הסכם סופי + חתימות', href: '/agreement', internal: true },
  { emoji: '📦', title: 'תיק מוצרים', sub: 'כל המוצרים שנבנו', href: '/products', internal: true },
  { emoji: '🏢', title: 'לשכת מנכ"ל', sub: 'יומן, משימות, ידע', href: '/ceo', internal: true },
  { emoji: '🎙️', title: 'פרוטוקול', sub: 'protokol.robium.net', href: 'https://protokol.robium.net' },
  { emoji: '💰', title: 'הצעות מחיר', sub: 'מחולל Smart Bareau', href: '/quotes-generator', internal: true },
  { emoji: '⚙️', title: 'ניהול מחירון', sub: 'הגדרת תעריפי בסיס', href: '/pricing-manager', internal: true },
  { emoji: '📞', title: 'ניהול לידים', sub: 'Pipeline מליד ללקוח', href: '/leads', internal: true },
];

// #endregion

// #region Helpers

/**
 * Find the next upcoming (non-completed) meeting from the store.
 * Falls back to the most recent completed meeting if none are upcoming.
 */
function findNextMeeting(meetings: Meeting[]): Meeting | null {
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = meetings
    .filter(m => !m.completed && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  if (upcoming.length > 0) return upcoming[0];

  const past = meetings
    .filter(m => m.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  return past[0] || null;
}

// #endregion

// #region Component

/**
 * Dynamic Command Center — live operational hub.
 * Connected to brainStore — all actions (complete, update) are synced.
 */
export default function RobiumHub() {
  const meetings = useBrainStore(s => s.meetings);
  const updateMeeting = useBrainStore(s => s.updateMeeting);
  const syncStatus = useBrainStore(s => s.syncStatus);
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

  /** Mark a meeting as completed — syncs to store + Supabase */
  const handleCompleteMeeting = useCallback((id: string) => {
    updateMeeting(id, { completed: true });
  }, [updateMeeting]);

  /** Navigate to CEO office to edit the meeting */
  const handleEditInCeo = useCallback(() => {
    navigate('/ceo');
  }, [navigate]);

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
        <SyncStatusBadge status={syncStatus} />
      </header>

      {/* ═══ Next Meeting Hero ═══ */}
      {nextMeeting ? (
        <>
          <NextMeetingHero
            meeting={nextMeeting}
            onNavigate={p => navigate(p)}
            onComplete={() => handleCompleteMeeting(nextMeeting.id)}
            onEditInCeo={handleEditInCeo}
          />

          {/* ═══ Meeting Agenda — dynamic from topics ═══ */}
          {nextMeeting.topics.length > 0 && (
            <MeetingAgenda
              topics={nextMeeting.topics}
              onNavigate={p => navigate(p)}
            />
          )}
        </>
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

