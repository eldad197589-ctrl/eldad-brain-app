/* ============================================
   FILE: ComparisonPage.tsx
   PURPOSE: Market comparison page — Robium vs competitors analysis
   DEPENDENCIES: competitorsData.ts, lucide-react
   EXPORTS: ComparisonPage (default)
   ============================================ */
import React from 'react';
import { COMPETITORS, TORTURE_TEST_ROWS } from './competitorsData';
import { Target, AlertTriangle } from 'lucide-react';

export default function ComparisonPage() {
    return (
        <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
            <header className="page-header" style={{ marginBottom: 40, textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.15)', color: '#93c5fd', padding: '6px 20px', borderRadius: 100, marginBottom: 16, fontSize: '0.85rem', fontWeight: 700 }}>
                    ניתוח שוק נרחב · מרץ 2026
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>Robium vs השוק</h1>
                <p style={{ color: '#94a3b8', maxWidth: 600, margin: '0 auto' }}>
                    סקירה מקיפה של הנוף התחרותי בתחום עזרי ה-AI לארגונים.
                    המסקנה העיקרית: המתחרה האמיתי אינו התוכנות האחרות - אלא חוסר הפעולה והמשך העבודה הידנית.
                </p>
            </header>

            <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Target size={20} color="#3b82f6" /> מפת מתחרים
                </h2>
                <div style={{ overflowX: 'auto', background: 'rgba(15,23,42,0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#f8fafc' }}>מתחרה</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#f8fafc' }}>סוג ארגון</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#f8fafc' }}>תמיכה בעברית</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#f8fafc' }}>תמחור מסתמן</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#f8fafc' }}>נקודת תורפה יחסית ל-Robium</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPETITORS.map((comp, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{comp.name}</td>
                                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '4px 8px', borderRadius: 6 }}>{comp.type}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.95rem' }}>{comp.hebrew}</td>
                                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: '#cbd5e1' }}>{comp.price}</td>
                                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.4 }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                                            <span>{comp.weakness}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 }}>מבחן עמידה בלחץ קולי (Heblish)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, fontWeight: 700, textAlign: 'center' }}>פרמטר</div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, fontWeight: 700, textAlign: 'center', color: '#a78bfa' }}>MS Teams</div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, fontWeight: 700, textAlign: 'center', color: '#38bdf8' }}>OpenAI Whisper</div>
                    <div style={{ background: 'rgba(16,185,129,0.1)', padding: 16, borderRadius: 12, fontWeight: 700, textAlign: 'center', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>Robium Protokol</div>
                    
                    {TORTURE_TEST_ROWS.map((row, i) => (
                        <React.Fragment key={i}>
                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: 16, borderRadius: 12, fontSize: '0.9rem', color: '#94a3b8' }}>{row.dim}</div>
                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: 16, borderRadius: 12, fontSize: '0.95rem', textAlign: 'center' }}>{row.teams}</div>
                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: 16, borderRadius: 12, fontSize: '0.95rem', textAlign: 'center' }}>{row.whisper}</div>
                            <div style={{ background: 'rgba(16,185,129,0.05)', padding: 16, borderRadius: 12, fontSize: '0.95rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{row.proto}</div>
                        </React.Fragment>
                    ))}
                </div>
            </section>

            <div style={{ marginTop: 60, padding: 24, textAlign: 'center', background: 'rgba(244,63,94,0.1)', border: '1px dashed rgba(244,63,94,0.3)', borderRadius: 16 }}>
                <h3 style={{ margin: '0 0 10px', color: '#fb7185', fontSize: '1.2rem' }}>המסקנה האנליטית</h3>
                <p style={{ margin: 0, color: '#fecdd3', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    זירת המתחרים רוויה בכלים "חלקיים", רובם מצוינים אך נעדרים חיבור איטימייטבי לנפש העסק הישראלי (שפה והקשר מסחרי תפור ללקוח).
                    היתרון של רוביום נובע מהמיקוד המוחלט של האלגוריתם בסוכן אקטיבי שיודע "להקשיב ולפעול", ולא רק 'להקליד'. 
                </p>
            </div>
        </div>
    );
}
