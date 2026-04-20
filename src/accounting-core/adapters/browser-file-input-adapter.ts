// ==========================================
// FILE: browser-file-input-adapter.ts
// PURPOSE: Transforms raw browser File objects into accounting core SyncFileInput records.
// DEPENDENCIES: SyncFileInput from folder-sync-ingestion-service
// ==========================================

import { SyncFileInput } from '../services/folder-sync-ingestion-service';

export interface FileAdapterConversionResult {
  validSyncInputs: SyncFileInput[];
  rejectedFiles: {
    originalFilename: string;
    reason: string;
  }[];
}

/**
 * List of allowed extensions to be processed by the accounting core.
 * Everything else is explicitly blocked at the boundary.
 */
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'tiff']);

/**
 * Converts browser File objects into core-compatible SyncFileInput arrays.
 * Extracts metadata and enforces basic boundary integrity (e.g. extension blocking).
 * Requires the standard Web API `File` interface.
 */
export function convertBrowserFilesToSyncInputs(files: File[]): FileAdapterConversionResult {
  const result: FileAdapterConversionResult = {
    validSyncInputs: [],
    rejectedFiles: []
  };

  for (const file of files) {
    const filename = file.name || 'unknown_file';
    
    // 1. Strict extension boundary check
    const extensionParts = filename.split('.');
    const extension = extensionParts.length > 1 
      ? extensionParts.pop()!.toLowerCase() 
      : '';

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      result.rejectedFiles.push({
        originalFilename: filename,
        reason: `Extension '${extension}' is not permitted for accounting input.`
      });
      continue;
    }

    // 2. Extract pathing hint. 
    // webkitRelativePath provides the folder structure if uploaded via directory select.
    // If missing, we fallback to just the filename (e.g., direct file selection).
    const pathHint = (file as any).webkitRelativePath || filename;
    
    // In browser, absolute path doesn't exist securely. We pass the pathHint 
    // as the absolutePath field to maintain source traceability in the core.
    const absolutePath = `browser-upload://${pathHint}`;

    // 3. Assemble and push valid input
    result.validSyncInputs.push({
      filename: filename,
      absolutePath: absolutePath,
      fileSizeBytes: file.size
    });
  }

  return result;
}
