/* ============================================
   FILE: brain-diagnostics-view.test.tsx
   PURPOSE: Focused tests for the read-only Brain diagnostics internal view.
   DEPENDENCIES: vitest, react-dom/server, fs, BrainDiagnosticsPage
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
// #endregion

// #region Constants
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';
const diagnosticsSources = [
  `${projectRoot}/src/components/internal/BrainDiagnosticsView.tsx`,
  `${projectRoot}/src/components/internal/brain-diagnostics-static-manifest.ts`,
  `${projectRoot}/src/pages/internal/BrainDiagnosticsPage.tsx`,
];
// #endregion

// #region Helpers
const createList = (count: number) => Array.from({ length: count }, (_, index) => ({ id: `item-${index}` }));

const createSnapshot = () => ({
  projection: {
    subjects: createList(1),
    roleProjections: createList(1),
    matters: createList(1),
    intakeEvents: [],
    intakeAttachments: [],
    documentRefs: [],
    processInstances: [],
    workItems: [],
    knowledgeItems: [],
  },
  diagnostics: {
    successCounts: {
      subjects: 1,
      roleProjections: 1,
      matters: 1,
      intakeEvents: 0,
      intakeAttachments: 0,
      documentRefs: 0,
      processInstances: 0,
      workItems: 0,
      knowledgeItems: 0,
    },
    failureCounts: {
      subjects: 0,
      roleProjections: 0,
      matters: 0,
      intakeEvents: 0,
      intakeAttachments: 0,
      documentRefs: 0,
      processInstances: 0,
      workItems: 0,
      knowledgeItems: 0,
      total: 0,
    },
    failuresByReason: {},
    orphanCandidates: [],
    duplicateSubjectCandidates: [],
    pendingKnowledgeReview: [],
    unresolvedIntakeAttachments: [],
  },
  status: 'ready',
});

const renderDiagnosticsPage = async () => {
  const getSnapshotSpy = vi.fn(() => createSnapshot());

  vi.doMock('../../work-spine/read-model/brain-spine-read-model', () => ({
    getBrainSpineProjectionSnapshot: getSnapshotSpy,
  }));

  const pageModule = await import('../../pages/internal/BrainDiagnosticsPage');
  return {
    getSnapshotSpy,
    markup: renderToStaticMarkup(React.createElement(pageModule.default)),
  };
};

const readDiagnosticsSources = () => diagnosticsSources.map((path) => readFileSync(path, 'utf8')).join('\n');
// #endregion

// #region Tests
describe('BrainDiagnosticsView', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.resetModules();
    vi.doUnmock('../../work-spine/read-model/brain-spine-read-model');
  });

  it('renders the read-only title, badge, live counts, folder counts, and gap panel', async () => {
    const { markup, getSnapshotSpy } = await renderDiagnosticsPage();

    expect(markup).toContain('Brain Diagnostics — Read Only');
    expect(markup).toContain('Locked / read-only');
    expect(markup).toContain('Brain Live Model Counts');
    expect(markup).toContain('entities / projected subjects');
    expect(markup).toContain('matters');
    expect(markup).toContain('documentRefs');
    expect(markup).toContain('incomingDocuments / intakeAttachments');
    expect(markup).toContain('לקוחות/');
    expect(markup).toContain('147 dirs / 593 files');
    expect(markup).toContain('דוד אלדד/');
    expect(markup).toContain('69 dirs / 405 files');
    expect(markup).toContain('סריקות/');
    expect(markup).toContain('34 dirs / 132 files');
    expect(markup).toContain('Gap Panel');
    expect(markup).toContain('Folder files not represented as documentRefs');
    expect(markup).toContain('1130');
    expect(getSnapshotSpy).toHaveBeenCalledTimes(1);
  });

  it('renders the active working set, workflow domains, frozen groups, and safety notice', async () => {
    const { markup } = await renderDiagnosticsPage();

    expect(markup).toContain('Dima');
    expect(markup).toContain('Tsila');
    expect(markup).toContain('VAT / מע&quot;מ process');
    expect(markup).toContain('חוות דעת');
    expect(markup).toContain('expert opinions and professional learning corpus');
    expect(markup).toContain('מע&quot;מ');
    expect(markup).toContain('פיצויי מלחמה');
    expect(markup).toContain('הנהלת חשבונות');
    expect(markup).toContain('Frozen / No-Touch Groups');
    expect(markup).toContain('client folders');
    expect(markup).toContain('source documents');
    expect(markup).toContain('scans inbox');
    expect(markup).toContain('operational Store/Persistence/WorkItem/Matter/DocumentRef paths');
    expect(markup).toContain('This view does not sync, promote, persist, or create operational records.');
  });

  it('does not render mutation buttons or write to browser storage or network-like APIs', async () => {
    const localStorageSetItem = vi.fn();
    const sessionStorageSetItem = vi.fn();
    const indexedDbOpen = vi.fn();
    const fetchSpy = vi.fn();

    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: localStorageSetItem });
    vi.stubGlobal('sessionStorage', { getItem: vi.fn(), setItem: sessionStorageSetItem });
    vi.stubGlobal('indexedDB', { open: indexedDbOpen });
    vi.stubGlobal('fetch', fetchSpy);

    const { markup } = await renderDiagnosticsPage();

    expect(markup).not.toContain('<button');
    expect(markup).not.toContain('>Sync<');
    expect(markup).not.toContain('>Fix<');
    expect(markup).not.toContain('>Promote<');
    expect(markup).not.toContain('>Create<');
    expect(localStorageSetItem).not.toHaveBeenCalled();
    expect(sessionStorageSetItem).not.toHaveBeenCalled();
    expect(indexedDbOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps implementation isolated from scanning, API imports, store setters, and creation calls', () => {
    const source = readDiagnosticsSources();
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import ')).join('\n');

    expect(importLines).not.toContain('node:fs');
    expect(importLines).not.toContain('Gmail');
    expect(importLines).not.toContain('Drive');
    expect(importLines).not.toContain('API');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('setState');
    expect(source).not.toContain('createWorkItem');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('readdir');
    expect(source).not.toContain('readFileSync');
    expect(source).not.toContain('fetch(');
  });

  it('registers only the hidden internal diagnostics route without sidebar adoption', () => {
    const mainSource = readFileSync(`${projectRoot}/src/main.tsx`, 'utf8');
    const sidebarSource = readFileSync(`${projectRoot}/src/data/sidebarNav.ts`, 'utf8');

    expect(mainSource).toContain('BrainDiagnosticsPage');
    expect(mainSource).toContain('/internal/brain-diagnostics');
    expect(sidebarSource).not.toContain('/internal/brain-diagnostics');
  });
});
// #endregion
