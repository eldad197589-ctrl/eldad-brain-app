/**
 * FILE: CeoHeader.tsx
 * PURPOSE: CEO Office header — clean title per doctrine Part 6
 * DEPENDENCIES: none
 */

// #region Component
/**
 * CeoHeader — Simple, clean header for the CEO Office.
 * Per doctrine: "אלדד רואה תוצאות — לא סוכנים."
 */
export default function CeoHeader() {
  return (
    <header style={{ textAlign: 'center', marginBottom: 28 }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 6px' }}>
        👔 לשכת מנכ"ל — <span className="gradient-text">דוד אלדד</span>
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
        ניהול · משימות · החלטות
      </p>
    </header>
  );
}
// #endregion
