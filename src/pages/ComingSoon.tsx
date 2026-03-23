/* ============================================
   FILE: ComingSoon.tsx
   PURPOSE: ComingSoon component
   DEPENDENCIES: lucide-react
   EXPORTS: ComingSoon (default)
   ============================================ */
import { Clock } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      gap: 16
    }}>
      <div style={{
        width: 80, height: 80,
        background: 'rgba(201, 168, 76, 0.1)',
        border: '1px solid rgba(201, 168, 76, 0.2)',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Clock size={36} color="#c9a84c" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
        בקרוב...
      </h2>
      <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 400 }}>
        הדף הזה ייבנה בשלב הבא. חזור לדשבורד כדי לראות את מה שכבר מוכן!
      </p>
    </div>
  );
}
