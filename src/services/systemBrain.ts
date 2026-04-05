/* ============================================
   FILE: systemBrain.ts
   PURPOSE: systemBrain module
   DEPENDENCIES: None (local only)
   EXPORTS: loadMissions, updateStepStatus, startNextStep, generateForm4, deleteMission
   ============================================ */
/**
 * System Brain — The Orchestrator for Agent Missions
 *
 * Takes an instruction from Eldad, uses Gemini AI to break it down
 * into agent steps, and manages the mission pipeline.
 */

import { sendBrainMessage, isAIConfigured, type ChatMessage } from './geminiService';
import { type Mission, type MissionStep, type Form4Report } from '../data/agentRegistry';
import {
  executeAgentStep,
  runFullMission as runAllSteps,
  type StepExecutionResult,
} from './agentExecutionService';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { PLAN_SYSTEM_PROMPT } from './missionPrompts';

// #region Mission Management

const MISSIONS_KEY = 'brain_missions';

/** Load all missions from localStorage */
export function loadMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(MISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Save missions to localStorage */
function saveMissions(missions: Mission[]): void {
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
}

/** Generate a short unique ID */
function genId(): string {
  return `M-${Date.now().toString(36).toUpperCase()}`;
}

// #endregion

// #region AI-Powered Mission Planning

/** Ask AI to plan a mission from an instruction, using fallbacks if AI is unavailable */
export async function planMission(
  instruction: string,
  mode: 'process' | 'filing' | 'build' | 'audit',
  systemName: string,
): Promise<Mission> {
  const modeContext = mode === 'filing'
    ? 'זו משימת תיוק בלבד — רק לקלוט ולתייק.'
    : 'זו משימת תהליך מלא — קליטה, אימות, ניתוח, הפקה, שליחה.';;

  let steps: MissionStep[] = [];
  let title = systemName;

  if (isAIConfigured()) {
    try {
      const prompt = `${modeContext}\n\nשם המערכת: ${systemName}\n\nהוראת CEO:\n${instruction}`;
      const history: ChatMessage[] = [{
        role: 'user',
        content: PLAN_SYSTEM_PROMPT,
        timestamp: new Date().toISOString(),
      }];

      const response = await sendBrainMessage(history, prompt);

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        title = parsed.title || systemName;
        steps = (parsed.steps || []).map((s: { agentId: string; description: string }, i: number) => ({
          id: `S-${i + 1}`,
          agentId: s.agentId,
          description: s.description,
          status: 'idle' as const,
        }));
      }
    } catch (err) {
      console.error('AI planning failed, using fallback:', err);
    }
  }

  if (steps.length === 0) {
    const { PROCESS_FALLBACK_STEPS, FILING_FALLBACK_STEPS } = await import('./missionPrompts');
    steps = (mode === 'filing' ? FILING_FALLBACK_STEPS : PROCESS_FALLBACK_STEPS)
      .map(s => ({ ...s }));
  }

  const mission: Mission = {
    id: genId(),
    mode,
    title,
    instruction,
    systemName,
    steps,
    status: 'planning',
    createdAt: new Date().toISOString(),
  };

  // Save
  const all = loadMissions();
  all.unshift(mission);
  saveMissions(all);

  return mission;
}

/** Inject a pre-planned mission (e.g. from caseMissionPlanner) into the brain */
export function launchPreconfiguredMission(mission: Mission): Mission {
  const all = loadMissions();
  all.unshift(mission);
  saveMissions(all);
  return mission;
}

// #endregion

// #region Step Execution

/** Update a step's status */
export function updateStepStatus(
  missionId: string,
  stepId: string,
  status: MissionStep['status'],
  output?: string,
): Mission | null {
  const all = loadMissions();
  const mission = all.find(m => m.id === missionId);
  if (!mission) return null;

  const step = mission.steps.find(s => s.id === stepId);
  if (!step) return null;

  step.status = status;
  if (output) step.output = output;
  if (status === 'working') step.startedAt = new Date().toISOString();
  if (status === 'done') step.completedAt = new Date().toISOString();

  // Auto-update mission status
  const allDone = mission.steps.every(s => s.status === 'done');
  const anyWorking = mission.steps.some(s => s.status === 'working');
  if (allDone) mission.status = 'review';
  else if (anyWorking) mission.status = 'executing';

  saveMissions(all);
  return mission;
}

/** Start executing next idle step */
export function startNextStep(missionId: string): MissionStep | null {
  const all = loadMissions();
  const mission = all.find(m => m.id === missionId);
  if (!mission) return null;

  const nextIdle = mission.steps.find(s => s.status === 'idle');
  if (!nextIdle) return null;

  nextIdle.status = 'working';
  nextIdle.startedAt = new Date().toISOString();
  mission.status = 'executing';

  saveMissions(all);
  syncMissionToSupabase(mission);
  return nextIdle;
}

/**
 * Execute the next idle step with real AI.
 * Calls Gemini with agent-specific prompt and handoff context.
 *
 * @param missionId - Mission to execute
 * @param onComplete - Callback after step completes
 * @returns The executed step with output, or null if no steps remain
 */
export async function executeNextStep(
  missionId: string,
  onComplete?: (step: MissionStep, result: StepExecutionResult) => void,
): Promise<MissionStep | null> {
  const all = loadMissions();
  const mission = all.find(m => m.id === missionId);
  if (!mission) return null;

  const nextIdle = mission.steps.find(s => s.status === 'idle');
  if (!nextIdle) return null;

  // Mark as working
  nextIdle.status = 'working';
  nextIdle.startedAt = new Date().toISOString();
  mission.status = 'executing';
  saveMissions(all);

  // Execute with real AI
  const result = await executeAgentStep(mission, nextIdle);

  if (result.success) {
    nextIdle.status = 'done';
    nextIdle.output = result.output;
    nextIdle.completedAt = new Date().toISOString();
  } else {
    nextIdle.status = 'error';
    nextIdle.output = result.error || 'ביצוע נכשל';
  }

  // Update mission status
  const allDone = mission.steps.every(s => s.status === 'done');
  if (allDone) mission.status = 'review';

  saveMissions(all);
  syncMissionToSupabase(mission);

  if (onComplete) onComplete(nextIdle, result);
  return nextIdle;
}

/**
 * Run all remaining steps of a mission sequentially with real AI.
 * Each step's output feeds into the next step's context (handoff).
 *
 * @param missionId - Mission to run
 * @param onStepComplete - Callback after each step
 * @returns Updated mission, or null if not found
 */
export async function runFullMissionPipeline(
  missionId: string,
  onStepComplete?: (step: MissionStep, result: StepExecutionResult) => void,
): Promise<Mission | null> {
  const all = loadMissions();
  const mission = all.find(m => m.id === missionId);
  if (!mission) return null;

  const updated = await runAllSteps(mission, (step, result) => {
    // Persist after each step
    const currentAll = loadMissions();
    const currentMission = currentAll.find(m => m.id === missionId);
    if (currentMission) {
      const matchStep = currentMission.steps.find(s => s.id === step.id);
      if (matchStep) {
        Object.assign(matchStep, step);
      }
      currentMission.status = mission.status;
      saveMissions(currentAll);
      syncMissionToSupabase(currentMission);
    }
    if (onStepComplete) onStepComplete(step, result);
  });

  // Final save
  const finalAll = loadMissions();
  const finalMission = finalAll.find(m => m.id === missionId);
  if (finalMission) {
    Object.assign(finalMission, { steps: updated.steps, status: updated.status });
    saveMissions(finalAll);
    syncMissionToSupabase(finalMission);
  }

  return updated;
}

// #endregion

// #region Form 4 — Completion Certificate

/** Generate Form 4 for a completed mission */
export function generateForm4(missionId: string): Form4Report | null {
  const all = loadMissions();
  const mission = all.find(m => m.id === missionId);
  if (!mission) return null;

  const doneSteps = mission.steps.filter(s => s.status === 'done');
  const errorSteps = mission.steps.filter(s => s.status === 'error');

  const report: Form4Report = {
    systemName: mission.systemName,
    version: '1.0',
    agentsUsed: [...new Set(mission.steps.map(s => s.agentId))],
    checklist: Object.fromEntries(
      mission.steps.map(s => [s.description, s.status === 'done'])
    ),
    issuesFound: errorSteps.length,
    healthScore: Math.round((doneSteps.length / mission.steps.length) * 100),
    recommendation: errorSteps.length === 0 ? 'approved' : 'needs_fix',
    completedAt: new Date().toISOString(),
  };

  mission.form4 = report;
  mission.status = 'completed';
  saveMissions(all);

  return report;
}

/** Delete a mission */
export function deleteMission(missionId: string): void {
  const all = loadMissions().filter(m => m.id !== missionId);
  saveMissions(all);

  // Also delete from Supabase
  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      sb.from('missions').delete().eq('id', missionId)
        .then(({ error }) => {
          if (error) console.warn('[Brain] Supabase delete mission error:', error.message);
        });
    }
  }
}

// #endregion

// #region Supabase Sync

/**
 * Sync a mission to Supabase (fire-and-forget).
 *
 * @param mission - Mission to sync
 */
function syncMissionToSupabase(mission: Mission): void {
  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  if (!sb) return;

  sb.from('missions').upsert({
    id: mission.id,
    mode: mission.mode,
    title: mission.title,
    instruction: mission.instruction,
    system_name: mission.systemName,
    steps: mission.steps,
    status: mission.status,
    form4: mission.form4 || null,
    created_at: mission.createdAt,
  }).then(({ error }) => {
    if (error) console.warn('[Brain] Supabase sync mission error:', error.message);
  });
}

// #endregion
