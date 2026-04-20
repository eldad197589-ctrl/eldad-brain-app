// ==========================================
// FILE: index.ts
// PURPOSE: Main module boundary for the Accounting Core.
// Exports shared domain types and the 8 operational core services.
// ==========================================

// 1. Shared Types & Enums
export * from './types/accounting-core-types';

// 2. The 8 Core Backend Services
export * from './services/folder-sync-ingestion-service';
export * from './services/document-intake-service';
export * from './services/field-extraction-service';
export * from './services/classification-service';
export * from './services/review-resolution-service';
export * from './services/client-case-mapping-service';
export * from './services/derived-analytics-service';
export * from './services/audit-trace-service';

// 3. Repository Interfaces
export * from './repositories/repository-interfaces';

// 4. In-Memory Repository Implementations
export * from './repositories/in-memory-folder-sync-batch-repository';
export * from './repositories/in-memory-synced-file-record-repository';
export * from './repositories/in-memory-document-intake-repository';
export * from './repositories/in-memory-extracted-field-set-repository';
export * from './repositories/in-memory-classification-result-repository';
export * from './repositories/in-memory-resolution-result-repository';
export * from './repositories/in-memory-client-case-mapping-repository';
export * from './repositories/in-memory-derived-view-repository';
export * from './repositories/in-memory-audit-trace-repository';

// 5. Orchestration Use Cases
export * from './use-cases/run-folder-sync-process';
export * from './use-cases/run-document-intake-process';
export * from './use-cases/run-field-extraction-process';
export * from './use-cases/run-classification-process';
export * from './use-cases/run-review-resolution-process';
export * from './use-cases/run-client-case-mapping-process';
export * from './use-cases/run-derived-analytics-process';
export * from './use-cases/record-audit-trace-process';

// 6. File-Based (localStorage) Persistence Implementations
export * from './persistence/local-persistence-paths';
export * from './persistence/local-storage-base-repository';
export * from './persistence/file-based-folder-sync-batch-repository';
export * from './persistence/file-based-synced-file-record-repository';
export * from './persistence/file-based-document-intake-repository';
export * from './persistence/file-based-extracted-field-set-repository';
export * from './persistence/file-based-classification-result-repository';
export * from './persistence/file-based-resolution-result-repository';
export * from './persistence/file-based-client-case-mapping-repository';
export * from './persistence/file-based-derived-view-repository';
export * from './persistence/file-based-audit-trace-repository';

// 7. Core Runtime Assembly
export * from './runtime/accounting-core-runtime';
export * from './runtime/accounting-core-runtime-factory';

// 8. Adapters
export * from './adapters/browser-file-input-adapter';

// 9. Thin UI Wiring Layer
export * from './ui/accounting-core-file-intake-controller';
// IMPORTANT: We do not blanket-export .tsx React files from the core index 
// to prevent cross-contamination in strict backend module imports.
// React contexts and hooks should be explicitly imported from './ui/...'
