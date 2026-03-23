/* ============================================
   FILE: KirillSection.tsx
   PURPOSE: KirillSection component
   DEPENDENCIES: lucide-react
   EXPORTS: KirillSection (default)
   ============================================ */
/**
 * KirillSection — Confrontation zone for Kirill (CTO)
 */
import { Code } from 'lucide-react';
import ClauseCardComponent from './ClauseCard';
import { KIRILL_CLAUSES } from '../constants';

export default function KirillSection() {
  return (
    <div>
      <div style={{
        background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, borderTop: '4px solid #06b6d4',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ padding: 12, background: 'rgba(6,182,212,0.1)', borderRadius: 10, flexShrink: 0, height: 'fit-content' }}>
            <Code size={28} color="#06b6d4" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 700 }}>אזור עימות: קיריל יאקימנקו</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
              מטרת האזור: להזכיר לקיריל שאתה המנכ"ל ואתה רואה את התמונה כולה.
              לנטרל את ההילה של "אני כותב את הקוד אז הכל שלי", ולעמת אותו מול הניהול האסטרטגי שלך.
            </p>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {KIRILL_CLAUSES.map((c, i) => <ClauseCardComponent key={i} clause={c} />)}
      </div>
    </div>
  );
}
