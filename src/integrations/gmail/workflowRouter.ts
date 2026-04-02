/* ============================================
   FILE: workflowRouter.ts
   PURPOSE: ניתוב מיילים מסווגים ליעד הנכון — accounting, payments, tasks, clients
   DEPENDENCIES: ./classificationTypes, ./draftGenerator, ../../domain/types, ../../domain/pipeline
   EXPORTS: routeClassifiedEmail, getAccountingRecords, getClientRecords, getEmailTasks
   ============================================ */
import type { ClassifiedEmail, RoutingResult, WorkflowAction, AccountingRecord, ClientRecord } from './classificationTypes';
import type { EmailTask } from './taskDetector';
import type { IncomingEvent } from '../../domain/types';
import { handleIncomingEvent } from '../../domain/pipeline';
import { identifyCaseContext, createOrUpdateBundle } from './caseBundle';
import { enrichCaseBundleWithHistory } from './caseHistory';
import { PROCESS_DEFINITIONS } from '../../system/processSeed';

// #region Storage Keys

const ACCOUNTING_KEY = 'eldad_accounting_docs';
const CLIENT_KEY = 'eldad_client_docs';
const TASKS_KEY = 'eldad_email_tasks';

// #endregion

// #region Storage Helpers

/** @returns כל רשומות הנהלת החשבונות */
export function getAccountingRecords(): AccountingRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTING_KEY) || '[]');
  } catch { return []; }
}

/** @returns כל רשומות הלקוחות */
export function getClientRecords(): ClientRecord[] {
  try {
    return JSON.parse(localStorage.getItem(CLIENT_KEY) || '[]');
  } catch { return []; }
}

/** @returns כל המשימות */
export function getEmailTasks(): EmailTask[] {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
  } catch { return []; }
}

function storeAccounting(record: AccountingRecord): void {
  const all = getAccountingRecords();
  if (all.some(r => r.emailId === record.emailId)) return;
  all.push(record);
  try { localStorage.setItem(ACCOUNTING_KEY, JSON.stringify(all)); } catch { /* silent */ }
}

function storeClient(record: ClientRecord): void {
  const all = getClientRecords();
  if (all.some(r => r.emailId === record.emailId)) return;
  all.push(record);
  try { localStorage.setItem(CLIENT_KEY, JSON.stringify(all)); } catch { /* silent */ }
}

function storeTask(task: EmailTask): void {
  const all = getEmailTasks();
  if (all.some(t => t.id === task.id)) return;
  all.push(task);
  try { localStorage.setItem(TASKS_KEY, JSON.stringify(all)); } catch { /* silent */ }
}

// #endregion

// #region Payment Handler

function handlePayment(email: ClassifiedEmail): RoutingResult {
  const event: IncomingEvent = {
    id: email.emailId,
    source: 'EMAIL',
    payload: { sender: email.from, subject: email.subject, body: email.body },
  };

  const result = handleIncomingEvent(
    event,
    email.extracted.clientName || email.from.split('@')[0],
    email.extracted.amount || 0,
    email.extracted.dueDate || '',
    undefined,
    email.extracted.paymentLink || undefined
  );

  return {
    emailId: email.emailId,
    category: 'payment_required',
    actions: [result.action as WorkflowAction],
    targetQueue: 'payments',
    createdEntityId: result.action === 'bill_created' ? `bill-${email.emailId}` : undefined,
  };
}

// #endregion

// #region Accounting Handler

function handleAccounting(email: ClassifiedEmail, type: AccountingRecord['type']): RoutingResult {
  storeAccounting({
    id: `acc-${email.emailId}`,
    emailId: email.emailId,
    type,
    from: email.from,
    subject: email.subject,
    amount: email.extracted.amount,
    date: email.date,
    storedAt: new Date().toISOString(),
  });

  const action: WorkflowAction = type === 'invoice' ? 'invoice_stored' : 'accounting_doc_stored';
  return {
    emailId: email.emailId,
    category: email.category,
    actions: [action],
    targetQueue: 'accounting',
    createdEntityId: `acc-${email.emailId}`,
  };
}

// #endregion

// #region Registry Helper

/** Resolves process title from Registry by matching caseType to process ID */
function resolveProcessTitle(caseType: string): string | null {
  // Map caseType → Registry process ID
  const typeToProcessId: Record<string, string> = {
    'war_compensation_red_track': 'war_compensation',
    'lawsuit': 'litigation',
    'appeal': 'war_compensation',
    'penalty': 'penalty_cancellation',
    'tax_audit': 'tax_audit',
  };

  const processId = typeToProcessId[caseType];
  if (!processId) return null;

  const process = PROCESS_DEFINITIONS.find(p => p.id === processId);
  return process?.title || null;
}

// #endregion

// #region Legal/Task Handler

async function handleLegalTask(email: ClassifiedEmail): Promise<RoutingResult> {
  // שלב 1: זיהוי הקשר תיק
  const caseCtx = identifyCaseContext(email.from, email.subject, email.body);

  // שלב 2: יצירת/עדכון תיק — לא ניסוח!
  const bundle = createOrUpdateBundle(
    caseCtx, email.emailId, email.subject, email.date, email.body.slice(0, 200)
  );

  // שלב 3: חיפוש היסטוריה — רק אם caseContext זוהה
  if (caseCtx.clientName && caseCtx.confidence >= 50) {
    await enrichCaseBundleWithHistory(bundle, caseCtx);
  }

  // שלב 4: יצירת task — שם תהליך מה-Registry אם קיים
  const processTitle = resolveProcessTitle(caseCtx.caseType);
  const taskPrefix = processTitle || 'סקירת תיק';

  // Knowledge Layer — אם bundle דורש review אנושי, מעלים priority
  const reviewRequired = bundle.requiresHumanReview;
  const riskInfo = bundle.riskFlags.length > 0
    ? ` | סיכונים: ${bundle.riskFlags.join(', ')}`
    : '';
  const deadlineInfo = bundle.deadlineWarning ? ` | ${bundle.deadlineWarning}` : '';

  const task: EmailTask = {
    id: `task-${email.emailId}`,
    title: `${reviewRequired ? '🛑 ' : ''}${taskPrefix}: ${caseCtx.clientName || email.subject.slice(0, 50)}`,
    description: `תיק ${bundle.caseKey} דורש סקירה. סוג: ${caseCtx.caseType}. ${bundle.materials.length} חומרים, ${bundle.missingItems.length} חסרים.${riskInfo}${deadlineInfo}${reviewRequired ? ` | ⚠️ review נדרש: ${bundle.reviewReason}` : ''}`,
    priority: 'high',
    dueDate: email.extracted.dueDate,
    sourceEmailId: email.emailId,
    senderEmail: email.from,
    relatedEntity: caseCtx.clientName,
    createdAt: new Date().toISOString(),
    status: 'open',
    matchedRule: `case: ${caseCtx.caseType} | ${caseCtx.matchedSignals.join(', ')}`,
  };
  storeTask(task);

  return {
    emailId: email.emailId,
    category: 'legal_task',
    actions: ['task_created' as WorkflowAction],
    targetQueue: 'tasks',
    createdEntityId: bundle.id,
  };
}

// #endregion

// #region Bank Handler

function handleBankRequest(email: ClassifiedEmail): RoutingResult {
  const task: EmailTask = {
    id: `task-${email.emailId}`,
    title: `בנק: ${email.subject.slice(0, 80)}`,
    description: email.body.slice(0, 300),
    priority: 'medium',
    dueDate: email.extracted.dueDate,
    sourceEmailId: email.emailId,
    senderEmail: email.from,
    relatedEntity: email.extracted.clientName,
    createdAt: new Date().toISOString(),
    status: 'open',
    matchedRule: `category: bank_request`,
  };
  storeTask(task);

  return {
    emailId: email.emailId,
    category: 'bank_request',
    actions: ['task_created'],
    targetQueue: 'tasks',
    createdEntityId: task.id,
  };
}

// #endregion

// #region Client Handler

function handleClientDocument(email: ClassifiedEmail): RoutingResult {
  storeClient({
    id: `client-${email.emailId}`,
    emailId: email.emailId,
    clientName: email.extracted.clientName || email.from,
    subject: email.subject,
    actionRequired: email.extracted.actionRequired,
    date: email.date,
    storedAt: new Date().toISOString(),
  });

  return {
    emailId: email.emailId,
    category: 'client_document',
    actions: ['client_doc_stored'],
    targetQueue: 'clients',
    createdEntityId: `client-${email.emailId}`,
  };
}

// #endregion

// #region Main Router

/**
 * מנתב מייל מסווג ליעד הנכון ומבצע את הפעולות הנדרשות.
 * @param email — מייל מסווג עם נתונים חילוצים
 * @returns תוצאת הניתוב כולל פעולות שבוצעו
 */
export async function routeClassifiedEmail(email: ClassifiedEmail): Promise<RoutingResult> {
  switch (email.category) {
    case 'invoice':
      return handleAccounting(email, 'invoice');

    case 'payment_required':
      return handlePayment(email);

    case 'accounting_document':
      return handleAccounting(email, 'general');

    case 'legal_task':
      return await handleLegalTask(email);

    case 'client_document':
      return handleClientDocument(email);

    case 'bank_request':
      return handleBankRequest(email);

    case 'marketing':
    default:
      return {
        emailId: email.emailId,
        category: 'marketing',
        actions: ['ignored'],
        targetQueue: 'ignore',
      };
  }
}

// #endregion
