/* ============================================
   FILE: learning-inbox-view.test.tsx
   PURPOSE: Focused tests for the static read-only Learning Inbox UI.
   DEPENDENCIES: Vitest, React, react-dom/server, fs, LearningInboxView
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import LearningInboxView from './LearningInboxView';
// #endregion

// #region Constants
const projectRoot = process.cwd().replace(/\\/g, '/');
const viewSource = readFileSync(`${projectRoot}/src/components/internal/LearningInboxView.tsx`, 'utf8');
const pageSource = readFileSync(`${projectRoot}/src/pages/internal/LearningInboxPage.tsx`, 'utf8');
const mainSource = readFileSync(`${projectRoot}/src/main.tsx`, 'utf8');
const combinedSource = `${viewSource}\n${pageSource}`;
const domains = ['מע"מ', 'חוות דעת', 'דיני עבודה', 'שכר', 'פיצויי מלחמה', 'הנהלת חשבונות', 'הצהרות הון', 'החזרי מס', 'מכתבים', 'ניהול לקוחות', 'רוביום'];
const forbiddenButtons = ['Approve', 'Reject', 'Persist', 'Sync', 'Create', 'Add to knowledgeLog'];
const forbiddenImportPatterns = [
  /from\s+['"][^'"]*brainStore[^'"]*['"]/,
  /from\s+['"][^'"]*store[^'"]*['"]/i,
  /from\s+['"][^'"]*KnowledgeSearch[^'"]*['"]/,
  /from\s+['"][^'"]*BrainLearnedBlock[^'"]*['"]/,
  /from\s+['"][^'"]*supabase[^'"]*['"]/i,
];
const forbiddenUsageSnippets = ['useBrainStore', 'useMatterStore', 'localStorage.', 'sessionStorage.', 'indexedDB.', 'fetch(', 'createWorkItem('];
// #endregion

// #region Tests
describe('Learning Inbox View', () => {
  it('renders the Learning Inbox title and static read-only badge', () => {
    const markup = renderToStaticMarkup(React.createElement(LearningInboxView));

    expect(markup).toContain('Learning Inbox');
    expect(markup).toContain('static/read-only/mock');
    expect(markup).toContain('Static learning seed only.');
  });

  it('renders pending, approved mock, and rejected or obsolete sections', () => {
    const markup = renderToStaticMarkup(React.createElement(LearningInboxView));

    expect(markup).toContain('Pending Eldad Review');
    expect(markup).toContain('Approved Knowledge mock');
    expect(markup).toContain('Rejected / Obsolete');
    expect(markup).toContain('Draft candidates');
    expect(markup).toContain('No approved mock items in static seed.');
    expect(markup).toContain('No rejected or obsolete mock items in static seed.');
  });

  it('renders domain filters, source evidence, approval boundary, and decision log preview', () => {
    const markup = renderToStaticMarkup(React.createElement(LearningInboxView));

    expect(markup).toContain('Domain filters');
    for (const domain of domains) expect(markup).toContain(domain.replace('"', '&quot;'));
    expect(markup).toContain('source/evidence');
    expect(markup).toContain('approval boundary');
    expect(markup).toContain('Eldad Decision Log preview');
    expect(markup).toContain('requiresEldadApproval=true');
    expect(markup).toContain('approvedByEldad=false');
    expect(markup).toContain('No Eldad decision recorded. Preview only.');
  });

  it('does not render forbidden action buttons', () => {
    const markup = renderToStaticMarkup(React.createElement(LearningInboxView));

    expect((markup.match(/<button/g) ?? []).length).toBe(0);
    for (const label of forbiddenButtons) expect(markup).not.toContain(`>${label}<`);
  });

  it('does not import stores, legacy knowledge UI, persistence, Supabase, or write paths', () => {
    for (const pattern of forbiddenImportPatterns) expect(combinedSource).not.toMatch(pattern);
    for (const snippet of forbiddenUsageSnippets) expect(combinedSource).not.toContain(snippet);
    expect(combinedSource).not.toContain('from "../../store');
    expect(combinedSource).not.toContain('from "../store');
  });

  it('registers only the hidden internal learning inbox route', () => {
    expect(mainSource).toContain('LearningInboxPage');
    expect(mainSource).toContain('/internal/learning-inbox');
    expect(mainSource).not.toContain('sidebarNav');
  });
});
// #endregion
