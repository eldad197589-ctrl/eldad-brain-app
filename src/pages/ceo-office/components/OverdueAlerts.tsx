/**
 * FILE: OverdueAlerts.tsx
 * PURPOSE: Loop closure alerts — shows overdue + stuck tasks per doctrine Part 5
 * DEPENDENCIES: brainStore
 *
 * Per MASTER_BRAIN_INSTRUCTIONS Part 5:
 * "משימה פתוחה = כישלון של הסוכן — לא של אלדד."
 */

import { useMemo } from 'react';
import { AlertTriangle, Clock, ArrowLeft } from 'lucide-react';
import { useBrainStore } from '../../../store/brainStore';
import type { Task } from '../../../data/calendarTypes';

// #region Types

interface OverdueTask {
  /** The task itself */
  task: Task;
  /** Days overdue */
  daysOverdue: number;
}

interface Props {
  /** Navigate to task detail handler */
  onExpandTask: (task: Task) => void;
}

// #endregion

// #region Helpers

/**
 * Calculate how many days a task is overdue.
 * @param dueDate — Task due date YYYY-MM-DD
 * @returns Number of days overdue (negative = not yet due)
 */
function calcDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

// #endregion

// #region Component

/**
 * OverdueAlerts — Shows stuck/overdue tasks with urgency levels.
 * Per doctrine: tasks stuck >3 days get escalated.
 * Empty = shows nothing (not fake data).
 */
export default function OverdueAlerts({ onExpandTask }: Props) {
  const tasks = useBrainStore((s) => s.tasks);

  const overdueItems = useMemo<OverdueTask[]>(() => {
    return tasks
      .filter((t) => t.status !== 'done')
      .map((t) => ({ task: t, daysOverdue: calcDaysOverdue(t.dueDate) }))
      .filter((item) => item.daysOverdue > 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [tasks]);

  if (overdueItems.length === 0) return null;

  return (
    <div style={{
      marginBottom: 16, borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(239,68,68,0.25)',
      background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(30,41,59,0.95))',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(239,68,68,0.15)',
      }}>
        <AlertTriangle size={18} color="#ef4444" />
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f87171' }}>
          ⚠️ {overdueItems.length} משימות באיחור
        </span>
      </div>

      {/* Alert Items */}
      <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {overdueItems.map((item) => {
          const isStuck = item.daysOverdue >= 3;
          return (
            <div
              key={item.task.id}
              onClick={() => onExpandTask(item.task)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                background: isStuck ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.06)',
                border: `1px solid ${isStuck ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.15)'}`,
                transition: 'all 0.2s',
              }}
            >
              <Clock size={14} color={isStuck ? '#ef4444' : '#fbbf24'} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.85rem', fontWeight: 600,
                  color: isStuck ? '#f87171' : '#fbbf24',
                }}>
                  {item.task.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {isStuck
                    ? `🔴 תקועה ${item.daysOverdue} ימים — נדרשת התערבות`
                    : `🟡 באיחור ${item.daysOverdue} ${item.daysOverdue === 1 ? 'יום' : 'ימים'}`
                  }
                </div>
              </div>
              <ArrowLeft size={14} color="#64748b" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// #endregion
