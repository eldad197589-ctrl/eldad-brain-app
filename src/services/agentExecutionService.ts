/* ============================================
   FILE: agentExecutionService.ts
   PURPOSE: Real AI execution engine with dual mode — legacy (text-only) + tool mode (Function Calling)
   DEPENDENCIES: geminiService.ts, agentRegistry.ts, ragService.ts, agentTools.ts, agentMemory.ts
   EXPORTS: StepExecutionResult, executeAgentStep, runFullMission
   ============================================ */
/**
 * Agent Execution Service — The Engine That Runs Agents
 *
 * Two execution modes:
 * 1. **Legacy Mode** — Agent gets a prompt, returns text (original behavior)
 * 2. **Tool Mode** — Agent can call tools via Gemini Function Calling (AGI mode)
 *
 * Tool Mode is used when available; Legacy Mode is the fallback.
 * Every execution is recorded in AgentMemory for persistent history.
 */

import { sendBrainMessage, sendWithTools, isAIConfigured, type ChatMessage } from './geminiService';
import { queryKnowledge, getRAGStatus } from './ragService';
import { AGENTS, type Mission, type MissionStep } from '../data/agentRegistry';
import { getToolsForAgent, getToolDeclarations, executeToolCall } from './agentTools';
import { saveAgentRun, saveToolResult } from './agentMemory';
import { buildAgentPrompt, parseHandoffPayload, type HandoffPayload } from './agentPromptBuilder';

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
  /** Names of tools used (if tool mode) */
  toolsUsed?: string[];
  /** Execution mode that was used */
  mode?: 'legacy' | 'tool';
  /** Structured handoff payload parsed from output */
  handoff?: HandoffPayload;
}

// #endregion

// #region Tool Mode Execution

/**
 * Execute a step using Gemini Function Calling (Tool Mode).
 * The agent can call tools autonomously during generation.
 *
 * @param mission - The parent mission
 * @param step - The step to execute
 * @param agentPrompt - Pre-built agent system prompt
 * @returns Execution result with tool usage details
 */
async function executeWithTools(
  mission: Mission,
  step: MissionStep,
  agentPrompt: string,
): Promise<StepExecutionResult> {
  const startTime = Date.now();
  const agent = AGENTS.find(a => a.id === step.agentId);
  const agentLayer = agent?.layer || 'command';
  const tools = getToolsForAgent(agentLayer);

  if (tools.length === 0) {
    return executeLegacy(mission, step, agentPrompt);
  }

  const toolDeclarations = getToolDeclarations(tools);
  const toolCallNames: string[] = [];

  try {
    const result = await sendWithTools(
      agentPrompt,
      `בצע את השלב: ${step.description}`,
      toolDeclarations,
      async (name, args) => {
        toolCallNames.push(name);
        const toolResult = await executeToolCall(name, args);

        // Save tool result to memory
        await saveToolResult({
          runId: `${mission.id}_${step.id}`,
          toolName: name,
          toolInput: args,
          toolOutput: toolResult,
          success: (toolResult.success as boolean) !== false,
        });

        return toolResult;
      },
    );

    const durationMs = Date.now() - startTime;

    // Save run to memory
    await saveAgentRun({
      missionId: mission.id,
      agentId: step.agentId,
      stepId: step.id,
      stepDescription: step.description,
      inputPrompt: agentPrompt.substring(0, 2000),
      outputText: result.text.substring(0, 5000),
      toolsUsed: toolCallNames,
      durationMs,
      success: true,
    });

    console.log(`[Agent] ✅ Step ${step.id} (tool mode) — ${toolCallNames.length} tool calls, ${durationMs}ms`);

    return {
      output: result.text,
      success: true,
      durationMs,
      toolsUsed: toolCallNames,
      mode: 'tool',
      handoff: parseHandoffPayload(result.text),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה';
    console.error(`[Agent] ❌ Step ${step.id} (tool mode) failed:`, err);

    await saveAgentRun({
      missionId: mission.id,
      agentId: step.agentId,
      stepId: step.id,
      stepDescription: step.description,
      toolsUsed: toolCallNames,
      durationMs: Date.now() - startTime,
      success: false,
      errorMessage,
    });

    return {
      output: '',
      success: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
      toolsUsed: toolCallNames,
      mode: 'tool',
    };
  }
}

// #endregion

// #region Legacy Mode Execution

/**
 * Execute a step in legacy mode (text-only, no tools).
 * Original behavior preserved for backward compatibility.
 *
 * @param mission - The parent mission
 * @param step - The step to execute
 * @param agentPrompt - Pre-built agent system prompt
 * @returns Execution result
 */
async function executeLegacy(
  mission: Mission,
  step: MissionStep,
  agentPrompt: string,
): Promise<StepExecutionResult> {
  const startTime = Date.now();

  try {
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

    const durationMs = Date.now() - startTime;

    // Save run to memory
    await saveAgentRun({
      missionId: mission.id,
      agentId: step.agentId,
      stepId: step.id,
      stepDescription: step.description,
      inputPrompt: agentPrompt.substring(0, 2000),
      outputText: output.substring(0, 5000),
      toolsUsed: [],
      durationMs,
      success: true,
    });

    return {
      output,
      success: true,
      durationMs,
      toolsUsed: [],
      mode: 'legacy',
      handoff: parseHandoffPayload(output),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה';
    console.error(`[Agent] ❌ Step ${step.id} (legacy) failed:`, err);

    await saveAgentRun({
      missionId: mission.id,
      agentId: step.agentId,
      stepId: step.id,
      stepDescription: step.description,
      toolsUsed: [],
      durationMs: Date.now() - startTime,
      success: false,
      errorMessage,
    });

    return {
      output: '',
      success: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
      mode: 'legacy',
    };
  }
}

// #endregion

// #region Public API

/**
 * Execute a single agent step with AI.
 * Automatically selects Tool Mode or Legacy Mode based on agent capabilities.
 *
 * @param mission - The parent mission
 * @param step - The step to execute
 * @returns Execution result with output text
 */
export async function executeAgentStep(
  mission: Mission,
  step: MissionStep,
): Promise<StepExecutionResult> {
  if (!isAIConfigured()) {
    return {
      output: '',
      success: false,
      error: 'מפתח ה-API של Gemini לא מוגדר. לא ניתן להריץ סוכנים.',
      durationMs: 0,
    };
  }

  // Collect previous step outputs (handoff chain)
  const previousOutputs = mission.steps
    .filter(s => s.status === 'done' && s.output)
    .map(s => s.output as string);

  // Check if agent has tools available
  const agent = AGENTS.find(a => a.id === step.agentId);
  const agentLayer = agent?.layer || 'command';
  const availableTools = getToolsForAgent(agentLayer);
  const hasTools = availableTools.length > 0;

  // Build prompt (with tool instructions if applicable)
  const agentPrompt = buildAgentPrompt(mission, step, previousOutputs, hasTools);

  // Execute in the appropriate mode
  if (hasTools) {
    console.log(`[Agent] 🔧 Executing ${step.id} in TOOL MODE (${availableTools.length} tools)`);
    return executeWithTools(mission, step, agentPrompt);
  }

  console.log(`[Agent] 📝 Executing ${step.id} in LEGACY MODE`);
  return executeLegacy(mission, step, agentPrompt);
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
    if (step.status === 'done') continue;
    if (step.status === 'error') continue;

    step.status = 'working';
    step.startedAt = new Date().toISOString();

    const result = await executeAgentStep(updatedMission, step);

    if (result.success) {
      step.status = 'done';
      step.output = result.output;
      step.completedAt = new Date().toISOString();
    } else {
      step.status = 'error';
      step.output = result.error || 'ביצוע נכשל';
    }

    if (onStepComplete) {
      onStepComplete(step, result);
    }

    // Rate limiting delay between steps
    await new Promise(r => setTimeout(r, 500));
  }

  const allDone = updatedMission.steps.every(s => s.status === 'done');
  const hasErrors = updatedMission.steps.some(s => s.status === 'error');

  if (allDone || hasErrors) {
    updatedMission.status = 'review';
  }

  return updatedMission;
}

// #endregion
