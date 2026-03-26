/* ============================================
   FILE: FoundersPage.tsx
   PURPOSE: FoundersPage component
   DEPENDENCIES: react, react-router-dom, lucide-react
   EXPORTS: FoundersPage (default)
   ============================================ */
/**
 * FoundersPage — Orchestrator
 *
 * Founders confrontation portal with 3 tabs: Party C, Kirill, CEO playbook.
 */
// #region Imports

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users } from 'lucide-react';
import type { TabId } from './constants';
import { TABS } from './constants';
import { EQUITY_TABLE } from '../agreement/agreementData';

import OsnatSection from './components/OsnatSection';
import KirillSection from './components/KirillSection';
import EldadSection from './components/EldadSection';
import EsopSection from './components/EsopSection';


// #endregion

// #region Component

/** FoundersPage component — FoundersPage component */
export default function FoundersPage() {
  const [activeTab, setActiveTab] = useState<TabId>('eldad');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
          padding: '6px 16px', borderRadius: 100, marginBottom: 16,
          fontSize: '0.82rem', color: '#60a5fa', fontWeight: 600,
        }}>
          <Users size={14} /> פורטל מייסדים רשמי
        </div>
        <h1 style={{
          fontSize: '2.2rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0,
        }}>
          פורטל מייסדים <span style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Robium ({EQUITY_TABLE[0].percent})</span>
        </h1>
        <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.95rem', maxWidth: 700, marginInline: 'auto' }}>
          מערכת ניהול יעדים (KPIs) ואחזקות שותפים. החלוקה והאחריות נגזרות מההסכם הסופי, עם התמקדות בתרומה בפועל לחברה.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        <Link to="/" className="flow-nav-btn"><Home size={16} /> דשבורד</Link>
        <Link to="/agreement/diff" className="flow-nav-btn" style={{ background: 'rgba(59,130,246,0.1)' }}>השוואת הסכמי מייסדים</Link>
        <Link to="/founders/kirill-dispute" className="flow-nav-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
          ניתוח משבר קיריל (60%)
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s',
            background: activeTab === tab.id ? `${tab.color}22` : 'var(--surface, #111827)',
            color: activeTab === tab.id ? tab.color : '#94a3b8',
            borderWidth: 1, borderStyle: 'solid',
            borderColor: activeTab === tab.id ? `${tab.color}66` : 'rgba(255,255,255,0.06)',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'eldad' && <EldadSection />}
      {activeTab === 'kirill' && <KirillSection />}
      {activeTab === 'osnat' && <OsnatSection />}
      {activeTab === 'esop' && <EsopSection />}
    </div>
  );
}

// #endregion
