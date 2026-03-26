/* ====================================================
   FILE: OsnatSection.tsx
   PURPOSE: Founders portal section displaying Osnat's CRO/HR role, equity, and KPIs
   DEPENDENCIES: ClauseCard, constants, agreementData
   ==================================================== */

// #region Imports
import ClauseCardComponent from './ClauseCard';
import { OSNAT_CLAUSES } from '../constants';
import { EQUITY_TABLE } from '../../agreement/agreementData';
import { TrendingUp, Handshake } from 'lucide-react';
// #endregion

// #region Component
/**
 * OsnatSection — Displays Osnat's CRO/HR founder profile, equity stake, and KPI clause cards.
 */
export default function OsnatSection() {
  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '20px 0' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.05))',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 16, padding: '24px', marginBottom: 32
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px', color: '#fcd34d' }}>
          <TrendingUp /> CRO / HR (מסלול מנכ"לית) — {EQUITY_TABLE[2].percent}
        </h2>
        <p style={{ color: '#fed7aa', lineHeight: 1.6, margin: 0 }}>
          אוסנת משמשת כ-CRO / HR עם מסלול למנכ"לות תפעולית. המיקוד: רגולציה, משפטים, HR,
          לקוחות מוסדיים ועסקאות סטרטגיות. האחוזים כפופים ל-Vesting ו-Earn-out מבוססי ביצועים
          (3 פיילוטים מוסדיים + ARR מוסכם).
        </p>
      </div>

      <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 24, color: '#f8fafc' }}>
        <Handshake size={20} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
        יעדי ביצוע חוזיים (KPIs)
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {OSNAT_CLAUSES.map(clause => (
          <ClauseCardComponent key={clause.title} clause={clause} />
        ))}
      </div>
    </div>
  );
}
