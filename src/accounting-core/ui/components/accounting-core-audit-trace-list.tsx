// ==========================================
// FILE: accounting-core-audit-trace-list.tsx
// PURPOSE: Read-only presentational list mapping over immutable core audit traces.
// DEPENDENCIES: React, ImmutableAuditTraceRecord
// ==========================================

import React from 'react';
import { ImmutableAuditTraceRecord } from '../../types/accounting-core-types';

export interface AccountingCoreAuditTraceListProps {
  traces: ImmutableAuditTraceRecord[];
}

export function AccountingCoreAuditTraceList({ traces }: AccountingCoreAuditTraceListProps) {
  if (!traces || traces.length === 0) {
    return (
      <div className="mt-8 p-6 text-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
        <p className="text-slate-500 font-medium">No audit traces recorded in this session.</p>
        <p className="text-slate-400 text-sm mt-1">Traces will appear here once the persistence engine records boundaries.</p>
      </div>
    );
  }

  // Sort traces to show the most recent at the top
  const sortedTraces = [...traces].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="mt-8" data-testid="audit-trace-list">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Live Audit Log ({traces.length} entries)
      </h3>
      
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden overflow-x-auto max-h-96 overflow-y-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">T. Type</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Message / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTraces.map((trace) => (
              <tr key={trace.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {new Date(trace.created_at).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {trace.service_name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {trace.target_object_type}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">
                    {trace.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-md truncate" title={trace.reason_code ? `[${trace.reason_code}] ${trace.free_text_reason}` : trace.free_text_reason}>
                  {trace.reason_code && <span className="font-mono text-xs mr-2 border px-1 rounded bg-slate-50">{trace.reason_code}</span>}
                  {trace.free_text_reason || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
