/* ============================================
   FILE: PartyCSection.tsx
   PURPOSE: PartyCSection component
   DEPENDENCIES: lucide-react
   EXPORTS: PartyCSection (default)
   ============================================ */
/**
 * PartyCSection — Confrontation zone for Party C (business development partner)
 */
import { AlertTriangle } from 'lucide-react';
import ClauseCardComponent from './ClauseCard';
import { PARTY_C_CLAUSES, ESOP_TABLE } from '../constants';

export default function PartyCSection() {
  return (
    <div>
      <div style={{
        background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, borderTop: '4px solid #f59e0b',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ padding: 12, background: 'rgba(245,158,11,0.1)', borderRadius: 10, flexShrink: 0, height: 'fit-content' }}>
            <AlertTriangle size={28} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 700 }}>אזור עימות: שותף צד ג' (פיתוח עסקי)</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
              מטרת האזור: להוציא מהשותף את ההוכחה בפועל (לא הצהרות כלליות) שהיא/הוא גורם מכירתי פעיל
              ויכול/ה לממש את הסעיפים עליהם חתם, או לחילופין – הבנה אובייקטיבית שההסכם גדול עליו בשלב זה.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16, marginBottom: 24 }}>
        {PARTY_C_CLAUSES.map((c, i) => <ClauseCardComponent key={i} clause={c} />)}
      </div>

      {/* ESOP Table */}
      <div style={{
        background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: 24, borderRight: '4px solid #ef4444',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, background: '#ef4444', color: '#fff' }}>סעיף 13א קריטי</span>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>זכויות מיעוט ב-ESOP — הגנה מדילול</h3>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 16 }}>
          מאגר ה-ESOP (10%) נלקח <strong style={{ color: '#f87171' }}>מדילול צד א' + צד ב' בלבד</strong>. צד ג' שומרת על 15%.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>שותף</th>
                <th style={{ padding: 12, textAlign: 'right', color: '#94a3b8' }}>לפני ESOP</th>
                <th style={{ padding: 12, textAlign: 'right', color: '#f87171' }}>אחרי (מצב נוכחי)</th>
                <th style={{ padding: 12, textAlign: 'right', color: '#34d399' }}>אחרי (Pro-Rata הוגן)</th>
              </tr>
            </thead>
            <tbody>
              {ESOP_TABLE.map((row, i) => (
                <tr key={i} style={{
                  background: row.highlight ? 'rgba(239,68,68,0.08)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  opacity: row.subtle ? 0.5 : 1,
                  fontSize: row.subtle ? '0.78rem' : undefined,
                }}>
                  <td style={{ padding: 12, fontWeight: 500, color: row.highlight ? '#fbbf24' : '#e2e8f0' }}>{row.name}</td>
                  <td style={{ padding: 12, color: row.highlight ? '#fbbf24' : '#e2e8f0' }}>{row.before}</td>
                  <td style={{ padding: 12, fontWeight: 700, color: '#f87171' }}>
                    {row.afterCurrent}
                    {row.currentDelta && (
                      <span style={{
                        marginRight: 6, fontSize: '0.7rem',
                        ...(row.highlight ? { padding: '2px 6px', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, background: 'rgba(239,68,68,0.1)' } : {}),
                      }}>{row.currentDelta}</span>
                    )}
                  </td>
                  <td style={{ padding: 12, fontWeight: 700, color: '#34d399' }}>
                    {row.afterFair}
                    {row.fairDelta && <span style={{ marginRight: 6, fontSize: '0.7rem', color: '#10b981' }}>{row.fairDelta}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          marginTop: 16, padding: 14, background: 'rgba(239,68,68,0.08)',
          borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <p style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 8px' }}>
            האם את מסכימה שהדילול יהיה <span style={{ color: '#fbbf24' }}>Pro-Rata</span> (כלומר גם את תרדי ל-13.5%),
            כמקובל בהסכמי מייסדים סטנדרטיים, או שאת דורשת הגנה מיוחדת על העבודה שאנחנו מייצרים במו ידינו?
          </p>
        </div>
      </div>
    </div>
  );
}
