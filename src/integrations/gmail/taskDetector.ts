/* ============================================
   FILE: taskDetector.ts
   PURPOSE: זיהוי מיילים הדורשים פעולה מקצועית והמרתם למשימות
   DEPENDENCIES: None
   EXPORTS: detectTask, getAllTasks, clearTasks, EmailTask
   ============================================ */

// #region Types

/** סוג מייל */
export type MailType = 'task_required' | 'bill' | 'receipt' | 'unknown';

/** רמת דחיפות */
export type TaskPriority = 'low' | 'medium' | 'high';

/** משימה שנוצרת ממייל */
export interface EmailTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
  sourceEmailId: string;
  senderEmail: string;
  relatedEntity: string | null;
  createdAt: string;
  status: 'open' | 'done';
  /** הביטוי שגרם לזיהוי */
  matchedRule: string;
}

// #endregion

// #region Detection Rules — Keywords

/** מילות מפתח שמסמנות דרישה לפעולה */
const TASK_KEYWORDS: { pattern: RegExp; label: string; priority: TaskPriority }[] = [
  // דרישות / התראות
  { pattern: /נדרש/, label: 'נדרש', priority: 'high' },
  { pattern: /דרישה/, label: 'דרישה', priority: 'high' },
  { pattern: /דרישת /, label: 'דרישה', priority: 'high' },
  { pattern: /לתגובה/, label: 'לתגובה', priority: 'medium' },
  { pattern: /לתיקון/, label: 'לתיקון', priority: 'high' },
  { pattern: /יש להגיש/, label: 'יש להגיש', priority: 'high' },
  { pattern: /יש להמציא/, label: 'יש להמציא', priority: 'high' },
  { pattern: /יש לשלוח/, label: 'יש לשלוח', priority: 'medium' },
  // קנסות / עיצומים
  { pattern: /קנס/, label: 'קנס', priority: 'high' },
  { pattern: /עיצום/, label: 'עיצום כספי', priority: 'high' },
  { pattern: /אי[- ]עמידה/, label: 'אי עמידה', priority: 'high' },
  { pattern: /הפרה/, label: 'הפרה', priority: 'high' },
  // משפטי
  { pattern: /התראה/, label: 'התראה', priority: 'high' },
  { pattern: /מכתב התראה/, label: 'מכתב התראה', priority: 'high' },
  { pattern: /תביעה/, label: 'תביעה', priority: 'high' },
  { pattern: /צו[- ]בית[- ]משפט/, label: 'צו בית משפט', priority: 'high' },
  // דיווח / הגשה
  { pattern: /דוח שנתי/, label: 'דוח שנתי', priority: 'medium' },
  { pattern: /הגשת דו"ח/, label: 'הגשת דוח', priority: 'medium' },
  { pattern: /דיווח/, label: 'דיווח', priority: 'medium' },
  { pattern: /הצהרת הון/, label: 'הצהרת הון', priority: 'high' },
  // לקוח / בקשות
  { pattern: /בקשה ל/, label: 'בקשה', priority: 'medium' },
  { pattern: /טיפול נדרש/, label: 'טיפול נדרש', priority: 'medium' },
  { pattern: /מענה דרוש/, label: 'מענה דרוש', priority: 'medium' },
  { pattern: /ממתין לתגובה/, label: 'ממתין לתגובה', priority: 'medium' },
];

// #endregion

// #region Detection Rules — Authority Senders

/** שולחים רשמיים שמיילים מהם כמעט תמיד דורשים פעולה */
const AUTHORITY_SENDERS: { pattern: RegExp; entity: string; priority: TaskPriority }[] = [
  { pattern: /taxes\.gov\.il|רשות המ[סי]ים/i, entity: 'רשות המסים', priority: 'high' },
  { pattern: /btl\.gov\.il|ביטוח לאומי/i, entity: 'ביטוח לאומי', priority: 'high' },
  { pattern: /justice\.gov\.il|משרד המשפטים/i, entity: 'משרד המשפטים', priority: 'high' },
  { pattern: /mot\.gov\.il|משרד התחבורה/i, entity: 'משרד התחבורה', priority: 'medium' },
  { pattern: /health\.gov\.il|משרד הבריאות/i, entity: 'משרד הבריאות', priority: 'medium' },
  { pattern: /economy\.gov\.il|רשם החברות/i, entity: 'רשם החברות', priority: 'high' },
  { pattern: /mof\.gov\.il|רשות שוק ההון/i, entity: 'רשות שוק ההון', priority: 'high' },
  { pattern: /רשות ניירות ערך/i, entity: 'רשות ני"ע', priority: 'high' },
  { pattern: /בית[- ]?(ה)?דין|לשכת ההוצאה לפועל/i, entity: 'מערכת המשפט', priority: 'high' },
  { pattern: /עורך[- ]?דין|עו"ד/i, entity: 'עורך דין', priority: 'medium' },
];

// #endregion

// #region Detection Logic

interface DetectionResult {
  isTask: boolean;
  matchedRule: string;
  priority: TaskPriority;
  relatedEntity: string | null;
}

/**
 * בודק אם מייל דורש פעולה מקצועית.
 * @returns תוצאת זיהוי עם סיבה ורמת דחיפות
 */
export function detectTaskEmail(
  from: string, subject: string, body: string
): DetectionResult {
  const fullText = `${from} ${subject} ${body}`;

  // שלב 1: בדוק שולח רשמי
  for (const auth of AUTHORITY_SENDERS) {
    if (auth.pattern.test(fullText)) {
      return {
        isTask: true,
        matchedRule: `authority: ${auth.entity}`,
        priority: auth.priority,
        relatedEntity: auth.entity,
      };
    }
  }

  // שלב 2: בדוק מילות מפתח
  for (const kw of TASK_KEYWORDS) {
    if (kw.pattern.test(fullText)) {
      return {
        isTask: true,
        matchedRule: `keyword: ${kw.label}`,
        priority: kw.priority,
        relatedEntity: null,
      };
    }
  }

  return { isTask: false, matchedRule: '', priority: 'low', relatedEntity: null };
}

// #endregion

// #region Task Creation

/**
 * יוצר משימה מתוך מייל שזוהה כ-task_required
 */
export function createTaskFromEmail(
  emailId: string,
  from: string,
  subject: string,
  body: string,
  detection: DetectionResult,
  emailDate: string | null
): EmailTask {
  return {
    id: `task-${emailId}`,
    title: subject.slice(0, 100),
    description: body.slice(0, 300),
    priority: detection.priority,
    dueDate: emailDate,
    sourceEmailId: emailId,
    senderEmail: from,
    relatedEntity: detection.relatedEntity,
    createdAt: new Date().toISOString(),
    status: 'open',
    matchedRule: detection.matchedRule,
  };
}

// #endregion

// #region Storage

const TASKS_KEY = 'eldad_email_tasks';

/**
 * שומר משימה ל-localStorage (dedup לפי id)
 * @returns true אם נוספה, false אם כפילות
 */
export function storeTask(task: EmailTask): boolean {
  const tasks = getAllTasks();
  if (tasks.some(t => t.id === task.id)) return false;
  tasks.push(task);
  try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch { /* silent */ }
  return true;
}

/**
 * מחזיר את כל המשימות השמורות
 */
export function getAllTasks(): EmailTask[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/**
 * מנקה את כל המשימות
 */
export function clearTasks(): void {
  localStorage.removeItem(TASKS_KEY);
}

// #endregion
