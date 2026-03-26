/* ============================================
   FILE: seedMeetings.ts
   PURPOSE: Seed data for meetings — updated for 26/3 signing session
   DEPENDENCIES: calendarTypes.ts
   EXPORTS: SEED_MEETINGS
   ============================================ */
import type { Meeting } from './calendarTypes';

// #region Meetings

/** SEED_MEETINGS — Updated meeting data with accurate topics and prep materials */
export const SEED_MEETINGS: Meeting[] = [
  // ── פגישות שהושלמו ──
  {
    id: 'protocol-march-11-2026',
    title: 'גיבוש הסכם מייסדים ופתרון מחלוקות — רוביום',
    date: '2026-03-11',
    time: '10:00',
    duration: 141,
    participants: ['אלדד', 'קיריל', 'אוסנת'],
    topics: [
      { text: 'הקמת חברה בשם רוביום טכנולוגיות' },
      { text: 'תשלום רטרואקטיבי — 15,000 ₪ לחודש' },
      { text: 'חלוקת מניות — 26.66% לכל מייסד + 20% ESOP', link: '/agreement' },
      { text: 'זכויות וטו תחומיות', link: '/agreement' },
      { text: 'הסכמי NDA וחממה לעובדים', link: '/incubator' },
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
      { text: 'אישור 500 אש"ח השקעת עבר', link: '/agreement' },
      { text: 'עדיפות שכר ראשונה לאלדד וקיריל' },
      { text: 'עדכון חלוקת מניות שווה (80/3)', link: '/agreement' },
    ],
    color: '#7C3AED',
    completed: true,
  },

  // ── פגישת החתימה — 26/3/2026 ──
  {
    id: 'founders-signing-march-26-2026',
    title: 'חתימה על הסכם מייסדים + פתיחת חברה — אוסנת, אלדד, קיריל',
    date: '2026-03-26',
    time: '10:00',
    duration: 120,
    participants: ['אלדד', 'אוסנת', 'קיריל'],
    topics: [
      { text: 'הסכם מייסדים לחתימה', link: '/agreement' },
      { text: 'דוח לאוסנת' },
      { text: 'הסכמי חממה — הסכם העסקה + הסכם אופציות', link: '/incubator/agreements' },
      { text: 'הצגת הצוות לאוסנת', link: '/incubator' },
      { text: 'הצגת תיק מוצרים', link: '/products' },
    ],
    color: '#10b981',
    completed: false,
    prepStages: [
      {
        title: 'שלב 1 — לפני הפגישה (הכנה + הזמנה)',
        color: '#3b82f6',
        items: [
          {
            type: 'link',
            label: 'הסכם מייסדים סופי',
            href: '/agreement',
            isInternal: true,
          },
          {
            type: 'link',
            label: 'עקוב אחר שינויים (Track Changes לאוסנת)',
            href: '/legacy/robium_osnat_track_changes.html',
            isInternal: false,
          },
          {
            type: 'link',
            label: 'השוואה סעיף-מול-סעיף',
            href: '/agreement/diff',
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
            label: 'חבילת חומרים להדפסה (PDF)',
            href: '/legacy/robium_meeting_packet.html',
            isInternal: false,
          },
          {
            type: 'message',
            label: 'הודעת WhatsApp למייסדים — זימון לחתימה',
            recipient: 'קבוצת המייסדים',
            messageText: 'היי אוסנת וקיריל 🙂\n\nביום חמישי 26.3 (שעה תתואם) — פגישת חתימה על הסכם מייסדים + פתיחת חברת רוביום טכנולוגיות בע"מ.\n\n📌 סדר יום:\n1. סקירה סופית של ההסכם — עם כל התיקונים מהפגישות הקודמות (11.3 + 22.3)\n2. חתימה פורמלית של כל 3 המייסדים\n3. הצגת תיק המוצרים\n4. חלוקת אחריות: מי פותח חברה, מי מכין NDA, מי מגיש דוחות\n\n📎 חובה לקרוא לפני הפגישה (מצורף בפורטל):\n• הסכם מייסדים סופי\n• פורטל תיאום ציפיות — מומלץ לעבור טרם הפגישה\n• מסמכי חממה ושינויים לאוסנת\n\n⏰ משך: ~120 דקות\n\nכל ההזמנה והמסמכים מוכנים לקריאה ולהורדה פה:\nhttps://meeting-invite-opal.vercel.app/?v=r-moon\n\nבואו מוכנים. אלדד. 🚀',
          },
          {
            type: 'checklist',
            label: 'צ\'קליסט הכנות',
            checkItems: [
              'הסכם מייסדים מעודכן ✅',
              'Track Changes לאוסנת מוכן ✅',
              'השוואה משפטית מוכנה ✅',
              'Cap Table סופי ✅',
              'חבילת חומרים להדפסה',
              'שליחת הזמנה לשותפים',
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
            type: 'checklist',
            label: 'נקודות לעבור בפגישה',
            checkItems: [
              'הסכם מייסדים — הצגה וחתימה',
              'דוח לאוסנת',
              'הסכמי חממה — הסכם העסקה + אופציות',
              'הצגת הצוות לאוסנת',
              'הצגת תיק מוצרים',
            ],
          },
        ],
      },
      {
        title: 'שלב 3 — אחרי הפגישה (ביצוע)',
        color: '#06b6d4',
        items: [
          {
            type: 'checklist',
            label: 'משימות אחרי החתימה',
            checkItems: [
              'אוסנת — פתיחת חברה ברשם החברות',
              'אוסנת — פתיחת חשבון בנק לחברה',
              'קיריל — הכנת NDA לגביר וענבר',
              'קיריל — חוזי חממה לעובדים',
              'אלדד — הגשת דוחות מס + רישום מע"מ',
              'אלדד — רישום קניין רוחני',
            ],
          },
        ],
      },
    ],
  },
];

// #endregion
