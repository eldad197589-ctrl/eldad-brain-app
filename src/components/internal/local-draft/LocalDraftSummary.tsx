/* ============================================
   FILE: LocalDraftSummary.tsx
   PURPOSE: Collapsed summary display for the local-only draft editor.
   DEPENDENCIES: React types, LocalDraftTypes
   EXPORTS: LocalDraftSummary
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import type { LocalDraftSelectedDecision, LocalDraftState } from './LocalDraftTypes';
// #endregion

// #region Types
interface LocalDraftSummaryProps {
  draft: LocalDraftState;
  isComplete: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}
// #endregion

// #region Styles
const controlStyle: CSSProperties = {
  borderRadius: 10,
  border: '1px solid rgba(148, 163, 184, 0.26)',
  background: 'rgba(15, 23, 42, 0.68)',
  color: '#f8fafc',
  padding: '9px 10px',
  font: 'inherit',
};

const buttonStyle: CSSProperties = {
  ...controlStyle,
  width: 'fit-content',
  cursor: 'pointer',
  color: '#cbd5e1',
};
// #endregion

// #region Helpers
const formatSelectedDecision = (value: LocalDraftSelectedDecision | null): string => {
  if (value === 'open_task') return 'לפתוח משימה בהמשך';
  if (value === 'ignore') return 'להתעלם / רעש';
  if (value === 'defer') return 'לדחות להמשך בדיקה';
  if (value === 'merge') return 'למזג עם מועמד אחר';
  return 'טרם נבחרה';
};
// #endregion

// #region Component
export function LocalDraftSummary({ draft, isComplete, isExpanded, onToggle }: LocalDraftSummaryProps) {
  return (
    <>
      <h5 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.94rem' }}>טיוטה מקומית לעריכה</h5>
      <div
        data-testid="local-draft-warning"
        style={{
          borderRadius: 12,
          border: '1px solid rgba(245, 158, 11, 0.28)',
          background: 'rgba(245, 158, 11, 0.08)',
          color: '#fde68a',
          padding: 12,
          lineHeight: 1.7,
        }}
      >
        ⚠️ טיוטה מקומית בלבד — לא נשמרת. נעלמת ברענון.
      </div>

      <div data-testid="local-draft-collapsed-summary" style={{ display: 'grid', gap: 6, color: '#e2e8f0', lineHeight: 1.7 }}>
        <div>החלטה מקומית: {formatSelectedDecision(draft.selectedDecision)}</div>
        <div data-testid="local-draft-complete">טיוטה מקומית מלאה: {isComplete ? 'כן' : 'לא'}</div>
      </div>

      <button type="button" data-testid="local-draft-toggle" onClick={onToggle} style={buttonStyle}>
        {isExpanded ? 'סגור עריכת טיוטה מקומית' : 'פתח עריכת טיוטה מקומית'}
      </button>
    </>
  );
}
// #endregion
