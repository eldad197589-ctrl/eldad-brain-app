/* ============================================
   FILE: hooks.ts
   PURPOSE: Custom React hooks (data, computed values)
   DEPENDENCIES: react
   EXPORTS: HobbiesDataReturn, useHobbiesData
   ============================================ */
/**
 * FILE: hooks.ts
 * PURPOSE: Custom React hooks for CRUD on songs, setlists, musicians, performances, and hobbies
 * DEPENDENCIES: react, ./types, ./constants
 */

// #region Imports
import { useState, useCallback, useEffect } from 'react';
import type { Song, Performance, Hobby, Setlist, Musician } from './types';
import { HOBBIES_STORAGE_KEYS, SEED_SONGS, SEED_HOBBIES, SEED_MUSICIANS } from './constants';
// #endregion

// #region Helpers

/** Generate a simple unique ID */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Load data from localStorage with fallback */
function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

/** Save data to localStorage */
function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// #endregion

// #region Return Type

/** Return type of useHobbiesData hook */
export interface HobbiesDataReturn {
  /** All songs */
  songs: Song[];
  /** Add a new song */
  addSong: (song: Omit<Song, 'id'>) => void;
  /** Update an existing song */
  updateSong: (id: string, updates: Partial<Song>) => void;
  /** Delete a song */
  deleteSong: (id: string) => void;

  /** All setlists */
  setlists: Setlist[];
  /** Add a new setlist */
  addSetlist: (setlist: Omit<Setlist, 'id' | 'createdAt'>) => void;
  /** Update an existing setlist */
  updateSetlist: (id: string, updates: Partial<Setlist>) => void;
  /** Delete a setlist */
  deleteSetlist: (id: string) => void;

  /** All musicians */
  musicians: Musician[];
  /** Add a new musician */
  addMusician: (musician: Omit<Musician, 'id'>) => void;
  /** Update an existing musician */
  updateMusician: (id: string, updates: Partial<Musician>) => void;
  /** Delete a musician */
  deleteMusician: (id: string) => void;

  /** All performances */
  performances: Performance[];
  /** Add a new performance */
  addPerformance: (perf: Omit<Performance, 'id'>) => void;
  /** Update an existing performance */
  updatePerformance: (id: string, updates: Partial<Performance>) => void;
  /** Delete a performance */
  deletePerformance: (id: string) => void;

  /** All hobbies */
  hobbies: Hobby[];
  /** Add a new hobby */
  addHobby: (hobby: Omit<Hobby, 'id'>) => void;
  /** Update an existing hobby */
  updateHobby: (id: string, updates: Partial<Hobby>) => void;
  /** Delete a hobby */
  deleteHobby: (id: string) => void;
}

// #endregion

// #region Hook

/**
 * useHobbiesData — CRUD hook for managing all singer toolkit data.
 * All data is persisted to localStorage.
 *
 * @returns {HobbiesDataReturn} CRUD methods and state
 */
export function useHobbiesData(): HobbiesDataReturn {
  const [songs, setSongs] = useState<Song[]>(() => {
    const fromStorage = loadFromStorage<Song>(HOBBIES_STORAGE_KEYS.SONGS, []);
    if (fromStorage.length === 0) return SEED_SONGS;

    // IDs of old seeds that were replaced (wrong artist/data)
    const deprecatedIds = new Set(['s1', 's2', 's3', 's4', 's5']);
    const seedIds = new Set(SEED_SONGS.map(s => s.id));

    // Remove deprecated old seeds, keep user-added songs
    let merged = fromStorage.filter(s => !deprecatedIds.has(s.id));

    // Update existing seed songs with latest data (URLs, chords, etc.)
    merged = merged.map(s => {
      if (seedIds.has(s.id)) {
        const seed = SEED_SONGS.find(sd => sd.id === s.id)!;
        return { ...s, ...seed };
      }
      return s;
    });

    // Add any new seeds not yet in storage
    for (const seed of SEED_SONGS) {
      if (!merged.some(s => s.id === seed.id)) {
        merged.push(seed);
      }
    }

    saveToStorage(HOBBIES_STORAGE_KEYS.SONGS, merged);
    return merged;
  });
  const [setlists, setSetlists] = useState<Setlist[]>(() =>
    loadFromStorage<Setlist>(HOBBIES_STORAGE_KEYS.SETLISTS, [])
  );
  const [musicians, setMusicians] = useState<Musician[]>(() =>
    loadFromStorage<Musician>(HOBBIES_STORAGE_KEYS.MUSICIANS, SEED_MUSICIANS)
  );
  const [performances, setPerformances] = useState<Performance[]>(() =>
    loadFromStorage<Performance>(HOBBIES_STORAGE_KEYS.PERFORMANCES, [])
  );
  const [hobbies, setHobbies] = useState<Hobby[]>(() =>
    loadFromStorage<Hobby>(HOBBIES_STORAGE_KEYS.HOBBIES, SEED_HOBBIES)
  );

  // Persist on change
  useEffect(() => { saveToStorage(HOBBIES_STORAGE_KEYS.SONGS, songs); }, [songs]);
  useEffect(() => { saveToStorage(HOBBIES_STORAGE_KEYS.SETLISTS, setlists); }, [setlists]);
  useEffect(() => { saveToStorage(HOBBIES_STORAGE_KEYS.MUSICIANS, musicians); }, [musicians]);
  useEffect(() => { saveToStorage(HOBBIES_STORAGE_KEYS.PERFORMANCES, performances); }, [performances]);
  useEffect(() => { saveToStorage(HOBBIES_STORAGE_KEYS.HOBBIES, hobbies); }, [hobbies]);

  // Songs CRUD
  const addSong = useCallback((song: Omit<Song, 'id'>) => {
    setSongs(prev => [...prev, { ...song, id: generateId() }]);
  }, []);
  const updateSong = useCallback((id: string, updates: Partial<Song>) => {
    setSongs(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);
  const deleteSong = useCallback((id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id));
  }, []);

  // Setlists CRUD
  const addSetlist = useCallback((setlist: Omit<Setlist, 'id' | 'createdAt'>) => {
    setSetlists(prev => [...prev, { ...setlist, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);
  const updateSetlist = useCallback((id: string, updates: Partial<Setlist>) => {
    setSetlists(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);
  const deleteSetlist = useCallback((id: string) => {
    setSetlists(prev => prev.filter(s => s.id !== id));
  }, []);

  // Musicians CRUD
  const addMusician = useCallback((musician: Omit<Musician, 'id'>) => {
    setMusicians(prev => [...prev, { ...musician, id: generateId() }]);
  }, []);
  const updateMusician = useCallback((id: string, updates: Partial<Musician>) => {
    setMusicians(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);
  const deleteMusician = useCallback((id: string) => {
    setMusicians(prev => prev.filter(m => m.id !== id));
  }, []);

  // Performances CRUD
  const addPerformance = useCallback((perf: Omit<Performance, 'id'>) => {
    setPerformances(prev => [...prev, { ...perf, id: generateId() }]);
  }, []);
  const updatePerformance = useCallback((id: string, updates: Partial<Performance>) => {
    setPerformances(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);
  const deletePerformance = useCallback((id: string) => {
    setPerformances(prev => prev.filter(p => p.id !== id));
  }, []);

  // Hobbies CRUD
  const addHobby = useCallback((hobby: Omit<Hobby, 'id'>) => {
    setHobbies(prev => [...prev, { ...hobby, id: generateId() }]);
  }, []);
  const updateHobby = useCallback((id: string, updates: Partial<Hobby>) => {
    setHobbies(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);
  const deleteHobby = useCallback((id: string) => {
    setHobbies(prev => prev.filter(h => h.id !== id));
  }, []);

  return {
    songs, addSong, updateSong, deleteSong,
    setlists, addSetlist, updateSetlist, deleteSetlist,
    musicians, addMusician, updateMusician, deleteMusician,
    performances, addPerformance, updatePerformance, deletePerformance,
    hobbies, addHobby, updateHobby, deleteHobby,
  };
}

// #endregion
