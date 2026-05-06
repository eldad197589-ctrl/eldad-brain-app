/* ==== FILE: src/work-spine/agent-workforce/internal-agent-workforce-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  INTERNAL_AGENT_WORKFORCE_AGENTS,
  INTERNAL_AGENT_WORKFORCE_LABEL,
  INTERNAL_AGENT_WORKFORCE_WARNING,
} from './internal-agent-workforce-seed';
import { INTERNAL_AGENT_DOMAINS, INTERNAL_AGENT_STATUSES } from './internal-agent-workforce-types';
import seedSource from './internal-agent-workforce-seed.ts?raw';
import typeSource from './internal-agent-workforce-types.ts?raw';
import type { InternalAgentWorkforceAgent } from './internal-agent-workforce-types';
// #endregion

// #region Constants
const REQUIRED_AGENT_FIELDS = [
  'agentId',
  'hebrewName',
  'domain',
  'role',
  'inputs',
  'outputs',
  'forbiddenActions',
  'requiredGateBeforeAction',
  'status',
  'operationalExecution',
] as const satisfies readonly (keyof InternalAgentWorkforceAgent)[];

const REQUIRED_AGENT_IDS = [
  'intake-signal-agent',
  'scanned-intake-index-agent',
  'external-source-index-agent',
  'document-kind-preview-agent',
  'missing-fields-agent',
  'source-trace-agent',
  'income-tax-router-agent',
  'section-102-pointer-agent',
  'capital-gains-context-agent',
  'capital-statement-context-agent',
  'vat-evidence-agent',
  'vat-external-context-agent',
  'supplier-vat-fields-agent',
  'attendance-payroll-context-agent',
  'labor-law-context-agent',
  'tsila-context-agent',
  'employee-lifecycle-agent',
  'client-context-agent',
  'case-shape-preview-agent',
  'duplicate-risk-agent',
  'letter-shape-agent',
  'document-export-shape-agent',
  'filing-package-shape-agent',
  'safety-qa-agent',
  'evidence-qa-agent',
  'wording-risk-agent',
  'knowledge-inventory-agent',
  'visual-surface-audit-agent',
  'ceo-brief-agent',
  'agent-workforce-planner',
] as const;

const RAW_SOURCE_TEXT = `${seedSource}\n${typeSource}`;
// #endregion

// #region Tests
describe('INTERNAL_AGENT_WORKFORCE_AGENTS', () => {
  it('exports the static Hebrew label and warning', () => {
    expect(INTERNAL_AGENT_WORKFORCE_LABEL).toBe('מלאי סוכנים פנימי סטטי');
    expect(INTERNAL_AGENT_WORKFORCE_WARNING).toContain('אין סוכן רץ');
    expect(INTERNAL_AGENT_WORKFORCE_WARNING).toContain('אין פעולה');
  });

  it('exports exactly the 30 planned static agents', () => {
    expect(INTERNAL_AGENT_WORKFORCE_AGENTS).toHaveLength(30);
    expect(INTERNAL_AGENT_WORKFORCE_AGENTS.map((agent) => agent.agentId)).toEqual(REQUIRED_AGENT_IDS);
  });

  it('includes every required property on every agent', () => {
    for (const agent of INTERNAL_AGENT_WORKFORCE_AGENTS) {
      for (const field of REQUIRED_AGENT_FIELDS) {
        expect(agent).toHaveProperty(field);
      }
      expect(agent.hebrewName.length).toBeGreaterThan(0);
      expect(agent.role.length).toBeGreaterThan(0);
      expect(agent.inputs.length).toBeGreaterThan(0);
      expect(agent.outputs.length).toBeGreaterThan(0);
      expect(agent.forbiddenActions.length).toBeGreaterThan(0);
      expect(agent.requiredGateBeforeAction.length).toBeGreaterThan(0);
    }
  });

  it('keeps every static agent non-operational', () => {
    for (const agent of INTERNAL_AGENT_WORKFORCE_AGENTS) {
      expect(agent.operationalExecution).toBe(false);
      expect(agent.forbiddenActions).toContain('אין פעולה חיה');
      expect(agent.forbiddenActions).toContain('אין שמירה');
      expect(agent.forbiddenActions).toContain('אין יצירת רשומה');
    }
  });

  it('covers all required workforce groups through static domains', () => {
    const domains = new Set(INTERNAL_AGENT_WORKFORCE_AGENTS.map((agent) => agent.domain));
    for (const domain of INTERNAL_AGENT_DOMAINS) {
      expect(domains.has(domain)).toBe(true);
    }
  });

  it('uses only allowed static statuses', () => {
    for (const agent of INTERNAL_AGENT_WORKFORCE_AGENTS) {
      expect(INTERNAL_AGENT_STATUSES).toContain(agent.status);
    }
    expect(INTERNAL_AGENT_WORKFORCE_AGENTS.some((agent) => agent.status === 'blocked')).toBe(true);
    expect(INTERNAL_AGENT_WORKFORCE_AGENTS.some((agent) => agent.status === 'future')).toBe(true);
  });

  it('does not define executable agent surface fields', () => {
    const blockedFieldNames = ['run', 'handler', 'callback', 'workflow', 'automation'];
    for (const agent of INTERNAL_AGENT_WORKFORCE_AGENTS) {
      for (const fieldName of blockedFieldNames) {
        expect(agent).not.toHaveProperty(fieldName);
      }
    }
  });

  it('does not import or mention live system surfaces', () => {
    const blockedImportPattern = (target: string): RegExp => new RegExp(`from ['"].*${target}`, 'i');
    const forbiddenPatterns = [
      blockedImportPattern('run' + 'time'),
      blockedImportPattern('pro' + 'vider'),
      blockedImportPattern('repo' + 'sitory'),
      blockedImportPattern('use' + '-cases'),
      /from ['"]fs['"]/,
      /from ['"]path['"]/,
      /from ['"]xlsx['"]/,
      new RegExp('fet' + 'ch\\s*\\('),
      new RegExp('local' + 'Storage'),
      new RegExp('session' + 'Storage'),
      new RegExp('Supa' + 'base'),
      /\bDB\b/,
      new RegExp('OA' + 'uth'),
      new RegExp('agent' + '\\.run', 'i'),
      new RegExp('cl' + 'ass\\s+\\w+'),
      new RegExp('G' + 'mail'),
      new RegExp('D' + 'rive'),
      new RegExp('Ma' + 'ven'),
      new RegExp('O' + 'CR'),
      new RegExp('\\bA' + 'PI\\b'),
      new RegExp('Work' + 'Item'),
      new RegExp('Mat' + 'ter'),
      new RegExp('Document' + 'Ref'),
    ] as const;

    for (const forbiddenPattern of forbiddenPatterns) {
      expect(RAW_SOURCE_TEXT).not.toMatch(forbiddenPattern);
    }
  });
});
// #endregion
