/* ============================================
   FILE: ViewToggle.tsx
   PURPOSE: ViewToggle component
   DEPENDENCIES: None (local only)
   EXPORTS: ViewToggle (default)
   ============================================ */
/**
 * ViewToggle — Dashboard view mode selector (brain / categories / list)
 */
import type { ViewMode } from '../types';

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

export default function ViewToggle({ view, onViewChange }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
      <div className="view-toggle">
        <button className={`view-toggle-btn ${view === 'brain' ? 'active' : ''}`} onClick={() => onViewChange('brain')}>
          🧠 תצוגת מוח
        </button>
        <button className={`view-toggle-btn ${view === 'categories' ? 'active' : ''}`} onClick={() => onViewChange('categories')}>
          📂 קטגוריות
        </button>
        <button className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => onViewChange('list')}>
          📋 רשימה
        </button>
      </div>
    </div>
  );
}
