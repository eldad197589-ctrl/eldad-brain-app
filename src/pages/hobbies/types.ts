/* ============================================
   FILE: types.ts
   PURPOSE: Domain-specific interfaces and types
   DEPENDENCIES: None (local only)
   EXPORTS: MasteryLevel, SongCategory, MusicalKey, Song, SetlistItem, Setlist, InstrumentType, Musician, PerformanceType, PerformanceStatus, Performance, HobbyFrequency, Hobby
   ============================================ */
/**
 * FILE: types.ts
 * PURPOSE: Domain interfaces for the Singer Toolkit — songs, setlists, musicians, performances, hobbies
 * DEPENDENCIES: none (pure types)
 */

// #region Song Types

/** רמת שליטה בשיר (1-5 כוכבים) */
export type MasteryLevel = 1 | 2 | 3 | 4 | 5;

/** קטגוריית שיר */
export type SongCategory = 'pop' | 'oriental' | 'rock' | 'classic' | 'israeli' | 'other';

/** טונליות מוזיקלית */
export type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'
  | 'Cm' | 'C#m' | 'Dm' | 'D#m' | 'Em' | 'Fm' | 'F#m' | 'Gm' | 'G#m' | 'Am' | 'A#m' | 'Bm';

/** שיר ברפרטואר */
export interface Song {
  /** מזהה ייחודי */
  id: string;
  /** שם השיר */
  name: string;
  /** שם האמן / להקה */
  artist: string;
  /** קטגוריה */
  category: SongCategory;
  /** רמת שליטה (1-5) */
  mastery: MasteryLevel;
  /** טונליות (אופציונלי) */
  key?: MusicalKey;
  /** טמפו BPM (אופציונלי) */
  tempo?: number;
  /** אקורדים — טקסט חופשי (אופציונלי) */
  chords?: string;
  /** קישור YouTube (אופציונלי) */
  youtubeUrl?: string;
  /** קישור ישיר לקובץ שמע MP3 (אופציונלי) */
  audioUrl?: string;
  /** קישור לתווים (אופציונלי) */
  sheetMusicUrl?: string;
  /** קישור למילים (אופציונלי) */
  lyricsUrl?: string;
  /** הערות חופשיות */
  notes?: string;
}

// #endregion

// #region Setlist Types

/** שיר בתוך סטליסט — עם סדר */
export interface SetlistItem {
  /** מזהה השיר */
  songId: string;
  /** סדר בסטליסט */
  order: number;
  /** הערה ספציפית לסטליסט (למשל "פתיחה", "סלואו") */
  note?: string;
}

/** סטליסט — רשימת שירים לאירוע */
export interface Setlist {
  /** מזהה ייחודי — גם משמש כ-ID לשיתוף */
  id: string;
  /** שם הסטליסט (למשל: "חתונה שרון 15.4") */
  name: string;
  /** תיאור / הערות */
  description?: string;
  /** תאריך האירוע (YYYY-MM-DD) */
  eventDate?: string;
  /** רשימת שירים (מסודרת) */
  items: SetlistItem[];
  /** תאריך יצירה */
  createdAt: string;
}

// #endregion

// #region Musician Types

/** סוג כלי נגינה */
export type InstrumentType = 'guitar' | 'piano' | 'bass' | 'drums' | 'violin' | 'sax' | 'trumpet' | 'flute' | 'oud' | 'vocals' | 'other';

/** נגן */
export interface Musician {
  /** מזהה ייחודי */
  id: string;
  /** שם הנגן */
  name: string;
  /** טלפון */
  phone?: string;
  /** כלי נגינה (יכול להיות יותר מאחד) */
  instruments: InstrumentType[];
  /** הערות */
  notes?: string;
}

// #endregion

// #region Performance Types

/** סוג הופעה */
export type PerformanceType = 'wedding' | 'event' | 'practice' | 'show' | 'other';

/** סטטוס הופעה */
export type PerformanceStatus = 'planned' | 'done' | 'cancelled';

/** הופעה / אירוע */
export interface Performance {
  /** מזהה ייחודי */
  id: string;
  /** תאריך (YYYY-MM-DD) */
  date: string;
  /** מקום ההופעה */
  venue: string;
  /** סוג האירוע */
  type: PerformanceType;
  /** רשימת שירים שבוצעו/יבוצעו */
  songIds: string[];
  /** סטליסט משויך (אופציונלי) */
  setlistId?: string;
  /** סטטוס */
  status: PerformanceStatus;
  /** הערות */
  notes?: string;
}

// #endregion

// #region Hobby Types

/** תדירות תחביב */
export type HobbyFrequency = 'daily' | 'weekly' | 'monthly' | 'occasional';

/** תחביב כללי */
export interface Hobby {
  /** מזהה ייחודי */
  id: string;
  /** שם התחביב */
  name: string;
  /** אימוג'י / אייקון */
  emoji: string;
  /** תיאור קצר */
  description: string;
  /** תדירות */
  frequency: HobbyFrequency;
  /** הערות */
  notes?: string;
}

// #endregion
