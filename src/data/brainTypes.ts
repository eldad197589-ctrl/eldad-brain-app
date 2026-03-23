/**
 * Eldad Brain – Core Type Definitions
 * 
 * These types define the entire Brain operating system.
 * Every neuron, agent, process, and route follows these contracts.
 * 
 * Generated from: master_agent_architecture.md
 * Version: 1.0
 */

// ═══════════════════════════════════════
// 🧠 Brain Domains
// ═══════════════════════════════════════

export type BrainDomain =
  | "core"
  | "employee"
  | "accounting"
  | "legal"
  | "reports"
  | "support";

// ═══════════════════════════════════════
// 🔄 Process States
// ═══════════════════════════════════════

export type BrainState =
  | "draft"
  | "collecting_data"
  | "validating"
  | "under_analysis"
  | "awaiting_decision"
  | "generating_output"
  | "under_review"
  | "ready_for_submission"
  | "completed"
  | "blocked";

// ═══════════════════════════════════════
// 🤖 Agent Roles
// ═══════════════════════════════════════

export type AgentRole =
  | "intake_agent"
  | "validation_agent"
  | "analysis_agent"
  | "decision_support_agent"
  | "document_agent"
  | "review_agent"
  | "submission_agent";

// ═══════════════════════════════════════
// 📋 Process Registry Item
// ═══════════════════════════════════════

export interface BrainProcessRegistryItem {
  id: string;
  name: string;
  domain: BrainDomain;
  category?: string;
  flowchartFile?: string;
  screens?: string[];
  brainKeywords?: string[];
  requiredInputs?: string[];
  optionalInputs?: string[];
  agents?: AgentRole[];
  states?: BrainState[];
  outputs?: string[];
  relatedModules?: string[];
}

// ═══════════════════════════════════════
// 🔀 Brain Router
// ═══════════════════════════════════════

export interface BrainRouteResult {
  matchedProcessId: string;
  confidence: number;
  domain: BrainDomain;
  nextState: BrainState;
  launchModule: string;
  requiredAgents: AgentRole[];
  reason: string;
}

export type RouterRequestSource =
  | "ceo_office"
  | "client_portal"
  | "agent"
  | "external"
  | "gmail";

export type RouterRequestType =
  | "new_process"
  | "continue_process"
  | "query"
  | "report"
  | "letter"
  | "escalation";

export interface BrainRouterRequest {
  source: RouterRequestSource;
  userId: string;
  requestType: RouterRequestType;
  description: string;
  clientId?: string;
  caseId?: string;
  priority: "low" | "medium" | "high" | "urgent";
  attachments?: string[];
  timestamp: string;
}

export interface BrainRouterResponse {
  status: "routed" | "escalated" | "not_found" | "error";
  targetNeuron?: string;
  targetProcess?: string;
  targetAgent?: string;
  initialState: BrainState;
  caseId: string;
  nextAction: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

// ═══════════════════════════════════════
// 🔄 Agent Handoff
// ═══════════════════════════════════════

export interface AgentHandoff {
  fromAgent: AgentRole;
  toAgent: AgentRole;
  processId: string;
  caseId: string;
  currentState: BrainState;
  dataPackage: {
    collectedDocuments?: string[];
    missingFields?: string[];
    notes?: string;
    analysisResult?: Record<string, unknown>;
  };
  timestamp: string;
}

// ═══════════════════════════════════════
// 📤 Output Types
// ═══════════════════════════════════════

export type OutputType =
  | "document"
  | "report"
  | "letter"
  | "task"
  | "crm_update"
  | "submission";

export interface BrainOutput {
  processId: string;
  caseId: string;
  outputType: OutputType;
  format: string;
  title: string;
  generatedBy: AgentRole;
  reviewedBy?: AgentRole;
  approvedBy?: string;
  version: number;
  status: "draft" | "ready_for_review" | "approved" | "submitted";
  timestamp: string;
}

// ═══════════════════════════════════════
// 📊 CEO Office Reports
// ═══════════════════════════════════════

export type CeoReportType =
  | "notification"
  | "status_update"
  | "escalation"
  | "output_ready"
  | "completion"
  | "alert";

export interface CeoReport {
  type: CeoReportType;
  processId: string;
  caseId: string;
  message: string;
  actionRequired?: string;
  priority: "low" | "medium" | "high" | "urgent";
  timestamp: string;
}
