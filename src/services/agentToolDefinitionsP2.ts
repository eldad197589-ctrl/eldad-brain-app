/* ============================================
   FILE: agentToolDefinitionsP2.ts
   PURPOSE: Phase 2 tool definitions — cross-mission search, human input, route-to-agent
   DEPENDENCIES: agentMemory.ts, agentTools.ts
   EXPORTS: searchPastMissionsTool, requestHumanInputTool
   ============================================ */
/**
 * Phase 2 Tool Definitions — Smart Orchestration
 *
 * New tools that enable agents to:
 * - Learn from past missions (cross-mission memory)
 * - Request human input when uncertain (human-in-the-loop)
 */

import { SchemaType } from '@google/generative-ai';
import { getAgentHistory, getAgentNotes } from './agentMemory';
import type { AgentTool } from './agentTools';

// #region Tool: search_past_missions

/** @see AgentTool — search history of previous agent runs and notes */
export const searchPastMissionsTool: AgentTool = {
  name: 'search_past_missions',
  descriptionHe: 'חיפוש בהיסטוריית משימות קודמות',
  allowedLayers: ['command', 'intake', 'processing', 'output', 'support'],
  declaration: {
    name: 'search_past_missions',
    description: 'Search past agent runs and notes for relevant context. Use this to learn from previous work — what agents found, decided, or warned about in similar situations.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        agent_id: {
          type: SchemaType.STRING,
          description: 'Optional: filter by specific agent ID',
        },
        process_id: {
          type: SchemaType.STRING,
          description: 'Optional: filter by process ID',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Number of results (default: 5, max: 10)',
        },
      },
      required: [],
    },
  },
  execute: async (args) => {
    const agentId = args.agent_id as string | undefined;
    const processId = args.process_id as string | undefined;
    const limit = Math.min((args.limit as number) || 5, 10);

    // Get past runs
    const runs = await getAgentHistory({
      agentId,
      limit,
    });

    // Get related notes
    const notes = await getAgentNotes({
      agentId,
      processId,
      limit,
    });

    return {
      success: true,
      runs: runs.map(r => ({
        missionId: r.missionId,
        agentId: r.agentId,
        step: r.stepDescription,
        toolsUsed: r.toolsUsed,
        success: r.success,
        output: r.outputText?.substring(0, 300),
        date: r.createdAt,
      })),
      notes: notes.map(n => ({
        type: n.noteType,
        content: n.content,
        agentId: n.agentId,
        processId: n.processId,
        date: n.createdAt,
      })),
      totalRuns: runs.length,
      totalNotes: notes.length,
    };
  },
};

// #endregion

// #region Tool: request_human_input

/** @see AgentTool — ask CEO for a decision or clarification */
export const requestHumanInputTool: AgentTool = {
  name: 'request_human_input',
  descriptionHe: 'בקשת קלט מהמנכ"ל',
  allowedLayers: ['command', 'intake', 'processing', 'output'],
  declaration: {
    name: 'request_human_input',
    description: 'Request a decision or clarification from the CEO (Eldad). Use this when you encounter ambiguity, need approval for a significant action, or lack information that only a human can provide. The question will be queued for CEO review.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        question: {
          type: SchemaType.STRING,
          description: 'The question or request for the CEO in Hebrew',
        },
        urgency: {
          type: SchemaType.STRING,
          description: 'Urgency level: low, medium, or high',
        },
        options: {
          type: SchemaType.STRING,
          description: 'Optional: comma-separated list of suggested options for the CEO',
        },
        context: {
          type: SchemaType.STRING,
          description: 'Brief context explaining why this input is needed',
        },
      },
      required: ['question', 'urgency'],
    },
  },
  execute: async (args) => {
    const question = args.question as string;
    const urgency = (args.urgency as string) || 'medium';
    const options = args.options as string | undefined;
    const context = args.context as string | undefined;

    // Store as a pending CEO question in localStorage
    const pendingKey = 'brain_ceo_questions';
    const existing = JSON.parse(localStorage.getItem(pendingKey) || '[]');

    const questionEntry = {
      id: `q_${Date.now().toString(36)}`,
      question,
      urgency,
      options: options ? options.split(',').map(o => o.trim()) : [],
      context,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    existing.unshift(questionEntry);
    localStorage.setItem(pendingKey, JSON.stringify(existing));

    console.log(`[Agent] 👔 CEO question queued: "${question}" (${urgency})`);

    return {
      success: true,
      questionId: questionEntry.id,
      message: `השאלה נשלחה למנכ"ל — "${question}"`,
      status: 'pending',
      note: 'המשך לעבוד על מה שאתה יכול. כשהמנכ"ל יענה, התשובה תהיה זמינה.',
    };
  },
};

// #endregion
