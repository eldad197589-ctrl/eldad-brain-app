/* ============================================
   FILE: LocalWorkItemPreviewDisplay.test.tsx
   PURPOSE: Focused tests for the stateless local WorkItem preview display.
   DEPENDENCIES: vitest, react, react-dom/server, fs, LocalWorkItemPreviewDisplay
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { LocalWorkItemPreview } from '../../../work-spine/intake/local-workitem-preview';
import { LocalWorkItemPreviewDisplay } from './LocalWorkItemPreviewDisplay';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const createPreview = (overrides: Partial<LocalWorkItemPreview> = {}): LocalWorkItemPreview => ({
  previewId: 'local-workitem-preview:scan-task-test',
  sourceTaskCandidateId: 'scan-task-test',
  sourceDecisionDraftLocalOnly: true,
  previewStatus: 'blocked',
  canCreateWorkItem: false,
  wouldCreateWorkItem: false,
  proposedWorkItem: null,
  blockers: ['selectedDecision', 'taskTitleApproval'],
  warnings: [],
  generatedAtLocalOnly: '2026-04-30T00:00:00.000Z',
  ...overrides,
});

const forbiddenActionLabels = [
  'שמור',
  'אשר',
  'צור משימה',
  'פתח משימה',
  'צור תצוגת משימה',
  'שייך לתיק',
  'הקצה אחראי',
  'קבע תאריך',
  'קבע עדיפות',
  'הפעל OCR',
  'סווג',
];
// #endregion

// #region Tests
describe('LocalWorkItemPreviewDisplay', () => {
  it('renders blocked state with blockers', () => {
    const markup = renderToStaticMarkup(React.createElement(LocalWorkItemPreviewDisplay, { preview: createPreview() }));

    expect(markup).toContain('תצוגת משימה: חסומה');
    expect(markup).toContain('חסרים שדות בטיוטה המקומית');
    expect(markup).toContain('החלטה לא נבחרה');
    expect(markup).toContain('כותרת לא אושרה');
    expect(markup).toContain('WorkItem שייווצר: אין');
  });

  it('renders not_applicable state without proposed WorkItem', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LocalWorkItemPreviewDisplay, {
        preview: createPreview({
          previewStatus: 'not_applicable',
          blockers: [],
        }),
      }),
    );

    expect(markup).toContain('אין תצוגת משימה');
    expect(markup).toContain('ההחלטה המקומית אינה פתיחת משימה');
    expect(markup).toContain('סיבה: החלטה מקומית שאינה פתיחת משימה');
    expect(markup).toContain('WorkItem שייווצר: אין');
    expect(markup).not.toContain('data-testid="local-workitem-preview-card"');
  });

  it('renders ready state with repeated draft-only warning and read-only proposed fields', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LocalWorkItemPreviewDisplay, {
        preview: createPreview({
          previewStatus: 'ready',
          blockers: [],
          proposedWorkItem: {
            title: 'כותרת מקומית מאושרת',
            description: 'תיאור מקומי בלבד',
            sourceEvidence: {
              sourceGroupName: 'קבוצת מקור',
              sourceFileNames: ['a.pdf', 'b.pdf'],
              sourceFilesCount: 2,
            },
            matterDecision: 'assign_existing_matter',
            proposedMatterId: 'matter-local-only',
            ownerDecision: 'assign_owner',
            proposedOwner: 'אלדד',
            dueDateDecision: 'set_due_date',
            proposedDueDate: '2026-05-15',
            priorityDecision: 'set_priority',
            proposedPriority: 'high',
            status: 'draft_preview_only',
          },
        }),
      }),
    );

    expect(markup).toContain('תצוגת משימה — טיוטה בלבד');
    expect(markup).toContain('לא נשמר. לא נפתחה משימה.');
    expect(markup).toContain('טיוטה בלבד — לא נשמרה ולא נפתחה משימה');
    expect(markup).toContain('כותרת: כותרת מקומית מאושרת');
    expect(markup).toContain('תיאור: תיאור מקומי בלבד');
    expect(markup).toContain('ראיות מקור: קבוצת מקור');
    expect(markup).toContain('a.pdf');
    expect(markup).toContain('החלטת תיק: assign_existing_matter');
    expect(markup).toContain('תיק מוצע: matter-local-only');
    expect(markup).toContain('אחראי מוצע: אלדד');
    expect(markup).toContain('תאריך יעד מוצע: 2026-05-15');
    expect(markup).toContain('עדיפות מוצעת: high');
    expect(markup).toContain('status: draft_preview_only');
  });

  it('does not render controls or forbidden action labels', () => {
    const markup = renderToStaticMarkup(React.createElement(LocalWorkItemPreviewDisplay, { preview: createPreview() }));

    expect(markup).not.toContain('<button');
    expect(markup).not.toContain('<input');
    expect(markup).not.toContain('<select');
    expect(markup).not.toContain('<textarea');
    for (const label of forbiddenActionLabels) {
      expect(markup).not.toContain(`>${label}<`);
    }
  });

  it('keeps the display free of stores and persistence APIs', () => {
    const source = readFileSync(`${projectRoot}/src/components/internal/local-draft/LocalWorkItemPreviewDisplay.tsx`, 'utf8');

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
  });
});
// #endregion
