/* ============================================
   FILE: breadcrumbsMap.ts
   PURPOSE: breadcrumbsMap module
   DEPENDENCIES: None (local only)
   EXPORTS: BreadcrumbNode, BREADCRUMB_MAP, DYNAMIC_BREADCRUMBS, resolveBreadcrumb, buildBreadcrumbChain
   ============================================ */
/**
 * FILE: breadcrumbsMap.ts
 * PURPOSE: Maps route paths to Hebrew breadcrumb labels for navigation awareness
 * DEPENDENCIES: none (pure data)
 */

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

// #region Data

/**
 * Static route-to-breadcrumb mapping.
 * Each key is a route path, and the value describes how it appears in breadcrumbs.
 * `parent` builds the chain: /ceo → / (דשבורד > לשכת מנכ"ל)
 */
export const BREADCRUMB_MAP: Record<string, BreadcrumbNode> = {
  '/': { emoji: '📊', label: 'דשבורד' },
  '/ceo': { emoji: '🏢', label: 'לשכת מנכ"ל', parent: '/' },
  '/hub': { emoji: '🎛️', label: 'מרכז שליטה', parent: '/' },
  '/clients': { emoji: '👥', label: 'כל הלקוחות', parent: '/' },
  '/products': { emoji: '📦', label: 'תיק מוצרים', parent: '/' },
  '/founders': { emoji: '👥', label: 'מייסדים', parent: '/' },
  '/agreement': { emoji: '📄', label: 'הסכם מייסדים', parent: '/products' },
  '/agreement/review': { emoji: '🔍', label: 'סקירת הסכם', parent: '/agreement' },
  '/comparison': { emoji: '📊', label: 'ניתוח מתחרים', parent: '/products' },
  '/incubator': { emoji: '🏗️', label: 'חממה טכנולוגית', parent: '/products' },
  '/letter': { emoji: '✉️', label: 'מכתבים', parent: '/' },
  '/documents': { emoji: '📋', label: 'בוט מילוי מסמכים', parent: '/' },
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
      const flowNames: Record<string, string> = {
        'attendance': 'מנוע נוכחות',
        'attendance-agents': 'סוכני נוכחות',
        'payroll-processing': 'עיבוד שכר',
        'worklaw': 'דיני עבודה',
        'expert-opinion': 'חוות דעת כלכלית',
        'capital-gains': 'רווח הון בחו"ל',
        'declaration-of-capital': 'הצהרת הון',
        'war-compensation': 'פיצויי מלחמה',
        'guardian-pro': 'אפוטרופוס',
        'insolvency': 'חדלות פירעון',
        'institutional-reports': 'דיווחי מוסדות',
        'penalty-cancellation': 'ביטול קנסות',
        'brain-router': 'Brain Router',
      };
      const flowId = match[1];
      return {
        emoji: '📐',
        label: flowNames[flowId] || flowId,
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
