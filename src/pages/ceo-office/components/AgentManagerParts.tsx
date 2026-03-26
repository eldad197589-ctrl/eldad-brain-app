/* ============================================
   FILE: AgentManagerParts.tsx
   PURPOSE: Sub-components for AgentManager (AgentCard, StepRow, Form4Display, btnStyle)
   DEPENDENCIES: react, lucide-react, agentRegistry, systemBrain
   EXPORTS: AgentCard, StepRow, Form4Display, btnStyle
   ============================================ */
import {
  CheckCircle, XCircle, Loader2, Play, FileText,
} from 'lucide-react';
import { LAYER_CONFIG, type Mission, type MissionStep, AGENTS } from '../../../data/agentRegistry';

// #region btnStyle

/**
 * Creates a consistent button style with the given accent color.
 *
 * @param color — Hex color string for the button accent
 * @returns CSS properties object
 */
export function btnStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700,
    background: `${color}20`, border: `1px solid ${color}40`,
    color, cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
  };
}

// #endregion

// #region AgentCard

/**
 * Single agent card in the grid.
 *
 * @param agent — Agent data from registry
 * @param isActive — Whether the agent is currently working
 */
export function AgentCard({ agent, isActive }: { agent: typeof AGENTS[0]; isActive: boolean }) {
  const layerCfg = LAYER_CONFIG[agent.layer];
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10,
      background: isActive ? `${layerCfg.color}15` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isActive ? layerCfg.color : 'rgba(255,255,255,0.06)'}`,
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{
          fontSize: '1rem',
          animation: isActive ? 'pulse 1.5s infinite' : undefined,
        }}>{agent.emoji}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isActive ? layerCfg.color : '#e2e8f0' }}>
          {agent.name}
        </span>
      </div>
      <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4 }}>
        {agent.description}
      </div>
    </div>
  );
}

// #endregion

// #region StepRow

/**
 * Mission step row with status icon and action buttons.
 *
 * @param step — The mission step data
 * @param onAction — Callback for step actions (start, done, error)
 */
export function StepRow({ step, onAction }: {
  step: MissionStep;
  onAction: (stepId: string, action: 'start' | 'done' | 'error') => void;
}) {
  const agent = AGENTS.find(a => a.id === step.agentId);
  const statusIcons: Record<string, React.ReactNode> = {
    idle: <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #475569' }} />,
    working: <Loader2 size={18} color="#3b82f6" className="spin" />,
    done: <CheckCircle size={18} color="#10b981" />,
    error: <XCircle size={18} color="#ef4444" />,
    waiting: <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px dashed #f59e0b' }} />,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderRadius: 10, background: step.status === 'working' ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${step.status === 'working' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
    }}>
      {statusIcons[step.status]}
      <span style={{ fontSize: '1rem' }}>{agent?.emoji || '🤖'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
          {agent?.name || step.agentId}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{step.description}</div>
        {step.output && (
          <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: 4 }}>✅ {step.output}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {step.status === 'idle' && (
          <button onClick={() => onAction(step.id, 'start')} style={btnStyle('#3b82f6')}>
            <Play size={12} /> הפעל
          </button>
        )}
        {step.status === 'working' && (
          <>
            <button onClick={() => onAction(step.id, 'done')} style={btnStyle('#10b981')}>
              <CheckCircle size={12} /> בוצע
            </button>
            <button onClick={() => onAction(step.id, 'error')} style={btnStyle('#ef4444')}>
              <XCircle size={12} /> בעיה
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// #endregion

// #region Form4Display

/**
 * Form 4 (completion certificate) display card.
 *
 * @param mission — The completed mission data
 */
export function Form4Display({ mission }: { mission: Mission }) {
  if (!mission.form4) return null;
  const f = mission.form4;
  return (
    <div style={{
      padding: 16, borderRadius: 12, marginTop: 10,
      background: f.recommendation === 'approved'
        ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(30,41,59,0.9))'
        : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(30,41,59,0.9))',
      border: `1px solid ${f.recommendation === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <FileText size={18} color={f.recommendation === 'approved' ? '#10b981' : '#ef4444'} />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: f.recommendation === 'approved' ? '#10b981' : '#ef4444' }}>
          📋 טופס 4 — {f.recommendation === 'approved' ? 'מאושר לכניסה ✅' : 'נדרש תיקון ❌'}
        </h4>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
        <div style={{ color: '#94a3b8' }}>מערכת: <strong style={{ color: '#e2e8f0' }}>{f.systemName}</strong></div>
        <div style={{ color: '#94a3b8' }}>ציון בריאות: <strong style={{ color: f.healthScore >= 80 ? '#10b981' : '#f59e0b' }}>{f.healthScore}%</strong></div>
        <div style={{ color: '#94a3b8' }}>סוכנים: <strong style={{ color: '#e2e8f0' }}>{f.agentsUsed.length}</strong></div>
        <div style={{ color: '#94a3b8' }}>בעיות: <strong style={{ color: f.issuesFound === 0 ? '#10b981' : '#ef4444' }}>{f.issuesFound}</strong></div>
      </div>
      <div style={{ marginTop: 10 }}>
        {Object.entries(f.checklist).map(([task, passed]) => (
          <div key={task} style={{ fontSize: '0.72rem', color: passed ? '#34d399' : '#f87171', marginBottom: 2 }}>
            {passed ? '✅' : '❌'} {task}
          </div>
        ))}
      </div>
    </div>
  );
}

// #endregion
