/* ============================================
   FILE: flowcharts.ts
   PURPOSE: Barrel re-export — aggregates all flowchart data into a single registry
   DEPENDENCIES: flowcharts-tax, flowcharts-operations, flowcharts-legal, flowcharts-systems, flowchartTypes
   EXPORTS: FLOWCHARTS
   ============================================ */
import type { FlowchartData } from './flowchartTypes';
import { capitalGains, warCompensation, declarationOfCapital, penaltyCancellation } from './flowcharts-tax';
import { guardianPro, attendance, worklaw, payrollProcessing, insolvency } from './flowcharts-operations';
import { expertOpinion, institutionalReports } from './flowcharts-legal';
import { brainRouter, attendanceAgents } from './flowcharts-systems';

// #region Registry

/** Master flowchart registry — maps route slug to flowchart data */
export const FLOWCHARTS: Record<string, FlowchartData> = {
  'capital-gains': capitalGains,
  'guardian-pro': guardianPro,
  'attendance': attendance,
  'worklaw': worklaw,
  'payroll-processing': payrollProcessing,
  'insolvency': insolvency,
  'expert-opinion': expertOpinion,
  'war-compensation': warCompensation,
  'institutional-reports': institutionalReports,
  'brain-router': brainRouter,
  'attendance-agents': attendanceAgents,
  'declaration-of-capital': declarationOfCapital,
  'penalty-cancellation': penaltyCancellation,
};

// #endregion
