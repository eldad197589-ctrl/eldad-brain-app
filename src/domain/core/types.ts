/* ============================================
   FILE: types.ts
   PURPOSE: Core domain types for decisions and rules
   DEPENDENCIES: none
   EXPORTS: DomainIssue, DomainAction, DomainResult, ConfidenceLevel
   ============================================ */
/**
 * Core type for anything the Domain Engine produces.
 * NO AI INVOLVED. Pure conditional typed logic.
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DomainIssue {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DomainAction {
  type: string;
  payload?: Record<string, unknown>;
  description: string;
}

export interface DomainResult<T = string> {
  type: T;
  issues: DomainIssue[];
  actions: DomainAction[];
  confidence: ConfidenceLevel;
}
