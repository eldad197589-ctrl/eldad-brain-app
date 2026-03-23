/**
 * AllTasksOverview — Tasks list with filtering, search, and progress bar.
 */
import { useState, useMemo } from 'react';
import type { Task } from '../types';
import TaskCard from './TaskCard';
import TaskFilterBar from './TaskFilterBar';

interface Props {
  tasks: Task[];
  doneTasks: number;
  totalTasks: number;
  todayStr: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onExpand: (task: Task) => void;
}

export default function AllTasksOverview({
  tasks, doneTasks, totalTasks, todayStr,
  onToggle, onDelete, onExpand,
}: Props) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePriority, setActivePriority] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [tasks]);

  // Filtered + sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply filters
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory) result = result.filter(t => t.category === activeCategory);
    if (activePriority) result = result.filter(t => t.priority === activePriority);
    if (activeStatus) result = result.filter(t => t.status === activeStatus);

    // Sort: done last, then by priority, then by due date
    result.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority] || a.dueDate.localeCompare(b.dueDate);
    });

    return result;
  }, [tasks, searchQuery, activeCategory, activePriority, activeStatus]);

  const hasFilters = searchQuery || activeCategory || activePriority || activeStatus;

  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        ✅ כל המשימות ({doneTasks}/{totalTasks})
      </h3>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#334155', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{
          height: '100%',
          width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : '0%',
          background: 'linear-gradient(to left, #34d399, #10b981)',
          borderRadius: 10, transition: 'width 0.3s',
        }} />
      </div>

      {/* Filter Bar */}
      <TaskFilterBar
        categories={categories}
        activeCategory={activeCategory}
        activePriority={activePriority}
        activeStatus={activeStatus}
        searchQuery={searchQuery}
        onCategoryChange={setActiveCategory}
        onPriorityChange={setActivePriority}
        onStatusChange={setActiveStatus}
        onSearchChange={setSearchQuery}
      />

      {/* Results */}
      {filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#475569', fontSize: '0.82rem' }}>
          {hasFilters ? '🔍 לא נמצאו משימות בפילטר הנוכחי' : '📭 אין משימות'}
        </div>
      ) : (
        <>
          {hasFilters && (
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 8 }}>
              מציג {filteredTasks.length} מתוך {totalTasks} משימות
            </div>
          )}
          {filteredTasks.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              todayStr={todayStr}
              onToggle={onToggle}
              onDelete={onDelete}
              onExpand={onExpand}
              compact
            />
          ))}
        </>
      )}
    </div>
  );
}
