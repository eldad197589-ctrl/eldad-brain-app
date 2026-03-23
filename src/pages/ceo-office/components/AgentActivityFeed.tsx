/**
 * AgentActivityFeed — Live Agent Activity Dashboard
 *
 * Shows what agents are doing RIGHT NOW when Eldad opens the Brain.
 * Displays triggers, active work, completed items, and items awaiting CEO.
 *
 * Features:
 * - Live activity feed (newest first)
 * - Trigger indicators (email, document, deadline, manual)
 * - Agent status badges (working, done, waiting, error)
 * - Auto-updating timestamps
 * - Filter by status
 */

import { useState, useMemo } from 'react';
import {
  Activity, Mail, FileUp, Clock, User,
  CheckCircle, Loader2, AlertTriangle, Eye,
  ChevronDown, ChevronUp, Zap, Bell,
} from 'lucide-react';

// #region Types

type TriggerType = 'email' | 'document' | 'deadline' | 'manual' | 'form' | 'schedule';
type ActivityStatus = 'working' | 'done' | 'waiting_ceo' | 'waiting_client' | 'error';

interface ActivityItem {
  id: string;
  agentEmoji: string;
  agentName: string;
  description: string;
  trigger: TriggerType;
  triggerDetail: string;
  status: ActivityStatus;
  clientName?: string;
  processName: string;
  timestamp: string;
  output?: string;
}

// #endregion

// #region Trigger Config

const TRIGGER_CONFIG: Record<TriggerType, { icon: React.ReactNode; label: string; color: string }> = {
  email:    { icon: <Mail size={12} />,    label: 'מייל',    color: '#3b82f6' },
  document: { icon: <FileUp size={12} />,  label: 'מסמך',    color: '#8b5cf6' },
  deadline: { icon: <Clock size={12} />,   label: 'דדליין',  color: '#f59e0b' },
  manual:   { icon: <User size={12} />,    label: 'ידני',    color: '#c9a84c' },
  form:     { icon: <FileUp size={12} />,  label: 'טופס',    color: '#10b981' },
  schedule: { icon: <Clock size={12} />,   label: 'תזמון',   color: '#06b6d4' },
};

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; bg: string }> = {
  working:        { label: 'עובד',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  done:           { label: 'הושלם',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  waiting_ceo:    { label: 'ממתין לך',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  waiting_client: { label: 'ממתין ללקוח', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  error:          { label: 'בעיה',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

// #endregion

// #region Demo Data — Simulated Activity (Replace with real triggers later)

const ACTIVITY_FEED: ActivityItem[] = [
  {
    id: 'AF-001', agentEmoji: '📥', agentName: 'סוכן איסוף',
    description: 'קיבל מייל מפקיד שומה — מכתב תזכורת חוב עבור דוד שמעון',
    trigger: 'email', triggerDetail: 'income-tax@gov.il',
    status: 'waiting_ceo', clientName: 'דוד שמעון (אבא)', processName: 'ביטול קנסות',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    output: 'המכתב מצורף — דורש תשומת לב',
  },
  {
    id: 'AF-002', agentEmoji: '🔍', agentName: 'סוכן סריקה',
    description: 'סורק מסמכים שהועלו ע"י לקוח דרך אזור אישי',
    trigger: 'document', triggerDetail: 'אזור אישי — ברבי ענבר',
    status: 'working', clientName: 'ברבי ענבר', processName: 'הצהרת הון',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'AF-003', agentEmoji: '⏰', agentName: 'סוכן התראה',
    description: 'דדליין מתקרב — הגשת דוח שנתי 2024 עבור אנריקה',
    trigger: 'deadline', triggerDetail: 'דדליין: 31/03/2026',
    status: 'waiting_ceo', clientName: 'אנריקה', processName: 'דוח שנתי',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    output: 'נותרו 12 ימים להגשה',
  },
  {
    id: 'AF-004', agentEmoji: '🧪', agentName: 'בוט בדיקות',
    description: 'השלים בדיקת QA על מכתב ביטול קנסות — תקין ומוכן',
    trigger: 'schedule', triggerDetail: 'בדיקה תקופתית 09:00',
    status: 'done', clientName: 'דוד שמעון (אבא)', processName: 'ביטול קנסות',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    output: 'צ\'קליסט מלא — 12/12 עברו',
  },
  {
    id: 'AF-005', agentEmoji: '📊', agentName: 'סוכן ניתוח',
    description: 'מנתח דוח רווח הון שהתקבל — חישוב מס אוטומטי',
    trigger: 'email', triggerDetail: 'broker@ils.co.il',
    status: 'working', processName: 'רווח הון',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'AF-006', agentEmoji: '📥', agentName: 'סוכן קליטה',
    description: 'ליד חדש מילא טופס באתר — נפתח תיק אוטומטית',
    trigger: 'form', triggerDetail: 'טופס יצירת קשר — אתר',
    status: 'done', clientName: 'ליד חדש', processName: 'קליטת לקוח',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    output: 'תיק ליד נפתח — ממתין לשיחה ראשונית',
  },
  {
    id: 'AF-007', agentEmoji: '✍️', agentName: 'סוכן ניסוח',
    description: 'מכין מכתב הסבר לפקיד שומה — ביטול קנסות 2023-2024',
    trigger: 'manual', triggerDetail: 'הוראת CEO',
    status: 'working', clientName: 'דוד שמעון (אבא)', processName: 'ביטול קנסות',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
  },
];

// #endregion

// #region Helpers

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

// #endregion

// #region Component

type FilterType = 'all' | 'working' | 'waiting_ceo' | 'done';

export default function AgentActivityFeed() {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return ACTIVITY_FEED;
    return ACTIVITY_FEED.filter(a => a.status === filter);
  }, [filter]);

  // Stats
  const stats = useMemo(() => ({
    working: ACTIVITY_FEED.filter(a => a.status === 'working').length,
    waitingCeo: ACTIVITY_FEED.filter(a => a.status === 'waiting_ceo').length,
    done: ACTIVITY_FEED.filter(a => a.status === 'done').length,
    total: ACTIVITY_FEED.length,
  }), []);

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(16,185,129,0.15)' : 'none',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.04), transparent)',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Activity size={20} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
            📡 פעילות סוכנים — LIVE
          </h3>
          {stats.working > 0 && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px',
              borderRadius: 12, background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
              animation: 'pulse 2s infinite',
            }}>
              {stats.working} עובדים עכשיו
            </span>
          )}
          {stats.waitingCeo > 0 && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px',
              borderRadius: 12, background: 'rgba(245,158,11,0.15)', color: '#fbbf24',
            }}>
              <Bell size={10} style={{ marginLeft: 3 }} />
              {stats.waitingCeo} ממתינים לך
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </div>

      {expanded && (
        <div style={{ padding: '12px 20px 20px' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {([
              { key: 'all' as FilterType, label: `הכל (${stats.total})`, color: '#94a3b8' },
              { key: 'working' as FilterType, label: `עובדים (${stats.working})`, color: '#3b82f6' },
              { key: 'waiting_ceo' as FilterType, label: `ממתינים לך (${stats.waitingCeo})`, color: '#f59e0b' },
              { key: 'done' as FilterType, label: `הושלמו (${stats.done})`, color: '#10b981' },
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '5px 12px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 600,
                  border: '1px solid', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  background: filter === f.key ? `${f.color}15` : 'transparent',
                  borderColor: filter === f.key ? `${f.color}40` : 'rgba(255,255,255,0.08)',
                  color: filter === f.key ? f.color : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(item => {
              const triggerCfg = TRIGGER_CONFIG[item.trigger];
              const statusCfg = STATUS_CONFIG[item.status];

              return (
                <div key={item.id} style={{
                  display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12,
                  background: item.status === 'waiting_ceo' ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.status === 'waiting_ceo' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.2s',
                }}>
                  {/* Agent emoji + status indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 40 }}>
                    <span style={{
                      fontSize: '1.4rem',
                      animation: item.status === 'working' ? 'pulse 1.5s infinite' : undefined,
                    }}>
                      {item.agentEmoji}
                    </span>
                    {item.status === 'working' && <Loader2 size={14} color="#3b82f6" className="spin" style={{ animation: 'spin 1s linear infinite' }} />}
                    {item.status === 'done' && <CheckCircle size={14} color="#10b981" />}
                    {item.status === 'waiting_ceo' && <AlertTriangle size={14} color="#f59e0b" />}
                    {item.status === 'error' && <AlertTriangle size={14} color="#ef4444" />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    {/* Top row: agent name + trigger */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>
                          {item.agentName}
                        </span>
                        {item.clientName && (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            — {item.clientName}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Trigger badge */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px',
                          borderRadius: 6, background: `${triggerCfg.color}15`,
                          color: triggerCfg.color, border: `1px solid ${triggerCfg.color}30`,
                        }}>
                          {triggerCfg.icon} {triggerCfg.label}
                        </span>
                        {/* Status badge */}
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px',
                          borderRadius: 6, background: statusCfg.bg, color: statusCfg.color,
                        }}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: 4 }}>
                      {item.description}
                    </div>

                    {/* Output (if any) */}
                    {item.output && (
                      <div style={{
                        fontSize: '0.7rem', color: '#34d399', marginBottom: 4,
                        padding: '4px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.06)',
                        border: '1px solid rgba(16,185,129,0.1)',
                      }}>
                        ✅ {item.output}
                      </div>
                    )}

                    {/* Bottom row: trigger detail + time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {triggerCfg.icon} {item.triggerDetail}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#475569' }}>
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>

                    {/* CEO action button for waiting items */}
                    {item.status === 'waiting_ceo' && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                        <button style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '5px 14px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                          color: '#fbbf24', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                        }}>
                          <Eye size={12} /> צפה ואשר
                        </button>
                        <button style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '5px 14px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                          color: '#34d399', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                        }}>
                          <Zap size={12} /> אשר ישירות
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// #endregion
