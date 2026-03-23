/* ============================================
   FILE: index.ts
   PURPOSE: Barrel exports for feature folder
   DEPENDENCIES: None (local only)
   EXPORTS: None
   ============================================ */
/**
 * Documents — Barrel Exports
 *
 * Default export: DocumentsPage orchestrator component (used by React.lazy in main.tsx)
 * Re-exports: Types and hook for potential cross-feature reuse.
 */

/* Default page export — used by main.tsx lazy() import */
export { default } from './DocumentsPage';

/* Hooks — reusable across the app */
export { useDocumentEditor } from './hooks/useDocumentEditor';

/* Types — for consumers that need to work with document data */
export type { LetterCategory, LetterTemplate, LetterField, ViewMode, CategoryId } from './types';
