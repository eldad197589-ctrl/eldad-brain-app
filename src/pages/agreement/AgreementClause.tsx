/* ============================================
   FILE: AgreementClause.tsx
   PURPOSE: AgreementClause component
   DEPENDENCIES: react, lucide-react
   EXPORTS: AgreementClause (default)
   ============================================ */
/**
 * FILE: AgreementClause.tsx
 * PURPOSE: Single clause card with status buttons and inline notes
 * DEPENDENCIES: agreementData types, lucide-react
 */
import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { AgreementClause as ClauseType, ClauseStatus } from './agreementData';

// #region Types

interface AgreementClauseProps {
  clause: ClauseType;
  status: ClauseStatus;
  note: string;
  onStatusChange: (clauseId: string, status: ClauseStatus) => void;
  onNoteChange: (clauseId: string, note: string) => void;
}

// #endregion

// #region Status Config

const STATUS_CONFIG: Record<ClauseStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'ממתין לבדיקה', color: '#94a3b8', bg: 'transparent', border: 'rgba(255,255,255,0.08)' },
  approved: { label: '✅ מאושר', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  needs_fix: { label: '⚠️ דורש תיקון', color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  remove: { label: '❌ להסרה', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
};

// #endregion

// #region Component

/**
 * @param {AgreementClauseProps} props
 * @returns Single agreement clause card with status + notes
 */
export default function AgreementClause({ clause, status, note, onStatusChange, onNoteChange }: AgreementClauseProps) {
  const [showNote, setShowNote] = useState(!!note);
  const [expanded, setExpanded] = useState(true);
  const cfg = STATUS_CONFIG[status];

  return (
    <div style={{
      background: cfg.bg || 'var(--surface, #111827)',
      border: `1px solid ${cfg.border}`,
      borderRadius: 14,
      padding: '20px 24px',
      transition: 'all 0.3s',
      borderRight: `4px solid ${cfg.color}`,
    }}>
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${cfg.color}15`, color: cfg.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 800, flexShrink: 0,
          }}>
            {clause.number}
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>
              {clause.title}
            </h3>
            <span style={{ fontSize: '0.75rem', color: cfg.color, fontWeight: 600 }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {note && <MessageSquare size={14} color="#c9a84c" />}
          {expanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Sub-clauses */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {clause.subClauses.map(sub => (
              <div key={sub.id}>
                {sub.text && (
                  <div style={{
                    fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.8,
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <span style={{
                      fontWeight: 700, color: '#7C3AED', marginLeft: 8, fontSize: '0.82rem',
                    }}>
                      סעיף {sub.id}
                    </span>
                    {sub.text.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < sub.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                )}
                {sub.highlight && (
                  <div style={{
                    margin: '8px 0', padding: '14px 18px', borderRadius: 10,
                    background: 'rgba(124,58,237,0.06)',
                    borderRight: '4px solid #7C3AED',
                    fontSize: '0.85rem', color: '#c4b5fd', lineHeight: 1.7, fontWeight: 500,
                  }}>
                    💡 {sub.highlight}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap',
            paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <StatusButton
              active={status === 'approved'}
              onClick={() => onStatusChange(clause.id, status === 'approved' ? 'pending' : 'approved')}
              color="#10b981"
              icon={<CheckCircle size={14} />}
              label="מאושר"
            />
            <StatusButton
              active={status === 'needs_fix'}
              onClick={() => onStatusChange(clause.id, status === 'needs_fix' ? 'pending' : 'needs_fix')}
              color="#f59e0b"
              icon={<AlertTriangle size={14} />}
              label="דורש תיקון"
            />
            <StatusButton
              active={status === 'remove'}
              onClick={() => onStatusChange(clause.id, status === 'remove' ? 'pending' : 'remove')}
              color="#ef4444"
              icon={<XCircle size={14} />}
              label="להסרה"
            />
            <button
              onClick={() => setShowNote(!showNote)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                border: `1px solid ${note ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`,
                background: note ? 'rgba(201,168,76,0.08)' : 'transparent',
                color: note ? '#c9a84c' : '#94a3b8',
                cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
              }}
            >
              <MessageSquare size={13} />
              {note ? 'ערוך הערה' : 'הוסף הערה'}
            </button>
          </div>

          {/* Note Area */}
          {showNote && (
            <div style={{ marginTop: 12 }}>
              <textarea
                value={note}
                onChange={e => onNoteChange(clause.id, e.target.value)}
                placeholder="כתוב הערה, הנחיה לתיקון, או סיבה לשינוי..."
                dir="rtl"
                style={{
                  width: '100%', minHeight: 80, padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(201,168,76,0.2)',
                  color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
                  resize: 'vertical', outline: 'none', lineHeight: 1.7,
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// #endregion

// #region Sub-components

function StatusButton({ active, onClick, color, icon, label }: {
  active: boolean; onClick: () => void; color: string;
  icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
        background: active ? `${color}18` : 'transparent',
        color: active ? color : '#64748b',
        cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
        transition: 'all 0.2s',
      }}
    >
      {icon} {label}
    </button>
  );
}

// #endregion
