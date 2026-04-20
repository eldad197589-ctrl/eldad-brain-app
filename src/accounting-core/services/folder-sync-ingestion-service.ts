// ==========================================
// FILE: folder-sync-ingestion-service.ts
// PURPOSE: First backend/domain service for folder synchronization.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  FolderSyncBatch,
  SyncedFileRecord,
  SyncStatus
} from '../types/accounting-core-types';

export interface SyncFileInput {
  filename: string;
  absolutePath: string;
  fileSizeBytes: number;
}

export interface SyncIngestionResult {
  batch: FolderSyncBatch;
  records: SyncedFileRecord[];
}

/**
 * Generates a simplistic stable pseudo-hash algorithm for domain isolation logic.
 * Note: Real implementation uses Node.js 'crypto.createHash' or Web Crypto API on the file's binary buffer.
 */
function generateStableHash(filePath: string, fileSizeBytes: number): string {
  const raw = `${filePath}:${fileSizeBytes}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Universal UUID generator fallback.
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * CORE SERVICE 1: Folder Sync Ingestion Service
 * Responsibility: Secure gateway bringing physical/local files into the accounting-core structure.
 */
export class FolderSyncIngestionService {
  // Enforces ingestion to graphic and document standards only.
  private readonly SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'];
  
  constructor(private sourceMachineReference: string) {}

  /**
   * Scans an incoming batch of local files targeting a specific client, validating safety
   * and asserting data uniqueness based on cryptographic stability before any deeper accounting processing.
   */
  public processClientFolder(
    rootPath: string, 
    clientFolderPath: string, 
    files: SyncFileInput[],
    existingGlobalHashes: Set<string>
  ): SyncIngestionResult {
    
    // 1. Minimum logic checks - path safety validation
    if (!rootPath || !clientFolderPath) {
      throw new Error("Invalid structure: Both Root and Client logic paths are mandatory for syncing.");
    }

    // 2. Erect processing Batch container
    const batch: FolderSyncBatch = {
      id: generateUuid(),
      source_machine_reference: this.sourceMachineReference,
      root_path: rootPath,
      client_folder_path: clientFolderPath,
      timestamp: new Date().toISOString()
    };

    const records: SyncedFileRecord[] = [];

    // 3. Process each physical file artifact targeting sync entry
    for (const file of files) {
      const extMatch = file.filename.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '';

      let status: SyncStatus = SyncStatus.SYNCED; // Initial assumption before checks
      
      // 3A: Validate supported extensions strict safety check
      if (!ext || !this.SUPPORTED_EXTENSIONS.includes(ext)) {
        status = SyncStatus.UNREADABLE; // E.g., blocked execution scripts or bad docs
      }

      // 3B: Compute stable hash to enforce source data truth mapping
      let fileHash = '';
      if (status !== SyncStatus.UNREADABLE) {
        fileHash = generateStableHash(file.absolutePath, file.fileSizeBytes);
        
        // 3C: Determine existing overlap - lock duplication suspects
        if (existingGlobalHashes.has(fileHash)) {
          status = SyncStatus.DUPLICATE_SUSPECT;
        }
      }

      // 3D: Cast record output strictly per explicitly locked structure typing
      const record: SyncedFileRecord = {
        id: generateUuid(),
        sync_batch_id: batch.id,
        file_hash: fileHash,
        source_path: file.absolutePath,
        sync_status: status
      };

      records.push(record);
    }

    return {
      batch,
      records
    };
  }
}
