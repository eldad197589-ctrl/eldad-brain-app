// ==========================================
// FILE: accounting-core-intake-workspace.tsx
// PURPOSE: Root wrapper that bootstraps the accounting core contexts and mounts the intake panel purely.
// DEPENDENCIES: React, AccountingCoreProvider, AccountingCoreFileIntakePanel, Summary/Audit Views
// ==========================================

import React, { useState } from 'react';
import { AccountingCoreProvider } from '../accounting-core-react-context';
import { AccountingCoreFileIntakePanel } from './accounting-core-file-intake-panel';
import { AccountingCoreRunSummary } from './accounting-core-run-summary';
import { AccountingCoreAuditTraceList } from './accounting-core-audit-trace-list';
import { useAccountingCoreRuntime } from '../use-accounting-core-runtime';
import { FileIntakeResult } from '../accounting-core-file-intake-controller';
import { ImmutableAuditTraceRecord } from '../../types/accounting-core-types';

/**
 * Inner boundary element that has Context access so we can pull runtime.
 */
function IntakeWorkspaceContent() {
  const runtime = useAccountingCoreRuntime();
  const [result, setResult] = useState<FileIntakeResult | null>(null);
  const [traces, setTraces] = useState<ImmutableAuditTraceRecord[]>([]);

  const handleIntakeComplete = (intakeResult: FileIntakeResult) => {
    setResult(intakeResult);
    // Explicitly query the append-only service for this user context
    setTraces(runtime.services.auditTrace.getTracesByActor('user_eldad_admin'));
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in" data-testid="accounting-core-workspace">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Accounting Core</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-3xl">
          Data Lake Intake Module — Select documents to initialize into the core runtime.
          All items are synced securely through the offline-first orchestrator.
        </p>
      </header>

      <section className="bg-slate-50 rounded-lg p-6 border shadow-sm mb-6">
        {/* Default testing identity provided for runtime boundary traversal */}
        <AccountingCoreFileIntakePanel 
           actorId="user_eldad_admin" 
           sourceMachineId="local_browser_workspace" 
           onIntakeComplete={handleIntakeComplete}
        />
      </section>

      {/* Observability Boundary - Strictly reactive to output limits */}
      {result && <AccountingCoreRunSummary result={result} />}
      <AccountingCoreAuditTraceList traces={traces} />
    </div>
  );
}

export default function AccountingCoreIntakeWorkspace() {
  return (
    // Scoped provider mounting to strictly isolate core logic initialization only when this module is open
    <AccountingCoreProvider>
      <IntakeWorkspaceContent />
    </AccountingCoreProvider>
  );
}
