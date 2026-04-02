/* ============================================
   FILE: processDefinitionsCore.ts
   PURPOSE: הגדרות תהליכי ליבה, תשלומים, מיילים, פיצויי מלחמה, מסמכים
   DEPENDENCIES: ./processRegistry
   EXPORTS: CORE_PROCESS_DEFINITIONS
   ============================================ */
import type { ProcessDefinition } from './processRegistry';

// #region Core + Pipeline Definitions

/** תהליכי ליבה + pipelines */
export const CORE_PROCESS_DEFINITIONS: ProcessDefinition[] = [

  // ═══════════════════════════════════════════
  // ליבה
  // ═══════════════════════════════════════════
  {
    id: 'dashboard',
    title: 'דשבורד',
    emoji: '📊',
    domain: 'core',
    parentDomains: [],
    subProcesses: [],
    entities: [],
    queues: [],
    triggers: [{ type: 'manual' }],
    outputs: ['overview'],
    relatedProcesses: ['ceo_office', 'hub'],
    status: 'active',
    route: '/',
    isVisibleInSidebar: true,
    isVisibleInDashboard: false,
    brainNodeId: 'dashboard',
  },
  {
    id: 'ceo_office',
    title: 'לשכת מנכ"ל',
    emoji: '🏢',
    domain: 'core',
    parentDomains: ['tasks'],
    subProcesses: ['meetings', 'tasks_management', 'daily_notes'],
    entities: [{ type: 'task' }, { type: 'document' }],
    queues: [],
    triggers: [{ type: 'manual' }, { type: 'schedule' }],
    outputs: ['tasks', 'meetings', 'notes'],
    relatedProcesses: ['dashboard'],
    status: 'active',
    route: '/ceo',
    isVisibleInSidebar: true,
    isVisibleInDashboard: true,
    brainNodeId: 'ceo',
  },
  {
    id: 'brain_router',
    title: 'נתב המוח',
    emoji: '🧠',
    domain: 'core',
    parentDomains: ['tools'],
    subProcesses: [],
    entities: [],
    queues: [],
    triggers: [{ type: 'manual' }],
    outputs: ['route_result'],
    relatedProcesses: [],
    status: 'active',
    route: '/flow/brain-router',
    isVisibleInSidebar: true,
    isVisibleInDashboard: false,
    brainNodeId: 'brain_router',
    category: 'routing',
    flowchartFile: 'flowchart-brain-router.html',
    brainKeywords: ['ניתוב', 'חיפוש', 'מה לעשות'],
    screens: ['dashboard'],
  },

  // ═══════════════════════════════════════════
  // תשלומי בית (payments pipeline)
  // ═══════════════════════════════════════════
  {
    id: 'home_payments',
    title: 'תשלומי בית',
    emoji: '💳',
    domain: 'personal',
    parentDomains: ['accounting'],
    subProcesses: ['email_sync', 'bill_detection', 'payment_execution'],
    entities: [
      { type: 'bill', storageKey: 'eldad_home_store' },
      { type: 'receipt', storageKey: 'eldad_home_store' },
    ],
    queues: [
      { name: 'payments', storageKey: 'eldad_home_store', direction: 'both' },
    ],
    triggers: [
      { type: 'email_classified', condition: 'payment_required' },
      { type: 'manual' },
    ],
    outputs: ['bills', 'receipts', 'payment_confirmations'],
    relatedProcesses: ['email_classification', 'war_compensation'],
    status: 'active',
    route: '/personal/payments',
    isVisibleInSidebar: true,
    isVisibleInDashboard: true,
    brainNodeId: 'payments',
    description: 'זיהוי חשבונות מ-Gmail, מעקב תשלומים, קבלות',
    brainKeywords: ['תשלום', 'חשבון', 'חשמל', 'מים', 'ארנונה', 'ועד בית'],
  },

  // ═══════════════════════════════════════════
  // סיווג מיילים (email pipeline)
  // ═══════════════════════════════════════════
  {
    id: 'email_classification',
    title: 'סיווג מיילים',
    emoji: '📧',
    domain: 'tools',
    parentDomains: ['accounting', 'tasks', 'clients'],
    subProcesses: ['gmail_fetch', 'classify', 'route', 'case_bundle'],
    entities: [{ type: 'document' }],
    queues: [
      { name: 'accounting', storageKey: 'eldad_accounting_docs', direction: 'write' },
      { name: 'tasks', storageKey: 'eldad_email_tasks', direction: 'write' },
      { name: 'clients', storageKey: 'eldad_client_docs', direction: 'write' },
      { name: 'cases', storageKey: 'eldad_case_bundles', direction: 'write' },
    ],
    triggers: [{ type: 'manual' }, { type: 'schedule' }],
    outputs: ['classified_emails', 'tasks', 'case_bundles', 'accounting_docs'],
    relatedProcesses: ['home_payments', 'war_compensation', 'document_intake'],
    status: 'active',
    route: undefined,
    isVisibleInSidebar: false,
    isVisibleInDashboard: true,
    brainNodeId: 'email_classifier',
    description: '7 קטגוריות: invoice, payment, accounting, legal, client, bank, marketing',
  },

  // ═══════════════════════════════════════════
  // ★ פיצויי מלחמה — מסלול אדום
  // ═══════════════════════════════════════════
  {
    id: 'war_compensation',
    title: 'פיצויי מלחמה',
    emoji: '🛡️',
    domain: 'special_claims',
    parentDomains: ['documents', 'tasks', 'clients', 'accounting'],
    subProcesses: [
      'case_identification', 'case_bundle_creation', 'history_search',
      'material_collection', 'case_review', 'draft_generation', 'appeal_preparation',
    ],
    entities: [
      { type: 'case_bundle', storageKey: 'eldad_case_bundles' },
      { type: 'task', storageKey: 'eldad_email_tasks' },
      { type: 'draft' },
      { type: 'client' },
    ],
    queues: [
      { name: 'cases', storageKey: 'eldad_case_bundles', direction: 'both' },
      { name: 'tasks', storageKey: 'eldad_email_tasks', direction: 'write' },
    ],
    triggers: [
      { type: 'email_classified', condition: 'legal_task' },
      { type: 'document_received', condition: 'war_compensation' },
      { type: 'manual' },
    ],
    outputs: ['case_bundles', 'case_summaries', 'response_drafts', 'appeal_drafts', 'tasks',
      'compensation_calculation', 'submission_documents', 'review_summary'],
    relatedProcesses: ['email_classification', 'document_intake', 'ceo_office'],
    status: 'active',
    route: '/flow/war-compensation',
    isVisibleInSidebar: true,
    isVisibleInDashboard: true,
    brainNodeId: 'war_compensation',
    description: 'תיקי פיצוי מלחמה: זיהוי → caseBundle → סקירה → ניסוח ערר/מענה',
    category: 'compensation',
    flowchartFile: 'flowchart-war-compensation.html',
    brainKeywords: ['פיצויי מלחמה', 'חרבות ברזל', 'צוק איתן', 'פיצויים לעסק', 'נזק עקיף', 'מס רכוש', 'מסלול אדום'],
    requiredInputs: ['business_details', 'revenue_data', 'damage_documentation', 'supporting_documents'],
    optionalInputs: ['accountant_notes', 'insurance_claims'],
    agents: ['intake_agent', 'validation_agent', 'analysis_agent', 'decision_support_agent', 'document_agent', 'review_agent', 'submission_agent'],
    processStates: ['draft', 'collecting_data', 'validating', 'under_analysis', 'awaiting_decision', 'generating_output', 'under_review', 'ready_for_submission', 'completed'],
    screens: ['dashboard', 'ceo-office', 'case-view'],
  },

  // ═══════════════════════════════════════════
  // קליטת מסמכים
  // ═══════════════════════════════════════════
  {
    id: 'document_intake',
    title: 'קליטת מסמכים',
    emoji: '📥',
    domain: 'accounting',
    parentDomains: ['documents', 'clients'],
    subProcesses: ['classification', 'processing', 'routing'],
    entities: [{ type: 'document' }],
    queues: [],
    triggers: [{ type: 'document_received' }, { type: 'manual' }],
    outputs: ['classified_documents'],
    relatedProcesses: ['email_classification', 'home_payments'],
    status: 'active',
    route: '/documents',
    isVisibleInSidebar: true,
    isVisibleInDashboard: true,
    brainNodeId: 'documents',
    description: 'קליטה, סיווג ועיבוד מסמכים נכנסים',
  },
];

// #endregion
