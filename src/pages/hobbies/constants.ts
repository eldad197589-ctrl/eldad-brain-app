/* ============================================
   FILE: constants.ts
   PURPOSE: Static data and configuration
   DEPENDENCIES: None (local only)
   EXPORTS: HOBBIES_STORAGE_KEYS, MUSICAL_KEY_LABELS, MUSICAL_KEYS, INSTRUMENT_LABELS, INSTRUMENT_EMOJIS, SONG_CATEGORY_LABELS, SONG_CATEGORY_COLORS, PERFORMANCE_TYPE_LABELS, FREQUENCY_LABELS, FREQUENCY_COLORS, SEED_SONGS, SEED_SETLISTS, SEED_MUSICIANS, SEED_HOBBIES
   ============================================ */
/**
 * FILE: constants.ts
 * PURPOSE: Static data, localStorage keys, labels, and seed data for the Singer Toolkit
 * DEPENDENCIES: ./types
 */

import type { Song, Hobby, Musician, Setlist, SongCategory, PerformanceType, HobbyFrequency, MusicalKey, InstrumentType } from './types';

// #region Storage Keys

/** localStorage keys for all data */
export const HOBBIES_STORAGE_KEYS = {
  SONGS: 'hobbies_songs',
  PERFORMANCES: 'hobbies_performances',
  HOBBIES: 'hobbies_list',
  SETLISTS: 'hobbies_setlists',
  MUSICIANS: 'hobbies_musicians',
} as const;

// #endregion

// #region Musical Keys

/** All musical keys with Hebrew labels */
export const MUSICAL_KEY_LABELS: Record<MusicalKey, string> = {
  'C': 'דו מז\'ור', 'C#': 'דו# מז\'ור', 'D': 'רה מז\'ור', 'D#': 'רה# מז\'ור',
  'E': 'מי מז\'ור', 'F': 'פה מז\'ור', 'F#': 'פה# מז\'ור', 'G': 'סול מז\'ור',
  'G#': 'סול# מז\'ור', 'A': 'לה מז\'ור', 'A#': 'לה# מז\'ור', 'B': 'סי מז\'ור',
  'Cm': 'דו מינור', 'C#m': 'דו# מינור', 'Dm': 'רה מינור', 'D#m': 'רה# מינור',
  'Em': 'מי מינור', 'Fm': 'פה מינור', 'F#m': 'פה# מינור', 'Gm': 'סול מינור',
  'G#m': 'סול# מינור', 'Am': 'לה מינור', 'A#m': 'לה# מינור', 'Bm': 'סי מינור',
};

/** Musical keys list for select dropdowns */
export const MUSICAL_KEYS: MusicalKey[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
];

// #endregion

// #region Instrument Labels

/** תוויות כלי נגינה */
export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  guitar: 'גיטרה',
  piano: 'פסנתר / קלידים',
  bass: 'בס',
  drums: 'תופים',
  violin: 'כינור',
  sax: 'סקסופון',
  trumpet: 'חצוצרה',
  flute: 'חליל',
  oud: 'עוד',
  vocals: 'שירה',
  other: 'אחר',
};

/** אימוג'י כלי נגינה */
export const INSTRUMENT_EMOJIS: Record<InstrumentType, string> = {
  guitar: '🎸',
  piano: '🎹',
  bass: '🎸',
  drums: '🥁',
  violin: '🎻',
  sax: '🎷',
  trumpet: '🎺',
  flute: '🪈',
  oud: '🪕',
  vocals: '🎤',
  other: '🎵',
};

// #endregion

// #region Category Labels

/** תוויות קטגוריות שירים בעברית */
export const SONG_CATEGORY_LABELS: Record<SongCategory, string> = {
  pop: 'פופ',
  oriental: 'מזרחי',
  rock: 'רוק',
  classic: 'קלאסי',
  israeli: 'ישראלי',
  other: 'אחר',
};

/** צבעי קטגוריות שירים */
export const SONG_CATEGORY_COLORS: Record<SongCategory, string> = {
  pop: '#f472b6',
  oriental: '#fbbf24',
  rock: '#ef4444',
  classic: '#a78bfa',
  israeli: '#34d399',
  other: '#94a3b8',
};

/** תוויות סוגי הופעות */
export const PERFORMANCE_TYPE_LABELS: Record<PerformanceType, string> = {
  wedding: 'חתונה',
  event: 'אירוע',
  practice: 'אימון',
  show: 'הופעה',
  other: 'אחר',
};

/** תוויות תדירות תחביב */
export const FREQUENCY_LABELS: Record<HobbyFrequency, string> = {
  daily: 'יומי',
  weekly: 'שבועי',
  monthly: 'חודשי',
  occasional: 'מדי פעם',
};

/** צבעי תדירות */
export const FREQUENCY_COLORS: Record<HobbyFrequency, string> = {
  daily: '#4ade80',
  weekly: '#38bdf8',
  monthly: '#fbbf24',
  occasional: '#94a3b8',
};

// #endregion

// #region Seed Data

/** SEED_SONGS — Static data and configuration */
export const SEED_SONGS: Song[] = [
  // Led Zeppelin
  { id: 's_lz1', name: 'Stairway to Heaven', artist: 'Led Zeppelin', category: 'classic', mastery: 3, key: 'Am', tempo: 72, chords: 'Am - E - C - D - F - G - Am', youtubeUrl: 'https://www.youtube.com/watch?v=QkF3oxziUI4', lyricsUrl: 'https://www.azlyrics.com/lyrics/ledzeppelin/stairwaytoheaven.html' },
  { id: 's_lz2', name: 'Whole Lotta Love', artist: 'Led Zeppelin', category: 'rock', mastery: 3, key: 'E', tempo: 90, chords: 'E5 - D5 - E5', youtubeUrl: 'https://www.youtube.com/watch?v=HQmmM_qwG4k', lyricsUrl: 'https://www.azlyrics.com/lyrics/ledzeppelin/wholelottalove.html' },
  { id: 's_lz3', name: 'Kashmir', artist: 'Led Zeppelin', category: 'rock', mastery: 4, key: 'D', tempo: 80, chords: 'D5 - Daug - D6 - D7', youtubeUrl: 'https://www.youtube.com/watch?v=tzVJPgCn-Z8', lyricsUrl: 'https://www.azlyrics.com/lyrics/ledzeppelin/kashmir.html' },
  { id: 's_lz4', name: 'Black Dog', artist: 'Led Zeppelin', category: 'rock', mastery: 3, key: 'A', tempo: 85, chords: 'A5 - C - D - E', youtubeUrl: 'https://www.youtube.com/watch?v=yBuub4Xe1mw', lyricsUrl: 'https://www.azlyrics.com/lyrics/ledzeppelin/blackdog.html' },
  { id: 's_lz5', name: 'Immigrant Song', artist: 'Led Zeppelin', category: 'rock', mastery: 4, key: 'F#m', tempo: 110, chords: 'F#m - A - B', youtubeUrl: 'https://www.youtube.com/watch?v=y8OtzJtp-EM', lyricsUrl: 'https://www.azlyrics.com/lyrics/ledzeppelin/immigrantsong.html' },

  // Queen
  { id: 's_q1', name: 'Bohemian Rhapsody', artist: 'Queen', category: 'classic', mastery: 5, key: 'A#', tempo: 72, chords: 'Bb - Gm - Cm - F', youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', lyricsUrl: 'https://www.azlyrics.com/lyrics/queen/bohemianrhapsody.html' },
  { id: 's_q2', name: "Don't Stop Me Now", artist: 'Queen', category: 'rock', mastery: 4, key: 'F', tempo: 156, chords: 'F - Am - Dm - Gm - C', youtubeUrl: 'https://www.youtube.com/watch?v=HgzGwKwLmgM', lyricsUrl: 'https://www.azlyrics.com/lyrics/queen/dontstopmenow.html' },
  { id: 's_q3', name: 'Somebody to Love', artist: 'Queen', category: 'rock', mastery: 5, key: 'G#', tempo: 110, chords: 'Ab - Db - Eb - Fm', youtubeUrl: 'https://www.youtube.com/watch?v=kijpcUv-b8M', lyricsUrl: 'https://www.azlyrics.com/lyrics/queen/somebodytolove.html' },
  { id: 's_q4', name: 'We Will Rock You', artist: 'Queen', category: 'rock', mastery: 2, key: 'Em', tempo: 81, chords: 'Em', youtubeUrl: 'https://www.youtube.com/watch?v=-tJYN-eG1zk', lyricsUrl: 'https://www.azlyrics.com/lyrics/queen/wewillrockyou.html' },
  { id: 's_q5', name: 'The Show Must Go On', artist: 'Queen', category: 'classic', mastery: 4, key: 'Bm', tempo: 84, chords: 'Bm - G - F#m - Em', youtubeUrl: 'https://www.youtube.com/watch?v=t99KH0TR-J4', lyricsUrl: 'https://www.azlyrics.com/lyrics/queen/theshowmustgoon.html' },

  // Bon Jovi
  { id: 's_bj1', name: "Livin' on a Prayer", artist: 'Bon Jovi', category: 'rock', mastery: 3, key: 'Em', tempo: 122, chords: 'Em - C - D - G', youtubeUrl: 'https://www.youtube.com/watch?v=lDK9QqIzhwk', lyricsUrl: 'https://www.azlyrics.com/lyrics/bonjovi/livingonaprayer.html' },
  { id: 's_bj2', name: "It's My Life", artist: 'Bon Jovi', category: 'rock', mastery: 3, key: 'Cm', tempo: 120, chords: 'Cm - Ab - Eb - Bb', youtubeUrl: 'https://www.youtube.com/watch?v=vx2u5uUu3DE', lyricsUrl: 'https://www.azlyrics.com/lyrics/bonjovi/itsmylife.html' },
  { id: 's_bj3', name: 'Always', artist: 'Bon Jovi', category: 'pop', mastery: 4, key: 'E', tempo: 80, chords: 'E - B - C#m - A', youtubeUrl: 'https://www.youtube.com/watch?v=9BMwcO6_hyA', lyricsUrl: 'https://www.azlyrics.com/lyrics/bonjovi/always.html' },
  { id: 's_bj4', name: 'You Give Love a Bad Name', artist: 'Bon Jovi', category: 'rock', mastery: 3, key: 'Cm', tempo: 123, chords: 'Cm - Ab - Bb - Eb', youtubeUrl: 'https://www.youtube.com/watch?v=KrZHPOeOxQQ', lyricsUrl: 'https://www.azlyrics.com/lyrics/bonjovi/yougivelovebadname.html' },
  { id: 's_bj5', name: 'Bed of Roses', artist: 'Bon Jovi', category: 'pop', mastery: 4, key: 'F', tempo: 78, chords: 'F - Bb - C - Dm', youtubeUrl: 'https://www.youtube.com/watch?v=NhPh0Xu8XBs', lyricsUrl: 'https://www.azlyrics.com/lyrics/bonjovi/bedofroses.html' },

  // Aerosmith
  { id: 's_aero1', name: "I Don't Want to Miss a Thing (Armageddon)", artist: 'Aerosmith', category: 'pop', mastery: 4, key: 'D', tempo: 70, chords: 'D - A - Bm - G', youtubeUrl: 'https://www.youtube.com/watch?v=JkK8g6FMEXE', lyricsUrl: 'https://www.azlyrics.com/lyrics/aerosmith/idontwanttomissathing.html' },

  // Bryan Adams
  { id: 's_ba1', name: "Summer of '69", artist: 'Bryan Adams', category: 'rock', mastery: 3, key: 'D', tempo: 139, chords: 'D - A - Bm - G', youtubeUrl: 'https://www.youtube.com/watch?v=eFjjO_lhf9c', lyricsUrl: 'https://www.azlyrics.com/lyrics/bryanadams/summerof69.html' },
  { id: 's_ba2', name: '(Everything I Do) I Do It for You', artist: 'Bryan Adams', category: 'pop', mastery: 3, key: 'C#', tempo: 65, chords: 'Db - Ab - Gb - Ebm', youtubeUrl: 'https://www.youtube.com/watch?v=ZGoWtY_h4xo', lyricsUrl: 'https://www.azlyrics.com/lyrics/bryanadams/everythingidoidoitforyou.html' },
  { id: 's_ba3', name: 'Heaven', artist: 'Bryan Adams', category: 'pop', mastery: 3, key: 'C', tempo: 70, chords: 'C - Am - F - G', youtubeUrl: 'https://www.youtube.com/watch?v=3eT464L1YRA', lyricsUrl: 'https://www.azlyrics.com/lyrics/bryanadams/heaven.html' },
  { id: 's_ba4', name: 'Please Forgive Me', artist: 'Bryan Adams', category: 'pop', mastery: 3, key: 'A', tempo: 67, chords: 'A - F#m - D - E', youtubeUrl: 'https://www.youtube.com/watch?v=9_5_AD2y0YA', lyricsUrl: 'https://www.azlyrics.com/lyrics/bryanadams/pleaseforgiveme.html' },
  { id: 's_ba5', name: 'Run to You', artist: 'Bryan Adams', category: 'rock', mastery: 4, key: 'F#m', tempo: 126, chords: 'F#m - A - E - D', youtubeUrl: 'https://www.youtube.com/watch?v=s5ULYKKHDpo', lyricsUrl: 'https://www.azlyrics.com/lyrics/bryanadams/runtoyou.html' },

  // Bob Marley
  { id: 's_bm1', name: 'Redemption Song', artist: 'Bob Marley', category: 'classic', mastery: 3, key: 'G', tempo: 116, chords: 'G - Em - C - Am - D', youtubeUrl: 'https://www.youtube.com/watch?v=kOFu6b3w6c0', lyricsUrl: 'https://www.azlyrics.com/lyrics/bobmarley/redemptionsong.html' },
  { id: 's_bm2', name: 'No Woman No Cry', artist: 'Bob Marley', category: 'classic', mastery: 2, key: 'C', tempo: 78, chords: 'C - G - Am - F', youtubeUrl: 'https://www.youtube.com/watch?v=x59kS2AOrGM', lyricsUrl: 'https://www.azlyrics.com/lyrics/bobmarley/nowomannocry.html' },
  { id: 's_bm3', name: 'Three Little Birds', artist: 'Bob Marley', category: 'pop', mastery: 2, key: 'A', tempo: 148, chords: 'A - D - E', youtubeUrl: 'https://www.youtube.com/watch?v=zaGUr6wzyT8', lyricsUrl: 'https://www.azlyrics.com/lyrics/bobmarley/threelittlebirds.html' },
  { id: 's_bm4', name: 'Is This Love', artist: 'Bob Marley', category: 'pop', mastery: 3, key: 'F#m', tempo: 122, chords: 'F#m - D - A - E', youtubeUrl: 'https://www.youtube.com/watch?v=69RdQFDuYPI', lyricsUrl: 'https://www.azlyrics.com/lyrics/bobmarley/isthislove.html' },
  { id: 's_bm5', name: 'One Love', artist: 'Bob Marley', category: 'pop', mastery: 2, key: 'A#', tempo: 152, chords: 'Bb - F - Eb', youtubeUrl: 'https://www.youtube.com/watch?v=vdB-8eLEW8g', lyricsUrl: 'https://www.azlyrics.com/lyrics/bobmarley/onelove.html' },

  // UB40
  { id: 's_ub1', name: 'Red Red Wine', artist: 'UB40', category: 'pop', mastery: 2, key: 'C#', tempo: 89, chords: 'Db - Gb - Ab', youtubeUrl: 'https://www.youtube.com/watch?v=zXt56MB-3vc', lyricsUrl: 'https://www.azlyrics.com/lyrics/ub40/redredwine.html' },
  { id: 's_ub2', name: "Can't Help Falling in Love", artist: 'UB40', category: 'pop', mastery: 3, key: 'G', tempo: 86, chords: 'G - D - Em - C', youtubeUrl: 'https://www.youtube.com/watch?v=vGJTaP6anOU', lyricsUrl: 'https://www.azlyrics.com/lyrics/ub40/canthelpfallinginlove.html' },

  // היהודים
  { id: 's_yh1', name: 'קח אותי', artist: 'היהודים', category: 'rock', mastery: 4, key: 'Bm', tempo: 130, chords: 'Bm - G - D - A', youtubeUrl: 'https://www.youtube.com/results?search_query=היהודים+קח+אותי', lyricsUrl: 'https://shironet.mako.co.il/search?q=היהודים+קח+אותי' },
  { id: 's_yh2', name: 'עוד ארון אחד', artist: 'היהודים', category: 'rock', mastery: 4, key: 'Em', tempo: 120, chords: 'Em - C - D - Bm', youtubeUrl: 'https://www.youtube.com/results?search_query=היהודים+עוד+ארון+אחד', lyricsUrl: 'https://shironet.mako.co.il/search?q=היהודים+עוד+ארון+אחד' },
  { id: 's_yh3', name: 'שחק אותה', artist: 'היהודים', category: 'rock', mastery: 3, key: 'Dm', tempo: 140, chords: 'Dm - Bb - C - Am', youtubeUrl: 'https://www.youtube.com/results?search_query=היהודים+שחק+אותה', lyricsUrl: 'https://shironet.mako.co.il/search?q=היהודים+שחק+אותה' },
  { id: 's_yh4', name: 'אלה', artist: 'היהודים', category: 'rock', mastery: 4, key: 'Am', tempo: 100, chords: 'Am - F - C - E', youtubeUrl: 'https://www.youtube.com/results?search_query=היהודים+אלה', lyricsUrl: 'https://shironet.mako.co.il/search?q=היהודים+אלה' },
  { id: 's_yh5', name: 'מחפש תשובה', artist: 'היהודים', category: 'rock', mastery: 4, key: 'Dm', tempo: 110, chords: 'Dm - Gm - C - F', youtubeUrl: 'https://www.youtube.com/results?search_query=היהודים+מחפש+תשובה', lyricsUrl: 'https://shironet.mako.co.il/search?q=היהודים+מחפש+תשובה' },

  // מזרחית / ישראלי
  { id: 's_ns1', name: 'יש לי אותך', artist: 'נסרין קדרי', category: 'oriental', mastery: 4, key: 'Dm', tempo: 95, chords: 'Dm - Am - Bb - C', youtubeUrl: 'https://www.youtube.com/results?search_query=נסרין+קדרי+יש+לי+אותך', lyricsUrl: 'https://shironet.mako.co.il/search?q=נסרין+קדרי+יש+לי+אותך' },
  { id: 's_pt1', name: 'דרך השלום', artist: 'פאר טסי', category: 'oriental', mastery: 3, key: 'Em', tempo: 128, chords: 'Em - Am - D - G', youtubeUrl: 'https://www.youtube.com/results?search_query=פאר+טסי+דרך+השלום', lyricsUrl: 'https://shironet.mako.co.il/search?q=פאר+טסי+דרך+השלום' },
  { id: 's_pt2', name: 'אהבה חולה', artist: 'פאר טסי', category: 'oriental', mastery: 4, key: 'Am', tempo: 105, chords: 'Am - Dm - G - C', youtubeUrl: 'https://www.youtube.com/results?search_query=פאר+טסי+אהבה+חולה', lyricsUrl: 'https://shironet.mako.co.il/search?q=פאר+טסי+אהבה+חולה' },
  { id: 's_eg1', name: 'צליל מיתר', artist: 'אייל גולן', category: 'oriental', mastery: 4, key: 'Em', tempo: 80, chords: 'Em - C - Am - B7', youtubeUrl: 'https://www.youtube.com/results?search_query=אייל+גולן+צליל+מיתר', lyricsUrl: 'https://shironet.mako.co.il/search?q=אייל+גולן+צליל+מיתר' },
  { id: 's_eg2', name: 'יפיופה', artist: 'אייל גולן', category: 'oriental', mastery: 3, key: 'Dm', tempo: 130, chords: 'Dm - Gm - C - F', youtubeUrl: 'https://www.youtube.com/results?search_query=אייל+גולן+יפיופה', lyricsUrl: 'https://shironet.mako.co.il/search?q=אייל+גולן+יפיופה' },
  { id: 's_eg3', name: 'לוחמת', artist: 'אייל גולן', category: 'oriental', mastery: 3, key: 'Cm', tempo: 115, chords: 'Cm - Fm - Bb - Eb', youtubeUrl: 'https://www.youtube.com/results?search_query=אייל+גולן+לוחמת', lyricsUrl: 'https://shironet.mako.co.il/search?q=אייל+גולן+לוחמת' },

  // ⭐ שירים מקוריים של אלדד — להקת צ'ארלי בראון, אלבום "צ'ארלי 23"
  { id: 's_eldad1', name: 'יש לה קסם', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/יש לה קסם.mp3' },
  { id: 's_eldad2', name: 'מספיק למלא אמבטיה', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/מספיק למלא אמבטיה.mp3' },
  { id: 's_eldad3', name: 'ריח גופך', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/ריח גופך.mp3' },
  { id: 's_eldad4', name: 'להתנחם', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/להתנחם.mp3' },
  { id: 's_eldad5', name: 'יקיצה', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/יקיצה.mp3' },
  { id: 's_eldad6', name: 'צ׳ארלי', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/צ׳ארלי.mp3' },
  { id: 's_eldad7', name: 'גשם יורד', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/גשם יורד.mp3' },
  { id: 's_eldad8', name: 'אנה', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/אנה.mp3' },
  { id: 's_eldad9', name: 'ארץ השתיקה', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/ארץ השתיקה.mp3' },
  { id: 's_eldad10', name: 'גרתי פה', artist: 'צ\'ארלי בראון', category: 'israeli', mastery: 5, notes: 'אלבום צ\'ארלי 23', audioUrl: '/songs/גרתי פה.mp3' },
];

/** סטליסט לדוגמה */
export const SEED_SETLISTS: Setlist[] = [
  {
    id: 'set1',
    name: 'מופע פתיחת קיץ בבארבי',
    eventDate: '2026-06-01',
    description: 'מופע מלא עם הלהקה, 45 דקות',
    items: [
      { songId: 's3', order: 1 },
      { songId: 's5', order: 2 },
      { songId: 's1', order: 3 },
      { songId: 's2', order: 4 },
      { songId: 's4', order: 5 },
    ],
    createdAt: new Date().toISOString()
  }
];

/** נגנים לדוגמה */
export const SEED_MUSICIANS: Musician[] = [
  { id: 'm1', name: 'יוסי כהן', phone: '050-1234567', instruments: ['guitar'], notes: 'גיטריסט קבוע' },
  { id: 'm2', name: 'דני לוי', phone: '052-9876543', instruments: ['piano', 'bass'], notes: 'קלידן ובסיסט' },
  { id: 'm3', name: 'רועי אברהם', phone: '054-5555555', instruments: ['drums'] },
];

/** תחביבים ברירת מחדל */
export const SEED_HOBBIES: Hobby[] = [
  { id: 'h1', name: 'שירה', emoji: '🎤', description: 'שירה וביצוע שירים', frequency: 'weekly' },
  { id: 'h2', name: 'גיטרה', emoji: '🎸', description: 'נגינה בגיטרה אקוסטית', frequency: 'weekly' },
  { id: 'h3', name: 'ספורט', emoji: '🏃', description: 'ריצה והליכה', frequency: 'daily' },
];

// #endregion
