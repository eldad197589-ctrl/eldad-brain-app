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
