/* ============================================
   FILE: ShareableSetlist.tsx
   PURPOSE: ShareableSetlist component
   DEPENDENCIES: react, react-router-dom, lucide-react
   EXPORTS: ShareableSetlist (default)
   ============================================ */
/**
 * FILE: ShareableSetlist.tsx
 * PURPOSE: Read-only, print-friendly setlist view for musicians — accessible via /setlist/:id
 * DEPENDENCIES: react, react-router-dom, ../types, ../constants
 */

// #region Imports
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, Music, ExternalLink, FileText, BookOpen } from 'lucide-react';
import type { Song, Setlist } from '../types';
import { HOBBIES_STORAGE_KEYS } from '../constants';
// #endregion

// #region Helpers

/** Load data from localStorage */
function loadData<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T[] : [];
  } catch {
    return [];
  }
}

// #endregion

// #region Component

/**
 * ShareableSetlist — Read-only, printable setlist page for musicians.
 * Loads data directly from localStorage (no props needed).
 * Accessible at /setlist/:id
 */
export default function ShareableSetlist() {
  const { id } = useParams<{ id: string }>();

  const { setlist, setlistSongs } = useMemo(() => {
    const allSetlists = loadData<Setlist>(HOBBIES_STORAGE_KEYS.SETLISTS);
    const allSongs = loadData<Song>(HOBBIES_STORAGE_KEYS.SONGS);
    const foundSetlist = allSetlists.find(s => s.id === id);

    if (!foundSetlist) return { setlist: null, songs: allSongs, setlistSongs: [] };

    const sorted = [...foundSetlist.items].sort((a, b) => a.order - b.order);
    const songsInOrder = sorted
      .map(item => ({ ...item, song: allSongs.find(s => s.id === item.songId) }))
      .filter(item => item.song);

    return { setlist: foundSetlist, songs: allSongs, setlistSongs: songsInOrder };
  }, [id]);

  /** Format date */
  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  if (!setlist) {
    return (
      <div className="shareable-setlist-page">
        <div className="shareable-empty">
          <Music size={48} color="#64748b" />
          <h2 style={{ margin: '16px 0 8px', fontSize: '1.3rem' }}>סטליסט לא נמצא</h2>
          <p style={{ color: '#64748b', margin: 0 }}>ייתכן שהקישור שגוי או שהסטליסט נמחק</p>
          <Link to="/hobbies" className="shareable-back-link" style={{ marginTop: 20 }}>
            <ArrowRight size={16} /> חזרה לאזור המוזיקה
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shareable-setlist-page">
      {/* Header */}
      <div className="shareable-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              🎤 סטליסט — דוד אלדד
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{setlist.name}</h1>
            {setlist.eventDate && (
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                📅 {formatDate(setlist.eventDate)}
              </p>
            )}
            {setlist.description && (
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{setlist.description}</p>
            )}
          </div>
          <div className="shareable-actions no-print">
            <button onClick={() => window.print()} className="shareable-print-btn">
              <Printer size={16} /> הדפס
            </button>
            <Link to="/hobbies" className="shareable-back-link">
              <ArrowRight size={16} /> חזרה
            </Link>
          </div>
        </div>
      </div>

      {/* Song Table */}
      <div className="shareable-table-wrap">
        <table className="shareable-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>שיר</th>
              <th>אמן</th>
              <th style={{ width: 70 }}>טונליות</th>
              <th style={{ width: 70 }}>טמפו</th>
              <th>אקורדים</th>
              <th style={{ width: 80 }} className="no-print">קישורים</th>
            </tr>
          </thead>
          <tbody>
            {setlistSongs.map((item, idx) => {
              const song = item.song!;
              return (
                <tr key={song.id}>
                  <td className="shareable-num">{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{song.name}</td>
                  <td style={{ color: '#94a3b8' }}>{song.artist}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#a78bfa', direction: 'ltr' }}>{song.key || '—'}</td>
                  <td style={{ textAlign: 'center', color: '#64748b', direction: 'ltr' }}>{song.tempo ? `${song.tempo}` : '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#c4b5fd', direction: 'ltr' }}>{song.chords || '—'}</td>
                  <td className="no-print">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      {song.sheetMusicUrl && <a href={song.sheetMusicUrl} target="_blank" rel="noopener noreferrer" title="תווים"><FileText size={14} color="#38bdf8" /></a>}
                      {song.lyricsUrl && <a href={song.lyricsUrl} target="_blank" rel="noopener noreferrer" title="מילים"><BookOpen size={14} color="#4ade80" /></a>}
                      {song.youtubeUrl && <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" title="YouTube"><ExternalLink size={14} color="#f472b6" /></a>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="shareable-footer no-print">
        <p>🎤 סה״כ {setlistSongs.length} שירים · נוצר על ידי דוד אלדד · המוח של אלדד</p>
      </div>
    </div>
  );
}

// #endregion
