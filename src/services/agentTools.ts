/* ============================================
   FILE: agentTools.ts
   PURPOSE: Agent tools — registry, layer filtering, and execution dispatcher
   DEPENDENCIES: agentToolDefinitions.ts, agentToolDefinitionsP2.ts
   EXPORTS: AgentTool, AGENT_TOOLS, getToolsForAgent, executeToolCall, getToolDeclarations
   ============================================ */
/**
 * Agent Tools — The "Hands" of the AI Agents
 *
 * Each tool is a real function the agent can call via Gemini Function Calling.
 * Tool definitions are in agentToolDefinitions.ts.
 * This file provides the registry, filtering, and execution logic.
 *
 * @see agent_operating_protocol.md for agent roles
 */

import type {
  FunctionDeclaration,
  FunctionDeclarationsTool,
} from '@google/generative-ai';
import {
  searchKnowledgeTool,
  searchProcessesTool,
  saveNoteTool,
  createTaskTool,
  generateDocumentDraftTool,
} from './agentToolDefinitions';
import {
  searchPastMissionsTool,
  requestHumanInputTool,
} from './agentToolDefinitionsP2';
import {
  getCaseContextTool,
  updateCaseDraftTool,
  evaluateCaseReadinessTool,
  generateCaseOutputTool,
  approveCaseDraftTool,
} from './agentToolDefinitionsCase';

// #region Types

/** A tool that an agent can call */
export interface AgentTool {
  /** Unique tool name (must match FunctionDeclaration.name) */
  name: string;
  /** Hebrew description for logs */
  descriptionHe: string;
  /** Which agent layers can use this tool */
  allowedLayers: string[];
  /** The Gemini FunctionDeclaration */
  declaration: FunctionDeclaration;
  /** The actual execution function */
  execute: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

// #endregion

// #region Tool Registry

/** All available agent tools */
export const AGENT_TOOLS: AgentTool[] = [
  searchKnowledgeTool,
  searchProcessesTool,
  saveNoteTool,
  createTaskTool,
  generateDocumentDraftTool,
  // Phase 2 tools
  searchPastMissionsTool,
  requestHumanInputTool,
  // Case tools — bridge agent layer ↔ case layer
  getCaseContextTool,
  updateCaseDraftTool,
  evaluateCaseReadinessTool,
  approveCaseDraftTool,
  generateCaseOutputTool,
];

/**
 * Get tools available for a specific agent based on its layer.
 *
 * @param agentLayer - The agent's layer (command, construction, etc.)
 * @returns Array of tools the agent can use
 */
export function getToolsForAgent(agentLayer: string): AgentTool[] {
  return AGENT_TOOLS.filter(t => t.allowedLayers.includes(agentLayer));
}

/**
 * Convert agent tools to Gemini FunctionDeclarationsTool format.
 *
 * @param tools - Array of AgentTools to convert
 * @returns Gemini-compatible tool declarations
 */
export function getToolDeclarations(tools: AgentTool[]): FunctionDeclarationsTool {
  return {
    functionDeclarations: tools.map(t => t.declaration),
  };
}

/**
 * Execute a tool call by name with given arguments.
 *
 * @param toolName - Name of the tool to execute
 * @param args - Arguments for the tool
 * @returns Tool execution result
 */
export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const tool = AGENT_TOOLS.find(t => t.name === toolName);
  if (!tool) {
    return { success: false, error: `כלי "${toolName}" לא נמצא` };
  }

  try {
    const result = await tool.execute(args);
    return result;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
    console.error(`[AgentTools] ❌ Tool ${toolName} failed:`, err);
    return { success: false, error: errMsg };
  }
}

// #endregion
