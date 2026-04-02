/* ============================================
   FILE: processRegistry.ts
   PURPOSE: Bridge — re-exports from system/processRegistry in BrainProcessRegistryItem format.
            צרכנים קיימים (BrainChat, MissionLauncher, ProcessLauncher, geminiService,
            agentToolDefinitions) ממשיכים לקרוא מכאן — אבל הנתונים מגיעים מה-Registry האחיד.
   DEPENDENCIES: ../system/processRegistry, ../system/processSeed, ./brainTypes
   EXPORTS: PROCESS_REGISTRY, getProcessById, getProcessesByDomain, findProcessByKeyword, getDomainStats
   ============================================ */

// #region Imports

import type { BrainDomain, BrainProcessRegistryItem } from './brainTypes';
import { PROCESS_DEFINITIONS } from '../system/processSeed';
import type { ProcessDefinition } from '../system/processRegistry';

// #endregion

// #region Bridge Converter

/** מפת המרה: ProcessDomain → BrainDomain */
const DOMAIN_MAP: Record<string, BrainDomain> = {
  core: 'core',
  employees: 'employee',
  accounting: 'accounting',
  financial: 'accounting',
  special_claims: 'accounting',
  tools: 'core',
  robium: 'core',
  personal: 'core',
  documents: 'accounting',
  tasks: 'core',
  clients: 'accounting',
};

/**
 * ממיר ProcessDefinition (מקור אמת חדש) ל-BrainProcessRegistryItem (פורמט ישן).
 * כך כל 5 הצרכנים הקיימים ממשיכים לעבוד ללא שינוי.
 */
function toBrainItem(p: ProcessDefinition): BrainProcessRegistryItem {
  return {
    id: p.id,
    name: p.title,
    domain: DOMAIN_MAP[p.domain] || 'core',
    category: p.category,
    flowchartFile: p.flowchartFile,
    screens: p.screens,
    brainKeywords: p.brainKeywords,
    requiredInputs: p.requiredInputs,
    optionalInputs: p.optionalInputs,
    agents: p.agents as BrainProcessRegistryItem['agents'],
    states: p.processStates as BrainProcessRegistryItem['states'],
    outputs: p.outputs,
    relatedModules: p.relatedProcesses,
  };
}

// #endregion

// #region Exported Registry (backward-compatible)

/**
 * PROCESS_REGISTRY — derived from system/processSeed.ts
 * @deprecated אל תוסיפו תהליכים כאן — הוסיפו ב-system/processSeed.ts
 */
export const PROCESS_REGISTRY: BrainProcessRegistryItem[] =
  PROCESS_DEFINITIONS.map(toBrainItem);

/** Find a process by its ID */
export function getProcessById(id: string): BrainProcessRegistryItem | undefined {
  return PROCESS_REGISTRY.find(p => p.id === id);
}

/** Get all processes in a domain */
export function getProcessesByDomain(domain: BrainDomain): BrainProcessRegistryItem[] {
  return PROCESS_REGISTRY.filter(p => p.domain === domain);
}

/** Find processes matching a keyword (Brain Router) */
export function findProcessByKeyword(query: string): BrainProcessRegistryItem[] {
  const q = query.toLowerCase();
  return PROCESS_REGISTRY.filter(p =>
    p.brainKeywords?.some(kw => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()))
  );
}

/** Get all domains with their process counts */
export function getDomainStats(): Record<BrainDomain, number> {
  const stats: Record<string, number> = {};
  for (const p of PROCESS_REGISTRY) {
    stats[p.domain] = (stats[p.domain] || 0) + 1;
  }
  return stats as Record<BrainDomain, number>;
}

// #endregion
