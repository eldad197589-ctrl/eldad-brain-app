/**
 * FILE: agentExecutionService.ts
 * PURPOSE: Real AI execution engine for agent mission steps
 * DEPENDENCIES: geminiService.ts, agentRegistry.ts, ragService.ts
 *
 * Executes agent steps by building agent-specific prompts,
 * injecting mission context and previous step outputs (handoff),
 * and calling Gemini for real AI responses.
 */

import { sendBrainMessage, isAIConfigured, type ChatMessage } from './geminiService';
import { queryKnowledge, getRAGStatus } from './ragService';
import { AGENTS, type Mission, type MissionStep } from '../data/agentRegistry';

// #region Types

/** Result of an agent step execution */
export interface StepExecutionResult {
  /** The agent's output text */
  output: string;
  /** Whether execution succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Execution duration in ms */
  durationMs: number;
}

// #endregion

// #region Prompt Building

/**
 * Build an agent-specific system prompt for step execution.
 *
 * @param mission - The parent mission
 * @param step - The step to execute
 * @param previousOutputs - Outputs from completed previous steps (handoff)
 * @returns Formatted prompt for Gemini
 */
function buildAgentPrompt(
  mission: Mission,
  step: MissionStep,
  previousOutputs: string[],
): string {
  const agent = AGENTS.find(a => a.id === step.agentId);
  const agentName = agent?.name || step.agentId;
  const agentEmoji = agent?.emoji || '🤖';
  const capabilities = agent?.capabilities.join(', ') || 'כללי';

  let prompt = `אתה סוכן AI בשם "${agentEmoji} ${agentName}".

═══ תפקידך ═══
${agent?.description || 'סוכן AI במערכת המוח של אלדד'}

═══ יכולות ═══
${capabilities}

═══ משימה ═══
שם המערכת: ${mission.systemName}
מצב: ${mission.mode === 'build' ? 'בנייה חדשה' : 'ביקורת ותיקון'}
הוראת CEO: ${mission.instruction}

═══ השלב שלך ═══
${step.description}

═══ כללים ═══
1. ענה בעברית מקצועית
2. היה ממוקד ומעשי — לא תיאורטי
3. אם אתה לא בטוח — אמור שאתה לא בטוח
4. תן פלט מובנה וברור (רשימות, טבלאות, שלבים)
5. אל תמציא נתונים — עבוד רק עם מה שיש`;

  // Add handoff from previous steps
  if (previousOutputs.length > 0) {
    prompt += '\n\n═══ ממצאי סוכנים קודמים ═══';
    previousOutputs.forEach((output, i) => {
      const prevStep = mission.steps[i];
      const prevAgent = AGENTS.find(a => a.id === prevStep?.agentId);
      prompt += `\n\n--- ${prevAgent?.emoji || '📋'} ${prevAgent?.name || `שלב ${i + 1}`} ---\n${output}`;
    });
    prompt += '\n═══ סוף ממצאים קודמים ═══';
    prompt += '\n\nהשתמש בממצאים שלמעלה כבסיס לעבודתך. המשך מאיפה שהסוכן הקודם הפסיק.';
  }

  return prompt;
}

// #endregion

// #region Execution

/**
 * Execute a single agent step with AI.
 *
 * @param mission - The parent mission
 * @param step - The step to execute
 * @returns Execution result with output text
 */
export async function executeAgentStep(
  mission: Mission,
  step: MissionStep,
): Promise<StepExecutionResult> {
  const startTime = Date.now();

  if (!isAIConfigured()) {
    return {
      output: '',
      success: false,
      error: 'מפתח ה-API של Gemini לא מוגדר. לא ניתן להריץ סוכנים.',
      durationMs: Date.now() - startTime,
    };
  }

  try {
    // Collect previous step outputs (handoff chain)
    const previousOutputs = mission.steps
      .filter(s => s.status === 'done' && s.output)
      .map(s => s.output as string);

    // Build agent-specific prompt
    const agentPrompt = buildAgentPrompt(mission, step, previousOutputs);

    // Optionally enrich with RAG knowledge
    let knowledgeContext: string | undefined;
    if (getRAGStatus() === 'ready' || getRAGStatus() === 'fallback') {
      const relevantChunks = await queryKnowledge(
        `${mission.instruction} ${step.description}`,
        2,
      );
      if (relevantChunks.length > 0) {
        knowledgeContext = relevantChunks
          .map(c => `[${c.sourceFile}] ${c.content}`)
          .join('\n\n');
      }
    }

    // Send to Gemini with agent prompt as "history"
    const history: ChatMessage[] = [{
      role: 'user',
      content: agentPrompt,
      timestamp: new Date().toISOString(),
    }];

    const output = await sendBrainMessage(
      history,
      `בצע את השלב: ${step.description}`,
      undefined,
      knowledgeContext,
    );

    return {
      output,
      success: true,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה';
    console.error(`[Agent] ❌ Step ${step.id} failed:`, err);

    return {
      output: '',
      success: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Execute all remaining steps of a mission sequentially.
 * Each step's output feeds into the next (handoff).
 *
 * @param mission - The mission to execute
 * @param onStepComplete - Callback after each step completes
 * @returns Updated mission with all outputs
 */
export async function runFullMission(
  mission: Mission,
  onStepComplete?: (step: MissionStep, result: StepExecutionResult) => void,
): Promise<Mission> {
  const updatedMission: Mission = { ...mission, status: 'executing' };

  for (const step of updatedMission.steps) {
    if (step.status === 'done') continue; // Skip already completed
    if (step.status === 'error') continue; // Skip errored steps

    // Mark as working
    step.status = 'working';
    step.startedAt = new Date().toISOString();

    // Execute
    const result = await executeAgentStep(updatedMission, step);

    if (result.success) {
      step.status = 'done';
      step.output = result.output;
      step.completedAt = new Date().toISOString();
    } else {
      step.status = 'error';
      step.output = result.error || 'ביצוע נכשל';
    }

    // Notify caller
    if (onStepComplete) {
      onStepComplete(step, result);
    }

    // Small delay between steps to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Update mission status
  const allDone = updatedMission.steps.every(s => s.status === 'done');
  const hasErrors = updatedMission.steps.some(s => s.status === 'error');

  if (allDone) {
    updatedMission.status = 'review';
  } else if (hasErrors) {
    updatedMission.status = 'review';
  }

  return updatedMission;
}

// #endregion
