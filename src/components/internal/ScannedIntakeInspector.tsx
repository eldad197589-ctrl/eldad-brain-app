/* ============================================
   FILE: ScannedIntakeInspector.tsx
   PURPOSE: Props-only read-only internal display for scanned intake staging candidates.
   DEPENDENCIES: react types, scanned-intake-static-snapshot types, scanned-intake-task-candidates-static-snapshot types
   EXPORTS: ScannedIntakeInspector (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import type { ScannedIntakeStaticSnapshot } from '../../work-spine/intake/scanned-intake-static-snapshot';
import type {
  ScannedIntakeTaskCandidateMissingDecisionField,
  ScannedIntakeTaskCandidateStaticSnapshot,
} from '../../work-spine/intake/scanned-intake-task-candidates-static-snapshot';
import {
  createManualDecisionDraftFromTaskCandidate,
  type ManualDecisionMissingBeforePreview,
} from '../../work-spine/intake/manual-decision-draft';
import LocalDraftEditor from './LocalDraftEditor';
import ScansManifestPreviewSection from './ScansManifestPreviewSection';
import ScannedIntakeStaticManifestSection from './ScannedIntakeStaticManifestSection';
// #endregion

// #region Helpers
export interface ScannedIntakeInspectorProps {
  snapshot: ScannedIntakeStaticSnapshot;
  taskCandidatesSnapshot?: ScannedIntakeTaskCandidateStaticSnapshot;
}

const panelStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.82)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 40px rgba(2, 6, 23, 0.22)',
};

const metricStyle: CSSProperties = {
  ...panelStyle,
  padding: 14,
  display: 'grid',
  gap: 6,
};

const formatNumber = (value: number): string => value.toLocaleString('he-IL');

const formatConfidence = (value: string): string => (value === 'low' ? 'נמוך' : value);
const formatTaskStatus = (value: string): string => (value === 'candidate' ? 'מועמד' : value);
const formatReviewStatus = (value: string): string => (value === 'not_reviewed' ? 'לא נבדק' : value);
const formatApproval = (value: boolean): string => (value ? 'כן' : 'לא');
const formatNullable = (value: string | null): string => value ?? 'לא נקבע';
const formatMatter = (value: string | null): string => value ?? 'לא שויך';
const formatDraftStatus = (value: string): string => (value === 'empty' ? 'ריקה' : value);
const formatSelectedDecision = (value: string | null): string => value ?? 'לא נבחרה';
const formatSelectedEntity = (value: string | null): string => value ?? 'לא נבחר';
const formatApprovedTitle = (value: string | null): string => value ?? 'לא נקבעה';
const formatPriority = (value: string | null): string => value ?? 'לא נקבעה';

const missingDecisionLabels: Record<ScannedIntakeTaskCandidateMissingDecisionField, string> = {
  matterDecision: 'חסר שיוך תיק',
  taskTitleApproval: 'חסר אישור כותרת',
  ownerDecision: 'חסר אחראי',
  dueDateDecision: 'חסר תאריך יעד',
  priorityDecision: 'חסרה עדיפות',
  evidenceReview: 'חסרה בדיקת ראיות',
};

const missingBeforePreviewLabels: Record<ManualDecisionMissingBeforePreview, string> = {
  selectedDecision: 'החלטה',
  taskTitleApproval: 'אישור כותרת',
  matterDecision: 'שיוך תיק או סימון לא רלוונטי',
  ownerDecision: 'אחראי או סימון לא רלוונטי',
  dueDateDecision: 'תאריך יעד או סימון לא רלוונטי',
  priorityDecision: 'עדיפות או סימון לא רלוונטי',
  evidenceReview: 'בדיקת ראיות',
};

const statusPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  borderRadius: 999,
  padding: '6px 10px',
  color: '#fde68a',
  background: 'rgba(245, 158, 11, 0.12)',
  border: '1px solid rgba(245, 158, 11, 0.28)',
  fontSize: '0.82rem',
  fontWeight: 700,
};
// #endregion

// #region Component
export default function ScannedIntakeInspector({ snapshot, taskCandidatesSnapshot }: ScannedIntakeInspectorProps) {
  return (
    <section data-testid="scanned-intake-inspector" style={{ display: 'grid', gap: 18 }} dir="rtl">
      <div
        style={{
          ...panelStyle,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.88))',
        }}
      >
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
          מסך פנימי מוסתר
        </div>
        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '2rem' }}>קליטת סריקות — תצוגת מועמדים</h1>
        <p
          data-testid="scanned-intake-warning"
          style={{
            margin: '12px 0 0',
            color: '#fde68a',
            lineHeight: 1.7,
            border: '1px solid rgba(245, 158, 11, 0.28)',
            background: 'rgba(245, 158, 11, 0.08)',
            borderRadius: 14,
            padding: 14,
          }}
        >
          קריאה בלבד — אין מכאן שיוך, מחיקה, OCR או יצירת תיק
        </p>
      </div>

      <div style={panelStyle}>
        <h2 style={{ marginTop: 0, color: '#f8fafc' }}>סיכום</h2>
        <div
          data-testid="scanned-intake-summary"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}
        >
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>סה&quot;כ מועמדים</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.totalCandidates)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>קבוצות</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.groupsCount)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>אזהרות</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.warningsCount)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: '#cbd5e1' }}>שגיאות</span>
            <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(snapshot.summary.errors)}</strong>
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={{ marginTop: 0, color: '#f8fafc' }}>הבהרת רמזים</h2>
        <p data-testid="scanned-intake-explanation" style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>
          שם התיקייה ושם הקובץ הם רמז בלבד. המערכת אינה מסיקה לקוח, תיק, תקופת מע״מ או סוג מסמך.
        </p>
      </div>

      <ScannedIntakeStaticManifestSection />
      <ScansManifestPreviewSection />

      <div style={panelStyle}>
        <h2 style={{ marginTop: 0, color: '#f8fafc' }}>קבוצות מועמדים</h2>
        <div data-testid="scanned-intake-groups" style={{ display: 'grid', gap: 14 }}>
          {snapshot.groups.map((group) => (
            <article
              key={`${group.relativeFolder}-${group.parentFolderName}`}
              data-testid="scanned-intake-group"
              style={{
                borderRadius: 16,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                background: 'rgba(30, 41, 59, 0.58)',
                padding: 16,
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>שם תיקייה</div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.08rem' }}>{group.parentFolderName}</h3>
                </div>
                <span style={statusPillStyle}>ממתין לבדיקה</span>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>נתיב יחסי</div>
                  <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{group.relativeFolder}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>מספר קבצים</div>
                  <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formatNumber(group.candidatesCount)}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 6 }}>דוגמאות קבצים</div>
                  <ul style={{ margin: 0, paddingInlineStart: 18, color: '#e2e8f0', display: 'grid', gap: 5 }}>
                    {group.sampleFileNames.map((fileName) => (
                      <li key={`${group.relativeFolder}-${fileName}`}>{fileName}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {taskCandidatesSnapshot ? (
        <div data-testid="scanned-intake-task-candidates" style={panelStyle}>
          <h2 style={{ marginTop: 0, color: '#f8fafc' }}>מועמדי משימות מתוך סריקות</h2>
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(245, 158, 11, 0.28)',
              background: 'rgba(245, 158, 11, 0.08)',
              color: '#fde68a',
              padding: 14,
              lineHeight: 1.7,
              marginBottom: 14,
            }}
          >
            אין מכאן פתיחת משימה. אין שיוך. אין OCR. אין שמירה.
          </div>

          <div
            data-testid="scanned-task-candidate-summary"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}
          >
            <div style={metricStyle}>
              <span style={{ color: '#cbd5e1' }}>סה&quot;כ מועמדי משימה</span>
              <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(taskCandidatesSnapshot.summary.totalTaskCandidates)}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: '#cbd5e1' }}>הפרות כותרת</span>
              <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(taskCandidatesSnapshot.summary.titleMismatches)}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: '#cbd5e1' }}>אזהרות</span>
              <strong style={{ color: '#f8fafc', fontSize: '1.5rem' }}>{formatNumber(taskCandidatesSnapshot.summary.warningsCount)}</strong>
            </div>
          </div>

          <p style={{ margin: '0 0 16px', color: '#cbd5e1', lineHeight: 1.8 }}>
            סה&quot;כ מועמדי משימה: {formatNumber(taskCandidatesSnapshot.summary.totalTaskCandidates)} | הפרות כותרת:{' '}
            {formatNumber(taskCandidatesSnapshot.summary.titleMismatches)} | אזהרות: {formatNumber(taskCandidatesSnapshot.summary.warningsCount)}
          </p>

          <p data-testid="scanned-task-candidate-warning-explanation" style={{ margin: '0 0 16px', color: '#cbd5e1', lineHeight: 1.8 }}>
            אזהרות פעולה בשם תיקייה הן מידע בלבד ואינן יוצרות משימה.
          </p>

          {taskCandidatesSnapshot.warnings.length > 0 ? (
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              {taskCandidatesSnapshot.warnings.map((warning) => (
                <div
                  key={warning.code}
                  style={{
                    borderRadius: 12,
                    border: '1px solid rgba(148, 163, 184, 0.14)',
                    background: 'rgba(15, 23, 42, 0.46)',
                    color: '#cbd5e1',
                    padding: 12,
                  }}
                >
                  {warning.code}: {formatNumber(warning.count)} | אזהרה שינתה כותרת: {warning.warningAlteredTitle ? 'כן' : 'לא'}
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ display: 'grid', gap: 14 }}>
            {taskCandidatesSnapshot.taskCandidates.map((candidate) => {
              const decisionDraft = createManualDecisionDraftFromTaskCandidate(candidate);

              return (
                <article
                  key={candidate.taskCandidateId}
                  data-testid="scanned-task-candidate"
                  style={{
                    borderRadius: 16,
                    border: '1px solid rgba(148, 163, 184, 0.16)',
                    background: 'rgba(30, 41, 59, 0.58)',
                    padding: 16,
                    display: 'grid',
                    gap: 12,
                  }}
                >
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>כותרת מוצעת</div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.08rem' }}>{candidate.suggestedTitle}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>שם קבוצת מקור</div>
                    <div style={{ color: '#e2e8f0' }}>{candidate.sourceGroupName}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>מספר קבצי מקור</div>
                    <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formatNumber(candidate.sourceFilesCount)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>רמת ביטחון</div>
                    <div style={{ color: '#e2e8f0' }}>{formatConfidence(candidate.confidence)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>סטטוס</div>
                    <div style={{ color: '#e2e8f0' }}>{formatTaskStatus(candidate.taskStatus)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>נדרש אישור אלדד</div>
                    <div style={{ color: '#e2e8f0' }}>{formatApproval(candidate.requiresEldadApproval)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>תאריך יעד מוצע</div>
                    <div style={{ color: '#e2e8f0' }}>{formatNullable(candidate.suggestedDueDate)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>תיק מוצע</div>
                    <div style={{ color: '#e2e8f0' }}>{formatMatter(candidate.suggestedMatterId)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>אחראי מוצע</div>
                    <div style={{ color: '#e2e8f0' }}>{formatNullable(candidate.suggestedOwner)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 4 }}>עדיפות מוצעת</div>
                    <div style={{ color: '#e2e8f0' }}>{formatNullable(candidate.suggestedPriority)}</div>
                  </div>
                </div>

                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 6 }}>דוגמאות קבצי מקור</div>
                  <ul style={{ margin: 0, paddingInlineStart: 18, color: '#e2e8f0', display: 'grid', gap: 5 }}>
                    {candidate.sampleSourceFileNames.map((fileName) => (
                      <li key={`${candidate.taskCandidateId}-${fileName}`}>{fileName}</li>
                    ))}
                  </ul>
                </div>

                <div
                  data-testid="task-candidate-review-checklist"
                  style={{
                    borderRadius: 14,
                    border: '1px solid rgba(56, 189, 248, 0.18)',
                    background: 'rgba(8, 47, 73, 0.22)',
                    padding: 14,
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>סטטוס מועמד ובדיקה</h4>
                  <h5 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.94rem' }}>בדיקת מועמד</h5>
                  <div style={{ display: 'grid', gap: 6, color: '#e2e8f0', lineHeight: 1.7 }}>
                    <div>סטטוס בדיקה: {formatReviewStatus(candidate.reviewStatus)}</div>
                    <div>נדרשת החלטת אלדד: {formatApproval(candidate.decisionRequired)}</div>
                    <div>ניתן לפתוח משימה כעת: {formatApproval(candidate.canPromoteToWorkItem)}</div>
                  </div>
                  <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', display: 'grid', gap: 5 }}>
                    {candidate.missingDecisionFields.map((field) => (
                      <li key={`${candidate.taskCandidateId}-${field}`}>{missingDecisionLabels[field]}</li>
                    ))}
                  </ul>
                  <div style={{ color: '#e2e8f0', lineHeight: 1.7 }}>
                    פעולה מומלצת: {candidate.recommendedNextHumanAction}
                  </div>

                  <div
                    data-testid="manual-decision-draft"
                    style={{
                      borderTop: '1px solid rgba(148, 163, 184, 0.16)',
                      paddingTop: 12,
                      display: 'grid',
                      gap: 10,
                    }}
                  >
                    <h5 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.94rem' }}>טיוטת החלטה — תצוגה בלבד</h5>
                    <div style={{ display: 'grid', gap: 6, color: '#e2e8f0', lineHeight: 1.7 }}>
                      <div>סטטוס טיוטה: {formatDraftStatus(decisionDraft.decisionStatus)}</div>
                      <div>החלטה: {formatSelectedDecision(decisionDraft.selectedDecision)}</div>
                      <div>כותרת מוצעת (מקור): {candidate.suggestedTitle}</div>
                      <div>כותרת מאושרת: {formatApprovedTitle(decisionDraft.proposedTaskTitle)}</div>
                      <div>תיק: {formatSelectedEntity(decisionDraft.proposedMatterId)}</div>
                      <div>אחראי: {formatSelectedEntity(decisionDraft.proposedOwner)}</div>
                      <div>תאריך יעד: {formatNullable(decisionDraft.proposedDueDate)}</div>
                      <div>עדיפות: {formatPriority(decisionDraft.proposedPriority)}</div>
                      <div>בדיקת ראיות: {formatReviewStatus(decisionDraft.proposedEvidenceReviewStatus)}</div>
                      <div>ניתן ליצור תצוגת משימה: {formatApproval(decisionDraft.canGenerateWorkItemPreview)}</div>
                      <div>ניתן ליצור משימה: {formatApproval(decisionDraft.canCreateWorkItem)}</div>
                      <div>נדרש אישור מפורש של אלדד: {formatApproval(decisionDraft.requiresExplicitEldadApproval)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 6 }}>חסר לפני תצוגת משימה</div>
                      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', display: 'grid', gap: 5 }}>
                        {decisionDraft.missingBeforePreview.map((field) => (
                          <li key={`${decisionDraft.decisionDraftId}-${field}`}>{missingBeforePreviewLabels[field]}</li>
                        ))}
                      </ul>
                    </div>

                    <LocalDraftEditor
                      key={`local-draft-${candidate.taskCandidateId}`}
                      taskCandidateId={candidate.taskCandidateId}
                      suggestedTitle={candidate.suggestedTitle}
                      suggestedDescription="תצוגת משימה מקומית מתוך מועמד סריקה. לא נשמרה ולא נפתחה משימה."
                      sourceGroupName={candidate.sourceGroupName}
                      sampleSourceFileNames={candidate.sampleSourceFileNames}
                      sourceFilesCount={candidate.sourceFilesCount}
                      initialDecisionDraft={decisionDraft}
                    />
                  </div>
                </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
// #endregion
