/* ============================================
   FILE: MusicianSignup.tsx
   PURPOSE: MusicianSignup component
   DEPENDENCIES: react, lucide-react
   EXPORTS: MusicianSignup (default)
   ============================================ */
/**
 * FILE: MusicianSignup.tsx
 * PURPOSE: Standalone public page for musicians/audience to sign up and select songs they can perform
 * DEPENDENCIES: react, lucide-react, ../types, ../constants, ./components/MusicianSignupForm, ./components/SongSelector
 */

// #region Imports
import { useState, useCallback, useMemo } from 'react';
import { Mic, Send, CheckCircle, Music, Sparkles, ArrowRight } from 'lucide-react';
import { SEED_SONGS, HOBBIES_STORAGE_KEYS } from './constants';
import type { Song } from './types';
import MusicianSignupForm from './components/MusicianSignupForm';
import type { SignupFormData } from './components/MusicianSignupForm';
import SongSelector from './components/SongSelector';
// #endregion

// #region Storage

/** localStorage key for musician signups */
const SIGNUP_STORAGE_KEY = 'musician_signups';

/** A saved signup record */
interface SignupRecord {
  /** Unique ID */
  id: string;
  /** Form data */
  formData: SignupFormData;
  /** Selected song IDs */
  selectedSongIds: string[];
  /** Submission timestamp */
  submittedAt: string;
}

/** Save signup to localStorage */
function saveSignup(record: SignupRecord): void {
  try {
    const raw = localStorage.getItem(SIGNUP_STORAGE_KEY);
    const existing: SignupRecord[] = raw ? JSON.parse(raw) : [];
    existing.push(record);
    localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify([record]));
  }
}

/** Load songs from the main system's localStorage (full sync) */
function loadSongsFromSystem(): Song[] {
  try {
    const raw = localStorage.getItem(HOBBIES_STORAGE_KEYS.SONGS);
    if (raw) {
      const parsed = JSON.parse(raw) as Song[];
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return SEED_SONGS;
}

/** Save a new song to the main system's localStorage */
function addSongToSystem(song: Song): void {
  try {
    const raw = localStorage.getItem(HOBBIES_STORAGE_KEYS.SONGS);
    const existing: Song[] = raw ? JSON.parse(raw) : SEED_SONGS;
    existing.push(song);
    localStorage.setItem(HOBBIES_STORAGE_KEYS.SONGS, JSON.stringify(existing));
  } catch { /* ignore */ }
}

/** Generate a unique ID */
function generateId(): string {
  return 'signup_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// #endregion

// #region Steps

/** Signup flow step */
type Step = 'details' | 'songs' | 'done';

// #endregion

// #region Component

/**
 * MusicianSignup — Standalone public page (no sidebar).
 * Two-step flow: personal details → song selection → confirmation.
 */
export default function MusicianSignup() {
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    phone: '',
    instruments: [],
    role: 'musician',
    notes: '',
  });
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
  const [songs, setSongs] = useState<Song[]>(() => loadSongsFromSystem());

  /** Toggle a song selection */
  const handleToggleSong = useCallback((songId: string) => {
    setSelectedSongIds(prev => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return next;
    });
  }, []);

  /** Add a new song — saves to system localStorage for full sync */
  const handleAddSong = useCallback((songData: Omit<Song, 'id'>) => {
    const newSong: Song = { ...songData, id: generateId() };
    addSongToSystem(newSong);
    setSongs(prev => [...prev, newSong]);
    // Auto-select the new song
    setSelectedSongIds(prev => {
      const next = new Set(prev);
      next.add(newSong.id);
      return next;
    });
  }, []);

  /** Validate step 1 */
  const canProceedToSongs = formData.name.trim().length >= 2;

  /** Submit the signup */
  const handleSubmit = () => {
    const record: SignupRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      formData,
      selectedSongIds: Array.from(selectedSongIds),
      submittedAt: new Date().toISOString(),
    };
    saveSignup(record);
    setStep('done');
  };

  /** Selected song names for confirmation */
  const selectedSongNames = useMemo(() => {
    return songs
      .filter(s => selectedSongIds.has(s.id))
      .map(s => `${s.name} — ${s.artist}`);
  }, [songs, selectedSongIds]);

  return (
    <div className="signup-page" dir="rtl">
      {/* Background decoration */}
      <div className="signup-bg-glow" />

      {/* Hero */}
      <header className="signup-hero">
        <div className="signup-hero-icon">
          <Mic size={32} />
        </div>
        <h1 className="signup-title">הצטרף לרפרטואר של אלדד</h1>
        <p className="signup-subtitle">
          <Sparkles size={14} color="#fbbf24" />
          נגן? זמר? מאזין? — הוסף את עצמך ובחר שירים שאתה יכול לבצע
        </p>

        {/* Progress indicator */}
        {(() => {
          const stepIndex = step === 'details' ? 0 : step === 'songs' ? 1 : 2;
          const stepLabels = ['פרטים אישיים', 'בחירת שירים', 'אישור'];
          return (
            <div className="signup-progress">
              {stepLabels.map((label, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  {i > 0 && <div className="signup-progress-line" />}
                  <div className={`signup-progress-step ${stepIndex === i ? 'active' : stepIndex > i ? 'completed' : ''}`}>
                    <span className="signup-progress-num">{i + 1}</span>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </header>

      {/* Content */}
      <main className="signup-content">
        {/* Step 1: Personal Details */}
        {step === 'details' && (
          <div className="signup-card glass-card">
            <MusicianSignupForm formData={formData} onChange={setFormData} />

            <button
              onClick={() => setStep('songs')}
              disabled={!canProceedToSongs}
              className="signup-btn-primary"
            >
              המשך לבחירת שירים
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Song Selection */}
        {step === 'songs' && (
          <div className="signup-card glass-card">
            <SongSelector
              songs={songs}
              selectedIds={selectedSongIds}
              onToggle={handleToggleSong}
              onAddSong={handleAddSong}
            />

            <div className="signup-actions">
              <button onClick={() => setStep('details')} className="signup-btn-secondary">
                חזרה לפרטים
              </button>
              <button onClick={handleSubmit} className="signup-btn-primary">
                <Send size={16} />
                שלח הרשמה ({selectedSongIds.size} שירים)
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'done' && (
          <div className="signup-card glass-card signup-done-card">
            <div className="signup-done-icon">
              <CheckCircle size={56} color="#4ade80" />
            </div>
            <h2 style={{ margin: '12px 0 4px', fontWeight: 800, fontSize: '1.4rem' }}>
              תודה רבה, {formData.name}! 🎉
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 20 }}>
              ההרשמה שלך נשלחה בהצלחה
            </p>

            <div className="signup-summary">
              <div className="signup-summary-row">
                <span className="signup-summary-label">תפקיד:</span>
                <span>{formData.role === 'musician' ? '🎸 נגן / זמר' : '🎵 קהל / מאזין'}</span>
              </div>
              {formData.phone && (
                <div className="signup-summary-row">
                  <span className="signup-summary-label">טלפון:</span>
                  <span dir="ltr">{formData.phone}</span>
                </div>
              )}
              {formData.instruments.length > 0 && (
                <div className="signup-summary-row">
                  <span className="signup-summary-label">כלי נגינה:</span>
                  <span>{formData.instruments.length}</span>
                </div>
              )}
              <div className="signup-summary-row">
                <span className="signup-summary-label">שירים שנבחרו:</span>
                <span>{selectedSongIds.size}</span>
              </div>
            </div>

            {selectedSongNames.length > 0 && (
              <div className="signup-selected-songs-list">
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Music size={14} color="#f472b6" /> השירים שבחרת:
                </h4>
                {selectedSongNames.map((name, i) => (
                  <div key={i} className="signup-selected-song-item">
                    ♪ {name}
                  </div>
                ))}
              </div>
            )}

            {formData.notes && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(148,163,184,0.08)', borderRadius: 10, fontSize: '0.82rem', color: '#94a3b8' }}>
                💬 {formData.notes}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="signup-footer">
        <span>🎵 אלדד — זמר ומוזיקה</span>
      </footer>
    </div>
  );
}

// #endregion
