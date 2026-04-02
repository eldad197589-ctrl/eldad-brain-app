/* ============================================
   FILE: auth.ts
   PURPOSE: Gmail OAuth2 authentication via Google Identity Services (GIS)
   DEPENDENCIES: None (browser APIs only)
   EXPORTS: authenticateGmail, getGmailToken, isGmailAuthenticated, disconnectGmail
   ============================================ */

// #region GIS Type Declarations

/** Minimal type declarations for Google Identity Services */
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: GisTokenResponse) => void;
          }): { requestAccessToken(): void };
        };
      };
    };
  }
}

interface GisTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface StoredToken {
  access_token: string;
  expires_at: number;
}

// #endregion

// #region Constants

const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
const TOKEN_KEY = 'brain_gmail_token';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

// One-time migration: move old 'eldad_gmail_token' → 'brain_gmail_token'
const OLD_TOKEN_KEY = 'eldad_gmail_token';
if (localStorage.getItem(OLD_TOKEN_KEY) && !localStorage.getItem(TOKEN_KEY)) {
  localStorage.setItem(TOKEN_KEY, localStorage.getItem(OLD_TOKEN_KEY)!);
}
localStorage.removeItem(OLD_TOKEN_KEY);

// #endregion

// #region GIS Script Loader

/**
 * טוען את סקריפט Google Identity Services באופן דינמי.
 * אם כבר נטען — מחזיר מיד.
 */
function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('נכשל בטעינת Google Identity Services'));
    document.head.appendChild(script);
  });
}

// #endregion

// #region Token Management

/**
 * מחזיר access token שמור אם עדיין תקף.
 * @returns access token או null אם אין/פג תוקף
 */
export function getGmailToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const token: StoredToken = JSON.parse(raw);
    // מרווח ביטחון של 60 שניות
    if (Date.now() > token.expires_at - 60_000) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return token.access_token;
  } catch {
    return null;
  }
}

/**
 * בודק אם יש token תקף
 */
export function isGmailAuthenticated(): boolean {
  return getGmailToken() !== null;
}

/**
 * שומר token חדש ב-localStorage
 */
function storeToken(accessToken: string, expiresIn: number): void {
  const token: StoredToken = {
    access_token: accessToken,
    expires_at: Date.now() + (expiresIn * 1000),
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

/**
 * מנתק את Gmail — מוחק token שמור
 */
export function disconnectGmail(): void {
  localStorage.removeItem(TOKEN_KEY);
  console.log('[Gmail Auth] Token removed — disconnected.');
}

// #endregion

// #region OAuth2 Authentication

/**
 * מפעיל OAuth2 popup לחיבור Gmail.
 * @returns access token אם הצליח
 * @throws Error אם אין client ID או שהמשתמש ביטל
 */
export async function authenticateGmail(): Promise<string> {
  const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'VITE_GMAIL_CLIENT_ID לא מוגדר. הוסף אותו ל-.env:\n' +
      'VITE_GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com'
    );
  }

  await loadGisScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services לא נטען.');
  }

  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPES,
      callback: (response: GisTokenResponse) => {
        if (response.error) {
          reject(new Error(`OAuth2: ${response.error} — ${response.error_description || ''}`));
          return;
        }
        storeToken(response.access_token, response.expires_in);
        console.log('[Gmail Auth] ✅ Connected — token valid for', response.expires_in, 'seconds');
        resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
}

// #endregion
