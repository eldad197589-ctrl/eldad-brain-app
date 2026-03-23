/* ============================================
   FILE: Layout.tsx
   PURPOSE: Layout component
   DEPENDENCIES: react-router-dom, react, lucide-react
   EXPORTS: Layout (default)
   ============================================ */
/**
 * FILE: Layout.tsx
 * PURPOSE: Main app layout — sidebar navigation + top bar + content area
 * DEPENDENCIES: react-router-dom, lucide-react, CollapsibleSection, sidebarNav
 */

// #region Imports
import { NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Search, Eye, EyeOff } from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';
import CommandPalette from './CommandPalette';
import Breadcrumbs from './Breadcrumbs';
import { useRecentPages } from '../hooks/useRecentPages';
import { SIDEBAR_SECTIONS } from '../data/sidebarNav';
import type { NavItem } from '../data/sidebarNav';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
// #endregion

// #region Component
/**
 * Layout — Main application layout with collapsible sidebar navigation,
 * top bar, and content outlet. RTL Hebrew layout.
 */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Track recent pages for CommandPalette
  useRecentPages();

  useKeyboardShortcuts({
    onCommandPalette: () => setPaletteOpen(true),
    onEscape: () => setPaletteOpen(false),
  });

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('he-IL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    );
  }, []);

  /** Render a single navigation item (skip dim items if toggle is off) */
  const renderItem = (item: NavItem) => {
    if (item.dim && !showComingSoon) return null;

    // Sub-chapter divider — not a link, just a label
    if (item.isDivider) {
      return (
        <div key={`divider-${item.label}`} className="sidebar-divider">
          {item.label}
        </div>
      );
    }

    return (
      <NavLink
        key={item.to + item.label}
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        style={item.dim ? { opacity: 0.45, fontSize: '0.82rem' } : undefined}
        onClick={() => setSidebarOpen(false)}
      >
        <span style={{ fontSize: '1.1rem', width: 20, textAlign: 'center' }}>{item.emoji}</span>
        {item.label}
      </NavLink>
    );
  };

  return (
    <div className="app-layout">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 right-4 z-50 md:hidden bg-brand-charcoal/80 backdrop-blur-sm border border-white/10 rounded-xl p-2"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={22} color="#e2e8f0" /> : <Menu size={22} color="#e2e8f0" />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: 48, height: 48 }}>
            <text x="12" y="62" fontFamily="Georgia, serif" fontSize="56" fontWeight="bold" fill="#c9a84c">D</text>
            <text x="48" y="44" fontFamily="Georgia, serif" fontSize="32" fill="#c9a84c">&amp;</text>
            <text x="58" y="62" fontFamily="Georgia, serif" fontSize="56" fontWeight="bold" fill="#7ba3c9">E</text>
            <text x="60" y="82" textAnchor="middle" fontFamily="Heebo, sans-serif" fontSize="10" fill="#7ba3c9">רו"ח</text>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>ניהול דוד אלדד</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>רואה חשבון</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SIDEBAR_SECTIONS.map((section) => (
            <CollapsibleSection
              key={section.id}
              label={section.label}
              emoji={section.emoji}
              description={section.description}
              accentColor={section.accentColor}
              defaultOpen={section.defaultOpen}
              alwaysOpen={section.alwaysOpen}
            >
              {section.items.map(renderItem)}
            </CollapsibleSection>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-toggle-coming-soon"
            onClick={() => setShowComingSoon(!showComingSoon)}
          >
            {showComingSoon ? <EyeOff size={12} /> : <Eye size={12} />}
            {showComingSoon ? 'הסתר בקרוב' : 'הצג הכל (כולל בקרוב)'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <Calendar size={16} />
            <span>{currentDate}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-area">
        <header className="top-bar">
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>המוח של אלדד</h1>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>מערכת ניהול ידע חכמה</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setPaletteOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Heebo, sans-serif',
              }}
            >
              <Search size={13} color="#64748b" />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>חיפוש מהיר</span>
              <kbd style={{
                fontSize: '0.6rem', padding: '1px 5px', borderRadius: 3,
                background: 'rgba(255,255,255,0.08)', color: '#64748b',
              }}>Ctrl+K</kbd>
            </button>
            <div className="user-avatar">דא</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>דוד אלדד</span>
          </div>
        </header>

        <div className="main-content">
          <Breadcrumbs />
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
// #endregion
