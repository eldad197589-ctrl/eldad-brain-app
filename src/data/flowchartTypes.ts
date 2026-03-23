/* ============================================
   FILE: flowchartTypes.ts
   PURPOSE: Type definitions
   DEPENDENCIES: None (local only)
   EXPORTS: DetailItem, FormulaLine, DecisionBranch, FlowStep, Decision, IronRule, FlowchartResult, FlowchartData
   ============================================ */
/* ═══ Flowchart Types ═══ */

export interface DetailItem {
  icon: string;
  iconBg: string;
  title: string;
  text: string;
  tags?: string[];
}

export interface FormulaLine {
  variable?: string;
  operator?: string;
  expression: string;
  comment?: string;
}

export interface DecisionBranch {
  label: string;
  sub?: string;
  type: 'yes' | 'no' | 'neutral' | 'normal' | 'holiday' | 'night' | 'eve' | 'info';
}

export interface FlowStep {
  num: number;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  badge?: { text: string; type: 'iron' | 'ai' | 'law' | 'calc' | 'done' };
  details: DetailItem[];
  formulas?: { title: string; lines: FormulaLine[] };
}

export interface Decision {
  title: string;
  question?: string;
  branches: DecisionBranch[];
}

export interface IronRule {
  text: string;
}

export interface FlowchartResult {
  title: string;
  text: string;
  emphasis?: string;
}

export interface FlowchartData {
  id: string;
  flowNum: number;
  badge: string;
  title: string;
  subtitle: string;
  steps: FlowStep[];
  decisions?: { afterStep: number; decision: Decision }[];
  ironRules?: IronRule[];
  result: FlowchartResult;
  relatedLinks?: { to: string; label: string }[];
}
