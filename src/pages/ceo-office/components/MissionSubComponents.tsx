/* ============================================
   FILE: MissionSubComponents.tsx
   PURPOSE: Sub-components for MissionLauncher — step rows, status badges, forms
   DEPENDENCIES: react, lucide-react, agentRegistry
   EXPORTS: ModeButton, StepRow, MissionStatusBadge, Form4Display
   ============================================ */
/**
 * Sub-components extracted from MissionLauncher to maintain ≤300 line limit.
 */

import { useState } from 'react';
import {
  Clock, Loader2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, FileCheck,
} from 'lucide-react';
import type { Mission, MissionStep } from '../../../data/agentRegistry';
import { getAgentById } from '../../../data/agentRegistry';

// #region ModeButton

/** Mode toggle button for mission type selection */
export function ModeButton({ label, value, current, onClick }: {
  label: string; value: string; current: string; onClick: () => void;
}) {
  const active = value === current;
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '8px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
      background: active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? '#fbbf24' : 'rgba(255,255,255,0.08)'}`,
      color: active ? '#fbbf24' : '#64748b',
      cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
    }}>
      {label}
    </button>
  );
}

// #endregion

// #region StepRow

/** Single step row with status icon and expandable output */
export function StepRow({ step }: { step: MissionStep }) {
  const agent = getAgentById(step.agentId);
  const [expanded, setExpanded] = useState(false);

  const statusIcon: Record<string, React.ReactNode> = {
    idle: <Clock size={14} color="#64748b" />,
    working: <Loader2 size={14} color="#fbbf24" style={{ animation: 'spin 1s linear infinite' }} />,
    done: <CheckCircle size={14} color="#34d399" />,
    error: <XCircle size={14} color="#f87171" />,
    waiting: <Clock size={14} color="#fbbf24" />,
  };

  return (
    <div style={{
      padding: '8px 12px', borderRadius: 8,
      background: step.status === 'working' ? 'rgba(251,191,36,0.08)' :
                  step.status === 'done' ? 'rgba(52,211,153,0.05)' :
                  step.status === 'error' ? 'rgba(248,113,113,0.05)' :
                  'rgba(255,255,255,0.02)',
      border: `1px solid ${
        step.status === 'working' ? 'rgba(251,191,36,0.2)' :
        step.status === 'done' ? 'rgba(52,211,153,0.15)' :
        step.status === 'error' ? 'rgba(248,113,113,0.15)' :
        'rgba(255,255,255,0.06)'
      }`,
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: step.output ? 'pointer' : 'default',
        }}
        onClick={() => step.output && setExpanded(!expanded)}
      >
        {statusIcon[step.status] || statusIcon.idle}
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c9a84c' }}>
          {agent?.emoji || '🤖'} {agent?.name || step.agentId}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', flex: 1 }}>
          {step.description}
        </span>
        {step.output && (
          expanded ? <ChevronUp size={12} color="#64748b" /> : <ChevronDown size={12} color="#64748b" />
        )}
      </div>
      {expanded && step.output && (
        <div style={{
          marginTop: 8, padding: '8px 10px', borderRadius: 6,
          background: 'rgba(0,0,0,0.2)', fontSize: '0.76rem',
          color: '#cbd5e1', lineHeight: 1.6, direction: 'rtl',
          whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto',
        }}>
          {step.output}
        </div>
      )}
    </div>
  );
}

// #endregion

// #region MissionStatusBadge

/** Mission status badge with color-coded label */
export function MissionStatusBadge({ status }: { status: Mission['status'] }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    planning: { label: 'מתוכנן', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
    executing: { label: 'בביצוע', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    review: { label: 'סקירה', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
    completed: { label: 'הושלם', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  };
  const { label, color, bg } = config[status] || config.planning;

  return (
    <span style={{
      fontSize: '0.64rem', fontWeight: 700, padding: '2px 6px',
      borderRadius: 6, background: bg, color,
    }}>
      {label}
    </span>
  );
}

// #endregion

// #region Form4Display

/** Form4 completion report display */
export function Form4Display({ report }: { report: NonNullable<Mission['form4']> }) {
  return (
    <div style={{
      marginTop: 12, padding: '12px 14px', borderRadius: 10,
      background: report.recommendation === 'approved'
        ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
      border: `1px solid ${
        report.recommendation === 'approved' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <FileCheck size={16} color={report.recommendation === 'approved' ? '#34d399' : '#f87171'} />
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>
          טופס 4 — תעודת גמר
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: '0.76rem', color: '#94a3b8' }}>
        <span>בריאות: <b style={{ color: report.healthScore >= 80 ? '#34d399' : '#fbbf24' }}>{report.healthScore}%</b></span>
        <span>סוכנים: <b>{report.agentsUsed.length}</b></span>
        <span>בעיות: <b style={{ color: report.issuesFound > 0 ? '#f87171' : '#34d399' }}>{report.issuesFound}</b></span>
        <span>המלצה: <b style={{ color: report.recommendation === 'approved' ? '#34d399' : '#f87171' }}>
          {report.recommendation === 'approved' ? '✅ מאושר' : '⚠️ צריך תיקון'}
        </b></span>
      </div>
    </div>
  );
}

// #endregion
