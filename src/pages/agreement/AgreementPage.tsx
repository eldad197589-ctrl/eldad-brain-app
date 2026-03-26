/* ============================================
   FILE: AgreementPage.tsx
   PURPOSE: AgreementPage component
   DEPENDENCIES: react, react-router-dom, lucide-react
   EXPORTS: AgreementPage (default)
   ============================================ */
/**
 * FILE: AgreementPage.tsx
 * PURPOSE: Founders agreement viewer with status annotations and notes (Orchestrator)
 * DEPENDENCIES: agreementData, AgreementClause, lucide-react, react-router-dom
 */
import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, FileText, CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Printer, ClipboardList, Download,
} from 'lucide-react';
import {
  AGREEMENT_CLAUSES, EQUITY_TABLE, SIGNATURES,
  STORAGE_KEY_STATUSES, STORAGE_KEY_NOTES, STORAGE_KEY_GENERAL_NOTES,
} from './agreementData';
import type { ClauseStatus } from './agreementData';
import AgreementClauseCard from './AgreementClause';
import { printAgreement } from './printService';
import { exportAgreementToWord } from './exportToWord';

// #region Helpers

/** Load a Record from localStorage, or return fallback */
function loadRecord<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

// #endregion

// #region Component

/** AgreementPage component — AgreementPage component */
export default function AgreementPage() {
  // State: clause statuses & notes
  const [statuses, setStatuses] = useState<Record<string, ClauseStatus>>(
    () => loadRecord(STORAGE_KEY_STATUSES, {})
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    () => loadRecord(STORAGE_KEY_NOTES, {})
  );
  const [generalNotes, setGeneralNotes] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY_GENERAL_NOTES) || ''
  );
  const [showGeneralNotes, setShowGeneralNotes] = useState(false);

  // Persist handlers
  const handleStatusChange = useCallback((clauseId: string, status: ClauseStatus) => {
    setStatuses(prev => {
      const next = { ...prev, [clauseId]: status };
      localStorage.setItem(STORAGE_KEY_STATUSES, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleNoteChange = useCallback((clauseId: string, note: string) => {
    setNotes(prev => {
      const next = { ...prev, [clauseId]: note };
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleGeneralNotesChange = useCallback((value: string) => {
    setGeneralNotes(value);
    localStorage.setItem(STORAGE_KEY_GENERAL_NOTES, value);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = AGREEMENT_CLAUSES.length;
    const approved = AGREEMENT_CLAUSES.filter(c => statuses[c.id] === 'approved').length;
    const needsFix = AGREEMENT_CLAUSES.filter(c => statuses[c.id] === 'needs_fix').length;
    const toRemove = AGREEMENT_CLAUSES.filter(c => statuses[c.id] === 'remove').length;
    const pending = total - approved - needsFix - toRemove;
    return { total, approved, needsFix, toRemove, pending };
  }, [statuses]);

  const progressPercent = Math.round(((stats.total - stats.pending) / stats.total) * 100);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 40, padding: '6px 16px', marginBottom: 16,
        }}>
          <FileText size={14} color="#7C3AED" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', letterSpacing: 1 }}>
            FOUNDERS AGREEMENT
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px' }}>
          הסכם מייסדים — <span style={{
            background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Robium</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
          לייסוד שותפות תחת השם הזמני "Robium / רוביום"
        </p>
      </header>

      {/* Nav */}
      <div className="no-print" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        <Link to="/" className="flow-nav-btn"><Home size={16} /> דשבורד</Link>
        <Link to="/hub" className="flow-nav-btn"><ClipboardList size={16} /> מרכז שליטה</Link>
        <Link to="/founders" className="flow-nav-btn"><FileText size={16} /> פורטל עימות</Link>
        <a href="/legacy/robium_osnat_track_changes.html" target="_blank" rel="noopener noreferrer" className="flow-nav-btn" style={{ background: 'rgba(14, 165, 233, 0.15)', borderColor: '#0284c7', color: '#6be7ff', fontWeight: 'bold' }}>
          <FileText size={16} /> Track Changes (גרסת הצגה לאוסנת)
        </a>
        <button onClick={() => { printAgreement(); }} className="flow-nav-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
          <Printer size={16} /> שמור כ-PDF / הדפס
        </button>
        <button onClick={() => { exportAgreementToWord(); }} className="flow-nav-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
          <Download size={16} /> הורד כ-Word
        </button>
      </div>

      {/* Progress Bar + Stats */}
      <div className="glass-card no-print" style={{ padding: '18px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>📋 סטטוס סקירת הסכם</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c9a84c', fontSize: '0.85rem' }}>
            {progressPercent}% נסקר
          </span>
        </div>
        <div style={{
          height: 8, background: '#334155', borderRadius: 20, overflow: 'hidden', marginBottom: 14,
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: progressPercent === 100
              ? 'linear-gradient(to left, #10b981, #34d399)'
              : 'linear-gradient(to left, #c9a84c, #7C3AED)',
            borderRadius: 20, transition: 'width 0.3s',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatPill icon={<CheckCircle size={13} />} label="מאושר" count={stats.approved} color="#10b981" />
          <StatPill icon={<AlertTriangle size={13} />} label="דורש תיקון" count={stats.needsFix} color="#f59e0b" />
          <StatPill icon={<XCircle size={13} />} label="להסרה" count={stats.toRemove} color="#ef4444" />
          <StatPill icon={<FileText size={13} />} label="ממתין" count={stats.pending} color="#94a3b8" />
        </div>
      </div>

      {/* Parties */}
      <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>👥 הצדדים להסכם</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem', color: '#cbd5e1' }}>
          <div><strong style={{ color: '#f1f5f9' }}>1.</strong> <strong>אלדד דוד</strong> — "צד א'" (CEO)</div>
          <div><strong style={{ color: '#f1f5f9' }}>2.</strong> <strong>קיריל יאקימנקו</strong>, עוסק מורשה 336214044 — "צד ב'" (CTO)</div>
          <div><strong style={{ color: '#f1f5f9' }}>3.</strong> <strong>נציג/ת פיתוח עסקי (בגיוס)</strong> — "צד ג'" (CRO)</div>
        </div>
      </div>

      {/* Agreement Clauses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        {AGREEMENT_CLAUSES.map(clause => (
          <AgreementClauseCard
            key={clause.id}
            clause={clause}
            status={statuses[clause.id] || 'pending'}
            note={notes[clause.id] || ''}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
          />
        ))}
      </div>

      {/* Equity Table */}
      <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700 }}>📊 טבלת אחזקות</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>שם המייסד</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>אחוז אחזקה</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>תפקיד</th>
              </tr>
            </thead>
            <tbody>
              {EQUITY_TABLE.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#f1f5f9' }}>{row.name}</td>
                  <td style={{
                    padding: '10px 14px', fontWeight: 700, fontFamily: 'monospace',
                    color: row.percent === '37.5%' ? '#c9a84c' : row.percent === '15.0%' ? '#f59e0b' : '#94a3b8',
                  }}>
                    {row.percent}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700 }}>✍️ חתימות</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {SIGNATURES.map((sig, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                height: 40, borderBottom: '1px dashed #475569', marginBottom: 8,
              }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{sig.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sig.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* General Notes / Instructions */}
      <div className="glass-card no-print" style={{ padding: '18px 22px', marginBottom: 32 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setShowGeneralNotes(!showGeneralNotes)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Printer size={18} color="#c9a84c" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>📝 הנחיות כלליות לתיקון ההסכם</h3>
          </div>
          {showGeneralNotes ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {showGeneralNotes && (
          <div style={{ marginTop: 14 }}>
            <textarea
              value={generalNotes}
              onChange={e => handleGeneralNotesChange(e.target.value)}
              placeholder="כתוב כאן הנחיות כלליות לעורך הדין / לתיקון ההסכם..."
              dir="rtl"
              style={{
                width: '100%', minHeight: 120, padding: '14px 16px', borderRadius: 12,
                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(201,168,76,0.2)',
                color: '#e2e8f0', fontSize: '0.88rem', fontFamily: 'Heebo, sans-serif',
                resize: 'vertical', outline: 'none', lineHeight: 1.8,
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.75rem' }}>
        הסכם מייסדים — Robium · גרסה דיגיטלית · המוח של אלדד
      </div>
    </div>
  );
}

// #endregion

// #region Sub-components

function StatPill({ icon, label, count, color }: {
  icon: React.ReactNode; label: string; count: number; color: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 8,
      background: `${color}10`, border: `1px solid ${color}25`,
      fontSize: '0.78rem', fontWeight: 600, color,
    }}>
      {icon}
      {count} {label}
    </div>
  );
}

// #endregion
