/* ============================================
   FILE: MorningBrief.tsx
   PURPOSE: MorningBrief component
   DEPENDENCIES: react, lucide-react
   EXPORTS: MorningBrief (default)
   ============================================ */
/**
 * FILE: MorningBrief.tsx
 * PURPOSE: Automated daily brief for CEO — real data summary
 * DEPENDENCIES: brainStore
 *
 * Per MASTER_BRAIN_INSTRUCTIONS Part 3:
 * "כל בוקר — סיכום. לא דוח. סיכום בשפה של מנכ"ל."
 */

import { useMemo } from 'react';
import { Sun } from 'lucide-react';
import { useBrainStore } from '../../../store/brainStore';

// #region Types

interface BriefItem {
  /** Icon emoji */
  icon: string;
  /** Brief text */
  text: string;
  /** Urgency: 'critical' = red, 'warn' = yellow, 'info' = gray, 'success' = green */
  level: 'critical' | 'warn' | 'info' | 'success';
}

// #endregion

// #region Component

/**
 * MorningBrief — Daily CEO summary.
 * Aggregates tasks, meetings, overdue, documents, knowledge into actionable items.
 * Per doctrine: "סיכום בשפה של מנכ"ל — לא דוח טכני"
 */
export default function MorningBrief() {
  const tasks = useBrainStore((s) => s.tasks);
  const meetings = useBrainStore((s) => s.meetings);
  const documents = useBrainStore((s) => s.documents);
  const knowledgeLog = useBrainStore((s) => s.knowledgeLog);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const briefItems = useMemo<BriefItem[]>(() => {
    const items: BriefItem[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Overdue tasks
    const overdue = tasks.filter((t) => {
      if (t.status === 'done') return false;
      const due = new Date(t.dueDate + 'T00:00:00');
      return due < now;
    });
    if (overdue.length > 0) {
      items.push({
        icon: '🔴',
        text: `${overdue.length} משימות באיחור — ${overdue.map((t) => t.title).slice(0, 2).join(', ')}${overdue.length > 2 ? '...' : ''}`,
        level: 'critical',
      });
    }

    // High priority pending
    const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done');
    if (highPriority.length > 0) {
      items.push({
        icon: '⚡',
        text: `${highPriority.length} משימות דחופות — דורשות החלטה`,
        level: 'warn',
      });
    }

    // Today's meetings
    const todayMeetings = meetings.filter((m) => m.date === todayStr);
    if (todayMeetings.length > 0) {
      items.push({
        icon: '📅',
        text: `${todayMeetings.length} פגישות היום — ${todayMeetings.map((m) => `${m.title} ב-${m.time}`).join(', ')}`,
        level: 'info',
      });
    } else {
      // Show next upcoming meeting if nothing today
      const upcoming = meetings
        .filter((m) => m.date > todayStr && !m.completed)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (upcoming.length > 0) {
        const next = upcoming[0];
        const nextDate = new Date(next.date + 'T00:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
        items.push({
          icon: '📅',
          text: `הפגישה הבאה: ${next.title} — ${nextDate} ב-${next.time}`,
          level: 'info',
        });
      } else {
        items.push({
          icon: '📅',
          text: 'אין פגישות קרובות — שקט תעשייתי',
          level: 'success',
        });
      }
    }

    // Pending documents
    const pendingDocs = documents.filter((d) => d.status === 'pending');
    if (pendingDocs.length > 0) {
      items.push({
        icon: '📥',
        text: `${pendingDocs.length} מסמכים ממתינים לסיווג`,
        level: 'warn',
      });
    }

    // Today's completed
    const completedToday = tasks.filter((t) => t.status === 'done');
    if (completedToday.length > 0) {
      items.push({
        icon: '✅',
        text: `${completedToday.length}/${tasks.length} משימות הושלמו`,
        level: 'success',
      });
    }

    // Knowledge learned today
    const todayKnowledge = knowledgeLog.filter((e) => e.timestamp.startsWith(todayStr));
    if (todayKnowledge.length > 0) {
      items.push({
        icon: '🧠',
        text: `המוח למד ${todayKnowledge.length} דברים חדשים היום`,
        level: 'info',
      });
    }

    return items;
  }, [tasks, meetings, documents, knowledgeLog, todayStr]);

  const levelColors: Record<BriefItem['level'], { bg: string; border: string; text: string }> = {
    critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#f87171' },
    warn: { bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
    info: { bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.12)', text: '#94a3b8' },
    success: { bg: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.12)', text: '#34d399' },
  };

  const dayName = new Date().toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{
      marginBottom: 16, borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(201,168,76,0.25)',
      background: 'linear-gradient(135deg, rgba(201,168,76,0.05), rgba(30,41,59,0.95))',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(201,168,76,0.12)',
      }}>
        <Sun size={20} color="#c9a84c" />
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#c9a84c' }}>
            ☀️ דוח בוקר
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {dayName}
          </div>
        </div>
      </div>

      {/* Brief Items */}
      <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {briefItems.map((item, i) => {
          const colors = levelColors[item.level];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 10,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: item.level === 'critical' ? 700 : 500,
                color: colors.text,
              }}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// #endregion
