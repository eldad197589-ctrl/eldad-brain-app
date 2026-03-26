/* ============================================
   FILE: ClauseCard.tsx
   PURPOSE: ClauseCardComponent component
   DEPENDENCIES: None (local only)
   EXPORTS: ClauseCardComponent (default)
   ============================================ */
/**
 * ClauseCardComponent — Renders a single founders agreement clause card
 */
// #region Imports

import type { ClauseCard } from '../constants';


// #endregion

// #region Types

interface Props {
  clause: ClauseCard;
}


// #endregion

// #region Component

/** ClauseCardComponent component — ClauseCardComponent component */
export default function ClauseCardComponent({ clause }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: 24, borderRight: `4px solid ${clause.color}`, transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
          background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontFamily: 'monospace',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>{clause.clauseNum}</span>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{clause.title}</h3>
      </div>
      <div style={{
        background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.04)', marginBottom: 14, fontSize: '0.82rem',
      }}>
        <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
          לשון ההסכם
        </span>
        <span style={{ color: '#cbd5e1' }}>{clause.legalText}</span>
      </div>
      <div style={{
        background: `${clause.color}11`, padding: 16, borderRadius: 10,
        border: `1px solid ${clause.color}33`,
      }}>
        {clause.disclaimer && (
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: 8, margin: '0 0 8px' }}>
            {clause.disclaimer}
          </p>
        )}
        <p style={{ color: '#f8fafc', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
          {clause.question}
        </p>
      </div>
    </div>
  );
}

// #endregion
