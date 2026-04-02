/* ============================================
   FILE: constants.ts
   PURPOSE: Built-in templates, category labels, and static data for Messaging Engine
   DEPENDENCIES: ./types
   EXPORTS: MESSAGE_CATEGORY_LABELS, BUILT_IN_TEMPLATES, PLACEHOLDER_LABELS
   ============================================ */
import type { MessageTemplate, MessageCategory } from './types';

// #region Category Labels

/** תוויות קטגוריות — Hebrew labels + emoji + accent color */
export const MESSAGE_CATEGORY_LABELS: Record<MessageCategory, {
  label: string;
  emoji: string;
  color: string;
}> = {
  holiday:   { label: 'ברכת חג',        emoji: '🎉', color: '#f59e0b' },
  update:    { label: 'הודעת עדכון',    emoji: '📣', color: '#3b82f6' },
  reminder:  { label: 'תזכורת',         emoji: '⏰', color: '#ef4444' },
  follow_up: { label: 'Follow-up',      emoji: '✅', color: '#10b981' },
  service:   { label: 'הודעת שירות',    emoji: '💼', color: '#8b5cf6' },
  custom:    { label: 'הודעה חופשית',   emoji: '✏️', color: '#64748b' },
};

// #endregion

// #region Placeholder Labels

/** תוויות placeholders — מה כל placeholder מייצג */
export const PLACEHOLDER_LABELS: Record<string, string> = {
  name: 'שם מלא',
  firstName: 'שם פרטי',
  company: 'שם חברה',
  holidayName: 'שם החג',
  deadline: 'תאריך יעד',
  missingDocument: 'מסמך חסר',
  lastServiceType: 'סוג טיפול אחרון',
};

// #endregion

// #region Built-in Templates

/**
 * תבניות מובנות — 1 לכל קטגוריה.
 * isBuiltIn = true → לא ניתנות למחיקה.
 * placeholders מוקפים ב-{{ }} בתוך ה-body.
 */
export const BUILT_IN_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl_holiday_pesach',
    name: 'ברכת פסח',
    category: 'holiday',
    body: 'שלום {{name}},\n\nחג פסח שמח! 🌸\nמאחלים לך ולמשפחה חג חירות שמח, בריאות ושגשוג.\n\nבברכה,\nמשרד רו״ח אלדד',
    placeholders: ['name'],
    isBuiltIn: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'tpl_update_status',
    name: 'עדכון סטטוס טיפול',
    category: 'update',
    body: 'היי {{firstName}},\n\nרציתי לעדכן אותך שהתיק שלך מתקדם כמתוכנן.\nאם יש שאלות — אני כאן.\n\nאלדד',
    placeholders: ['firstName'],
    isBuiltIn: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'tpl_reminder_document',
    name: 'תזכורת מסמך חסר',
    category: 'reminder',
    body: 'היי {{name}},\n\nחסר לנו {{missingDocument}} כדי להתקדם בתיק.\nאפשר לשלוח בוואטסאפ או במייל.\n\nתודה! 🙏\nאלדד',
    placeholders: ['name', 'missingDocument'],
    isBuiltIn: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'tpl_followup_service',
    name: 'Follow-up אחרי טיפול',
    category: 'follow_up',
    body: 'שלום {{name}},\n\nרציתי לוודא שהכל תקין אחרי הטיפול ב{{lastServiceType}}.\nאם יש שאלות או משהו שצריך השלמה — אני כאן.\n\nאלדד',
    placeholders: ['name', 'lastServiceType'],
    isBuiltIn: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'tpl_service_general',
    name: 'הודעת שירות כללית',
    category: 'service',
    body: 'שלום {{name}},\n\nרצינו ליידע אותך שהמשרד שלנו מציע כעת שירות חדש שיכול לעניין אותך.\nנשמח לשוחח. אפשר להתקשר או לשלוח הודעה.\n\nבברכה,\nמשרד רו״ח אלדד',
    placeholders: ['name'],
    isBuiltIn: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
];

// #endregion
