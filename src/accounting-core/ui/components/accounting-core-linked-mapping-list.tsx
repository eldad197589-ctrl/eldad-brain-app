// ==========================================
// FILE: accounting-core-linked-mapping-list.tsx
// PURPOSE: Read-only array renderer for Client Case Mappings.
// DEPENDENCIES: React, ClientCaseMapping type
// ==========================================

import React from 'react';
import { ClientCaseMapping } from '../../types/accounting-core-types';

interface Props {
  mappings: ClientCaseMapping[];
}

export function AccountingCoreLinkedMappingList({ mappings }: Props) {
  if (mappings.length === 0) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded text-gray-500 text-center">
        No linked mappings available.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-semibold text-gray-700 text-sm mb-1">Linked Client Mappings</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50 font-medium text-xs text-gray-500 uppercase tracking-wider text-left">
            <tr>
              <th className="py-2 px-3 border-b text-right">Mapping ID</th>
              <th className="py-2 px-3 border-b text-right">Client ID</th>
              <th className="py-2 px-3 border-b text-right">Period</th>
              <th className="py-2 px-3 border-b text-right">Component</th>
              <th className="py-2 px-3 border-b text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {mappings.map((map) => (
              <tr key={map.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 text-gray-600 font-mono text-xs">{map.id.slice(0, 8)}...</td>
                <td className="py-2 px-3 text-gray-700">{map.linked_client_id}</td>
                <td className="py-2 px-3 text-gray-700">{map.linked_accounting_period_id}</td>
                <td className="py-2 px-3 font-semibold text-gray-800">{map.linked_accounting_component_id}</td>
                <td className="py-2 px-3 font-medium text-emerald-600">
                  {map.mapping_status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
