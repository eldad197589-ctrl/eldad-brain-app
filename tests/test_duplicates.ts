/**
 * בדיקת כפילויות + חסימה שגויה
 */

const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
};

import { syncInbox } from '../src/integrations/gmail/inbox';
import { getAllBills, seedInitialBills, resetState, handleIncomingEvent } from '../src/domain/pipeline';
import type { Bill, IncomingEvent } from '../src/domain/types';
import { eventBus } from '../src/domain/events';

const SEED_BILLS: Omit<Bill, 'status' | 'notes'>[] = [
  { id: 'bill-1', provider: 'תאגיד מי אשקלון', category: 'מים', amount: 145.50, dueDate: '2026-04-10' },
  { id: 'bill-2', provider: 'עיריית אשקלון', category: 'ארנונה', amount: 850, dueDate: '2026-04-15' },
  { id: 'bill-3', provider: 'חברת החשמל', category: 'חשמל', amount: 1250, dueDate: '2026-04-20' },
  { id: 'bill-4', provider: 'מועצת רואי חשבון', category: 'אגרת מקצוע', amount: 1450, dueDate: '2026-05-01' },
];

async function testDuplicates() {
  console.log('=== בדיקת כפילויות ===\n');

  resetState();
  eventBus.clearAll();

  // תרחיש 1: seed → sync (אין כפילויות)
  seedInitialBills(SEED_BILLS);
  await syncInbox();
  const after1 = getAllBills();
  console.log(`תרחיש 1 — seed + sync: ${after1.length} bills`);
  for (const b of after1) console.log(`  [${b.id}] ${b.provider} | ₪${b.amount} | ${b.dueDate}`);

  // בדיקת IDs ייחודיים
  const ids1 = after1.map(b => b.id);
  console.log(ids1.length === new Set(ids1).size ? '  ✅ IDs ייחודיים' : '  ❌ IDs כפולים!');

  // תרחיש 2: bills שונים מאותו ספק (סכום/תאריך שונים) — חייבים להתקבל
  console.log('\n--- תרחיש 2: שני bills לגיטימיים מאותו ספק ---');
  resetState();
  eventBus.clearAll();

  const event1: IncomingEvent = {
    id: 'ev-1', source: 'email', timestamp: new Date().toISOString(),
    payload: { sender: 'billing@iec.co.il', subject: 'חשבון חשמל מרץ', body: '₪487' }
  };
  const event2: IncomingEvent = {
    id: 'ev-2', source: 'email', timestamp: new Date().toISOString(),
    payload: { sender: 'billing@iec.co.il', subject: 'חשבון חשמל אפריל', body: '₪520' }
  };

  const r1 = handleIncomingEvent(event1, 'חברת החשמל', 487, '2026-03-20', undefined, undefined);
  const r2 = handleIncomingEvent(event2, 'חברת החשמל', 520, '2026-04-20', undefined, undefined);
  const after2 = getAllBills();
  console.log(`  bill 1: ${r1.action} (${r1.bill?.id || 'none'})`);
  console.log(`  bill 2: ${r2.action} (${r2.bill?.id || 'none'})`);
  console.log(`  Total: ${after2.length} bills`);
  console.log(after2.length === 2 ? '  ✅ שני bills לגיטימיים התקבלו' : '  ❌ חסימה שגויה!');

  // תרחיש 3: אותו bill בדיוק (ספק+סכום+תאריך) — חייב להיחסם
  console.log('\n--- תרחיש 3: bill כפול (fingerprint זהה) ---');
  const event3: IncomingEvent = {
    id: 'ev-3', source: 'email', timestamp: new Date().toISOString(),
    payload: { sender: 'billing@iec.co.il', subject: 'חשבון חשמל מרץ שוב', body: '₪487' }
  };
  const r3 = handleIncomingEvent(event3, 'חברת החשמל', 487, '2026-03-20');
  console.log(`  bill 3: ${r3.action} (${r3.bill?.id || 'none'})`);
  const after3 = getAllBills();
  console.log(`  Total: ${after3.length} bills`);
  console.log(after3.length === 2 ? '  ✅ bill כפול נחסם' : '  ❌ bill כפול עבר!');
}

testDuplicates().catch(console.error);
