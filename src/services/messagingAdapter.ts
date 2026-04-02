/* ============================================
   FILE: messagingAdapter.ts
   PURPOSE: Adapter layer for messaging delivery.
            MVP: clipboard copy + WhatsApp deep link.
            Future: WhatsApp API, SMS, Email.
   DEPENDENCIES: None
   EXPORTS: SendResult, copyToClipboard, buildWhatsAppLink, buildWhatsAppText
   ============================================ */

// #region Types

/** תוצאת שליחה/העתקה */
export interface SendResult {
  /** האם הפעולה הצליחה */
  success: boolean;
  /** שיטת שליחה */
  method: 'clipboard' | 'wa_link' | 'wa_api' | 'sms_api' | 'email_api';
  /** הודעת שגיאה */
  error?: string;
}

// #endregion

// #region Clipboard

/**
 * מעתיק טקסט ל-clipboard.
 * Fallback ל-execCommand אם Clipboard API לא זמין.
 * @param text - טקסט להעתקה
 * @returns תוצאת ההעתקה
 */
export async function copyToClipboard(text: string): Promise<SendResult> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    }

    // Fallback: document.execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);

    return ok
      ? { success: true, method: 'clipboard' }
      : { success: false, method: 'clipboard', error: 'execCommand failed' };
  } catch (err) {
    return {
      success: false,
      method: 'clipboard',
      error: err instanceof Error ? err.message : 'Unknown clipboard error',
    };
  }
}

// #endregion

// #region WhatsApp

/**
 * בונה טקסט הודעה מוכן ל-WhatsApp (URL-encoded).
 * @param body - גוף ההודעה
 * @returns טקסט encoded
 */
export function buildWhatsAppText(body: string): string {
  return encodeURIComponent(body);
}

/**
 * בונה WhatsApp deep link לשליחה ישירה.
 * פורמט: https://wa.me/<phone>?text=<encoded>
 * @param phone - מספר טלפון (עם קידומת מדינה, ללא +)
 * @param body - גוף ההודעה
 * @returns URL מלא, או null אם אין טלפון
 */
export function buildWhatsAppLink(phone: string | undefined, body: string): string | null {
  if (!phone) return null;

  // נרמול: הסר +, מקפים, רווחים
  const clean = phone.replace(/[\s\-+()]/g, '');

  // אם מתחיל ב-0 → ישראל (972)
  const normalized = clean.startsWith('0')
    ? '972' + clean.slice(1)
    : clean;

  return `https://wa.me/${normalized}?text=${buildWhatsAppText(body)}`;
}

// #endregion
