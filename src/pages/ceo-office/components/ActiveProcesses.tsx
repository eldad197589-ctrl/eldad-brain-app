/* ============================================
   FILE: ActiveProcesses.tsx
   PURPOSE: ActiveProcesses component
   DEPENDENCIES: react, lucide-react
   EXPORTS: ActiveProcesses (default)
   ============================================ */
/**
 * ActiveProcesses — Shows currently active/recent brain processes
 *
 * Displays a live feed of process statuses with state indicators,
 * domain tags, and quick actions. Persisted in localStorage.
 *
 * @example
 * <ActiveProcesses onOpenProcess={(id) => navigate(`/flow/${id}`)} />
 */

// #region Imports
import { useState, useEffect, useCallback } from 'react';
import { Activity, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { BrainDomain, BrainState } from '../../../data/brainTypes';
// #endregion

// #region Types
interface ActiveProcess {
  id: string;
  processId: string;
  processName: string;
  domain: BrainDomain;
  state: BrainState;
  clientName?: string;
  startedAt: string;
  lastUpdated: string;
}

interface Props {
  onOpenProcess: (processId: string) => void;
}

const STORAGE_KEY = 'brain-active-processes';

const STATE_CONFIG: Record<BrainState, { label: string; color: string; icon: string }> = {
  draft: { label: 'טיוטה', color: '#64748b', icon: '📝' },
  collecting_data: { label: 'איסוף מידע', color: '#3b82f6', icon: '📥' },
  validating: { label: 'אימות', color: '#f59e0b', icon: '✅' },
  under_analysis: { label: 'בניתוח', color: '#8b5cf6', icon: '📊' },
  awaiting_decision: { label: 'ממתין להחלטה', color: '#ef4444', icon: '⚖️' },
  generating_output: { label: 'מייצר פלט', color: '#06b6d4', icon: '✍️' },
  under_review: { label: 'בבדיקה', color: '#f97316', icon: '🔎' },
  ready_for_submission: { label: 'מוכן להגשה', color: '#10b981', icon: '✅' },
  completed: { label: 'הושלם', color: '#34d399', icon: '🏁' },
  blocked: { label: 'חסום', color: '#ef4444', icon: '🚫' },
};

const DOMAIN_EMOJI: Record<BrainDomain, string> = {
  employee: '👷', accounting: '📊', legal: '⚖️',
  reports: '📋', core: '🧠', support: '🔧',
};
// #endregion

// #region Component
export default function ActiveProcesses({ onOpenProcess }: Props) {
  const [processes, setProcesses] = useState<ActiveProcess[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) try { return JSON.parse(raw); } catch { /* ignore */ }
    // Seed with demo data
    return [
      {
        id: 'AP-001', processId: 'capital_gains', processName: 'רווח הון ממקרקעין בחו"ל',
        domain: 'accounting', state: 'under_review', clientName: 'הלמן',
        startedAt: '2026-03-01', lastUpdated: '2026-03-15',
      },
      {
        id: 'AP-002', processId: 'guardian_pro', processName: 'אפוטרופוס',
        domain: 'legal', state: 'completed', clientName: 'אנריקה',
        startedAt: '2025-12-01', lastUpdated: '2026-02-28',
      },
      {
        id: 'AP-003', processId: 'war_compensation', processName: 'פיצויי מלחמה',
        domain: 'accounting', state: 'collecting_data',
        startedAt: '2026-03-10', lastUpdated: '2026-03-16',
      },
    ];
  });

  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
  }, [processes]);

  const removeProcess = useCallback((id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  }, []);

  const activeCount = processes.filter(p => p.state !== 'completed').length;

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: expanded ? 14 : 0 }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>תהליכים פעילים</h3>
          {activeCount > 0 && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#34d399',
              animation: 'pulse 2s infinite',
            }}>
              {activeCount} פעילים
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {processes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: '0.85rem' }}>
              אין תהליכים פעילים — הפעל תהליך חדש מהפאנל למעלה
            </div>
          ) : (
            processes.map(proc => {
              const stateCfg = STATE_CONFIG[proc.state];
              return (
                <div
                  key={proc.id}
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${stateCfg.color}22`,
                  }}
                >
                  {/* Top Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{DOMAIN_EMOJI[proc.domain]}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>
                        {proc.processName}
                      </span>
                      {proc.clientName && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                          — {proc.clientName}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenProcess(proc.processId); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        title="פתח תהליך"
                      >
                        <ExternalLink size={14} color="#64748b" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeProcess(proc.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        title="הסר"
                      >
                        <Trash2 size={14} color="#64748b" />
                      </button>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                      borderRadius: 12, background: `${stateCfg.color}18`, color: stateCfg.color,
                    }}>
                      {stateCfg.icon} {stateCfg.label}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      עודכן: {new Date(proc.lastUpdated).toLocaleDateString('he-IL')}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#475569', marginRight: 'auto' }}>
                      {proc.id}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
// #endregion
