/* ============================================
   FILE: neuronsResolver.ts
   PURPOSE: Strangler Fig bridge — enriches NEURONS data from Process Registry.
            נוירונים שיש להם תהליך תואם ב-Registry מקבלים label/emoji עדכניים.
   DEPENDENCIES: ./neurons, ../system/processSeed
   EXPORTS: resolveNeurons
   ============================================ */
import { NEURONS } from './neurons';
import type { Neuron } from './neurons';
import { PROCESS_DEFINITIONS } from '../system/processSeed';
import type { ProcessDefinition } from '../system/processRegistry';

// #region Route-based Resolver

/**
 * Builds a map: route → ProcessDefinition for quick lookup.
 */
function buildRouteMap(): Map<string, ProcessDefinition> {
  const map = new Map<string, ProcessDefinition>();
  for (const p of PROCESS_DEFINITIONS) {
    if (p.route) map.set(p.route, p);
  }
  return map;
}

/**
 * Tries to find a Registry process matching a neuron.
 * Strategy: check each neuron link's href against Registry routes.
 */
function findProcessForNeuron(neuron: Neuron, routeMap: Map<string, ProcessDefinition>): ProcessDefinition | undefined {
  // Check each link's href — flowchart links usually match /flow/xxx routes
  for (const link of neuron.links) {
    const process = routeMap.get(link.href);
    if (process) return process;
  }
  return undefined;
}

// #endregion

// #region Public API

/**
 * Returns enriched NEURONS array with labels/emojis from Registry.
 * Also updates link titles for flowchart links that match Registry routes.
 *
 * Non-matching neurons pass through unchanged.
 */
export function resolveNeurons(): Neuron[] {
  const routeMap = buildRouteMap();

  return NEURONS.map(neuron => {
    const process = findProcessForNeuron(neuron, routeMap);
    if (!process) return neuron;

    // Enrich neuron from Registry
    return {
      ...neuron,
      label: process.title,
      emoji: process.emoji,
      // Update flowchart link titles from Registry
      links: neuron.links.map(link => {
        const linkProcess = routeMap.get(link.href);
        if (linkProcess && link.type === 'flowchart') {
          return {
            ...link,
            title: `תרשים זרימה — ${linkProcess.title}`,
          };
        }
        return link;
      }),
    };
  });
}

// #endregion
