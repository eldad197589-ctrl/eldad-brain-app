/* ====================================================
   FILE: KirillSection.tsx
   PURPOSE: Founders portal section analyzing Kirill's CTO equity position and KPIs
   DEPENDENCIES: ClauseCard, constants, agreementData
   ==================================================== */

// #region Imports
import ClauseCardComponent from './ClauseCard';
import { KIRILL_CLAUSES } from '../constants';
import { EQUITY_TABLE } from '../../agreement/agreementData';
import { Code, TerminalSquare } from 'lucide-react';
// #endregion

// #region Component
/**
 * KirillSection — Displays Kirill's CTO role, equity claim analysis, and KPI clause cards.
 */
export default function KirillSection() {
  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '20px 0' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 16, padding: '24px', marginBottom: 32
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px', color: '#6ee7b7' }}>
          <Code /> ניתוח דרישת אקוויטי וריבונות IP (CTO) — 60.00% / {EQUITY_TABLE[1].percent}
        </h2>
        <p style={{ color: '#a7f3d0', lineHeight: 1.6, margin: 0 }}>
          קיריל מציע חלוקה של 60% לטובתו בתוספת החזקת ה-IP בחברת Holding נפרדת. 
          <strong>הסכנה:</strong> מבנה כזה הופך את רשת הפצת הידע והלוגיקה העסקית (25 שנות ניסיון של אלדד) 
          לפיצ'ר שולי של כלי טכנולוגי גנרי. Robium לעולם לא תוכל לגייס הון ממשקיעים (VC) אם הליבה הטכנולוגית 
          שלה נמצאת מחוץ לחברה בידיים של המפתח הראשי בלבד.
        </p>
      </div>

      <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 24, color: '#f8fafc' }}>
        <TerminalSquare size={20} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
        יעדי ביצוע חוזיים (KPIs)
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {KIRILL_CLAUSES.map(clause => (
          <ClauseCardComponent key={clause.title} clause={clause} />
        ))}
      </div>
    </div>
  );
}
