/* ============================================
   FILE: ProductsPage.tsx
   PURPOSE: ProductsPage component
   DEPENDENCIES: react-router-dom, lucide-react
   EXPORTS: ProductsPage (default)
   ============================================ */
/**
 * ProductsPage — Orchestrator
 */
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  LIVE_PRODUCTS, MODULES, PARTNERSHIPS,
  ROADMAP_Q1, ROADMAP_Q2, ROADMAP_Q34,
  STATUS_BADGE,
  type RoadmapItem,
} from './constants';

export default function ProductsPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero Header */}
      <header style={{ textAlign: 'center', marginBottom: 36, position: 'relative', padding: '24px 0' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
          color: '#93c5fd', fontSize: '0.85rem', fontWeight: 700, padding: '6px 20px', borderRadius: 100, marginBottom: 16,
        }}>
          תיק מוצרים · Robium 2026
        </div>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 900, margin: '0 0 10px',
          background: 'linear-gradient(to left, #60a5fa, #fff, #c084fc)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          מה בנינו ב-5 חודשים
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 20px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          אלדד וקיריל עמלו 5 חודשים מינימום, 10+ שעות ביום, על מערכות AI מקצה לקצה.
          <br />כל מוצר כאן עובד, חי, ומוכן ללקוחות.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          {[{ n: '7+', l: 'מוצרים חיים', c: '#60a5fa' }, { n: '530K ₪', l: 'שווי IP מוערך', c: '#34d399' }, { n: '3+', l: 'שיתופי פעולה', c: '#fbbf24' }].map((s, i) => (
            <div key={i} className="brain-stat" style={{ minWidth: 120 }}>
              <div className="brain-stat-num" style={{ color: s.c }}>{s.n}</div>
              <div className="brain-stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Live Products */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 4, height: 28, background: '#10b981', borderRadius: 4 }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>מוצרים שפותחו ופועלים (Live Products)</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {LIVE_PRODUCTS.map((p, i) => {
            const badge = STATUS_BADGE[p.status];
            return (
              <div key={i} className="glass-card" style={{ padding: '22px 24px', borderTop: `3px solid ${p.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{p.emoji}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{p.name}</h3>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: `${badge.color}20`, color: badge.color }}>{badge.label}</span>
                  </div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px', lineHeight: 1.6 }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {p.link && (p.link.startsWith('http')
                    ? <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: p.color, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={14} /> {p.linkLabel || 'פתח'} ←</a>
                    : <Link to={p.link} style={{ color: p.color, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>🔗 {p.linkLabel || 'פתח'} ←</Link>
                  )}
                  {p.flowchart && <Link to={p.flowchart} style={{ color: p.color, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>📊 {p.linkLabel || 'תרשים'} ←</Link>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modules */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 4, height: 28, background: '#a855f7', borderRadius: 4 }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>מודולים ומנועים נוספים</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {MODULES.map((m, i) => (
            <Link key={i} to={m.flowchart} className="panel-link" style={{ flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 12px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Partnerships */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 4, height: 28, background: '#10b981', borderRadius: 4 }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>שיתופי פעולה אסטרטגיים (Pipeline)</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {PARTNERSHIPS.map((p, i) => (
            <div key={i} className="glass-card" style={{ padding: '22px 24px', borderTop: `3px solid ${p.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{p.emoji}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{p.name}</h3>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: `${p.color}20`, color: p.color }}>{p.status}</span>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.6 }}>{p.desc}</p>
              {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: p.color, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={14} /> צפה בתוכנית העסקית ←</a>}
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 4, height: 28, background: '#f59e0b', borderRadius: 4 }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Roadmap — המשך הדרך האסטרטגי</h2>
        </div>
        <div className="glass-card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
            <RoadmapCol title="Q1 2026 (עכשיו)" color="#60a5fa" items={ROADMAP_Q1} />
            <RoadmapCol title="Q2 2026" color="#fbbf24" items={ROADMAP_Q2} />
            <RoadmapCol title="Q3-Q4 2026" color="#f87171" items={ROADMAP_Q34} />
          </div>
        </div>
      </section>

      <div style={{
        background: 'rgba(30,41,59,0.4)', border: '1px dashed rgba(148,163,184,0.2)',
        borderRadius: 14, padding: '18px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem', marginBottom: 20,
      }}>
        <strong>הערה למנכ"ל:</strong> דף זה מיועד להצגה על מסך בזמן הפגישה. הקישורים פעילים למערכות החיות.
      </div>

      <footer style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.78rem', color: '#475569' }}>
        Robium · תיק מוצרים ואסטרטגיה · סודי ופנימי
      </footer>
    </div>
  );
}

/** Roadmap column sub-component */
function RoadmapCol({ title, color, items }: { title: string; color: string; items: RoadmapItem[] }) {
  return (
    <div>
      <div style={{ fontSize: '0.88rem', fontWeight: 700, color, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', color: '#cbd5e1' }}>
            <span style={{ color: item.done ? '#34d399' : '#475569', marginTop: 2 }}>{item.done ? '✓' : '○'}</span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
