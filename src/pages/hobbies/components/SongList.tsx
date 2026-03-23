/**
 * FILE: SongList.tsx
 * PURPOSE: Professional repertoire — display, add, filter, play songs with musical metadata
 * DEPENDENCIES: react, lucide-react, ../types, ../constants
 */

// #region Imports
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, Star, Search, X, Music, Play, Pause, BookOpen, Youtube, Mic } from 'lucide-react';
import type { Song, SongCategory, MasteryLevel, MusicalKey } from '../types';
import { SONG_CATEGORY_LABELS, SONG_CATEGORY_COLORS, MUSICAL_KEYS } from '../constants';
// #endregion

// #region Types
/** Props for the SongList component */
interface Props {
  /** List of songs to display */
  songs: Song[];
  /** Callback to add a new song */
  onAdd: (song: Omit<Song, 'id'>) => void;
  /** Callback to delete a song */
  onDelete: (id: string) => void;
}
// #endregion

// #region Helpers

/** Open YouTube search for a song */
function openYouTubeSearch(name: string, artist: string) {
  const query = encodeURIComponent(`${artist} ${name}`);
  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
}

/** Extract YouTube video ID from URL (for embedding) */
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// #endregion

// #region Mastery Stars
/** Display mastery level as stars */
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

// #region Mini Player (YouTube + Audio)

/** Player state type */
interface PlayerState {
  type: 'youtube' | 'audio';
  songName: string;
  /** YouTube video ID (for type='youtube') */
  videoId?: string;
  /** Audio file URL (for type='audio') */
  audioUrl?: string;
}

/** Dual-mode player: YouTube iframe OR HTML5 audio with controls */
function MiniPlayer({ state, onClose }: { state: PlayerState; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (state.type === 'audio' && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [state]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hobbies-mini-player glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
          {state.type === 'audio' ? <Mic size={16} color="#4ade80" /> : '🎵'} {state.songName}
        </span>
        <button onClick={onClose} className="hobbies-icon-btn"><X size={16} /></button>
      </div>

      {state.type === 'youtube' && state.videoId && (
        <iframe
          width="100%" height="200"
          src={`https://www.youtube.com/embed/${state.videoId}?autoplay=1`}
          allow="autoplay; encrypted-media" allowFullScreen
          style={{ borderRadius: 10, border: 'none' }}
          title={state.songName}
        />
      )}

      {state.type === 'audio' && state.audioUrl && (
        <div className="hobbies-audio-player">
          <audio
            ref={audioRef}
            src={state.audioUrl}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
            onEnded={() => setIsPlaying(false)}
          />
          <button onClick={togglePlay} className="hobbies-audio-play-btn">
            {isPlaying ? <Pause size={20} fill="#f8fafc" /> : <Play size={20} fill="#f8fafc" />}
          </button>
          <div className="hobbies-audio-progress-wrap">
            <input
              type="range" min={0} max={duration || 1} step={0.1}
              value={currentTime}
              onChange={e => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
              className="hobbies-audio-progress"
            />
            <div className="hobbies-audio-times">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// #endregion

// #region Add Song Form
/** Form for adding a new song with full musical metadata */
function AddSongForm({ onAdd, onCancel }: { onAdd: (song: Omit<Song, 'id'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<SongCategory>('israeli');
  const [mastery, setMastery] = useState<MasteryLevel>(3);
  const [songKey, setSongKey] = useState<MusicalKey | ''>('');
  const [tempo, setTempo] = useState('');
  const [chords, setChords] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sheetMusicUrl, setSheetMusicUrl] = useState('');
  const [lyricsUrl, setLyricsUrl] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !artist.trim()) return;
    onAdd({
      name: name.trim(), artist: artist.trim(), category, mastery,
      key: songKey || undefined,
      tempo: tempo ? parseInt(tempo) : undefined,
      chords: chords.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      sheetMusicUrl: sheetMusicUrl.trim() || undefined,
      lyricsUrl: lyricsUrl.trim() || undefined,
    });
    onCancel();
  };

  return (
    <div className="hobbies-add-form glass-card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>🎵 שיר חדש</h4>
        <button onClick={onCancel} className="hobbies-icon-btn"><X size={16} /></button>
      </div>
      <div className="hobbies-form-grid">
        <input placeholder="שם השיר *" value={name} onChange={e => setName(e.target.value)} className="hobbies-input" />
        <input placeholder="אמן / להקה *" value={artist} onChange={e => setArtist(e.target.value)} className="hobbies-input" />
        <select value={category} onChange={e => setCategory(e.target.value as SongCategory)} className="hobbies-input">
          {Object.entries(SONG_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={songKey} onChange={e => setSongKey(e.target.value as MusicalKey)} className="hobbies-input">
          <option value="">טונליות (אופציונלי)</option>
          {MUSICAL_KEYS.map(k => (<option key={k} value={k}>{k}</option>))}
        </select>
        <input type="number" placeholder="BPM (טמפו)" value={tempo} onChange={e => setTempo(e.target.value)} className="hobbies-input" min="40" max="240" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 8 }}>רמה:</span>
          {([1, 2, 3, 4, 5] as MasteryLevel[]).map(level => (
            <button key={level} onClick={() => setMastery(level)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <Star size={18} fill={level <= mastery ? '#fbbf24' : 'none'} color={level <= mastery ? '#fbbf24' : '#475569'} />
            </button>
          ))}
        </div>
        <input placeholder="אקורדים (Am - F - C - G)" value={chords} onChange={e => setChords(e.target.value)} className="hobbies-input" style={{ gridColumn: '1 / -1' }} />
        <input placeholder="קישור לתווים (URL)" value={sheetMusicUrl} onChange={e => setSheetMusicUrl(e.target.value)} className="hobbies-input" />
        <input placeholder="קישור למילים (URL)" value={lyricsUrl} onChange={e => setLyricsUrl(e.target.value)} className="hobbies-input" />

        {/* YouTube URL + Quick Search */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="קישור YouTube" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="hobbies-input" style={{ flex: 1 }} />
          <button
            type="button"
            className="hobbies-yt-search-btn"
            disabled={!name.trim()}
            onClick={() => openYouTubeSearch(name, artist)}
            title="חפש ביוטיוב"
          >
            <Youtube size={16} /> חפש ביוטיוב
          </button>
        </div>
      </div>
      <button onClick={handleSubmit} className="hobbies-btn-primary" style={{ marginTop: 12 }}>
        <Plus size={16} /> הוסף שיר
      </button>
    </div>
  );
}
// #endregion

// #region Component

/**
 * SongList — Professional repertoire with play, lyrics, YouTube search, and CRUD.
 */
export default function SongList({ songs, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<SongCategory | 'all'>('all');
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  const handleAdd = useCallback((song: Omit<Song, 'id'>) => {
    onAdd(song);
    setShowForm(false);
  }, [onAdd]);

  const handlePlay = (song: Song) => {
    // Priority: audioUrl (MP3) > youtubeUrl (embed) > YouTube search
    if (song.audioUrl) {
      setPlayerState({ type: 'audio', songName: song.name, audioUrl: song.audioUrl });
      return;
    }
    if (song.youtubeUrl) {
      const id = getYouTubeId(song.youtubeUrl);
      if (id) {
        setPlayerState({ type: 'youtube', songName: song.name, videoId: id });
        return;
      }
      // Fallback: open in new tab if it's a search URL
      window.open(song.youtubeUrl, '_blank');
    } else {
      openYouTubeSearch(song.name, song.artist);
    }
  };

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch = !search
        || song.name.toLowerCase().includes(search.toLowerCase())
        || song.artist.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'all' || song.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [songs, search, filterCategory]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Music size={20} color="#f472b6" /> רפרטואר ({songs.length} שירים)
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="hobbies-btn-secondary">
          <Plus size={16} /> שיר חדש
        </button>
      </div>

      {showForm && <AddSongForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />}

      {/* Mini Player (YouTube / Audio) */}
      {playerState && (
        <MiniPlayer
          state={playerState}
          onClose={() => setPlayerState(null)}
        />
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="hobbies-search-wrap">
          <Search size={16} color="#64748b" />
          <input placeholder="חיפוש שיר או אמן..." value={search} onChange={e => setSearch(e.target.value)} className="hobbies-search-input" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCategory('all')} className={`hobbies-chip ${filterCategory === 'all' ? 'active' : ''}`}>הכל</button>
          {Object.entries(SONG_CATEGORY_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setFilterCategory(key as SongCategory)}
              className={`hobbies-chip ${filterCategory === key ? 'active' : ''}`}
              style={filterCategory === key ? { borderColor: SONG_CATEGORY_COLORS[key as SongCategory] } : undefined}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Song Table */}
      <div className="hobbies-song-grid">
        {filteredSongs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            {songs.length === 0 ? '🎵 הרפרטואר ריק — הוסף שיר ראשון!' : 'לא נמצאו שירים'}
          </div>
        ) : (
          filteredSongs.map(song => (
            <div key={song.id} className="hobbies-song-row">
              {/* Play button */}
              <button
                onClick={() => handlePlay(song)}
                className={`hobbies-play-btn ${song.audioUrl ? 'hobbies-play-btn-audio' : ''}`}
                title={song.audioUrl ? '🎤 נגן קובץ שמע' : song.youtubeUrl ? 'נגן מ-YouTube' : 'חפש ביוטיוב'}
              >
                <Play size={14} fill="#f8fafc" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span className="hobbies-category-dot" style={{ background: SONG_CATEGORY_COLORS[song.category] }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{song.artist}</div>
                </div>
              </div>
              {/* Musical metadata */}
              {song.key && <span className="hobbies-key-badge">{song.key}</span>}
              {song.tempo && <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>{song.tempo} BPM</span>}
              {song.chords && <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontFamily: 'monospace', direction: 'ltr', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{song.chords}</span>}
              <span className="hobbies-tag" style={{ background: `${SONG_CATEGORY_COLORS[song.category]}20`, color: SONG_CATEGORY_COLORS[song.category], borderColor: `${SONG_CATEGORY_COLORS[song.category]}40` }}>
                {SONG_CATEGORY_LABELS[song.category]}
              </span>
              <MasteryStars level={song.mastery} />
              <div style={{ display: 'flex', gap: 4 }}>
                {song.lyricsUrl && <a href={song.lyricsUrl} target="_blank" rel="noopener noreferrer" className="hobbies-icon-btn" title="מילים" style={{ color: '#4ade80' }}><BookOpen size={14} /></a>}
                {song.youtubeUrl && <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hobbies-icon-btn" title="YouTube" style={{ color: '#ef4444' }}><Youtube size={14} /></a>}
                {!song.youtubeUrl && (
                  <button onClick={() => openYouTubeSearch(song.name, song.artist)} className="hobbies-icon-btn" title="חפש ביוטיוב" style={{ color: '#ef4444' }}>
                    <Youtube size={14} />
                  </button>
                )}
                <button onClick={() => onDelete(song.id)} className="hobbies-icon-btn hobbies-icon-btn-danger" title="מחק"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
// #endregion
