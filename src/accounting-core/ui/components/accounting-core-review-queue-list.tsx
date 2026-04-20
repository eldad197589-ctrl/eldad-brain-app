// ==========================================
// FILE: accounting-core-review-queue-list.tsx
// PURPOSE: Thin read-only presentational list showing provisional classifications awaiting human review.
// DEPENDENCIES: React, ClassificationResult
// ==========================================

import React from 'react';
import { ClassificationResult, ClassificationStatus } from '../../types/accounting-core-types';

export interface AccountingCoreReviewQueueListProps {
  candidates: ClassificationResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AccountingCoreReviewQueueList({ candidates, selectedId, onSelect }: AccountingCoreReviewQueueListProps) {
  if (candidates.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-lg">
        <h3 className="text-slate-600 font-medium">Review Queue is Empty</h3>
        <p className="text-slate-400 text-sm mt-1">All provisional classifications have been resolved or pending intake execution.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden" data-testid="review-queue-list">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
          <tr>
            <th className="px-4 py-3">Proposal ID</th>
            <th className="px-4 py-3">Proposed Component</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Contradictions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <tr 
                key={item.id} 
                onClick={() => onSelect(item.id)}
                className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                data-testid={`queue-item-${item.id}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-500 truncate max-w-[120px]">
                  {item.id}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.proposed_accounting_component}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.classification_confidence >= 0.8 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {Math.round(item.classification_confidence * 100)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">
                    {item.classification_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-rose-600 text-xs">
                  {item.contradiction_flags_if_any && item.contradiction_flags_if_any.length > 0 
                    ? item.contradiction_flags_if_any.join(', ') 
                    : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
