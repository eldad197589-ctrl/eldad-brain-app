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

const WORK_ITEM_PREFIX = 'work_spine/work_item/';
const WORK_ITEM_INDEX_KEY = 'work_spine/work_item/__index__';

function listStoredWorkItemIds(): string[] {
  const ids = new Set<string>();

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);

    if (!key || key === WORK_ITEM_INDEX_KEY || !key.startsWith(WORK_ITEM_PREFIX)) {
      continue;
    }

    ids.add(key.slice(WORK_ITEM_PREFIX.length));
  }

  return [...ids].sort();
}

function repairWorkItemIndexFromStoredRecords(): void {
  const storedIds = listStoredWorkItemIds();

  if (storedIds.length === 0) {
    return;
  }

  localStorage.setItem(WORK_ITEM_INDEX_KEY, JSON.stringify(storedIds));
}

export function initializeWorkSpineEnvironment() {
  repairWorkItemIndexFromStoredRecords();

  const repo = new FileBasedWorkItemRepository();
  const existing = repo.listAll();
  
  // Identify if we currently have the old demo seed
  const isDemo = existing.some(i => i.title.includes('חשמל') || i.title.includes('מע"מ'));
  
  if (existing.length === 0 || isDemo) {
    const auditRepo = new FileBasedAuditTraceRepository();
    const auditService = new AuditTraceService();
    (auditService as any).auditTraceRepository = auditRepo;

    const createProcess = new RunCreateWorkItemProcess(repo);
    const transitionProcess = new RunTransitionWorkItemProcess(repo, auditService);

    const createDemoItemIfMissing = (input: Parameters<RunCreateWorkItemProcess['execute']>[0]) => {
      const existingItem = repo.getById(input.id);

      if (existingItem) {
        return existingItem;
      }

      try {
        return createProcess.execute(input);
      } catch (error) {
        if (error instanceof Error && error.message.includes(`WorkItem with ID ${input.id} already exists`)) {
          const recoveredItem = repo.getById(input.id);

          if (recoveredItem) {
            return recoveredItem;
          }
        }

        throw error;
      }
    };

    const w1 = createDemoItemIfMissing({ id: 'wi-r-1', domain_type: 'ACCOUNTING_CORE', title: 'סגירת מע"מ', next_action_description: 'לבדוק מה חסר לסגירת הדיווח' });
    const w2 = createDemoItemIfMissing({ id: 'wi-r-2', domain_type: 'PERSONAL', title: 'תשלום חשבון חשמל', next_action_description: 'לשלם ולתעד אסמכתא' });
    const w3 = createDemoItemIfMissing({ id: 'wi-r-3', domain_type: 'ACCOUNTING_CORE', title: 'טיפול במקדמות', next_action_description: 'להשלים בדיקה מקצועית בתיק' });
    const w4 = createDemoItemIfMissing({ id: 'wi-r-4', domain_type: 'WAR_COMPENSATION', title: 'דימה', next_action_description: 'להמתין לתשובת הלקוח', case_id: 'case-dima' });
    const w5 = createDemoItemIfMissing({ id: 'wi-r-5', domain_type: 'ACCOUNTING_CORE', title: 'שמעון דוד', next_action_description: 'להשלים בדיקה מקצועית בתיק', client_id: 'c-shimon' });
    const w6 = createDemoItemIfMissing({ id: 'wi-r-6', domain_type: 'PERSONAL', title: 'צילה שוורץ — עבודה אקדמית', next_action_description: 'לתקן TOC שבור, לבנות HTML כ-A4 package, להשלים 4 שדות מטא-דאטה', case_id: 'tsila-shvartz' });
    const w7 = createDemoItemIfMissing({ id: 'wi-r-7', domain_type: 'WAR_COMPENSATION', title: 'ענבר ברבי – מסלול אדום', next_action_description: 'לרכז נתונים חסרים למסלול האדום', case_id: 'case-inbar' });
    const w8 = createDemoItemIfMissing({ id: 'wi-r-8', domain_type: 'WAR_COMPENSATION', title: 'גביר ימין / קיריל מול רשות המסים', next_action_description: 'להמתין לתשובת רשות המסים', case_id: 'case-gvir' });

    w1.matterId = 'eldad-vat-1-2-26';
    repo.update(w1);

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
  } else {
    // RUNTIME FIX: Ensure Tsila task (wi-r-6) is definitely not ACCOUNTING_CORE due to legacy storage state.
    const tsilaItem = existing.find(i => i.id === 'wi-r-6');
    if (tsilaItem && tsilaItem.domain_type !== 'PERSONAL') {
      tsilaItem.domain_type = 'PERSONAL';
      // Strip 'HTML A4' blocker from next action, keeping the TOC issue
      tsilaItem.next_action_description = 'לתקן TOC שבור ב-DOCX, להשלים 4 שדות מטא-דאטה';
      repo.update(tsilaItem);
    }
    
    // Check next_action_description to remove the HTML risk if domain was correct but text was never updated
    if (tsilaItem && tsilaItem.next_action_description.includes('HTML כ-A4 package')) {
      tsilaItem.next_action_description = 'לתקן TOC שבור ב-DOCX, להשלים 4 שדות מטא-דאטה';
      repo.update(tsilaItem);
    }

    // RUNTIME FIX: Attach matterId to VAT work item (wi-r-1) for persisted items created before the field existed.
    const vatItem = existing.find(i => i.id === 'wi-r-1');
    if (vatItem && !vatItem.matterId) {
      vatItem.matterId = 'eldad-vat-1-2-26';
      repo.update(vatItem);
    }
  }
}
