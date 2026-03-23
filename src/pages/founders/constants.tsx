/**
 * Founders Page — Constants & Data
 *
 * All clause cards, ESOP table data, and tab configuration.
 */
import { Shield, Code, AlertTriangle } from 'lucide-react';

// #region Types

/** A single clause card for the founders confrontation portal */
export interface ClauseCard {
  clauseNum: string;
  title: string;
  legalText: string;
  question: string;
  color: string;
  disclaimer?: string;
}

export type TabId = 'partyc' | 'kirill' | 'eldad';

// #endregion

// #region Tab Configuration

export const TABS: { id: TabId; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'partyc', icon: <AlertTriangle size={18} />, label: 'צד ג\' (נציג/ת פיתוח עסקי)', color: '#f59e0b' },
  { id: 'kirill', icon: <Code size={18} />, label: 'קיריל (37.5%)', color: '#06b6d4' },
  { id: 'eldad', icon: <Shield size={18} />, label: 'מנכ"ל (הנחיות)', color: '#94a3b8' },
];

// #endregion

// #region Clause Data

export const PARTY_C_CLAUSES: ClauseCard[] = [
  {
    clauseNum: 'סעיף 5.2', title: 'השקעת זמן ומרץ',
    legalText: 'בעלי המניות מתחייבים להקדיש את זמנם, מרצם וכישוריהם לטובת החברה... לא לעסוק בצורה שתפגע בביצוע תפקידם.',
    question: 'לאור הקליניקה הפרטית והפעילות בלשכת עוה"ד, האם את באמת יכולה להתחייב להקדיש את הזמן הנדרש להפיכת Robium לחברה בשווי עשרות מיליונים בשנתיים הקרובות? מהן מכסות השעות השבועיות הקשיחות שאת שמה לעצמך?',
    color: '#3b82f6',
  },
  {
    clauseNum: 'תפקיד CRO', title: 'הבאת לקוחות והכנסות',
    legalText: 'תפקיד ה-CRO כולל הובלת מאמצי חדירה לשוק, בניית אסטרטגיה לגיוס לקוחות משפטיים ומוניטין.',
    question: 'אנא הגדרי באילו משרדי עו״ד, קולגות או גופים פורמליים את מתחייבת להטמיע את המערכת בחצי השנה הראשונה כ-Pilot ממוסד? אנו חייבים KPI מדיד.',
    disclaimer: 'הדסקליימר "הבאתי נכסים/מוניטין" אינו מחזיק חברה. מוניטין לא מכניס ARR.',
    color: '#8b5cf6',
  },
  {
    clauseNum: 'סעיף 5א-1', title: 'חובת למידת AI',
    legalText: 'חובה ליישר קו בטכנולוגיית AI, שימוש בכלים וכו\' תוך 6 חודשים. מודלי שפה, אוטומציות, הבנת המוצר המלאה.',
    question: 'חלק ניכר מהתשתיות ידרוש ממך להדגים ללקוחות את המערכת הלכה למעשה, כולל הפעלת מודלים ושליטה ב-Dashboard. כיצד את בונה את תוכנית ההכשרה העצמית שלך וכיצד נבדוק את עמידתך ביעד ביום ה-180?',
    color: '#10b981',
  },
  {
    clauseNum: 'סעיף 5.5 מתוקן', title: 'זכות הוטו שבוטלה',
    legalText: 'הרפורמה קובעת רוב של 75% לשינויי ליבה/אסטרטגיה במקום וטו מוחלט לכל צד (שמוביל ל-Deadlock).',
    question: 'האם את חושבת שזה בר-קיימא ששותף ללא מעורבות טכנולוגית יטיל וטו שעלול לתקוע עסקאות ליבה, שאלדד עמל עליהן שבועות?',
    color: '#ef4444',
  },
];

export const KIRILL_CLAUSES: ClauseCard[] = [
  {
    clauseNum: 'סעיף 10.1', title: 'קניין רוחני (IP)',
    legalText: 'כל הקניין הרוחני, כולל רעיונות ולוגיקה, עובר במלואו לחברה.',
    question: 'חשוב לי לוודא שברור כי ה-Business Logic של החברה שייך לאלדד. התפקיד שלך הוא קידוד. האם אתה מסכים שאין מדובר רק בטכנולוגיה נקייה?',
    color: '#06b6d4',
  },
  {
    clauseNum: 'סעיף 18ג', title: 'חממה טכנולוגית',
    legalText: 'מחויבות להקצות מכסת שעות חודשית לחממה.',
    question: 'האם אתה מתחייב ליכולת ניהול צוות, הדרכה, ויצירת שדרה ניהולית טכנולוגית, ולא להיות רק שמורת בידוד?',
    color: '#6366f1',
  },
  {
    clauseNum: 'סעיף 5.5 מקורי', title: 'מניעת Deadlock',
    legalText: 'הסכמות פה אחד לשינויי ליבה וטכנולוגיה.',
    question: 'אי אפשר לנהל סטרטאפ בו אתה יכול להטיל וטו על אדריכלות שנדרשת ע"י עסקאות של אלדד. האם אתה מסכים לרפורמת הוטו (75% רוב)?',
    color: '#a855f7',
  },
];

export const ESOP_TABLE = [
  { name: 'צד א\' (אלדד)', before: '37.5%', afterCurrent: '33.75%', afterFair: '33.75%', currentDelta: '-3.75', fairDelta: '-3.75' },
  { name: 'צד ב\' (קיריל)', before: '37.5%', afterCurrent: '33.75%', afterFair: '33.75%', currentDelta: '-3.75', fairDelta: '-3.75' },
  { name: 'שותף ג\'', before: '15.0%', afterCurrent: '15.00%', afterFair: '13.50%', currentDelta: 'מוגנת!', fairDelta: '-1.50', highlight: true },
  { name: 'מאגר ESOP', before: '0%', afterCurrent: '10%', afterFair: '10%', currentDelta: '', fairDelta: '', subtle: true },
];

// #endregion
