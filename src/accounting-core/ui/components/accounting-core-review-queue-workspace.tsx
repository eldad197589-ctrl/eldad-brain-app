// ==========================================
// FILE: accounting-core-review-queue-workspace.tsx
// PURPOSE: Root workspace for bridging candidate classifications into human review operations securely.
// DEPENDENCIES: React, AccountingCoreProvider, ReviewQueueList, DecisionPanel
// ==========================================

import React, { useState, useEffect } from 'react';
import { AccountingCoreProvider } from '../accounting-core-react-context';
import { AccountingCoreReviewQueueList } from './accounting-core-review-queue-list';
import { AccountingCoreReviewDecisionPanel } from './accounting-core-review-decision-panel';
import { useAccountingCoreRuntime } from '../use-accounting-core-runtime';
import { ClassificationResult, ClassificationStatus } from '../../types/accounting-core-types';
import { ReviewerDecision } from '../../services/review-resolution-service';

function ReviewQueueWorkspaceContent() {
  const runtime = useAccountingCoreRuntime();
  const [candidates, setCandidates] = useState<ClassificationResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string, isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  // The targeted client ID would normally be routing-bound; statically mocking here 
  // as in the intake flow to emulate isolated boundary verification.
  const ACTOR_ID = 'user_eldad_admin';

  const loadQueue = () => {
    // In production this might be queried across all clients, but repo boundary
    // listByClient maintains segregation safely.
    const allItems = runtime.repositories.classificationResult.listByClient('test_client_id');
    const pending = allItems.filter(c => c.classification_status === ClassificationStatus.NEEDS_REVIEW);
    setCandidates(pending);
  };

  // Initial load
  useEffect(() => {
    loadQueue();
    // In a real app we might rely on global state update subscriptions,
    // but the instruction says "query... using safe read paths" reactively.
  }, [runtime]);

  const handleDecisionSubmit = (decision: ReviewerDecision) => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = runtime.useCases.runReviewResolution.execute({
        actor_id: ACTOR_ID,
        decisions: [decision]
      });

      if (result.is_success) {
        setFeedback({ message: `Successfully committed ${decision.action} decision.`, isError: false });
        setSelectedId(null);
        loadQueue(); // Refresh queue post-decision
      } else {
        setFeedback({ message: result.error_message || 'Transaction blocked by runtime.', isError: true });
      }
    } catch (e: any) {
      setFeedback({ message: e.message || 'Execution error.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const selectedClassification = candidates.find(c => c.id === selectedId) || null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in" data-testid="review-queue-workspace">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Accounting Core: Review Queue</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-3xl">
          Human classification decision boundary. Items below have triggered confidence limits or explicit logic contradiction flags requiring human approval.
        </p>
      </header>

      {feedback && (
        <div className={`mb-6 p-4 rounded border font-medium ${feedback.isError ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`} data-testid="feedback-panel">
          {feedback.message}
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <AccountingCoreReviewQueueList 
            candidates={candidates} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
        </div>
        <div className="md:col-span-2">
          <AccountingCoreReviewDecisionPanel 
            classification={selectedClassification}
            actorId={ACTOR_ID}
            onSubmitDecision={handleDecisionSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default function AccountingCoreReviewQueueWorkspace() {
  return (
    // Isolate execution bounds for the human resolution queue
    <AccountingCoreProvider>
      <ReviewQueueWorkspaceContent />
    </AccountingCoreProvider>
  );
}
