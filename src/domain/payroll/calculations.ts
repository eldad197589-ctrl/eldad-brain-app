/* ============================================
   FILE: calculations.ts
   PURPOSE: Deterministic Payroll Calculations
   DEPENDENCIES: none
   EXPORTS: calculateGrossPay, calculateOvertime
   ============================================ */

/**
 * Calculates basic gross pay based on hours and rate.
 */
export function calculateGrossPay(hours: number, rate: number): number {
  if (!hours || !rate) return 0;
  return Number((hours * rate).toFixed(2));
}

/**
 * Calculates standardized overtime pay (Example: 125% and 150%).
 */
export function calculateOvertime(hours: number, rate: number, multiplier: number = 1.25): number {
  if (!hours || !rate) return 0;
  return Number((hours * rate * multiplier).toFixed(2));
}
