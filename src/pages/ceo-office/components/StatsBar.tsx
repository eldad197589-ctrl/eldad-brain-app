/* ============================================
   FILE: StatsBar.tsx
   PURPOSE: StatsBar component
   DEPENDENCIES: react
   EXPORTS: StatsBar (default)
   ============================================ */
/**
 * FILE: StatsBar.tsx
 * PURPOSE: CEO Office stats — 4 blocks per doctrine Part 6
 * DEPENDENCIES: brainStore
 */

import { useMemo } from 'react';
import { useBrainStore } from '../../../store/brainStore';

// #region Types
/** Props for the StatsBar component */
interface Props {
  /** Total tasks */
  totalTasks: number;
  /** Completed tasks */
  doneTasks: number;
  /** High priority pending tasks */
  highPriorityPending: number;
  /** Overdue tasks count */
  overdueTasks: number;
}
// #endregion

// #region Component
/**
 * StatsBar — 4 doctrine blocks for CEO view.
 * Per MASTER_BRAIN_INSTRUCTIONS Part 6:
 * 🔴 דורש החלטה | 📋 ממתין לטיפול | ✅ הושלמו | 🧠 המוח למד
 * Empty = shows 0. Never fake data.
 */
export default function StatsBar({
  totalTasks, doneTasks, highPriorityPending, overdueTasks,
}: Props) {
  const knowledgeLog = useBrainStore((s) => s.knowledgeLog);

  /** Count knowledge entries from today */
  const todayLearned = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return knowledgeLog.filter((e) => e.timestamp.startsWith(todayStr)).length;
  }, [knowledgeLog]);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* 4 Doctrine Blocks */}
      <div className="brain-stats-bar">
        {/* 🔴 דורש החלטה */}
        <div className="brain-stat" style={{
          borderBottom: highPriorityPending > 0 ? '3px solid #ef4444' : '3px solid transparent',
        }}>
          <div className="brain-stat-num" style={{
            color: highPriorityPending > 0 ? '#ef4444' : '#34d399',
          }}>
            {highPriorityPending}
          </div>
          <div className="brain-stat-label">🔴 דורש החלטה</div>
        </div>

        {/* 📋 ממתין לטיפול */}
        <div className="brain-stat" style={{
          borderBottom: overdueTasks > 0 ? '3px solid #fbbf24' : '3px solid transparent',
        }}>
          <div className="brain-stat-num" style={{
            color: overdueTasks > 0 ? '#fbbf24' : '#94a3b8',
          }}>
            {overdueTasks}
          </div>
          <div className="brain-stat-label">📋 ממתין לטיפול</div>
        </div>

        {/* ✅ הושלמו */}
        <div className="brain-stat">
          <div className="brain-stat-num" style={{ color: '#34d399' }}>
            {doneTasks}/{totalTasks}
          </div>
          <div className="brain-stat-label">✅ הושלמו</div>
        </div>

        {/* 🧠 המוח למד */}
        <div className="brain-stat" style={{
          borderBottom: todayLearned > 0 ? '3px solid #a78bfa' : '3px solid transparent',
        }}>
          <div className="brain-stat-num" style={{ color: '#a78bfa' }}>
            {todayLearned}
          </div>
          <div className="brain-stat-label">🧠 המוח למד</div>
        </div>
      </div>
    </div>
  );
}
// #endregion
