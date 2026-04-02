/* ============================================
   FILE: analyzer.ts
   PURPOSE: Extract and parse raw payroll input
   DEPENDENCIES: calculations
   EXPORTS: analyzePayrollData, PayrollData
   ============================================ */
import { calculateGrossPay } from './calculations';

export interface PayrollData {
  employeeId: string;
  totalHours: number;
  hourlyRate: number;
  calculatedGross: number;
}

/**
 * Normalizes raw payroll data before rules are applied.
 */
export function analyzePayrollData(rawPayload: any): PayrollData {
  const hours = Number(rawPayload?.totalHours) || 0;
  const rate = Number(rawPayload?.hourlyRate) || 0;

  return {
    employeeId: String(rawPayload?.employeeId || 'UNKNOWN'),
    totalHours: hours,
    hourlyRate: rate,
    calculatedGross: calculateGrossPay(hours, rate)
  };
}
