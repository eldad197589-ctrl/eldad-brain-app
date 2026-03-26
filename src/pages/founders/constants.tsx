/* ============================================
   FILE: constants.tsx
   PURPOSE: Founders portal constants — Cap Table synced from agreementData.ts
   DEPENDENCIES: agreementData.ts, lucide-react
   EXPORTS: ClauseCard, TabId, TABS, ELDAD_CLAUSES, OSNAT_CLAUSES, KIRILL_CLAUSES, ESOP_TABLE
   ============================================ */
import { Shield, Code, Briefcase, PieChart } from 'lucide-react';
import { EQUITY_TABLE } from '../agreement/agreementData';

// #region Types

/** A single KPI/Clause card for the founders portal */
export interface ClauseCard {
  clauseNum: string;
  title: string;
  legalText: string;
  question: string;         // Re-purposed as "Actionable Focus"
  color: string;
  disclaimer?: string;
  status?: 'green' | 'yellow' | 'red';
}

export type TabId = 'eldad' | 'kirill' | 'osnat' | 'esop';

// #endregion

// #region Tab Configuration

/** TABS — Configuration */
export const TABS: { id: TabId; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'eldad', icon: <Shield size={18} />, label: 'אלדד (Interim CEO)', color: '#3b82f6' },
  { id: 'osnat', icon: <Briefcase size={18} />, label: 'אוסנת (CRO / HR)', color: '#f59e0b' },
  { id: 'kirill', icon: <Code size={18} />, label: 'קיריל (CTO)', color: '#10b981' },
  { id: 'esop', icon: <PieChart size={18} />, label: 'מאגר עובדים (ESOP)', color: '#8b5cf6' },
];

// #endregion

// #region Clause Data

export const ELDAD_CLAUSES: ClauseCard[] = [
  {
    clauseNum: 'הגדרת IP וידע חוזי', title: 'Interim CEO ומייסד (Domain Oracle)',
    legalText: 'המוח והלוגיקה העסקית שמאחורי המערכת. כל חוקי המיסוי, האלגוריתמים המשפטיים ואופן חשיבת הסוכנים.',
    question: 'המערכת חייבת לשקף חד משמעית שה-IP המהותי ביותר אינו המסגרת הקודית, אלא הידע התשתיתי ("המוח"). ללא הידע, המערכת נטולת ערך תחרותי.',
    color: '#3b82f6', status: 'green'
  },
  {
    clauseNum: 'אסטרטגיה טובה', title: 'מנכ"ל זמני וליבת המוצר (Interim CEO)',
    legalText: 'הסרת נטל מנכ"לות האופרציה כדי לאפשר ריכוז מלא בבניית המודלים וכיוון הפיתוח (Vision).',
    question: 'העברת שרביט המנכ"ל לאוסנת מאפשרת לאלדד להתמקד ביצירת הערך היחיד שאינו בר תחליף בסטארטאפ.',
    color: '#8b5cf6', status: 'green'
  },
  {
    clauseNum: 'רשת הפצה', title: 'ולידציה מסחרית חסרת תחליף',
    legalText: 'חיבור ישיר למשרדי רואי חשבון ועורכי דין לביצוע פיילוטים והטמעת המערכת הלכה למעשה.',
    question: 'שום מערכת AI למוסדות פיננסיים לא נמכרת ללא גושפנקא אוטוריטטיבית מהשטח. רשת ההפצה שווה הרבה יותר מעמלת מכירה מתויגת.',
    color: '#0ea5e9', status: 'green'
  }
];

export const OSNAT_CLAUSES: ClauseCard[] = [
  {
    clauseNum: 'CRO / HR', title: 'רגולציה, לקוחות מוסדיים ומשאבי אנוש',
    legalText: 'אחראית על רגולציה ומשפטים, הקשר מול לקוחות מוסדיים, שיווק, ותחום ההון האנושי.',
    question: `${EQUITY_TABLE[2].percent} עם Vesting ו-Earn-out מבוססי ביצועים. הכרה מלאה כמייסדת שווה-זכויות עם מסלול למנכ"לות בהוכחת יעדים.`,
    color: '#f59e0b', status: 'green'
  },
  {
    clauseNum: 'Earn-out', title: 'מנגנון הגדלת אחזקות מבוסס ביצועים',
    legalText: 'עמידה ביעדים עסקיים (3 פיילוטים מוסדיים + ARR מוסכם) מזכה ב-Equity Catch-up.',
    question: 'מנגנון הוגן שנותן לאוסנת מוטיבציה אמיתית – כל עסקה שתסגור מגדילה את חלקה בחברה.',
    color: '#10b981', status: 'yellow'
  },
  {
    clauseNum: 'Go-To-Market', title: 'יעד קשיח: 3 פיילוטים ב-6 חודשים',
    legalText: 'אפיון מוצר מול פיתוח (Custom) ופיתוח קשרי לקוחות עם משרדי רו"ח ועו"ד.',
    question: 'יעד מרכזי קשיח: הטמעת המערכת ב-3 משרדי ביקורת/משפט בחצי השנה הראשונה. תנאי ל-Earn-out.',
    color: '#f43f5e', status: 'red'
  }
];

export const KIRILL_CLAUSES: ClauseCard[] = [
  {
    clauseNum: 'סעיף 6.2 – IP טכנולוגי', title: 'הכרה ב-IP של הארכיטקט',
    legalText: 'ארכיטקטורת התוכנה, אלגוריתמי AI ושיטות הפיתוח מוכרים כנכס IP עצמאי ומובחן של קיריל, משויך לחברה.',
    question: 'ההסכם מכיר מפורשות בתרומה הייחודית של קיריל – שני "מוחות" שווים: העסקי (אלדד) והאלגוריתמי (קיריל).',
    color: '#10b981', status: 'green'
  },
  {
    clauseNum: 'סעיף 8.2 – License בפירוק', title: 'הגנה על מפעל החיים',
    legalText: 'בפירוק מרצון – קיריל מקבל License מלא, בלתי חוזר ופטור מתמלוגים לקוד שכתב.',
    question: 'מנגנון זה מבטיח שקיריל לא יאבד את הקוד שלו אם החברה נסגרת. הגנה הדדית – אלדד מקבל בחזרה את המותג.',
    color: '#3b82f6', status: 'green'
  },
  {
    clauseNum: 'סעיף 5.1 – Sweat Equity', title: '250,000 ₪ הכרה בהשקעת עבר',
    legalText: '5 חודשים עבודה ללא שכר, Liquidation Preference פנימי. הסכום מוחזר לפני חלוקת רווחים.',
    question: 'אלדד וקיריל שניהם "שמו את כל הביצים בסל" – ההסכם מכיר בכך עם סכום שווה ושמרני של 250א"ש לכל אחד.',
    color: '#f59e0b', status: 'green'
  }
];

/** ESOP_TABLE — Cap Table, synced from EQUITY_TABLE in agreementData.ts */
export const ESOP_TABLE = EQUITY_TABLE.map(row => ({
  name: row.name + (row.role ? ` (${row.role})` : ''),
  before: row.percent === '20.0%' ? '0%' : '33.33%',
  afterCurrent: row.percent,
  currentDelta: row.percent === '20.0%' ? '+20.00%' : '-6.67%',
  highlight: row.percent === '20.0%',
  subtle: false,
}));

// #endregion
