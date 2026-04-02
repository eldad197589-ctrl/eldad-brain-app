/* ============================================
   FILE: MessagingPage.tsx
   PURPOSE: Orchestrator page for the Messaging Engine
   DEPENDENCIES: React, react-router-dom
   EXPORTS: default MessagingPage
   ============================================ */
import React from 'react';
import { useNavigate } from 'react-router-dom';

// #region Styles

const styles: Record<string, React.CSSProperties> = {
  container: {
    direction: 'rtl',
    padding: '2rem',
    color: '#e2e8f0',
    maxWidth: 800,
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#e8d5a3',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    color: '#94a3b8',
    marginBottom: '1rem',
    fontWeight: 500,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardEmoji: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: '0.25rem',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.5,
  },
  badge: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: 4,
    fontSize: '0.7rem',
    fontWeight: 600,
    marginTop: '0.5rem',
  },
  comingSoon: {
    background: 'rgba(100,116,139,0.15)',
    color: '#64748b',
    border: '1px solid rgba(100,116,139,0.2)',
  },
  ready: {
    background: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.2)',
  },
};

// #endregion

// #region Page

/**
 * MessagingPage — Hub for all messaging features.
 */
const MessagingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💬 הודעות ללקוחות</h1>
        <p style={styles.subtitle}>מנוע הודעות חכם — ברכות, עדכונים, תזכורות</p>
      </div>

      {/* Active */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🟢 זמין עכשיו</h2>
        <div style={styles.cardGrid}>
          <div
            style={styles.card}
            onClick={() => navigate('/messaging/pesach')}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
              e.currentTarget.style.background = 'rgba(201,168,76,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <div style={styles.cardEmoji}>🕊️</div>
            <div style={styles.cardTitle}>ברכת פסח 2026</div>
            <p style={styles.cardDesc}>כרטיס ברכה דיגיטלי יוקרתי לשליחה ללקוחות ב-WhatsApp</p>
            <span style={{ ...styles.badge, ...styles.ready }}>מוכן ✅</span>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔜 בקרוב</h2>
        <div style={styles.cardGrid}>
          <div style={{ ...styles.card, cursor: 'default', opacity: 0.6 }}>
            <div style={styles.cardEmoji}>📣</div>
            <div style={styles.cardTitle}>הודעת עדכון</div>
            <p style={styles.cardDesc}>עדכון סטטוס תיק, שינוי מועדים</p>
            <span style={{ ...styles.badge, ...styles.comingSoon }}>שלב 2</span>
          </div>
          <div style={{ ...styles.card, cursor: 'default', opacity: 0.6 }}>
            <div style={styles.cardEmoji}>⏰</div>
            <div style={styles.cardTitle}>תזכורת מסמך חסר</div>
            <p style={styles.cardDesc}>תזכורת אישית ללקוח עם שם המסמך</p>
            <span style={{ ...styles.badge, ...styles.comingSoon }}>שלב 2</span>
          </div>
          <div style={{ ...styles.card, cursor: 'default', opacity: 0.6 }}>
            <div style={styles.cardEmoji}>✅</div>
            <div style={styles.cardTitle}>Follow-up</div>
            <p style={styles.cardDesc}>מעקב אחרי טיפול שהושלם</p>
            <span style={{ ...styles.badge, ...styles.comingSoon }}>שלב 2</span>
          </div>
          <div style={{ ...styles.card, cursor: 'default', opacity: 0.6 }}>
            <div style={styles.cardEmoji}>👥</div>
            <div style={styles.cardTitle}>ניהול אנשי קשר</div>
            <p style={styles.cardDesc}>רשימת לקוחות, תגיות, פילטרים</p>
            <span style={{ ...styles.badge, ...styles.comingSoon }}>שלב 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;

// #endregion
