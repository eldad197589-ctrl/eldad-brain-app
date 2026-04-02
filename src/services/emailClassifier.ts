/* ============================================
   FILE: emailClassifier.ts
   PURPOSE: Smart classification of emails — work vs personal, including war compensation
   DEPENDENCIES: ../system/processSeed (Registry), classificationTypes, extractors,
                 ../system/knowledge/warCompensationKnowledge (Knowledge Layer)
   EXPORTS: EmailClassification, classifyEmail, extractIsraelDomainOrEntity
   ============================================ */
import { WAR_COMP_SENDER_DOMAINS } from '../system/knowledge/warCompensationKnowledge';
/**
 * FILE: emailClassifier.ts
 * PURPOSE: Smart classification of emails — work vs personal
 * DEPENDENCIES: none (pure logic)
 *
 * Per Eldad: "לא כל מייל הוא מייל עבודה — שים לב!"
 * This classifier identifies work-relevant emails using:
 * 1. Sender domain patterns (government, banks, clients)
 * 2. Subject keywords (חשבונית, מס, שכר, etc.)
 * 3. Attachment types (PDF, XLSX)
 */

// #region Types

/** Classification result */
export interface EmailClassification {
  /** Is this a work-relevant email? */
  isWork: boolean;
  /** Confidence score 0-100 */
  confidence: number;
  /** Detected category */
  category: 'invoice' | 'tax_notice' | 'client' | 'bank' | 'government' | 'legal' | 'payroll' | 'general_work' | 'personal' | 'spam';
  /** Suggested document type for DocumentIntake */
  suggestedDocType?: 'supplier_invoice' | 'client_doc' | 'tax_notice' | 'contract' | 'other';
  /** Classification reason (Hebrew) */
  reason: string;
}

// #endregion

// #region Work Domain Patterns

/** Known work-related sender domains */
const WORK_DOMAINS: Record<string, { category: EmailClassification['category']; label: string }> = {
  // Government & Tax
  'taxes.gov.il': { category: 'government', label: 'רשות המסים' },
  'gov.il': { category: 'government', label: 'ממשלת ישראל' },
  'btl.gov.il': { category: 'government', label: 'ביטוח לאומי' },
  'justice.gov.il': { category: 'legal', label: 'משרד המשפטים' },
  'nevo.co.il': { category: 'legal', label: 'נבו' },
  'mas-rechush.gov.il': { category: 'legal', label: 'מס רכוש — פיצויי מלחמה' },
  'rfrp.gov.il': { category: 'legal', label: 'קרן הפיצויים — מס רכוש' },
  'boi.org.il': { category: 'government', label: 'בנק ישראל' },
  // Knowledge Layer — sender domains
  ...Object.fromEntries(
    Object.entries(WAR_COMP_SENDER_DOMAINS)
      .filter(([d]) => !['taxes.gov.il', 'btl.gov.il', 'mas-rechush.gov.il', 'rfrp.gov.il'].includes(d))
      .map(([d, info]) => [d, { category: info.category as EmailClassification['category'], label: info.label }])
  ),
  // Banks
  'leumi.co.il': { category: 'bank', label: 'בנק לאומי' },
  'bankhapoalim.co.il': { category: 'bank', label: 'בנק הפועלים' },
  'discountbank.co.il': { category: 'bank', label: 'בנק דיסקונט' },
  'mizrahi-tefahot.co.il': { category: 'bank', label: 'מזרחי טפחות' },
  'fibi.co.il': { category: 'bank', label: 'הבנק הבינלאומי' },
  'bank-yahav.co.il': { category: 'bank', label: 'בנק יהב' },
  'mercantile.co.il': { category: 'bank', label: 'מרכנתיל' },
  // Accounting & Legal platforms
  'hashavshevet.co.il': { category: 'invoice', label: 'חשבשבת' },
  'invoice4u.co.il': { category: 'invoice', label: 'חשבונית ירוקה' },
  'greeninvoice.co.il': { category: 'invoice', label: 'חשבונית ירוקה' },
  'rivhit.co.il': { category: 'invoice', label: 'רווחית' },
  'priority-software.com': { category: 'invoice', label: 'פריוריטי' },
  'sapir.co.il': { category: 'invoice', label: 'ספיר' },
  'wizcloud.co.il': { category: 'invoice', label: 'Wizcloud' },
  'icount.co.il': { category: 'invoice', label: 'iCount' },
  // Payroll
  'hilan.co.il': { category: 'payroll', label: 'הילן' },
  'menora.co.il': { category: 'payroll', label: 'מנורה' },
  'migdal.co.il': { category: 'payroll', label: 'מגדל' },
  'clal.co.il': { category: 'payroll', label: 'כלל' },
  'psagot.co.il': { category: 'payroll', label: 'פסגות' },
};

/** Known personal/spam domains to ignore */
const PERSONAL_DOMAINS = new Set([
  'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
  'linkedin.com', 'pinterest.com', 'reddit.com',
  'amazon.com', 'ebay.com', 'aliexpress.com',
  'netflix.com', 'spotify.com', 'youtube.com',
  'walla.co.il', 'ynet.co.il', 'mako.co.il',
]);

// #endregion

// #region Subject Keywords

/** Work-related Hebrew keywords with weights */
const WORK_KEYWORDS: { pattern: RegExp; weight: number; category: EmailClassification['category'] }[] = [
  // Invoices
  { pattern: /חשבונית/i, weight: 90, category: 'invoice' },
  { pattern: /קבלה/i, weight: 80, category: 'invoice' },
  { pattern: /הצעת מחיר/i, weight: 85, category: 'invoice' },
  { pattern: /invoice/i, weight: 85, category: 'invoice' },
  // Tax
  { pattern: /מס הכנסה/i, weight: 95, category: 'tax_notice' },
  { pattern: /מע"?מ/i, weight: 90, category: 'tax_notice' },
  { pattern: /ביטוח לאומי/i, weight: 90, category: 'tax_notice' },
  { pattern: /שומה/i, weight: 95, category: 'tax_notice' },
  { pattern: /דו"?ח שנתי/i, weight: 88, category: 'tax_notice' },
  { pattern: /ניכוי מס/i, weight: 90, category: 'tax_notice' },
  { pattern: /106/i, weight: 70, category: 'payroll' },
  { pattern: /857/i, weight: 80, category: 'tax_notice' },
  // Payroll
  { pattern: /שכר/i, weight: 80, category: 'payroll' },
  { pattern: /תלוש/i, weight: 85, category: 'payroll' },
  { pattern: /משכורת/i, weight: 85, category: 'payroll' },
  { pattern: /פנסי/i, weight: 80, category: 'payroll' },
  // Legal / Contract
  { pattern: /הסכם/i, weight: 80, category: 'legal' },
  { pattern: /חוזה/i, weight: 80, category: 'legal' },
  { pattern: /ייפוי כוח/i, weight: 90, category: 'legal' },
  // Client
  { pattern: /לקוח/i, weight: 60, category: 'client' },
  { pattern: /תיק/i, weight: 50, category: 'client' },
  // Bank
  { pattern: /דף חשבון/i, weight: 85, category: 'bank' },
  { pattern: /אישור יתרה/i, weight: 90, category: 'bank' },
  { pattern: /העברה בנקאית/i, weight: 80, category: 'bank' },
  // General work
  { pattern: /דחוף/i, weight: 40, category: 'general_work' },
  { pattern: /אישור/i, weight: 35, category: 'general_work' },
  { pattern: /בקשה/i, weight: 30, category: 'general_work' },
  // War compensation — מסלול אדום / פיצויי מלחמה (Knowledge Layer)
  { pattern: /פיצוי מלחמה|פיצויי מלחמה/i, weight: 95, category: 'legal' },
  { pattern: /מסלול אדום/i, weight: 95, category: 'legal' },
  { pattern: /חרבות ברזל/i, weight: 90, category: 'legal' },
  { pattern: /צוק איתן/i, weight: 85, category: 'legal' },
  { pattern: /נזק עקיף/i, weight: 90, category: 'legal' },
  { pattern: /מס רכוש/i, weight: 85, category: 'legal' },
  { pattern: /ערר.*רשות|ערר.*מס/i, weight: 90, category: 'legal' },
  { pattern: /תביעת פיצוי/i, weight: 88, category: 'legal' },
  // Knowledge Layer — מבצעים נוספים
  { pattern: /עם כלביא/i, weight: 90, category: 'legal' },
  { pattern: /שאגת הארי/i, weight: 80, category: 'legal' },
  // Knowledge Layer — מסמכים ותהליכי פיצוי
  { pattern: /קרן הפיצויים|קרן פיצויים/i, weight: 90, category: 'legal' },
  { pattern: /השלמת מסמכים.*נזק|נזק.*השלמת מסמכים/i, weight: 88, category: 'legal' },
  { pattern: /מענק עידוד תעסוקה/i, weight: 80, category: 'legal' },
  { pattern: /פיצוי.*נזק עקיף|נזק עקיף.*פיצוי/i, weight: 92, category: 'legal' },
  { pattern: /חישוב הפסד/i, weight: 85, category: 'legal' },
  { pattern: /יישוב ספר/i, weight: 80, category: 'legal' },
];

/** Work-related attachment extensions */
const WORK_ATTACHMENTS = new Set(['pdf', 'xlsx', 'xls', 'csv', 'doc', 'docx']);

// #endregion

// #region Classifier

/**
 * Classify an email as work-relevant or personal.
 * @param from — Sender email/name
 * @param subject — Email subject
 * @param attachmentNames — List of attachment filenames
 * @returns Classification result with confidence and category
 */
export function classifyEmail(
  from: string,
  subject: string,
  attachmentNames: string[] = [],
): EmailClassification {
  let score = 0;
  let detectedCategory: EmailClassification['category'] = 'personal';
  let reason = '';

  // 1. Check sender domain
  const domainMatch = from.match(/@([a-zA-Z0-9.-]+)/);
  if (domainMatch) {
    const domain = domainMatch[1].toLowerCase();

    // Known work domain?
    for (const [workDomain, info] of Object.entries(WORK_DOMAINS)) {
      if (domain.endsWith(workDomain)) {
        score += 80;
        detectedCategory = info.category;
        reason = `שולח מזוהה: ${info.label}`;
        break;
      }
    }

    // Known personal domain?
    if (PERSONAL_DOMAINS.has(domain)) {
      return {
        isWork: false, confidence: 95,
        category: 'personal', reason: 'שולח מזוהה כאישי/ספאם',
      };
    }
  }

  // 2. Check subject keywords
  for (const kw of WORK_KEYWORDS) {
    if (kw.pattern.test(subject)) {
      if (kw.weight > score) {
        score = Math.max(score, kw.weight);
        detectedCategory = kw.category;
        reason = reason || `נמצאה מילת מפתח: "${subject.match(kw.pattern)?.[0]}"`;
      }
    }
  }

  // 3. Check attachments
  const hasWorkAttachment = attachmentNames.some((name) => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ext && WORK_ATTACHMENTS.has(ext);
  });
  if (hasWorkAttachment) {
    score += 20;
    if (!reason) reason = 'מסמך מצורף (PDF/Excel)';
  }

  // 4. Map category to suggested doc type
  const docTypeMap: Record<string, EmailClassification['suggestedDocType']> = {
    invoice: 'supplier_invoice',
    tax_notice: 'tax_notice',
    client: 'client_doc',
    legal: 'contract',
    bank: 'other',
    government: 'tax_notice',
    payroll: 'other',
    general_work: 'other',
  };

  const isWork = score >= 40;

  return {
    isWork,
    confidence: Math.min(score, 100),
    category: isWork ? detectedCategory : 'personal',
    suggestedDocType: isWork ? docTypeMap[detectedCategory] : undefined,
    reason: reason || (isWork ? 'מסווג כקשור לעבודה' : 'לא זוהה כמייל עבודה'),
  };
}

// #endregion

// #region Helpers

/**
 * Extracts a recognizable explicit entity name from a string (email or filename)
 * @param text — The text to analyze
 * @returns The Hebrew name of the entity if found, otherwise undefined
 */
export function extractIsraelDomainOrEntity(text: string): string | undefined {
  const t = text.toLowerCase();
  
  // Check against known work domains
  for (const [workDomain, info] of Object.entries(WORK_DOMAINS)) {
    if (t.includes(workDomain)) return info.label;
  }
  
  // Check against known labels in text directly
  const knownLabels = Object.values(WORK_DOMAINS).map(i => i.label);
  for (const label of knownLabels) {
    if (t.includes(label)) return label;
  }
  
  return undefined;
}

// #endregion

// #region Full Classification (email-to-workflow)

import type { EmailCategory, ClassifiedEmail } from '../integrations/gmail/classificationTypes';
import { CATEGORY_QUEUE_MAP } from '../integrations/gmail/classificationTypes';
import { extractAll } from '../integrations/gmail/extractors';

/** מיפוי קטגוריה מקורית → EmailCategory */
const CATEGORY_MAP: Record<EmailClassification['category'], EmailCategory> = {
  invoice: 'invoice',
  tax_notice: 'accounting_document',
  client: 'client_document',
  bank: 'bank_request',
  government: 'legal_task',
  legal: 'legal_task',
  payroll: 'accounting_document',
  general_work: 'client_document',
  personal: 'marketing',
  spam: 'marketing',
};

/** Gmail labels → category signals */
const LABEL_SIGNALS: Record<string, EmailCategory> = {
  'taxes': 'accounting_document',
  'מסים': 'accounting_document',
  'invoices': 'invoice',
  'חשבוניות': 'invoice',
  'bank': 'bank_request',
  'בנק': 'bank_request',
  'client': 'client_document',
  'לקוח': 'client_document',
  'legal': 'legal_task',
  'משפטי': 'legal_task',
  'payments': 'payment_required',
  'תשלומים': 'payment_required',
  'receipts': 'invoice',
  'קבלות': 'invoice',
};

/**
 * סיווג מלא של מייל — מחזיר ClassifiedEmail מוכן לניתוב.
 * משלב: domain patterns + keyword weights + Gmail labels + extraction
 * @param emailId — מזהה ייחודי
 * @param from — שולח
 * @param subject — נושא
 * @param body — גוף המייל
 * @param date — תאריך
 * @param labels — תוויות Gmail
 * @returns ClassifiedEmail עם כל הנתונים לניתוב
 */
export function classifyEmailFull(
  emailId: string,
  from: string,
  subject: string,
  body: string,
  date: string,
  labels: string[] = []
): ClassifiedEmail {
  // שלב 1: סיווג בסיסי (domain + keywords)
  const basic = classifyEmail(from, subject);

  // שלב 2: בדוק labels של Gmail
  let labelCategory: EmailCategory | null = null;
  for (const label of labels) {
    const lowerLabel = label.toLowerCase();
    for (const [key, cat] of Object.entries(LABEL_SIGNALS)) {
      if (lowerLabel.includes(key)) {
        labelCategory = cat;
        break;
      }
    }
    if (labelCategory) break;
  }

  // שלב 3: בדוק אם יש סכום → ייתכן payment_required
  const extracted = extractAll(from, subject, body);
  const hasAmount = extracted.amount !== null && extracted.amount > 0;
  const hasPayLink = extracted.paymentLink !== null;

  // החלטה סופית
  let category: EmailCategory;
  let confidence = basic.confidence;
  let reason = basic.reason;

  if (labelCategory) {
    // Label מ-Gmail עוקף (מגביר ביטחון)
    category = labelCategory;
    confidence = Math.max(confidence, 75);
    reason += ` | Gmail label: ${labels.join(', ')}`;
  } else if (basic.isWork) {
    category = CATEGORY_MAP[basic.category] || 'client_document';
  } else if (hasAmount && hasPayLink) {
    // לא מזוהה כעבודה אבל יש סכום + קישור תשלום
    category = 'payment_required';
    confidence = 60;
    reason = 'סכום + קישור תשלום';
  } else if (!basic.isWork) {
    category = 'marketing';
  } else {
    category = 'marketing';
  }

  return {
    emailId,
    from,
    subject,
    body,
    date,
    labels,
    category,
    confidence,
    reason,
    extracted,
    targetQueue: CATEGORY_QUEUE_MAP[category],
  };
}

// #endregion
