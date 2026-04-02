/* ============================================
   FILE: PesachCardPage.tsx
   PURPOSE: Pesach greeting card page — uses GreetingCard component
   DEPENDENCIES: React, GreetingCard
   EXPORTS: default PesachCardPage
   ============================================ */
import React, { useState } from 'react';
import GreetingCard from './components/GreetingCard';
import type { GreetingCardData } from './components/GreetingCard';

// #region Card Data

/** Pesach 2026 — ROBIUM greeting card */
const PESACH_CARD: GreetingCardData = {
  title: 'חג פסח שמח וכשר',
  bodyLines: [
    'מאחלים לכם חג של חירות,',
    'אור, התחדשות, שקט ורגעים טובים באמת.',
  ],
  closing: 'באהבה ובהערכה,',
  signature: 'ROBIUM',
  backgroundImage: '/logos/robium_brand.jpg',
};

/** Fallback: same card without external image */
const PESACH_CARD_FALLBACK: GreetingCardData = {
  ...PESACH_CARD,
  backgroundImage: undefined,
};

// #endregion

// #region Page

const pageStyles: Record<string, React.CSSProperties> = {
  container: {
    direction: 'rtl',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
    background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)',
    gap: '2rem',
  },
  header: {
    textAlign: 'center',
    color: '#e2e8f0',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: '#e8d5a3',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  toggle: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  toggleBtn: {
    padding: '0.4rem 1rem',
    borderRadius: 6,
    border: '1px solid rgba(201,168,76,0.2)',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s ease',
  },
  toggleBtnActive: {
    background: 'rgba(201,168,76,0.15)',
    color: '#c9a84c',
    borderColor: '#c9a84c',
  },
  instructions: {
    color: '#64748b',
    fontSize: '0.8rem',
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 1.6,
  },
};

/**
 * PesachCardPage — Standalone page for the Pesach greeting card.
 * Route: /messaging/pesach
 */
const PesachCardPage: React.FC = () => {
  const [useImage, setUseImage] = useState(true);

  const cardData = useImage ? PESACH_CARD : PESACH_CARD_FALLBACK;

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <h1 style={pageStyles.title}>🕊️ כרטיס ברכה — פסח 2026</h1>
        <p style={pageStyles.subtitle}>ROBIUM · ברכת חג ללקוחות</p>
      </div>

      {/* Toggle: with/without brand image */}
      <div style={pageStyles.toggle}>
        <button
          style={{
            ...pageStyles.toggleBtn,
            ...(useImage ? pageStyles.toggleBtnActive : {}),
          }}
          onClick={() => setUseImage(true)}
        >
          🖼️ עם תמונת מותג
        </button>
        <button
          style={{
            ...pageStyles.toggleBtn,
            ...(!useImage ? pageStyles.toggleBtnActive : {}),
          }}
          onClick={() => setUseImage(false)}
        >
          🎨 עיצוב CSS בלבד
        </button>
      </div>

      {/* The Card */}
      <GreetingCard data={cardData} showControls />

      <p style={pageStyles.instructions}>
        💡 לשליחה ב-WhatsApp: לחצו "הורד כתמונה" או צלמו מסך.
        <br />
        "העתק טקסט" מעתיק את נוסח הברכה בלבד.
      </p>
    </div>
  );
};

export default PesachCardPage;

// #endregion
