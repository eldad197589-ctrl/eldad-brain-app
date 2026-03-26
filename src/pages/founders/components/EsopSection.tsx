/* ====================================================
   FILE: EsopSection.tsx
   PURPOSE: Founders portal section showing ESOP pool and cap table comparison
   DEPENDENCIES: constants, agreementData
   ==================================================== */

// #region Imports
import { ESOP_TABLE } from '../constants';
import { EQUITY_TABLE } from '../../agreement/agreementData';
import { Users } from 'lucide-react';
// #endregion

// #region Component
/**
 * EsopSection — Displays ESOP pool allocation and historical vs current cap table.
 */
export default function EsopSection() {
  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '20px 0' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(124,58,237,0.05))',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 16, padding: '24px', marginBottom: 32
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px', color: '#c4b5fd' }}>
          <Users /> מאגר דילול (ESOP / משקיעים) — 20.00%
        </h2>
        <p style={{ color: '#ddd6fe', lineHeight: 1.6, margin: 0 }}>
          חלוקה שווה לכל מייסד ({EQUITY_TABLE[0].percent}) יחד עם הקצאה של {EQUITY_TABLE[3].percent} למאגר. 
          גישה זו מבטיחה שיש לנו כלים לגייס טאלנטים איכותיים, לתגמל שותפים אסטרטגיים בהמשך הדרך (Earn-out), 
          ולהכניס משקיעים מבלי לייבש את אחזקות המייסדים. השותפות נושאת בסיכון הדילול פרו-ראטה (Pro-Rata).
        </p>
      </div>

      <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 24, color: '#f8fafc' }}>
        סטטוס Cap Table נוכחי
      </h3>

      <div style={{ overflowX: 'auto', background: 'var(--surface, #111827)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 600 }}>שותף / רכיב</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 600 }}>חלוקה היסטורית (3.3)</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 600 }}>חלוקה מעודכנת בסופי</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 600 }}>פער (דילול הדדי)</th>
            </tr>
          </thead>
          <tbody>
            {ESOP_TABLE.map((row, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: row.highlight ? 'rgba(139,92,246,0.1)' : 'transparent',
                opacity: row.subtle ? 0.8 : 1
              }}>
                <td style={{ padding: '16px 20px', fontWeight: row.highlight ? 700 : 500, color: row.highlight ? '#a78bfa' : '#e2e8f0' }}>{row.name}</td>
                <td style={{ padding: '16px 20px', color: '#ef4444', textDecoration: 'line-through', opacity: 0.7 }}>{row.before}</td>
                <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 700 }}>{row.afterCurrent}</td>
                <td style={{ padding: '16px 20px', color: row.currentDelta.startsWith('-') ? '#f59e0b' : '#3b82f6', direction: 'ltr', textAlign: 'right' }}>
                  {row.currentDelta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
