/* ============================================
   FILE: engine.ts
   PURPOSE: Main entry point for Payroll Domain
   DEPENDENCIES: core/result, analyzer, rules
   EXPORTS: processPayroll
   ============================================ */
import { createResult, DomainResult } from '../core/result';
import { analyzePayrollData } from './analyzer';
import { applyPayrollRules } from './rules';

/**
 * Domain Engine Entry Point: processPayroll
 * -> analyze / calculation
 * -> apply rules
 * -> return structured result
 */
export function processPayroll(rawPayload: any): DomainResult<'payroll_analysis'> {
  console.log('[Domain Engine] Processing Payroll...');
  
  // 1. Analyze and format data
  const data = analyzePayrollData(rawPayload);

  // 2. Base Result with attached generic payload Action if needed
  const baseResult = createResult<'payroll_analysis'>('payroll_analysis', 'high');
  
  // Attach calculated data for consumers
  baseResult.actions.push({
    type: 'CALCULATED_PAYROLL_DATA',
    payload: { ...data },
    description: 'Contains normalized calculations for the payroll run.'
  });

  // 3. Apply the fixed business rules
  const finalResult = applyPayrollRules(data, baseResult);

  console.log('[Domain Engine] Payroll Process Result:', finalResult);
  return finalResult;
}
