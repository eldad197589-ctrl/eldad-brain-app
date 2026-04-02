/* ============================================
   FILE: rules.ts
   PURPOSE: Payroll Rules and Checks
   DEPENDENCIES: core/result
   EXPORTS: applyPayrollRules
   ============================================ */
import { DomainResult, addIssue, addAction } from '../core/result';
import { PayrollData } from './analyzer';

const MINIMUM_WAGE_PER_HOUR = 30; // Example threshold
const MAX_REGULAR_HOURS_PER_MONTH = 182;

/**
 * Validates payroll data against business and legal rules.
 */
export function applyPayrollRules(
  data: PayrollData,
  result: DomainResult<'payroll_analysis'>
): DomainResult<'payroll_analysis'> {
  
  // Rule 1: Check minimum wage
  if (data.hourlyRate > 0 && data.hourlyRate < MINIMUM_WAGE_PER_HOUR) {
    addIssue(result, {
      code: 'BELOW_MINIMUM_WAGE',
      message: `Hourly rate (${data.hourlyRate}) is below the legal minimum wage (${MINIMUM_WAGE_PER_HOUR}).`,
      severity: 'critical'
    });
    addAction(result, {
      type: 'ALERT_HR',
      description: 'Notify HR immediately regarding below-minimum-wage rate.'
    });
  }

  // Rule 2: Overtime threshold
  if (data.totalHours > MAX_REGULAR_HOURS_PER_MONTH) {
    const overtime = data.totalHours - MAX_REGULAR_HOURS_PER_MONTH;
    addIssue(result, {
      code: 'HIGH_OVERTIME',
      message: `Employee has ${overtime} overtime hours this month.`,
      severity: 'warning'
    });
    // This isn't necessarily a critical flag, just an info/action
    addAction(result, {
      type: 'APPROVE_OVERTIME',
      description: 'Require manager approval for overtime pay.'
    });
  }

  return result;
}
