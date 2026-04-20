// ==========================================
// FILE: accounting-core-review-decision-panel.tsx
// PURPOSE: Form boundary capturing explicit human reviewer decisions for classification proposals.
// DEPENDENCIES: React, ReviewerDecision
// ==========================================

import React, { useState } from 'react';
import { ClassificationResult } from '../../types/accounting-core-types';
import { ReviewerDecision } from '../../services/review-resolution-service';

export interface AccountingCoreReviewDecisionPanelProps {
  classification: ClassificationResult | null;
  actorId: string;
  onSubmitDecision: (decision: ReviewerDecision) => void;
  loading?: boolean;
}

export function AccountingCoreReviewDecisionPanel({ classification, actorId, onSubmitDecision, loading = false }: AccountingCoreReviewDecisionPanelProps) {
  const [reason, setReason] = useState<string>('');
  const [overrideComponent, setOverrideComponent] = useState<string>('');

  if (!classification) {
    return (
      <div className="p-6 bg-slate-50 border rounded-lg text-center text-slate-400 mt-6" data-testid="decision-panel-empty">
        Select an item from the queue to review.
      </div>
    );
  }

  const handleSubmit = (action: 'APPROVE' | 'REJECT' | 'RECLASSIFY') => {
    onSubmitDecision({
      classification_result_id: classification.id,
      action,
      override_component_if_reclassify: action === 'RECLASSIFY' ? overrideComponent : undefined,
      reason: reason.trim() || `Human reviewer explicit ${action.toLowerCase()}`,
      reviewer_actor_id: actorId,
      rule_assisted: false // By definition from this UI, it is an explicit human boundary.
    });
    
    // Clear form explicitly after submission hook invokes
    setReason('');
    setOverrideComponent('');
  };

  return (
    <div className="p-6 bg-white border shadow-sm rounded-lg mt-6" data-testid="decision-panel">
      <h3 className="text-xl font-bold text-slate-800 mb-1">Queue Review Decision</h3>
      <div className="text-sm text-slate-500 mb-6 font-mono">Proposal: {classification.id}</div>
      
      <div className="mb-6 grid gap-4 p-4 bg-slate-50 border rounded">
        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Action</span>
          <span className="font-bold text-slate-800">{classification.proposed_accounting_component}</span>
        </div>
        {classification.review_reason_if_needed && (
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">System Review Prompt</span>
            <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded text-sm block">
              {classification.review_reason_if_needed}
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-1">Change Component (Only for RECLASSIFY)</label>
        <input 
          type="text" 
          value={overrideComponent}
          onChange={(e) => setOverrideComponent(e.target.value)}
          disabled={loading}
          placeholder="e.g. Code_501_Software_Expense"
          className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
          data-testid="reclassify-input"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1">Reason / Justification</label>
        <textarea 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          rows={2}
          placeholder="Required for rejections or overrides..."
          className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
          data-testid="reason-input"
        />
      </div>

      <div className="flex gap-3">
        <button 
          type="button"
          disabled={loading}
          onClick={() => handleSubmit('APPROVE')}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
          data-testid="btn-approve"
        >
          APPROVE PREDICTION
        </button>
        <button 
          type="button"
          disabled={loading || !overrideComponent.trim()}
          onClick={() => handleSubmit('RECLASSIFY')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
          data-testid="btn-reclassify"
        >
          RECLASSIFY
        </button>
        <button 
          type="button"
          disabled={loading}
          onClick={() => handleSubmit('REJECT')}
          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
          data-testid="btn-reject"
        >
          REJECT / BLOCK
        </button>
      </div>
    </div>
  );
}
