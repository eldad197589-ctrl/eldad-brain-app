/* ====================================================
   FILE: EldadSection.tsx
   PURPOSE: Founders portal section displaying Eldad's role, equity, and KPIs
   DEPENDENCIES: ClauseCard, constants, agreementData
   ==================================================== */

// #region Imports
import ClauseCardComponent from './ClauseCard';
import { ELDAD_CLAUSES } from '../constants';
import { EQUITY_TABLE } from '../../agreement/agreementData';
import { Shield, ShieldAlert } from 'lucide-react';
// #endregion

// #region Component
/**
 * EldadSection — Displays Eldad's founder profile, equity stake, and KPI clause cards.
 */
export default function EldadSection() {
  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '20px 0' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16, padding: '24px', marginBottom: 32
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px', color: '#93c5fd' }}>
          <Shield /> מנכ"ל זמני (Interim CEO), אדריכל הליבה העסקית — {EQUITY_TABLE[0].percent}
        </h2>
        <p style={{ color: '#bfdbfe', lineHeight: 1.6, margin: 0 }}>
          "המוח" של החברה. הידע המקצועי, המומחיות במס ומשפט של 25 שנה והאלגוריתמיקה הקוגניטיבית הם
          ה-IP החיוני ביותר ברוביום. ללא הידע הדומייני (Domain Oracle), המערכת היא טכנולוגיית כלי שרת נטולת יתרון יחסי אמיתי להציע לשוק העסקי.
        </p>
      </div>

      <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 24, color: '#f8fafc' }}>
        <ShieldAlert size={20} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
        יעדי ביצוע וסמכויות (KPIs)
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {ELDAD_CLAUSES.map(clause => (
          <ClauseCardComponent key={clause.title} clause={clause} />
        ))}
      </div>
    </div>
  );
}
