/* ============================================
   FILE: sidebarResolver.ts
   PURPOSE: Strangler Fig bridge — גוזר sidebar sections מ-SIDEBAR_SECTIONS
            אבל מחליף נתוני תהליכים (title, emoji, visibility) מה-Registry.
   DEPENDENCIES: ./sidebarNav, ../system/processSeed
   EXPORTS: resolveSidebarSections
   ============================================ */
import { SIDEBAR_SECTIONS } from './sidebarNav';
import type { NavSection, NavItem } from './sidebarNav';
import { PROCESS_DEFINITIONS } from '../system/processSeed';
import type { ProcessDefinition } from '../system/processRegistry';

// #region Route Map

/**
 * בונה מפת route → ProcessDefinition.
 * תהליך שיש לו route תואם ל-NavItem.to — ייקח title/emoji מה-Registry.
 */
function buildRouteMap(): Map<string, ProcessDefinition> {
  const map = new Map<string, ProcessDefinition>();
  for (const p of PROCESS_DEFINITIONS) {
    if (p.route) map.set(p.route, p);
  }
  return map;
}

// #endregion

// #region Resolver

/**
 * מחזיר את ה-sidebar sections עם override מה-Registry:
 * - תהליך שמופיע ב-Registry: title/emoji מה-Registry
 * - תהליך עם isVisibleInSidebar=false: מוסר מהרשימה
 * - פריט שלא ב-Registry: נשאר כמות שהוא (dividers, coming-soon, external links)
 *
 * @returns NavSection[] — מוכן לרינדור ב-Layout
 */
export function resolveSidebarSections(): NavSection[] {
  const routeMap = buildRouteMap();

  return SIDEBAR_SECTIONS.map(section => ({
    ...section,
    items: section.items
      .map((item): NavItem | null => {
        // Dividers — keep as-is
        if (item.isDivider) return item;

        // Check if this item matches a Registry process
        const process = routeMap.get(item.to);

        // Not in Registry — keep original (coming-soon, external links, etc.)
        if (!process) return item;

        // In Registry but hidden — remove from sidebar
        if (!process.isVisibleInSidebar || process.status !== 'active') return null;

        // Override from Registry — title, emoji
        return {
          ...item,
          label: process.title,
          emoji: process.emoji,
        };
      })
      .filter((item): item is NavItem => item !== null),
  }));
}

// #endregion
