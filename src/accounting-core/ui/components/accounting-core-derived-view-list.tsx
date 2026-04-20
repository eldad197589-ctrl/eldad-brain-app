// ==========================================
// FILE: accounting-core-derived-view-list.tsx
// PURPOSE: Read-only array renderer for Derived Views exposing downstream analytics states.
// DEPENDENCIES: React, DerivedView type
// ==========================================

import React from 'react';
import { DerivedView } from '../../types/accounting-core-types';

interface Props {
  views: DerivedView[];
}

export function AccountingCoreDerivedViewList({ views }: Props) {
  if (views.length === 0) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded text-gray-500 text-center">
        No derived views available.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-semibold text-gray-700 text-sm mb-1">Generated Analytics Views</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50 font-medium text-xs text-gray-500 uppercase tracking-wider text-left">
            <tr>
              <th className="py-2 px-3 border-b text-right">View ID</th>
              <th className="py-2 px-3 border-b text-right">Type</th>
              <th className="py-2 px-3 border-b text-right">Status</th>
              <th className="py-2 px-3 border-b text-right text-center">Source Records</th>
              <th className="py-2 px-3 border-b text-right">Traceability Ref</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {views.map((view) => (
              <tr key={view.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 text-gray-600 font-mono text-xs">{view.id.slice(0, 8)}...</td>
                <td className="py-2 px-3 text-gray-800 font-semibold">{view.derived_view_type}</td>
                <td className="py-2 px-3 font-medium text-emerald-600">{view.derived_view_status}</td>
                <td className="py-2 px-3 text-center text-gray-700 font-mono">{view.source_record_count}</td>
                <td className="py-2 px-3 text-gray-500 font-mono text-xs">{view.traceability_index_reference || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
