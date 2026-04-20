/*
 * This registry seed is a structural placeholder only.
 * It must not be used to calculate salary compensation.
 */

// ----------------------------------------------------------------------
// Controlled Vocabularies (B4.3)
// ----------------------------------------------------------------------

export type BlockerId =
  | 'BLOCKER_01'
  | 'BLOCKER_02'
  | 'BLOCKER_03'
  | 'BLOCKER_04'
  | 'BLOCKER_05'
  | 'BLOCKER_06';

export type RouteScope = 'red_standard' | 'green_standard' | 'am_kelavi' | 'indirect_business';
export type ClaimantScope = 'all' | 'smb' | 'enterprise' | 'nonprofit' | 'public';
export type ComponentScope = 'salary_costs' | 'business_costs' | 'lost_profits';
export type RuleType = 'formula' | 'definition' | 'ruleset' | 'coefficient' | 'offset' | 'ceiling';
export type SourceType = 'execution_instruction' | 'legislation' | 'judicial_precedent' | 'unknown';
export type VerificationStatus = 'raw_unverified' | 'partially_verified' | 'verified_complete' | 'conflicting';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_clarification';

// ----------------------------------------------------------------------
// Canonical Intake Schema Type
// ----------------------------------------------------------------------

export interface SalaryNormativeKnowledgeItem {
  knowledgeId: string;
  blockerId: BlockerId;
  title: string;
  routeScope: RouteScope;
  claimantScope: ClaimantScope;
  appliesToComponent: ComponentScope;
  ruleType: RuleType;
  normativeContent: string;
  formulaExpression: Record<string, unknown> | null;
  variableDefinitions: Record<string, unknown> | null;
  coefficientTable: Record<string, unknown> | null;
  offsetRules: Record<string, unknown> | null;
  ceilingRules: Record<string, unknown> | null;
  exclusions: string[];
  ambiguityNotes: string | null;
  sourceType: SourceType;
  sourceReference: string | null;
  sourceDate: Date | null;
  effectiveDateRange: Date[];
  verificationStatus: VerificationStatus;
  enteredBy: string;
  reviewStatus: ReviewStatus;
}

// ----------------------------------------------------------------------
// Validated Data Seed
// ----------------------------------------------------------------------

export const salaryNormativeRegistrySeed: SalaryNormativeKnowledgeItem[] = [
  {
    knowledgeId: 'SAL_NORM_01_FORMULA',
    blockerId: 'BLOCKER_01',
    title: 'Salary Compensation Formula Placeholder',
    routeScope: 'red_standard',
    claimantScope: 'all',
    appliesToComponent: 'salary_costs',
    ruleType: 'formula',
    normativeContent: '',
    formulaExpression: null,
    variableDefinitions: null,
    coefficientTable: null,
    offsetRules: null,
    ceilingRules: null,
    exclusions: [],
    ambiguityNotes: 'Verified normative formula content is not yet loaded. Applicability of the current routeScope is a placeholder and must not be interpreted as final legal scope.',
    sourceType: 'unknown',
    sourceReference: null,
    sourceDate: null,
    effectiveDateRange: [],
    verificationStatus: 'raw_unverified',
    enteredBy: 'system_seed',
    reviewStatus: 'pending'
  },
  {
    knowledgeId: 'SAL_NORM_02_DEF',
    blockerId: 'BLOCKER_02',
    title: 'Recognized Salary Cost Definition Placeholder',
    routeScope: 'red_standard',
    claimantScope: 'all',
    appliesToComponent: 'salary_costs',
    ruleType: 'definition',
    normativeContent: '',
    formulaExpression: null,
    variableDefinitions: null,
    coefficientTable: null,
    offsetRules: null,
    ceilingRules: null,
    exclusions: [],
    ambiguityNotes: 'Verified normative definition of recognized cost is not yet loaded. Applicability of the current routeScope is a placeholder and must not be interpreted as final legal scope.',
    sourceType: 'unknown',
    sourceReference: null,
    sourceDate: null,
    effectiveDateRange: [],
    verificationStatus: 'raw_unverified',
    enteredBy: 'system_seed',
    reviewStatus: 'pending'
  },
  {
    knowledgeId: 'SAL_NORM_03_TRACK_RULES',
    blockerId: 'BLOCKER_03',
    title: 'Track-Specific Salary Rules Placeholder',
    routeScope: 'red_standard',
    claimantScope: 'all',
    appliesToComponent: 'salary_costs',
    ruleType: 'ruleset',
    normativeContent: '',
    formulaExpression: null,
    variableDefinitions: null,
    coefficientTable: null,
    offsetRules: null,
    ceilingRules: null,
    exclusions: [],
    ambiguityNotes: 'Verified normative track-specific differentiation rules are not yet loaded. Applicability of the current routeScope is a placeholder and must not be interpreted as final legal scope.',
    sourceType: 'unknown',
    sourceReference: null,
    sourceDate: null,
    effectiveDateRange: [],
    verificationStatus: 'raw_unverified',
    enteredBy: 'system_seed',
    reviewStatus: 'pending'
  },
  {
    knowledgeId: 'SAL_NORM_04_COEF',
    blockerId: 'BLOCKER_04',
    title: 'Salary Coefficient Applicability Placeholder',
    routeScope: 'red_standard',
    claimantScope: 'all',
    appliesToComponent: 'salary_costs',
    ruleType: 'coefficient',
    normativeContent: '',
    formulaExpression: null,
    variableDefinitions: null,
    coefficientTable: null,
    offsetRules: null,
    ceilingRules: null,
    exclusions: [],
    ambiguityNotes: 'Verified normative coefficient applicability is not yet loaded. Applicability of the current routeScope is a placeholder and must not be interpreted as final legal scope.',
    sourceType: 'unknown',
    sourceReference: null,
    sourceDate: null,
    effectiveDateRange: [],
    verificationStatus: 'raw_unverified',
    enteredBy: 'system_seed',
    reviewStatus: 'pending'
  },
  {
    knowledgeId: 'SAL_NORM_05_OFFSET',
    blockerId: 'BLOCKER_05',
    title: 'Deduction Offset Rules Placeholder',
    routeScope: 'red_standard',
    claimantScope: 'all',
    appliesToComponent: 'salary_costs',
    ruleType: 'offset',
    normativeContent: '',
    formulaExpression: null,
    variableDefinitions: null,
    coefficientTable: null,
    offsetRules: null,
    ceilingRules: null,
    exclusions: [],
    ambiguityNotes: 'Verified normative deduction treatment rules are not yet loaded. Applicability of the current routeScope is a placeholder and must not be interpreted as final legal scope.',
    sourceType: 'unknown',
    sourceReference: null,
    sourceDate: null,
    effectiveDateRange: [],
    verificationStatus: 'raw_unverified',
    enteredBy: 'system_seed',
    reviewStatus: 'pending'
  },
  {
    knowledgeId: 'SAL_NORM_06_CEILING',
    blockerId: 'BLOCKER_06',
    title: 'Compensation Ceiling Interaction Placeholder',
    routeScope: 'red_standard',
    claimantScope: 'all',
    appliesToComponent: 'salary_costs',
    ruleType: 'ceiling',
    normativeContent: '',
    formulaExpression: null,
    variableDefinitions: null,
    coefficientTable: null,
    offsetRules: null,
    ceilingRules: null,
    exclusions: [],
    ambiguityNotes: 'Verified normative ceiling interaction rules are not yet loaded. Applicability of the current routeScope is a placeholder and must not be interpreted as final legal scope.',
    sourceType: 'unknown',
    sourceReference: null,
    sourceDate: null,
    effectiveDateRange: [],
    verificationStatus: 'raw_unverified',
    enteredBy: 'system_seed',
    reviewStatus: 'pending'
  }
];

// ----------------------------------------------------------------------
// Readiness Helpers
// ----------------------------------------------------------------------

function hasRequiredNormativePayload(item: SalaryNormativeKnowledgeItem): boolean {
  const hasText = item.normativeContent !== null && item.normativeContent.trim() !== '';
  
  switch (item.ruleType) {
    case 'formula':
      return hasText || (item.formulaExpression !== null && Object.keys(item.formulaExpression).length > 0);
    case 'definition':
    case 'ruleset':
      return hasText;
    case 'coefficient':
      return hasText || (item.coefficientTable !== null && Object.keys(item.coefficientTable).length > 0);
    case 'offset':
      return hasText || (item.offsetRules !== null && Object.keys(item.offsetRules).length > 0);
    case 'ceiling':
      return hasText || (item.ceilingRules !== null && Object.keys(item.ceilingRules).length > 0);
    default:
      return false;
  }
}

export function hasSalaryNormativeClosureReady(seed: SalaryNormativeKnowledgeItem[]): boolean {
  if (!seed || seed.length !== 6) return false;

  const hasConflicting = seed.some(item => item.verificationStatus === 'conflicting');
  if (hasConflicting) return false;

  return seed.every(item => 
    item.verificationStatus === 'verified_complete' &&
    item.reviewStatus === 'approved' &&
    hasRequiredNormativePayload(item)
  );
}
