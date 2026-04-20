// ==========================================
// FILE: accounting-core-dashboard-workspace.tsx
// PURPOSE: Root functional shell orchestrating all 3 core lifecycle phases (Intake -> Review -> Verified).
// DEPENDENCIES: React, Child Workspaces
// ==========================================

import React, { useState } from 'react';
import { AccountingCoreDashboardNav, DashboardTab } from './accounting-core-dashboard-nav';
import AccountingCoreIntakeWorkspace from './accounting-core-intake-workspace';
import AccountingCoreReviewQueueWorkspace from './accounting-core-review-queue-workspace';
import AccountingCoreVerifiedWorkWorkspace from './accounting-core-verified-work-workspace';

import { useAccountingCoreSession } from '../use-accounting-core-session';
import { AccountingCoreSessionShell } from './accounting-core-session-shell';

export function AccountingCoreDashboardWorkspaceContent() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('INTAKE');
  const { session } = useAccountingCoreSession();

  return (
    <div className="flex flex-col h-full bg-gray-50 border border-gray-300 rounded-xl overflow-hidden shadow-sm rtl" dir="rtl">
      
      {/* Header Container */}
      <div className="bg-white px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Accounting Core Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Lifecycle Orchestration: Synchronization, Review, and Verification Bounds</p>
        </div>
        <div className="flex flex-col items-end text-xs font-mono text-slate-400 bg-slate-50 p-2 rounded hidden lg:flex">
          <span>Client Dashboard View</span>
        </div>
      </div>

      {/* Navigation Area */}
      <div className="bg-white">
        <AccountingCoreDashboardNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      {/* Workspace Host Mount */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {activeTab === 'INTAKE' && (
          <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
             <AccountingCoreIntakeWorkspace />
          </div>
        )}
        
        {activeTab === 'REVIEW' && (
          <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
             <AccountingCoreReviewQueueWorkspace />
          </div>
        )}

        {activeTab === 'VERIFIED' && (
          <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
             <AccountingCoreVerifiedWorkWorkspace 
                clientId={session.clientId} 
                accountingPeriodId={session.accountingPeriodId} 
             />
          </div>
        )}
      </div>

    </div>
  );
}

export default function AccountingCoreDashboardWorkspace() {
  return (
    <AccountingCoreSessionShell>
      <AccountingCoreDashboardWorkspaceContent />
    </AccountingCoreSessionShell>
  );
}
