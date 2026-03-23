/**
 * CEO Office — Orchestrator (Layout Wrapper)
 *
 * This component acts as the pure layout wrapper for the CEO Office page.
 * It composes all sub-components without containing business logic or heavy JSX.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task, Meeting } from './types';
import { toDateStr } from './calendarUtils';
import {
  useMeetings, useTasks, useCalendarGrid,
  useEventsByDate, useUpcomingMeetings, useOverdueTasks, useDailyNotes,
} from './hooks';

// Section components
import CeoHeader from './components/CeoHeader';
import StatsBar from './components/StatsBar';
import ActionBar from './components/ActionBar';
import CalendarGrid from './components/CalendarGrid';
import DayDetailPanel from './components/DayDetailPanel';
import DailyTimeline from './components/DailyTimeline';
import DailyNotes from './components/DailyNotes';
import UpcomingMeetings from './components/UpcomingMeetings';
import AllTasksOverview from './components/AllTasksOverview';
import CeoFooter from './components/CeoFooter';
import ProcessLauncher from './components/ProcessLauncher';
import OverdueAlerts from './components/OverdueAlerts';
import BrainLearnedBlock from './components/BrainLearnedBlock';
import DocumentIntake from './components/DocumentIntake';
import MorningBrief from './components/MorningBrief';
import DashboardSummaryCards from '../dashboard/components/DashboardSummaryCards';
import { LayoutDashboard, Calendar, Columns, Zap } from 'lucide-react';

// Modals
import AddMeetingModal from './components/modals/AddMeetingModal';
import AddTaskModal from './components/modals/AddTaskModal';
import ProtocolSyncModal from './components/modals/ProtocolSyncModal';
import TaskDetailPanel from './components/modals/TaskDetailPanel';
import MeetingDetailPanel from './components/modals/MeetingDetailPanel';

export default function CeoOffice() {
  const today = new Date();
  const todayStr = toDateStr(today);

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'kanban' | 'knowledge'>('overview');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProtocolSync, setShowProtocolSync] = useState(false);
  const [expandedTask, setExpandedTask] = useState<Task | null>(null);
  const [expandedMeeting, setExpandedMeeting] = useState<Meeting | null>(null);
  const navigate = useNavigate();

  // Process launch handler — routes to the correct flowchart/page
  const handleLaunchProcess = (processId: string) => {
    const routeMap: Record<string, string> = {
      attendance: '/flow/attendance',
      payroll_processing: '/flow/payroll-processing',
      worklaw: '/flow/worklaw',
      capital_gains: '/flow/capital-gains',
      declaration_of_capital: '/flow/declaration-of-capital',
      war_compensation: '/flow/war-compensation',
      expert_opinion: '/flow/expert-opinion',
      guardian_pro: '/flow/guardian-pro',
      insolvency: '/flow/insolvency',
      institutional_reports: '/flow/institutional-reports',
      penalty_cancellation: '/flow/penalty-cancellation',
    };
    const path = routeMap[processId] || '/coming-soon';
    navigate(path);
  };

  // Data hooks
  const { meetings, addMeeting, deleteMeeting } = useMeetings();
  const { tasks, addTask, toggleTask, deleteTask, toggleSubTask, updateTask } = useTasks();
  const calendarDays = useCalendarGrid(currentYear, currentMonth);
  const eventsByDate = useEventsByDate(meetings, tasks);
  const upcomingMeetings = useUpcomingMeetings(meetings);
  const overdueTasks = useOverdueTasks(tasks, todayStr);
  const { getNote, setNote } = useDailyNotes();

  // Navigation handlers
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayStr);
  };

  // Selected day data
  const selectedEvents = eventsByDate[selectedDate] || { meetings: [], tasks: [] };
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDateLabel = selectedDateObj.toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const highPriorityPending = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', paddingBottom: 60 }}>
      {/* 1. Header & Actions (Always visible) */}
      <CeoHeader />
      <ActionBar
        onAddMeeting={() => setShowMeetingModal(true)}
        onAddTask={() => setShowTaskModal(true)}
        onSync={() => setShowProtocolSync(true)}
        onGoToday={goToday}
      />

      {/* 2. Top Navigation Tabs */}
      <div style={{
        display: 'flex', gap: 12, padding: '0 20px', marginBottom: 24,
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        <TabButton id="overview" label="תקציר מנהלים" icon={<LayoutDashboard size={18} />} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="calendar" label="יומן ופגישות" icon={<Calendar size={18} />} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="kanban" label="שולחן משימות" icon={<Columns size={18} />} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="knowledge" label="המוח למד" icon={<Zap size={18} />} activeTab={activeTab} onClick={setActiveTab} />
      </div>

      <div style={{ flex: 1 }}>
        {/* ============================== */}
        {/* TAB 1: CONTROL CENTER            */}
        {/* ============================== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '0 20px' }}><MorningBrief /></div>
            <DashboardSummaryCards />
            <div style={{ padding: '0 20px' }}><DocumentIntake /></div>
            <div style={{ padding: '0 20px' }}>
              <ProcessLauncher onLaunch={handleLaunchProcess} />
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* TAB 2: CALENDAR                */}
        {/* ============================== */}
        {activeTab === 'calendar' && (
          <div className="ceo-layout">
            <CalendarGrid
              calendarDays={calendarDays}
              eventsByDate={eventsByDate}
              currentMonth={currentMonth}
              currentYear={currentYear}
              selectedDate={selectedDate}
              todayStr={todayStr}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onSelectDate={setSelectedDate}
            />
            {/* Right Sidebar for Calendar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DayDetailPanel
                selectedDate={selectedDate}
                selectedDateLabel={selectedDateLabel}
                events={selectedEvents}
                onAddTask={addTask}
                onAddMeeting={addMeeting}
                onToggleTask={toggleTask}
                onDeleteMeeting={deleteMeeting}
                onDeleteTask={deleteTask}
                onShowMeetingModal={() => setShowMeetingModal(true)}
                onShowTaskModal={() => setShowTaskModal(true)}
                onClickMeeting={setExpandedMeeting}
              />
              <DailyTimeline selectedDate={selectedDate} selectedDateLabel={selectedDateLabel} meetings={selectedEvents.meetings} tasks={selectedEvents.tasks} />
              <DailyNotes selectedDate={selectedDate} selectedDateLabel={selectedDateLabel} note={getNote(selectedDate)} onNoteChange={setNote} />
              <UpcomingMeetings meetings={upcomingMeetings} onSelectDate={setSelectedDate} />
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* TAB 3: KANBAN (TASK DESK)        */}
        {/* ============================== */}
        {activeTab === 'kanban' && (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <StatsBar totalTasks={totalTasks} doneTasks={doneTasks} highPriorityPending={highPriorityPending} overdueTasks={overdueTasks} />
            <OverdueAlerts onExpandTask={setExpandedTask} />
            <AllTasksOverview
              tasks={tasks}
              doneTasks={doneTasks}
              totalTasks={totalTasks}
              todayStr={todayStr}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onExpand={setExpandedTask}
            />
          </div>
        )}

        {/* ============================== */}
        {/* TAB 4: KNOWLEDGE BASE          */}
        {/* ============================== */}
        {activeTab === 'knowledge' && (
          <div style={{ padding: '0 20px' }}>
            <BrainLearnedBlock />
          </div>
        )}
      </div>

      <CeoFooter />

      {/* Modals */}
      {showMeetingModal && (
        <AddMeetingModal
          onClose={() => setShowMeetingModal(false)}
          onAdd={addMeeting}
          defaultDate={selectedDate}
        />
      )}
      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          onAdd={addTask}
          defaultDate={selectedDate}
        />
      )}
      {showProtocolSync && (
        <ProtocolSyncModal
          meetings={meetings}
          tasks={tasks}
          onAdd={addTask}
          onClose={() => setShowProtocolSync(false)}
        />
      )}
      {expandedTask && (
        <TaskDetailPanel
          task={expandedTask}
          onClose={() => setExpandedTask(null)}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onNavigate={(path) => { setExpandedTask(null); navigate(path); }}
          onUpdateTask={updateTask}
          onUpdateSubTask={(taskId, subIdx) => {
            toggleSubTask(taskId, subIdx);
            setExpandedTask(prev => {
              if (!prev || prev.id !== taskId || !prev.subTasks) return prev;
              const updated = prev.subTasks.map((s, i) => i === subIdx ? { ...s, done: !s.done } : s);
              return { ...prev, subTasks: updated };
            });
          }}
        />
      )}
      {expandedMeeting && (
        <MeetingDetailPanel
          meeting={expandedMeeting}
          tasks={tasks}
          onClose={() => setExpandedMeeting(null)}
          onNavigate={(path) => { setExpandedMeeting(null); navigate(path); }}
        />
      )}
    </div>
  );
}

// #region Components
function TabButton({ id, label, icon, activeTab, onClick }: {
  id: any, label: string, icon: React.ReactNode, activeTab: string, onClick: (id: any) => void
}) {
  const active = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px', borderRadius: 24, border: 'none',
        background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
        color: active ? '#60a5fa' : '#94a3b8',
        fontSize: '0.9rem', fontWeight: active ? 700 : 500,
        fontFamily: 'Heebo, sans-serif', cursor: 'pointer',
        transition: 'all 0.2s', whiteSpace: 'nowrap',
        boxShadow: active ? '0 0 0 1px rgba(59,130,246,0.5)' : '0 0 0 1px rgba(255,255,255,0.1)'
      }}
    >
      {icon} {label}
    </button>
  );
}
// #endregion
