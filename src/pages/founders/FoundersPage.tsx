/**
 * FoundersPage — Orchestrator
 *
 * Founders confrontation portal with 3 tabs: Party C, Kirill, CEO playbook.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, UserCheck } from 'lucide-react';
import type { TabId } from './constants';
import { TABS } from './constants';

import PartyCSection from './components/PartyCSection';
import KirillSection from './components/KirillSection';
import EldadSection from './components/EldadSection';

export default function FoundersPage() {
  const [activeTab, setActiveTab] = useState<TabId>('partyc');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          padding: '6px 16px', borderRadius: 100, marginBottom: 16,
          fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600,
        }}>
          <UserCheck size={14} /> פורטל מייסדים
        </div>
        <h1 style={{
          fontSize: '2.2rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0,
        }}>
          פורטל מייסדים <span style={{
            background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Robium 2.0</span>
        </h1>
        <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.95rem', maxWidth: 700, marginInline: 'auto' }}>
          מבחן תוצאה חוזי. כל שותף נדרש להצדיק את חלקו מול הסעיפים הרלוונטיים עליהם הוא חותם, ללא רגשות ואגו.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        <Link to="/" className="flow-nav-btn"><Home size={16} /> דשבורד</Link>
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

      {activeTab === 'partyc' && <PartyCSection />}
      {activeTab === 'kirill' && <KirillSection />}
      {activeTab === 'eldad' && <EldadSection />}
    </div>
  );
}
