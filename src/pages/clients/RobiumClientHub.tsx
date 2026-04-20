/* ============================================
   FILE: RobiumClientHub.tsx
   PURPOSE: Client-scoped profile for Robium L.T.D — VIP internal project
   DEPENDENCIES: react, react-router-dom, lucide-react
   EXPORTS: RobiumClientHub (default)
   ============================================ */
/**
 * RobiumClientHub — Client entity view for Robium.
 *
 * Robium is treated as a managed client/project of the CPA office,
 * not as a separate top-level navigation section.
 * This page aggregates links to all Robium sub-sections:
 *   - Products & Comparison
 *   - Founders Agreement & Review
 *   - Incubator & ESOP
 *   - Kirill Dispute
 *
 * All routes remain backward compatible — this is a navigation shell only.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

// #region Types

interface HubCard {
  /** Card emoji */
  emoji: string;
  /** Card title */
  title: string;
  /** Card description */
  desc: string;
  /** Route to navigate to */
  route: string;
  /** Accent color */
  color: string;
}

// #endregion

// #region Data

const ROBIUM_SECTIONS: { label: string; emoji: string; cards: HubCard[] }[] = [
  {
    label: 'ליבה עסקית',
    emoji: '🎯',
    cards: [
      { emoji: '📋', title: 'ניהול יעדים ועימות', desc: 'מייסדים · Cap Table · KPIs', route: '/founders', color: '#ec4899' },
      { emoji: '📦', title: 'תיק מוצרי הליבה', desc: 'מוצרים · תכולת שירות', route: '/products', color: '#8b5cf6' },
      { emoji: '📊', title: 'ניתוח מתחרים', desc: 'Comparison · Market Analysis', route: '/comparison', color: '#06b6d4' },
    ],
  },
  {
    label: 'הסכם מייסדים',
    emoji: '⚖️',
    cards: [
      { emoji: '🤝', title: 'סקירת ההסכם הסופי', desc: 'V3 — Review & Approve', route: '/agreement/review', color: '#10b981' },
      { emoji: '📊', title: 'השוואת סעיפים', desc: 'Diff בין גרסאות', route: '/agreement/diff', color: '#f59e0b' },
      { emoji: '🤖', title: 'סוכן שינויים חוזי', desc: 'Document Change Agent', route: '/document-change-agent', color: '#3b82f6' },
      { emoji: '⚠️', title: 'עימות משפטי — קירילאנו', desc: 'דיספיוט · תיעוד', route: '/founders/kirill-dispute', color: '#ef4444' },
    ],
  },
  {
    label: 'חממה טכנולוגית',
    emoji: '🧪',
    cards: [
      { emoji: '🧑‍💻', title: 'צוות ומתמחים', desc: 'נציגי חממה · סטטוס', route: '/incubator', color: '#a855f7' },
      { emoji: '📑', title: 'הסכמי חממה (ESOP)', desc: 'אופציות · הענקות', route: '/incubator/agreements', color: '#7c3aed' },
    ],
  },
  {
    label: 'ארכיון הסכמים',
    emoji: '📜',
    cards: [
      { emoji: '📄', title: 'טיוטה סופית (25/03)', desc: 'הסכם אחרון שנחתם', route: '/agreement', color: '#64748b' },
      { emoji: '📝', title: 'טיוטה מעודכנת (11/03)', desc: 'גרסה קודמת', route: '/agreement/legacy', color: '#475569' },
      { emoji: '📜', title: 'הסכם מקורי (3.3.26)', desc: 'גרסה ראשונה', route: '/agreement/original', color: '#334155' },
    ],
  },
];

// #endregion

// #region Component

/** RobiumClientHub — Client file for Robium L.T.D */
export default function RobiumClientHub() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate('/clients')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
            background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Heebo, sans-serif',
          }}
        >
          <ArrowLeft size={16} /> חזרה לרשימת לקוחות
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#f1f5f9' }}>
              🚀 Robium L.T.D
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
              פרויקט VIP פנימי · שותפות רשומה · AI Document Processing
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'פעיל', color: '#10b981' },
            { label: 'הסכם מייסדים: V3', color: '#3b82f6' },
            { label: 'חממה: 4 עובדים', color: '#a855f7' },
          ].map(b => (
            <span key={b.label} style={{
              padding: '4px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
              background: `${b.color}1A`, color: b.color, border: `1px solid ${b.color}33`,
            }}>
              {b.label}
            </span>
          ))}
        </div>
      </header>

      {/* Section Cards */}
      {ROBIUM_SECTIONS.map(section => (
        <div key={section.label} style={{ marginBottom: 28 }}>
          <h2 style={{
            fontSize: '1rem', fontWeight: 700, color: '#c9a84c', margin: '0 0 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{section.emoji}</span> {section.label}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
          }}>
            {section.cards.map(card => (
              <button
                key={card.route}
                onClick={() => navigate(card.route)}
                style={{
                  textAlign: 'right',
                  padding: '18px 20px',
                  borderRadius: 14,
                  border: `1px solid ${card.color}33`,
                  background: `linear-gradient(135deg, ${card.color}08, rgba(15,23,42,0.6))`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Heebo, sans-serif',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${card.color}66`;
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${card.color}33`;
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{card.emoji}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{card.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// #endregion
