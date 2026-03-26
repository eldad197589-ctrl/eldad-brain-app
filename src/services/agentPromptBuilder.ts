/* ============================================
   FILE: agentPromptBuilder.ts
   PURPOSE: Build structured system prompts with handoff protocol for AI agent execution
   DEPENDENCIES: agentRegistry.ts
   EXPORTS: buildAgentPrompt, HandoffPayload, parseHandoffPayload
   ============================================ */
/**
 * Agent Prompt Builder — Extracted from agentExecutionService.ts for ≤300 line compliance.
 * Constructs the system prompt with mission context, handoff chain, and tool instructions.
 */

import type { Mission, MissionStep } from '../data/agentRegistry';
import { AGENTS } from '../data/agentRegistry';

// #region Handoff Types

/** Structured handoff payload passed between agents */
export interface HandoffPayload {
  /** Key findings from the agent's work */
  findings: string[];
  /** Decisions the agent made */
  decisions: string[];
  /** Warnings or risks identified */
  warnings: string[];
  /** Recommended next action for the next agent */
  nextAction: string;
  /** Raw text output (fallback) */
  rawText?: string;
}

/**
 * Parse agent output into structured handoff payload.
 * Attempts JSON parsing first, falls back to text extraction.
 *
 * @param output - Raw agent output text
 * @returns Structured handoff payload
 */
export function parseHandoffPayload(output: string): HandoffPayload {
  // Try to extract JSON block from output
  const jsonMatch = output.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || output.match(/(\{[\s\S]*"findings"[\s\S]*\})/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        findings: parsed.findings || [],
        decisions: parsed.decisions || [],
        warnings: parsed.warnings || [],
        nextAction: parsed.nextAction || parsed.next_action || '',
        rawText: output,
      };
    } catch { /* fall through to text extraction */ }
  }

  // Fallback: extract from text heuristically
  const lines = output.split('\n').filter(l => l.trim());
  return {
    findings: lines.filter(l => l.includes('ממצא') || l.includes('נמצא') || l.includes('גילינו')).map(l => l.trim()),
    decisions: lines.filter(l => l.includes('החלטה') || l.includes('הוחלט')).map(l => l.trim()),
    warnings: lines.filter(l => l.includes('אזהרה') || l.includes('סיכון') || l.includes('שימו לב')).map(l => l.trim()),
    nextAction: lines[lines.length - 1] || '',
    rawText: output,
  };
}

// #endregion

// #region Prompt Building

/**
 * Build an agent-specific system prompt for step execution.
 *
 * @param mission - The parent mission
 * @param step - The step to execute
 * @param previousOutputs - Outputs from completed previous steps (handoff)
 * @param hasTools - Whether the agent has tools available
 * @returns Formatted prompt for Gemini
 */
export function buildAgentPrompt(
  mission: Mission,
  step: MissionStep,
  previousOutputs: string[],
  hasTools: boolean,
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

  // Add tool instructions
  if (hasTools) {
    prompt += `

═══ כלים זמינים ═══
יש לך כלים (tools) שאתה יכול להשתמש בהם. השתמש בהם כדי:
- לחפש מידע בבסיס הידע (search_knowledge)
- לחפש תהליכים רלוונטיים (search_processes)
- לשמור ממצאים חשובים (save_note)
- ליצור משימות (create_task)
- ליצור טיוטות מסמכים (generate_document_draft)
- לחפש משימות קודמות (search_past_missions)
- לבקש קלט מהמנכ"ל (request_human_input)

**חובה:** השתמש בכלים כשאתה צריך מידע. אל תנחש — חפש!`;
  }

  // Structured output instructions
  prompt += `

═══ פורמט פלט ═══
בסוף התשובה שלך, הוסף בלוק JSON מובנה עם הממצאים שלך:
\`\`\`json
{
  "findings": ["ממצא 1", "ממצא 2"],
  "decisions": ["החלטה 1"],
  "warnings": ["אזהרה אם יש"],
  "nextAction": "מה הסוכן הבא צריך לעשות"
}
\`\`\`
זה חשוב כדי שהסוכן הבא יוכל להמשיך את העבודה שלך.`;

  // Add handoff from previous steps
  if (previousOutputs.length > 0) {
    prompt += '\n\n═══ ממצאי סוכנים קודמים ═══';
    previousOutputs.forEach((output, i) => {
      const prevStep = mission.steps[i];
      const prevAgent = AGENTS.find(a => a.id === prevStep?.agentId);
      const handoff = parseHandoffPayload(output);

      prompt += `\n\n--- ${prevAgent?.emoji || '📋'} ${prevAgent?.name || `שלב ${i + 1}`} ---`;

      if (handoff.findings.length > 0) {
        prompt += `\nממצאים: ${handoff.findings.join(' | ')}`;
      }
      if (handoff.decisions.length > 0) {
        prompt += `\nהחלטות: ${handoff.decisions.join(' | ')}`;
      }
      if (handoff.warnings.length > 0) {
        prompt += `\n⚠️ אזהרות: ${handoff.warnings.join(' | ')}`;
      }
      if (handoff.nextAction) {
        prompt += `\nהמלצה לשלב הבא: ${handoff.nextAction}`;
      }
      // Always include raw text as fallback context
      prompt += `\nפלט מלא: ${(handoff.rawText || output).substring(0, 800)}`;
    });
    prompt += '\n═══ סוף ממצאים קודמים ═══';
    prompt += '\n\nהשתמש בממצאים המובנים שלמעלה כבסיס לעבודתך. המשך מאיפה שהסוכן הקודם הפסיק.';
  }

  return prompt;
}

// #endregion
