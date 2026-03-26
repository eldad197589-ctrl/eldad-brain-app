/* ============================================
   FILE: MemberCard.tsx
   PURPOSE: Incubator member card with avatar, description, KPI bars and vesting
   DEPENDENCIES: incubatorData.ts
   EXPORTS: MemberCard (default)
   ============================================ */

// #region Imports
import type { IncubatorMember } from '../../../data/incubatorData';
// #endregion

// #region Styles

/** Card container style */
const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 20,
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

/** Badge style */
const badgeStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  padding: '4px 12px',
  borderRadius: 999,
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'white',
  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
  letterSpacing: '0.03em',
};

// #endregion

// #region Types

interface Props {
  /** The incubator member data */
  member: IncubatorMember;
}

// #endregion

// #region Component

/**
 * MemberCard — Displays an incubator employee with KPI bars
 * @param props.member - The IncubatorMember to render
 */
export default function MemberCard({ member }: Props) {
  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 30px -8px rgba(0,0,0,0.35)';
        e.currentTarget.style.borderColor = `${member.accentColor}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {/* Header: Avatar + Name + Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: `linear-gradient(135deg, ${member.colorFrom}, ${member.colorTo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: '#fff',
            border: `2px solid ${member.accentColor}60`,
            boxShadow: `0 4px 15px ${member.colorFrom}40`,
          }}>
            {member.initials}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
              {member.name}
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 500, color: member.accentColor }}>
              {member.role}
            </p>
          </div>
        </div>
        <span style={badgeStyle}>ESOP Pool</span>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
        {member.description}
      </p>

      {/* KPI Section */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 14, padding: 16,
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h4 style={{
          margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 700,
          color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          מדדי ביצוע (KPIs)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {member.kpis.map(kpi => (
            <div key={kpi.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>{kpi.name}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{kpi.target}</span>
              </div>
              <div style={{ height: 5, background: '#1e293b', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${kpi.current}%`,
                  background: `linear-gradient(90deg, ${member.colorFrom}, ${member.colorTo})`,
                  borderRadius: 10,
                  transition: 'width 0.5s ease',
                  boxShadow: kpi.current > 0 ? `0 0 8px ${member.colorFrom}60` : 'none',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vesting + Milestones */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 12, padding: '12px 16px',
        borderRight: `3px solid ${member.accentColor}`,
      }}>
        <h4 style={{
          margin: '0 0 6px', fontSize: '0.72rem', fontWeight: 700,
          color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          תנאי הבשלה (Vesting) — {member.vestingPercent}%
        </h4>
        <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          {member.milestones}
        </p>
        <div style={{ height: 6, background: '#334155', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${member.vestingPercent}%`,
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            borderRadius: 10,
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
          }} />
        </div>
      </div>
    </div>
  );
}

// #endregion
