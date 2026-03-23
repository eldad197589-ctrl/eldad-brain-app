/* ============================================
   FILE: hooks.ts
   PURPOSE: Custom React hooks (data, computed values)
   DEPENDENCIES: react
   EXPORTS: useDashboardStats
   ============================================ */
/**
 * FILE: hooks.ts
 * PURPOSE: Dashboard computed statistics — static neurons + live brainStore data
 * DEPENDENCIES: neurons data, brainStore
 */
import { useMemo } from 'react';
import { NEURONS, PENDING } from '../../data/neurons';
import { useBrainStore } from '../../store/brainStore';

/** Computed dashboard statistics (static + live) */
export function useDashboardStats() {
  const tasks = useBrainStore((s) => s.tasks);
  const meetings = useBrainStore((s) => s.meetings);
  const documents = useBrainStore((s) => s.documents);
  const knowledgeLog = useBrainStore((s) => s.knowledgeLog);

  return useMemo(() => {
    // Static neuron data
    const neuronCount = NEURONS.length;
    const flowchartCount = NEURONS.reduce((acc, n) => acc + n.links.filter(l => l.type === 'flowchart').length, 0);
    const builtCount = NEURONS.filter(n => n.buildStatus === 'built').length;
    const inProgressCount = NEURONS.filter(n => n.buildStatus === 'in-progress').length;
    const pendingCount = NEURONS.filter(n => n.buildStatus === 'pending').length;
    const pendingProcesses = PENDING.length;

    // Live brainStore data
    const totalTasks = tasks.length;
    const openTasks = tasks.filter(t => t.status !== 'done').length;
    const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const todayMeetings = meetings.filter(m => {
      const today = new Date().toISOString().slice(0, 10);
      return m.date === today;
    }).length;
    const pendingDocs = documents.filter(d => d.status === 'pending').length;
    const totalDocs = documents.length;
    const knowledgeCount = knowledgeLog.length;

    return {
      neuronCount, flowchartCount, builtCount, inProgressCount, pendingCount, pendingProcesses,
      totalTasks, openTasks, overdueTasks, todayMeetings, pendingDocs, totalDocs, knowledgeCount,
    };
  }, [tasks, meetings, documents, knowledgeLog]);
}
