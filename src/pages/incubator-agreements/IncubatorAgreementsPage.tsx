/* ============================================
   FILE: IncubatorAgreementsPage.tsx
   PURPOSE: Display employment & ESOP agreement templates for incubator employees
   DEPENDENCIES: react, react-router-dom, lucide-react, incubatorAgreementData
   EXPORTS: IncubatorAgreementsPage (default)
   ============================================ */

// #region Imports
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, FileText, Users, Briefcase, ClipboardList, ChevronDown, ChevronUp, Printer, Download } from 'lucide-react';
import { exportToWord } from '../../services/wordExportService';
import type { WordSection } from '../../services/wordExportService';
import { EMPLOYMENT_SECTIONS, ESOP_SECTIONS, KPI_DATA } from './incubatorAgreementData';
// #endregion

// #region Types

/** Tab identifiers for agreement types */
type AgreementTab = 'employment' | 'esop';

// #endregion

// #region Component

/** IncubatorAgreementsPage — displays employment & ESOP agreements */
export default function IncubatorAgreementsPage() {
  const [tab, setTab] = useState<AgreementTab>('employment');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sections = tab === 'employment' ? EMPLOYMENT_SECTIONS : ESOP_SECTIONS;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 40, padding: '6px 16px', marginBottom: 16,
        }}>
          <Briefcase size={14} color="#10b981" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: 1 }}>
            INCUBATOR AGREEMENTS
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px' }}>
          הסכמי חממה — <span style={{
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Robium</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
          הסכם העסקה + הסכם הענקת אופציות (ESOP) — סעיף 102
        </p>
      </header>

      {/* Nav */}
      <div className="no-print" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        <Link to="/" className="flow-nav-btn"><Home size={16} /> דשבורד</Link>
        <Link to="/incubator" className="flow-nav-btn"><Users size={16} /> צוות חממה</Link>
        <Link to="/agreement/review" className="flow-nav-btn"><FileText size={16} /> הסכם מייסדים</Link>
        <button onClick={() => window.print()} className="flow-nav-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
          <Printer size={16} /> שמור כ-PDF / הדפס
        </button>
        <button onClick={() => {
          const activeSections = tab === 'employment' ? EMPLOYMENT_SECTIONS : ESOP_SECTIONS;
          const wordSections: WordSection[] = activeSections.map(sec => ({
            title: sec.title,
            paragraphs: sec.content,
            highlight: sec.highlight,
          }));
          if (tab === 'esop') {
            wordSections.push({
              title: 'נספחי KPI — עובדי חממה',
              table: {
                headers: ['שם', 'תפקיד', 'אחוז ESOP'],
                rows: KPI_DATA.map(e => [e.name, e.role, e.percent]),
              },
            });
          }
          wordSections.push({
            signatures: [
              { name: 'רוביום טכנולוגיות בע"מ', role: 'אלדד דוד — מנכ"ל' },
              { name: 'העובד', role: '____________' },
            ],
          });
          exportToWord({
            title: tab === 'employment' ? 'הסכם העסקה — עובד חממה' : 'הסכם הענקת אופציות — תוכנית החממה',
            subtitle: 'Robium Technologies Ltd',
            filename: tab === 'employment' ? 'הסכם_העסקה_חממה' : 'הסכם_אופציות_ESOP',
            sections: wordSections,
          });
        }} className="flow-nav-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>
          <Download size={16} /> הורד כ-Word
        </button>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setTab('employment')}
          style={{
            flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer',
            background: tab === 'employment' ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.5)',
            color: tab === 'employment' ? '#10b981' : '#94a3b8',
            fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
            borderBottom: tab === 'employment' ? '2px solid #10b981' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          📋 הסכם העסקה
        </button>
        <button
          onClick={() => setTab('esop')}
          style={{
            flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer',
            background: tab === 'esop' ? 'rgba(124,58,237,0.15)' : 'rgba(15,23,42,0.5)',
            color: tab === 'esop' ? '#7C3AED' : '#94a3b8',
            fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
            borderBottom: tab === 'esop' ? '2px solid #7C3AED' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          📈 הסכם אופציות (ESOP)
        </button>
      </div>

      {/* Document Header */}
      <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 20, textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800 }}>
          {tab === 'employment' ? 'הסכם העסקה — עובד חממה' : 'הסכם הענקת אופציות — תוכנית החממה'}
        </h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
          Robium Technologies Ltd · {tab === 'employment' ? 'Employment Agreement' : 'ESOP Grant Agreement'}
        </p>
        <div style={{ marginTop: 12, display: 'inline-block', padding: '4px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.75rem', color: '#f59e0b' }}>
          ⚠️ טמפלייט לדוגמה — יש להתאים ע"י עו"ד לפני חתימה
        </div>
      </div>

      {/* Parties */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <div><strong style={{ color: '#f1f5f9' }}>החברה:</strong> רוביום טכנולוגיות בע"מ</div>
          <div><strong style={{ color: '#f1f5f9' }}>העובד:</strong> [למלא — נספח אישי]</div>
        </div>
      </div>

      {/* Agreement Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {sections.map(sec => {
          const isOpen = openSections[sec.id] !== false;
          return (
            <div key={sec.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection(sec.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', border: 'none', cursor: 'pointer',
                  background: 'transparent', color: '#f1f5f9', fontFamily: 'Heebo, sans-serif',
                  fontWeight: 700, fontSize: '0.95rem', textAlign: 'right',
                }}
              >
                <span>{sec.title}</span>
                {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </button>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <ul style={{ margin: '12px 0 0', padding: '0 16px', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.9 }}>
                    {sec.content.map((line: string, i: number) => <li key={i}>{line}</li>)}
                  </ul>
                  {sec.highlight && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 8,
                      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                      fontSize: '0.82rem', color: '#fbbf24', lineHeight: 1.7,
                    }}>
                      💡 {sec.highlight}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* KPI Appendices (only in ESOP tab) */}
      {tab === 'esop' && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={18} color="#10b981" /> נספחי KPI — 5 עובדי חממה
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {KPI_DATA.map(emp => (
              <div key={emp.name} className="glass-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.role}</div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: emp.percent === '1.00%' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    color: emp.percent === '1.00%' ? '#f59e0b' : '#10b981',
                    fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace',
                  }}>
                    {emp.percent}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>מדד</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>יעד</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>משקל</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emp.kpis.map((kpi, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '6px 8px', color: '#e2e8f0' }}>{kpi.metric}</td>
                        <td style={{ padding: '6px 8px', color: '#94a3b8', fontFamily: 'monospace' }}>{kpi.target}</td>
                        <td style={{ padding: '6px 8px', color: '#94a3b8', fontFamily: 'monospace' }}>{kpi.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Salary Appendix (only in employment tab) */}
      {tab === 'employment' && (
        <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700 }}>📎 נספח ג': נספח שכר אישי (למלא לכל עובד)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <tbody>
              {[
                ['שם העובד', '____________'],
                ['ת.ז', '____________'],
                ['תואר תפקיד', '____________'],
                ['היקף משרה', '____% (100% = מלאה)'],
                ['שכר חודשי (ברוטו) כולל', '__________ ₪'],
                ['— מתוכו: שכר יסוד לפנסיה', '__________ ₪ (לא פחות ממינימום)'],
                ['— מתוכו: שעות נוספות גלובליות', '__________ ₪'],
                ['חובת שכר יסוד מינימום (01/04/2026)', '6,443.85 ₪'],
                ['בונוסים / עמלות', '____________'],
                ['מועד בחינה מחדש', 'לא יאוחר מ-___/___/2026'],
              ].map(([label, value], i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#f1f5f9', width: '40%' }}>{label}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', fontFamily: 'monospace' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Signatures */}
      <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700 }}>✍️ חתימות</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {['רוביום טכנולוגיות בע"מ (אלדד דוד — מנכ"ל)', 'העובד: ____________'].map((sig, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ height: 40, borderBottom: '1px dashed #475569', marginBottom: 8 }} />
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{sig}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.75rem' }}>
        הסכמי חממה — Robium Technologies · המוח של אלדד
      </div>
    </div>
  );
}

// #endregion
