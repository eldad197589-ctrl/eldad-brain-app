/* ============================================
   FILE: SongSelector.tsx
   PURPOSE: SongSelector component
   DEPENDENCIES: react, lucide-react
   EXPORTS: SongSelector (default)
   ============================================ */
/**
 * FILE: SongSelector.tsx
 * PURPOSE: Interactive song selector with checkboxes, search, and category filtering for musician signup
 * DEPENDENCIES: react, lucide-react, ../types, ../constants
 */

// #region Imports
import { useState, useMemo } from 'react';
import { Search, Music, Star, Check, Plus, X } from 'lucide-react';
import type { Song, SongCategory, MasteryLevel } from '../types';
import { SONG_CATEGORY_LABELS, SONG_CATEGORY_COLORS } from '../constants';
// #endregion

// #region Types

/** Props for the SongSelector component */
interface Props {
  /** All available songs to choose from */
  songs: Song[];
  /** Currently selected song IDs */
  selectedIds: Set<string>;
  /** Callback when selection changes */
  onToggle: (songId: string) => void;
  /** Callback to add a new song (optional — shows add form if provided) */
  onAddSong?: (song: Omit<Song, 'id'>) => void;
}

// #endregion

// #region Mastery Stars

/** Display mastery level as mini stars */
function MiniStars({ level }: { level: MasteryLevel }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {([1, 2, 3, 4, 5] as MasteryLevel[]).map(i => (
        <Star key={i} size={10} fill={i <= level ? '#fbbf24' : 'none'} color={i <= level ? '#fbbf24' : '#334155'} />
      ))}
    </div>
  );
}

// #endregion

// #region Component

/**
 * SongSelector — Checkbox-based song picker with search and category filters.
 * Used in the musician signup flow for selecting performable songs.
 */
export default function SongSelector({ songs, selectedIds, onToggle, onAddSong }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<SongCategory | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newCategory, setNewCategory] = useState<SongCategory>('israeli');

  /** Group songs: צ'ארלי בראון first, then by artist */
  const filteredSongs = useMemo(() => {
    const filtered = songs.filter(song => {
      const matchesSearch = !search
        || song.name.toLowerCase().includes(search.toLowerCase())
        || song.artist.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'all' || song.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort: Charlie Brown songs first, then alphabetical by artist
    return filtered.sort((a, b) => {
      const aIsCharlie = a.artist.includes('ארלי בראון');
      const bIsCharlie = b.artist.includes('ארלי בראון');
      if (aIsCharlie && !bIsCharlie) return -1;
      if (!aIsCharlie && bIsCharlie) return 1;
      return a.artist.localeCompare(b.artist) || a.name.localeCompare(b.name);
    });
  }, [songs, search, filterCategory]);

  /** Group filtered songs by artist for display */
  const groupedSongs = useMemo(() => {
    const groups: Record<string, Song[]> = {};
    for (const song of filteredSongs) {
      if (!groups[song.artist]) groups[song.artist] = [];
      groups[song.artist].push(song);
    }
    return Object.entries(groups);
  }, [filteredSongs]);

  const selectedCount = selectedIds.size;

  return (
    <div className="signup-song-selector">
      {/* Header */}
      <div className="signup-song-header">
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Music size={20} color="#f472b6" />
          בחירת שירים
        </h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selectedCount > 0 && (
            <span className="signup-selected-count">
              <Check size={14} /> {selectedCount} שירים נבחרו
            </span>
          )}
          {onAddSong && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="signup-add-song-btn"
            >
              <Plus size={14} /> שיר חדש
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 14px' }}>
        סמן שירים מהרשימה או הוסף שיר חדש 🎶
      </p>

      {/* Add Song Mini Form */}
      {showAddForm && onAddSong && (
        <div className="signup-add-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>🎵 הוסף שיר חדש</span>
            <button onClick={() => setShowAddForm(false)} className="hobbies-icon-btn"><X size={16} /></button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              placeholder="שם השיר *"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="signup-input"
              style={{ flex: 1, minWidth: 140 }}
            />
            <input
              placeholder="אמן / להקה *"
              value={newArtist}
              onChange={e => setNewArtist(e.target.value)}
              className="signup-input"
              style={{ flex: 1, minWidth: 140 }}
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as SongCategory)}
              className="signup-input"
              style={{ minWidth: 100, maxWidth: 140 }}
            >
              {Object.entries(SONG_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <button
            disabled={!newName.trim() || !newArtist.trim()}
            onClick={() => {
              onAddSong({ name: newName.trim(), artist: newArtist.trim(), category: newCategory, mastery: 3 });
              setNewName('');
              setNewArtist('');
              setShowAddForm(false);
            }}
            className="signup-btn-primary"
            style={{ marginTop: 10, padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={14} /> הוסף שיר לרפרטואר
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="hobbies-search-wrap">
          <Search size={16} color="#64748b" />
          <input
            placeholder="חיפוש שיר או אמן..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="hobbies-search-input"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterCategory('all')}
            className={`hobbies-chip ${filterCategory === 'all' ? 'active' : ''}`}
          >
            הכל
          </button>
          {Object.entries(SONG_CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key as SongCategory)}
              className={`hobbies-chip ${filterCategory === key ? 'active' : ''}`}
              style={filterCategory === key ? { borderColor: SONG_CATEGORY_COLORS[key as SongCategory] } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Song Groups */}
      <div className="signup-song-groups">
        {groupedSongs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
            לא נמצאו שירים 🔍
          </div>
        ) : (
          groupedSongs.map(([artist, artistSongs]) => (
            <div key={artist} className="signup-artist-group">
              <div className="signup-artist-label">
                {artist.includes('ארלי בראון') ? '⭐ ' : ''}{artist}
                <span className="signup-artist-count">{artistSongs.length}</span>
              </div>
              {artistSongs.map(song => {
                const isSelected = selectedIds.has(song.id);
                return (
                  <button
                    key={song.id}
                    onClick={() => onToggle(song.id)}
                    className={`signup-song-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className={`signup-checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span
                      className="hobbies-category-dot"
                      style={{ background: SONG_CATEGORY_COLORS[song.category] }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{song.name}</div>
                    </div>
                    <span className="hobbies-tag" style={{
                      background: `${SONG_CATEGORY_COLORS[song.category]}20`,
                      color: SONG_CATEGORY_COLORS[song.category],
                      borderColor: `${SONG_CATEGORY_COLORS[song.category]}40`,
                      fontSize: '0.68rem'
                    }}>
                      {SONG_CATEGORY_LABELS[song.category]}
                    </span>
                    <MiniStars level={song.mastery} />
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// #endregion
