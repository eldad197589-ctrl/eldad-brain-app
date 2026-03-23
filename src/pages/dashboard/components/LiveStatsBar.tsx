/**
 * FILE: LiveStatsBar.tsx
 * PURPOSE: Real-time operational stats bar for dashboard — tasks, meetings, documents
 * DEPENDENCIES: useDashboardStats hook
 */

// #region Component

interface LiveStatsBarProps {
  /** Open tasks count */
  openTasks: number;
  /** Overdue tasks count */
  overdueTasks: number;
  /** Today's meetings count */
  todayMeetings: number;
  /** Pending documents count */
  pendingDocs: number;
  /** Total knowledge entries */
  knowledgeCount: number;
}

/**
 * LiveStatsBar — Horizontal bar showing real-time operational stats.
 * Displayed above the neuron grid on the dashboard.
 */
export default function LiveStatsBar({
  openTasks, overdueTasks, todayMeetings, pendingDocs, knowledgeCount,
}: LiveStatsBarProps) {
  const items = [
    { emoji: '📋', label: 'משימות פתוחות', value: openTasks, color: '#3b82f6', alert: overdueTasks > 0 },
    { emoji: '🔴', label: 'באיחור', value: overdueTasks, color: '#ef4444', alert: overdueTasks > 0, hide: overdueTasks === 0 },
    { emoji: '📅', label: 'פגישות היום', value: todayMeetings, color: '#a78bfa' },
    { emoji: '📥', label: 'מסמכים ממתינים', value: pendingDocs, color: '#fbbf24', alert: pendingDocs > 0 },
    { emoji: '🧠', label: 'המוח למד', value: knowledgeCount, color: '#34d399' },
  ].filter(i => !i.hide);

  return (
    <div style={{
      display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
      marginBottom: 20, padding: '10px 16px',
      background: 'rgba(201,168,76,0.04)', borderRadius: 12,
      border: '1px solid rgba(201,168,76,0.1)',
    }}>
      {items.map((item) => (
        <div key={item.label} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 10,
          background: item.alert ? `${item.color}12` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${item.alert ? `${item.color}30` : 'rgba(255,255,255,0.06)'}`,
        }}>
          <span style={{ fontSize: '0.85rem' }}>{item.emoji}</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{item.label}</span>
          <span style={{
            fontSize: '0.85rem', fontWeight: 800,
            color: item.alert ? item.color : '#e2e8f0',
          }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// #endregion
