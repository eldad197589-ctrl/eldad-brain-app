/**
 * EldadSection — CEO negotiation playbook (private)
 */
import { Shield } from 'lucide-react';

export default function EldadSection() {
  return (
    <div>
      <div style={{
        background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, borderTop: '4px solid #94a3b8',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ padding: 12, background: 'rgba(148,163,184,0.1)', borderRadius: 10, flexShrink: 0, height: 'fit-content' }}>
            <Shield size={28} color="#94a3b8" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 700 }}>מערך שיחה למנכ"ל (לקראת הפגישה)</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
              אזור זה מיועד לעיניך בלבד (אלדד). זהו התסריט שלך לפתיחת פורטל העימות מבלי לייצר אנטגוניזם.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 28,
        border: '1px solid rgba(255,255,255,0.06)', borderLeft: '4px solid #f59e0b', marginBottom: 24,
      }}>
        <h3 style={{ color: '#fbbf24', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem' }}>
          פתיח מומלץ למשא ומתן:
        </h3>
        <div style={{
          background: 'rgba(0,0,0,0.3)', padding: 24, borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.04)', fontStyle: 'italic',
          color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.9, marginBottom: 24,
        }}>
          "חברים, אנחנו נכנסים לליגה של הגדולים. כדי שלא ניפול על משברי אמון או ציפיות בעוד חצי שנה,
          פירקתי את ההסכם לחובות וזכויות מעשיות. זה לא מסמך 'יהיה בסדר'. כל אחד צריך להוכיח לעצמו ולשותפיו
          שהוא מסוגל לעמוד באחריות שלו מול ההסכם.
          <br /><br />
          הכנתי לכם פורטל הערות אישי – המטרה היא שכל אחד מאיתנו פשוט יעבור על סעיפי הליבה שלו, יסתכל להסכם
          בעיניים, ויאשרר את יכולתו לעמוד באופן מדיד ושקוף ביעדים ובאחריות שחלים עליו."
        </div>

        <h3 style={{ color: '#fbbf24', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem' }}>
          אסטרטגיה מול הפוליטיקה:
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>1</span>
            <div>
              <strong style={{ color: '#f8fafc', display: 'block', marginBottom: 4 }}>אל תשמש "שוטר רע" במקום קיריל</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7 }}>
                צילומי המסך חושפים את פילוסופיית הפעולה של קיריל: הוא רוצה ששותף ג' יעזוב/ירד ל-3%,
                ומשתמש בך לבצע את ה-"חיסול" כי הוא מזהה שחיקה רגשית מצידך.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>2</span>
            <div>
              <strong style={{ color: '#f8fafc', display: 'block', marginBottom: 4 }}>השתמש ב"מראה החוזית"</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7 }}>
                במקום להגיד "את לא עושה כלום", תציג את הנספחים הנ"ל בצורה קרה ואובייקטיבית. אם השותף לא
                תוכל להתחייב להכנסת מערכות מוסדיות או מכסות AI – ההסכם עצמו ידחוף אותה החוצה.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
