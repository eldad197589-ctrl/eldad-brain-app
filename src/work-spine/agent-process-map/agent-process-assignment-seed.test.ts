/* ==== FILE: src/work-spine/agent-process-map/agent-process-assignment-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { INTERNAL_AGENT_WORKFORCE_AGENTS } from '../agent-workforce/internal-agent-workforce-seed';
import { PROCESS_LIBRARY_BLUEPRINTS } from '../process-library/process-library-seed';
import { AGENT_PROCESS_ASSIGNMENTS, AGENT_PROCESS_ASSIGNMENT_WARNING } from './agent-process-assignment-seed';
// #endregion

// #region Constants
const REQUIRED_ASSIGNMENT_FIELDS = [
  'assignmentId',
  'processId',
  'primaryAgentIds',
  'supportingAgentIds',
  'reviewAgentIds',
  'requiredGate',
  'allowedMode',
  'operationalExecution',
  'canRun',
  'canPersist',
  'canCreateMatter',
  'canCreateWorkItem',
  'canCreateDocumentRef',
] as const;

const FORBIDDEN_OPERATIONAL_KEYS = ['execute', 'run', 'dispatch'] as const;
const FORBIDDEN_TEXT_SNIPPETS = ['agent.run', 'agent.execute', 'dispatchWorkflow', 'createMatter(', 'createWorkItem(', 'createDocumentRef('] as const;
// #endregion

// #region Helpers
const agentIds = (): Set<string> => new Set(INTERNAL_AGENT_WORKFORCE_AGENTS.map((agent) => agent.agentId));
const processIds = (): Set<string> => new Set(PROCESS_LIBRARY_BLUEPRINTS.map((process) => process.processId));
const assignmentAgentIds = (): string[] => AGENT_PROCESS_ASSIGNMENTS.flatMap((assignment) => [...assignment.primaryAgentIds, ...assignment.supportingAgentIds, ...assignment.reviewAgentIds]);
const serializedAssignments = (): string => JSON.stringify(AGENT_PROCESS_ASSIGNMENTS);
// #endregion

// #region Tests
describe('AGENT_PROCESS_ASSIGNMENTS', () => {
  it('maps exactly the 13 committed Process Library blueprints', () => {
    expect(AGENT_PROCESS_ASSIGNMENTS).toHaveLength(13);
    expect(new Set(AGENT_PROCESS_ASSIGNMENTS.map((assignment) => assignment.processId))).toEqual(processIds());
  });

  it('uses only agent identifiers from the 30-agent workforce seed', () => {
    const knownAgentIds = agentIds();

    expect(INTERNAL_AGENT_WORKFORCE_AGENTS).toHaveLength(30);
    for (const agentId of assignmentAgentIds()) {
      expect(knownAgentIds.has(agentId)).toBe(true);
    }
  });

  it('uses only process identifiers from the Process Library seed', () => {
    const knownProcessIds = processIds();

    for (const assignment of AGENT_PROCESS_ASSIGNMENTS) {
      expect(knownProcessIds.has(assignment.processId)).toBe(true);
      expect(assignment.primaryAgentIds.length).toBeGreaterThan(0);
    }
  });

  it('includes every required field and keeps all operation flags false', () => {
    for (const assignment of AGENT_PROCESS_ASSIGNMENTS) {
      for (const fieldName of REQUIRED_ASSIGNMENT_FIELDS) {
        expect(assignment).toHaveProperty(fieldName);
      }

      expect(assignment.allowedMode).toBe('static_preview_only');
      expect(assignment.operationalExecution).toBe(false);
      expect(assignment.canRun).toBe(false);
      expect(assignment.canPersist).toBe(false);
      expect(assignment.canCreateMatter).toBe(false);
      expect(assignment.canCreateWorkItem).toBe(false);
      expect(assignment.canCreateDocumentRef).toBe(false);
    }
  });

  it('does not expose execution-style fields beyond the required canRun flag', () => {
    for (const assignment of AGENT_PROCESS_ASSIGNMENTS) {
      for (const forbiddenKey of FORBIDDEN_OPERATIONAL_KEYS) {
        expect(Object.keys(assignment)).not.toContain(forbiddenKey);
      }
    }
  });

  it('does not contain runtime call snippets or entity creation calls', () => {
    const searchableText = `${AGENT_PROCESS_ASSIGNMENT_WARNING} ${serializedAssignments()}`;

    for (const forbiddenSnippet of FORBIDDEN_TEXT_SNIPPETS) {
      expect(searchableText).not.toContain(forbiddenSnippet);
    }
  });
});
// #endregion
