/* ============================================
   FILE: breadcrumbsMap.ts
   PURPOSE: Maps route paths to Hebrew breadcrumb labels — enriched from Registry
   DEPENDENCIES: ../system/processSeed
   EXPORTS: BreadcrumbNode, BREADCRUMB_MAP, DYNAMIC_BREADCRUMBS, resolveBreadcrumb, buildBreadcrumbChain
   ============================================ */
import { PROCESS_DEFINITIONS } from '../system/processSeed';

// #region Types

/** Single breadcrumb node with label, emoji, and optional parent path */
export interface BreadcrumbNode {
  /** Hebrew display label */
  label: string;
  /** Emoji icon for the breadcrumb */
  emoji: string;
  /** Parent route path (for building the chain) */
  parent?: string;
}

// #endregion

// #region Registry-enriched helpers

/** Looks up a process by route and returns its emoji */
function registryEmoji(route: string, fallback: string): string {
  return PROCESS_DEFINITIONS.find(p => p.route === route)?.emoji || fallback;
}

/** Looks up a process by route and returns its title */
function registryTitle(route: string, fallback: string): string {
  return PROCESS_DEFINITIONS.find(p => p.route === route)?.title || fallback;
}

// #endregion

// #region Data

/**
 * Static route-to-breadcrumb mapping.
 * Processes in the Registry derive emoji/title from the single source of truth.
 */
export const BREADCRUMB_MAP: Record<string, BreadcrumbNode> = {
  '/': { emoji: registryEmoji('/', '📊'), label: registryTitle('/', 'דשבורד') },
  '/ceo': { emoji: registryEmoji('/ceo', '🏢'), label: registryTitle('/ceo', 'לשכת מנכ"ל'), parent: '/' },
  '/hub': { emoji: '🎛️', label: 'מרכז שליטה', parent: '/' },
  '/clients': { emoji: '👥', label: 'כל הלקוחות', parent: '/' },
  '/clients/robium': { emoji: '🚀', label: 'Robium L.T.D', parent: '/clients' },
  '/leads': { emoji: '🎯', label: 'ניהול לידים', parent: '/clients' },
  '/onboarding': { emoji: '👤', label: 'קליטת לקוח חדש', parent: '/clients' },
  '/quotes-generator': { emoji: '💰', label: 'מחולל הצעות מחיר', parent: '/' },
  '/pricing-manager': { emoji: '🏷️', label: 'ניהול מחירון', parent: '/' },
  '/products': { emoji: '📦', label: 'תיק מוצרים', parent: '/clients/robium' },
  '/founders': { emoji: '👥', label: 'מייסדים', parent: '/clients/robium' },
  '/agreement': { emoji: '📄', label: 'הסכם מייסדים', parent: '/clients/robium' },
  '/agreement/review': { emoji: '🔍', label: 'סקירת הסכם', parent: '/agreement' },
  '/comparison': { emoji: '📊', label: 'ניתוח מתחרים', parent: '/clients/robium' },
  '/incubator': { emoji: '🏗️', label: 'חממה טכנולוגית', parent: '/clients/robium' },
  '/letter': { emoji: '✉️', label: 'מכתבים', parent: '/' },
  '/documents': { emoji: registryEmoji('/documents', '📋'), label: registryTitle('/documents', 'בוט מילוי מסמכים'), parent: '/' },
  '/personal/payments': { emoji: registryEmoji('/personal/payments', '💳'), label: registryTitle('/personal/payments', 'תשלומי בית'), parent: '/' },
  '/hobbies': { emoji: '🎵', label: 'זמר ומוזיקה', parent: '/' },
  '/settings': { emoji: '⚙️', label: 'הגדרות', parent: '/' },
  '/calculator': { emoji: '🧮', label: 'מחשבון', parent: '/' },
  '/coming-soon': { emoji: '🚧', label: 'בקרוב', parent: '/' },
};

/**
 * Dynamic route patterns — for routes like /flow/:flowId, /case/:caseId
 * These are matched when the exact path isn't found in BREADCRUMB_MAP.
 */
export const DYNAMIC_BREADCRUMBS: Array<{
  pattern: RegExp;
  getNode: (match: RegExpMatchArray) => BreadcrumbNode;
}> = [
  {
    pattern: /^\/flow\/(.+)$/,
    getNode: (match) => {
      const flowId = match[1];
      const route = `/flow/${flowId}`;
      // Registry lookup — single source of truth for titles
      const process = PROCESS_DEFINITIONS.find(p => p.route === route);
      if (process) {
        return { emoji: process.emoji, label: process.title, parent: '/' };
      }
      // Fallback for flows not yet in Registry
      const fallback: Record<string, string> = {
        'attendance-agents': 'סוכני נוכחות',
        'penalty-cancellation': 'ביטול קנסות',
      };
      return {
        emoji: '📐',
        label: fallback[flowId] || flowId,
        parent: '/',
      };
    },
  },
  {
    pattern: /^\/case\/(.+)$/,
    getNode: (match) => {
      const caseNames: Record<string, string> = {
        'helman': 'תיק הלמן',
        'guardian': 'תיק גרדיאן',
      };
      const caseId = match[1];
      return {
        emoji: '📂',
        label: caseNames[caseId] || `תיק ${caseId}`,
        parent: '/clients',
      };
    },
  },
];

/**
 * Resolves a path to its BreadcrumbNode — checks static map first, then dynamic patterns.
 * @param path - The current route path
 * @returns BreadcrumbNode or undefined if not found
 */
export function resolveBreadcrumb(path: string): BreadcrumbNode | undefined {
  // 1. Check static map
  if (BREADCRUMB_MAP[path]) return BREADCRUMB_MAP[path];

  // 2. Check dynamic patterns
  for (const { pattern, getNode } of DYNAMIC_BREADCRUMBS) {
    const match = path.match(pattern);
    if (match) return getNode(match);
  }

  return undefined;
}

/**
 * Builds the full breadcrumb chain for a given path.
 * @param path - The current route path
 * @returns Array of { path, node } from root to current
 */
export function buildBreadcrumbChain(path: string): Array<{ path: string; node: BreadcrumbNode }> {
  const chain: Array<{ path: string; node: BreadcrumbNode }> = [];
  let current: string | undefined = path;

  while (current) {
    const node = resolveBreadcrumb(current);
    if (!node) break;
    chain.unshift({ path: current, node });
    current = node.parent;
  }

  return chain;
}

// #endregion
