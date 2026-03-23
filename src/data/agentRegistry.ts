/**
 * Agent Registry — All 23 AI Agents in 6 Layers
 *
 * The complete army of agents that power Eldad's Brain.
 * Each agent has a specific role, layer, and capabilities.
 */

// #region Types

export type AgentLayer =
  | 'command'      // 🧠 פיקוד
  | 'construction' // 🏗️ בנייה
  | 'design'       // 🎨 נראות
  | 'quality'      // 🧪 בקרה
  | 'infrastructure'// 📦 תשתית
  | 'knowledge';   // 📚 ידע

export type AgentStatus = 'idle' | 'working' | 'done' | 'error' | 'waiting';

export interface Agent {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  layer: AgentLayer;
  description: string;
  capabilities: string[];
  status: AgentStatus;
}

export interface MissionStep {
  id: string;
  agentId: string;
  description: string;
  status: AgentStatus;
  output?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Mission {
  id: string;
  mode: 'build' | 'audit';
  title: string;
  instruction: string;
  systemName: string;
  steps: MissionStep[];
  status: 'planning' | 'executing' | 'review' | 'completed';
  form4?: Form4Report;
  createdAt: string;
}

export interface Form4Report {
  systemName: string;
  version: string;
  agentsUsed: string[];
  checklist: Record<string, boolean>;
  issuesFound: number;
  healthScore: number;
  recommendation: 'approved' | 'needs_fix';
  completedAt: string;
}

// #endregion

// #region Layer Config

export const LAYER_CONFIG: Record<AgentLayer, { name: string; emoji: string; color: string }> = {
  command:        { name: 'פיקוד',  emoji: '🧠', color: '#c9a84c' },
  construction:   { name: 'בנייה',  emoji: '🏗️', color: '#3b82f6' },
  design:         { name: 'נראות',  emoji: '🎨', color: '#a78bfa' },
  quality:        { name: 'בקרה',   emoji: '🧪', color: '#ef4444' },
  infrastructure: { name: 'תשתית', emoji: '📦', color: '#f59e0b' },
  knowledge:      { name: 'ידע',    emoji: '📚', color: '#10b981' },
};

// #endregion

// #region Agent Registry — 23 Agents

export const AGENTS: Agent[] = [
  // ═══ 🧠 Layer 1: Command ═══
  {
    id: 'system_brain', name: 'מוח המערכת', nameEn: 'System Brain',
    emoji: '🧠', layer: 'command', status: 'idle',
    description: 'מנהל את כל הסוכנים, בונה תוכנית, מקצה משימות',
    capabilities: ['תכנון', 'הקצאת סוכנים', 'ניהול pipeline', 'דיווח ל-CEO'],
  },
  {
    id: 'research', name: 'סוכן מחקר', nameEn: 'Research Agent',
    emoji: '🔬', layer: 'command', status: 'idle',
    description: 'חוקר טכנולוגיות, מתחרים, שוק — לפני שמתחילים',
    capabilities: ['מחקר שוק', 'ניתוח מתחרים', 'סקירת טכנולוגיות', 'דוח מחקר'],
  },

  // ═══ 🏗️ Layer 2: Construction ═══
  {
    id: 'architecture', name: 'סוכן ארכיטקטורה', nameEn: 'Architecture Agent',
    emoji: '📐', layer: 'construction', status: 'idle',
    description: 'מתכנן מבנה המערכת — DB, API, קומפוננטות',
    capabilities: ['תכנון מבנה', 'הגדרת API', 'ניתוח תלויות', 'תרשים ארכיטקטורה'],
  },
  {
    id: 'builder', name: 'סוכן בנייה', nameEn: 'Builder Agent',
    emoji: '🏗️', layer: 'construction', status: 'idle',
    description: 'בונה את הקוד בפועל',
    capabilities: ['כתיבת קוד', 'יצירת קומפוננטות', 'אינטגרציות', 'בניית פיצ\'רים'],
  },
  {
    id: 'refactor', name: 'סוכן שיפוץ', nameEn: 'Refactoring Agent',
    emoji: '🔄', layer: 'construction', status: 'idle',
    description: 'מסדר קוד ישן, מפשט, מייעל — בלי לשבור',
    capabilities: ['ריפקטורינג', 'אופטימיזציה', 'הסרת קוד מת', 'שיפור קריאות'],
  },

  // ═══ 🎨 Layer 3: Design ═══
  {
    id: 'design', name: 'סוכן עיצוב', nameEn: 'Design Agent',
    emoji: '🎨', layer: 'design', status: 'idle',
    description: 'UI/UX, צבעים, טיפוגרפיה, אנימציות',
    capabilities: ['עיצוב ממשק', 'פלטת צבעים', 'אנימציות', 'dark mode'],
  },
  {
    id: 'localization', name: 'סוכן שפה ולוקליזציה', nameEn: 'Localization Agent',
    emoji: '🌍', layer: 'design', status: 'idle',
    description: 'RTL, עברית נכונה, תרגומים',
    capabilities: ['RTL', 'תרגום', 'בדיקת שפה', 'ניקוד'],
  },
  {
    id: 'accessibility', name: 'סוכן נגישות', nameEn: 'Accessibility Agent',
    emoji: '♿', layer: 'design', status: 'idle',
    description: 'נגישות — WCAG, קורא מסך, ניגודיות',
    capabilities: ['WCAG', 'aria labels', 'ניגודיות', 'ניווט מקלדת'],
  },
  {
    id: 'responsive', name: 'סוכן רספונסיביות', nameEn: 'Responsive Agent',
    emoji: '📱', layer: 'design', status: 'idle',
    description: 'מובייל, טאבלט, דסקטופ — הכל עובד',
    capabilities: ['media queries', 'מובייל', 'טאבלט', 'breakpoints'],
  },

  // ═══ 🧪 Layer 4: Quality ═══
  {
    id: 'tester', name: 'סוכן בדיקות', nameEn: 'Tester Agent',
    emoji: '🧪', layer: 'quality', status: 'idle',
    description: 'בודק שהפיצ\'רים עובדים — unit + integration',
    capabilities: ['בדיקות פונקציונליות', 'edge cases', 'regression', 'smoke tests'],
  },
  {
    id: 'security', name: 'סוכן אבטחה', nameEn: 'Security Agent',
    emoji: '🔒', layer: 'quality', status: 'idle',
    description: 'סורק פרצות — XSS, injection, הרשאות',
    capabilities: ['XSS scan', 'SQL injection', 'CORS', 'הרשאות', 'API security'],
  },
  {
    id: 'performance', name: 'סוכן ביצועים', nameEn: 'Performance Agent',
    emoji: '⚡', layer: 'quality', status: 'idle',
    description: 'מהירות, זיכרון, זמני טעינה',
    capabilities: ['Lighthouse', 'bundle size', 'lazy loading', 'caching'],
  },
  {
    id: 'debugger', name: 'סוכן דיבאג', nameEn: 'Debugger Agent',
    emoji: '🐛', layer: 'quality', status: 'idle',
    description: 'מזהה ומתקן באגים',
    capabilities: ['stack trace', 'console errors', 'network issues', 'state bugs'],
  },
  {
    id: 'code_review', name: 'סוכן קוד ריוויו', nameEn: 'Code Review Agent',
    emoji: '🔎', layer: 'quality', status: 'idle',
    description: 'בודק איכות קוד, תקנים, best practices',
    capabilities: ['lint', 'naming', 'complexity', 'DRY', 'SOLID'],
  },

  // ═══ 📦 Layer 5: Infrastructure ═══
  {
    id: 'deploy', name: 'סוכן פריסה', nameEn: 'Deploy Agent',
    emoji: '🚀', layer: 'infrastructure', status: 'idle',
    description: 'מעלה למערכת — שרת, דומיין, SSL',
    capabilities: ['build', 'deploy', 'SSL', 'DNS', 'CI/CD'],
  },
  {
    id: 'monitor', name: 'סוכן ניטור', nameEn: 'Monitor Agent',
    emoji: '📡', layer: 'infrastructure', status: 'idle',
    description: 'עוקב 24/7 — דיווח על נפילות ובעיות',
    capabilities: ['uptime', 'error tracking', 'alerts', 'health checks'],
  },
  {
    id: 'dependencies', name: 'סוכן תלויות', nameEn: 'Dependencies Agent',
    emoji: '📦', layer: 'infrastructure', status: 'idle',
    description: 'ספריות, עדכוני אבטחה, גרסאות',
    capabilities: ['npm audit', 'version updates', 'vulnerability scan', 'lock files'],
  },
  {
    id: 'migration', name: 'סוכן מיגרציה', nameEn: 'Migration Agent',
    emoji: '💾', layer: 'infrastructure', status: 'idle',
    description: 'מעביר נתונים ממערכת ישנה לחדשה',
    capabilities: ['data mapping', 'ETL', 'validation', 'rollback'],
  },

  // ═══ 📚 Layer 6: Knowledge ═══
  {
    id: 'docs', name: 'סוכן תיעוד', nameEn: 'Documentation Agent',
    emoji: '📝', layer: 'knowledge', status: 'idle',
    description: 'README, הנחיות, תיעוד API',
    capabilities: ['README', 'API docs', 'changelog', 'JSDoc'],
  },
  {
    id: 'training', name: 'סוכן הדרכה', nameEn: 'Training Agent',
    emoji: '🎓', layer: 'knowledge', status: 'idle',
    description: 'מדריכים למשתמש, FAQ, onboarding',
    capabilities: ['user guide', 'FAQ', 'video scripts', 'onboarding flow'],
  },
  {
    id: 'integrations', name: 'סוכן אינטגרציות', nameEn: 'Integrations Agent',
    emoji: '🔗', layer: 'knowledge', status: 'idle',
    description: 'מחבר בין מערכות — API, webhooks, Gmail',
    capabilities: ['REST API', 'webhooks', 'Gmail', 'Google Drive', 'CRM'],
  },
  {
    id: 'analytics', name: 'סוכן אנליטיקס', nameEn: 'Analytics Agent',
    emoji: '📊', layer: 'knowledge', status: 'idle',
    description: 'עוקב אחרי שימוש — מה לוחצים? מה מתעלמים?',
    capabilities: ['event tracking', 'heatmaps', 'user flows', 'conversion'],
  },
  {
    id: 'print', name: 'סוכן הדפסה', nameEn: 'Print Agent',
    emoji: '🖨️', layer: 'knowledge', status: 'idle',
    description: 'מעצב מסמכים להדפסה — שוליים, PDF, חתימות',
    capabilities: ['PDF generation', 'print CSS', 'page breaks', 'headers/footers'],
  },
];

// #endregion

// #region Helpers

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find(a => a.id === id);
}

export function getAgentsByLayer(layer: AgentLayer): Agent[] {
  return AGENTS.filter(a => a.layer === layer);
}

export function getLayerOrder(): AgentLayer[] {
  return ['command', 'construction', 'design', 'quality', 'infrastructure', 'knowledge'];
}

// #endregion
