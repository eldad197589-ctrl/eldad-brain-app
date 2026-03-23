/* ============================================
   FILE: BandProfile.tsx
   PURPOSE: BandProfile component
   DEPENDENCIES: react, lucide-react
   EXPORTS: BandProfile (default)
   ============================================ */
/**
 * FILE: BandProfile.tsx
 * PURPOSE: Dedicated profile page for להקת צ'ארלי בראון with bio, photos, songs, and message board
 * DEPENDENCIES: react, lucide-react, ../types, ../hooks
 */

// #region Imports
import { useState, useRef, useEffect, useCallback } from 'react';
import { Music, Play, Pause, X, Star, Mic, Calendar, Disc, Users, MessageSquare, Send, Trash2 } from 'lucide-react';
import type { Song, MasteryLevel } from '../types';
// #endregion

// #region Storage Helpers
/** Load JSON array from localStorage */
function loadMessages(key: string): BandMessage[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}
/** Save JSON to localStorage */
function saveMessages(key: string, data: BandMessage[]) {
  localStorage.setItem(key, JSON.stringify(data));
}
// #endregion

// #region Message Board Types
/** A single message on the board */
interface BandMessage {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

const BAND_MESSAGES_KEY = 'eldad_band_messages';

// #region Types
/** Props for BandProfile */
interface Props {
  /** Band songs (filtered to צ'ארלי בראון only) */
  songs: Song[];
}
// #endregion

// #region Band Audio Player
/** Inline audio player for a song */
function BandAudioPlayer({ song, onClose }: { song: Song; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    audioRef.current?.play().catch(() => {});
  }, [song]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="band-player glass-card">
      <audio
        ref={audioRef}
        src={song.audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={togglePlay} className="band-player-btn">
          {isPlaying ? <Pause size={22} fill="#fff" /> : <Play size={22} fill="#fff" />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>🎵 {song.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="range" min={0} max={duration || 1} step={0.1}
              value={currentTime}
              onChange={e => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
              className="hobbies-audio-progress"
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', minWidth: 70, textAlign: 'left' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="hobbies-icon-btn"><X size={16} /></button>
      </div>
    </div>
  );
}
// #endregion

// #region Mastery Stars
function MasteryStars({ level }: { level: MasteryLevel }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {([1, 2, 3, 4, 5] as MasteryLevel[]).map(i => (
        <Star key={i} size={12} fill={i <= level ? '#fbbf24' : 'none'} color={i <= level ? '#fbbf24' : '#334155'} />
      ))}
    </div>
  );
}
// #endregion

// #region Component
/**
 * BandProfile — Dedicated profile for להקת צ'ארלי בראון.
 * Features hero banner, band bio, discography, and song list with audio playback.
 */
export default function BandProfile({ songs }: Props) {
  const [playingSong, setPlayingSong] = useState<Song | null>(null);

  return (
    <div className="band-profile">
      {/* Hero Banner */}
      <div className="band-hero">
        <img
          src="/songs/charlie_brown_band.png"
          alt="להקת צ'ארלי בראון"
          className="band-hero-img"
        />
        <div className="band-hero-overlay">
          <h2 className="band-hero-title">צ׳ארלי בראון</h2>
          <p className="band-hero-subtitle">רוק ישראלי · פעילה משנת 2001</p>
        </div>
      </div>

      {/* Band Info Cards */}
      <div className="band-info-grid">
        <div className="band-info-card glass-card">
          <div className="band-info-icon"><Users size={20} color="#a78bfa" /></div>
          <div>
            <div className="band-info-label">על הלהקה</div>
            <div className="band-info-text">
              להקת צ'ארלי בראון — להקת רוק/פופ ישראלית שהוקמה בשנת 2001.
              הלהקה מנגנת מוזיקה מקורית בעברית עם השפעות מרוק קלאסי, פופ, ואלטרנטיב.
              אלדד הוא הזמר והפרונטמן של הלהקה.
            </div>
          </div>
        </div>

        <div className="band-info-card glass-card">
          <div className="band-info-icon"><Disc size={20} color="#f472b6" /></div>
          <div>
            <div className="band-info-label">דיסקוגרפיה</div>
            <div className="band-info-text">
              <strong>אלבום: צ'ארלי 23</strong> — {songs.length} שירים מקוריים<br />
              סגנון: רוק/פופ ישראלי מקורי
            </div>
          </div>
        </div>

        <div className="band-info-card glass-card">
          <div className="band-info-icon"><Calendar size={20} color="#38bdf8" /></div>
          <div>
            <div className="band-info-label">שנים פעילות</div>
            <div className="band-info-text">2001 – היום</div>
          </div>
        </div>

        <div className="band-info-card glass-card">
          <div className="band-info-icon"><Mic size={20} color="#4ade80" /></div>
          <div>
            <div className="band-info-label">סגנון</div>
            <div className="band-info-text">רוק ישראלי · פופ · אלטרנטיב · שירה בעברית</div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {playingSong && (
        <BandAudioPlayer song={playingSong} onClose={() => setPlayingSong(null)} />
      )}

      {/* Song List */}
      <div className="band-songs-section">
        <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Music size={18} color="#f472b6" /> אלבום: צ'ארלי 23 ({songs.length} שירים)
        </h3>

        <div className="band-song-grid">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`band-song-card glass-card ${playingSong?.id === song.id ? 'band-song-playing' : ''}`}
              onClick={() => song.audioUrl && setPlayingSong(song)}
              style={{ cursor: song.audioUrl ? 'pointer' : 'default' }}
            >
              <div className="band-song-number">{(index + 1).toString().padStart(2, '0')}</div>
              <div style={{ flex: 1 }}>
                <div className="band-song-name">{song.name}</div>
                {song.notes && <div className="band-song-notes">{song.notes}</div>}
              </div>
              <MasteryStars level={song.mastery} />
              {song.audioUrl && (
                <button
                  className="band-song-play"
                  onClick={e => { e.stopPropagation(); setPlayingSong(song); }}
                >
                  {playingSong?.id === song.id ? <Pause size={16} fill="#f8fafc" /> : <Play size={16} fill="#f8fafc" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message Board */}
      <BandMessageBoard />

      {/* Photo Gallery Placeholder */}
      <div className="band-gallery-section">
        <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          📷 גלריית תמונות
        </h3>
        <div className="band-gallery-grid">
          <div className="band-gallery-item glass-card">
            <img src="/songs/charlie_brown_band.png" alt="צ'ארלי בראון על הבמה" className="band-gallery-img" />
            <div className="band-gallery-caption">צ'ארלי בראון על הבמה</div>
          </div>
          <div className="band-gallery-placeholder glass-card">
            <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
              📸<br /><span style={{ fontSize: '0.78rem' }}>הוסף תמונות נוספות<br />לתיקייה public/songs/</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// #endregion

// #region Message Board Component
/** לוח הודעות ללהקה */
function BandMessageBoard() {
  const [messages, setMessages] = useState<BandMessage[]>(() =>
    loadMessages(BAND_MESSAGES_KEY)
  );
  const [newText, setNewText] = useState('');
  const [author, setAuthor] = useState(() => localStorage.getItem('eldad_band_author') || '');

  const save = useCallback((updated: BandMessage[]) => {
    setMessages(updated);
    saveMessages(BAND_MESSAGES_KEY, updated);
  }, []);

  const handlePost = () => {
    const text = newText.trim();
    if (!text) return;
    const finalAuthor = author.trim() || 'אלדד';
    localStorage.setItem('eldad_band_author', finalAuthor);
    const msg: BandMessage = {
      id: `msg_${Date.now()}`,
      author: finalAuthor,
      text,
      timestamp: Date.now(),
    };
    save([msg, ...messages]);
    setNewText('');
  };

  const handleDelete = (id: string) => save(messages.filter(m => m.id !== id));

  /** Format date nicely in Hebrew */
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const day = d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
  };

  return (
    <div className="band-board-section">
      <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={18} color="#38bdf8" /> לוח הודעות
      </h3>

      {/* Post Form */}
      <div className="band-board-form glass-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="hobbies-input"
            placeholder="שם (למשל: אלדד)"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            style={{ maxWidth: 140 }}
          />
          <input
            className="hobbies-input"
            placeholder="כתוב הודעה ללהקה..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePost()}
            style={{ flex: 1 }}
          />
          <button onClick={handlePost} className="band-board-send" disabled={!newText.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="band-board-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: '0.85rem' }}>
            📋 אין הודעות עדיין — היה הראשון לכתוב!
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="band-board-msg glass-card">
            <div className="band-board-msg-header">
              <div className="band-board-msg-author">{msg.author}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="band-board-msg-time">{formatDate(msg.timestamp)}</span>
                <button onClick={() => handleDelete(msg.id)} className="hobbies-icon-btn" title="מחק">
                  <Trash2 size={13} color="#64748b" />
                </button>
              </div>
            </div>
            <div className="band-board-msg-text">{msg.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// #endregion
