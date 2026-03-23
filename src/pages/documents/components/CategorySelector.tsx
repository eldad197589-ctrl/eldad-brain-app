/**
 * CategorySelector — Grid of document category cards
 *
 * FILE: components/CategorySelector.tsx
 * PURPOSE: Shows a grid of document categories (tax, insurance, banking, etc.)
 *          with icon, label, and template count. Click to enter category.
 * DEPENDENCIES: ../types, ../constants
 */
import { FileText, Search } from 'lucide-react';
import type { LetterCategory, CategoryId } from '../types';
import { CATEGORIES, getTemplatesByCategory } from '../constants';

// #region Types

/** Props for CategorySelector */
interface Props {
  /** Callback when user selects a category */
  onSelect: (categoryId: CategoryId) => void;
  /** Search text from parent (used for quick search) */
  searchQuery: string;
  /** Callback when search text changes */
  onSearchChange: (query: string) => void;
  /** Callback to open the PDF form filler (optional) */
  onFormFiller?: () => void;
}

// #endregion

// #region Component

/**
 * Renders a grid of document categories as glass-morphism cards.
 *
 * @example
 * <CategorySelector onSelect={setCategory} searchQuery="" onSearchChange={setSearch} />
 */
export default function CategorySelector({ onSelect, searchQuery, onSearchChange, onFormFiller }: Props) {
  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          padding: '8px 24px', borderRadius: 16,
          background: 'rgba(99,102,241,0.08)',
        }}>
          <FileText size={28} style={{ color: '#818cf8' }} />
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg, #818cf8, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>בוט מילוי מסמכים</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 8 }}>
          בחר קטגוריה להתחיל. כל מסמך יוצא מוכן עם לוגו וחתימה.
        </p>
      </div>

      {/* Search */}
      <div style={{
        position: 'relative', maxWidth: 400, margin: '0 auto 28px',
      }}>
        <Search size={18} style={{ position: 'absolute', right: 14, top: 12, color: '#64748b' }} />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="חפש תבנית..."
          style={{
            width: '100%', padding: '11px 42px 11px 16px',
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
            fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
            outline: 'none',
          }}
        />
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16, padding: '0 16px',
      }}>
        {CATEGORIES.map(cat => (
          <CategoryCard key={cat.id} category={cat} onClick={() => onSelect(cat.id)} />
        ))}
      </div>

      {/* Form Filler CTA */}
      {onFormFiller && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button onClick={onFormFiller} style={{
            padding: '14px 32px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))',
            cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
            boxShadow: '0 0 0 1px rgba(251,191,36,0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.2))';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <span style={{ fontSize: '1.3rem', marginLeft: 8 }}>📋</span>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1rem' }}>ייפוי כוח — טופס 2279</span>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginTop: 4 }}>
              מילוי אוטומטי של PDF רשמי
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// #endregion

// #region Subcomponents

/** Single category card */
function CategoryCard({ category, onClick }: { category: LetterCategory; onClick: () => void }) {
  const count = getTemplatesByCategory(category.id).length;
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12, padding: '28px 20px', borderRadius: 16, border: 'none',
        background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
        transition: 'all 0.3s', fontFamily: 'Heebo, sans-serif',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${category.color}15`;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${category.color}20, 0 0 0 1px ${category.color}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06)';
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${category.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={26} style={{ color: category.color }} />
      </div>
      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem' }}>{category.label}</span>
      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{count} תבניות</span>
    </button>
  );
}

// #endregion
