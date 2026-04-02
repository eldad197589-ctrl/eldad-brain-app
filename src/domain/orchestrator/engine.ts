/* ============================================
   FILE: orchestrator/engine.ts
   PURPOSE: מנוע ניתוב מרכזי — סיווג מבוסס ניקוד
   DEPENDENCIES: ../types
   EXPORTS: processIncomingEvent
   ============================================ */
import type { IncomingEvent, OrchestratorResult, EntityType, DocType, EngineChoice, ActionChoice } from '../types';

// #region Scoring

function scoreKeywords(text: string, rules: Record<string, number>): number {
  let score = 0;
  for (const [kw, weight] of Object.entries(rules)) {
    if (text.includes(kw)) score += weight;
  }
  return score;
}

// #endregion

// #region Classification

function classifyInbox(event: IncomingEvent): { entity: EntityType; documentType: DocType; confidence: number; issues: string[] } {
  const text = `${event.payload.sender} ${event.payload.subject} ${event.payload.fileName || ''} ${event.payload.body}`.toLowerCase();
  let confidence = 0.9;
  const issues: string[] = [];

  const hScore = scoreKeywords(text, { 'חשמל': 1, 'מים': 1, 'ארנונה': 1, 'ועד בית': 1 });
  const bScore = scoreKeywords(text, { 'robium': 10, 'רוביום': 10, 'רו"ח': 5, 'רואה חשבון': 5, 'מע"מ': 5, 'ח.פ': 5, 'invoice': 3, 'תאגיד': 5 });

  let entity: EntityType = 'unknown';
  if (bScore > hScore) entity = 'business';
  else if (hScore > bScore) entity = 'household';
  else if (bScore > 0 && hScore > 0) { confidence -= 0.5; issues.push('התנגשות סיווג.'); }
  else { confidence -= 0.4; issues.push('לא זוהתה ישות.'); }

  const billScore = scoreKeywords(text, { 'חשבון': 2, 'לתשלום': 2, 'bill': 2, 'חיוב': 2 });
  const invoiceScore = scoreKeywords(text, { 'חשבונית': 3, 'invoice': 3 });
  const receiptScore = scoreKeywords(text, { 'קבלה': 5, 'שולם': 5, 'שולם בהצלחה': 5, 'התשלום בוצע': 5, 'מאשרים קבלת כספך': 5, 'receipt': 5 });
  const contractScore = scoreKeywords(text, { 'הסכם': 3, 'חוזה': 3, 'contract': 3, 'טיוטה': 3, 'חתימות': 3, 'נספח': 3, 'draft': 3, 'signatures': 3 });

  let documentType: DocType = 'unknown';
  if (receiptScore > 0) {
    documentType = 'receipt';
    if (billScore > 0) issues.push('עירוב סמנטי חשבון/קבלה — ננעל לתיוק בלבד.');
  } else {
    const max = Math.max(billScore, invoiceScore, contractScore);
    if (max === 0) { documentType = 'general'; confidence -= 0.1; }
    else if (max === contractScore) documentType = 'contract';
    else if (max === invoiceScore) documentType = 'invoice';
    else documentType = 'bill';
  }

  return { entity, documentType, confidence, issues };
}

// #endregion

// #region Routing

export function processIncomingEvent(event: IncomingEvent): OrchestratorResult {
  if (!event?.payload) {
    return { entity: 'unknown', documentType: 'unknown', selectedEngine: 'ignore', action: 'discard', confidence: 0, issues: ['No payload'] };
  }

  const { entity, documentType, confidence, issues } = classifyInbox(event);
  let selectedEngine: EngineChoice = 'ignore';
  let action: ActionChoice = 'discard';

  if (documentType === 'receipt') {
    action = 'file_to_drive';
    issues.push('מסמך סגור/משולם — חסום מ-bills.');
  }

  if (entity === 'household') {
    if (documentType === 'bill') { selectedEngine = 'bills'; action = 'process_payment'; }
    else if (documentType === 'receipt') { selectedEngine = 'ignore'; }
    else { selectedEngine = 'ignore'; action = 'file_to_drive'; }
  } else if (entity === 'business') {
    if (documentType === 'contract') { selectedEngine = 'business-docs'; action = 'notify_user'; }
    else if (documentType === 'invoice' || documentType === 'receipt') { selectedEngine = 'business-docs'; action = 'file_to_drive'; }
    else { selectedEngine = 'ignore'; action = 'notify_user'; }
  } else {
    selectedEngine = 'ignore'; action = 'notify_user';
  }

  return { entity, documentType, selectedEngine, action, confidence, issues };
}

// #endregion
