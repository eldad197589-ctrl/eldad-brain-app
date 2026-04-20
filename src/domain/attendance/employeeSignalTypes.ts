/* ============================================
   FILE: employeeSignalTypes.ts
   PURPOSE: Shared type definitions for employee signals from external systems
   DEPENDENCIES: none (pure types)
   EXPORTS: EmployeeSignalName, EmployeeSignal
   ============================================ */

// #region Types

/** The 6 approved employee signal names */
export type EmployeeSignalName =
  | 'form101_approved'
  | 'form130_uploaded'
  | 'employment_agreement_signed'
  | 'attendance_calculated'
  | 'employee_deactivated'
  | 'missing_documents';

/**
 * EmployeeSignal — uniform shape for signals from external employee systems.
 * Pure data. No side effects. No API dependency.
 *
 * Identity link: employeeIdNumber === ClientEntity.idNumber
 */
export interface EmployeeSignal {
  /** Unique signal ID */
  id: string;
  /** Signal type — one of the 6 approved signals */
  signalName: EmployeeSignalName;
  /** ת.ז. — the shared identity key */
  employeeIdNumber: string;
  /** Employee display name (for rendering) */
  employeeName: string;
  /** When the event occurred (ISO string) */
  occurredAt: string;
  /** Severity — determines rendering */
  severity: 'info' | 'success' | 'warn' | 'critical';
  /** Optional signal-specific payload */
  payload?: {
    /** For missing_documents: which docs are missing */
    missingDocIds?: string[];
    /** For attendance_calculated: month/year */
    period?: { year: number; month: number };
    /** For deactivated: reason */
    reason?: string;
    /** Employee count for aggregated signals */
    count?: number;
  };
  /** Has this signal been dismissed/acknowledged */
  acknowledged: boolean;
}

// #endregion
