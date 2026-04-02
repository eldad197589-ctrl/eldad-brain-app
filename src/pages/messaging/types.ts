/* ============================================
   FILE: types.ts
   PURPOSE: Type definitions for the Messaging Engine
   DEPENDENCIES: None (local only)
   EXPORTS: MessageContact, MessageTemplate, MessageDraft,
            MessageLogEntry, MessageCategory, DraftStatus,
            DeliveryMethod, PersonalizationContext
   ============================================ */

// #region Enums & Unions

/** סוג הודעה — קטגוריה עסקית */
export type MessageCategory =
  | 'holiday'     // ברכות חג
  | 'update'      // הודעת עדכון
  | 'reminder'    // תזכורת למסמך / deadline
  | 'follow_up'   // follow-up אחרי טיפול
  | 'service'     // הודעת שירות כללית
  | 'custom';     // הודעה חופשית

/** סטטוס draft */
export type DraftStatus =
  | 'composing'   // בעריכה
  | 'ready'       // מוכן לסקירה
  | 'approved'    // אושר — מוכן לשליחה
  | 'sent'        // נשלח / הועתק
  | 'failed';     // נכשל

/** שיטת שליחה בפועל (MVP: clipboard בלבד) */
export type DeliveryMethod =
  | 'clipboard'   // העתקה ידנית
  | 'wa_link'     // WhatsApp deep link
  | 'wa_api'      // WhatsApp Business API (future)
  | 'sms_api'     // SMS gateway (future)
  | 'email_api';  // Email API (future)

// #endregion

// #region Core Entities

/**
 * איש קשר שניתן לשלוח לו הודעה.
 * יש לו optional קישור ל-BrainClient דרך clientId.
 */
export interface MessageContact {
  /** מזהה ייחודי */
  id: string;
  /** שם מלא */
  name: string;
  /** טלפון נייד — ערוץ ראשי */
  phone?: string;
  /** מייל — ערוץ משני */
  email?: string;
  /** שם עסק / חברה */
  company?: string;
  /** תגיות לסינון: ['לקוח_פעיל', 'פיצויי_מלחמה', 'שכר'] */
  tags: string[];
  /** קישור ל-BrainClient (optional) */
  clientId?: string;
  /** תאריך הודעה אחרונה (ISO) */
  lastMessageDate?: string;
  /** הערות */
  notes?: string;
  /** תאריך יצירה (ISO) */
  createdAt: string;
}

/**
 * תבנית הודעה מוכנה עם placeholders.
 * built-in templates אינן ניתנות למחיקה.
 */
export interface MessageTemplate {
  /** מזהה ייחודי */
  id: string;
  /** שם תצוגה: 'ברכת פסח 2026' */
  name: string;
  /** קטגוריה */
  category: MessageCategory;
  /** טקסט הודעה עם {{placeholders}} */
  body: string;
  /** רשימת placeholders שמופיעים ב-body */
  placeholders: string[];
  /** האם זו תבנית מערכת (לא ניתנת למחיקה) */
  isBuiltIn: boolean;
  /** תאריך יצירה (ISO) */
  createdAt: string;
}

/**
 * הודעה שהוכנה לשליחה — טרם/אחרי אישור.
 * מנותק מתבנית לאחר יצירה — body הוא עצמאי.
 */
export interface MessageDraft {
  /** מזהה ייחודי */
  id: string;
  /** קטגוריה (מועתק מתבנית, לא linked) */
  category: MessageCategory;
  /** כותרת פנימית (לניהול — לא נשלחת) */
  subject: string;
  /** גוף ההודעה (master template) */
  body: string;
  /** רשימת נמענים — contact IDs */
  recipientIds: string[];
  /**
   * הודעות מותאמות אישית per contact.
   * key = contactId, value = body אחרי personalization.
   */
  personalizedBodies: Record<string, string>;
  /** סטטוס */
  status: DraftStatus;
  /** תאריך יצירה (ISO) */
  createdAt: string;
  /** תאריך אישור (ISO) */
  approvedAt?: string;
}

/**
 * רשומת לוג — append-only.
 * כל הודעה שנשלחה/הועתקה/נכשלה מתועדת כאן.
 * אסור לערוך או למחוק רשומות.
 */
export interface MessageLogEntry {
  /** מזהה ייחודי */
  id: string;
  /** מאיזו draft */
  draftId: string;
  /** לאיזה איש קשר */
  contactId: string;
  /** snapshot — שם איש הקשר בזמן השליחה */
  contactName: string;
  /** תוכן ההודעה שנשלחה */
  body: string;
  /** שיטת שליחה */
  deliveryMethod: DeliveryMethod;
  /** סטטוס: הצליח / הועתק / נכשל */
  status: 'sent' | 'copied' | 'failed';
  /** תאריך שליחה (ISO) */
  sentAt: string;
  /** הודעת שגיאה אם נכשל */
  errorMessage?: string;
}

// #endregion

// #region Runtime Types (NOT persisted)

/**
 * קונטקסט פרסונליזציה — נגזר runtime בלבד.
 * אסור לשמור ב-store.
 */
export interface PersonalizationContext {
  /** שם מלא */
  name: string;
  /** שם פרטי */
  firstName: string;
  /** שם חברה */
  company: string;
  /** שם החג (אם רלוונטי) */
  holidayName?: string;
  /** deadline (אם רלוונטי) */
  deadline?: string;
  /** שם מסמך חסר */
  missingDocument?: string;
  /** סוג טיפול אחרון */
  lastServiceType?: string;
}

// #endregion
