/* ============================================
   FILE: scanned-intake-inspector.test.tsx
   PURPOSE: Focused tests for the internal read-only scanned intake inspector UI.
   DEPENDENCIES: vitest, react-dom/server, fs, ScannedIntakeInspectorPage
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScannedIntakeInspectorPage from '../../pages/internal/ScannedIntakeInspectorPage';
import { createManualDecisionDraftFromTaskCandidate } from '../../work-spine/intake/manual-decision-draft';
import { SCANNED_INTAKE_TASK_CANDIDATES_STATIC_SNAPSHOT } from '../../work-spine/intake/scanned-intake-task-candidates-static-snapshot';
// #endregion

// #region Constants
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';
const forbiddenActionLabels = [
  'בחר החלטה',
  'אשר כותרת',
  'פתח משימה',
  'צור משימה',
  'שייך לתיק',
  'בחר אחראי',
  'קבע תאריך',
  'קבע עדיפות',
  'סמן ראיות כנבדקו',
  'צור תצוגת משימה',
  'שמור טיוטה',
  'צור תיק',
  'הפעל OCR',
  'קבע דדליין',
  'קבע תאריך יעד',
  'הקצה עובד',
  'הקצה אחראי',
  'שנה עדיפות',
  'אשר',
  'שמור',
  'מחק',
  'העבר',
  'תקן',
  'סווג',
];
// #endregion

// #region Tests
describe('Internal Scanned Intake Inspector', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('derives an empty manual decision draft from a task candidate without enabling preview or creation', () => {
    const candidate = SCANNED_INTAKE_TASK_CANDIDATES_STATIC_SNAPSHOT.taskCandidates[0];
    const draft = createManualDecisionDraftFromTaskCandidate(candidate);

    expect(draft.decisionDraftId).toBe(`manual-decision-draft:${candidate.taskCandidateId}`);
    expect(draft.taskCandidateId).toBe(candidate.taskCandidateId);
    expect(draft.decisionStatus).toBe('empty');
    expect(draft.selectedDecision).toBeNull();
    expect(draft.proposedTaskTitle).toBeNull();
    expect(draft.proposedMatterId).toBeNull();
    expect(draft.proposedOwner).toBeNull();
    expect(draft.proposedDueDate).toBeNull();
    expect(draft.proposedPriority).toBeNull();
    expect(draft.proposedEvidenceReviewStatus).toBe('not_reviewed');
    expect(draft.canGenerateWorkItemPreview).toBe(false);
    expect(draft.canCreateWorkItem).toBe(false);
    expect(draft.requiresExplicitEldadApproval).toBe(true);
    expect(draft.missingBeforePreview).toEqual([
      'selectedDecision',
      'taskTitleApproval',
      'matterDecision',
      'ownerDecision',
      'dueDateDecision',
      'priorityDecision',
      'evidenceReview',
    ]);
  });

  it('renders the Hebrew header, warning, explanation, summary, groups, and waiting status', () => {
    const setItem = vi.fn();
    const indexedOpen = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem,
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: vi.fn() });
    vi.stubGlobal('fetch', fetchSpy);

    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    expect(markup).toContain('קליטת סריקות — תצוגת מועמדים');
    expect(markup).toContain('קריאה בלבד — אין מכאן שיוך, מחיקה, OCR או יצירת תיק');
    expect(markup).toContain('שם התיקייה ושם הקובץ הם רמז בלבד. המערכת אינה מסיקה לקוח, תיק, תקופת מע״מ או סוג מסמך.');
    expect(markup).toContain('סה&quot;כ מועמדים');
    expect(markup).toContain('>61<');
    expect(markup).toContain('>18<');
    expect(markup).toContain('אזהרות');
    expect(markup).toContain('שגיאות');
    expect(markup).toContain('אוזנה ניסים טיפול מס');
    expect(markup).toContain('מסמכים בכורי פריש בדיקת דיני עבודה');
    expect(markup).toContain('ממתין לבדיקה');
    expect(markup).toContain('טופס יפוי כוח חתום אוזנה ניסים.pdf');
    expect((markup.match(/data-testid="scanned-intake-group"/g) ?? []).length).toBe(18);
    expect((markup.match(/data-testid="local-draft-toggle"/g) ?? []).length).toBe(18);
    expect(setItem).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders read-only task candidates with preserved titles and null assignment labels', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    expect(markup).toContain('מועמדי משימות מתוך סריקות');
    expect(markup).toContain('סה&quot;כ מועמדי משימה');
    expect(markup).toContain('הפרות כותרת');
    expect(markup).toContain('אזהרות');
    expect(markup).toContain('אזהרות פעולה בשם תיקייה הן מידע בלבד ואינן יוצרות משימה.');
    expect(markup).toContain('אין מכאן פתיחת משימה. אין שיוך. אין OCR. אין שמירה.');
    expect((markup.match(/data-testid="scanned-task-candidate"/g) ?? []).length).toBe(18);

    expect(markup).toContain('תיקיית סריקה: אוזנה ניסים טיפול מס');
    expect(markup).toContain('תיקיית סריקה: חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח');
    expect(markup).toContain('תיקיית סריקה: טיפול בחובות מי אשקלון');
    expect(markup).toContain('תיקיית סריקה: טיפול בתשלום אמבולנס פינוי אמא של אלדד');
    expect(markup).toContain('תיקיית סריקה: טיפול שוטף רוביום');
    expect(markup).toContain('תיקיית סריקה: מסמכים בכורי פריש בדיקת דיני עבודה');

    expect(markup).toContain('נמוך');
    expect(markup).toContain('מועמד');
    expect(markup).toContain('כן');
    expect(markup).toContain('לא נקבע');
    expect(markup).toContain('לא שויך');
    expect(markup).toContain('source_group_name_contains_action_verb');
  });

  it('renders the read-only review checklist under task candidates', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    expect((markup.match(/data-testid="task-candidate-review-checklist"/g) ?? []).length).toBe(18);
    expect(markup).toContain('בדיקת מועמד');
    expect(markup).toContain('סטטוס בדיקה: לא נבדק');
    expect(markup).toContain('נדרשת החלטת אלדד: כן');
    expect(markup).toContain('ניתן לפתוח משימה כעת: לא');
    expect(markup).toContain('חסר שיוך תיק');
    expect(markup).toContain('חסר אישור כותרת');
    expect(markup).toContain('חסר אחראי');
    expect(markup).toContain('חסר תאריך יעד');
    expect(markup).toContain('חסרה עדיפות');
    expect(markup).toContain('חסרה בדיקת ראיות');
    expect(markup).toContain('פעולה מומלצת: אלדד צריך לבדוק את מקור המשימה לפני פתיחה');
  });

  it('renders the static Scan Manifest read-only section with manual review categories and forbidden actions', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));
    const requiredManifestText = [
      'בניית ערר או השגה דימה פיצוי מלחמה מסלול אדום', 'חומר למעמ דוד אלדד 1-2.26', 'חומר למע דוד אלדד 3-4.26',
      'חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח', 'טיפול שוטף רוביום', 'הודעות חשובות מגוגל',
      'מס הכנסה ושומות — תיקיות הודעות ודרישות', 'אוזנה / בכורי פריש / סיירת א.ח — תיקיות לקוח לא מסווגות',
      'Dima', 'VAT', 'Robium', 'unknown', 'read_only', 'manual review needed', 'delete, move, rename, OCR, persist, createWorkItem',
    ];

    expect(markup).toContain('Scan Manifest — read-only');
    expect(markup).toContain('Static manifest only. No scanning, OCR, file movement, persistence, or WorkItem creation.');
    for (const text of requiredManifestText) expect(markup).toContain(text);
    expect((markup.match(/data-testid="scan-static-manifest-entry"/g) ?? []).length).toBe(8);
  });

  it('renders the read-only manual decision draft display under task candidates', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    expect((markup.match(/data-testid="manual-decision-draft"/g) ?? []).length).toBe(18);
    expect(markup).toContain('טיוטת החלטה — תצוגה בלבד');
    expect(markup).toContain('סטטוס טיוטה: ריקה');
    expect(markup).toContain('החלטה: לא נבחרה');
    expect(markup).toContain('כותרת מוצעת (מקור): תיקיית סריקה: אוזנה ניסים טיפול מס');
    expect(markup).toContain('כותרת מאושרת: לא נקבעה');
    expect(markup).toContain('תיק: לא נבחר');
    expect(markup).toContain('אחראי: לא נבחר');
    expect(markup).toContain('תאריך יעד: לא נקבע');
    expect(markup).toContain('עדיפות: לא נקבעה');
    expect(markup).toContain('בדיקת ראיות: לא נבדק');
    expect(markup).toContain('ניתן ליצור תצוגת משימה: לא');
    expect(markup).toContain('ניתן ליצור משימה: לא');
    expect(markup).toContain('נדרש אישור מפורש של אלדד: כן');
    expect(markup).toContain('חסר לפני תצוגת משימה');
    expect(markup).toContain('החלטה');
    expect(markup).toContain('אישור כותרת');
    expect(markup).toContain('שיוך תיק או סימון לא רלוונטי');
    expect(markup).toContain('אחראי או סימון לא רלוונטי');
    expect(markup).toContain('תאריך יעד או סימון לא רלוונטי');
    expect(markup).toContain('עדיפות או סימון לא רלוונטי');
  });

  it('renders local-only draft editing controls under task candidates', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    expect((markup.match(/data-testid="local-draft-editor-/g) ?? []).length).toBe(18);
    expect((markup.match(/data-testid="local-draft-toggle"/g) ?? []).length).toBe(18);
    expect((markup.match(/data-testid="local-draft-selected-decision"/g) ?? []).length).toBe(0);
    expect((markup.match(/data-testid="local-draft-proposed-title"/g) ?? []).length).toBe(0);
    expect((markup.match(/data-testid="local-draft-reset"/g) ?? []).length).toBe(0);
    expect(markup).toContain('⚠️ טיוטה מקומית בלבד — לא נשמרת. נעלמת ברענון.');
    expect(markup).toContain('החלטה מקומית: טרם נבחרה');
    expect(markup).toContain('טיוטה מקומית מלאה: לא');
    expect(markup).toContain('טרם נבחרה');
    expect(markup).toContain('פתח עריכת טיוטה מקומית');
    expect(markup).not.toContain('סגור עריכת טיוטה מקומית');
  });

  it('renders the dynamic C2 local preview display in blocked default state without generating a WorkItem card', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    expect((markup.match(/data-testid="local-workitem-preview-display"/g) ?? []).length).toBe(18);
    expect((markup.match(/data-testid="blocked-workitem-preview-gate"/g) ?? []).length).toBe(0);
    expect(markup).toContain('תצוגת משימה: חסומה');
    expect(markup).toContain('חסרים שדות בטיוטה המקומית');
    expect(markup).toContain('ניתן ליצור תצוגת משימה: לא');
    expect(markup).toContain('ניתן ליצור משימה: לא');
    expect(markup).toContain('WorkItem שייווצר: אין');
    expect(markup).toContain('חסמים');
    expect(markup).toContain('החלטה לא נבחרה');
    expect(markup).not.toContain('לא ניתן לייצר תצוגה כי חסרים שדות החלטה');
    expect(markup).not.toContain('data-testid="workitem-preview-card"');
    expect(markup).not.toContain('proposedWorkItem');
  });

  it('renders only the approved local draft controls and no extra form controls', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    expect((markup.match(/<button/g) ?? []).length).toBe(18);
    expect((markup.match(/<input/g) ?? []).length).toBe(0);
    expect((markup.match(/<select/g) ?? []).length).toBe(0);
    expect((markup.match(/<textarea/g) ?? []).length).toBe(0);
    expect((markup.match(/type="checkbox"/g) ?? []).length).toBe(0);
    expect((markup.match(/type="radio"/g) ?? []).length).toBe(0);
  });

  it('does not render forbidden action labels or buttons', () => {
    const markup = renderToStaticMarkup(React.createElement(ScannedIntakeInspectorPage));

    for (const label of forbiddenActionLabels) {
      expect(markup).not.toContain(`>${label}<`);
    }
    expect(markup).not.toContain('data-testid="scanned-intake-refresh"');
    expect(markup).not.toContain('data-testid="scanned-intake-save"');
    expect(markup).not.toContain('data-testid="scanned-intake-approve"');
    expect((markup.match(/data-testid="local-draft-toggle"/g) ?? []).length).toBe(18);
  });

  it('keeps the browser component free of Node filesystem, stores, and professional creation imports', () => {
    const componentSource = readFileSync(`${projectRoot}/src/components/internal/ScannedIntakeInspector.tsx`, 'utf8');
    const pageSource = readFileSync(`${projectRoot}/src/pages/internal/ScannedIntakeInspectorPage.tsx`, 'utf8');
    const snapshotSource = readFileSync(`${projectRoot}/src/work-spine/intake/scanned-intake-static-snapshot.ts`, 'utf8');
    const taskSnapshotSource = readFileSync(`${projectRoot}/src/work-spine/intake/scanned-intake-task-candidates-static-snapshot.ts`, 'utf8');
    const manualDecisionDraftSource = readFileSync(`${projectRoot}/src/work-spine/intake/manual-decision-draft.ts`, 'utf8');
    const workItemPreviewGateSource = readFileSync(`${projectRoot}/src/work-spine/intake/workitem-preview-gate.ts`, 'utf8');
    const localWorkItemPreviewSource = readFileSync(`${projectRoot}/src/work-spine/intake/local-workitem-preview.ts`, 'utf8');
    const localWorkItemPreviewDisplaySource = readFileSync(
      `${projectRoot}/src/components/internal/local-draft/LocalWorkItemPreviewDisplay.tsx`,
      'utf8',
    );
    const localDraftEditorSource = readFileSync(`${projectRoot}/src/components/internal/LocalDraftEditor.tsx`, 'utf8');
    const staticManifestSectionSource = readFileSync(`${projectRoot}/src/components/internal/ScannedIntakeStaticManifestSection.tsx`, 'utf8');
    const staticManifestSource = readFileSync(`${projectRoot}/src/components/internal/scanned-intake-static-manifest.ts`, 'utf8');

    for (const source of [componentSource, pageSource]) {
      expect(source).not.toContain('node:fs');
      expect(source).not.toContain('node:path');
      expect(source).not.toContain('useState');
      expect(source).not.toContain('useReducer');
      expect(source).not.toContain('useRef');
      expect(source).not.toContain('listScannedFolderFilesRecursive');
      expect(source).not.toContain('createScannedIntakeStagingCandidates');
      expect(source).not.toContain('createTaskCandidatesFromScannedIntake');
      expect(source).not.toContain('useBrainStore');
      expect(source).not.toContain('useMatterStore');
      expect(source).not.toContain('zustand');
      expect(source).not.toContain('localStorage');
      expect(source).not.toContain('indexedDB');
      expect(source).not.toContain('supabase');
      expect(source).not.toContain('createWorkItem');
      expect(source).not.toContain('createMatter');
      expect(source).not.toContain('createDocumentRef');
      expect(source).not.toContain('createIntakeEvent');
      expect(source).not.toContain('createIntakeAttachment');
      expect(source).not.toContain('MatterWorkspace');
      expect(source).not.toContain('DocumentsPage');
      expect(source).not.toContain('CeoOffice');
      expect(source).not.toContain('Dashboard');
      expect(source).not.toContain('Sidebar');
    }

    for (const source of [staticManifestSectionSource, staticManifestSource]) {
      expect(source).not.toContain('node:fs');
      expect(source).not.toContain('node:path');
      expect(source).not.toContain('listScannedFolderFilesRecursive');
      expect(source).not.toContain('createScannedIntakeStagingCandidates');
      expect(source).not.toContain('useBrainStore');
      expect(source).not.toContain('useMatterStore');
      expect(source).not.toContain('localStorage');
      expect(source).not.toContain('sessionStorage');
      expect(source).not.toContain('indexedDB');
      expect(source).not.toContain('supabase');
      expect(source).not.toContain('fetch(');
      expect(source).not.toContain('createWorkItem(');
      expect(source).not.toContain('createMatter(');
      expect(source).not.toContain('createDocumentRef(');
    }

    expect(snapshotSource).not.toContain('node:fs');
    expect(snapshotSource).not.toContain('node:path');
    expect(snapshotSource).not.toContain('listScannedFolderFilesRecursive');
    expect(snapshotSource).not.toContain('createScannedIntakeStagingCandidates');
    expect(taskSnapshotSource).not.toContain('node:fs');
    expect(taskSnapshotSource).not.toContain('node:path');
    expect(taskSnapshotSource).not.toContain('listScannedFolderFilesRecursive');
    expect(taskSnapshotSource).not.toContain('createScannedIntakeStagingCandidates');
    expect(taskSnapshotSource).not.toContain('createTaskCandidatesFromScannedIntake');
    expect(taskSnapshotSource).not.toContain('createWorkItem');
    expect(taskSnapshotSource).not.toContain('createMatter');
    expect(taskSnapshotSource).not.toContain('createDocumentRef');
    expect(taskSnapshotSource).not.toContain('createIntakeEvent');
    expect(taskSnapshotSource).not.toContain('createIntakeAttachment');
    expect(manualDecisionDraftSource).not.toContain('node:fs');
    expect(manualDecisionDraftSource).not.toContain('node:path');
    expect(manualDecisionDraftSource).not.toContain('localStorage');
    expect(manualDecisionDraftSource).not.toContain('indexedDB');
    expect(manualDecisionDraftSource).not.toContain('supabase');
    expect(manualDecisionDraftSource).not.toContain('useBrainStore');
    expect(manualDecisionDraftSource).not.toContain('useMatterStore');
    expect(manualDecisionDraftSource).not.toContain('zustand');
    expect(manualDecisionDraftSource).not.toContain('createWorkItem');
    expect(manualDecisionDraftSource).not.toContain('createMatter');
    expect(manualDecisionDraftSource).not.toContain('createDocumentRef');
    expect(manualDecisionDraftSource).not.toContain('createIntakeEvent');
    expect(manualDecisionDraftSource).not.toContain('createIntakeAttachment');
    expect(workItemPreviewGateSource).not.toContain('node:fs');
    expect(workItemPreviewGateSource).not.toContain('node:path');
    expect(workItemPreviewGateSource).not.toContain('localStorage');
    expect(workItemPreviewGateSource).not.toContain('indexedDB');
    expect(workItemPreviewGateSource).not.toContain('supabase');
    expect(workItemPreviewGateSource).not.toContain('useBrainStore');
    expect(workItemPreviewGateSource).not.toContain('useMatterStore');
    expect(workItemPreviewGateSource).not.toContain('zustand');
    expect(workItemPreviewGateSource).not.toContain('createWorkItem');
    expect(workItemPreviewGateSource).not.toContain('createMatter');
    expect(workItemPreviewGateSource).not.toContain('createDocumentRef');
    expect(workItemPreviewGateSource).not.toContain('createIntakeEvent');
    expect(workItemPreviewGateSource).not.toContain('createIntakeAttachment');
    expect(localDraftEditorSource).not.toContain('localStorage');
    expect(localDraftEditorSource).not.toContain('sessionStorage');
    expect(localDraftEditorSource).not.toContain('indexedDB');
    expect(localDraftEditorSource).not.toContain('supabase');
    expect(localDraftEditorSource).not.toContain('zustand');
    expect(localDraftEditorSource).not.toContain('useBrainStore');
    expect(localDraftEditorSource).not.toContain('useMatterStore');
    expect(localDraftEditorSource).not.toContain('createWorkItem');
    expect(localDraftEditorSource).not.toContain('createMatter');
    expect(localDraftEditorSource).not.toContain('createDocumentRef');
    expect(localDraftEditorSource).not.toContain('createIntakeEvent');
    expect(localDraftEditorSource).not.toContain('createIntakeAttachment');
    for (const source of [localWorkItemPreviewSource, localWorkItemPreviewDisplaySource]) {
      expect(source).not.toContain('localStorage');
      expect(source).not.toContain('sessionStorage');
      expect(source).not.toContain('indexedDB');
      expect(source).not.toContain('supabase');
      expect(source).not.toContain('zustand');
      expect(source).not.toContain('useBrainStore');
      expect(source).not.toContain('useMatterStore');
      expect(source).not.toContain('createWorkItem');
      expect(source).not.toContain('createMatter');
      expect(source).not.toContain('createDocumentRef');
      expect(source).not.toContain('createIntakeEvent');
      expect(source).not.toContain('createIntakeAttachment');
    }
  });

  it('adds the internal hidden route without adding sidebar navigation or operational screen adoption', () => {
    const mainSource = readFileSync(`${projectRoot}/src/main.tsx`, 'utf8');
    const sidebarSource = readFileSync(`${projectRoot}/src/data/sidebarNav.ts`, 'utf8');
    const matterWorkspaceSource = readFileSync(`${projectRoot}/src/pages/matter-workspace/MatterWorkspace.tsx`, 'utf8');
    const documentsPageSource = readFileSync(`${projectRoot}/src/pages/documents/DocumentsPage.tsx`, 'utf8');
    const ceoOfficeSource = readFileSync(`${projectRoot}/src/pages/ceo-office/CeoOffice.tsx`, 'utf8');

    expect(mainSource).toContain('/internal/scanned-intake');
    expect(mainSource).toContain('ScannedIntakeInspectorPage');
    expect(sidebarSource).not.toContain('/internal/scanned-intake');
    expect(matterWorkspaceSource).not.toContain('ScannedIntakeInspector');
    expect(documentsPageSource).not.toContain('ScannedIntakeInspector');
    expect(ceoOfficeSource).not.toContain('ScannedIntakeInspector');
  });
});
// #endregion
