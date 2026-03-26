/* ============================================
   FILE: AgentDashboard.tsx
   PURPOSE: Live agent dashboard — mission history, tool stats, CEO questions
   DEPENDENCIES: react, lucide-react, agentMemory, agentTools
   EXPORTS: AgentDashboard (default)
   ============================================ */
/**
 * AgentDashboard — Live Agent Monitoring Panel
 *
 * Shows real-time agent activity: mission history, tool usage statistics,
 * pending CEO questions, and agent notes. Data comes from agentMemory.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Activity, Wrench, MessageSquare, Brain, AlertTriangle,
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  getAgentHistory, getAgentNotes,
  type AgentRunRecord, type AgentNoteRecord,
} from '../../../services/agentMemory';
import { AGENT_TOOLS } from '../../../services/agentTools';
import { getAgentById } from '../../../data/agentRegistry';

// #region Types

interface DashboardStats {
  totalRuns: number;
  successRate: number;
  totalTools: number;
  avgDuration: number;
  toolUsage: Record<string, number>;
  pendingQuestions: number;
}

// #endregion

// #region Component

/** AgentDashboard — live monitoring panel for AI agent system */
export default function AgentDashboard() {
  const [runs, setRuns] = useState<AgentRunRecord[]>([]);
  const [notes, setNotes] = useState<AgentNoteRecord[]>([]);
  const [ceoQuestions, setCeoQuestions] = useState<Array<{ id: string; question: string; urgency: string; status: string; createdAt: string }>>([]);
  const [expanded, setExpanded] = useState(true);

  // Load data on mount
  useEffect(() => {
    getAgentHistory({ limit: 50 }).then(setRuns).catch(() => {});
    getAgentNotes({ limit: 20 }).then(setNotes).catch(() => {});

    // Load CEO questions from localStorage
    try {
      const raw = localStorage.getItem('brain_ceo_questions');
      if (raw) setCeoQuestions(JSON.parse(raw));
    } catch { /* empty */ }
  }, []);

  // Calculate stats
  const stats = useMemo<DashboardStats>(() => {
    const successful = runs.filter(r => r.success);
    const toolUsage: Record<string, number> = {};
    runs.forEach(r => r.toolsUsed.forEach(t => { toolUsage[t] = (toolUsage[t] || 0) + 1; }));

    return {
      totalRuns: runs.length,
      successRate: runs.length > 0 ? Math.round((successful.length / runs.length) * 100) : 0,
      totalTools: Object.values(toolUsage).reduce((a, b) => a + b, 0),
      avgDuration: runs.length > 0 ? Math.round(runs.reduce((a, r) => a + r.durationMs, 0) / runs.length) : 0,
      toolUsage,
      pendingQuestions: ceoQuestions.filter(q => q.status === 'pending').length,
    };
  }, [runs, ceoQuestions]);

  const pendingQs = ceoQuestions.filter(q => q.status === 'pending');
  const warnings = notes.filter(n => n.noteType === 'warning');

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.2)',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(30,41,59,0.95))',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div
        style={{
          padding: '12px 18px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(99,102,241,0.15)' : 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#818cf8" />
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#818cf8' }}>
            📊 דשבורד סוכנים
          </span>
          {stats.totalRuns > 0 && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
            }}>
              {stats.totalRuns} הרצות
            </span>
          )}
          {stats.pendingQuestions > 0 && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              background: 'rgba(239,68,68,0.15)', color: '#f87171',
              animation: 'pulse 1.5s infinite',
            }}>
              🔴 {stats.pendingQuestions} שאלות ממתינות
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </div>

      {expanded && (
        <div style={{ padding: '14px 18px' }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            <StatCard icon={<Brain size={16} />} label="הרצות" value={stats.totalRuns} color="#818cf8" />
            <StatCard icon={<CheckCircle size={16} />} label="הצלחה" value={`${stats.successRate}%`} color="#34d399" />
            <StatCard icon={<Wrench size={16} />} label="קריאות כלי" value={stats.totalTools} color="#fbbf24" />
            <StatCard icon={<Clock size={16} />} label="ממוצע (ms)" value={stats.avgDuration} color="#60a5fa" />
          </div>

          {/* CEO Questions */}
          {pendingQs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel icon={<MessageSquare size={14} />} label="שאלות ממתינות לאלדד" color="#f87171" />
              {pendingQs.slice(0, 3).map(q => (
                <div key={q.id} style={{
                  padding: '8px 12px', borderRadius: 8, marginTop: 6,
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                  fontSize: '0.82rem', color: '#f87171',
                }}>
                  👔 {q.question}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel icon={<AlertTriangle size={14} />} label="אזהרות פעילות" color="#fbbf24" />
              {warnings.slice(0, 3).map(w => (
                <div key={w.id} style={{
                  padding: '8px 12px', borderRadius: 8, marginTop: 6,
                  background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
                  fontSize: '0.82rem', color: '#fbbf24',
                }}>
                  ⚠️ {w.content.substring(0, 120)}
                </div>
              ))}
            </div>
          )}

          {/* Tool Usage */}
          {Object.keys(stats.toolUsage).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel icon={<Wrench size={14} />} label="שימוש בכלים" color="#a5b4fc" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {Object.entries(stats.toolUsage)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => (
                    <span key={name} style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      color: '#a5b4fc',
                    }}>
                      {name} ({count})
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Runs */}
          {runs.length > 0 && (
            <div>
              <SectionLabel icon={<Activity size={14} />} label="הרצות אחרונות" color="#94a3b8" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, maxHeight: 200, overflowY: 'auto' }}>
                {runs.slice(0, 8).map(r => {
                  const agent = getAgentById(r.agentId);
                  const timeAgo = getTimeAgo(r.createdAt);
                  return (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${r.success ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.15)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.9rem' }}>{agent?.emoji || '🤖'}</span>
                        {r.success
                          ? <CheckCircle size={12} color="#34d399" />
                          : <XCircle size={12} color="#f87171" />}
                        <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                          {r.stepDescription?.substring(0, 50) || r.agentId}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {r.toolsUsed.length > 0 && (
                          <span style={{ fontSize: '0.65rem', color: '#818cf8' }}>
                            🔧{r.toolsUsed.length}
                          </span>
                        )}
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                          {r.durationMs}ms · {timeAgo}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {runs.length === 0 && pendingQs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: '0.85rem' }}>
              <Brain size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
              <div>עדיין אין נתוני הרצה — הפעל משימה דרך "🚀 הפעל סוכנים"</div>
              <div style={{ fontSize: '0.72rem', marginTop: 4, color: '#475569' }}>
                {AGENT_TOOLS.length} כלים זמינים · מוכן לפעולה
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// #endregion

// #region Sub-Components

/** Small stats card */
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10, textAlign: 'center',
      background: `${color}08`, border: `1px solid ${color}20`,
    }}>
      <div style={{ color, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{label}</div>
    </div>
  );
}

/** Section label */
function SectionLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: '0.78rem', fontWeight: 700 }}>
      {icon} {label}
    </div>
  );
}

/** Human-readable time ago */
function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `${mins}ד`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}ש`;
  return `${Math.floor(hrs / 24)}י`;
}

// #endregion
