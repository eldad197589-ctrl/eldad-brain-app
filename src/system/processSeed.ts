/* ============================================
   FILE: processSeed.ts
   PURPOSE: אגרגטור — מאחד את כל הגדרות התהליכים ורושם ב-Registry
   DEPENDENCIES: ./processRegistry, ./processDefinitionsCore, ./processDefinitionsDomains
   EXPORTS: seedAllProcesses, PROCESS_DEFINITIONS
   ============================================ */
import { registerProcess } from './processRegistry';
import type { ProcessDefinition } from './processRegistry';
import { CORE_PROCESS_DEFINITIONS } from './processDefinitionsCore';
import { DOMAIN_PROCESS_DEFINITIONS } from './processDefinitionsDomains';

// #region Aggregated Definitions

/** כל תהליכי המערכת — מאוחדים מכל קבצי ההגדרות */
export const PROCESS_DEFINITIONS: ProcessDefinition[] = [
  ...CORE_PROCESS_DEFINITIONS,
  ...DOMAIN_PROCESS_DEFINITIONS,
];

// #endregion

// #region Seed Function

/**
 * רושם את כל התהליכים ב-registry.
 * נקרא פעם אחת ב-startup של האפליקציה.
 */
export function seedAllProcesses(): void {
  console.log(`[Registry] 🌱 Seeding ${PROCESS_DEFINITIONS.length} processes...`);
  for (const proc of PROCESS_DEFINITIONS) {
    registerProcess(proc);
  }
  console.log('[Registry] ✅ All processes registered');
}

// #endregion
