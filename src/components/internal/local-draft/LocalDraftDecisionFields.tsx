/* ============================================
   FILE: LocalDraftDecisionFields.tsx
   PURPOSE: Expanded local-only draft controls.
   DEPENDENCIES: React types, LocalDraftTypes
   EXPORTS: LocalDraftDecisionFields
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import type {
  LocalDraftDueDateDecision,
  LocalDraftEvidenceReviewStatus,
  LocalDraftMatterDecision,
  LocalDraftOwnerDecision,
  LocalDraftPriority,
  LocalDraftPriorityDecision,
  LocalDraftSelectedDecision,
  LocalDraftState,
} from './LocalDraftTypes';
// #endregion

// #region Types
interface LocalDraftDecisionFieldsProps {
  draft: LocalDraftState;
  suggestedTitle: string;
  onSelectedDecisionChange: (value: LocalDraftSelectedDecision | null) => void;
  onProposedTaskTitleChange: (value: string) => void;
  onMatterDecisionChange: (value: LocalDraftMatterDecision) => void;
  onProposedMatterIdChange: (value: string) => void;
  onOwnerDecisionChange: (value: LocalDraftOwnerDecision) => void;
  onProposedOwnerChange: (value: string) => void;
  onDueDateDecisionChange: (value: LocalDraftDueDateDecision) => void;
  onProposedDueDateChange: (value: string) => void;
  onPriorityDecisionChange: (value: LocalDraftPriorityDecision) => void;
  onProposedPriorityChange: (value: LocalDraftPriority) => void;
  onEvidenceReviewStatusChange: (value: LocalDraftEvidenceReviewStatus) => void;
  onReset: () => void;
}
// #endregion

// #region Styles
const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
};

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

// #region Component
export function LocalDraftDecisionFields({
  draft,
  suggestedTitle,
  onSelectedDecisionChange,
  onProposedTaskTitleChange,
  onMatterDecisionChange,
  onProposedMatterIdChange,
  onOwnerDecisionChange,
  onProposedOwnerChange,
  onDueDateDecisionChange,
  onProposedDueDateChange,
  onPriorityDecisionChange,
  onProposedPriorityChange,
  onEvidenceReviewStatusChange,
  onReset,
}: LocalDraftDecisionFieldsProps) {
  return (
    <div data-testid="local-draft-expanded-fields" style={{ display: 'grid', gap: 12 }}>
      <label style={fieldStyle}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>החלטה מקומית</span>
        <select
          data-testid="local-draft-selected-decision"
          aria-label="החלטה מקומית"
          value={draft.selectedDecision ?? ''}
          onChange={(event) => onSelectedDecisionChange(event.target.value === '' ? null : (event.target.value as LocalDraftSelectedDecision))}
          style={controlStyle}
        >
          <option value="">טרם נבחרה</option>
          <option value="open_task">לפתוח משימה בהמשך</option>
          <option value="ignore">להתעלם / רעש</option>
          <option value="defer">לדחות להמשך בדיקה</option>
          <option value="merge">למזג עם מועמד אחר</option>
        </select>
      </label>

      <label style={fieldStyle}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>כותרת מוצעת לעריכה מקומית</span>
        <input
          data-testid="local-draft-proposed-title"
          aria-label="כותרת מוצעת לעריכה מקומית"
          value={draft.proposedTaskTitle}
          onChange={(event) => onProposedTaskTitleChange(event.target.value)}
          placeholder={suggestedTitle}
          style={controlStyle}
        />
      </label>

      <label style={fieldStyle}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>החלטת תיק מקומית</span>
        <select
          data-testid="local-draft-matter-decision"
          aria-label="החלטת תיק מקומית"
          value={draft.matterDecision}
          onChange={(event) => onMatterDecisionChange(event.target.value as LocalDraftMatterDecision)}
          style={controlStyle}
        >
          <option value="unresolved">טרם הוכרע</option>
          <option value="assign_existing_matter">לשייך לתיק קיים בהמשך</option>
          <option value="no_matter_needed">אין צורך בתיק</option>
        </select>
      </label>

      {draft.matterDecision === 'assign_existing_matter' ? (
        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>מזהה תיק מוצע — מקומי בלבד</span>
          <input
            data-testid="local-draft-proposed-matter-id"
            aria-label="מזהה תיק מוצע — מקומי בלבד"
            value={draft.proposedMatterId}
            onChange={(event) => onProposedMatterIdChange(event.target.value)}
            style={controlStyle}
          />
        </label>
      ) : null}

      <label style={fieldStyle}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>החלטת אחראי מקומית</span>
        <select
          data-testid="local-draft-owner-decision"
          aria-label="החלטת אחראי מקומית"
          value={draft.ownerDecision}
          onChange={(event) => onOwnerDecisionChange(event.target.value as LocalDraftOwnerDecision)}
          style={controlStyle}
        >
          <option value="unresolved">טרם הוכרע</option>
          <option value="assign_owner">להקצות אחראי בהמשך</option>
          <option value="no_owner_needed">אין צורך באחראי</option>
        </select>
      </label>

      {draft.ownerDecision === 'assign_owner' ? (
        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>אחראי מוצע — מקומי בלבד</span>
          <input
            data-testid="local-draft-proposed-owner"
            aria-label="אחראי מוצע — מקומי בלבד"
            value={draft.proposedOwner}
            onChange={(event) => onProposedOwnerChange(event.target.value)}
            style={controlStyle}
          />
        </label>
      ) : null}

      <label style={fieldStyle}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>החלטת תאריך יעד מקומית</span>
        <select
          data-testid="local-draft-due-date-decision"
          aria-label="החלטת תאריך יעד מקומית"
          value={draft.dueDateDecision}
          onChange={(event) => onDueDateDecisionChange(event.target.value as LocalDraftDueDateDecision)}
          style={controlStyle}
        >
          <option value="unresolved">טרם הוכרע</option>
          <option value="set_due_date">לקבוע תאריך יעד בהמשך</option>
          <option value="no_due_date_needed">אין צורך בתאריך יעד</option>
        </select>
      </label>

      {draft.dueDateDecision === 'set_due_date' ? (
        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>תאריך יעד מוצע — מקומי בלבד</span>
          <input
            type="date"
            data-testid="local-draft-proposed-due-date"
            aria-label="תאריך יעד מוצע — מקומי בלבד"
            value={draft.proposedDueDate}
            onChange={(event) => onProposedDueDateChange(event.target.value)}
            style={controlStyle}
          />
        </label>
      ) : null}

      <label style={fieldStyle}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>החלטת עדיפות מקומית</span>
        <select
          data-testid="local-draft-priority-decision"
          aria-label="החלטת עדיפות מקומית"
          value={draft.priorityDecision}
          onChange={(event) => onPriorityDecisionChange(event.target.value as LocalDraftPriorityDecision)}
          style={controlStyle}
        >
          <option value="unresolved">טרם הוכרעה</option>
          <option value="set_priority">לקבוע עדיפות בהמשך</option>
          <option value="no_priority_needed">אין צורך בעדיפות</option>
        </select>
      </label>

      {draft.priorityDecision === 'set_priority' ? (
        <label style={fieldStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>עדיפות מוצעת — מקומית בלבד</span>
          <select
            data-testid="local-draft-proposed-priority"
            aria-label="עדיפות מוצעת — מקומית בלבד"
            value={draft.proposedPriority}
            onChange={(event) => onProposedPriorityChange(event.target.value as LocalDraftPriority)}
            style={controlStyle}
          >
            <option value="">טרם נבחרה</option>
            <option value="low">נמוכה</option>
            <option value="medium">בינונית</option>
            <option value="high">גבוהה</option>
            <option value="urgent">דחופה</option>
          </select>
        </label>
      ) : null}

      <label style={fieldStyle}>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>בדיקת ראיות מקומית</span>
        <select
          data-testid="local-draft-evidence-review-status"
          aria-label="בדיקת ראיות מקומית"
          value={draft.evidenceReviewStatus}
          onChange={(event) => onEvidenceReviewStatusChange(event.target.value as LocalDraftEvidenceReviewStatus)}
          style={controlStyle}
        >
          <option value="not_reviewed">לא נבדק</option>
          <option value="reviewed_sufficient">ראיות מספיקות</option>
          <option value="reviewed_insufficient">ראיות לא מספיקות</option>
        </select>
      </label>

      <button type="button" data-testid="local-draft-reset" onClick={onReset} style={buttonStyle}>
        נקה טיוטה מקומית
      </button>
    </div>
  );
}
// #endregion
