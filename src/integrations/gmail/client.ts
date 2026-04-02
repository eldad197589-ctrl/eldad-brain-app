/* ============================================
   FILE: client.ts
   PURPOSE: Gmail API REST client — קריאה ל-API, פענוח והמרה ל-GmailMessage
   DEPENDENCIES: None (browser fetch only)
   EXPORTS: fetchGmailMessages, GmailParsedMessage
   ============================================ */

// #region Types

/** מייל מפוענח מ-Gmail API */
export interface GmailParsedMessage {
  /** Gmail message ID (ייחודי ויציב) */
  id: string;
  /** שולח (From header) */
  from: string;
  /** נושא (Subject header) */
  subject: string;
  /** גוף ההודעה (plain text) */
  body: string;
  /** תאריך שליחה (Date header) */
  date: string;
  /** תוויות Gmail */
  labels: string[];
}

// #endregion

// #region Constants

const BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

/**
 * ברירת מחדל: חיפוש מיילים הקשורים לחשבונות ותשלומים ב-30 ימים אחרונים.
 * אפשר לשנות דרך הפרמטר query.
 */
const DEFAULT_QUERY = 'newer_than:30d (חשבון OR תשלום OR קבלה OR invoice OR receipt OR bill OR חיוב OR פדיון)';

// #endregion

// #region Base64 Decoder

/**
 * מפענח base64url (הפורמט של Gmail API) לטקסט רגיל UTF-8
 */
function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

// #endregion

// #region Payload Parsers

/**
 * חילוץ header מתוך מערך headers של Gmail
 */
function getHeader(headers: { name: string; value: string }[], name: string): string {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * חילוץ גוף ההודעה מתוך payload — תומך ב-plain, HTML, ו-multipart.
 * מעדיף text/plain. אם אין — מסיר תגיות HTML.
 */
function extractBody(payload: any): string {
  // גוף ישיר (הודעה פשוטה)
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (!payload.parts) return '';

  // שלב 1: חפש text/plain
  for (const part of payload.parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return decodeBase64Url(part.body.data);
    }
  }

  // שלב 2: fallback ל-text/html — הסרת תגיות
  for (const part of payload.parts) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      const html = decodeBase64Url(part.body.data);
      return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  // שלב 3: multipart מקונן
  for (const part of payload.parts) {
    if (part.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }

  return '';
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// #endregion

// #region API Calls

/**
 * שליפת רשימת message IDs מ-Gmail (לפי query)
 */
async function listMessageIds(token: string, query: string, maxResults: number): Promise<string[]> {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
  const res = await fetch(`${BASE_URL}/messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) throw new Error('TOKEN_EXPIRED');
  if (!res.ok) throw new Error(`Gmail API list: ${res.status} ${res.statusText}`);

  const data = await res.json();
  return (data.messages || []).map((m: { id: string }) => m.id);
}

/**
 * שליפת מייל בודד ופענוח ל-GmailParsedMessage
 */
async function fetchSingleMessage(token: string, messageId: string): Promise<GmailParsedMessage> {
  const res = await fetch(`${BASE_URL}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) throw new Error('TOKEN_EXPIRED');
  if (!res.ok) throw new Error(`Gmail API get ${messageId}: ${res.status}`);

  const msg = await res.json();
  const headers = msg.payload?.headers || [];

  return {
    id: msg.id,
    from: getHeader(headers, 'From'),
    subject: getHeader(headers, 'Subject'),
    body: extractBody(msg.payload || {}),
    date: getHeader(headers, 'Date'),
    labels: msg.labelIds || [],
  };
}

// #endregion

// #region Public API

/**
 * שליפת מיילים אמיתיים מ-Gmail API.
 * @param token - access token מ-OAuth2
 * @param maxResults - מספר מיילים מקסימלי (ברירת מחדל 20)
 * @param query - שאילתת חיפוש Gmail (ברירת מחדל: חשבונות 30 ימים)
 * @returns מערך מיילים מפוענחים
 */
export async function fetchGmailMessages(
  token: string,
  maxResults: number = 20,
  query: string = DEFAULT_QUERY
): Promise<GmailParsedMessage[]> {
  console.log(`[Gmail Client] 📬 Fetching up to ${maxResults} messages (query: "${query.slice(0, 50)}...")`);

  const ids = await listMessageIds(token, query, maxResults);
  console.log(`[Gmail Client] Found ${ids.length} matching messages`);

  const messages: GmailParsedMessage[] = [];

  for (const id of ids) {
    try {
      const msg = await fetchSingleMessage(token, id);
      messages.push(msg);
    } catch (err) {
      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') throw err;
      console.warn(`[Gmail Client] ⚠️ Failed to fetch ${id}:`, err);
    }
  }

  return messages;
}

// #endregion
