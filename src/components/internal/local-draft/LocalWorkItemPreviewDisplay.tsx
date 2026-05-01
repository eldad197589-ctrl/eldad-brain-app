/* ============================================
   FILE: LocalWorkItemPreviewDisplay.tsx
   PURPOSE: Stateless read-only display for local WorkItem preview evaluator output.
   DEPENDENCIES: React types, local-workitem-preview types
   EXPORTS: LocalWorkItemPreviewDisplay
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import type {
  LocalWorkItemPreview,
  LocalWorkItemPreviewBlocker,
  LocalWorkItemPreviewProposedWorkItem,
} from '../../../work-spine/intake/local-workitem-preview';
// #endregion

// #region Types
interface LocalWorkItemPreviewDisplayProps {
  preview: LocalWorkItemPreview;
}
// #endregion

// #region Styles
const panelStyle: CSSProperties = {
  borderTop: '1px solid rgba(148, 163, 184, 0.16)',
  paddingTop: 12,
  display: 'grid',
  gap: 10,
};

const warningStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(245, 158, 11, 0.28)',
  background: 'rgba(245, 158, 11, 0.08)',
  color: '#fde68a',
  padding: 12,
  lineHeight: 1.7,
};

const valueGridStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
  color: '#e2e8f0',
  lineHeight: 1.7,
};
// #endregion

// #region Helpers
const blockerLabels: Record<LocalWorkItemPreviewBlocker, string> = {
  selectedDecision: 'החלטה לא נבחרה',
  taskTitleApproval: 'כותרת לא אושרה',
  matterDecision: 'תיק לא הוכרע',
  proposedMatterId: 'מזהה תיק מוצע חסר',
  ownerDecision: 'אחראי לא הוכרע',
  proposedOwner: 'אחראי מוצע חסר',
  dueDateDecision: 'תאריך יעד לא הוכרע',
  proposedDueDate: 'תאריך יעד מוצע חסר',
  priorityDecision: 'עדיפות לא הוכרעה',
  proposedPriority: 'עדיפות מוצעת חסרה',
  evidenceReview: 'ראיות לא נבדקו',
};

const formatNullable = (value: string | null | undefined): string => value && value.trim() !== '' ? value : 'לא נקבע';
const formatMatter = (value: string | null): string => value && value.trim() !== '' ? value : 'לא שויך';
const formatOwner = (value: string | null): string => value && value.trim() !== '' ? value : 'לא נקבע';
const formatPriority = (value: string | null): string => value && value.trim() !== '' ? value : 'לא נקבעה';

const renderSourceEvidence = (proposedWorkItem: LocalWorkItemPreviewProposedWorkItem) => (
  <div>
    <div>ראיות מקור: {proposedWorkItem.sourceEvidence.sourceGroupName ?? 'לא נקבע'}</div>
    <div>מספר קבצי מקור: {proposedWorkItem.sourceEvidence.sourceFilesCount}</div>
    {proposedWorkItem.sourceEvidence.sourceFileNames.length > 0 ? (
      <ul style={{ margin: '4px 0 0', paddingInlineStart: 18, color: '#cbd5e1', display: 'grid', gap: 4 }}>
        {proposedWorkItem.sourceEvidence.sourceFileNames.map((fileName) => (
          <li key={fileName}>{fileName}</li>
        ))}
      </ul>
    ) : null}
  </div>
);
// #endregion

// #region Component
export function LocalWorkItemPreviewDisplay({ preview }: LocalWorkItemPreviewDisplayProps) {
  if (preview.previewStatus === 'not_applicable') {
    return (
      <section data-testid="local-workitem-preview-display" style={panelStyle} dir="rtl">
        <h5 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.94rem' }}>אין תצוגת משימה</h5>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>ההחלטה המקומית אינה פתיחת משימה</p>
        <div style={valueGridStyle}>
          <div>סיבה: החלטה מקומית שאינה פתיחת משימה</div>
          <div>ניתן ליצור משימה: לא</div>
          <div>WorkItem שייווצר: אין</div>
        </div>
      </section>
    );
  }

  if (preview.previewStatus === 'ready' && preview.proposedWorkItem) {
    const proposedWorkItem = preview.proposedWorkItem;

    return (
      <section data-testid="local-workitem-preview-display" style={panelStyle} dir="rtl">
        <h5 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.94rem' }}>תצוגת משימה — טיוטה בלבד</h5>
        <div data-testid="local-workitem-preview-ready-warning" style={warningStyle}>
          לא נשמר. לא נפתחה משימה.
        </div>
        <div style={warningStyle}>טיוטה בלבד — לא נשמרה ולא נפתחה משימה</div>
        <div data-testid="local-workitem-preview-card" style={valueGridStyle}>
          <div>כותרת: {proposedWorkItem.title}</div>
          <div>תיאור: {proposedWorkItem.description}</div>
          {renderSourceEvidence(proposedWorkItem)}
          <div>החלטת תיק: {proposedWorkItem.matterDecision}</div>
          <div>תיק מוצע: {formatMatter(proposedWorkItem.proposedMatterId)}</div>
          <div>החלטת אחראי: {proposedWorkItem.ownerDecision}</div>
          <div>אחראי מוצע: {formatOwner(proposedWorkItem.proposedOwner)}</div>
          <div>החלטת תאריך יעד: {proposedWorkItem.dueDateDecision}</div>
          <div>תאריך יעד מוצע: {formatNullable(proposedWorkItem.proposedDueDate)}</div>
          <div>החלטת עדיפות: {proposedWorkItem.priorityDecision}</div>
          <div>עדיפות מוצעת: {formatPriority(proposedWorkItem.proposedPriority)}</div>
          <div>status: {proposedWorkItem.status}</div>
          <div>ניתן ליצור משימה: לא</div>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="local-workitem-preview-display" style={panelStyle} dir="rtl">
      <h5 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.94rem' }}>תצוגת משימה: חסומה</h5>
      <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>חסרים שדות בטיוטה המקומית</p>
      <div style={valueGridStyle}>
        <div>ניתן ליצור תצוגת משימה: לא</div>
        <div>ניתן ליצור משימה: לא</div>
        <div>WorkItem שייווצר: אין</div>
      </div>
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 6 }}>חסמים</div>
        <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', display: 'grid', gap: 5 }}>
          {preview.blockers.map((blocker) => (
            <li key={`${preview.previewId}-${blocker}`}>{blockerLabels[blocker]}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
// #endregion
