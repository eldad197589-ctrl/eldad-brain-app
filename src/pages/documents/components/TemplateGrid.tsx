/* ============================================
   FILE: TemplateGrid.tsx
   PURPOSE: TemplateGrid component
   DEPENDENCIES: lucide-react
   EXPORTS: TemplateGrid (default)
   ============================================ */
/**
 * TemplateGrid — List of templates for a selected category
 *
 * FILE: components/TemplateGrid.tsx
 * PURPOSE: Displays templates filtered by category with search.
 *          Includes breadcrumb navigation back to categories.
 * DEPENDENCIES: ../types, ../constants
 */
import { ArrowRight, Search } from 'lucide-react';
import type { LetterTemplate, CategoryId } from '../types';
import { CATEGORIES, getTemplatesByCategory, searchTemplates } from '../constants';

// #region Types

/** Props for TemplateGrid */
interface Props {
  /** Currently active category */
  category: CategoryId;
  /** Search query text */
  searchQuery: string;
  /** Fires when search text changes */
  onSearchChange: (query: string) => void;
  /** Fires when a template is selected */
  onSelect: (template: LetterTemplate) => void;
  /** Fires when user clicks "back to categories" */
  onBack: () => void;
}

// #endregion

// #region Component

/**
 * Renders a filterable list of letter templates for the selected category.
 *
 * @example
 * <TemplateGrid category="tax_authorities" searchQuery="" onSearchChange={f} onSelect={f} onBack={f} />
 */
export default function TemplateGrid({ category, searchQuery, onSearchChange, onSelect, onBack }: Props) {
  const cat = CATEGORIES.find(c => c.id === category);
  const templates = searchQuery.length > 1
    ? searchTemplates(searchQuery).filter(t => t.category === category)
    : getTemplatesByCategory(category);

  return (
    <div>
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          background: 'none', border: 'none', color: '#60a5fa',
          fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          fontWeight: 600,
        }}
      >
        <ArrowRight size={16} /> חזרה לקטגוריות
      </button>

      {/* Category Header */}
      {cat && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${cat.color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <cat.icon size={22} style={{ color: cat.color }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#e2e8f0' }}>
              {cat.label}
            </h2>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
              {templates.length} תבניות זמינות
            </span>
          </div>
        </div>
      )}

      {/* Search in category */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', right: 12, top: 11, color: '#64748b' }} />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="חפש בקטגוריה..."
          style={{
            width: '100%', padding: '10px 38px 10px 14px',
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
            fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif', outline: 'none',
          }}
        />
      </div>

      {/* Template List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {templates.length === 0 && (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>
            לא נמצאו תבניות. נסה חיפוש אחר.
          </p>
        )}
        {templates.map(tmpl => (
          <TemplateRow key={tmpl.id} template={tmpl} color={cat?.color || '#94a3b8'} onClick={() => onSelect(tmpl)} />
        ))}
      </div>
    </div>
  );
}

// #endregion

// #region Subcomponents

/** Single template row */
function TemplateRow({ template, color, onClick }: {
  template: LetterTemplate; color: string; onClick: () => void;
}) {
  const Icon = template.icon;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 20px', borderRadius: 12, border: 'none',
        background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
        fontFamily: 'Heebo, sans-serif', textAlign: 'right',
        transition: 'all 0.2s', width: '100%',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}10`;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${color}30`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.05)';
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}12`, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>
          {template.title}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 2 }}>
          {template.description}
        </div>
      </div>
      <ArrowRight size={16} style={{ color: '#475569', transform: 'rotate(180deg)' }} />
    </button>
  );
}

// #endregion
