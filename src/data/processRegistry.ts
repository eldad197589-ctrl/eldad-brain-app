/* ============================================
   FILE: processRegistry.ts
   PURPOSE: processRegistry module
   DEPENDENCIES: None (local only)
   EXPORTS: PROCESS_REGISTRY, getProcessById, getProcessesByDomain, findProcessByKeyword, getDomainStats
   ============================================ */
/**
 * Eldad Brain – Process Registry
 *
 * This is the OPERATIONAL registry of all professional workflows (neurons).
 * Every AI agent, the Brain Router, and the CEO Office read from this file.
 *
 * When adding a new process:
 * 1. Add its entry here
 * 2. Add its neuron in neurons.ts
 * 3. Build its UI in src/pages/
 *
 * @see AGENTS.md for architecture rules
 */

import type {
  BrainDomain,
  BrainProcessRegistryItem,
} from './brainTypes';

// ═══════════════════════════════════════
// 📋 Process Registry
// ═══════════════════════════════════════

export const PROCESS_REGISTRY: BrainProcessRegistryItem[] = [

  // ─── Employee Domain ───────────────────────

  {
    id: 'attendance',
    name: 'ניהול נוכחות',
    domain: 'employee',
    category: 'workforce',
    flowchartFile: 'flowchart-attendance.html',
    screens: ['dashboard', 'ceo-office'],
    brainKeywords: ['נוכחות', 'שעון', 'שעות', 'משמרות', 'שעות נוספות', 'attendance'],
    requiredInputs: ['employee_id', 'month', 'raw_attendance_report'],
    optionalInputs: ['sick_leave_docs', 'vacation_approvals'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'document_agent', 'review_agent'],
    states: ['draft', 'collecting_data', 'validating', 'under_analysis', 'generating_output', 'under_review', 'completed'],
    outputs: ['monthly_attendance_report', 'exceptions_report'],
    relatedModules: ['payroll_processing', 'worklaw'],
  },

  {
    id: 'payroll_processing',
    name: 'עיבוד שכר',
    domain: 'employee',
    category: 'workforce',
    flowchartFile: 'flowchart-payroll-processing.html',
    screens: ['dashboard', 'ceo-office'],
    brainKeywords: ['שכר', 'משכורת', 'תלוש', 'payroll'],
    requiredInputs: ['attendance_report', 'employee_details', 'salary_terms'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'document_agent', 'review_agent', 'submission_agent'],
    states: ['draft', 'collecting_data', 'under_analysis', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    outputs: ['payslips', 'payroll_summary', 'institutional_files'],
    relatedModules: ['attendance', 'institutional_reports'],
  },

  {
    id: 'worklaw',
    name: 'דיני עבודה',
    domain: 'employee',
    category: 'regulation',
    flowchartFile: 'flowchart-worklaw.html',
    screens: ['dashboard'],
    brainKeywords: ['דיני עבודה', 'פיטורין', 'פיצויים', 'שימוע', 'worklaw'],
    requiredInputs: ['case_type', 'employee_details'],
    agents: ['intake_agent', 'validation_agent', 'decision_support_agent', 'document_agent'],
    states: ['draft', 'collecting_data', 'awaiting_decision', 'generating_output', 'completed'],
    outputs: ['legal_opinion', 'action_letter'],
    relatedModules: ['attendance'],
  },

  // ─── Accounting Domain ─────────────────────

  {
    id: 'capital_gains',
    name: 'רווח הון ממקרקעין בחו"ל',
    domain: 'accounting',
    category: 'tax',
    flowchartFile: 'flowchart-capital-gains.html',
    screens: ['dashboard', 'ceo-office', 'case-view'],
    brainKeywords: ['רווח הון', 'מכירת נכס', 'מקרקעין', 'capital gains', 'טופס 1399', 'סעיף 91'],
    requiredInputs: ['property_purchase_docs', 'property_sale_docs', 'taxpayer_details', 'exchange_rates'],
    optionalInputs: ['depreciation_report', 'improvement_receipts'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'decision_support_agent', 'document_agent', 'review_agent', 'submission_agent'],
    states: ['draft', 'collecting_data', 'validating', 'under_analysis', 'awaiting_decision', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    outputs: ['capital_gains_calculation', 'form_1399', 'bank_letter', 'submission_package'],
    relatedModules: ['declaration_of_capital'],
  },

  {
    id: 'declaration_of_capital',
    name: 'הצהרת הון',
    domain: 'accounting',
    category: 'tax_reporting',
    flowchartFile: 'flowchart-declaration-of-capital.html',
    screens: ['dashboard', 'ceo-office'],
    brainKeywords: ['הצהרת הון', 'הון נקי', 'נכסים', 'התחייבויות', 'declaration of capital'],
    requiredInputs: ['taxpayer_details', 'assets', 'liabilities', 'supporting_documents'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'document_agent', 'review_agent', 'submission_agent'],
    states: ['draft', 'collecting_data', 'validating', 'under_analysis', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    outputs: ['declaration_report', 'tax_forms', 'submission_package'],
    relatedModules: ['capital_gains'],
  },

  {
    id: 'war_compensation',
    name: 'פיצויי מלחמה',
    domain: 'accounting',
    category: 'compensation',
    flowchartFile: 'flowchart-war-compensation.html',
    screens: ['dashboard', 'ceo-office', 'case-view'],
    brainKeywords: ['פיצויי מלחמה', 'חרבות ברזל', 'צוק איתן', 'פיצויים לעסק', 'נזק עקיף', 'מס רכוש'],
    requiredInputs: ['business_details', 'revenue_data', 'damage_documentation', 'supporting_documents'],
    optionalInputs: ['accountant_notes', 'insurance_claims'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'decision_support_agent', 'document_agent', 'review_agent', 'submission_agent'],
    states: ['draft', 'collecting_data', 'validating', 'under_analysis', 'awaiting_decision', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    outputs: ['compensation_calculation', 'submission_documents', 'review_summary'],
    relatedModules: [],
  },

  // ─── Legal Domain ──────────────────────────

  {
    id: 'expert_opinion',
    name: 'חוות דעת מומחה',
    domain: 'legal',
    category: 'expert_witness',
    flowchartFile: 'flowchart-expert-opinion.html',
    screens: ['dashboard', 'ceo-office'],
    brainKeywords: ['חוות דעת', 'מומחה', 'הערכה כלכלית', 'expert opinion', 'בית משפט'],
    requiredInputs: ['case_details', 'court_documents', 'financial_data'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'decision_support_agent', 'document_agent', 'review_agent'],
    states: ['draft', 'collecting_data', 'under_analysis', 'awaiting_decision', 'generating_output', 'under_review', 'completed'],
    outputs: ['expert_opinion_document', 'financial_analysis'],
    relatedModules: ['guardian_pro'],
  },

  {
    id: 'guardian_pro',
    name: 'אפוטרופוס',
    domain: 'legal',
    category: 'guardianship',
    flowchartFile: 'flowchart-guardian-pro.html',
    screens: ['dashboard', 'ceo-office', 'case-view'],
    brainKeywords: ['אפוטרופוס', 'חסוי', 'דוח שנתי', 'guardian', 'אפוטרופסות'],
    requiredInputs: ['ward_details', 'financial_records', 'court_orders'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'document_agent', 'review_agent', 'submission_agent'],
    states: ['draft', 'collecting_data', 'under_analysis', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    outputs: ['annual_guardian_report', 'financial_summary'],
    relatedModules: ['expert_opinion', 'insolvency'],
  },

  {
    id: 'insolvency',
    name: 'חדלות פירעון',
    domain: 'legal',
    category: 'bankruptcy',
    flowchartFile: 'flowchart-insolvency.html',
    screens: ['dashboard', 'ceo-office'],
    brainKeywords: ['חדלות פירעון', 'פשט רגל', 'הסדר נושים', 'insolvency'],
    requiredInputs: ['debtor_details', 'creditor_list', 'financial_statements'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'document_agent', 'review_agent', 'submission_agent'],
    states: ['draft', 'collecting_data', 'under_analysis', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    outputs: ['monthly_guardian_report', 'financial_status'],
    relatedModules: ['guardian_pro'],
  },

  // ─── Reports Domain ────────────────────────

  {
    id: 'institutional_reports',
    name: 'דוחות מוסדיים',
    domain: 'reports',
    category: 'compliance',
    flowchartFile: 'flowchart-institutional-reports.html',
    screens: ['dashboard', 'ceo-office'],
    brainKeywords: ['דוח מוסדי', 'מס הכנסה', 'ביטוח לאומי', 'מע"מ', 'דוח שנתי'],
    requiredInputs: ['report_period', 'financial_data', 'entity_details'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'document_agent', 'review_agent', 'submission_agent'],
    states: ['draft', 'collecting_data', 'under_analysis', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    outputs: ['institutional_report', 'submission_confirmation'],
    relatedModules: ['payroll_processing', 'capital_gains'],
  },

  // ─── Core Domain ───────────────────────────

  {
    id: 'brain_router',
    name: 'נתב המוח',
    domain: 'core',
    category: 'routing',
    flowchartFile: 'flowchart-brain-router.html',
    screens: ['dashboard'],
    brainKeywords: ['ניתוב', 'חיפוש', 'מה לעשות'],
    requiredInputs: ['user_request'],
    agents: [],
    states: ['draft', 'completed'],
    outputs: ['route_result'],
    relatedModules: [],
  },
];

// ═══════════════════════════════════════
// 🔍 Registry Helper Functions
// ═══════════════════════════════════════

/** Find a process by its ID */
export function getProcessById(id: string): BrainProcessRegistryItem | undefined {
  return PROCESS_REGISTRY.find(p => p.id === id);
}

/** Get all processes in a domain */
export function getProcessesByDomain(domain: BrainDomain): BrainProcessRegistryItem[] {
  return PROCESS_REGISTRY.filter(p => p.domain === domain);
}

/** Find processes matching a keyword (basic Brain Router v1) */
export function findProcessByKeyword(query: string): BrainProcessRegistryItem[] {
  const q = query.toLowerCase();
  return PROCESS_REGISTRY.filter(p =>
    p.brainKeywords?.some(kw => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()))
  );
}

/** Get all domains with their process counts */
export function getDomainStats(): Record<BrainDomain, number> {
  const stats: Record<string, number> = {};
  for (const p of PROCESS_REGISTRY) {
    stats[p.domain] = (stats[p.domain] || 0) + 1;
  }
  return stats as Record<BrainDomain, number>;
}
