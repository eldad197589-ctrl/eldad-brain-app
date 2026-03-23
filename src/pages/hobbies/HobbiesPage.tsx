/**
 * FILE: HobbiesPage.tsx
 * PURPOSE: Orchestrator — tab-based layout for the professional singer toolkit
 * DEPENDENCIES: ./hooks, ./components/*
 */

// #region Imports
import { useState, useMemo } from 'react';
import { Mic, Sparkles, Music, ListMusic, Users, Calendar, Heart, Guitar } from 'lucide-react';
import { useHobbiesData } from './hooks';
import SongList from './components/SongList';
import SetlistManager from './components/SetlistManager';
import MusicianList from './components/MusicianList';
import PerformanceList from './components/PerformanceList';
import HobbyCard from './components/HobbyCard';
import BandProfile from './components/BandProfile';
// #endregion

// #region Tab Config

/** Available tabs */
type TabId = 'repertoire' | 'band' | 'setlists' | 'musicians' | 'performances' | 'hobbies';

/** Tab definition */
interface TabDef {
  /** Tab identifier */
  id: TabId;
  /** Tab label */
  label: string;
  /** Tab icon component */
  icon: typeof Music;
  /** Icon color */
  color: string;
}

/** All tabs */
const TABS: TabDef[] = [
  { id: 'repertoire', label: 'רפרטואר', icon: Music, color: '#f472b6' },
  { id: 'band', label: 'צ\u0027ארלי בראון', icon: Guitar, color: '#f59e0b' },
  { id: 'setlists', label: 'סטליסטים', icon: ListMusic, color: '#38bdf8' },
  { id: 'musicians', label: 'נגנים', icon: Users, color: '#a78bfa' },
  { id: 'performances', label: 'הופעות', icon: Calendar, color: '#fbbf24' },
  { id: 'hobbies', label: 'תחביבים', icon: Heart, color: '#4ade80' },
];

// #endregion

// #region Component

/**
 * HobbiesPage — Orchestrator for the professional singer toolkit.
 * Tab-based layout: רפרטואר | סטליסטים | נגנים | הופעות | תחביבים
 */
export default function HobbiesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('repertoire');

  const {
    songs, addSong, deleteSong,
    setlists, addSetlist, updateSetlist, deleteSetlist,
    musicians, addMusician, deleteMusician,
    performances, addPerformance, updatePerformance, deletePerformance,
    hobbies, addHobby, updateHobby, deleteHobby,
  } = useHobbiesData();

  /** Songs belonging to צ'ארלי בראון (separated) */
  const bandSongs = useMemo(() => songs.filter(s => s.artist.includes('צ') && s.artist.includes('ארלי בראון')), [songs]);
  /** All other songs (for repertoire tab) */
  const repertoireSongs = useMemo(() => songs.filter(s => !(s.artist.includes('צ') && s.artist.includes('ארלי בראון'))), [songs]);

  return (
    <div className="hobbies-page">
      {/* Page Header */}
      <div className="hobbies-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div className="hobbies-hero-icon">
            <Mic size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
              אלדד — זמר ומוזיקה
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#fbbf24" />
              ערכת זמר מקצועית — רפרטואר, סטליסטים, ונגנים
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="hobbies-stats">
          <div className="hobbies-stat">
            <div className="hobbies-stat-num" style={{ color: '#f472b6' }}>{songs.length}</div>
            <div className="hobbies-stat-label">שירים</div>
          </div>
          <div className="hobbies-stat">
            <div className="hobbies-stat-num" style={{ color: '#38bdf8' }}>{setlists.length}</div>
            <div className="hobbies-stat-label">סטליסטים</div>
          </div>
          <div className="hobbies-stat">
            <div className="hobbies-stat-num" style={{ color: '#a78bfa' }}>{musicians.length}</div>
            <div className="hobbies-stat-label">נגנים</div>
          </div>
          <div className="hobbies-stat">
            <div className="hobbies-stat-num" style={{ color: '#fbbf24' }}>{performances.length}</div>
            <div className="hobbies-stat-label">הופעות</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hobbies-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`hobbies-tab ${isActive ? 'active' : ''}`}
              style={isActive ? { borderColor: tab.color, color: tab.color } : undefined}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <section className="hobbies-section glass-card" style={{ padding: 20 }}>
        {activeTab === 'repertoire' && (
          <SongList songs={repertoireSongs} onAdd={addSong} onDelete={deleteSong} />
        )}
        {activeTab === 'band' && (
          <BandProfile songs={bandSongs} />
        )}
        {activeTab === 'setlists' && (
          <SetlistManager
            setlists={setlists}
            songs={songs}
            onAdd={addSetlist}
            onUpdate={updateSetlist}
            onDelete={deleteSetlist}
          />
        )}
        {activeTab === 'musicians' && (
          <MusicianList musicians={musicians} onAdd={addMusician} onDelete={deleteMusician} />
        )}
        {activeTab === 'performances' && (
          <PerformanceList
            performances={performances}
            onAdd={addPerformance}
            onUpdate={updatePerformance}
            onDelete={deletePerformance}
          />
        )}
        {activeTab === 'hobbies' && (
          <HobbyCard
            hobbies={hobbies}
            onAdd={addHobby}
            onUpdate={updateHobby}
            onDelete={deleteHobby}
          />
        )}
      </section>
    </div>
  );
}

// #endregion
