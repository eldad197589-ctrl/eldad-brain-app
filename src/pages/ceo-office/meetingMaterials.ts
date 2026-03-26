/* ============================================
   FILE: meetingMaterials.ts
   PURPOSE: Auto-collect related tasks, documents, and links for a meeting
   DEPENDENCIES: calendarTypes, seedMeetings
   EXPORTS: collectMeetingMaterials, MeetingMaterials, AutoLink
   ============================================ */
/**
 * Meeting Materials — Auto-Collection
 *
 * Given a meeting ID, pulls all related tasks (from sourceProtocol),
 * carryover tasks from predecessor meetings, and auto-generates
 * relevant document links based on meeting topics.
 */

import type { Meeting, Task } from '../../data/calendarTypes';

// #region Types

/** An auto-discovered link relevant to a meeting */
export interface AutoLink {
  /** Display label */
  label: string;
  /** Internal route */
  href: string;
  /** Why this link is relevant */
  reason: string;
}

/** Collected materials for a meeting */
export interface MeetingMaterials {
  /** Tasks directly linked to this meeting via sourceProtocol */
  directTasks: Task[];
  /** Open tasks from predecessor meetings that are still relevant */
  carryoverTasks: Task[];
  /** Auto-discovered document/page links */
  autoLinks: AutoLink[];
}

// #endregion

// #region Constants

/** Known predecessor meeting chains — maps meeting ID to IDs of prior meetings */
const MEETING_PREDECESSORS: Record<string, string[]> = {
  'founders-signing-march-26-2026': [
    'protocol-march-11-2026',
    'protocol-march-22-2026',
    'founders-march-2026',
  ],
};

/** Keyword-to-link mapping for auto-discovering relevant pages */
const KEYWORD_LINKS: { keywords: string[]; link: AutoLink }[] = [
  {
    keywords: ['הסכם', 'מייסדים', 'חתימה', 'agreement'],
    link: { label: 'הסכם מייסדים סופי', href: '/agreement', reason: 'הסכם מייסדים מוזכר בנושאי הפגישה' },
  },
  {
    keywords: ['שינויים', 'track changes', 'אוסנת', 'עקוב'],
    link: { label: 'עקוב אחר שינויים (לאוסנת)', href: '/legacy/robium_osnat_track_changes.html', reason: 'מסמך השוואת טיוטה מול סופי — מותאם לאוסנת' },
  },
  {
    keywords: ['הסכם', 'מייסדים', 'מקורי', 'טיוטה'],
    link: { label: 'טיוטה מעודכנת (11/03)', href: '/agreement/legacy', reason: 'השוואה לטיוטה ב׳' },
  },
  {
    keywords: ['השוואה', 'שינויים', 'הבדלים', 'הסכם', 'מקורי'],
    link: { label: 'השוואה סעיף-מול-סעיף', href: '/agreement/diff', reason: 'מקורי (3.3.26) מול סופי — השוואה מלאה' },
  },
  {
    keywords: ['מניות', 'אקוויטי', 'cap table', 'חלוקת'],
    link: { label: 'סקירת הסכם — חלוקת אקוויטי', href: '/agreement/review', reason: 'חלוקת מניות מוזכרת' },
  },
  {
    keywords: ['מוצר', 'pitch', 'דמו', 'תיק מוצרים'],
    link: { label: 'תיק מוצרים + Pitch Deck', href: '/products', reason: 'הצגת מוצרים נדרשת' },
  },
  {
    keywords: ['פורטל', 'עימות', 'ציפיות', 'שותפים'],
    link: { label: 'פורטל תיאום ציפיות (עימות)', href: '/founders', reason: 'נקודות עימות בין שותפים' },
  },
  {
    keywords: ['חממה', 'esop', 'nda', 'עובדים'],
    link: { label: 'חממה טכנולוגית', href: '/incubator', reason: 'חממה/NDA מוזכרים' },
  },
  {
    keywords: ['מרכז', 'שליטה', 'hub', 'דשבורד'],
    link: { label: 'מרכז שליטה — דמו חי', href: '/hub', reason: 'הדגמת מרכז השליטה' },
  },
];

// #endregion

// #region Collection Logic

/**
 * Auto-collect all related materials for a meeting.
 *
 * @param meetingId — The meeting to collect for
 * @param meeting — The meeting object (for topic scanning)
 * @param allTasks — All tasks in the system
 * @returns Collected materials
 */
export function collectMeetingMaterials(
  meetingId: string,
  meeting: Meeting,
  allTasks: Task[],
): MeetingMaterials {
  // 1. Direct tasks — linked via sourceProtocol
  const directTasks = allTasks.filter(
    t => t.sourceProtocol === meetingId && t.status !== 'done'
  );

  // 2. Carryover tasks — from predecessor meetings, still open
  const predecessorIds = MEETING_PREDECESSORS[meetingId] || [];
  const carryoverTasks = predecessorIds.length > 0
    ? allTasks.filter(
        t =>
          t.sourceProtocol &&
          predecessorIds.includes(t.sourceProtocol) &&
          t.status !== 'done' &&
          // Exclude tasks that are also direct (avoid duplicates)
          t.sourceProtocol !== meetingId
      )
    : [];

  // 3. Auto-links — scan meeting topics + title for keywords
  const searchText = [
    meeting.title,
    ...meeting.topics.map(t => typeof t === 'string' ? t : t.text),
  ].join(' ').toLowerCase();

  const seenHrefs = new Set<string>();
  const autoLinks: AutoLink[] = [];

  // First add links from topics that have explicit links
  for (const topic of meeting.topics) {
    const topicObj = typeof topic === 'string' ? { text: topic } : topic;
    if (topicObj.link && !seenHrefs.has(topicObj.link)) {
      seenHrefs.add(topicObj.link);
    }
  }

  // Then add keyword-matched links
  for (const { keywords, link } of KEYWORD_LINKS) {
    if (seenHrefs.has(link.href)) continue;
    if (keywords.some(kw => searchText.includes(kw))) {
      autoLinks.push(link);
      seenHrefs.add(link.href);
    }
  }

  return { directTasks, carryoverTasks, autoLinks };
}

// #endregion
