/* ============================================
   FILE: CeoFooter.tsx
   PURPOSE: CeoFooter component
   DEPENDENCIES: None (local only)
   EXPORTS: CeoFooter (default)
   ============================================ */
/** CeoFooter — Bottom footer for the CEO Office page with branding */
export default function CeoFooter() {
  return (
    <footer style={{ textAlign: 'center', padding: '32px 0', fontSize: '0.78rem', color: '#475569' }}>
      <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, #7C3AED, #FF6B53)', borderRadius: 2, margin: '0 auto 16px', opacity: 0.3 }} />
      <p>לשכת מנכ"ל — <strong style={{ color: '#94a3b8' }}>Robium טכנולוגיות בע"מ</strong></p>
      <p style={{ marginTop: 4, fontSize: '0.7rem' }}>נתונים נשמרים באופן מקומי · המוח של אלדד</p>
    </footer>
  );
}
