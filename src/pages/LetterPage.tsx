import { Link } from 'react-router-dom';
import { Home, Printer, ArrowRight } from 'lucide-react';

export default function LetterPage() {
  const handlePrint = () => window.print();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}
        className="no-print"
      >
        <Link to="/case/helman" className="flow-nav-btn"><ArrowRight size={16} /> חזרה לתיק</Link>
        <Link to="/" className="flow-nav-btn"><Home size={16} /> דשבורד</Link>
        <button onClick={handlePrint} className="flow-nav-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <Printer size={16} /> הדפסה
        </button>
      </div>

      {/* Letter Page */}
      <div style={{
        background: '#fff', color: '#1e293b', borderRadius: 12,
        boxShadow: '0 4px 30px rgba(0,0,0,0.12)', overflow: 'hidden',
        minHeight: '297mm', width: '100%', maxWidth: '210mm', margin: '0 auto',
        display: 'grid', gridTemplateRows: 'auto 1fr auto',
        fontFamily: "'Heebo', 'Rubik', sans-serif",
      }}>
        {/* Header */}
        <div>
          <div style={{ padding: '20px 32px 16px', background: '#fff' }}>
            <div style={{ width: '100%', position: 'relative', minHeight: 144 }}>
              {/* Logo */}
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 120 120" style={{ height: 144, width: 'auto', maxWidth: 220 }}>
                  <text x="12" y="62" fontFamily="Georgia, serif" fontSize="56" fontWeight="bold" fill="#c9a84c">D</text>
                  <text x="48" y="44" fontFamily="Georgia, serif" fontSize="32" fill="#c9a84c">&amp;</text>
                  <text x="58" y="62" fontFamily="Georgia, serif" fontSize="56" fontWeight="bold" fill="#5b7fa5">E</text>
                  <text x="60" y="82" textAnchor="middle" fontFamily="Heebo, sans-serif" fontSize="10" fill="#5b7fa5">ניהול דוד אלדד רו"ח</text>
                  <text x="60" y="96" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6" fill="#999">David Eldad CPA Management</text>
                </svg>
              </div>
              {/* Text */}
              <div style={{ width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', lineHeight: 1.4 }}>
                  ניהול דוד אלדד רו"ח
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e3a5f', letterSpacing: 1, marginTop: 4, direction: 'ltr' }}>
                  DAVID ELDAD CPA MANAGEMENT
                </div>
                <div style={{ width: '100%', height: 1, background: '#1e293b', margin: '8px 0' }} />
                <p style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap', margin: 0 }}>
                  DORON BITON. דורון ביטון, מנהל מכירות
                </p>
              </div>
            </div>
          </div>
          {/* Gold Line */}
          <div style={{
            height: 4, width: '100%',
            background: 'linear-gradient(to left, #f59e0b, #fbbf24, #f59e0b)',
          }} />
        </div>

        {/* Content */}
        <div style={{ padding: '16px 48px', fontSize: '0.95rem', lineHeight: 1.85, color: '#1e293b' }}>
          <div style={{ textAlign: 'left', direction: 'ltr', color: '#555', fontSize: '0.85rem', marginBottom: 20 }}>
            10/02/2026
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>לכבוד</p>
            <p style={{ margin: 0 }}><strong>הנהלת בנק מרכנתיל דיסקונט</strong></p>
            <p style={{ margin: 0 }}>סניף 686</p>
          </div>

          <div style={{ marginBottom: 22, fontWeight: 700, textDecoration: 'underline', fontSize: '1rem' }}>
            הנדון: שחרור כספים בגין מכירת נכס בחו"ל – הלמן רבקה ואברהם יוסף
          </div>

          <div>
            <p style={{ marginBottom: 10, textAlign: 'justify' }}>שלום רב,</p>

            <p style={{ marginBottom: 10, textAlign: 'justify' }}>
              הננו פונים אליכם בשם מרשינו, <strong>רבקה הלמן</strong> (ת.ז. 058259326) ו<strong>אברהם יוסף הלמן</strong> (ת.ז. 054254370),
              בנוגע לכספים שהתקבלו בחשבונם שמקורם במכירת דירה בחוץ לארץ.
            </p>

            <p style={{ marginBottom: 10, textAlign: 'justify' }}>
              נמסר לנו כי כרגע נמנע מן הלקוחות לקבל את הכספים עד להנפקת דיווח ספציפי לרשות המסים.
              ברצוננו להבהיר את המצב העובדתי והמשפטי:
            </p>

            <ol style={{ margin: '10px 20px 14px', paddingRight: 8 }}>
              <li style={{ marginBottom: 4 }}>מדובר בעסקת מכירה של דירה בחוץ לארץ (ארצות הברית).</li>
              <li style={{ marginBottom: 4 }}>המס בגין העסקה שולם כדין בארצות הברית (ניכוי FIRPTA במקור).</li>
              <li style={{ marginBottom: 4 }}>כמו כן, הנושא טופל מול רשויות המס בישראל.</li>
            </ol>

            <p style={{ marginBottom: 10, textAlign: 'justify' }}>
              בהתאם לחוקי המס בישראל ולאור התחשבנות המס שבוצעה (כולל הזיכוי בגין המס הזר),
              מרשינו אינם נמצאים בחבות מס נוספת בגין כספים אלו.
            </p>

            <p style={{ marginBottom: 10, textAlign: 'justify' }}>
              אי לכך, אנו מבקשים לשחרר את הכספים לזכות הלקוחות לאלתר, שכן אין כל מניעה חוקית או מיסויית להשלמת הפעולה.
            </p>

            <p style={{ marginBottom: 10, textAlign: 'justify' }}>
              נשמח לעמוד לרשותכם להבהרות נוספות במידת הצורך.
            </p>
          </div>

          <div style={{ marginTop: 30 }}>
            <p style={{ marginBottom: 4 }}>בכבוד רב,</p>
            <p style={{ fontWeight: 700, color: '#5b7fa5', fontSize: '1rem', margin: 0 }}>ניהול דוד אלדד רו"ח</p>
            <p style={{ fontWeight: 700, color: '#5b7fa5', fontSize: '1rem', margin: 0 }}>משרד רואי חשבון</p>
          </div>
        </div>

        {/* Footer */}
        <div>
          <div style={{
            height: 4, margin: '0 48px',
            background: 'linear-gradient(to left, transparent, #fbbf24, transparent)',
          }} />
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', padding: '12px 48px 16px' }}>
            <div style={{
              border: '2px solid #000', padding: '12px 24px', lineHeight: 1.7,
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 500 }}>
                <span>סניף ראשל"צ</span>
                <span>|</span>
                <span>מאירוביץ 55</span>
                <span>|</span>
                <span>טל': 03-9661234</span>
                <span>|</span>
                <span>פקס: 077-9167711</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 500, marginTop: 2 }}>
                <a href="mailto:eldad@robium.net" style={{ color: '#5b7fa5', textDecoration: 'none' }}>eldad@robium.net</a>
                <a href="mailto:eldad197589@gmail.com" style={{ color: '#5b7fa5', textDecoration: 'none' }}>eldad197589@gmail.com</a>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 500, marginTop: 2 }}>
                <span>סניף אשקלון</span>
                <span>|</span>
                <span>ישפה 2 אשקלון</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
