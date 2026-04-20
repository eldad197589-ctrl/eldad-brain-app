// ==========================================
// FILE: accounting-core-verified-resolution-list.tsx
// PURPOSE: Read-only array renderer for verified resolutions showing the outcome of human review.
// DEPENDENCIES: React, ResolutionResult type
// ==========================================

import React from 'react';
import { ResolutionResult } from '../../types/accounting-core-types';

interface Props {
  resolutions: ResolutionResult[];
}

export function AccountingCoreVerifiedResolutionList({ resolutions }: Props) {
  if (resolutions.length === 0) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded text-gray-500 text-center">
        No verified resolutions available.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-semibold text-gray-700 text-sm mb-1">Verified Classifications</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50 font-medium text-xs text-gray-500 uppercase tracking-wider text-left">
            <tr>
              <th className="py-2 px-3 border-b text-right">Result ID</th>
              <th className="py-2 px-3 border-b text-right">Final Status</th>
              <th className="py-2 px-3 border-b text-right">Accounting Component</th>
              <th className="py-2 px-3 border-b text-right">Override Applied</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {resolutions.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 text-gray-600 font-mono text-xs">{res.id.slice(0, 8)}...</td>
                <td className="py-2 px-3 text-emerald-600 font-medium">{res.final_resolution_status}</td>
                <td className="py-2 px-3 font-semibold text-gray-800">{res.final_accounting_component_if_verified || '—'}</td>
                <td className="py-2 px-3 text-gray-500">
                  {res.override_applied_yes_no ? (
                    <span className="text-amber-600 font-medium">Yes</span>
                  ) : (
                    'No'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
