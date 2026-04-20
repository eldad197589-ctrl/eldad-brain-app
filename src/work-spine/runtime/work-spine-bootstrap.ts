// ==========================================
// FILE: work-spine-bootstrap.ts
// PURPOSE: Dev-only initializer for Work Spine seed operations.
// ==========================================

import { FileBasedWorkItemRepository } from '../persistence/file-based-work-item-repository';
import { RunCreateWorkItemProcess } from '../use-cases/run-create-work-item';
import { RunTransitionWorkItemProcess } from '../use-cases/run-transition-work-item';
import { WorkItemStatus } from '../types/work-spine-types';
import { AuditTraceService } from '../../accounting-core/services/audit-trace-service';
import { FileBasedAuditTraceRepository } from '../../accounting-core/persistence/file-based-audit-trace-repository';

export function initializeWorkSpineEnvironment() {
  const repo = new FileBasedWorkItemRepository();
  const existing = repo.listAll();
  
  // Identify if we currently have the old demo seed
  const isDemo = existing.some(i => i.title.includes('חשמל') || i.title.includes('מע"מ'));
  
  if (existing.length === 0 || isDemo) {
    // Clean up old work spine items safely without touching accounting core
    existing.forEach(i => localStorage.removeItem(`work_spine/work_item/${i.id}`));
    localStorage.setItem('work_spine/work_item/__index__', '[]');

    const auditRepo = new FileBasedAuditTraceRepository();
    const auditService = new AuditTraceService();
    (auditService as any).auditTraceRepository = auditRepo;

    const createProcess = new RunCreateWorkItemProcess(repo);
    const transitionProcess = new RunTransitionWorkItemProcess(repo, auditService);

    const w1 = createProcess.execute({ id: 'wi-r-1', domain_type: 'ACCOUNTING_CORE', title: 'סגירת מע"מ', next_action_description: 'לבדוק מה חסר לסגירת הדיווח' });
    const w2 = createProcess.execute({ id: 'wi-r-2', domain_type: 'PERSONAL', title: 'תשלום חשבון חשמל', next_action_description: 'לשלם ולתעד אסמכתא' });
    const w3 = createProcess.execute({ id: 'wi-r-3', domain_type: 'ACCOUNTING_CORE', title: 'טיפול במקדמות', next_action_description: 'להשלים בדיקה מקצועית בתיק' });
    const w4 = createProcess.execute({ id: 'wi-r-4', domain_type: 'WAR_COMPENSATION', title: 'דימה', next_action_description: 'להמתין לתשובת הלקוח', case_id: 'case-dima' });
    const w5 = createProcess.execute({ id: 'wi-r-5', domain_type: 'ACCOUNTING_CORE', title: 'שמעון דוד', next_action_description: 'להשלים בדיקה מקצועית בתיק', client_id: 'c-shimon' });
    const w6 = createProcess.execute({ id: 'wi-r-6', domain_type: 'WAR_COMPENSATION', title: 'צילה שוורץ – מסלול אדום', next_action_description: 'לרכז נתונים חסרים למסלול האדום', case_id: 'case-tzila' });
    const w7 = createProcess.execute({ id: 'wi-r-7', domain_type: 'WAR_COMPENSATION', title: 'ענבר ברבי – מסלול אדום', next_action_description: 'לרכז נתונים חסרים למסלול האדום', case_id: 'case-inbar' });
    const w8 = createProcess.execute({ id: 'wi-r-8', domain_type: 'WAR_COMPENSATION', title: 'גביר ימין / קיריל מול רשות המסים', next_action_description: 'להמתין לתשובת רשות המסים', case_id: 'case-gvir' });

    const forceTransition = (id: string, target: WorkItemStatus) => {
      try { transitionProcess.execute({ work_item_id: id, new_status: target, reason_for_transition: 'System Seed', actor_id: 'system' }); } catch(e){}
    };
    
    // w4 -> WAITING_EXTERNAL 
    forceTransition(w4.id, WorkItemStatus.IN_REVIEW);
    forceTransition(w4.id, WorkItemStatus.WAITING_EXTERNAL);

    // w5, w6, w7 -> IN_REVIEW
    forceTransition(w5.id, WorkItemStatus.IN_REVIEW);
    forceTransition(w6.id, WorkItemStatus.IN_REVIEW);
    forceTransition(w7.id, WorkItemStatus.IN_REVIEW);

    // w8 -> WAITING_EXTERNAL 
    forceTransition(w8.id, WorkItemStatus.IN_REVIEW);
    forceTransition(w8.id, WorkItemStatus.WAITING_EXTERNAL);
  }
}
