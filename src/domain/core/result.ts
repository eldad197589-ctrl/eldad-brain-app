/* ============================================
   FILE: result.ts
   PURPOSE: Factories and utilities for Domain Results
   DEPENDENCIES: types.ts
   EXPORTS: createResult, addIssue, addAction
   ============================================ */
import { DomainResult, DomainIssue, DomainAction, ConfidenceLevel } from './types';

// Re-export types
export * from './types';

/**
 * Creates a baseline Domain Result that rules can mutate or expand.
 */
export function createResult<T = string>(initialType: T, confidence: ConfidenceLevel = 'high'): DomainResult<T> {
  return {
    type: initialType,
    issues: [],
    actions: [],
    confidence
  };
}

/** Helper to attach an issue */
export function addIssue<T>(result: DomainResult<T>, issue: DomainIssue): DomainResult<T> {
  result.issues.push(issue);
  return result;
}

/** Helper to attach an action */
export function addAction<T>(result: DomainResult<T>, action: DomainAction): DomainResult<T> {
  result.actions.push(action);
  return result;
}
