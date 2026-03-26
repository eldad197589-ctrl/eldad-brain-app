/* ============================================
   FILE: missionPrompts.ts
   PURPOSE: AI prompts and fallback steps for business process execution
   DEPENDENCIES: agentRegistry, processRegistry
   EXPORTS: PLAN_SYSTEM_PROMPT, PROCESS_FALLBACK_STEPS, FILING_FALLBACK_STEPS
   ============================================ */
import { AGENTS, type MissionStep } from '../data/agentRegistry';
import { PROCESS_REGISTRY } from '../data/processRegistry';

// #region AI Planning Prompt

/**
 * System prompt for Gemini — process decomposition into agent steps.
 * Now business-oriented: receives a process + instruction, plans steps with business agents.
 */
export const PLAN_SYSTEM_PROMPT = `אתה "המוח של אלדד" — מערכת ניהול משרד רו"ח.

תפקידך: לקבל הוראה מאלדד ולפרק אותה לשלבי ביצוע עסקיים.

הסוכנים הזמינים:
${AGENTS.map(a => `- ${a.id}: ${a.emoji} ${a.name} — ${a.description}`).join('\n')}

התהליכים המוכרים:
${PROCESS_REGISTRY.map(p => `- ${p.id}: ${p.name} (${p.domain})`).join('\n')}

כללים:
1. תמיד תחזיר JSON בלבד (בלי markdown, בלי הסבר)
2. כל שלב מוקצה לסוכן מהרשימה (לפי id)
3. לא כל תהליך צריך את כל הסוכנים — יש דברים שצריכים רק תיוק
4. אם הבקשה היא רק תיעוד/תיוק — שלח רק intake_agent + submission_agent
5. אם צריך מכתב — הוסף document_agent
6. אם יש החלטה שדורשת את אלדד — הוסף decision_support_agent
7. סדר: קליטה → אימות → ניתוח → החלטה → מסמכים → שליחה

פורמט:
{
  "title": "כותרת המשימה",
  "processId": "id מתוך התהליכים (אם רלוונטי)",
  "steps": [
    { "agentId": "intake_agent", "description": "מה הסוכן צריך לעשות" },
    { "agentId": "document_agent", "description": "מה הסוכן צריך לעשות" }
  ]
}`;

// #endregion

// #region Fallback Steps

/**
 * Default steps for a full business process when AI planning fails.
 * Covers the complete pipeline: intake → validation → analysis → document → submission.
 */
export const PROCESS_FALLBACK_STEPS: MissionStep[] = [
  { id: 'S-1', agentId: 'intake_agent', description: 'קליטה — זיהוי מסמך, מציאת לקוח, פתיחת תיק', status: 'idle' },
  { id: 'S-2', agentId: 'validation_agent', description: 'אימות — בדיקת שלמות נתונים ותנאי סף', status: 'idle' },
  { id: 'S-3', agentId: 'analysis_agent', description: 'ניתוח — חישוב, השוואה, הפקת תובנות', status: 'idle' },
  { id: 'S-4', agentId: 'document_agent', description: 'הפקת מסמכים — מכתב, טופס, או דוח', status: 'idle' },
  { id: 'S-5', agentId: 'submission_agent', description: 'שליחה ותיוק — שליחה, תיעוד, עדכון סטטוס', status: 'idle' },
];

/**
 * Shortened steps for simple filing/documentation tasks.
 * Only intake + filing — no analysis or documents needed.
 */
export const FILING_FALLBACK_STEPS: MissionStep[] = [
  { id: 'S-1', agentId: 'intake_agent', description: 'קליטה — זיהוי וסיווג המסמך', status: 'idle' },
  { id: 'S-2', agentId: 'submission_agent', description: 'תיוק — שמירה בתיק ועדכון סטטוס', status: 'idle' },
];

// Keep backward compatibility — re-export with old names
export const BUILD_FALLBACK_STEPS = PROCESS_FALLBACK_STEPS;
export const AUDIT_FALLBACK_STEPS = PROCESS_FALLBACK_STEPS;

// #endregion
