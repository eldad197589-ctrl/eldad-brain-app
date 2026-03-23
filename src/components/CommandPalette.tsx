/* ============================================
   FILE: CommandPalette.tsx
   PURPOSE: CommandPalette component
   DEPENDENCIES: react, react-router-dom, lucide-react
   EXPORTS: CommandPalette (default)
   ============================================ */
/**
 * FILE: CommandPalette.tsx
 * PURPOSE: Ctrl+K command palette — fast search, recent pages, and contextual actions
 * DEPENDENCIES: react, react-router-dom, sidebarNav, useRecentPages
 *
 * Features:
 * - ⭐ Recent pages (last 5 visited)
 * - 🧭 Quick navigation to any page
 * - ⚡ Fast action shortcuts (add task, add meeting)
 * - Hebrew fuzzy search with smart keywords
 */

// #region Imports
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Clock, Compass, Zap } from 'lucide-react';
import { SIDEBAR_SECTIONS, type NavItem } from '../data/sidebarNav';
import { useRecentPagesStatic } from '../hooks/useRecentPages';
// #endregion

// #region Types

interface CommandItem {
  /** Display label */
  label: string;
  /** Emoji/icon */
  emoji: string;
  /** Action on select */
  action: () => void;
  /** Category for grouping */
  category: 'recent' | 'navigate' | 'action';
  /** Search keywords */
  keywords: string;
  /** Optional subtitle hint */
  hint?: string;
}

interface CommandPaletteProps {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
}

// #endregion

// #region Component

/**
 * CommandPalette — Ctrl+K modal for fast navigation, recent pages, and quick actions.
 */
export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const recentPages = useRecentPagesStatic();

  // Build command list from sidebar nav + recent pages + custom actions
  const commands: CommandItem[] = useMemo(() => {
    const allCommands: CommandItem[] = [];

    // 1. Recent pages
    recentPages.forEach((page) => {
      allCommands.push({
        label: page.label,
        emoji: page.emoji,
        action: () => { navigate(page.path); onClose(); },
        category: 'recent' as const,
        keywords: `${page.label} אחרון recent`,
        hint: 'ביקור אחרון',
      });
    });

    // 2. Navigation from sidebar
    SIDEBAR_SECTIONS.forEach((section) => {
      section.items.forEach((item: NavItem) => {
        // Skip items that already appear in recent
        if (recentPages.some(r => r.path === item.to)) return;
        allCommands.push({
          label: item.label,
          emoji: item.emoji || '📄',
          action: () => { navigate(item.to); onClose(); },
          category: 'navigate' as const,
          keywords: `${item.label} ${section.label}`,
          hint: section.label,
        });
      });
    });

    // 3. Quick actions
    allCommands.push(
      {
        label: 'הוסף משימה חדשה', emoji: '➕',
        action: () => { navigate('/ceo'); onClose(); },
        category: 'action', keywords: 'הוסף משימה חדשה task add new',
        hint: 'פותח את לשכת מנכ"ל',
      },
      {
        label: 'הוסף פגישה חדשה', emoji: '📅',
        action: () => { navigate('/ceo'); onClose(); },
        category: 'action', keywords: 'הוסף פגישה חדשה meeting add new',
        hint: 'פותח יומן פגישות',
      },
      {
        label: 'קלוט מסמך חדש', emoji: '📥',
        action: () => { navigate('/documents'); onClose(); },
        category: 'action', keywords: 'קלוט מסמך חדש document intake upload',
        hint: 'בוט מילוי מסמכים',
      },
      {
        label: 'כתוב מכתב', emoji: '✉️',
        action: () => { navigate('/letter'); onClose(); },
        category: 'action', keywords: 'כתוב מכתב letter write',
        hint: '20+ סוגי מכתבים',
      },
    );

    return allCommands;
  }, [navigate, onClose, recentPages]);

  // Filtered commands — smart search
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) ||
      c.keywords.toLowerCase().includes(q) ||
      (c.hint && c.hint.toLowerCase().includes(q))
    );
  }, [commands, query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => { setSelectedIndex(0); }, [filtered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const recentItems = filtered.filter(c => c.category === 'recent');
  const navItems = filtered.filter(c => c.category === 'navigate');
  const actionItems = filtered.filter(c => c.category === 'action');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%', maxWidth: 560, maxHeight: '65vh',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: 16, border: '1px solid rgba(201,168,76,0.2)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Search Input */}
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Search size={18} color="#c9a84c" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="חיפוש מהיר... (עמודים, פעולות, כלים)"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e2e8f0', fontSize: '1rem', fontFamily: 'Heebo, sans-serif',
              direction: 'rtl',
            }}
          />
          <span style={{
            fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4,
            background: 'rgba(255,255,255,0.08)', color: '#64748b',
          }}>
            ESC
          </span>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '0.85rem' }}>
              🔍 לא נמצאו תוצאות
            </div>
          )}

          {/* Recent Pages */}
          {recentItems.length > 0 && (
            <>
              <CategoryHeader icon={<Clock size={12} />} label="אחרונים" color="#fbbf24" />
              {recentItems.map((item, i) => renderCommandItem(item, filtered, selectedIndex, i, '#fbbf24'))}
            </>
          )}

          {/* Navigation */}
          {navItems.length > 0 && (
            <>
              <CategoryHeader icon={<Compass size={12} />} label="ניווט" color="#60a5fa" />
              {navItems.map((item, i) => renderCommandItem(item, filtered, selectedIndex, i, '#c9a84c'))}
            </>
          )}

          {/* Quick Actions */}
          {actionItems.length > 0 && (
            <>
              <CategoryHeader icon={<Zap size={12} />} label="פעולות מהירות" color="#34d399" />
              {actionItems.map((item, i) => renderCommandItem(item, filtered, selectedIndex, i, '#34d399'))}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 12, justifyContent: 'center',
        }}>
          {[
            { key: '↑↓', label: 'ניווט' },
            { key: 'Enter', label: 'בחר' },
            { key: 'Esc', label: 'סגור' },
          ].map((h) => (
            <span key={h.key} style={{ fontSize: '0.65rem', color: '#64748b' }}>
              <span style={{
                padding: '1px 5px', borderRadius: 3,
                background: 'rgba(255,255,255,0.08)', marginLeft: 4,
              }}>
                {h.key}
              </span> {h.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// #endregion

// #region Helpers

/** Category header with icon and label */
function CategoryHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, color,
      padding: '10px 12px 4px',
      display: 'flex', alignItems: 'center', gap: 6,
      textTransform: 'uppercase',
    }}>
      {icon} {label}
    </div>
  );
}

/** Render a single command item */
function renderCommandItem(
  item: CommandItem,
  allFiltered: CommandItem[],
  selectedIndex: number,
  _localIndex: number,
  highlightColor: string,
) {
  const globalIdx = allFiltered.indexOf(item);
  const isSelected = globalIdx === selectedIndex;
  return (
    <button
      key={`${item.category}-${item.label}`}
      onClick={item.action}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', borderRadius: 8, border: 'none',
        background: isSelected ? `${highlightColor}15` : 'transparent',
        cursor: 'pointer', fontFamily: 'Heebo, sans-serif', textAlign: 'right',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: '1rem' }}>{item.emoji}</span>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '0.88rem', fontWeight: 600,
          color: isSelected ? highlightColor : '#e2e8f0',
        }}>
          {item.label}
        </span>
        {item.hint && (
          <span style={{ fontSize: '0.68rem', color: '#475569', marginTop: 1 }}>
            {item.hint}
          </span>
        )}
      </span>
      <ArrowLeft size={12} color="#64748b" />
    </button>
  );
}

// #endregion
