// ==========================================
// FILE: accounting-core-dashboard-nav.tsx
// PURPOSE: Thin presentational navigation for the accounting core dashboard.
// DEPENDENCIES: React
// ==========================================

import React from 'react';

export type DashboardTab = 'INTAKE' | 'REVIEW' | 'VERIFIED';

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export function AccountingCoreDashboardNav({ activeTab, onTabChange }: Props) {
  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'INTAKE', label: '1. Intake & Sync' },
    { id: 'REVIEW', label: '2. Review Queue' },
    { id: 'VERIFIED', label: '3. Verified Work & Analytics' }
  ];

  return (
    <div className="flex border-b border-gray-200">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-6 py-3 text-sm font-medium transition-colors border-b-2
              ${isActive 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
