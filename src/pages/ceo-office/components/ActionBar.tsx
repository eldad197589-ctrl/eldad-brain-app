/* ============================================
   FILE: ActionBar.tsx
   PURPOSE: ActionBar component
   DEPENDENCIES: lucide-react
   EXPORTS: ActionBar (default)
   ============================================ */
import { Plus, RefreshCw, Calendar } from 'lucide-react';

interface Props {
  onAddMeeting: () => void;
  onAddTask: () => void;
  onSync: () => void;
  onGoToday: () => void;
}

export default function ActionBar({ onAddMeeting, onAddTask, onSync, onGoToday }: Props) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
      <button className="add-btn" onClick={onAddMeeting}>
        <Plus size={16} /> הוסף פגישה
      </button>
      <button className="add-btn" onClick={onAddTask}>
        <Plus size={16} /> הוסף משימה
      </button>
      <button className="sync-btn" onClick={onSync}>
        <RefreshCw size={16} /> עדכן מפרוטוקול
      </button>
      <button className="add-btn" onClick={onGoToday} style={{ marginRight: 'auto' }}>
        <Calendar size={16} /> היום
      </button>
    </div>
  );
}
