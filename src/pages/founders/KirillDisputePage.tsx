/* ====================================================
   FILE: KirillDisputePage.tsx
   PURPOSE: Negotiation prep page — balanced analysis of Kirill's CTO position vs agreement
   DEPENDENCIES: agreementData, react-router-dom, lucide-react
   ==================================================== */

// #region Imports
import { Link } from 'react-router-dom';
import { Scale, ArrowRight, ShieldCheck, Brain, Code2, Handshake, FileCheck } from 'lucide-react';
import { AGREEMENT_CLAUSES } from '../agreement/agreementData';
// #endregion

// #region Component
/**
 * KirillDisputePage — Negotiation prep: balanced analysis of Kirill's position vs agreement
 */
export default function KirillDisputePage() {
  return (
    <div className="page-container fade-in" style={{ maxWidth: 900, margin: '0 auto', paddingTop: 20 }}>
      {/* Header */}
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px', color: '#60a5fa', fontSize: '2.2rem' }}>
        <Scale size={36} /> הכנה למשא ומתן: סוגיות מול קיריל
      </h1>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <Link to="/founders" className="flow-nav-btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <ArrowRight size={16} /> חזרה לפורטל מייסדים
        </Link>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 40 }}>
        מסמך זה מנתח באופן מאוזן את נקודות המחלוקת העיקריות עם ה-CTO (קיריל יאקימנקו) לקראת פגישת החתימה.
        המטרה: להגיע להסכם הוגן, שמכבד את התרומה של כל מייסד ונראה מקצועי למשקיעים.
      </p>

      {/* Resolution Banner */}
      <div style={{
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRight: '4px solid #10b981',
        padding: 24, borderRadius: 12, marginBottom: 40
      }}>
        <h2 style={{ color: '#6ee7b7', margin: '0 0 12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck /> הפתרון בהסכם הסופי (v10)
        </h2>
        <p style={{ color: '#a7f3d0', margin: 0, lineHeight: 1.6 }}>
          ההסכם מכיר מפורשות ב-IP של קיריל (סעיף 6.2), מעניק לו License מלא בפירוק (8.2), מבטיח 250א"ש Sweat Equity (5.1), 
          ו-BMBY למקרה של Deadlock (3.3.3). כל ה-IP משויך לחברה (Clean IP Assignment) – סטנדרט VC מחייב.
        </p>
      </div>

      {/* Grid of Topics */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        נקודות מפתח לדיון
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr)', gap: 24 }}>
        
        {/* Topic 1: IP */}
        <div style={{ background: 'var(--surface, #1e293b)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
          <h3 style={{ color: '#3b82f6', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain size={20} /> בעלות על הקניין הרוחני (IP)
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>
            <strong>עמדת קיריל (מקורית):</strong> 60% אקוויטי + חברת Holding נפרדת שמחזיקה ב-IP
          </p>
          <div style={{ background: 'rgba(59,130,246,0.08)', padding: 16, borderRadius: 8, marginBottom: 12 }}>
            <strong style={{ color: '#93c5fd' }}>למה זה בעייתי:</strong>
            <p style={{ color: '#cbd5e1', margin: '8px 0 0', fontSize: '0.9rem', lineHeight: 1.6 }}>
              VC לא ישקיע בחברה ש-IP שלה שייך לחברה פרטית של ה-CTO (VC Red Flag). 
              סעיף 132 לחוק הפטנטים קובע שאמצאת שירות שייכת למעסיק.
            </p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.08)', padding: 16, borderRadius: 8, color: '#6ee7b7', fontSize: '0.9rem' }}>
            <strong>הפתרון בהסכם:</strong> IP Assignment מלא (6.1) + הכרה מפורשת ב-IP הטכנולוגי של קיריל (6.2) + License בפירוק (8.2). 
            קיריל מקבל קרדיט מלא כיוצר, אבל ה-IP בבעלות החברה.
          </div>
        </div>

        {/* Topic 2: Valuation */}
        <div style={{ background: 'var(--surface, #1e293b)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
          <h3 style={{ color: '#10b981', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Code2 size={20} /> שווי הוגן ומנגנון יציאה
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>
            <strong>חשש של קיריל:</strong> "אם אעזוב, אקבל ערך נקוב ואפסידהכל"
          </p>
          <div style={{ background: 'rgba(16,185,129,0.08)', padding: 16, borderRadius: 8, color: '#6ee7b7', fontSize: '0.9rem' }}>
            <strong>הפתרון בהסכם:</strong> Good Leaver שומר על מניות שהבשילו (3.3.1). 
            מכירת מניות – לפי FMV (שווי הוגן) ולא ערך נקוב (3.3.2). 
            BMBY מבטיח שהמחיר הוגן כי המציע עלול להיות הנקנה (3.3.3).
            <br /><strong>הפסיקה תומכת:</strong> ת"א 1125/05, ע"א 8712/13, רע"א 5596/00.
          </div>
        </div>

        {/* Topic 3: Equal Recognition */}
        <div style={{ background: 'var(--surface, #1e293b)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
          <h3 style={{ color: '#f59e0b', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Handshake size={20} /> הכרה הדדית בתרומה
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>
            <strong>העיקרון:</strong> אלדד וקיריל שניהם "שמו את כל הביצים בסל אחד" – 5 חודשים ללא שכר
          </p>
          <div style={{ background: 'rgba(245,158,11,0.08)', padding: 16, borderRadius: 8, color: '#fcd34d', fontSize: '0.9rem' }}>
            <strong>מה ההסכם אומר:</strong>
            <ul style={{ margin: '8px 0 0', paddingRight: 20 }}>
              <li>250,000 ₪ לאלדד + 250,000 ₪ לקיריל = Sweat Equity שווה ושמרני (5.1)</li>
              <li>"המוח העסקי" של אלדד ו"המוח האלגוריתמי" של קיריל – שניהם מוכרים כ-IP (6.2)</li>
              <li>שכר מטרה זהה: {(() => { const c = AGREEMENT_CLAUSES.find(x => x.id === 'clause-7')?.subClauses.find(s => s.id === '7.4'); return c ? c.text.split(':')[0] : '35,000–45,000 ₪'; })()} (7.4)</li>
              <li>License לקוד בפירוק – כדי שקיריל לא יאבד את מפעל חייו (8.2)</li>
            </ul>
          </div>
        </div>

        {/* Topic 4: Vesting */}
        <div style={{ background: 'var(--surface, #1e293b)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
          <h3 style={{ color: '#a78bfa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileCheck size={20} /> Vesting ו-Bad Leaver – הגנה הדדית
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>
            <strong>חשש של קיריל:</strong> "יסיימו אותי ויקחו לי את הכל"
          </p>
          <div style={{ background: 'rgba(167,139,250,0.08)', padding: 16, borderRadius: 8, color: '#c4b5fd', fontSize: '0.9rem' }}>
            <strong>ההגנות:</strong>
            <ul style={{ margin: '8px 0 0', paddingRight: 20 }}>
              <li><strong>Cliff שנה:</strong> סטנדרט VC – חל על כולם באופן שווה</li>
              <li><strong>"Cause" מצומצם:</strong> רק הפרת אמונים מוכחת / פלילים / גניבת IP</li>
              <li><strong>אי-עמידה ביעדים ≠ Bad Leaver:</strong> עוגן מפורשות בהסכם</li>
              <li><strong>BMBY:</strong> תמיד אפשר "לקנות את השני" אם יש Deadlock</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
