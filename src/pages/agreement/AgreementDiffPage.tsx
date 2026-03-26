/* ============================================
   FILE: AgreementDiffPage.tsx
   PURPOSE: Agreement comparison — NEW side dynamically synced from agreementData.ts
   DEPENDENCIES: react, react-router-dom, diffData, DiffSection, agreementData
   EXPORTS: AgreementDiffPage (default)
   ============================================ */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DIFF_SECTIONS, DIFF_STATS } from './diffData';
import DiffSectionCard from './DiffSection';

// #region Component

/** AgreementDiffPage — Comparison page, NEW side is LIVE from agreementData.ts */
export default function AgreementDiffPage() {
  const [allOpen, setAllOpen] = useState(false);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #ef4444, #10b981)',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>
          ⚖️
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px', color: '#fff' }}>
          השוואת הסכמים: מקורי מול סופי
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: 700, marginInline: 'auto' }}>
          ניתוח סעיף-מול-סעיף בין ההסכם המקורי (3.3.2026) לבין ההסכם הסופי.
          <br />
          <strong style={{ color: '#86efac' }}>הצד הירוק נשאב ישירות מ-agreementData.ts — שינוי בהסכם = עדכון אוטומטי כאן.</strong>
        </p>
      </header>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <Link to="/agreement/review" className="flow-nav-btn">📋 סקירת הסכם</Link>
        <Link to="/founders" className="flow-nav-btn">🤝 פורטל עימות</Link>
        <Link to="/" className="flow-nav-btn">🏠 דשבורד</Link>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard num={DIFF_STATS.sections} label="נושאי השוואה" color="#ef4444" />
        <StatCard num={DIFF_STATS.totalClauses} label="סעיפים בהסכם" color="#10b981" />
        <StatCard num={DIFF_STATS.totalSubClauses} label="תת-סעיפים" color="#3b82f6" />
        <StatCard num={DIFF_STATS.highlightedWarnings} label="הדגשות / אזהרות" color="#fcd34d" />
      </div>

      {/* Sync Indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px', borderRadius: 12, marginBottom: 20,
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <span style={{ fontSize: '0.82rem', color: '#6ee7b7' }}>
          🔗 צד ירוק (<strong>הסכם סופי</strong>) נשאב ישירות מ-<code style={{ color: '#86efac' }}>agreementData.ts</code> — לא עותק
        </span>
        <span style={{
          fontSize: '0.7rem', padding: '2px 10px', borderRadius: 10,
          background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700,
        }}>
          DYNAMIC ✅
        </span>
      </div>

      {/* Toggle All */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => setAllOpen(!allOpen)}
          style={{
            background: 'rgba(30,41,59,0.7)', color: '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 16px', borderRadius: 50, fontSize: '0.82rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          }}
        >
          📂 {allOpen ? 'סגור הכל' : 'פתח הכל'}
        </button>
      </div>

      {/* Diff Sections */}
      {DIFF_SECTIONS.map((section, i) => (
        <DiffSectionCard key={section.id} section={section} defaultOpen={allOpen || i < 3} />
      ))}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px 0 32px', color: '#475569', fontSize: '0.75rem' }}>
        השוואת הסכמים — Robium · צד חדש = LIVE מ-agreementData.ts
      </div>
    </div>
  );
}

// #endregion

// #region Sub-components

/** StatCard — single stat */
function StatCard({ num, label, color }: { num: number; label: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '14px 18px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{num}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{label}</div>
    </div>
  );
}

// #endregion
