/* ============================================
   FILE: PesachExodusHero.tsx
   PURPOSE: Pesach Exodus — V11.5
            No central panel. Water fades with mask-image.
   DEPENDENCIES: React
   EXPORTS: PesachExodusHero (default)
   ============================================ */
import { useEffect } from 'react';

// #region Brand Palette
const R_PALETTE = {
  goldSoft: '#e8d5a3',
  goldAccent: '#c9a84c',
  goldWarm: '#d4b876',
  abyss: '#010305',
};
// #endregion

export default function PesachExodusHero() {
  useEffect(() => {
    // === Metadata Polish ===
    document.title = 'ROBIUM | הדרך נפתחת';
    const oldMetaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (oldMetaThemeColor) {
      oldMetaThemeColor.setAttribute('content', R_PALETTE.abyss);
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--mx', x.toString());
      document.documentElement.style.setProperty('--my', y.toString());
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="exodus-scene" dir="rtl">

      {/* SVG Filters for living water */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="water-live" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="4"
              seed="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.012 0.02;0.018 0.028;0.012 0.02"
                dur="10s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        .exodus-scene {
          position: relative;
          width: 100vw; height: 100vh;
          overflow: hidden;
          background: ${R_PALETTE.abyss};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'David Libre','Frank Ruhl Libre','Noto Serif Hebrew',Georgia,serif;
          cursor: default;
        }

        /* ══════════════════════════
           1. BLACK SKY & STARS — continuous, full viewport
           ══════════════════════════ */
        .exodus-sky {
          position: absolute; inset: 0;
          background: linear-gradient(180deg,
            ${R_PALETTE.abyss} 0%,
            rgb(3, 8, 14) 35%,
            rgb(2, 5, 8) 55%,
            transparent 70%
          );
          z-index: 1;
        }

        .exodus-stars {
          position: absolute; inset: 0; z-index: 2;
          background-image: 
            radial-gradient(2px 2px at 15% 15%, rgba(232, 213, 163, 0.5), transparent),
            radial-gradient(1.5px 1.5px at 45% 8%, rgba(255, 255, 255, 0.4), transparent),
            radial-gradient(2.5px 2.5px at 85% 25%, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1.5px 1.5px at 35% 45%, rgba(201, 168, 76, 0.3), transparent),
            radial-gradient(2px 2px at 75% 65%, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(2px 2px at 10% 85%, rgba(232, 213, 163, 0.3), transparent);
          background-size: 220px 220px;
          opacity: 0.8;
          -webkit-mask-image: linear-gradient(180deg, black 0%, black 20%, transparent 60%);
          mask-image: linear-gradient(180deg, black 0%, black 20%, transparent 60%);
        }
        .exodus-stars::after {
          content: ''; position: absolute; inset: 0;
          background-image: 
            radial-gradient(1.5px 1.5px at 25% 35%, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(2px 2px at 65% 15%, rgba(232, 213, 163, 0.4), transparent),
            radial-gradient(3px 3px at 95% 55%, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1.5px 1.5px at 15% 75%, rgba(201, 168, 76, 0.3), transparent),
            radial-gradient(2px 2px at 55% 85%, rgba(255, 255, 255, 0.4), transparent);
          background-size: 170px 170px;
          opacity: 0.6;
        }

        /* ══════════════════════════
           2. R ANCHOR — part of the sky, NOT a panel
           ══════════════════════════ */
        .exodus-moon {
          position: absolute;
          top: 25%; left: 50%;
          transform: translate(-50%, -50%);
          width: 60px; height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle,
            rgba(232, 213, 163, 1) 0%,
            rgba(201, 168, 76, 0.4) 30%,
            transparent 70%
          );
          box-shadow:
            0 0 60px rgba(232, 213, 163, 0.5),
            0 0 200px rgba(201, 168, 76, 0.25);
          z-index: 5;
        }

        .exodus-sigil {
          position: absolute;
          top: 25%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Inter', 'Segoe UI', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: rgba(232, 213, 163, 0.7);
          text-shadow: 0 0 20px rgba(232, 213, 163, 0.8);
          z-index: 6;
          line-height: 1;
        }

        /* ══════════════════════════
           3. GOD-RAY — VERTICAL GUIDING BEAM
           ══════════════════════════ */
        .exodus-god-ray {
          position: absolute;
          top: 25%; left: 50%;
          transform: translateX(-50%);
          width: 50px; height: 100vh;
          background: linear-gradient(180deg,
            rgba(232, 213, 163, 0.4) 0%,
            rgba(232, 213, 163, 0.2) 20%,
            rgba(232, 213, 163, 0.05) 50%,
            transparent 80%
          );
          filter: blur(15px);
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: 4;
        }
        
        .exodus-god-ray-core {
          position: absolute;
          top: 25%; left: 50%;
          transform: translateX(-50%);
          width: 3px; height: 80vh;
          background: linear-gradient(180deg, rgba(232, 213, 163, 0.6) 0%, transparent 70%);
          filter: blur(2px);
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: 4;
        }

        /* ══════════════════════════
           4. PATH — subtle ground, not a rectangle
           ══════════════════════════ */
        .exodus-path-container {
          position: absolute;
          top: 85%; left: 50%;
          transform: translateX(-50%) perspective(600px) rotateX(82deg);
          width: 90vw; height: 200vh;
          transform-origin: top center;
          pointer-events: none;
          z-index: 3;
        }

        .exodus-seabed {
          position: absolute; inset: 0;
          background: rgba(2, 4, 5, 0.4);
        }

        .exodus-path-reflection {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 30%; height: 100%;
          background: linear-gradient(180deg,
            rgba(232, 213, 163, 0.5) 0%,
            rgba(201, 168, 76, 0.1) 40%,
            transparent 90%
          );
          filter: blur(30px);
          mix-blend-mode: screen;
        }

        /* ══════════════════════════
           5. WATER MASSES — mask-image fades to transparent
           No overlay divs. No darkening. The water itself
           becomes transparent at the inner edge, revealing
           the continuous black sky behind = NO PANEL.
           ══════════════════════════ */
        .exodus-water-mass {
          position: absolute;
          top: -20%; bottom: -20%;
          width: 46vw;
          z-index: 7;
          overflow: hidden;
        }

        .exodus-water-mass-left {
          left: -4vw;
          /* Water is visible on the left, fades to nothing on inner edge */
          -webkit-mask-image: linear-gradient(to right,
            black 0%, black 35%, transparent 92%
          );
          mask-image: linear-gradient(to right,
            black 0%, black 35%, transparent 92%
          );
        }

        .exodus-water-mass-right {
          right: -4vw;
          /* Water is visible on the right, fades to nothing on inner edge */
          -webkit-mask-image: linear-gradient(to left,
            black 0%, black 35%, transparent 92%
          );
          mask-image: linear-gradient(to left,
            black 0%, black 35%, transparent 92%
          );
        }

        .exodus-water-mass-inner {
          position: absolute;
          inset: 0;
          background-image: url('/exodus-sea.png');
          background-size: 180% auto;
          background-position: 10% 50%;
          background-repeat: no-repeat;
          filter: url(#water-live) brightness(0.55) saturate(1.2);
          animation: waterBreath 8s ease-in-out infinite;
        }

        /* Right side mirrors left water wall */
        .exodus-water-mass-right .exodus-water-mass-inner {
          transform: scaleX(-1);
          animation-name: waterBreathMirror;
          animation-delay: -4s;
        }

        @keyframes waterBreath {
          0%, 100% { transform: scale(1.02) translateX(0); }
          50% { transform: scale(1.06) translateX(5px); }
        }

        @keyframes waterBreathMirror {
          0%, 100% { transform: scaleX(-1) scale(1.02) translateX(0); }
          50% { transform: scaleX(-1) scale(1.06) translateX(5px); }
        }

        /* Vertical fade — top/bottom blend into sky */
        .exodus-water-fade-v {
          position: absolute; inset: 0;
          background: linear-gradient(180deg,
            ${R_PALETTE.abyss} 0%,
            transparent 20%,
            transparent 75%,
            ${R_PALETTE.abyss} 100%
          );
          z-index: 2;
        }

        /* Boiling edge — where water meets path */
        .exodus-boil-edge {
          position: absolute;
          top: 10%; bottom: 10%;
          width: 60px;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(232, 213, 163, 0.15) 30%,
            rgba(232, 213, 163, 0.25) 50%,
            rgba(232, 213, 163, 0.15) 70%,
            transparent 100%
          );
          mix-blend-mode: screen;
          filter: blur(10px);
          animation: boilPulse 4s ease-in-out infinite;
          z-index: 3;
        }

        .exodus-water-mass-left .exodus-boil-edge {
          right: -10px;
        }

        .exodus-water-mass-right .exodus-boil-edge {
          left: -10px;
          animation-delay: -2s;
        }

        @keyframes boilPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }

        /* ══════════════════════════
           6. TYPOGRAPHY — V11 exact
           ══════════════════════════ */
        .exodus-text {
          position: relative;
          z-index: 10;
          text-align: center;
          animation: textRise 3s cubic-bezier(0.1, 0.9, 0.2, 1) 5.5s both;
          pointer-events: none;
          margin-top: 10vh;
        }

        @keyframes textRise {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .exodus-text h1 {
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 300;
          color: rgba(232, 213, 163, 1);
          letter-spacing: 0.3em;
          margin: 0 0 1.5rem 0;
          text-shadow:
            0 10px 40px rgba(0, 0, 0, 1),
            0 0 60px rgba(201, 168, 76, 0.4);
          line-height: 1.5;
        }

        .exodus-gold-line {
          width: 50px; height: 1px;
          background: ${R_PALETTE.goldWarm};
          margin: 1.5rem auto;
          opacity: 0.8;
          box-shadow: 0 0 15px ${R_PALETTE.goldAccent};
        }

        .exodus-brand {
          font-size: clamp(0.75rem, 2vw, 0.9rem);
          color: rgba(232, 213, 163, 0.5);
          font-family: 'Inter', 'Segoe UI', sans-serif;
          font-weight: 500;
          letter-spacing: 0.6em;
          text-transform: uppercase;
        }

        /* ══════════════════════════
           7. OPENING REVEAL SEQUENCE (7 Seconds)
           ══════════════════════════ */
        @keyframes revealLight {
          0% { opacity: 0; filter: blur(10px) brightness(0); }
          100% { opacity: 1; filter: blur(0px) brightness(1); }
        }
        @keyframes revealBeam {
          0% { transform: translateX(-50%) scaleY(0); opacity: 0; }
          100% { transform: translateX(-50%) scaleY(1); opacity: 1; }
        }
        @keyframes revealPath {
          /* Starts fully transparent and gently rises from the seabed */
          0% { opacity: 0; transform: translateX(-50%) perspective(600px) rotateX(82deg) translateY(40px); }
          100% { opacity: 1; transform: translateX(-50%) perspective(600px) rotateX(82deg) translateY(0); }
        }
        @keyframes revealWater {
          /* Rises from darkness without physical position movement */
          0% { opacity: 0; filter: brightness(0.2); }
          100% { opacity: 1; filter: brightness(1); }
        }

        .exodus-moon, .exodus-sigil, .exodus-stars {
          animation: revealLight 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 1.0s both;
        }

        .exodus-god-ray, .exodus-god-ray-core {
          transform-origin: top center;
          animation: revealBeam 1.5s cubic-bezier(0.4, 0, 0.2, 1) 2.5s both;
        }

        .exodus-path-container {
          animation: revealPath 2.0s cubic-bezier(0.2, 0.8, 0.2, 1) 4.0s both;
        }

        .exodus-water-mass {
          animation: revealWater 2.5s cubic-bezier(0.3, 0.0, 0.2, 1) 4.0s both;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
             /* Snap immediately to the final frame */
             animation-duration: 0.01s !important;
             animation-delay: 0s !important;
          }
        }

        @keyframes revealPathMobile {
          0% { opacity: 0; transform: translateX(-50%) perspective(400px) rotateX(78deg) translateY(40px); }
          100% { opacity: 1; transform: translateX(-50%) perspective(400px) rotateX(78deg) translateY(0); }
        }

        @media (max-width: 768px) {
          .exodus-water-mass { width: 68vw; }
          .exodus-water-mass-left { 
            left: -15vw; 
            -webkit-mask-image: linear-gradient(to right, black 0%, black 25%, transparent 95%);
            mask-image: linear-gradient(to right, black 0%, black 25%, transparent 95%);
          }
          .exodus-water-mass-right { 
            right: -15vw; 
            -webkit-mask-image: linear-gradient(to left, black 0%, black 25%, transparent 95%);
            mask-image: linear-gradient(to left, black 0%, black 25%, transparent 95%);
          }
          
          .exodus-path-container {
            width: 150vw; height: 150vh;
            top: 78%;
            animation: revealPathMobile 2.0s cubic-bezier(0.2, 0.8, 0.2, 1) 4.0s both;
          }
          
          .exodus-moon { width: 45px; height: 45px; top: 20%; }
          .exodus-sigil { font-size: 18px; top: 20%; }
          .exodus-god-ray { width: 25px; height: 100vh; top: 20%; }
          .exodus-god-ray-core { width: 2px; height: 80vh; top: 20%; }
          
          .exodus-text { margin-top: 15vh; }
          .exodus-text h1 { font-size: 1.5rem; letter-spacing: 0.25em; margin-bottom: 1rem; }
          .exodus-gold-line { margin: 1rem auto; width: 40px; }
          .exodus-brand { font-size: 0.75rem; letter-spacing: 0.4em; }
        }
      `}} />

      {/* === LAYER STACK === */}

      {/* L1: Continuous black sky & stars */}
      <div className="exodus-sky" />
      <div className="exodus-stars" />

      {/* L2: Path (perspective ground) */}
      <div className="exodus-path-container">
        <div className="exodus-seabed" />
        <div className="exodus-path-reflection" />
      </div>

      {/* L3: God-ray from R (Vertical beam) */}
      <div className="exodus-god-ray" />
      <div className="exodus-god-ray-core" />

      {/* L4: R anchor (moon + sigil) — part of sky */}
      <div className="exodus-moon" />
      <span className="exodus-sigil" aria-hidden="true">R</span>

      {/* L5: Water LEFT — mask fades inner edge to transparent */}
      <div className="exodus-water-mass exodus-water-mass-left">
        <div className="exodus-water-mass-inner" />
        <div className="exodus-water-fade-v" />
        <div className="exodus-boil-edge" />
      </div>

      {/* L6: Water RIGHT — mask fades inner edge to transparent */}
      <div className="exodus-water-mass exodus-water-mass-right">
        <div className="exodus-water-mass-inner" />
        <div className="exodus-water-fade-v" />
        <div className="exodus-boil-edge" />
      </div>

      {/* L7: Text */}
      <div className="exodus-text">
        <h1>הדרך נפתחת</h1>
        <div className="exodus-gold-line" />
        <p className="exodus-brand">ROBIUM</p>
      </div>
    </div>
  );
}
