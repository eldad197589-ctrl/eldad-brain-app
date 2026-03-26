/* ============================================
   FILE: ProcessLauncher.tsx
   PURPOSE: ProcessLauncher component
   DEPENDENCIES: react, lucide-react
   EXPORTS: ProcessLauncher (default)
   ============================================ */
/**
 * ProcessLauncher — Brain Process Command Center
 *
 * Shows all available processes from the registry with search,
 * domain filtering, and launch capability.
 * This is the core "Control Tower" addition to CEO Office.
 *
 * @example
 * <ProcessLauncher onLaunch={(id) => navigate(`/flow/${id}`)} />
 */

// #region Imports
import { useState, useMemo } from 'react';
import { Search, Zap, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { PROCESS_REGISTRY, findProcessByKeyword, getDomainStats } from '../../../data/processRegistry';
import type { BrainDomain } from '../../../data/brainTypes';
// #endregion

// #region Types
interface Props {
  /** Callback when user launches a process */
  onLaunch: (processId: string) => void;
}

const DOMAIN_CONFIG: Record<BrainDomain, { label: string; emoji: string; color: string }> = {
  employee: { label: 'עובדים', emoji: '👷', color: '#34d399' },
  accounting: { label: 'חשבונאות', emoji: '📊', color: '#22d3ee' },
  legal: { label: 'משפטי', emoji: '⚖️', color: '#a78bfa' },
  reports: { label: 'דוחות', emoji: '📋', color: '#f59e0b' },
  core: { label: 'ליבה', emoji: '🧠', color: '#06b6d4' },
  support: { label: 'תמיכה', emoji: '🔧', color: '#94a3b8' },
};
// #endregion

// #region Component
/** ProcessLauncher component — ProcessLauncher component */
export default function ProcessLauncher({ onLaunch }: Props) {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<BrainDomain | 'all'>('all');
  const [expanded, setExpanded] = useState(true);

  const domainStats = useMemo(() => getDomainStats(), []);

  const filteredProcesses = useMemo(() => {
    let results = search.trim()
      ? findProcessByKeyword(search)
      : [...PROCESS_REGISTRY];

    if (selectedDomain !== 'all') {
      results = results.filter(p => p.domain === selectedDomain);
    }

    // Exclude core router from launch list
    return results.filter(p => p.id !== 'brain_router');
  }, [search, selectedDomain]);

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: expanded ? 16 : 0 }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} color="#7C3AED" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🧠 הפעלת תהליך</h3>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
            borderRadius: 10, background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
          }}>
            {PROCESS_REGISTRY.length - 1} תהליכים
          </span>
        </div>
        {expanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
      </div>

      {expanded && (
        <>
          {/* Search Bar (Brain Router v1) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '8px 12px', marginBottom: 12,
          }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="חפש תהליך... (למשל: רווח הון, מלחמה, שכר)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Domain Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <button
              onClick={() => setSelectedDomain('all')}
              style={{
                padding: '4px 12px', borderRadius: 14, fontSize: '0.72rem', fontWeight: 600,
                border: '1px solid', cursor: 'pointer',
                background: selectedDomain === 'all' ? 'rgba(124,58,237,0.2)' : 'transparent',
                borderColor: selectedDomain === 'all' ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                color: selectedDomain === 'all' ? '#a78bfa' : '#64748b',
              }}
            >
              הכול ({PROCESS_REGISTRY.length - 1})
            </button>
            {(Object.keys(DOMAIN_CONFIG) as BrainDomain[]).map(domain => {
              const count = domainStats[domain] || 0;
              if (count === 0 || domain === 'core') return null;
              const cfg = DOMAIN_CONFIG[domain];
              return (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain === selectedDomain ? 'all' : domain)}
                  style={{
                    padding: '4px 12px', borderRadius: 14, fontSize: '0.72rem', fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    background: selectedDomain === domain ? `${cfg.color}22` : 'transparent',
                    borderColor: selectedDomain === domain ? cfg.color : 'rgba(255,255,255,0.1)',
                    color: selectedDomain === domain ? cfg.color : '#64748b',
                  }}
                >
                  {cfg.emoji} {cfg.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Process List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
            {filteredProcesses.map(process => {
              const cfg = DOMAIN_CONFIG[process.domain];
              return (
                <div
                  key={process.id}
                  onClick={() => onLaunch(process.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${cfg.color}11`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}33`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                      borderRadius: 8, background: `${cfg.color}18`, color: cfg.color,
                    }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>
                      {process.name}
                    </span>
                  </div>
                  <ExternalLink size={14} color="#64748b" />
                </div>
              );
            })}

            {filteredProcesses.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: '0.85rem' }}>
                לא נמצאו תהליכים ל-&quot;{search}&quot;
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
// #endregion
