/* ============================================
   FILE: calendarTypes.ts
   PURPOSE: Type definitions
   DEPENDENCIES: None (local only)
   EXPORTS: MeetingTopic, MeetingPrepItem, MeetingPrepStage, Meeting, Task, CalendarEvent, SEED_MEETINGS, SEED_TASKS, STORAGE_KEYS, PRIORITY_CONFIG, STATUS_CONFIG
   ============================================ */
/** A single topic discussed in a meeting */
export interface MeetingTopic {
  text: string;
  /** Optional internal route this topic relates to */
  link?: string;
}

/** A single prep item — link, message template, or checklist */
export interface MeetingPrepItem {
  /** Item type: link opens a page, message can be copied, checklist has toggleable items */
  type: 'link' | 'message' | 'checklist';
  /** Display label */
  label: string;
  /** For link: URL or internal route */
  href?: string;
  /** For link: if true, open inside the app via navigate */
  isInternal?: boolean;
  /** For message: template text to copy */
  messageText?: string;
  /** For message: who this message is for */
  recipient?: string;
  /** For checklist: list of items (persisted state is in localStorage via meeting ID) */
  checkItems?: string[];
}

/** A preparation stage for a meeting (e.g. "before", "during", "after") */
export interface MeetingPrepStage {
  /** Stage title, e.g. "שלב 1 — לפני הפגישה" */
  title: string;
  /** Badge / accent color */
  color: string;
  /** Items in this stage */
  items: MeetingPrepItem[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  duration: number;    // minutes
  participants: string[];
  topics: MeetingTopic[];
  color: string;
  completed: boolean;
  /** Optional preparation stages — meetings with this get a "war room" view */
  prepStages?: MeetingPrepStage[];
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;     // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  category: string;
  notes?: string;
  sourceProtocol?: string; // meeting ID that generated this task
  actionLink?: string;     // internal route to relevant page
  assignee?: string;       // responsible person (from Protokol)
  subTasks?: { text: string; done: boolean }[];
}

export interface CalendarEvent {
  type: 'meeting' | 'task';
  date: string;
  data: Meeting | Task;
}

// Seed data — the original founders meeting
export const SEED_MEETINGS: Meeting[] = [
  {
    id: 'founders-march-2026',
    title: 'ישיבת מייסדים Robium',
    date: '2026-03-11',
    time: '10:00',
    duration: 90,
    participants: ['אלדד', 'אוסנת', 'קיריל'],
    topics: [
      { text: 'הסכם מייסדים — חלוקת אקוויטי', link: '/agreement' },
      { text: 'סקירת מוצרים שנבנו', link: '/products' },
      { text: 'התוכנית העסקית — פלאפון', link: '/products' },
      { text: 'פרויקטים וכלים', link: '/hub' },
      { text: 'פורטל מייסדים — עימות חוזי', link: '/founders' },
    ],
    color: '#f59e0b',
    completed: true,
  },
  {
    id: 'weekly-team-meeting',
    title: 'Weekly Team Meeting',
    date: '2026-03-15',
    time: '10:00',
    duration: 60,
    participants: ['Eldad', 'Osnat'],
    topics: [
      { text: 'Project Status Update' },
    ],
    color: '#f59e0b',
    completed: false,
  },
  // ── פגישת פרוטוקול אמיתית מ-Protokol AI ──
  {
    id: 'protocol-march-11-2026',
    title: 'גיבוש הסכם מייסדים ופתרון מחלוקות — רוביום',
    date: '2026-03-11',
    time: '10:00',
    duration: 141,
    participants: ['אלדד', 'קיריל', 'אוסנת'],
    topics: [
      { text: 'הקמת חברה בשם רוביום טכנולוגיות' },
      { text: 'תשלום רטרואקטיבי — 15,000 ₪ לחודש לאלדד וקיריל' },
      { text: 'בונוס מייסדים — 250,000 ₪ אם רווח שנתי > 5M ₪' },
      { text: 'מעבר מ-WhatsApp לניהול משימות מסודר' },
      { text: 'הדרכות טכנולוגיות שבועיות ע"י קיריל' },
      { text: 'חלוקת מניות — 80/3 (26.66% לכל מייסד) + 20% מיעוט', link: '/agreement' },
      { text: 'זכויות וטו תחומיות', link: '/agreement' },
      { text: 'הסכמי NDA וחממה לעובדים', link: '/incubator' },
      { text: 'אקטואר — הערכת שווי רוביום מיידית' },
    ],
    color: '#7C3AED',
    completed: true,
  },
  {
    id: 'protocol-march-22-2026',
    title: 'פרוטוקול מייסדים — החלטות מרץ 2026',
    date: '2026-03-22',
    time: '14:00',
    duration: 120,
    participants: ['אלדד', 'קיריל'],
    topics: [
      { text: 'עדכון הסכם מייסדים — אישור 500 אש"ח השקעת עבר', link: '/agreement' },
      { text: 'עדיפות שכר ראשונה לאלדד וקיריל' },
      { text: 'עדכון חלוקת מניות שווה (80/3)', link: '/agreement' },
    ],
    color: '#7C3AED',
    completed: true,
  },
  // ── פגישת חתימה על הסכם מייסדים ופתיחת חברה ──
  {
    id: 'founders-signing-march-25-2026',
    title: 'חתימה על הסכם מייסדים + פתיחת חברה — אוסנת, אלדד, קיריל',
    date: '2026-03-25',
    time: '10:00',
    duration: 120,
    participants: ['אלדד', 'אוסנת', 'קיריל'],
    topics: [
      { text: '📋 שלב 1 — הכנה: סקירת הסכם מייסדים אחרון', link: '/agreement' },
      { text: 'הכנת טבלת מניות סופית (Cap Table)', link: '/agreement' },
      { text: 'בדיקת רשם החברות — שמות זמינים' },
      { text: 'הכנת מסמכי הקמה (תקנון + תזכיר)' },
      { text: '🎯 שלב 2 — הצגה: סקירת מוצרים ו-Pitch Deck', link: '/products' },
      { text: 'הצגת התוכנית העסקית — פלאפון', link: '/products' },
      { text: 'דמו חי של מרכז השליטה', link: '/hub' },
      { text: 'חתימה פורמלית על ההסכם כל 3 המייסדים', link: '/agreement' },
      { text: '✅ שלב 3 — סיכום: התחייבויות לביצוע' },
      { text: 'אוסנת — פתיחת חברה ברשם החברות' },
      { text: 'קיריל — NDA + חוזי חממה לעובדים', link: '/incubator' },
      { text: 'אלדד — הגשת דוחות מס + חשבון בנק לחברה' },
      { text: 'תיקונים נוספים שיעלו בפגישה' },
    ],
    color: '#10b981',
    completed: false,
    prepStages: [
      {
        title: 'שלב 1 — לפני הפגישה (הכנות)',
        color: '#3b82f6',
        items: [
          {
            type: 'message',
            label: 'הודעת WhatsApp למייסדים — זימון לחתימה',
            recipient: 'קבוצת המייסדים',
            messageText: 'היי אוסנת וקיריל 🙂\n\nביום רביעי 25.3 בשעה 10:00 — פגישת חתימה על הסכם מייסדים + פתיחת חברת רוביום טכנולוגיות בע"מ.\n\n📌 סדר יום:\n1. סקירה סופית של ההסכם — עם כל התיקונים מהפגישות הקודמות (11.3 + 22.3)\n2. חתימה פורמלית של כל 3 המייסדים\n3. הצגת דמו חי של מרכז השליטה + תיק המוצרים\n4. חלוקת אחריות: מי פותח חברה, מי מכין NDA, מי מגיש דוחות\n\n📎 חובה לקרוא לפני הפגישה:\n• הסכם מייסדים סופי (מצורף / בפורטל)\n• פורטל תיאום ציפיות — כל אחד יאשרר את ההתחייבויות שלו\n\n⏰ משך: ~120 דקות\n\nבואו מוכנים. אלדד.',
          },
          {
            type: 'link',
            label: 'הסכם מייסדים סופי (חוקת החברה)',
            href: '/agreement',
            isInternal: true,
          },
          {
            type: 'link',
            label: 'פורטל תיאום ציפיות (עימות חוזי)',
            href: '/founders',
            isInternal: true,
          },
          {
            type: 'link',
            label: 'דו"ח השוואה משפטי',
            href: '/legacy/robium_comparison.html',
            isInternal: false,
          },
          {
            type: 'checklist',
            label: 'הכנות לפני הפגישה',
            checkItems: [
              'עדכון הסכם מייסדים — כולל תיקוני 11.3 + 22.3',
              'הכנת Cap Table סופי (26.66% × 3 + 20%)',
              'בדיקת שמות זמינים ברשם החברות',
              'הכנת תקנון + תזכיר הקמה',
              'שליחת הודעת WhatsApp למייסדים',
            ],
          },
        ],
      },
      {
        title: 'שלב 2 — במהלך הפגישה',
        color: '#f59e0b',
        items: [
          {
            type: 'link',
            label: 'הסכם מייסדים — להצגה וחתימה',
            href: '/agreement',
            isInternal: true,
          },
          {
            type: 'link',
            label: 'פורטל תיאום ציפיות (עימות)',
            href: '/founders',
            isInternal: true,
          },
          {
            type: 'link',
            label: 'תיק מוצרים + Pitch Deck',
            href: '/products',
            isInternal: true,
          },
          {
            type: 'link',
            label: 'מרכז שליטה — דמו חי',
            href: '/hub',
            isInternal: true,
          },
          {
            type: 'link',
            label: 'חממה טכנולוגית (ESOP)',
            href: '/incubator',
            isInternal: true,
          },
          {
            type: 'checklist',
            label: 'נקודות לעבור בפגישה',
            checkItems: [
              'סקירת הסכם מייסדים — אישור סופי',
              'חתימה פורמלית — כל 3 המייסדים',
              'הצגת Cap Table ומבנה מניות',
              'הצגת דמו חי: מרכז שליטה + מוצרים',
              'חלוקת אחריויות לביצוע',
            ],
          },
        ],
      },
      {
        title: 'שלב 3 — אחרי הפגישה (ביצוע)',
        color: '#06b6d4',
        items: [
          {
            type: 'message',
            label: 'הודעה לקיריל — התחייבויות טכניות',
            recipient: 'קיריל',
            messageText: 'Hey Kirill,\n\nFollowing our signing meeting, here\'s what we need from your side:\n\n1. NDA agreements for Gavir and Anbar — draft by end of week\n2. Incubator contracts — use the template we discussed\n3. Protokol status — make sure the latest version is deployed\n\nLet\'s sync on Wednesday after the meeting.\n\nEldad.',
          },
          {
            type: 'checklist',
            label: 'משימות אחרי החתימה',
            checkItems: [
              'אוסנת — פתיחת חברה ברשם החברות',
              'אוסנת — פתיחת חשבון בנק לחברה',
              'קיריל — הכנת NDA לגביר וענבר',
              'קיריל — חוזי חממה לעובדים',
              'אלדד — הגשת דוחות מס + רישום מע"מ',
              'אלדד — רישום קניין רוחני (המוח של אלדד)',
              'סיכום פגישה ב-Protokol AI',
            ],
          },
        ],
      },
    ],
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: 'pitch-deck-update',
    title: 'Pitch Deck מעודכן — פלאפון',
    dueDate: '2026-03-20',
    priority: 'high',
    status: 'in-progress',
    category: 'פלאפון',
    notes: 'לעדכן את מצגת ה-Pitch לפלאפון עם הנתונים האחרונים מהמחשבון העסקי. לכלול תחזית ARR, CAC ו-LTV.',
    actionLink: '/products',
    subTasks: [
      { text: 'עדכון נתוני ARPU ממחשבון', done: false },
      { text: 'הוספת תרשים תחזית הכנסות', done: false },
      { text: 'סקירה סופית עם קיריל', done: false },
    ],
  },
  {
    id: 'protocol-sync',
    title: 'סינכרון טכני עם קיריל',
    dueDate: '2026-03-18',
    priority: 'medium',
    status: 'todo',
    category: 'טכנולוגי',
    notes: 'לתאם עם קיריל על התקדמות הפיתוח: API, חממה טכנולוגית, ומאגר ה-ESOP.',
    actionLink: '/incubator',
  },
  {
    id: 'agreement-sign',
    title: 'הסכם מייסדים — בדיקה סופית',
    dueDate: '2026-03-25',
    priority: 'high',
    status: 'todo',
    category: 'משפטי',
    notes: 'מפרוטוקול ישיבת מייסדים (11/03): יש לתקן את הסכם המייסדים בהתאם לנקודות שעלו — חלוקת אקוויטי, רפורמת הוטו (75% רוב), ו-ESOP Pro-Rata. יש לעבור על פורטל העימות החוזי לפני העדכון.',
    actionLink: '/founders',
    subTasks: [
      { text: 'לעבור על פורטל העימות — סעיפי שותף ג\'', done: false },
      { text: 'לתקן סעיף 5.5 — רפורמת הוטו (75% רוב)', done: false },
      { text: 'לתקן סעיף 13א — ESOP Pro-Rata לכל השותפים', done: false },
      { text: 'לאשר חלוקת אקוויטי סופית', done: false },
      { text: 'לשלוח לחתימה דיגיטלית', done: false },
    ],
  },
  {
    id: 'pelephone-demo',
    title: 'הכנת דמו חי לפלאפון',
    dueDate: '2026-03-30',
    priority: 'high',
    status: 'todo',
    category: 'פלאפון',
    notes: 'להכין דמו חי של מוצר הפרוטוקול עבור הפגישה עם פלאפון. לכלול תרחיש מלא של פרוטוקול ישיבה → הפקת משימות.',
    actionLink: '/products',
    subTasks: [
      { text: 'הכנת תרחיש דמו', done: false },
      { text: 'בדיקת זרימה מלאה', done: false },
      { text: 'הכנת מצגת ליוואי', done: false },
    ],
  },
  {
    id: 'prepare-presentation',
    title: 'Prepare Presentation',
    dueDate: '2026-03-15',
    priority: 'medium',
    status: 'todo',
    category: 'כללי',
  },
  // ── משימות מ-Protokol AI (פגישת 11.3.2026) ──
  {
    id: 'protokol-update-agreement',
    title: '🔴 עדכון הסכם מייסדים לפי סיכומי הפגישה',
    dueDate: '2026-03-25',
    priority: 'high',
    status: 'in-progress',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'אלדד',
    notes: 'מקור: Protokol AI (גיבוש הסכם מייסדים, 11.3.2026). משימה דחופה — עדכון ההסכם כולל כל ההחלטות מהפגישה.',
    actionLink: '/agreement',
    subTasks: [
      { text: 'עדכון חלוקת מניות 26.66% × 3', done: true },
      { text: 'הוספת סעיף תשלום רטרואקטיבי 15K/חודש', done: false },
      { text: 'עדכון סעיף בונוס מייסדים (250K אם רווח > 5M)', done: false },
      { text: 'הוספת סעיף NDA לעובדי חממה', done: false },
      { text: 'שליחה לחתימה דיגיטלית', done: false },
    ],
  },
  {
    id: 'protokol-nda-incubator',
    title: '🔴 הכנת הסכמי NDA וחוזים — גביר וענבר',
    dueDate: '2026-03-28',
    priority: 'high',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'קיריל',
    notes: 'מקור: Protokol AI. קיריל אחראי להכין NDA וחוזי עבודה לעובדי החממה (גביר וענבר) לפני קליטתם.',
    actionLink: '/incubator',
    subTasks: [
      { text: 'ניסוח NDA כללי', done: false },
      { text: 'ניסוח חוזה חממה — גביר', done: false },
      { text: 'ניסוח חוזה חממה — ענבר', done: false },
      { text: 'אישור משפטי', done: false },
    ],
  },
  {
    id: 'protokol-company-names',
    title: 'שליחת 3 שמות אופציונליים לרישום החברה',
    dueDate: '2026-03-30',
    priority: 'medium',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'אוסנת',
    notes: 'מקור: Protokol AI. אוסנת אחראית לשלוח 3 שמות אופציונליים לרישום החברה ברשם החברות.',
  },
  {
    id: 'protokol-ai-training',
    title: 'קביעת מועד הדרכת AI ראשונה לצוות',
    dueDate: '2026-04-01',
    priority: 'medium',
    status: 'todo',
    category: 'טכנולוגי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'קיריל',
    notes: 'מקור: Protokol AI. הדרכות טכנולוגיות שבועיות על ידי קיריל — יש לקבוע את הפגישה הראשונה.',
  },
  {
    id: 'protokol-pelephone-review',
    title: 'מעבר על תוכנית עסקית מעודכנת — פלאפון',
    dueDate: '2026-04-05',
    priority: 'medium',
    status: 'todo',
    category: 'פלאפון',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'אוסנת',
    notes: 'מקור: Protokol AI. אוסנת צריכה לעבור על התוכנית העסקית המעודכנת של פלאפון.',
    actionLink: '/products',
  },
  {
    id: 'protokol-interview-workers',
    title: 'ראיון קליטה — גביר וענבר',
    dueDate: '2026-04-01',
    priority: 'medium',
    status: 'todo',
    category: 'הון אנושי',
    sourceProtocol: 'protocol-march-11-2026',
    notes: 'מקור: Protokol AI. יש לראיין את גביר וענבר לקליטה מסודרת בחממה.',
    subTasks: [
      { text: 'ראיון HR — אוסנת', done: false },
      { text: 'ראיון טכני — קיריל', done: false },
      { text: 'החתמה על NDA לפני קליטה', done: false },
    ],
  },
  {
    id: 'aktuar-evaluation',
    title: '🔴 אקטואר — הערכת שווי רוביום מיידית',
    dueDate: '2026-03-29',
    priority: 'high',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-11-2026',
    assignee: 'אלדד',
    notes: 'מקור: Protokol AI. יש להביא אקטואר מיידית שיעריך את ערך רוביום. נדרש לצורך קביעת שווי Sweat Equity של אלדד וקיריל.',
    subTasks: [
      { text: 'איתור אקטואר מתאים', done: false },
      { text: 'העברת נתוני החברה לאקטואר', done: false },
      { text: 'קבלת דוח הערכה', done: false },
    ],
  },
  // ── משימות מפרוטוקול מרץ 2026 (קודמות) ──
  {
    id: 'register-robium-ltd',
    title: 'פתיחת חברה — רוביום בע"מ (אוסנת אחראית)',
    dueDate: '2026-03-29',
    priority: 'high',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'founders-signing-march-25-2026',
    assignee: 'אוסנת',
    notes: 'אוסנת נתנה התחייבות לפתוח את החברה לאחר חתימה על הסכם המייסדים ב-25/3/2026. יש לרשום ברשם החברות, לפתוח חשבון בנק לחברה, ולהעביר את הפעילות משותפות בלתי רשומה לחברה.',
    subTasks: [
      { text: 'רישום ברשם החברות (3 שמות: Robium / רוביום טכנולוגיות / ...)', done: false },
      { text: 'פתיחת חשבון בנק לחברה', done: false },
      { text: 'רישום במע"מ ומס הכנסה', done: false },
      { text: 'הכנת תקנון חברה', done: false },
      { text: 'העברת פעילות מ-BLR (שותפות בלתי רשומה) לחברה', done: false },
    ],
  },
  {
    id: 'company-loans-25k',
    title: 'הלוואת חברה — 25 אש"ח × 2',
    dueDate: '2026-04-05',
    priority: 'high',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'הלוואה של 25,000 ₪ לאלדד ו-25,000 ₪ לקיריל מהחברה. יש לתעד כהלוואת בעלים עם ריבית מינימלית לפי הנחיות מס הכנסה.',
    subTasks: [
      { text: 'עריכת הסכם הלוואה לאלדד', done: false },
      { text: 'עריכת הסכם הלוואה לקיריל', done: false },
      { text: 'רישום בספרי החברה', done: false },
      { text: 'ביצוע העברות בנקאיות', done: false },
    ],
  },
  {
    id: 'register-ip-brand',
    title: 'רישום קניין רוחני — המוח של אלדד',
    dueDate: '2026-04-05',
    priority: 'high',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'ביטוח הרעיון לכדי מותג מסחרי או קניין רוחני. "המוח של אלדד" הוא ניסיונו וידעו של אלדד — חייב להיות מוגן כ-IP של החברה.',
    subTasks: [
      { text: 'בדיקת זמינות שם מותג ברשם הסימנים', done: false },
      { text: 'הגשת בקשה לרישום סימן מסחרי', done: false },
      { text: 'תיעוד ה-Business Logic כ-IP של החברה', done: false },
    ],
  },
  // ── משימות אסטרטגיות ──
  {
    id: 'equity-split-80-20',
    title: 'חלוקת מניות — 80% ל-3 שותפים / 20% מיעוט',
    dueDate: '2026-04-10',
    priority: 'medium',
    status: 'todo',
    category: 'אסטרטגי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'חלוקת מניות: 80% מהחברה יחולק שווה בשווה בין 3 המייסדים (אלדד, קיריל, אוסנת) — 26.66% לכל אחד. 20% יישארו לזכויות מיעוט. אלדד משמש כמנכ"ל זמני. יש לוודא שהמבנה תומך בעסקאות עתידיות, כניסת משקיע, או רכישות.',
    subTasks: [
      { text: 'עדכון הסכם מייסדים — טבלת אחזקות 26.6%×3 + 20%', done: false },
      { text: 'רישום חלוקת מניות בתקנון', done: false },
      { text: 'אימות מול רו"ח — השלכות מס', done: false },
      { text: 'הגדרת מנכ"ל זמני — אלדד, עד מינוי קבוע', done: false },
    ],
  },
  {
    id: 'domain-veto-rights',
    title: 'זכויות וטו תחומיות — לכל שותף בתחומו',
    dueDate: '2026-04-10',
    priority: 'medium',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'לכל שותף זכויות וטו בתחומו: אלדד — אסטרטגיה, כספים, עסקאות. קיריל — טכנולוגיה, קליטת עובדים טכניים. אוסנת — ראיונות עובדים חדשים ותחום הון אנושי.',
    subTasks: [
      { text: 'הגדרת תחומי וטו של אלדד: אסטרטגיה, כספים, עסקאות', done: false },
      { text: 'הגדרת תחומי וטו של קיריל: טכנולוגיה, קליטת עובדים', done: false },
      { text: 'הגדרת תפקיד אוסנת: ראיונות עובדים חדשים', done: false },
      { text: 'עיגון בתקנון החברה', done: false },
    ],
  },
  {
    id: 'osnat-contribution',
    title: 'תרומת אוסנת — הכרה, מעמד, ומסלול מנכ"לית',
    dueDate: '2026-04-10',
    priority: 'medium',
    status: 'todo',
    category: 'כללי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'הגדרת תרומת אוסנת ומעמדה בחברה. 3 תרחישים למנכ"ל: (1) אוסנת מוכיחה את עצמה ומתמנה למנכ"לית, (2) גיוס מנכ"ל חיצוני מהתחום, (3) אלדד ממשיך כמנכ"ל קבוע. יש לתעד את תפקידה, זכויותיה, ואופן ההכרה בתרומתה.',
    subTasks: [
      { text: 'הגדרת תפקיד ותרומת אוסנת', done: false },
      { text: 'הגדרת KPI להוכחת יכולת ניהול', done: false },
      { text: 'לוח זמנים להחלטה על מנכ"ל קבוע', done: false },
    ],
  },
  {
    id: 'incubator-agreements',
    title: 'הסכמי חממה לעובדים',
    dueDate: '2026-04-15',
    priority: 'medium',
    status: 'todo',
    category: 'משפטי',
    sourceProtocol: 'protocol-march-22-2026',
    actionLink: '/incubator',
    notes: 'עריכת הסכמי חממה (Incubator Vesting Agreement) לעובדים. הקצאת מניות מותנית בביצועים ו-Mile-stones. כולל הגדרת Bad Leaver ו-Claw-Back.',
    subTasks: [
      { text: 'ניסוח טמפלייט הסכם חממה', done: false },
      { text: 'הגדרת Mile-stones לכל תפקיד', done: false },
      { text: 'אישור משפטי', done: false },
    ],
  },
  {
    id: 'employee-onboarding-process',
    title: 'תהליך קליטת עובדים — מובנה',
    dueDate: '2026-04-15',
    priority: 'medium',
    status: 'todo',
    category: 'הון אנושי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'תהליך קליטה מסודר: אוסנת מראיינת עובדים חדשים, קיריל מאשר קליטה טכנית (וטו בתחומו). כולל הסכם חממה, KPI, תקופת חסד, Vesting.',
    subTasks: [
      { text: 'הגדרת שלבי קליטה', done: false },
      { text: 'בניית תהליך ראיון — אוסנת מראיינת', done: false },
      { text: 'אישור טכני — קיריל מאשר (וטו)', done: false },
      { text: 'יצירת טמפלייט חוזה עבודה', done: false },
      { text: 'בניית תהליך Onboarding דיגיטלי', done: false },
    ],
  },
  {
    id: 'future-equity-vision',
    title: 'ראיית עתיד — אופן החזקת מניות',
    dueDate: '2026-04-20',
    priority: 'medium',
    status: 'todo',
    category: 'אסטרטגי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'תכנון מבנה האחזקות כך שיתמוך בעסקאות עתידיות: כניסת משקיע, רכישה, מיזוג. יש לוודא שהמבנה לא מכביד על Exit.',
    subTasks: [
      { text: 'ניתוח תרחישי כניסת משקיע', done: false },
      { text: 'בדיקת השפעת דילול על השליטה', done: false },
      { text: 'הכנת Cap Table דינמי', done: false },
    ],
  },
  // ── משימות מותנות (הכנסות או משקיע) ──
  {
    id: 'retroactive-pay-15k',
    title: 'תשלום רטרואקטיבי — 15,000 ₪/חודש × 3 חודשים לאלדד וקיריל',
    dueDate: '2026-04-15',
    priority: 'high',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-11-2026',
    notes: 'מקור: Protokol AI (11.3.2026). הוחלט על תשלום רטרואקטיבי של 15,000 ₪ לחודש לכל אחד מהמייסדים (אלדד וקיריל) עבור 3 חודשי עבודה. סה"כ 45,000 ₪ לכל אחד (90,000 ₪ סה"כ). יבוצע עם תזרים חיובי.',
    subTasks: [
      { text: 'אישור סופי לתנאי התשלום', done: false },
      { text: 'חיכוי לתזרים חיובי / כניסת משקיע', done: false },
      { text: 'ביצוע העברות — 45K לאלדד, 45K לקיריל', done: false },
      { text: 'רישום חשבונאי', done: false },
    ],
  },
  {
    id: 'pre-company-investment-payout',
    title: 'החזר השקעת עבר — 500 אש"ח לאלדד וקיריל',
    dueDate: '2026-06-01',
    priority: 'low',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'הוסכם שמרנית כי ערך ההשקעה טרום החברה של אלדד וקיריל עומד על 500,000 ₪. סכום זה יועבר אליהם כאשר יהיה תזרים חיובי מהכנסות או ממשקיע חיצוני.',
    subTasks: [
      { text: 'מעקב תזרים חיובי / כניסת משקיע', done: false },
      { text: 'ביצוע פיצוי עבר: 250K לאלדד, 250K לקיריל', done: false },
      { text: 'רישום חשבונאי של החזר ההשקעה', done: false },
    ],
  },
  {
    id: 'salary-b2b-invoices',
    title: 'אופן תשלום שכר — עדיפות ראשונה לאלדד וקיריל',
    dueDate: '2026-06-01',
    priority: 'low',
    status: 'todo',
    category: 'כספי',
    sourceProtocol: 'protocol-march-22-2026',
    notes: 'אלדד וקיריל עמלו קשה ויהיו הראשונים לקבל שכר על פועלם בטרם משיכת שכר לשאר. כל שותף יוציא חשבונית B2B בהתאם לתפוקתו, מותנה בהיתכנות כלכלית ותזרים חיובי.',
    subTasks: [
      { text: 'תעדוף שכר ראשון לאלדד וקיריל', done: false },
      { text: 'הגדרת שכר מטרה לכל שותף', done: false },
      { text: 'בניית מנגנון דיווח שעות לחשבונית', done: false },
    ],
  },
];

// localStorage keys
export const STORAGE_KEYS = {
  meetings: 'brain-meetings',
  tasks: 'brain-tasks',
} as const;

// Priority config
export const PRIORITY_CONFIG = {
  high:   { label: 'גבוהה', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  medium: { label: 'בינונית', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  low:    { label: 'נמוכה', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
} as const;

export const STATUS_CONFIG = {
  todo:          { label: 'לביצוע', color: '#94a3b8' },
  'in-progress': { label: 'בעבודה', color: '#3b82f6' },
  done:          { label: 'הושלם', color: '#10b981' },
} as const;
