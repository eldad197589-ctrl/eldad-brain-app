/* ============================================
   FILE: AgentCommandCenter.tsx
   PURPOSE: AgentCommandCenter component
   DEPENDENCIES: react, react-router-dom, lucide-react
   EXPORTS: AgentCommandCenter (default)
   ============================================ */
/**
 * AgentCommandCenter — The AI-Powered Heart of CEO Office v2.0
 *
 * This replaces the static "Active Processes" with a live command center that:
 * 1. Shows real-time agent activity across all processes
 * 2. Provides quick actions (approve, reject, view, assign)
 * 3. Displays morning brief — what needs CEO attention NOW
 * 4. Agent status indicators with pulse animations
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, CheckCircle, ChevronDown, ChevronUp,
  ExternalLink, Eye, TrendingUp,
} from 'lucide-react';

/* ═══ Types ═══ */
interface AgentTask {
  id: string;
  processId: string;
  processName: string;
  clientName: string;
  agentEmoji: string;
  agentName: string;
  status: 'working' | 'waiting_ceo' | 'waiting_client' | 'done' | 'blocked';
  description: string;
  priority: 'critical' | 'high' | 'normal';
  updatedAt: string;
  actionRequired?: string;
  route?: string;
}

interface MorningBriefItem {
  emoji: string;
  text: string;
  type: 'urgent' | 'info' | 'success';
}

/* ═══ Real Active Tasks — Only what Eldad actually has on his plate ═══ */
const AGENT_TASKS: AgentTask[] = [
  {
    id: 'PC-001', processId: 'penalty_cancellation', processName: 'ביטול קנסות מס הכנסה',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '🚨', agentName: 'סוכן טריגר',
    status: 'done', description: 'שלב 1 — קבלת הודעה מאבא · מכתב חוב התקבל · התקשרת לחבר במס הכנסה',
    priority: 'normal', updatedAt: '2026-03-16T10:00:00',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-002', processId: 'penalty_cancellation', processName: 'ביטול קנסות מס הכנסה',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '🔍', agentName: 'סוכן איסוף',
    status: 'waiting_ceo', description: 'שלב 2 — כניסה לשע"מ / אזור אישי של אבא · לבדוק ממה נובע החוב',
    priority: 'high', updatedAt: '2026-03-16T21:00:00',
    actionRequired: 'להיכנס לשע"מ ולבדוק מצב חשבון מס הכנסה של אבא',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-003', processId: 'penalty_cancellation', processName: 'ביטול קנסות מס הכנסה',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '⚖️', agentName: 'סוכן החלטה',
    status: 'waiting_client', description: 'שלב 3 — תלוי בתוצאות שלב 2: הפרדה בין קנסות לחוב מס אמיתי',
    priority: 'normal', updatedAt: '2026-03-16T21:00:00',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-004', processId: 'penalty_cancellation', processName: 'ביטול קנסות — מסלול A',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '✍️', agentName: 'סוכן ניסוח',
    status: 'waiting_client', description: 'שלב 4 — כתיבת מכתב ביטול קנסות · ממתין לתוצאות שלב 2+3',
    priority: 'normal', updatedAt: '2026-03-16T21:00:00',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-005', processId: 'penalty_cancellation', processName: 'ביטול קנסות — מסלול B',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '💳', agentName: 'סוכן הגשה',
    status: 'waiting_client', description: 'שלב 5 — תשלום חוב מס אמיתי (אם ישנו) · ממתין לתוצאות שלב 2+3',
    priority: 'normal', updatedAt: '2026-03-16T21:00:00',
    route: '/flow/penalty-cancellation',
  },
];

const STATUS_CONFIG: Record<AgentTask['status'], { label: string; color: string; icon: string; pulse?: boolean }> = {
  working: { label: '🤖 עובד', color: '#3b82f6', icon: '⚡', pulse: true },
  waiting_ceo: { label: '🔴 ממתין לך!', color: '#ef4444', icon: '👔', pulse: true },
  waiting_client: { label: '⏳ ממתין ללקוח', color: '#f59e0b', icon: '👤' },
  done: { label: '✅ הושלם', color: '#10b981', icon: '🏁' },
  blocked: { label: '🚫 חסום', color: '#ef4444', icon: '⚠️', pulse: true },
};

/* ═══ Component ═══ */
export default function AgentCommandCenter() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'waiting_ceo' | 'working' | 'blocked'>('all');
  const [showBrief, setShowBrief] = useState(true);

  // Morning Brief
  const morningBrief = useMemo<MorningBriefItem[]>(() => {
    const waitingCeo = AGENT_TASKS.filter(t => t.status === 'waiting_ceo');
    const blocked = AGENT_TASKS.filter(t => t.status === 'blocked');
    const working = AGENT_TASKS.filter(t => t.status === 'working');
    const done = AGENT_TASKS.filter(t => t.status === 'done');

    const items: MorningBriefItem[] = [];

    if (waitingCeo.length > 0) {
      items.push({
        emoji: '🔴', type: 'urgent',
        text: `${waitingCeo.length} משימות ממתינות לאישור שלך — ${waitingCeo.map(t => t.clientName).join(', ')}`,
      });
    }
    if (blocked.length > 0) {
      items.push({
        emoji: '⚠️', type: 'urgent',
        text: `${blocked.length} תהליכים חסומים — נדרשת התערבות`,
      });
    }
    if (working.length > 0) {
      items.push({
        emoji: '🤖', type: 'info',
        text: `${working.length} סוכנים עובדים כרגע בשבילך`,
      });
    }
    if (done.length > 0) {
      items.push({
        emoji: '✅', type: 'success',
        text: `${done.length} תהליכים הושלמו — מוכנים לדיווח`,
      });
    }
    items.push({
      emoji: '📊', type: 'info',
      text: `משימה פעילה: ביטול קנסות דוד שמעון 2023-2024 · ${AGENT_TASKS.length} שלבים במעקב`,
    });

    return items;
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (filter === 'all') return AGENT_TASKS;
    return AGENT_TASKS.filter(t => t.status === filter);
  }, [filter]);

  // Stats
  const waitingCeoCount = AGENT_TASKS.filter(t => t.status === 'waiting_ceo').length;
  const workingCount = AGENT_TASKS.filter(t => t.status === 'working').length;
  const blockedCount = AGENT_TASKS.filter(t => t.status === 'blocked').length;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* ═══ Morning Brief ═══ */}
      <div className="glass-card" style={{
        padding: 0, overflow: 'hidden', marginBottom: 16,
        border: '1px solid rgba(201,168,76,0.3)',
        background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(30,41,59,0.9))',
      }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', cursor: 'pointer',
          }}
          onClick={() => setShowBrief(!showBrief)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>☀️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#c9a84c' }}>
                דוח בוקר — {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                סיכום AI אוטומטי · {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {waitingCeoCount > 0 && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                borderRadius: 12, background: 'rgba(239,68,68,0.2)', color: '#ef4444',
                animation: 'pulse 1.5s infinite',
              }}>
                🔴 {waitingCeoCount} דורש אישור
              </span>
            )}
            {showBrief ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
          </div>
        </div>

        {showBrief && (
          <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {morningBrief.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                borderRadius: 10,
                background: item.type === 'urgent' ? 'rgba(239,68,68,0.08)' :
                  item.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.06)',
                border: `1px solid ${item.type === 'urgent' ? 'rgba(239,68,68,0.15)' :
                  item.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)'}`,
              }}>
                <span style={{ fontSize: '1rem' }}>{item.emoji}</span>
                <span style={{
                  fontSize: '0.85rem', fontWeight: item.type === 'urgent' ? 700 : 500,
                  color: item.type === 'urgent' ? '#f87171' : item.type === 'success' ? '#34d399' : '#94a3b8',
                }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Agent Command Center ═══ */}
      <div className="glass-card" style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={20} color="#c9a84c" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              מרכז פיקוד סוכנים
            </h3>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px',
              borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#34d399',
            }}>
              {workingCount} סוכנים פעילים
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} color="#64748b" />
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>3 שכבות · CEO → Portal → Agents</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {([
            { key: 'all', label: `הכל (${AGENT_TASKS.length})`, color: '#94a3b8' },
            { key: 'waiting_ceo', label: `ממתין לך (${waitingCeoCount})`, color: '#ef4444' },
            { key: 'working', label: `סוכנים פעילים (${workingCount})`, color: '#3b82f6' },
            { key: 'blocked', label: `חסומים (${blockedCount})`, color: '#ef4444' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                border: '1px solid', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                background: filter === f.key ? `${f.color}18` : 'transparent',
                borderColor: filter === f.key ? f.color : 'rgba(255,255,255,0.1)',
                color: filter === f.key ? f.color : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredTasks.map(task => {
            const cfg = STATUS_CONFIG[task.status];
            return (
              <div
                key={task.id}
                style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: task.status === 'waiting_ceo'
                    ? 'rgba(239,68,68,0.06)'
                    : task.status === 'blocked'
                      ? 'rgba(239,68,68,0.04)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${cfg.color}25`,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => task.route && navigate(task.route)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${cfg.color}55`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${cfg.color}25`)}
              >
                {/* Row 1: Agent + Process + Client */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: '1.1rem',
                      animation: cfg.pulse ? 'pulse 2s infinite' : undefined,
                    }}>
                      {task.agentEmoji}
                    </span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>
                        {task.processName}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: 8 }}>
                        — {task.clientName}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                      borderRadius: 12, background: `${cfg.color}18`, color: cfg.color,
                      animation: cfg.pulse ? 'pulse 2s infinite' : undefined,
                    }}>
                      {cfg.label}
                    </span>
                    {task.route && <ExternalLink size={13} color="#64748b" />}
                  </div>
                </div>

                {/* Row 2: Description */}
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: task.actionRequired ? 8 : 0 }}>
                  {task.agentName}: {task.description}
                </div>

                {/* Row 3: Action Required (CEO) */}
                {task.actionRequired && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, marginTop: 4,
                    background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c9a84c' }}>
                      👔 CEO נדרש: {task.actionRequired}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        style={{
                          padding: '4px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)',
                          color: '#34d399', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                        }}
                      >
                        <CheckCircle size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                        אשר
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        style={{
                          padding: '4px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                          color: '#818cf8', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                        }}
                      >
                        <Eye size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                        צפה
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: '0.88rem' }}>
            אין משימות בקטגוריה זו 👌
          </div>
        )}
      </div>
    </div>
  );
}
