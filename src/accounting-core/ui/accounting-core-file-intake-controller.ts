// ==========================================
// FILE: accounting-core-file-intake-controller.ts
// PURPOSE: A thin non-UI React-agnostic helper connecting raw browser files to the core engine.
// DEPENDENCIES: AccountingCoreRuntime, browser-file-input-adapter
// ==========================================

import { AccountingCoreRuntime } from '../runtime/accounting-core-runtime';
import { convertBrowserFilesToSyncInputs } from '../adapters/browser-file-input-adapter';

export interface FileIntakeResult {
  is_success: boolean;
  rejected_count: number;
  synced_count: number;
  batch_id?: string;
  error_message?: string;
}

/**
 * THIN UI CONTROLLER: File Intake
 * Responsibility: Maps UI-side DOM File events to the backend folder-sync ingestion capability.
 * Follows strict architecture bounds:
 * - NO business logic or threshold calculation
 * - NO UI rendering logic or state assignment
 * - NO direct DB/LocalStorage persistence calls
 * Just a pipeline wiring function throwing payloads to the backend useCases.
 */
export class AccountingCoreFileIntakeController {
  
  constructor(private runtime: AccountingCoreRuntime) {}

  /**
   * Translates DOM files natively into the first phase of the core pipeline.
   * Does NOT auto-trigger extraction or classification (leaving pure state control).
   */
  public handleFiles(files: File[], actorId: string, sourceMachineId: string): FileIntakeResult {
    try {
      // 1. Send straight to isolated adapter for browser->core conversion
      const { validSyncInputs, rejectedFiles } = convertBrowserFilesToSyncInputs(files);
      
      // 2. Early return if nothing passes the whitelist boundary
      if (validSyncInputs.length === 0) {
        return {
          is_success: false,
          rejected_count: rejectedFiles.length,
          synced_count: 0,
          error_message: rejectedFiles.length > 0 
             ? `All ${rejectedFiles.length} files were blocked by adapter rules.`
             : 'No files provided.'
        };
      }

      // 3. Delegate directly into the Orchestrator use-case
      const syncResult = this.runtime.useCases.runFolderSync.execute({
        actor_id: actorId,
        source_machine_reference: sourceMachineId,
        root_path: 'browser-upload-root://',
        client_folder_path: 'browser-upload-client://',
        files: validSyncInputs,
        existing_global_hashes: new Set<string>() // Emulating fresh upload state
      });

      // 4. Return structural mapping for the view to digest and render independently
      return {
        is_success: syncResult.is_success,
        rejected_count: rejectedFiles.length,
        synced_count: syncResult.records_synced,
        batch_id: syncResult.batch?.id,
        error_message: syncResult.error_message
      };
      
    } catch (e: any) {
      return {
        is_success: false,
        rejected_count: files.length,
        synced_count: 0,
        error_message: `Intake execution failed: ${e.message}`
      };
    }
  }
}
