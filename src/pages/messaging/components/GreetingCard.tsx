/* ============================================
   FILE: GreetingCard.tsx
   PURPOSE: Reusable greeting card component — premium digital cards
            for holidays, updates, and client messages.
   DEPENDENCIES: React
   EXPORTS: GreetingCard, GreetingCardProps, GreetingCardData
   ============================================ */
import React, { useRef, useCallback } from 'react';

// #region Types

/** Data object for card content — swap for different holidays */
export interface GreetingCardData {
  /** Main title — e.g. 'חג פסח שמח וכשר' */
  title: string;
  /** Body lines — each string is a separate line */
  bodyLines: string[];
  /** Closing / signature line — e.g. 'תודה על האמון,' */
  closing: string;
  /** Brand name — e.g. 'ROBIUM' */
  signature: string;
  /** Optional background image URL (absolute or relative to public) */
  backgroundImage?: string;
}

export interface GreetingCardProps {
  /** Card content data */
  data: GreetingCardData;
  /** Show export controls */
  showControls?: boolean;
}

// #endregion

// #region Styles

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const ASPECT_RATIO = `${CARD_WIDTH} / ${CARD_HEIGHT}`;

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    direction: 'rtl',
  },

  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    aspectRatio: ASPECT_RATIO,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.15)',
    fontFamily: "'David Libre', 'Frank Ruhl Libre', 'Noto Serif Hebrew', Georgia, serif",
  },

  bgLayer: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },

  // Fallback gradient when no image is provided
  gradientBg: {
    background: 'linear-gradient(170deg, #0a1628 0%, #0d2137 25%, #0f2d3d 50%, #0a2030 75%, #070e1a 100%)',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.3) 100%)',
    zIndex: 1,
  },

  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#fff',
  },

  decorTop: {
    width: 60,
    height: 2,
    background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
    marginBottom: '1.5rem',
    borderRadius: 2,
  },

  title: {
    fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
    fontWeight: 700,
    color: '#e8d5a3',
    lineHeight: 1.4,
    marginBottom: '0.3rem',
    textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(201,168,76,0.2)',
    letterSpacing: '0.03em',
  },

  decorMid: {
    width: 100,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)',
    margin: '1.8rem 0',
    borderRadius: 1,
  },

  bodyLine: {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    lineHeight: 1.8,
    color: 'rgba(255,255,255,0.92)',
    margin: 0,
    textShadow: '0 1px 10px rgba(0,0,0,0.5)',
    fontWeight: 400,
  },

  closing: {
    fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
    color: 'rgba(255,255,255,0.78)',
    marginTop: '0.2rem',
    marginBottom: '1rem',
    fontWeight: 400,
    textShadow: '0 1px 8px rgba(0,0,0,0.4)',
  },

  signature: {
    fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
    color: '#c9a84c',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.25em',
    marginTop: '0.5rem',
    textShadow: '0 2px 12px rgba(0,0,0,0.4)',
  },

  decorBottom: {
    width: 60,
    height: 2,
    background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
    marginTop: '1.5rem',
    borderRadius: 2,
  },

  controls: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },

  btn: {
    padding: '0.6rem 1.4rem',
    borderRadius: 8,
    border: '1px solid rgba(201,168,76,0.3)',
    background: 'rgba(201,168,76,0.1)',
    color: '#c9a84c',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },

  // Golden particles animation overlay
  particles: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    overflow: 'hidden',
    pointerEvents: 'none' as const,
  },
};

// #endregion

// #region Component

/**
 * GreetingCard — Premium digital greeting card.
 * Reusable for holidays, updates, and client messages.
 *
 * @example
 * <GreetingCard
 *   data={{
 *     title: 'חג פסח שמח וכשר',
 *     bodyLines: ['מאחלים לכם חג של חירות,', 'התחדשות, שקט וצמיחה.'],
 *     closing: 'תודה על האמון,',
 *     signature: 'ROBIUM',
 *     backgroundImage: '/logos/robium_brand.jpg',
 *   }}
 *   showControls
 * />
 */
const GreetingCard: React.FC<GreetingCardProps> = ({ data, showControls = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopyText = useCallback(async () => {
    const text = [data.title, '', ...data.bodyLines, '', data.closing, data.signature].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('הטקסט הועתק! ✅');
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('הטקסט הועתק! ✅');
    }
  }, [data]);

  const handleDownloadImage = useCallback(async () => {
    const card = cardRef.current;
    if (!card) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = 'robium_pesach_2026.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('💡 לשמירה כתמונה: Win + Shift + S');
    }
  }, []);

  const bgStyle: React.CSSProperties = data.backgroundImage
    ? { ...styles.bgLayer, backgroundImage: `url(${data.backgroundImage})` }
    : { ...styles.bgLayer, ...styles.gradientBg };

  return (
    <div style={styles.wrapper}>
      {/* ═══ Card ═══ */}
      <div ref={cardRef} style={styles.card} id="greeting-card-export">
        {/* Background */}
        <div style={bgStyle} />

        {/* Golden particles CSS animation */}
        <div style={styles.particles}>
          <style>{`
            @keyframes float-particle {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 0.6; }
              100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
            }
            .gc-particle {
              position: absolute;
              width: 3px;
              height: 3px;
              background: radial-gradient(circle, #c9a84c, transparent);
              border-radius: 50%;
              animation: float-particle linear infinite;
            }
          `}</style>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="gc-particle"
              style={{
                left: `${8 + (i * 7.5)}%`,
                bottom: `${5 + (i % 4) * 15}%`,
                animationDuration: `${3 + (i % 5) * 1.5}s`,
                animationDelay: `${(i * 0.8)}s`,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
              }}
            />
          ))}
        </div>

        {/* Overlay for text readability */}
        <div style={styles.overlay} />

        {/* Content */}
        <div style={styles.content}>
          <div style={{ flex: 0.01 }} />

          {/* Top ornament */}
          <div style={styles.decorTop} />

          {/* Title */}
          <h1 style={styles.title}>{data.title}</h1>

          {/* Divider */}
          <div style={styles.decorMid} />

          {/* Body */}
          <div style={{ marginBottom: '0.5rem' }}>
            {data.bodyLines.map((line, i) => (
              <p key={i} style={styles.bodyLine}>{line}</p>
            ))}
          </div>

          {/* Closing */}
          <p style={styles.closing}>{data.closing}</p>

          {/* Signature — hidden when image has its own branding */}
          {!data.backgroundImage && (
            <p style={styles.signature}>{data.signature}</p>
          )}

          {/* Bottom ornament */}
          <div style={styles.decorBottom} />

          <div style={{ flex: 6 }} />
        </div>
      </div>

      {/* ═══ Controls ═══ */}
      {showControls && (
        <div style={styles.controls}>
          <button
            style={styles.btn}
            onClick={handleCopyText}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.25)';
              e.currentTarget.style.borderColor = '#c9a84c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
            }}
          >
            📋 העתק טקסט
          </button>
          <button
            style={styles.btn}
            onClick={handleDownloadImage}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.25)';
              e.currentTarget.style.borderColor = '#c9a84c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
            }}
          >
            📥 הורד כתמונה
          </button>
        </div>
      )}
    </div>
  );
};

export default GreetingCard;

// #endregion
