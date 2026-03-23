import { Link } from 'react-router-dom';
import { Home, CheckCircle, ExternalLink, FileText, Paperclip, Activity } from 'lucide-react';

interface Doc {
  title: string;
  desc: string;
  type: string;
  typeColor: string;
  link: string;
  icon: React.ReactNode;
}

const PREPARED_DOCS: Doc[] = [
  {
    title: 'מכתב לבנק',
    desc: 'שחרור כספים — בנק מרכנתיל דיסקונט סניף 686',
    type: 'מכתב', typeColor: '#3b82f6',
    link: '/letter',
    icon: <FileText size={20} />,
  },
  {
    title: 'נייר עבודה — חישוב רווח הון',
    desc: 'סעיף 91 לפקודה · כולל השוואת חלופות עם/בלי פחת',
    type: 'נייר עבודה', typeColor: '#10b981',
    link: '/calculator',
    icon: <Activity size={20} />,
  },
  {
    title: 'טופס 1399 — סימולציה',
    desc: 'חישוב שומה עצמית · מס על רווח הון מנכס בחו"ל',
    type: 'טופס רשמי', typeColor: '#f59e0b',
    link: '/calculator',
    icon: <FileText size={20} />,
  },
  {
    title: 'תרשים זרימה — חישוב רווח הון',
    desc: 'תהליך מלא מאיסוף נתונים ועד אריזת תיק דיגיטלי · 7 שלבים',
    type: 'תרשים זרימה', typeColor: '#8b5cf6',
    link: '/flow/capital-gains',
    icon: <Activity size={20} />,
  },
];

const ATTACHMENTS: Doc[] = [
  {
    title: 'אסמכתא רכישה',
    desc: 'מסמך רכישת הנכס — Purchase Summary · 17/8/2017',
    type: 'PDF', typeColor: '#ef4444',
    link: '#',
    icon: <Paperclip size={20} />,
  },
  {
    title: 'אסמכתא מכירה',
    desc: 'Closing Disclosure · 6/11/2025',
    type: 'PDF', typeColor: '#ef4444',
    link: '#',
    icon: <Paperclip size={20} />,
  },
  {
    title: 'הודעה על מכירה ושומה',
    desc: 'הודעה על מכירת נכס וחישוב המס המגיע · שנת 2025',
    type: 'PDF', typeColor: '#ef4444',
    link: '#',
    icon: <Paperclip size={20} />,
  },
];

const CHECKLIST = [
  'מכתב לבנק — שחרור כספים בגין מכירת נכס בחו"ל',
  'נייר עבודה לחישוב רווח הון — סעיף 91 לפקודה',
  'טופס רשמי 1399 — הודעה על מכירת נכס וחישוב המס',
  'אסמכתאות שצורפו — מסמכי רכישה, מכירה ושומה',
];

export default function CaseHelman() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 12,
        }}>
          <Home size={14} /> חזרה לדשבורד
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>מכירת נכס בחו"ל — הלמן</h1>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,0.15)', color: '#34d399',
            padding: '5px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid rgba(16,185,129,0.3)',
          }}>
            <CheckCircle size={14} /> מוכן לשליחה
          </span>
        </div>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
          רבקה הלמן (ת.ז. 058259326) ואברהם יוסף הלמן (ת.ז. 054254370) · שנת מס 2025
        </p>
      </div>

      {/* Checklist */}
      <div style={{
        background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <CheckCircle size={20} color="#10b981" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>נושאים שטופלו</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHECKLIST.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, background: 'rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <CheckCircle size={14} color="#34d399" />
              </div>
              <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prepared Documents */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FileText size={20} color="#94a3b8" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>מסמכים שהוכנו</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {PREPARED_DOCS.map((doc, i) => (
            <DocCard key={i} doc={doc} />
          ))}
        </div>
      </section>

      {/* Attachments */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Paperclip size={20} color="#94a3b8" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>אסמכתאות שצורפו</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {ATTACHMENTS.map((doc, i) => (
            <DocCard key={i} doc={doc} />
          ))}
        </div>
      </section>
    </div>
  );
}

function DocCard({ doc }: { doc: Doc }) {
  return (
    <div style={{
      background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: 20, transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${doc.typeColor}15`, color: doc.typeColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {doc.icon}
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{doc.title}</h4>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>{doc.desc}</p>
          <span style={{
            display: 'inline-block', marginTop: 6,
            padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 600,
            background: `${doc.typeColor}15`, color: doc.typeColor,
            border: `1px solid ${doc.typeColor}33`,
          }}>{doc.type}</span>
        </div>
      </div>
      <Link to={doc.link} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 8,
        background: 'rgba(255,255,255,0.05)', color: '#e2e8f0',
        textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500,
        border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s',
      }}>
        <ExternalLink size={13} /> פתח
      </Link>
    </div>
  );
}
