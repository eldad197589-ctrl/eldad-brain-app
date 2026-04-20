// ==========================================
// FILE: accounting-core-run-summary.tsx
// PURPOSE: Read-only presentational component to display file intake result limits.
// DEPENDENCIES: React, FileIntakeResult
// ==========================================

import React from 'react';
import { FileIntakeResult } from '../accounting-core-file-intake-controller';

export interface AccountingCoreRunSummaryProps {
  result: FileIntakeResult;
}

export function AccountingCoreRunSummary({ result }: AccountingCoreRunSummaryProps) {
  const isSuccess = result.is_success;

  return (
    <div 
      className={`p-4 rounded-lg mt-6 ${isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} border shadow-sm`}
      data-testid="run-summary-panel"
    >
      <div className="flex items-center mb-3">
        <div className={`w-3 h-3 rounded-full mr-2 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <h3 className={`text-lg font-bold ${isSuccess ? 'text-emerald-900' : 'text-rose-900'}`}>
          {isSuccess ? 'Sync Run Successful' : 'Sync Run Blocked / Failed'}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
        <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Processed</div>
          <div className="text-xl font-bold text-slate-800" data-testid="summary-total">
            {result.synced_count + result.rejected_count}
          </div>
        </div>

        <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Synced Records</div>
          <div className="text-xl font-bold text-emerald-600" data-testid="summary-synced">
            {result.synced_count}
          </div>
        </div>

        <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Blocked / Rejected</div>
          <div className="text-xl font-bold text-rose-600" data-testid="summary-rejected">
            {result.rejected_count}
          </div>
        </div>

        <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Batch ID</div>
          <div className="text-sm font-mono truncate text-slate-600 mt-1" data-testid="summary-batch-id" title={result.batch_id || 'None'}>
            {result.batch_id || 'N/A'}
          </div>
        </div>
      </div>

      {result.error_message && (
        <div className="mt-4 p-3 bg-white border border-rose-100 rounded text-rose-700 text-sm font-medium">
          Error Log: {result.error_message}
        </div>
      )}
    </div>
  );
}
