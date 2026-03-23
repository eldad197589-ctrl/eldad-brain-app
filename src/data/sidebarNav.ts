/**
 * FILE: sidebarNav.ts
 * PURPOSE: Sidebar navigation — 7 domain-accurate panels with sub-chapter dividers
 * DEPENDENCIES: none (pure data)
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
 * All sidebar panels — 7 domain-accurate panels (+ core).
 * Each panel can have sub-chapter dividers (isDivider: true).
 */
export const SIDEBAR_SECTIONS: NavSection[] = [
  /* ═══ ליבה (תמיד פתוח) ═══ */
  {
    id: 'core',
    emoji: '🏠',
    label: 'ליבה',
    defaultOpen: true,
    alwaysOpen: true,
    items: [
      { to: '/', emoji: '📊', label: 'דשבורד' },
      { to: '/ceo', emoji: '🏢', label: 'לשכת מנכ"ל' },
      { to: '/hub', emoji: '🎛️', label: 'מרכז שליטה' },
    ],
  },

  /* ═══ 1. עובדים ═══ */
  {
    id: 'employees',
    emoji: '👷',
    label: 'עובדים',
    description: 'נוכחות · שכר · דיני עבודה',
    accentColor: '#3b82f6',
    defaultOpen: false,
    items: [
      // משאבי אנוש
      { to: '#', emoji: '📁', label: 'משאבי אנוש', isDivider: true },
      { to: '/coming-soon', emoji: '👤', label: 'קליטת עובד (Wizard)', dim: true },
      { to: '/coming-soon', emoji: '🔄', label: 'סיום העסקה (Wizard)', dim: true },
      { to: '/coming-soon', emoji: '📂', label: 'תיק עובד', dim: true },
      { to: '/coming-soon', emoji: '👁️', label: 'פורטל עובד', dim: true },
      // נוכחות ושכר
      { to: '#', emoji: '⏰', label: 'נוכחות ושכר', isDivider: true },
      { to: '/flow/attendance', emoji: '⏰', label: 'מנוע נוכחות' },
      { to: '/flow/attendance-agents', emoji: '🤖', label: 'סוכני נוכחות' },
      { to: '/flow/payroll-processing', emoji: '💰', label: 'עיבוד שכר' },
      { to: '/coming-soon', emoji: '📋', label: 'ניהול ניכויים', dim: true },
      // דיני עבודה
      { to: '#', emoji: '⚖️', label: 'דיני עבודה', isDivider: true },
      { to: '/flow/worklaw', emoji: '⚖️', label: 'דיני עבודה' },
      { to: '/flow/expert-opinion', emoji: '📝', label: 'חוות דעת כלכלית' },
      { to: '/letter', emoji: '✉️', label: 'מכתבים (20+ סוגים)' },
    ],
  },

  /* ═══ 2. הנהלת חשבונות ═══ */
  {
    id: 'accounting',
    emoji: '📊',
    label: 'הנהלת חשבונות',
    description: 'לקוחות · חשבוניות · ספרים · ספקים',
    accentColor: '#10b981',
    defaultOpen: false,
    items: [
      // לקוחות
      { to: '#', emoji: '👥', label: 'לקוחות', isDivider: true },
      { to: '/clients', emoji: '👥', label: 'כל הלקוחות (147)' },
      { to: '/coming-soon', emoji: '👤', label: 'קליטת לקוח חדש', dim: true },
      { to: '/coming-soon', emoji: '💰', label: 'הצעות מחיר', dim: true },
      // קליטת מסמכים
      { to: '#', emoji: '📥', label: 'קליטת מסמכים', isDivider: true },
      { to: '/coming-soon', emoji: '📥', label: 'קליטת חשבונית ספק', dim: true },
      { to: '/coming-soon', emoji: '🔬', label: 'ניתוח קליטת חשבונית ספק', dim: true },
      { to: '/coming-soon', emoji: '🧾', label: 'חשבוניות לקוחות (הכנסות)', dim: true },
      // ניהול ספרים
      { to: '#', emoji: '📗', label: 'ניהול ספרים', isDivider: true },
      { to: '/coming-soon', emoji: '📗', label: 'חד-צדדית (רו"ה)', dim: true },
      { to: '/coming-soon', emoji: '📘', label: 'כפולה (מאזן + התאמות)', dim: true },
      // דיווחים
      { to: '#', emoji: '📋', label: 'דיווחים', isDivider: true },
      { to: '/flow/institutional-reports', emoji: '📋', label: 'דיווחי מוסדות' },
      { to: '/flow/penalty-cancellation', emoji: '🚨', label: 'ביטול קנסות' },
      { to: '/coming-soon', emoji: '📊', label: 'דו"ח מע"מ', dim: true },
      // ספקים ורכש
      { to: '#', emoji: '🏢', label: 'ספקים ורכש', isDivider: true },
      { to: '/coming-soon', emoji: '📄', label: 'ניהול הסכמי ספקים', dim: true },
      { to: '/coming-soon', emoji: '🔍', label: 'ביקורת חיובים מול הסכם', dim: true },
      { to: '/coming-soon', emoji: '📅', label: 'לוח תשלומים', dim: true },
      { to: '/coming-soon', emoji: '✅', label: 'אישור חשבוניות', dim: true },
      { to: '/coming-soon', emoji: '🧾', label: 'אישורי ניכוי מס', dim: true },
    ],
  },

  /* ═══ 3. דוחות כספיים ומיסוי ═══ */
  {
    id: 'financial',
    emoji: '📋',
    label: 'דוחות כספיים ומיסוי',
    description: 'דוחות שנתיים · מס · פנסיה',
    accentColor: '#06b6d4',
    defaultOpen: false,
    items: [
      // דוחות כספיים
      { to: '#', emoji: '📜', label: 'דוחות כספיים', isDivider: true },
      { to: '/flow/declaration-of-capital', emoji: '📜', label: 'הצהרת הון' },
      { to: '/coming-soon', emoji: '📊', label: 'דוחות שנתיים', dim: true },
      { to: '/coming-soon', emoji: '📋', label: 'ביקורת ספרים', dim: true },
      // מיסוי
      { to: '#', emoji: '💼', label: 'מיסוי', isDivider: true },
      { to: '/coming-soon', emoji: '💼', label: 'החזרי מס לשכירים', dim: true },
      { to: '/coming-soon', emoji: '🌍', label: 'מיסוי בינלאומי', dim: true },
      { to: '/coming-soon', emoji: '⚖️', label: 'ייצוג מול רשויות', dim: true },
      // ייעוץ פנסיוני
      { to: '#', emoji: '💎', label: 'ייעוץ פנסיוני', isDivider: true },
      { to: '/coming-soon', emoji: '💎', label: 'קרנות פנסיה', dim: true },
      { to: '/coming-soon', emoji: '🏦', label: 'ביטוח מנהלים', dim: true },
      { to: '/coming-soon', emoji: '📈', label: 'קופות גמל', dim: true },
      { to: '/coming-soon', emoji: '🎓', label: 'קרן השתלמות', dim: true },
    ],
  },

  /* ═══ 4. חישובים מיוחדים ═══ */
  {
    id: 'special',
    emoji: '⚖️',
    label: 'חישובים מיוחדים',
    description: 'רווח הון · מלחמה · אפוטרופוס · חדל"פ',
    accentColor: '#f59e0b',
    defaultOpen: false,
    items: [
      { to: '/flow/capital-gains', emoji: '💰', label: 'רווח הון בחו"ל' },
      { to: '/flow/guardian-pro', emoji: '🏛️', label: 'אפוטרופוס' },
      { to: '/flow/war-compensation', emoji: '🛡️', label: 'פיצויי מלחמה' },
      { to: '/flow/insolvency', emoji: '📉', label: 'חדלות פירעון' },
      { to: '/coming-soon', emoji: '🏠', label: 'מיסוי מקרקעין', dim: true },
      { to: '/coming-soon', emoji: '📊', label: 'הערכות שווי', dim: true },
    ],
  },

  /* ═══ 5. כלים וטכנולוגיה ═══ */
  {
    id: 'tools',
    emoji: '🤖',
    label: 'כלים וטכנולוגיה',
    description: 'AI · מסמכים · מערכות ניהול',
    accentColor: '#8b5cf6',
    defaultOpen: false,
    items: [
      // כלי AI
      { to: '#', emoji: '🤖', label: 'כלי AI', isDivider: true },
      { to: '/flow/brain-router', emoji: '🧠', label: 'Brain Router' },
      { to: '/documents', emoji: '📄', label: 'בוט מילוי מסמכים' },
      { to: '/coming-soon', emoji: '📥', label: 'בוט איסוף מסמכים', dim: true },
      // מערכות ניהול
      { to: '#', emoji: '🏗️', label: 'מערכות ניהול', isDivider: true },
      { to: '/coming-soon', emoji: '📦', label: 'מערכת מלאי (WMS)', dim: true },
      { to: '/coming-soon', emoji: '🏗️', label: 'ניהול אתרי בנייה', dim: true },
      // עמותות
      { to: '#', emoji: '🏛️', label: 'עמותות ומלכ"רים', isDivider: true },
      { to: '/coming-soon', emoji: '📋', label: 'ביקורת עמותות', dim: true },
      { to: '/coming-soon', emoji: '🏛️', label: 'הקמת עמותה', dim: true },
    ],
  },

  /* ═══ 6. רוביום ═══ */
  {
    id: 'robium',
    emoji: '🚀',
    label: 'רוביום',
    description: 'תיק מוצרים · מייסדים · חממה',
    accentColor: '#ec4899',
    defaultOpen: false,
    items: [
      { to: '/products', emoji: '📦', label: 'תיק מוצרים' },
    ],
  },

  /* ═══ 7. אישי ומערכת ═══ */
  {
    id: 'personal',
    emoji: '🎤',
    label: 'אישי ומערכת',
    description: 'מוזיקה · הגדרות',
    accentColor: '#06b6d4',
    defaultOpen: false,
    items: [
      { to: '/hobbies', emoji: '🎵', label: 'זמר ומוזיקה' },
      { to: '/settings', emoji: '⚙️', label: 'הגדרות' },
    ],
  },
];

// #endregion
