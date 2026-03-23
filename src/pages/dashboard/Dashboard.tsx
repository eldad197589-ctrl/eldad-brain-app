/* ============================================
   FILE: Dashboard.tsx
   PURPOSE: Dashboard component
   DEPENDENCIES: react
   EXPORTS: Dashboard (default)
   ============================================ */
/**
 * Dashboard — Orchestrator (Layout Wrapper)
 *
 * Composes BrainView, CategoriesView, and ListView into a tabbed layout.
 */
import { useState } from 'react';
import NeuronPanel from '../../components/NeuronPanel';
import type { ViewMode, Neuron } from './types';
import { useDashboardStats } from './hooks';

import ViewToggle from './components/ViewToggle';
import BrainView from './components/BrainView';
import CategoriesView from './components/CategoriesView';
import ListView from './components/ListView';
import LiveStatsBar from './components/LiveStatsBar';

export default function Dashboard() {
  const [view, setView] = useState<ViewMode>('categories');
  const [selectedNeuron, setSelectedNeuron] = useState<Neuron | null>(null);
  const stats = useDashboardStats();

  return (
    <div>
      <LiveStatsBar
        openTasks={stats.openTasks}
        overdueTasks={stats.overdueTasks}
        todayMeetings={stats.todayMeetings}
        pendingDocs={stats.pendingDocs}
        knowledgeCount={stats.knowledgeCount}
      />
      <ViewToggle view={view} onViewChange={setView} />

      {view === 'brain' && (
        <BrainView
          neuronCount={stats.neuronCount}
          flowchartCount={stats.flowchartCount}
          onNeuronClick={setSelectedNeuron}
        />
      )}

      {view === 'categories' && (
        <CategoriesView
          neuronCount={stats.neuronCount}
          flowchartCount={stats.flowchartCount}
          builtCount={stats.builtCount}
          inProgressCount={stats.inProgressCount}
          pendingCount={stats.pendingCount}
          onNeuronClick={setSelectedNeuron}
        />
      )}

      {view === 'list' && (
        <ListView
          neuronCount={stats.neuronCount}
          flowchartCount={stats.flowchartCount}
        />
      )}

      <NeuronPanel neuron={selectedNeuron} onClose={() => setSelectedNeuron(null)} />
    </div>
  );
}
