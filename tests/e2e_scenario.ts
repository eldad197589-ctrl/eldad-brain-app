/**
 * תרחיש אמת מקצה לקצה — הרצה עם: npx tsx e2e_scenario.ts
 */

// Shim localStorage for Node.js
const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
};

// Now import domain modules
import { syncInbox } from '../src/integrations/gmail/inbox';
import {
  getAllBills, getAllReceipts, generateDashboard,
  executeBillViaGateway, reconcileBill, resetState, seedInitialBills
} from '../src/domain/pipeline';
import { eventBus, createCorrelationId } from '../src/domain/events';
import type { CashflowState } from '../src/domain/types';

const CASHFLOW: CashflowState = { balance: 12000, creditLimit: 5000, monthlyIncome: 18000, reserveMinimum: 3000 };

async function run() {
  console.log('='.repeat(60));
  console.log('תרחיש אמת מקצה לקצה — המוח של אלדד');
  console.log('='.repeat(60));

  // איפוס
  resetState();
  eventBus.clearAll();

  // רישום listener מחדש (כי clearAll ניקה)
  eventBus.subscribe('receipt_created', (payload, meta) => {
    if (payload.linkedBillId) {
      eventBus.emit('receipt_linked', {
        receiptId: payload.receiptId, billId: payload.linkedBillId, provider: payload.provider
      }, { source: 'pipeline', correlationId: meta.correlationId });
    }
  });

  // ========== שלב 1: סנכרון מיילים ==========
  console.log('\n📬 שלב 1: syncInbox()');
  const inboxResult = await syncInbox();
  console.log(`  סה"כ מיילים: ${inboxResult.total}`);
  console.log(`  עובדו: ${inboxResult.processed}`);
  console.log(`  דולגו: ${inboxResult.skipped}`);
  for (const item of inboxResult.items) {
    console.log(`  → [${item.action}] ${item.subject} (${item.from})`);
    if (item.issues.length) console.log(`    issues: ${item.issues.join(', ')}`);
  }

  // ========== שלב 2: בדיקת bills שנוצרו ==========
  console.log('\n📄 שלב 2: bills שנוצרו');
  const bills = getAllBills();
  for (const b of bills) {
    console.log(`  [${b.id}] ${b.provider} | ₪${b.amount} | status: ${b.status} | due: ${b.dueDate}`);
  }

  // ========== שלב 3: Dashboard + Cashflow ==========
  console.log('\n📊 שלב 3: generateDashboard()');
  const dash = generateDashboard(CASHFLOW);
  console.log(`  דחוף: ${dash.urgent.length}`);
  console.log(`  עתידי: ${dash.upcoming.length}`);
  console.log(`  שולם: ${dash.recentlyPaid.length}`);
  console.log(`  חריגות: ${dash.anomalies.length}`);
  console.log(`  עומס: ${dash.plan.isOverloaded ? 'כן' : 'לא'}`);
  console.log(`  סה"כ לתשלום: ₪${dash.plan.totalDue}`);
  console.log(`  יתרה אחרי: ₪${dash.plan.balanceAfterPayments}`);
  if (dash.plan.payNow.length) {
    console.log('  המלצות שלם עכשיו:');
    for (const d of dash.plan.payNow) {
      console.log(`    → ${d.provider}: ₪${d.amount} (${d.reason})`);
    }
  }

  // ========== שלב 4: תשלום bill ראשון ==========
  // בוחרים bill שהוא due או overdue
  const billToPay = bills.find(b => ['due', 'overdue', 'upcoming'].includes(b.status));
  if (!billToPay) {
    console.log('\n❌ אין חשבון פתוח לתשלום. עוצרים.');
    return;
  }

  console.log(`\n💳 שלב 4: executeBillViaGateway("${billToPay.id}")`);
  console.log(`  ספק: ${billToPay.provider}`);
  console.log(`  סכום: ₪${billToPay.amount}`);

  const payCorr = createCorrelationId('pay');
  console.log(`  correlationId: ${payCorr}`);

  const payResult = await executeBillViaGateway(
    billToPay.id, CASHFLOW, undefined, `IEC-${Date.now()}`, payCorr
  );
  console.log(`  stage: ${payResult.stage}`);
  console.log(`  bill.status: ${payResult.bill.status}`);
  if (payResult.bill.confirmationNumber) {
    console.log(`  confirmationNumber: ${payResult.bill.confirmationNumber}`);
  }
  if (payResult.receipt) {
    console.log(`  receipt: ${payResult.receipt.id} (linked: ${payResult.receipt.linkedBillId})`);
  }
  if (payResult.balanceAfter !== undefined) {
    console.log(`  יתרה אחרי: ₪${payResult.balanceAfter}`);
  }
  if (payResult.issues.length) {
    console.log(`  issues: ${payResult.issues.join(', ')}`);
  }

  // ========== שלב 5: בדיקת receipts ==========
  console.log('\n🧾 שלב 5: receipts במערכת');
  const receipts = getAllReceipts();
  for (const r of receipts) {
    console.log(`  [${r.id}] ${r.provider} | ₪${r.amount} | conf: ${r.confirmationNumber} | linked: ${r.linkedBillId || 'none'}`);
  }

  // ========== שלב 6: reconcile ==========
  console.log(`\n🛡️ שלב 6: reconcileBill("${billToPay.id}")`);
  const rcnCorr = createCorrelationId('rcn');
  const rcnResult = reconcileBill(
    billToPay.id,
    payResult.bill.confirmationNumber || '',
    billToPay.amount,
    rcnCorr
  );
  console.log(`  reconciled: ${rcnResult.reconciled}`);
  if (rcnResult.issue) console.log(`  issue: ${rcnResult.issue}`);

  // ========== שלב 7: getFlowTrace ==========
  console.log(`\n🔗 שלב 7: getFlowTrace("${payCorr}")`);
  const trace = eventBus.getFlowTrace(payCorr);
  for (const e of trace) {
    const time = new Date(e.timestamp).toLocaleTimeString('he-IL');
    console.log(`  ${time} | ${e.event.padEnd(20)} | source: ${e.source.padEnd(8)} | corr: ${e.correlationId}`);
  }

  // ========== שלב 8: Dashboard אחרי תשלום ==========
  console.log('\n📊 שלב 8: Dashboard אחרי תשלום');
  const dash2 = generateDashboard(CASHFLOW);
  console.log(`  דחוף: ${dash2.urgent.length}`);
  console.log(`  שולם: ${dash2.recentlyPaid.length}`);
  console.log(`  חריגות: ${dash2.anomalies.length}`);

  // ========== סיכום ==========
  console.log('\n' + '='.repeat(60));
  console.log('סיכום תרחיש');
  console.log('='.repeat(60));
  console.log(`bills במערכת: ${getAllBills().length}`);
  console.log(`receipts במערכת: ${getAllReceipts().length}`);
  console.log(`events בלוג: ${eventBus.getLog().length}`);
  console.log(`flow trace (${payCorr}): ${trace.length} events`);
}

run().catch(console.error);
