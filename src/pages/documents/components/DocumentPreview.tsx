/* ============================================
   FILE: DocumentPreview.tsx
   PURPOSE: DocumentPreview component
   DEPENDENCIES: None (local only)
   EXPORTS: DocumentPreview (default)
   ============================================ */
/**
 * DocumentPreview — A4-style preview of the filled document
 *
 * FILE: components/DocumentPreview.tsx
 * PURPOSE: Renders the final document with letterhead, subject, content, and footer,
 *          matching Eldad's firm branding from LetterPage.tsx.
 * DEPENDENCIES: ../types, ../hooks/useDocumentEditor
 */

// #region Types

/** Props for DocumentPreview */
interface Props {
  /** The document subject line (already processed) */
  subject: string;
  /** The generated HTML content (placeholders already replaced) */
  content: string;
  /** The formatted date string */
  date: string;
}

// #endregion

// #region Component

/**
 * Renders an A4-style document preview with Eldad's firm letterhead,
 * gold accent lines, and firm footer.
 *
 * @example
 * <DocumentPreview subject="בקשה לארכה" content={html} date="23/03/2026" />
 */
export default function DocumentPreview({ subject, content, date }: Props) {
  return (
    <div style={{
      background: '#fff', color: '#1e293b', borderRadius: 12,
      boxShadow: '0 4px 30px rgba(0,0,0,0.25)', overflow: 'hidden',
      minHeight: 800, width: '100%', maxWidth: '210mm', margin: '0 auto',
      display: 'grid', gridTemplateRows: 'auto 1fr auto',
      fontFamily: "'Heebo', 'Rubik', sans-serif", direction: 'rtl',
    }}>
      {/* Header with Logo */}
      <div>
        <div style={{ padding: '20px 32px 16px', background: '#fff' }}>
          <div style={{ width: '100%', position: 'relative', minHeight: 100 }}>
            {/* Logo */}
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 120 120" style={{ height: 100, width: 'auto', maxWidth: 180 }}>
                <text x="12" y="62" fontFamily="Georgia, serif" fontSize="56" fontWeight="bold" fill="#c9a84c">D</text>
                <text x="48" y="44" fontFamily="Georgia, serif" fontSize="32" fill="#c9a84c">&amp;</text>
                <text x="58" y="62" fontFamily="Georgia, serif" fontSize="56" fontWeight="bold" fill="#5b7fa5">E</text>
                <text x="60" y="82" textAnchor="middle" fontFamily="Heebo, sans-serif" fontSize="10" fill="#5b7fa5">ניהול דוד אלדד רו&quot;ח</text>
                <text x="60" y="96" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6" fill="#999">David Eldad CPA Management</text>
              </svg>
            </div>
            {/* Title */}
            <div style={{ width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e3a5f', lineHeight: 1.4 }}>
                ניהול דוד אלדד רו&quot;ח
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a5f', letterSpacing: 1, marginTop: 4, direction: 'ltr' }}>
                DAVID ELDAD CPA MANAGEMENT
              </div>
              <div style={{ width: '100%', height: 1, background: '#1e293b', margin: '8px 0' }} />
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
        {/* Date */}
        <div style={{ textAlign: 'left', direction: 'ltr', color: '#555', fontSize: '0.85rem', marginBottom: 20 }}>
          {date}
        </div>

        {/* Subject */}
        {subject && (
          <div style={{ marginBottom: 22, fontWeight: 700, textDecoration: 'underline', fontSize: '1rem' }}>
            הנדון: {subject}
          </div>
        )}

        {/* Body */}
        <div dangerouslySetInnerHTML={{ __html: content }} style={{ textAlign: 'justify' }} />

        {/* Signature */}
        <div style={{ marginTop: 30 }}>
          <p style={{ marginBottom: 4 }}>בכבוד רב,</p>
          <p style={{ fontWeight: 700, color: '#5b7fa5', fontSize: '1rem', margin: 0 }}>ניהול דוד אלדד רו&quot;ח</p>
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
          <div style={{ border: '2px solid #000', padding: '12px 24px', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 500 }}>
              <span>סניף ראשל&quot;צ</span>
              <span>|</span>
              <span>מאירוביץ 55</span>
              <span>|</span>
              <span>טל&apos;: 03-9661234</span>
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
  );
}

// #endregion
