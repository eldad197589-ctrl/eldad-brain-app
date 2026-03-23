/* ============================================
   FILE: constants.ts
   PURPOSE: Static data and configuration
   DEPENDENCIES: lucide-react
   EXPORTS: FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID, FIELD_SENDER, CATEGORIES, TEMPLATES, getTemplatesByCategory, searchTemplates
   ============================================ */
/**
 * Documents — Constants & Template Data
 *
 * FILE: constants.ts
 * PURPOSE: Category definitions and initial letter templates ported from SmartBureau.
 * DEPENDENCIES: types.ts, lucide-react
 */
import {
  Landmark, Shield, Building2, Users, FileText,
  Clock, AlertTriangle, CreditCard, FileCheck,
} from 'lucide-react';
import type { LetterCategory, LetterTemplate, LetterField } from './types';

// #region Common Fields (reusable across templates)

/** Standard date field */
export const FIELD_DATE: LetterField = {
  id: 'date', label: 'תאריך', type: 'date', required: true,
  defaultValue: new Date().toISOString().split('T')[0],
};

/** Client name field */
export const FIELD_CLIENT_NAME: LetterField = {
  id: 'client_name', label: 'שם הלקוח / העסק', type: 'text', required: true,
};

/** Client ID (ת.ז / ח.פ) */
export const FIELD_CLIENT_ID: LetterField = {
  id: 'client_id', label: 'ת.ז / ח.פ', type: 'text', required: true,
};

/** Sender/signer name */
export const FIELD_SENDER: LetterField = {
  id: 'sender_name', label: 'שם החותם', type: 'text', defaultValue: 'אלדד דוד רו"ח',
};

// #endregion

// #region Categories

/** Document categories displayed on the main page */
export const CATEGORIES: LetterCategory[] = [
  { id: 'tax_authorities', label: 'רשויות המס', icon: Landmark, color: '#818cf8' },
  { id: 'national_insurance', label: 'ביטוח לאומי', icon: Shield, color: '#60a5fa' },
  { id: 'banking', label: 'בנקים ופיננסים', icon: Building2, color: '#34d399' },
  { id: 'employment', label: 'דיני עבודה', icon: Users, color: '#2dd4bf' },
  { id: 'general', label: 'מכתבים כלליים', icon: FileText, color: '#94a3b8' },
];

// #endregion

// #region Templates

/** Initial letter templates — ported from SmartBureau LetterTemplates.ts */
export const TEMPLATES: LetterTemplate[] = [
  // ─── רשויות המס ───
  {
    id: 'tax_extension',
    title: 'בקשה לארכה — דוח שנתי',
    category: 'tax_authorities',
    description: 'בקשה לפקיד השומה למתן ארכה להגשת הדוח השנתי.',
    icon: Clock,
    tags: ['ארכה', 'מס הכנסה', 'דוח שנתי'],
    defaultSubject: 'בקשה לארכה להגשת דוח שנתי לשנת {{tax_year}} — {{client_name}}',
    fields: [
      FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID,
      { id: 'tax_year', label: 'שנת מס', type: 'text', required: true, placeholder: '2025' },
      { id: 'tax_office', label: 'פקיד שומה', type: 'text', placeholder: 'תל אביב 3' },
      { id: 'reason', label: 'סיבת הבקשה', type: 'textarea', placeholder: 'מסמכים חסרים / עומס עבודה...' },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>פקיד שומה {{tax_office}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה לארכה להגשת דוח שנתי לשנת {{tax_year}}</h3>
<h4>נישום: {{client_name}} | ת.ז/ח.פ: {{client_id}}</h4>
<br/>
<p>הריני לפנות אליכם בבקשה למתן ארכה להגשת הדוח השנתי של מרשי לשנת המס {{tax_year}}.</p>
<br/>
<h4>נימוקי הבקשה:</h4>
<p>{{reason}}</p>
<br/>
<p>מרשי מתחייב להגיש את הדוח בהקדם האפשרי לאחר קבלת הארכה.</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>תאריך: {{date}}</p>`,
  },
  {
    id: 'tax_penalty_cancel',
    title: 'בקשה לביטול קנס',
    category: 'tax_authorities',
    description: 'בקשה מנומקת לביטול קנס בשל איחור בדיווח או תשלום.',
    icon: AlertTriangle,
    tags: ['קנס', 'ביטול', 'מס הכנסה'],
    defaultSubject: 'בקשה לביטול קנס — {{client_name}}',
    fields: [
      FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID,
      { id: 'tax_office', label: 'פקיד שומה', type: 'text' },
      { id: 'penalty_date', label: 'תאריך הקנס', type: 'date', required: true },
      { id: 'penalty_amount', label: 'סכום הקנס', type: 'currency', required: true },
      { id: 'reason', label: 'נימוק לביטול', type: 'textarea', required: true, placeholder: 'סיבה ראשונה, איחור חד פעמי...' },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>מחלקת הגבייה — פקיד שומה {{tax_office}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה לביטול קנס</h3>
<h4>נישום: {{client_name}} | ת.ז/ח.פ: {{client_id}}</h4>
<br/>
<p>הריני לפנות אליכם בבקשה לבטל את הקנס בסך <strong>₪{{penalty_amount}}</strong> שהוטל ביום {{penalty_date}}.</p>
<br/>
<h4>נימוקים:</h4>
<div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px;">
<p>{{reason}}</p>
</div>
<br/>
<p>מרשי מתחייב לדיווח ותשלום מלא ובזמן מכאן ואילך.</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>תאריך: {{date}}</p>`,
  },
  {
    id: 'tax_deduction_auth',
    title: 'בקשה לאישור ניהול ספרים',
    category: 'tax_authorities',
    description: 'פניה לפקיד השומה להנפקת אישור ניהול ספרים וניכוי מס במקור.',
    icon: FileCheck,
    tags: ['אישור', 'ניהול ספרים'],
    defaultSubject: 'בקשה לאישור ניהול ספרים — {{client_name}}',
    fields: [
      FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID,
      { id: 'tax_office', label: 'פקיד שומה', type: 'text', placeholder: 'תל אביב 3' },
      { id: 'tax_file_number', label: 'מספר תיק', type: 'text' },
      { id: 'client_address', label: 'כתובת', type: 'text' },
      { id: 'request_purpose', label: 'מטרת הבקשה', type: 'text', placeholder: 'השתתפות במכרז, חתימת חוזה...' },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>פקיד שומה {{tax_office}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה לאישור ניהול ספרים וניכוי מס במקור — {{client_name}}</h3>
<br/>
<p>בשם מרשי, <strong>{{client_name}}</strong>, תיק מס' <strong>{{tax_file_number}}</strong>,</p>
<p>הריני לפנות אליכם בבקשה להנפיק אישור ניהול ספרים ואישור ניכוי מס במקור.</p>
<br/>
<h4>פרטי העוסק:</h4>
<div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 15px; border-radius: 8px;">
<p><strong>שם:</strong> {{client_name}}</p>
<p><strong>ח.פ/ע.מ:</strong> {{client_id}}</p>
<p><strong>מספר תיק:</strong> {{tax_file_number}}</p>
<p><strong>כתובת:</strong> {{client_address}}</p>
</div>
<br/>
<p><strong>מטרת הבקשה:</strong> {{request_purpose}}</p>
<br/>
<p>מצורפים בזאת: טופס בקשה חתום, ייפוי כוח (במידת הצורך).</p>
<br/>
<p>נודה לטיפולכם בהקדם האפשרי.</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>תאריך: {{date}}</p>`,
  },
  {
    id: 'tax_payment_plan',
    title: 'בקשה לפריסת תשלומים',
    category: 'tax_authorities',
    description: 'בקשה לפריסת חוב מס לתשלומים חודשיים.',
    icon: CreditCard,
    tags: ['פריסה', 'תשלומים', 'חוב'],
    defaultSubject: 'בקשה לפריסת חוב מס — {{client_name}}',
    fields: [
      FIELD_DATE, FIELD_CLIENT_NAME,
      { id: 'tax_office', label: 'פקיד שומה', type: 'text' },
      { id: 'tax_file_number', label: 'מספר תיק', type: 'text' },
      { id: 'debt_amount', label: 'סכום החוב', type: 'currency', required: true },
      { id: 'num_payments', label: 'מספר תשלומים מבוקש', type: 'text', required: true },
      { id: 'monthly_payment', label: 'תשלום חודשי מוצע', type: 'currency' },
      { id: 'reason', label: 'סיבת הבקשה', type: 'textarea', placeholder: 'קשיים כלכליים / תזרימיים...' },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>מחלקת גבייה — פקיד שומה {{tax_office}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה לפריסת חוב מס לתשלומים</h3>
<h4>נישום: {{client_name}} | תיק: {{tax_file_number}}</h4>
<br/>
<p>הריני לפנות בבקשה לפרוס את חוב המס של מרשי לתשלומים חודשיים.</p>
<br/>
<div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 15px; border-radius: 8px;">
<p><strong>סכום החוב:</strong> ₪{{debt_amount}}</p>
<p><strong>מספר תשלומים מבוקש:</strong> {{num_payments}}</p>
<p><strong>סכום תשלום חודשי:</strong> ₪{{monthly_payment}}</p>
</div>
<br/>
<h4>הסיבה לבקשה:</h4>
<p>{{reason}}</p>
<br/>
<p>מרשי מתחייב לעמוד בתנאי ההסדר ולשלם את התשלומים במועדם.</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>תאריך: {{date}}</p>`,
  },

  // ─── ביטוח לאומי ───
  {
    id: 'bl_payment_plan',
    title: 'בקשה לפריסת חוב — ביטוח לאומי',
    category: 'national_insurance',
    description: 'בקשה לפריסת חוב לביטוח לאומי.',
    icon: CreditCard,
    tags: ['ביטוח לאומי', 'חוב', 'פריסה'],
    defaultSubject: 'בקשה לפריסת חוב ביטוח לאומי — {{client_name}}',
    fields: [
      FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID,
      { id: 'branch', label: 'סניף', type: 'text' },
      { id: 'debt_amount', label: 'סכום החוב', type: 'currency', required: true },
      { id: 'num_payments', label: 'מספר תשלומים', type: 'text', required: true },
      { id: 'reason', label: 'סיבת הבקשה', type: 'textarea' },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>המוסד לביטוח לאומי — סניף {{branch}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה לפריסת חוב</h3>
<br/>
<p>בשם מרשי, <strong>{{client_name}}</strong>, ת.ז/ח.פ <strong>{{client_id}}</strong>,</p>
<p>הריני לפנות בבקשה לפרוס את החוב לתשלומים חודשיים.</p>
<br/>
<div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 8px;">
<p><strong>סכום החוב:</strong> ₪{{debt_amount}}</p>
<p><strong>מספר תשלומים מבוקש:</strong> {{num_payments}}</p>
</div>
<br/>
<h4>הסיבה לבקשה:</h4>
<p>{{reason}}</p>
<br/>
<p>מרשי מתחייב לעמוד בהסדר ולשלם במועד.</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>תאריך: {{date}}</p>`,
  },
  {
    id: 'bl_status_request',
    title: 'בקשה לבירור מצב חשבון',
    category: 'national_insurance',
    description: 'בקשה לקבלת פירוט חשבון ומצב תשלומים מביטוח לאומי.',
    icon: FileText,
    tags: ['ביטוח לאומי', 'בירור'],
    defaultSubject: 'בקשה לבירור מצב חשבון — {{client_name}}',
    fields: [FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID, FIELD_SENDER],
    content: `<p><strong>לכבוד:</strong></p>
<p>המוסד לביטוח לאומי</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה לבירור מצב חשבון</h3>
<br/>
<p>בשם מרשי, <strong>{{client_name}}</strong>, ת.ז/ח.פ <strong>{{client_id}}</strong>,</p>
<p>אבקש לקבל פירוט עדכני של מצב החשבון הכולל:</p>
<br/>
<ul>
<li>יתרת חוב / זכות</li>
<li>פירוט תשלומים</li>
<li>תקופות דיווח</li>
</ul>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>תאריך: {{date}}</p>`,
  },

  // ─── בנקים ───
  {
    id: 'bank_guarantee',
    title: 'בקשה לערבות בנקאית',
    category: 'banking',
    description: 'בקשה להפקת ערבות בנקאית.',
    icon: Shield,
    tags: ['בנק', 'ערבות'],
    defaultSubject: 'בקשה להנפקת ערבות בנקאית — {{company_name}}',
    fields: [
      FIELD_DATE,
      { id: 'company_name', label: 'שם החברה', type: 'text', required: true },
      { id: 'company_id', label: 'ח.פ', type: 'text', required: true },
      { id: 'bank_name', label: 'שם הבנק', type: 'text', required: true },
      { id: 'branch_name', label: 'שם הסניף', type: 'text' },
      { id: 'guarantee_amount', label: 'סכום הערבות', type: 'currency', required: true },
      { id: 'guarantee_type', label: 'סוג הערבות', type: 'select', options: ['ביצוע', 'מכרז', 'שכירות', 'אחר'] },
      { id: 'beneficiary', label: 'המוטב', type: 'text', required: true },
      { id: 'expiry_date', label: 'תוקף עד', type: 'date' },
      { id: 'purpose', label: 'מטרת הערבות', type: 'textarea' },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>מנהל סניף {{bank_name}} — סניף {{branch_name}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה להנפקת ערבות בנקאית</h3>
<br/>
<p>בשם חברת <strong>{{company_name}}</strong>, ח.פ. <strong>{{company_id}}</strong>,</p>
<p>הריני לבקש להנפיק ערבות בנקאית כדלקמן:</p>
<br/>
<div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 8px;">
<p><strong>סכום הערבות:</strong> ₪{{guarantee_amount}}</p>
<p><strong>סוג הערבות:</strong> {{guarantee_type}}</p>
<p><strong>לטובת:</strong> {{beneficiary}}</p>
<p><strong>תוקף עד:</strong> {{expiry_date}}</p>
</div>
<br/>
<h4>מטרת הערבות:</h4>
<p>{{purpose}}</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>{{company_name}}</p>
<p>תאריך: {{date}}</p>`,
  },
  {
    id: 'bank_credit_request',
    title: 'בקשה להגדלת מסגרת אשראי',
    category: 'banking',
    description: 'בקשה להגדלת אשראי עסקי.',
    icon: CreditCard,
    tags: ['בנק', 'אשראי'],
    defaultSubject: 'בקשה להגדלת מסגרת אשראי — {{company_name}}',
    fields: [
      FIELD_DATE,
      { id: 'company_name', label: 'שם החברה', type: 'text', required: true },
      { id: 'company_id', label: 'ח.פ', type: 'text' },
      { id: 'bank_name', label: 'שם הבנק', type: 'text', required: true },
      { id: 'account_number', label: 'מספר חשבון', type: 'text' },
      { id: 'current_limit', label: 'מסגרת נוכחית', type: 'currency' },
      { id: 'requested_limit', label: 'מסגרת מבוקשת', type: 'currency', required: true },
      { id: 'reasons', label: 'הנימוקים לבקשה', type: 'textarea' },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>מנהל סניף {{bank_name}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: בקשה להגדלת מסגרת אשראי</h3>
<br/>
<p>בשם חברת <strong>{{company_name}}</strong>, ח.פ. <strong>{{company_id}}</strong>,</p>
<p>חשבון מספר: <strong>{{account_number}}</strong></p>
<br/>
<div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 15px; border-radius: 8px;">
<p><strong>מסגרת נוכחית:</strong> ₪{{current_limit}}</p>
<p><strong>מסגרת מבוקשת:</strong> ₪{{requested_limit}}</p>
</div>
<br/>
<h4>הנימוקים לבקשה:</h4>
<p>{{reasons}}</p>
<br/>
<p>מצורפים בזאת דוחות כספיים לתמיכה בבקשה.</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>{{company_name}}</p>
<p>תאריך: {{date}}</p>`,
  },

  // ─── דיני עבודה ───
  {
    id: 'hearing_summon',
    title: 'מכתב זימון לשימוע',
    category: 'employment',
    description: 'זימון עובד לשימוע לפני פיטורים.',
    icon: AlertTriangle,
    tags: ['שימוע', 'פיטורים', 'דיני עבודה'],
    defaultSubject: 'זימון לשימוע — {{employee_name}}',
    fields: [
      FIELD_DATE,
      { id: 'employee_name', label: 'שם העובד', type: 'text', required: true },
      { id: 'employee_id', label: 'תעודת זהות', type: 'text', required: true },
      { id: 'position', label: 'תפקיד', type: 'text', required: true },
      { id: 'hearing_date', label: 'תאריך שימוע', type: 'date', required: true },
      { id: 'hearing_time', label: 'שעה', type: 'text', required: true, placeholder: '10:00' },
      { id: 'hearing_location', label: 'מיקום', type: 'text', required: true },
      { id: 'hearing_subject', label: 'נושא השימוע', type: 'textarea', required: true },
      { id: 'employer_name', label: 'שם המעסיק', type: 'text', required: true },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>{{employee_name}}</p>
<p>ת.ז. {{employee_id}}</p>
<br/>
<h3 style="text-decoration: underline; color: #dc2626;">הנדון: זימון לשימוע לפני פיטורים</h3>
<br/>
<p>שלום {{employee_name}},</p>
<br/>
<p>הננו מזמינים אותך לשימוע בפניך תינתן ההזדמנות להשמיע את טענותיך, וזאת בטרם קבלת החלטה בעניין המשך העסקתך בחברת <strong>{{employer_name}}</strong>.</p>
<br/>
<div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px;">
<p><strong>תאריך:</strong> {{hearing_date}}</p>
<p><strong>שעה:</strong> {{hearing_time}}</p>
<p><strong>מיקום:</strong> {{hearing_location}}</p>
<p><strong>תפקיד:</strong> {{position}}</p>
</div>
<br/>
<h4>נושא השימוע:</h4>
<p>{{hearing_subject}}</p>
<br/>
<p>את/ה רשאי/ת להגיע עם נציג מטעמך (עורך דין / נציג ועד עובדים).</p>
<p>באפשרותך להגיש מענה בכתב עד 3 ימים לפני מועד השימוע.</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>בשם {{employer_name}}</p>
<p>תאריך: {{date}}</p>`,
  },

  // ─── כללי ───
  {
    id: 'general_free',
    title: 'מכתב חופשי',
    category: 'general',
    description: 'מכתב חופשי עם לוגו וחתימה.',
    icon: FileText,
    tags: ['חופשי', 'כללי'],
    defaultSubject: '{{subject}}',
    fields: [
      FIELD_DATE,
      { id: 'recipient', label: 'לכבוד', type: 'text', required: true },
      { id: 'subject', label: 'נושא המכתב', type: 'text', required: true },
      { id: 'body', label: 'תוכן המכתב', type: 'textarea', required: true },
      FIELD_SENDER,
    ],
    content: `<p><strong>לכבוד:</strong></p>
<p>{{recipient}}</p>
<br/>
<p>א.ג.נ,</p>
<br/>
<h3 style="text-decoration: underline;">הנדון: {{subject}}</h3>
<br/>
<p>{{body}}</p>
<br/>
<p>בברכה,</p>
<p>{{sender_name}}</p>
<p>תאריך: {{date}}</p>`,
  },
];

// #endregion

/**
 * Get all templates for a specific category.
 *
 * @param categoryId — The category to filter by
 * @returns Filtered array of templates
 */
export function getTemplatesByCategory(categoryId: string): LetterTemplate[] {
  return TEMPLATES.filter(t => t.category === categoryId);
}

/**
 * Search templates by query across title, description, and tags.
 *
 * @param query — Search string
 * @returns Filtered array of templates matching the query
 */
export function searchTemplates(query: string): LetterTemplate[] {
  const q = query.toLowerCase();
  return TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags?.some(tag => tag.includes(q))
  );
}
