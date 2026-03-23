/**
 * ListView — Flat process list view with stat cards
 */
import { Link } from 'react-router-dom';
import { Activity, Wrench, FolderOpen, CheckCircle, Clock } from 'lucide-react';

interface Props {
  neuronCount: number;
  flowchartCount: number;
}

export default function ListView({ neuronCount, flowchartCount }: Props) {
  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Activity size={28} />} number={String(flowchartCount)} label="תרשימי זרימה" color="#38bdf8" />
        <StatCard icon={<Wrench size={28} />} number="3" label="כלים פעילים" color="#a78bfa" />
        <StatCard icon={<FolderOpen size={28} />} number={String(neuronCount)} label="תהליכים מתועדים" color="#fbbf24" />
        <StatCard icon={<CheckCircle size={28} />} number="22+" label="שנות ניסיון" color="#34d399" />
      </div>

      <ProcessSection title="💰 רווח הון — מכירת נכס בחו״ל">
        <CaseCard href="/flow/capital-gains" badge="תרשים" badgeType="ready" title='תרשים זרימה — חישוב רווח הון סעיף 91' subtitle='7 שלבים · פורמולות · טופס 1399 · שע"ח' num="#1" />
        <CaseCard href="/calculator" badge="כלי" badgeType="tool" title='נייר עבודה — חישוב רווח הון (סעיף 91)' subtitle='מכירת נכס מקרקעין בחו"ל · תושב ישראל · שע"ח · אינפלציה' />
        <CaseCard href="/case/helman" badge="תיק" badgeType="pending" title='הלמן — מכירת נכס בחו"ל (Texas, USA)' subtitle='רבקה הלמן + אברהם יוסף חלפון · 333 Daleview Dr' />
        <CaseCard href="/letter" badge="כלי" badgeType="tool" title='מכתב שחרור כספים לבנק' subtitle='מכתב רשמי · שחרור נכס · חתימת רו"ח' />
      </ProcessSection>

      <ProcessSection title="🛡️ אפוטרופוס — Guardian Pro">
        <CaseCard href="/flow/guardian-pro" badge="תרשים" badgeType="ready" title='תרשים זרימה — דוח אפוטרופוס' subtitle='9 שלבים · AI סיווג · חוות דעת · דוח שנתי' num="#2" />
        <CaseCard href="/case/guardian" badge="תיק לקוח" badgeType="tool" title='דין וחשבון לאפוטרופוס — אנריקה' subtitle='דוח שינויים בהון · חוות דעת לא מסוייגת חתומה · 2024' />
      </ProcessSection>

      <ProcessSection title="⏱️ נוכחות ושכר — דיני עבודה">
        <CaseCard href="/flow/attendance" badge="תרשים" badgeType="ready" title='תרשים זרימה — מנוע נוכחות (חוק עבודה)' subtitle='6 שלבים · משמרות · שעות נוספות · חגים' num="#3" />
      </ProcessSection>

      <ProcessSection title="🎖️ פיצויי מלחמה — מס רכוש">
        <CaseCard href="/flow/war-compensation" badge="תרשים" badgeType="ready" title='תרשים זרימה — פיצויי מלחמה' subtitle='8 שלבים · 3 מסלולים · חרבות ברזל + צוק איתן' num="#4" />
      </ProcessSection>

      <ProcessSection title="⚖️ חדלות פירעון — דוח חודשי">
        <CaseCard href="/flow/insolvency" badge="תרשים" badgeType="ready" title='תרשים זרימה — חדלות פירעון' subtitle='7 שלבים · מנוע Guardian · אישור רו"ח · חודשי' num="#5" />
      </ProcessSection>

      <ProcessSection title="📝 חוות דעת כלכלית — דיני עבודה">
        <CaseCard href="/flow/expert-opinion" badge="תרשים" badgeType="ready" title='תרשים זרימה — חוות דעת כלכלית' subtitle='8 שלבים · 79 תיקים · 9 ענפים · תובע/נתבע' num="#6" />
      </ProcessSection>

      <ProcessSection title="🏢 דיווחי מוסדות — עץ דיווחים">
        <CaseCard href="/flow/institutional-reports" badge="תרשים" badgeType="ready" title='תרשים זרימה — דיווחי מוסדות' subtitle='6 שלבים · מס הכנסה · ביט"ל · מע"מ · 2017-2025' num="#7" />
      </ProcessSection>

      <ProcessSection title="📜 הצהרת הון — נוסחת איזון">
        <CaseCard href="/flow/declaration-of-capital" badge="תרשים" badgeType="ready" title='תרשים זרימה — הצהרת הון' subtitle='8 שלבים · איסוף מסמכים · קליטת נתונים · נוסחת איזון' num="#8" />
      </ProcessSection>

      <ProcessSection title="🚨 ביטול קנסות — מס הכנסה">
        <CaseCard href="/flow/penalty-cancellation" badge="תרשים" badgeType="ready" title='תרשים זרימה — ביטול קנסות מס הכנסה' subtitle='9 שלבים · skip logic · early exit · QA bot · דוד שמעון' num="#14" />
      </ProcessSection>

      {/* Pending Processes */}
      <div style={{ marginTop: 32 }}>
        <div className="section-header">
          <h2><Clock size={20} /> ⏳ תהליכים בהמתנה</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {['🏠 מיסוי מקרקעין — מס שבח, מס רכישה', '💼 החזרי מס — 13 תיקים',
            '🧮 שכר — חישוב ולשכה חכמה', '📋 הכנת דוחות כספיים',
            '🤝 התחשבנות בשותפות', '💎 ייעוץ פנסיוני', '👤 קליטת לקוח חדש — 5 שלבים',
          ].map((text, i) => (
            <div key={i} style={{
              padding: '12px 16px', fontSize: '0.82rem', color: '#94a3b8',
              background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 10, textAlign: 'right',
            }}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// #region Sub-components

function StatCard({ icon, number, label, color }: { icon: React.ReactNode; number: string; label: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.2)',
      borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ color, opacity: 0.8 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>{number}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</div>
      </div>
    </div>
  );
}

function ProcessSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div className="section-header"><h2>{title}</h2></div>
      {children}
    </section>
  );
}

function CaseCard({ href, badge, badgeType, title, subtitle, num }: {
  href: string; badge: string; badgeType: 'ready' | 'tool' | 'pending'; title: string; subtitle: string; num?: string;
}) {
  return (
    <Link to={href} className="case-card" style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className={`badge badge-${badgeType}`}>
          {badgeType === 'ready' && <CheckCircle size={12} />}
          {badge}
        </span>
        {num && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>תרשים {num}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>{title}</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
    </Link>
  );
}

// #endregion
