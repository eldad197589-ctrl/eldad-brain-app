/* ============================================
   FILE: sidebarNav.ts
   PURPOSE: Sidebar navigation — 6 CPA-office navigation panels (refactored)
   DEPENDENCIES: none (pure data)
   EXPORTS: NavItem, NavSection, SIDEBAR_SECTIONS
   ============================================ */
/**
 * FILE: sidebarNav.ts
 * PURPOSE: Sidebar navigation — 6 operational panels for CPA office workflow
 * DEPENDENCIES: none (pure data)
 *
 * REFACTORED: 2026-04-14
 * Structure follows approved NAVIGATION REORGANIZATION MODEL:
 *   1. לשכת מנכ"ל (CEO Dashboard)
 *   2. לקוחות ותיקים (Clients & Cases)
 *   3. תפעול משרדי (Office Operations — accounting, reporting, employees)
 *   4. כלים ומנועים (Shared Engines)
 *   5. מרכז ידע (Knowledge & AI)
 *   6. מנהלת משרד (Office Admin)
 */

// #region Types

/** Single navigation item in the sidebar */
export interface NavItem {
  /** Route path */
  to: string;
  /** Lucide icon node (optional) */
  icon?: React.ReactNode;
  /** Emoji fallback (optional) */
  emoji?: string;
  /** Display label (Hebrew) */
  label: string;
  /** Whether the item is dimmed (coming soon) */
  dim?: boolean;
  /** If true, this is a sub-chapter divider (not a link) */
  isDivider?: boolean;
}

/** A collapsible panel grouping nav items */
export interface NavSection {
  /** Unique section ID */
  id: string;
  /** Section emoji */
  emoji: string;
  /** Section label (Hebrew) */
  label: string;
  /** Short description shown under the label */
  description?: string;
  /** Whether section is open by default */
  defaultOpen: boolean;
  /** Whether section is always visible (no collapse) */
  alwaysOpen?: boolean;
  /** Accent color for the panel border/glow */
  accentColor?: string;
  /** Navigation items in this section */
  items: NavItem[];
}

// #endregion

// #region Navigation Data

/**
 * SIDEBAR_SECTIONS — 6 operational panels for CPA office.
 * Approved model: CEO / Clients / Operations / Engines / Knowledge / Admin.
 *
 * Robium removed from sidebar root — now lives as client entity under /clients/robium.
 * Hobbies removed from sidebar — accessible via direct URL only.
 */
export const SIDEBAR_SECTIONS: NavSection[] = [

  /* ═══ 0. תחנת עבודה (Work Spine) ═══ */
  {
    id: 'work-spine',
    emoji: '⚡',
    label: 'תחנות עבודה',
    description: 'הפעלת המוח · משימות יומיות',
    defaultOpen: true,
    alwaysOpen: true,
    accentColor: '#f59e0b',
    items: [
      { to: '/work-spine', emoji: '⚡', label: 'שולחן עבודה' },
    ],
  },

  /* ═══ 1. לשכת מנכ"ל (CEO Dashboard) ═══ */
  {
    id: 'ceo',
    emoji: '📊',
    label: 'לשכת מנכ"ל',
    description: 'דשבורד · משימות · תקציר בוקר',
    defaultOpen: true,
    alwaysOpen: true,
    accentColor: '#c9a84c',
    items: [
      { to: '/', emoji: '📊', label: 'דשבורד ראשי' },
      { to: '/ceo', emoji: '🏢', label: 'לוח מנכ"ל' },
    ],
  },

  /* ═══ 2. לקוחות ותיקים (Clients & Cases) ═══ */
  {
    id: 'clients',
    emoji: '📁',
    label: 'לקוחות ותיקים',
    description: 'לידים · קליטה · Onboarding · תיקי לקוחות',
    accentColor: '#10b981',
    defaultOpen: true,
    items: [
      { to: '/clients', emoji: '👥', label: 'כל הלקוחות' },
      { to: '/leads', emoji: '🎯', label: 'ניהול לידים' },
      { to: '/onboarding', emoji: '👤', label: 'קליטת לקוח חדש' },
      // תיקים פעילים
      { to: '#', emoji: '📁', label: 'תיקים פעילים', isDivider: true },
      { to: '/case/dima-rodnitski', emoji: '🛡️', label: 'ערר — דימה רודניצקי' },
      { to: '/clients/robium', emoji: '🚀', label: 'Robium L.T.D — פרויקט VIP' },
    ],
  },

  /* ═══ 3. תפעול משרדי (Office Operations) ═══ */
  {
    id: 'operations',
    emoji: '⚙️',
    label: 'תפעול משרדי',
    description: 'הנה"ח · שכר · דיווחים · דיני עבודה',
    accentColor: '#3b82f6',
    defaultOpen: false,
    items: [
      // הנהלת חשבונות
      { to: '#', emoji: '📊', label: 'הנהלת חשבונות', isDivider: true },
      { to: '/flow/institutional-reports', emoji: '📋', label: 'דיווחי מוסדות' },
      { to: '/flow/penalty-cancellation', emoji: '🚨', label: 'ביטול קנסות' },
      { to: '/flow/declaration-of-capital', emoji: '📜', label: 'הצהרת הון' },
      { to: '/coming-soon', emoji: '📊', label: 'דו"ח מע"מ', dim: true },
      // עובדים ושכר
      { to: '#', emoji: '👷', label: 'עובדים ושכר', isDivider: true },
      { to: '/flow/attendance', emoji: '⏰', label: 'מנוע נוכחות' },
      { to: '/flow/attendance-agents', emoji: '🤖', label: 'סוכני נוכחות' },
      { to: '/flow/payroll-processing', emoji: '💰', label: 'עיבוד שכר' },
      // דיני עבודה
      { to: '#', emoji: '⚖️', label: 'דיני עבודה', isDivider: true },
      { to: '/flow/worklaw', emoji: '⚖️', label: 'דיני עבודה' },
      { to: '/flow/expert-opinion', emoji: '📝', label: 'חוות דעת כלכלית' },
      // חישובים מיוחדים
      { to: '#', emoji: '💼', label: 'חישובים מיוחדים', isDivider: true },
      { to: '/flow/capital-gains', emoji: '💰', label: 'רווח הון בחו"ל' },
      { to: '/flow/guardian-pro', emoji: '🏛️', label: 'אפוטרופוס' },
      { to: '/flow/war-compensation', emoji: '🛡️', label: 'פיצויי מלחמה' },
      { to: '/flow/insolvency', emoji: '📉', label: 'חדלות פירעון' },
    ],
  },

  /* ═══ 4. כלים ומנועים (Shared Engines) ═══ */
  {
    id: 'engines',
    emoji: '🛠️',
    label: 'כלים ומנועים',
    description: 'הצעות מחיר · מכתבים · טפסים · מסמכים',
    accentColor: '#8b5cf6',
    defaultOpen: false,
    items: [
      { to: '/quotes-generator', emoji: '💰', label: 'מחולל הצעות מחיר' },
      { to: '/pricing-manager', emoji: '🏷️', label: 'ניהול מחירון B2B' },
      { to: '/letter', emoji: '✉️', label: 'מרכז מכתבים' },
      { to: '/documents', emoji: '📄', label: 'בוט מילוי מסמכים' },
      { to: '/document-change-agent', emoji: '🤖', label: 'סוכן שינויים חוזי (DCA)' },
      { to: '/messaging', emoji: '💬', label: 'הודעות ללקוחות' },
    ],
  },

  /* ═══ 5. מרכז ידע (Knowledge & AI) ═══ */
  {
    id: 'knowledge',
    emoji: '🧠',
    label: 'מרכז ידע',
    description: 'תרשימים · פרוטוקולים · Brain Router',
    accentColor: '#06b6d4',
    defaultOpen: false,
    items: [
      { to: '/flow/brain-router', emoji: '🧠', label: 'Brain Router' },
      // תרשימים ופרוטוקולים — domain playbooks
      { to: '#', emoji: '📐', label: 'תרשימי תהליכים', isDivider: true },
      { to: '/flow/attendance', emoji: '⏰', label: 'נוכחות' },
      { to: '/flow/capital-gains', emoji: '💰', label: 'רווח הון' },
      { to: '/flow/guardian-pro', emoji: '🏛️', label: 'אפוטרופוס' },
      { to: '/flow/war-compensation', emoji: '🛡️', label: 'פיצויי מלחמה' },
      { to: '/flow/insolvency', emoji: '📉', label: 'חדלות פירעון' },
      { to: '/flow/expert-opinion', emoji: '📝', label: 'חוות דעת' },
      { to: '/flow/institutional-reports', emoji: '📋', label: 'דיווחי מוסדות' },
      { to: '/flow/declaration-of-capital', emoji: '📜', label: 'הצהרת הון' },
      { to: '/flow/penalty-cancellation', emoji: '🚨', label: 'ביטול קנסות' },
    ],
  },

  /* ═══ 6. מנהלת משרד (Office Admin) ═══ */
  {
    id: 'admin',
    emoji: '⚙️',
    label: 'מנהלת משרד',
    description: 'הגדרות · תשלומים · ניהול',
    accentColor: '#64748b',
    defaultOpen: false,
    items: [
      { to: '/settings', emoji: '⚙️', label: 'הגדרות מערכת' },
      { to: '/personal/payments', emoji: '💳', label: 'תשלומי בית' },
    ],
  },
];

// #endregion
