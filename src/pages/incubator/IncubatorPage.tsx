/* ============================================
   FILE: IncubatorPage.tsx
   PURPOSE: Incubator page — team overview with individual KPIs
   DEPENDENCIES: incubatorData.ts, MemberCard, lucide-react, react-router-dom
   EXPORTS: IncubatorPage (default)
   ============================================ */

// #region Imports
import { Link } from 'react-router-dom';
import { Home, Users, Sparkles, PieChart } from 'lucide-react';
import { INCUBATOR_MEMBERS } from '../../data/incubatorData';
import { EQUITY_TABLE } from '../agreement/agreementData';
import MemberCard from './components/MemberCard';
// #endregion

// #region Component

/**
 * IncubatorPage — Full incubator team page with Cap Table, mechanism, and member cards
 */
export default function IncubatorPage() {
  /** Founders equity (all rows except last = ESOP) */
  const esopRow = EQUITY_TABLE[EQUITY_TABLE.length - 1];
  const foundersRows = EQUITY_TABLE.slice(0, -1);
  const foundersPercent = foundersRows.reduce((acc, r) => acc + parseFloat(r.percent), 0).toFixed(1);
  const esopPercent = esopRow.percent;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 60px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, fontSize: '0.82rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Home size={14} /> ראשי
        </Link>
        <span style={{ color: '#334155' }}>/</span>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>תוכנית החממה</span>
      </div>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 999,
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          marginBottom: 16,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Robium ESOP & Incubator
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
          תוכנית{' '}
          <span style={{
            background: 'linear-gradient(to left, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            החממה לעובדים מייסדים
          </span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 700, margin: '0 auto', lineHeight: 1.7 }}>
          מתוך הבנה שהון אנושי הוא סוד ההצלחה של רוביום, אנו חושפים את נבחרת "העובדים המייסדים".
          כל עובד מקבל את זכויותיו ממאגר ה-{esopPercent} (ESOP) בכפוף להסכמי חממה ותפוקה מוכחת (Vesting).
        </p>
      </header>

      {/* Mechanism + Cap Table */}
      <section style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '3px solid #6366f1',
        borderRadius: 20, padding: 32, marginBottom: 48,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {/* Left: How it works */}
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="#818cf8" /> איך עובד הסכם החממה? (מריטוקרטיה)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: 14, lineHeight: 1.6 }}>
              עובדים אסטרטגיים מקבלים הצעת מניות (אופציות) מהמאגר המשותף שהקצו המייסדים. הזכויות אינן "מתנת חינם".
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '✓', title: 'מבוסס יעדים (KPIs)', desc: 'המניות מבשילות לאורך זמן וכנגד השגת יעדים ברורים — לכל תפקיד מדדים ייחודיים.' },
                { icon: '✓', title: 'תקופת הבשלה (Vesting)', desc: 'עובד נדרש למינימום זמן והוכחת נאמנות. מי שעוזב מוקדם — מאבד את האופציות למאגר.' },
                { icon: '✓', title: 'הוכחת שירות (Proof of Value)', desc: 'אם אתה מנהל מכירות, אתה נמדד בהכנסות. אם את מהנדסת, בספרינטים של קוד.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: '#34d399', fontWeight: 700, marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    <strong>{item.title}:</strong> {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cap Table */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            padding: 24, borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h3 style={{ color: '#818cf8', fontWeight: 700, marginBottom: 20, textAlign: 'center', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <PieChart size={18} /> חלוקת הון השותפות (Cap Table)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Founders bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ color: '#cbd5e1' }}>מייסדים (Tech, Logic & Strategy)</span>
                  <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{foundersPercent}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#334155', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${foundersPercent}%`, height: '100%', background: '#3b82f6', borderRadius: 10 }} />
                </div>
              </div>
              {/* ESOP bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>מאגר חממה (ESOP למועמדים למטה)</span>
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>{esopPercent}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#334155', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: esopPercent, height: '100%',
                    background: '#f59e0b', borderRadius: 10,
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)',
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Title */}
      <h2 style={{
        fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 32, color: '#f1f5f9',
        textShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <Users size={24} color="#818cf8" /> נבחרת העובדים המייסדים — מחזור א׳
      </h2>

      {/* Member Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: 24,
      }}>
        {INCUBATOR_MEMBERS.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

// #endregion
