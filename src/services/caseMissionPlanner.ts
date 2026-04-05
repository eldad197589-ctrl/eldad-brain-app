/* ============================================
   FILE: caseMissionPlanner.ts
   PURPOSE: Plans case-specific missions for agent execution.
            Bridges systemBrain (mission orchestrator) with CaseEntity.
            Creates pre-structured mission steps for appeal processing.
   DEPENDENCIES: ../data/agentRegistry, ../store/brainStore
   EXPORTS: planCaseMission, CASE_MISSION_STEPS
   ============================================ */
import type { Mission, MissionStep } from '../data/agentRegistry';
import { useBrainStore } from '../store/brainStore';

// #region Step Templates

/**
 * Pre-defined agent steps for appeal case processing.
 * Each step uses case tools registered in agentToolDefinitionsCase.ts.
 * The order follows the natural appeal workflow:
 * intake → analyze → evaluate → prepare → output → report
 */
const APPEAL_MISSION_STEPS: Omit<MissionStep, 'id'>[] = [
  {
    agentId: 'intake_agent',
    description: 'טען את הקשר התיק עם get_case_context. זהה: סוג תיק, deadline, מסמכים, חסרים, דגלי סיכון.',
    status: 'idle',
  },
  {
    agentId: 'analysis_agent',
    description: 'נתח פערים: השתמש ב-evaluate_case_readiness. בדוק כיסוי טענות רשות, placeholders, ראיות חסרות, מוכנות draft. דווח ממצאים.',
    status: 'idle',
  },
  {
    agentId: 'document_agent',
    description: 'אם ה-draft עדיין template, השתמש ב-update_case_draft כדי לשפר את הגוף. שלב בלוקי טיעון שנבחרו. הסר placeholders שניתן להחליף. אל תמציא עובדות.',
    status: 'idle',
  },
  {
    agentId: 'decision_support_agent',
    description: 'הרץ evaluate_case_readiness שוב. בדוק אם הסטטוס התקדם. דווח חסמים שנותרו. אם נדרש אישור אלדד — ציין זאת.',
    status: 'idle',
  },
  {
    agentId: 'submission_agent',
    description: 'סכם את מצב התיק: מוכנות, חסרים, סיכונים, deadline. אם מוכן — ציין שניתן להפיק טיוטה עם generate_case_output. אם לא — רשום מה חסר.',
    status: 'idle',
  },
];

// #endregion

// #region Mission Planning

/**
 * Create a structured mission for processing a case appeal.
 * The mission is case-aware: caseId is embedded in the mission
 * and passed to agents through the prompt builder.
 *
 * @param caseId - The case to operate on
 * @param instruction - Optional custom instruction from Eldad
 * @returns A fully formed Mission ready for execution
 */
export function planCaseMission(
  caseId: string,
  instruction?: string,
): Mission | { error: string } {
  const caseEntity = useBrainStore.getState().cases.find(c => c.caseId === caseId);
  if (!caseEntity) {
    return { error: `תיק "${caseId}" לא נמצא ב-store` };
  }

  const defaultInstruction = `בדוק ועבד את ערר פיצויי המלחמה של ${caseEntity.clientName} (תיק ${caseId}). `
    + `Deadline: ${caseEntity.deadline}. `
    + `נתח מצב, העריך מוכנות, שפר טיוטה אם אפשר, דווח מה חסר.`;

  const steps: MissionStep[] = APPEAL_MISSION_STEPS.map((step, i) => ({
    ...step,
    id: `CS-${i + 1}`,
  }));

  const mission: Mission = {
    id: `CM-${Date.now().toString(36).toUpperCase()}`,
    mode: 'process',
    title: `ערר: ${caseEntity.clientName} — ${caseEntity.processType}`,
    instruction: instruction || defaultInstruction,
    systemName: 'war_compensation_appeal',
    processId: 'war_compensation',
    clientId: caseEntity.clientName,
    caseId,
    steps,
    status: 'planning',
    createdAt: new Date().toISOString(),
  };

  console.log(`[CaseMissionPlanner] 📋 Mission planned for case "${caseId}": ${steps.length} steps`);
  return mission;
}

// #endregion
