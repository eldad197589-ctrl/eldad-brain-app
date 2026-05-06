/* ==== FILE: src/work-spine/process-library/process-library-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  PROCESS_LIBRARY_BLUEPRINTS,
  PROCESS_LIBRARY_BLUEPRINT_WARNING,
  PROCESS_LIBRARY_SOURCE_TRACE,
} from './process-library-seed';
import {
  PROCESS_LIBRARY_DOMAINS,
  PROCESS_LIBRARY_FORBIDDEN_ACTIONS,
  PROCESS_LIBRARY_STATUSES,
} from './process-library-types';
import type { ProcessLibraryBlueprint } from './process-library-types';
import processLibrarySeedSource from './process-library-seed.ts?raw';
// #endregion

// #region Constants
const REQUIRED_FIELDS = [
  'processId',
  'hebrewName',
  'domain',
  'trigger',
  'requiredInputs',
  'expectedOutputs',
  'workflowStages',
  'relatedAgents',
  'requiredGates',
  'forbiddenActions',
  'status',
  'operationalExecution',
  'sourceTrace',
] as const satisfies readonly (keyof ProcessLibraryBlueprint)[];

const EXPECTED_PROCESS_IDS = [
  'process-institutional-reports',
  'process-penalty-cancellation',
  'process-declaration-of-capital',
  'process-vat-report',
  'process-attendance',
  'process-attendance-agents',
  'process-payroll-processing',
  'process-worklaw',
  'process-expert-opinion',
  'process-capital-gains',
  'process-guardian',
  'process-war-compensation',
  'process-insolvency',
] as const;

const FORBIDDEN_IMPORT_PATTERNS = [
  /from ['"].*sidebar/,
  /from ['"].*dashboard/i,
  /from ['"].*Layout/,
  /from ['"].*neurons/,
  /from ['"].*runtime/i,
  /from ['"].*provider/i,
  /from ['"]fs['"]/,
  /from ['"]path['"]/,
  /localStorage/,
  /sessionStorage/,
  /fetch\s*\(/,
  /OCR/,
  /Supabase/,
  /\bDB\b/,
] as const;

const FORBIDDEN_CREATION_PATTERNS = [
  /createWorkItem/,
  /createMatter/,
  /createDocumentRef/,
  /new\s+WorkItem/,
  /new\s+Matter/,
  /new\s+DocumentRef/,
] as const;
// #endregion

// #region Helpers
const processIds = (): readonly string[] => PROCESS_LIBRARY_BLUEPRINTS.map((process) => process.processId);
// #endregion

// #region Tests
describe('PROCESS_LIBRARY_BLUEPRINTS', () => {
  it('exports exactly 13 Stage 21B process blueprints', () => {
    expect(PROCESS_LIBRARY_BLUEPRINTS).toHaveLength(13);
    expect(processIds().sort()).toEqual([...EXPECTED_PROCESS_IDS].sort());
  });

  it('uses the expected static warning and source trace', () => {
    expect(PROCESS_LIBRARY_BLUEPRINT_WARNING).toBe(
      'ספריית תהליכים סטטית בלבד — Blueprint לתכנון, לא הפעלה, לא אימות מקצועי, לא קריאת תוכן, ולא יצירת רשומות.',
    );
    expect(PROCESS_LIBRARY_SOURCE_TRACE).toBe(
      'static-copy:Stage21B:visual-navigation-inventory:professional_process_blueprint',
    );
  });

  it('includes every required field on every process blueprint', () => {
    for (const process of PROCESS_LIBRARY_BLUEPRINTS) {
      for (const fieldName of REQUIRED_FIELDS) {
        expect(process).toHaveProperty(fieldName);
      }

      expect(process.hebrewName.length).toBeGreaterThan(0);
      expect(process.requiredInputs.length).toBeGreaterThan(0);
      expect(process.expectedOutputs.length).toBeGreaterThan(0);
      expect(process.workflowStages.length).toBeGreaterThan(0);
      expect(process.relatedAgents.length).toBeGreaterThan(0);
      expect(process.requiredGates.length).toBeGreaterThan(0);
    }
  });

  it('marks every process as static and non-operational', () => {
    for (const process of PROCESS_LIBRARY_BLUEPRINTS) {
      expect(PROCESS_LIBRARY_DOMAINS).toContain(process.domain);
      expect(PROCESS_LIBRARY_STATUSES).toContain(process.status);
      expect(process.operationalExecution).toBe(false);
      expect(process.forbiddenActions).toEqual(PROCESS_LIBRARY_FORBIDDEN_ACTIONS);
      expect(process.sourceTrace).toBe(PROCESS_LIBRARY_SOURCE_TRACE);
    }
  });

  it('does not import runtime, provider, OCR, persistence, UI, sidebar, dashboard, or neurons sources', () => {
    for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
      expect(processLibrarySeedSource).not.toMatch(pattern);
    }
  });

  it('does not create operational object records', () => {
    for (const pattern of FORBIDDEN_CREATION_PATTERNS) {
      expect(processLibrarySeedSource).not.toMatch(pattern);
    }
  });
});
// #endregion
