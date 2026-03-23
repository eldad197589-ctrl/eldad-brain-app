/* ============================================
   FILE: SetlistManager.tsx
   PURPOSE: SetlistManager component
   DEPENDENCIES: react, lucide-react
   EXPORTS: SetlistManager (default)
   ============================================ */
/**
 * FILE: SetlistManager.tsx
 * PURPOSE: Create, manage, and share setlists — curate songs from the repertoire
 * DEPENDENCIES: react, lucide-react, ../types, ../constants
 */

// #region Imports
import { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, X, Share2, ListMusic, Check, GripVertical, Calendar } from 'lucide-react';
import type { Song, Setlist, SetlistItem } from '../types';
// #endregion

// #region Types
/** Props for SetlistManager */
interface Props {
  /** All setlists */
  setlists: Setlist[];
  /** All songs (for picking) */
  songs: Song[];
  /** Add a setlist */
  onAdd: (s: Omit<Setlist, 'id' | 'createdAt'>) => void;
  /** Update a setlist */
  onUpdate: (id: string, updates: Partial<Setlist>) => void;
  /** Delete a setlist */
  onDelete: (id: string) => void;
}
// #endregion

// #region Share Helper
/** Copy text to clipboard */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
// #endregion

// #region Create Setlist Form

/** Form for creating a new setlist */
function CreateSetlistForm({ songs, onAdd, onCancel }: { songs: Song[]; onAdd: (s: Omit<Setlist, 'id' | 'createdAt'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [searchSong, setSearchSong] = useState('');

  const filteredSongs = useMemo(() =>
    songs.filter(s => !searchSong || s.name.includes(searchSong) || s.artist.includes(searchSong)),
    [songs, searchSong]
  );

  const toggleSong = (songId: string) => {
    setSelectedSongIds(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || selectedSongIds.length === 0) return;
    const items: SetlistItem[] = selectedSongIds.map((songId, i) => ({ songId, order: i + 1 }));
    onAdd({ name: name.trim(), description: description.trim() || undefined, eventDate: eventDate || undefined, items });
    onCancel();
  };

  return (
    <div className="hobbies-add-form glass-card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>📋 סטליסט חדש</h4>
        <button onClick={onCancel} className="hobbies-icon-btn"><X size={16} /></button>
      </div>
      <div className="hobbies-form-grid">
        <input placeholder='שם הסטליסט (למשל: "חתונה שרון") *' value={name} onChange={e => setName(e.target.value)} className="hobbies-input" />
        <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="hobbies-input" />
        <input placeholder="הערות (אופציונלי)" value={description} onChange={e => setDescription(e.target.value)} className="hobbies-input" style={{ gridColumn: '1 / -1' }} />
      </div>

      {/* Song picker */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6 }}>בחר שירים ({selectedSongIds.length} נבחרו) *</div>
        <input placeholder="חפש שיר..." value={searchSong} onChange={e => setSearchSong(e.target.value)} className="hobbies-input" style={{ width: '100%', marginBottom: 8 }} />
        <div className="hobbies-song-picker-grid">
          {filteredSongs.map(song => {
            const isSelected = selectedSongIds.includes(song.id);
            return (
              <button
                key={song.id}
                onClick={() => toggleSong(song.id)}
                className={`hobbies-song-pick-item ${isSelected ? 'selected' : ''}`}
              >
                <span>{isSelected ? '✅' : '⬜'}</span>
                <span style={{ fontWeight: 500, fontSize: '0.82rem' }}>{song.name}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>— {song.artist}</span>
                {song.key && <span style={{ fontSize: '0.7rem', color: '#a78bfa', marginRight: 'auto', direction: 'ltr' }}>{song.key}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={handleSubmit} className="hobbies-btn-primary" style={{ marginTop: 12 }}>
        <Plus size={16} /> צור סטליסט
      </button>
    </div>
  );
}

// #endregion

// #region Single Setlist Card

/** A single setlist card with share action */
function SetlistCard({ setlist, songs, onDelete }: { setlist: Setlist; songs: Song[]; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);

  /** Get song by ID */
  const getSong = useCallback((songId: string) => songs.find(s => s.id === songId), [songs]);

  /** Share this setlist */
  const handleShare = async () => {
    const url = `${window.location.origin}/setlist/${setlist.id}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /** Format date */
  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  const sortedItems = [...setlist.items].sort((a, b) => a.order - b.order);

  return (
    <div className="hobbies-setlist-card glass-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{setlist.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{setlist.items.length} שירים</span>
            {setlist.eventDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#38bdf8' }}>
                <Calendar size={12} /> {formatDate(setlist.eventDate)}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleShare} className="hobbies-share-btn" title="העתק קישור לשיתוף">
            {copied ? <><Check size={14} /> הועתק!</> : <><Share2 size={14} /> שתף</>}
          </button>
          <button onClick={() => onDelete(setlist.id)} className="hobbies-icon-btn hobbies-icon-btn-danger" title="מחק"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Song list preview */}
      <div className="hobbies-setlist-songs">
        {sortedItems.map((item, idx) => {
          const song = getSong(item.songId);
          if (!song) return null;
          return (
            <div key={item.songId} className="hobbies-setlist-song-row">
              <span className="hobbies-setlist-num">{idx + 1}</span>
              <GripVertical size={12} color="#334155" />
              <span style={{ fontWeight: 500, fontSize: '0.82rem', flex: 1 }}>{song.name}</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{song.artist}</span>
              {song.key && <span className="hobbies-key-badge" style={{ fontSize: '0.65rem' }}>{song.key}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// #endregion

// #region Component

/**
 * SetlistManager — Create and manage setlists, share with musicians.
 */
export default function SetlistManager({ setlists, songs, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ListMusic size={20} color="#38bdf8" /> סטליסטים ({setlists.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="hobbies-btn-secondary">
          <Plus size={16} /> סטליסט חדש
        </button>
      </div>

      {showForm && <CreateSetlistForm songs={songs} onAdd={(s) => { onAdd(s); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {setlists.map(setlist => (
          <SetlistCard key={setlist.id} setlist={setlist} songs={songs} onDelete={onDelete} />
        ))}
        {setlists.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            📋 אין סטליסטים — צור רשימת שירים ראשונה ושתף עם הנגנים!
          </div>
        )}
      </div>
    </div>
  );
}

// #endregion
