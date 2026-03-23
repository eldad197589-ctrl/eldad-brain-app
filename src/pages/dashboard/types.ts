/* ============================================
   FILE: types.ts
   PURPOSE: Domain-specific interfaces and types
   DEPENDENCIES: None (local only)
   EXPORTS: ViewMode
   ============================================ */
/**
 * Dashboard — Types
 */

// #region View Types

/** Available view modes for the dashboard */
export type ViewMode = 'brain' | 'categories' | 'list';

// #endregion

// Re-export Neuron type for convenience
export type { Neuron } from '../../data/neurons';
