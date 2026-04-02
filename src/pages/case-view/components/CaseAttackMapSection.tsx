/* ============================================
   FILE: CaseAttackMapSection.tsx
   PURPOSE: מציג את מפת התקיפה והעוזרת לערר עבור תיק ספציפי
   DEPENDENCIES: react, lucide-react, caseTypes, decisionAttackEngine
   ============================================ */
import { ShieldAlert, Crosshair, FileX } from 'lucide-react';
import type { CaseEntity } from '../../../data/caseTypes';
import type { AttackPoint } from '../../../services/decisionAttackEngine';

export interface Props {
  attackMap?: AttackPoint[];
  summary?: CaseEntity['attackSummary'];
}

export default function CaseAttackMapSection({ attackMap, summary }: Props) {
  if (!attackMap || !summary) {
    return (
      <div className="case-section" style={{ marginTop: 24, padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
        <ShieldAlert size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
        <h3 style={{ margin: '0 0 8px', color: '#cbd5e1' }}>מפת תקיפה</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
          אין בסיס מספיק לבניית מפת תקיפה (נדרש מסמך החלטה ותגובת מייצג)
        </p>
      </div>
    );
  }

  // Define strength colors
  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'strong': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'weak': return '#ef4444';
      case 'missing_evidence': return '#64748b';
      default: return '#94a3b8';
    }
  };

  const IssueTypeLabels: Record<string, string> = {
    factual_gap: 'פער עובדתי',
    legal_gap: 'פער משפטי / פסיקתי',
    missing_basis: 'החלטה ללא ביסוס מפורש',
    contradiction: 'סתירה פנימית / חיצונית',
    unsupported_assumption: 'הנחה בלתי מבוססת',
    ignored_evidence: 'התעלמות מראיות',
  };

  return (
    <div className="case-section" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Crosshair size={20} color="#f43f5e" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f1f5f9' }}>מפת תקיפה</h3>
      </div>

      {/* Summary Bar */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20,
        background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>סך הטענות</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>{summary.totalClaims}</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>חזקות (Strong)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{summary.strongPoints}</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>בינוניות (Medium)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>{summary.mediumPoints}</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>חלשות (Weak)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{summary.weakPoints}</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>חסר מסמכים</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}>{summary.missingEvidencePoints}</div>
        </div>
      </div>

      {/* Points List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {attackMap.map((point, idx) => (
          <div key={idx} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: 16, borderRight: `4px solid ${getStrengthColor(point.strengthLevel)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4,
                  fontSize: '0.75rem', color: '#cbd5e1'
                }}>
                  {IssueTypeLabels[point.issueType] || point.issueType}
                </span>
                <span style={{ fontSize: '0.75rem', color: getStrengthColor(point.strengthLevel), fontWeight: 700 }}>
                  {point.strengthLevel.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: 4, fontWeight: 700 }}>טענת הרשות:</div>
                <div style={{ fontSize: '0.9rem', color: '#f1f5f9', background: 'rgba(239,68,68,0.05)', padding: '8px 12px', borderRadius: 4 }}>
                  {point.authorityClaim}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: 4, fontWeight: 700 }}>מהות החולשה:</div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{point.weaknessExplanation}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: 4, fontWeight: 700 }}>טיעון נגד (מתוך תגובת אלדד):</div>
                <div style={{ fontSize: '0.9rem', color: '#f1f5f9', background: 'rgba(16,185,129,0.05)', padding: '8px 12px', borderRadius: 4 }}>
                  {point.counterArgument}
                </div>
              </div>

              {point.supportingEvidence.length > 0 ? (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: 4, fontWeight: 700 }}>ראיות ותמיכה:</div>
                  <ul style={{ margin: 0, paddingLeft: 0, paddingRight: 16, fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {point.supportingEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <FileX size={14} /> לא נמצאה תשתית ישימה לתמיכה מתוך מסמכי התיק (או שהוחלף במענה)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
