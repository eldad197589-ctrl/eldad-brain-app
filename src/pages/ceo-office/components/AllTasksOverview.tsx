/* ============================================
   FILE: AllTasksOverview.tsx
   PURPOSE: Tasks list grouped by category with collapsible sections
   DEPENDENCIES: react
   EXPORTS: AllTasksOverview (default)
   ============================================ */
/**
 * AllTasksOverview — Tasks grouped by category with collapse/expand,
 * filtering, search, and progress bar.
 */
// #region Imports

import { useState, useMemo } from 'react';
import type { Task } from '../types';
import TaskCard from './TaskCard';
import TaskFilterBar from './TaskFilterBar';
import { ChevronDown, ChevronLeft } from 'lucide-react';

// #endregion

// #region Types

interface Props {
  tasks: Task[];
  doneTasks: number;
  totalTasks: number;
  todayStr: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onExpand: (task: Task) => void;
}

// #endregion

// #region Component

/** AllTasksOverview — grouped by category with collapsible sections */
export default function AllTasksOverview({
  tasks, doneTasks, totalTasks, todayStr,
  onToggle, onDelete, onExpand,
}: Props) {
  // Filter state — default: hide completed tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePriority, setActivePriority] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>('not-done');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [tasks]);

  // Toggle group collapse
  const toggleGroup = (cat: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

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
    if (activeStatus === 'not-done') result = result.filter(t => t.status !== 'done');
    else if (activeStatus) result = result.filter(t => t.status === activeStatus);

    // Sort: by priority then due date
    result.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority] || a.dueDate.localeCompare(b.dueDate);
    });

    return result;
  }, [tasks, searchQuery, activeCategory, activePriority, activeStatus]);

  // Group tasks by category
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    for (const t of filteredTasks) {
      const cat = t.category || 'כללי';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    }
    return groups;
  }, [filteredTasks]);

  const hasFilters = searchQuery || activeCategory || activePriority || (activeStatus && activeStatus !== 'not-done');
  const activeTasks = tasks.filter(t => t.status !== 'done').length;

  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        ✅ משימות ({activeTasks} פתוחות, {doneTasks} הושלמו)
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

      {/* Results — grouped by category */}
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
          {Object.entries(groupedTasks).map(([category, catTasks]) => {
            const isCollapsed = collapsedGroups.has(category);
            const catDone = catTasks.filter(t => t.status === 'done').length;
            return (
              <div key={category} style={{ marginBottom: 12 }}>
                {/* Category header — collapsible */}
                <button
                  onClick={() => toggleGroup(category)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '8px 12px', marginBottom: 4, borderRadius: 8,
                    background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                    color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700,
                  }}
                >
                  {isCollapsed ? <ChevronLeft size={14} /> : <ChevronDown size={14} />}
                  <span style={{ color: '#60a5fa' }}>{category}</span>
                  <span style={{ marginRight: 'auto', fontSize: '0.68rem', color: '#64748b' }}>
                    {catDone}/{catTasks.length}
                  </span>
                </button>
                {/* Tasks in this category */}
                {!isCollapsed && catTasks.map(t => (
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
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// #endregion
