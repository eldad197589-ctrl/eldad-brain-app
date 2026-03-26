/* ============================================
   FILE: DayDetailPanel.tsx
   PURPOSE: DayDetailPanel component
   DEPENDENCIES: react, lucide-react
   EXPORTS: DayDetailPanel (default)
   ============================================ */
// #region Imports

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { Meeting, Task } from '../types';
import type { DayEvents } from '../types';
import MeetingCard from './MeetingCard';
import TaskCard from './TaskCard';
import QuickAddTask from './QuickAddTask';
import QuickAddMeeting from './QuickAddMeeting';
import EditPrepModal from './modals/EditPrepModal';
import { useBrainStore } from '../../../store/brainStore';


// #endregion

// #region Types

interface Props {
  selectedDate: string;
  selectedDateLabel: string;
  events: DayEvents;
  onAddTask: (t: Omit<Task, 'id'>) => void;
  onAddMeeting: (m: Omit<Meeting, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteMeeting: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onShowMeetingModal: () => void;
  onShowTaskModal: () => void;
  onClickMeeting?: (meeting: Meeting) => void;
}


// #endregion

// #region Component

/** DayDetailPanel component — DayDetailPanel component */
export default function DayDetailPanel({
  selectedDate, selectedDateLabel, events,
  onAddTask, onAddMeeting, onToggleTask,
  onDeleteMeeting, onDeleteTask,
  onShowMeetingModal, onShowTaskModal, onClickMeeting,
}: Props) {
  const [editPrepMeeting, setEditPrepMeeting] = useState<Meeting | null>(null);

  // Read live meeting data from store so we get updates after editing
  const liveMeetings = useBrainStore(s => s.meetings);

  /** Get the live version of a meeting from the store */
  const getLiveMeeting = (m: Meeting) =>
    liveMeetings.find(lm => lm.id === m.id) || m;

  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        📅 {selectedDateLabel}
      </h3>

      {/* Quick-Add Bars */}
      <QuickAddTask onAdd={onAddTask} defaultDate={selectedDate} />
      <QuickAddMeeting onAdd={onAddMeeting} defaultDate={selectedDate} />

      {/* Meetings for selected day */}
      {events.meetings.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: 1 }}>
            פגישות
          </div>
          {events.meetings.map(m => (
            <MeetingCard
              key={m.id}
              meeting={getLiveMeeting(m)}
              onDelete={onDeleteMeeting}
              onClick={onClickMeeting}
              onEditPrep={(meeting) => setEditPrepMeeting(meeting)}
            />
          ))}
        </div>
      )}

      {/* Tasks for selected day */}
      {events.tasks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: 1 }}>
            משימות
          </div>
          {events.tasks.map(t => (
            <TaskCard key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {events.meetings.length === 0 && events.tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
          <Calendar size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p>אין אירועים ביום זה</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="add-btn" style={{ fontSize: '0.78rem', padding: '8px 14px' }} onClick={onShowMeetingModal}>
              + פגישה
            </button>
            <button className="add-btn" style={{ fontSize: '0.78rem', padding: '8px 14px' }} onClick={onShowTaskModal}>
              + משימה
            </button>
          </div>
        </div>
      )}

      {/* Edit Prep Modal — opens directly from meeting card */}
      {editPrepMeeting && (
        <EditPrepModal
          meetingId={editPrepMeeting.id}
          initialStages={getLiveMeeting(editPrepMeeting).prepStages || []}
          onClose={() => setEditPrepMeeting(null)}
        />
      )}
    </div>
  );
}

// #endregion
