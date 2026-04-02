/* ============================================
   FILE: inbox.ts
   PURPOSE: שכבת תיווך Gmail — fetch + dedup + classify + route
   DEPENDENCIES: ./auth, ./client, ./classificationTypes, ./workflowRouter
   EXPORTS: syncInbox, connectGmail, isGmailConnected, disconnectGmail,
            GmailMessage, InboxSyncResult
   ============================================ */
import { authenticateGmail, getGmailToken, isGmailAuthenticated, disconnectGmail } from './auth';
import { fetchGmailMessages } from './client';
import type { GmailParsedMessage } from './client';
import { classifyEmailFull } from '../../services/emailClassifier';
import { routeClassifiedEmail } from './workflowRouter';
import type { RoutingResult } from './classificationTypes';

// #region Interfaces

/**
 * מבנה מייל פנימי (תואם ל-Gmail API ול-mock)
 */
export interface GmailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  attachments?: { fileName: string; mimeType: string }[];
  labels?: string[];
}

/** תוצאת סנכרון בודדת */
export interface InboxSyncItem {
  emailId: string;
  from: string;
  subject: string;
  action: string;
  category: string;
  targetQueue: string;
  issues: string[];
}

/** תוצאת סנכרון כוללת */
export interface InboxSyncResult {
  total: number;
  processed: number;
  skipped: number;
  items: InboxSyncItem[];
  source: 'gmail_api' | 'mock';
}

// #endregion

// #region Processed Email Tracking (Dedup)

const PROCESSED_KEY = 'eldad_processed_emails';

function getProcessedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PROCESSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function markProcessed(ids: string[]): void {
  const existing = getProcessedIds();
  ids.forEach(id => existing.add(id));
  try { localStorage.setItem(PROCESSED_KEY, JSON.stringify([...existing])); } catch { /* silent */ }
}

// #endregion

// #region Gmail API → GmailMessage Adapter

/**
 * ממיר GmailParsedMessage (מ-client.ts) ל-GmailMessage הפנימי
 */
function apiToInternal(msg: GmailParsedMessage): GmailMessage {
  return {
    id: msg.id,
    from: msg.from,
    subject: msg.subject,
    body: msg.body,
    date: msg.date,
    labels: msg.labels,
  };
}

// #endregion

// #region Email Fetching (Real API or Mock Fallback)

/** חיבור Gmail (re-export for UI) */
export async function connectGmail(): Promise<boolean> {
  try {
    await authenticateGmail();
    return true;
  } catch { return false; }
}

/** בדיקת חיבור Gmail */
export function isGmailConnected(): boolean {
  return isGmailAuthenticated();
}

/** ניתוק Gmail (re-export) */
export { disconnectGmail };

/**
 * שולף מיילים — Gmail API אמיתי או mock fallback
 */
async function fetchEmails(): Promise<{ emails: GmailMessage[]; source: 'gmail_api' | 'mock' }> {
  const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
  if (!clientId) {
    console.log('[Inbox] ⚠️ No VITE_GMAIL_CLIENT_ID — using mock data');
    return { emails: getMockEmails(), source: 'mock' };
  }

  let token = getGmailToken();

  if (!token) {
    try {
      console.log('[Inbox] 🔑 No token — triggering OAuth popup...');
      token = await authenticateGmail();
    } catch (err) {
      console.warn('[Inbox] ⚠️ OAuth failed — falling back to mock:', err);
      return { emails: getMockEmails(), source: 'mock' };
    }
  }

  try {
    const apiMessages = await fetchGmailMessages(token, 20);
    const emails = apiMessages.map(apiToInternal);
    console.log(`[Inbox] ✅ Fetched ${emails.length} real emails from Gmail API`);
    return { emails, source: 'gmail_api' };
  } catch (err) {
    if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
      console.log('[Inbox] 🔄 Token expired — re-authenticating...');
      disconnectGmail();
      try {
        token = await authenticateGmail();
        const apiMessages = await fetchGmailMessages(token, 20);
        return { emails: apiMessages.map(apiToInternal), source: 'gmail_api' };
      } catch { /* fall through to mock */ }
    }
    console.warn('[Inbox] ⚠️ Gmail API failed — falling back to mock:', err);
    return { emails: getMockEmails(), source: 'mock' };
  }
}

/**
 * נתוני mock — משמשים כ-fallback כש-Gmail API לא מוגדר
 */
function getMockEmails(): GmailMessage[] {
  return [
    { id: 'mock_iec_04', from: 'billing@iec.co.il', subject: 'חשבון חשמל לתשלום - אפריל 2026', body: 'סכום לתשלום: ₪487.30. מועד אחרון: 20/04/2026. https://www.iec.co.il/pay', date: '2026-03-25', labels: ['חשבונות'] },
    { id: 'mock_water_04', from: 'service@mast.co.il', subject: 'חשבון מים דו-חודשי', body: 'סכום: ₪152.80. תאריך פדיון: 10/04/2026.', date: '2026-03-24', labels: ['חשבונות'] },
    { id: 'mock_tax_notice', from: 'noreply@taxes.gov.il', subject: 'דרישת מסמכים — תיק 12345', body: 'נדרש להגיש דוח שנתי עד 30/06/2026. יש להמציא מסמכים.', date: '2026-03-26', labels: ['מסים'] },
    { id: 'mock_bank_req', from: 'service@leumi.co.il', subject: 'אישור יתרה לצורך משכנתא', body: 'בקשה לאישור יתרה. סכום: ₪245,000. יש לשלוח עד 15/04/2026.', date: '2026-03-26', labels: ['בנק'] },
  ];
}

// #endregion

// #region Sync Function

/**
 * סנכרון תיבת דואר: fetch → dedup → classify → route.
 * זרימה: Gmail API → classifyEmailFull → routeClassifiedEmail
 */
export async function syncInbox(): Promise<InboxSyncResult> {
  const { emails, source } = await fetchEmails();
  const processed = getProcessedIds();
  const items: InboxSyncItem[] = [];
  let skipped = 0;

  const counts: Record<string, number> = {};

  for (const email of emails) {
    if (processed.has(email.id)) {
      skipped++;
      continue;
    }

    // 1. סיווג מלא
    const classified = classifyEmailFull(
      email.id, email.from, email.subject, email.body,
      email.date, email.labels || []
    );

    // 2. ניתוב ל-workflow
    let routing: RoutingResult;
    if (classified.category === 'marketing' && classified.confidence < 40) {
      routing = { emailId: email.id, category: 'marketing', actions: ['ignored'], targetQueue: 'ignore' };
    } else {
      routing = await routeClassifiedEmail(classified);
    }

    // 3. Debug log
    if (source === 'gmail_api') {
      console.log(
        `[Inbox] 📨 ${email.subject.slice(0, 45)} → ${classified.category} (${classified.confidence}%) → ${routing.targetQueue}`,
        { actions: routing.actions, reason: classified.reason }
      );
    }

    // 4. ספירה
    counts[classified.category] = (counts[classified.category] || 0) + 1;

    items.push({
      emailId: email.id,
      from: email.from,
      subject: email.subject,
      action: routing.actions[0] || 'processed',
      category: classified.category,
      targetQueue: routing.targetQueue,
      issues: [],
    });
  }

  markProcessed(items.map(i => i.emailId));

  // סיכום
  const summary = Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(', ');
  console.log(
    `[Inbox] 📊 Sync complete (${source}): ${items.length} processed, ${skipped} already seen` +
    (summary ? ` | ${summary}` : '')
  );

  return { total: emails.length, processed: items.length, skipped, items, source };
}

// #endregion
