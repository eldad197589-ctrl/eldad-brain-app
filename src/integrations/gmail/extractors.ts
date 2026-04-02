/* ============================================
   FILE: extractors.ts
   PURPOSE: חילוץ נתונים מגוף מייל — סכום, תאריך, שם לקוח, קבצים, פעולה נדרשת
   DEPENDENCIES: ./classificationTypes
   EXPORTS: extractAll, extractAmount, extractDueDate, extractClientName,
            extractAttachments, extractActionRequired, extractPaymentLink
   ============================================ */
import type { ExtractedData } from './classificationTypes';

// #region Amount Extraction

/**
 * חילוץ סכום מטקסט מייל.
 * תומך ב: ₪, ש"ח, NIS, ILS, סה"כ, total, חיוב, לתשלום
 * @returns סכום או null אם לא נמצא
 */
export function extractAmount(text: string): number | null {
  const patterns = [
    /₪\s?([\d,]+\.?\d*)/,
    /([\d,]+\.?\d*)\s*ש"ח/,
    /([\d,]+\.?\d*)\s*₪/,
    /(?:NIS|ILS)\s?([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:NIS|ILS)/i,
    /סכום[:\s]*([\d,]+\.?\d*)/,
    /סה"כ[:\s]*([\d,]+\.?\d*)/,
    /לתשלום[:\s]*([\d,]+\.?\d*)/,
    /חיוב[:\s]*(?:של\s)?([\d,]+\.?\d*)/,
    /יתרה[:\s]*([\d,]+\.?\d*)/,
    /עלות[:\s]*([\d,]+\.?\d*)/,
    /total[:\s]*([\d,]+\.?\d*)/i,
    /amount[:\s]*([\d,]+\.?\d*)/i,
    /charge[:\s]*([\d,]+\.?\d*)/i,
    /payment[:\s]*([\d,]+\.?\d*)/i,
    /price[:\s]*([\d,]+\.?\d*)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 0 && val < 1_000_000) return val;
    }
  }
  return null;
}

// #endregion

// #region Date Extraction

/**
 * חילוץ תאריך פדיון מטקסט מייל.
 * תומך ב: ISO, dd/mm/yyyy, dd.mm.yyyy, ביטויי "עד"/"due", חודשים בעברית
 * @returns תאריך בפורמט ISO (yyyy-mm-dd) או null
 */
export function extractDueDate(text: string): string | null {
  const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const hebrewDate = text.match(
    /(?:עד|מועד אחרון|תאריך פדיון|פדיון|due date|expires?|valid until)[:\s]*(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})/i
  );
  if (hebrewDate) {
    return `${hebrewDate[3]}-${hebrewDate[2].padStart(2, '0')}-${hebrewDate[1].padStart(2, '0')}`;
  }

  const dmy = text.match(/(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

  const heMonths: Record<string, string> = {
    'ינואר': '01', 'פברואר': '02', 'מרץ': '03', 'אפריל': '04',
    'מאי': '05', 'יוני': '06', 'יולי': '07', 'אוגוסט': '08',
    'ספטמבר': '09', 'אוקטובר': '10', 'נובמבר': '11', 'דצמבר': '12',
  };
  for (const [name, num] of Object.entries(heMonths)) {
    const mMatch = text.match(new RegExp(`(\\d{1,2})?\\s*(?:ב)?${name}\\s*(\\d{4})`));
    if (mMatch) {
      const day = mMatch[1] ? mMatch[1].padStart(2, '0') : '01';
      return `${mMatch[2]}-${num}-${day}`;
    }
  }

  return null;
}

// #endregion

// #region Client Name Extraction

/**
 * חילוץ שם לקוח / ישות מטקסט מייל.
 * מזהה: "לכב'", "עבור לקוח", "בעניין", שם חברה מוכר
 */
export function extractClientName(from: string, subject: string, body: string): string | null {
  const fullText = `${subject} ${body}`;

  // ביטויים ישירים
  const patterns = [
    /לכב[ו']?ד?\s+(.{3,30}?)(?:\s*,|\s*\n|\s*$)/,
    /עבור\s+(?:לקוח|חולה|מטופל|מרפאה)?\s*:?\s*(.{3,30}?)(?:\s*,|\s*\n)/,
    /בעניין\s*:?\s*(.{3,40}?)(?:\s*\n|\s*$)/,
    /שם\s*(?:הלקוח|החברה|המבקש)\s*:?\s*(.{3,30}?)(?:\s*\n|\s*$)/,
    /re:\s*(.{5,40})/i,
  ];
  for (const p of patterns) {
    const m = fullText.match(p);
    if (m && m[1].trim().length >= 3) return m[1].trim();
  }

  // מה-From: "איוון פטרוב <ivan@example.com>" → "איוון פטרוב"
  const fromName = from.match(/^([^<@]+)</);
  if (fromName && fromName[1].trim().length >= 3) return fromName[1].trim();

  return null;
}

// #endregion

// #region Attachment Extraction

/**
 * חילוץ שמות קבצים מצורפים מגוף HTML/text.
 * מזהה: שמות קבצים עם סיומות מסמכים
 */
export function extractAttachments(body: string): string[] {
  const filePattern = /[\w\u0590-\u05FF\s.-]+\.(?:pdf|xlsx?|csv|docx?|zip|png|jpg)/gi;
  const matches = body.match(filePattern) || [];
  return [...new Set(matches.map(f => f.trim()))];
}

// #endregion

// #region Action Extraction

/**
 * חילוץ פעולה נדרשת מטקסט מייל.
 * מזהה: "יש להגיש", "נדרש", "לתגובה", "דרישה", "due"
 */
export function extractActionRequired(text: string): string | null {
  const actions = [
    { pattern: /יש להגיש\s+(.{3,50}?)(?:\s*\.|$)/i, label: 'הגשה' },
    { pattern: /נדרש\s+(.{3,50}?)(?:\s*\.|$)/i, label: 'פעולה נדרשת' },
    { pattern: /לתגובה\s*(?:עד|לפני)?\s*(.{0,30})/i, label: 'תגובה נדרשת' },
    { pattern: /דרישה\s+(.{3,50}?)(?:\s*\.|$)/i, label: 'דרישה' },
    { pattern: /יש לשלוח\s+(.{3,50}?)(?:\s*\.|$)/i, label: 'שליחת מסמך' },
    { pattern: /יש לעדכן\s+(.{3,50}?)(?:\s*\.|$)/i, label: 'עדכון' },
    { pattern: /אנא (השב|הגב|שלח|עדכן|מלא)/i, label: 'מענה נדרש' },
    { pattern: /please\s+(respond|submit|send|update)/i, label: 'action required' },
  ];

  for (const a of actions) {
    const m = text.match(a.pattern);
    if (m) return `${a.label}: ${m[1] || ''}`.trim();
  }
  return null;
}

// #endregion

// #region Payment Link

/**
 * חילוץ קישור תשלום מטקסט מייל
 */
export function extractPaymentLink(text: string): string | null {
  const m = text.match(/(https?:\/\/[^\s<>"]+(?:pay|תשלום|checkout|billing)[^\s<>"]*)/i);
  return m ? m[1] : null;
}

// #endregion

// #region Combined Extraction

/**
 * חילוץ כל השדות הרלוונטיים ממייל אחד
 */
export function extractAll(from: string, subject: string, body: string): ExtractedData {
  const fullText = `${subject} ${body}`;
  return {
    clientName: extractClientName(from, subject, body),
    amount: extractAmount(fullText),
    dueDate: extractDueDate(fullText),
    attachments: extractAttachments(body),
    actionRequired: extractActionRequired(fullText),
    paymentLink: extractPaymentLink(body),
  };
}

// #endregion
