// ==========================================
// FILE: accounting-core-file-intake-panel.tsx
// PURPOSE: First working React UI component for triggering the accounting-core file intake flow.
// DEPENDENCIES: React, AccountingCoreFileIntakeController, useAccountingCoreRuntime
// ==========================================

import React, { useState } from 'react';
import { useAccountingCoreRuntime } from '../use-accounting-core-runtime';
import { AccountingCoreFileIntakeController, FileIntakeResult } from '../accounting-core-file-intake-controller';

export interface AccountingCoreFileIntakePanelProps {
  actorId: string;
  sourceMachineId: string;
  onIntakeComplete?: (result: FileIntakeResult) => void;
}

export function AccountingCoreFileIntakePanel({ actorId, sourceMachineId, onIntakeComplete }: AccountingCoreFileIntakePanelProps) {
  const runtime = useAccountingCoreRuntime();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);

    try {
      // Simulate yielding to the browser event loop for the loading state to briefly render
      // Though the controller call is strictly synchronous, uploading and parsing usually feels asynchronous.
      await new Promise(resolve => setTimeout(resolve, 50)); 
      
      const controller = new AccountingCoreFileIntakeController(runtime);
      const intakeResponse = controller.handleFiles(selectedFiles, actorId, sourceMachineId);
      
      if (onIntakeComplete) {
        onIntakeComplete(intakeResponse);
      }
    } catch (error: any) {
      if (onIntakeComplete) {
        onIntakeComplete({
          is_success: false,
          rejected_count: selectedFiles.length,
          synced_count: 0,
          error_message: error.message || 'An unexpected error occurred during processing.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white" data-testid="intake-panel">
      <h2 className="text-xl font-bold mb-4">Accounting Core: Document Intake</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange}
          disabled={loading}
          className="mb-2 block w-full"
          data-testid="file-input"
        />
        
        <div className="text-sm text-gray-500 mb-4">
          Selected files: {selectedFiles.length}
        </div>

        <button 
          type="submit" 
          disabled={loading || selectedFiles.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          data-testid="submit-btn"
        >
          {loading ? 'Processing...' : 'Import to Data Lake'}
        </button>
      </form>
    </div>
  );
}

