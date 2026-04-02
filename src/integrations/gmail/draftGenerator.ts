/* ============================================
   FILE: draftGenerator.ts
   PURPOSE: יצירת טיוטות מענה למיילים מסוג legal_task
   DEPENDENCIES: ./classificationTypes,
                 ../../system/knowledge/warCompensationKnowledge (Knowledge Layer)
   EXPORTS: generateResponseDraft, generateAppealDraft,
            generateWarCompSupplementDraft, DraftResult
   ============================================ */
import {
  WAR_COMP_DRAFT_TEMPLATES,
} from '../../system/knowledge/warCompensationKnowledge';

// #region Types

/** תוצאת טיוטה */
export interface DraftResult {
  subject: string;
  body: string;
  templateType: 'tax_response' | 'insurance_response' | 'municipal_appeal' | 'war_compensation_appeal' | 'war_compensation_supplement' | 'legal_response' | 'general_response';
}

// #endregion

// #region Templates

const TEMPLATES: Record<DraftResult['templateType'], { subject: string; body: string }> = {
  tax_response: {
    subject: 'מענה לפניית רשות המסים — [REFERENCE]',
    body: `לכבוד רשות המסים,
הנדון: מענה לפנייתכם מתאריך [DATE]

אני מאשר קבלת מכתבכם בנדון.

להלן התייחסותי:
1. [נקודה ראשונה]
2. [נקודה שנייה]

מצורפים המסמכים הרלוונטיים:
- [רשימת מסמכים]

אבקש לעדכנני בהתאם.
בברכה,
אלדד ברגר, רו"ח`,
  },
  insurance_response: {
    subject: 'מענה לדרישת ביטוח לאומי — [REFERENCE]',
    body: `לכבוד המוסד לביטוח לאומי,
הנדון: מענה לדרישתכם מתאריך [DATE]

אני מאשר קבלת דרישתכם.

להלן המסמכים המבוקשים:
1. [מסמך ראשון]
2. [מסמך שני]

נא לאשר קבלת המסמכים.
בברכה,
אלדד ברגר, רו"ח`,
  },
  municipal_appeal: {
    subject: 'ערר על הודעת חיוב — [REFERENCE]',
    body: `לכבוד ועדת הערר,
הנדון: ערר על חיוב מתאריך [DATE]

אני מגיש בזאת ערר על ההודעה שלהלן:
- סכום החיוב: [AMOUNT]
- נושא: [SUBJECT]

נימוקי הערר:
1. [נימוק ראשון]
2. [נימוק שני]

מצורפים אסמכתאות תומכות.
בברכה,
אלדד ברגר, רו"ח`,
  },
  war_compensation_appeal: {
    subject: 'ערר על החלטה — פיצוי מלחמה מסלול אדום — [REFERENCE]',
    body: `לכבוד
קרן הפיצויים — מס רכוש וקרן פיצויים
רשות המסים בישראל

הנדון: ערר על החלטה בעניין תביעת פיצוי מלחמה — מסלול אדום
מתאריך: [DATE]
בעניין: [SUBJECT]

אנו מגישים בזאת ערר על החלטתכם מהנימוקים הבאים:

1. תיאור הנזק העקיף:
   [תיאור הנזק — ירידת הכנסות, עלויות נוספות, אובדן לקוחות]

2. חישובי הנזק:
   - סכום הנזק הנתבע: [AMOUNT]
   - תקופת הנזק: [תקופה]
   - בסיס החישוב: [שיטת חישוב — השוואת תקופות / אובדן הכנסה]

3. אסמכתאות מצורפות:
   - דוחות כספיים לתקופות ההשוואה
   - אישורי רואה חשבון
   - מסמכי הוכחת נזק
   - חישובים מפורטים

4. נימוקי הערר:
   [נימוקים מפורטים מדוע ההחלטה שגויה]

אנו מבקשים לקבל את הערר ולאשר את סכום הפיצוי המלא.
מצורפים כלל המסמכים התומכים.

בברכה,
אלדד ברגר, רו"ח
מייצג מורשה`,
  },
  // Knowledge Layer — תבנית השלמת מסמכים / מכתב נלווה
  war_compensation_supplement: {
    subject: `${WAR_COMP_DRAFT_TEMPLATES.war_compensation_supplement.title} — [REFERENCE]`,
    body: `לכבוד
${WAR_COMP_DRAFT_TEMPLATES.war_compensation_supplement.addressee}

הנדון: השלמת מסמכים — בקשה מספר [REFERENCE]
בעניין: [SUBJECT]
מתאריך: [DATE]

בהמשך לפנייתכם מיום [DATE], מצורפים בזאת המסמכים הבאים:

1. [פירוט מסמך ראשון]
2. [פירוט מסמך שני]
3. [פירוט מסמך שלישי]

נסיבות:
[הסבר נסיבות — תקופת פגיעה, השפעת המלחמה, נזק לפעילות העסקית]

בברכה,
${WAR_COMP_DRAFT_TEMPLATES.war_compensation_supplement.signature}`,
  },
  legal_response: {
    subject: 'מענה למכתב התראה — [REFERENCE]',
    body: `לכבוד [ENTITY],
הנדון: מענה למכתבכם מתאריך [DATE]

אנו דוחים את טענותיכם כמפורט להלן:
1. [נקודה ראשונה]
2. [נקודה שנייה]

נשמח לפתור את העניין בדרכי שלום.
בברכה,
אלדד ברגר, רו"ח`,
  },
  general_response: {
    subject: 'מענה לפנייתכם — [REFERENCE]',
    body: `שלום רב,
הנדון: מענה לפנייתכם מתאריך [DATE]

תודה על פנייתכם.
להלן התייחסותי:

[תוכן המענה]

בברכה,
אלדד ברגר, רו"ח`,
  },
};

// #endregion

// #region Template Selection

/**
 * בחירת תבנית מתאימה לפי תוכן המייל
 */
function selectTemplate(from: string, subject: string): DraftResult['templateType'] {
  const text = `${from} ${subject}`.toLowerCase();
  if (/רשות המ[סי]ים|taxes\.gov/i.test(text)) return 'tax_response';
  if (/ביטוח לאומי|btl\.gov/i.test(text)) return 'insurance_response';
  if (/עירי|מועצ|ועדת ערר|muni/i.test(text)) return 'municipal_appeal';
  if (/התראה|תביעה|עו"ד|עורך.?דין|בית.?משפט/i.test(text)) return 'legal_response';
  return 'general_response';
}

// #endregion

// #region Draft Generation

/**
 * יצירת טיוטת מענה למייל משפטי/רשות
 * @param from — שולח המייל
 * @param subject — נושא המייל
 * @param date — תאריך המייל
 * @param amount — סכום (אם רלוונטי)
 * @returns טיוטה מוכנה עם placeholders
 */
export function generateResponseDraft(
  from: string, subject: string, date: string, amount: number | null
): DraftResult {
  const templateType = selectTemplate(from, subject);
  const template = TEMPLATES[templateType];

  const entity = from.match(/^([^<@]+)/)?.[1]?.trim() || from;

  return {
    templateType,
    subject: template.subject
      .replace('[REFERENCE]', subject.slice(0, 60)),
    body: template.body
      .replace(/\[DATE\]/g, date || 'לא ידוע')
      .replace(/\[AMOUNT\]/g, amount ? `₪${amount.toLocaleString()}` : 'לא צוין')
      .replace(/\[SUBJECT\]/g, subject.slice(0, 80))
      .replace(/\[ENTITY\]/g, entity),
  };
}

/**
 * יצירת טיוטת ערר/ערעור.
 * עבור war_compensation_red_track — תבנית ייעודית לפיצוי מלחמה.
 * @param subject — נושא התיק
 * @param date — תאריך ההחלטה
 * @param amount — סכום (אם רלוונטי)
 * @param caseType — סוג תיק (לבחירת תבנית)
 */
export function generateAppealDraft(
  subject: string, date: string, amount: number | null,
  caseType?: string
): DraftResult {
  const isWarComp = caseType === 'war_compensation_red_track';
  const templateType = isWarComp ? 'war_compensation_appeal' : 'municipal_appeal';
  const template = TEMPLATES[templateType];

  return {
    templateType,
    subject: template.subject.replace('[REFERENCE]', subject.slice(0, 60)),
    body: template.body
      .replace(/\[DATE\]/g, date || 'לא ידוע')
      .replace(/\[AMOUNT\]/g, amount ? `₪${amount.toLocaleString()}` : 'לא צוין')
      .replace(/\[SUBJECT\]/g, subject.slice(0, 80)),
  };
}

/**
 * יצירת טיוטת מכתב נלווה / השלמת מסמכים לפיצוי מלחמה.
 * Knowledge Layer — תבנית war_compensation_supplement.
 * @param subject — נושא / מספר בקשה
 * @param date — תאריך הפנייה
 */
export function generateWarCompSupplementDraft(
  subject: string, date: string
): DraftResult {
  const template = TEMPLATES.war_compensation_supplement;
  return {
    templateType: 'war_compensation_supplement',
    subject: template.subject.replace('[REFERENCE]', subject.slice(0, 60)),
    body: template.body
      .replace(/\[DATE\]/g, date || 'לא ידוע')
      .replace(/\[REFERENCE\]/g, subject.slice(0, 40))
      .replace(/\[SUBJECT\]/g, subject.slice(0, 80)),
  };
}

// #endregion
