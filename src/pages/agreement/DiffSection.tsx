/* ============================================
   FILE: DiffSection.tsx
   PURPOSE: Comparison section — NEW side dynamically reads from agreementData.ts
   DEPENDENCIES: react, diffData, agreementData
   EXPORTS: DiffSectionCard (default)
   ============================================ */
import { useState, useMemo } from 'react';
import type { DiffSection, BadgeType } from './diffData';
import { getClauseTexts } from './diffData';

// #region Styles

const BADGE_STYLES: Record<BadgeType, { bg: string; color: string }> = {
  critical: { bg: 'rgba(239,68,68,0.2)', color: '#fca5a5' },
  important: { bg: 'rgba(245,158,11,0.2)', color: '#fcd34d' },
  good: { bg: 'rgba(34,197,94,0.2)', color: '#86efac' },
};

const ICON_BG: Record<BadgeType, string> = {
  critical: 'rgba(239,68,68,0.15)',
  important: 'rgba(245,158,11,0.15)',
  good: 'rgba(34,197,94,0.15)',
};

// #endregion

// #region Props

interface DiffSectionCardProps {
  section: DiffSection;
  defaultOpen?: boolean;
}

// #endregion

// #region Component

/** DiffSectionCard — NEW side is LIVE from agreementData.ts, OLD side is static */
export default function DiffSectionCard({ section, defaultOpen = false }: DiffSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const badgeStyle = BADGE_STYLES[section.badge];

  // REAL SYNC: Pull live clause text from agreementData.ts
  const liveNewItems = useMemo(
    () => getClauseTexts(section.sourceClauseIds),
    [section.sourceClauseIds]
  );

  return (
    <div style={{
      background: 'rgba(30,41,59,0.6)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, overflow: 'hidden', marginBottom: 16,
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 22px', cursor: 'pointer', userSelect: 'none',
          borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div style={{
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 10, fontSize: '1.5em', background: ICON_BG[section.badge], flexShrink: 0,
        }}>
          {section.icon}
        </div>
        <h2 style={{ flex: 1, margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
          {section.title}
        </h2>
        <span style={{
          fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20,
          fontWeight: 700, background: badgeStyle.bg, color: badgeStyle.color,
        }}>
          {section.badgeLabel}
        </span>
        <span style={{
          color: '#64748b', fontSize: '1.2em', transition: 'transform 0.3s',
          transform: open ? 'rotate(180deg)' : 'none',
        }}>
          ▼
        </span>
      </div>

      {/* Body */}
      {open && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {/* NEW — LIVE from agreementData.ts */}
            <div style={{ padding: '18px 22px', background: 'rgba(34,197,94,0.04)' }}>
              <span style={{
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: 1,
                padding: '3px 10px', borderRadius: 4, display: 'inline-block', marginBottom: 12,
                background: 'rgba(34,197,94,0.2)', color: '#86efac',
              }}>
                ✅ הסכם סופי (LIVE)
              </span>
              <ul style={{ paddingRight: 16, margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.9 }}>
                {liveNewItems.map((item, i) => {
                  const bracketEnd = item.indexOf(']');
                  const clauseId = item.substring(1, bracketEnd);
                  const text = item.substring(bracketEnd + 2);
                  return (
                    <li key={i} style={{ marginBottom: 6 }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '1px 6px', borderRadius: 8, marginLeft: 6,
                        background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontFamily: 'monospace',
                      }}>
                        §{clauseId}
                      </span>
                      {' '}{text.length > 150 ? text.substring(0, 150) + '...' : text}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* OLD — static historical record */}
            <div style={{
              padding: '18px 22px', background: 'rgba(239,68,68,0.04)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: 1,
                padding: '3px 10px', borderRadius: 4, display: 'inline-block', marginBottom: 12,
                background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
              }}>
                {section.oldSide.label}
              </span>
              <p style={{
                fontWeight: 700, color: '#fff', margin: '0 0 8px', fontSize: '0.92rem',
                textDecoration: 'line-through', opacity: 0.7,
              }}>
                {section.oldSide.summary}
              </p>
              <ul style={{ paddingRight: 18, margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.8 }}>
                {section.oldSide.items.map((item, i) => (
                  <li key={i} style={{ textDecoration: 'line-through', opacity: 0.7 }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Explanation */}
          <div style={{
            padding: '14px 22px', background: 'rgba(15,23,42,0.5)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.2em', flexShrink: 0, marginTop: 2 }}>💡</span>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <strong style={{ color: '#fcd34d' }}>למה זה שונה: </strong>
              {section.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// #endregion
