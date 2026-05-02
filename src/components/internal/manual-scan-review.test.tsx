/* ============================================
   FILE: manual-scan-review.test.tsx
   PURPOSE: Focused tests for the local-only manual scan review UI.
   DEPENDENCIES: vitest, react-dom/server, fs, ManualScanReview
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import ManualScanReview from './ManualScanReview';
import { SCANNED_INTAKE_STATIC_MANIFEST } from './scanned-intake-static-manifest';
// #endregion

// #region Constants
const dimaEntry = SCANNED_INTAKE_STATIC_MANIFEST[0];
const completeReview = {
  confirmedEntity: 'Dima',
  confirmedIntakeType: 'case' as const,
  confirmedProcess: 'war_compensation' as const,
  priority: 'medium' as const,
  urgency: 'soon' as const,
  reviewer: 'Eldad',
  evidenceChecked: true,
  reviewNote: 'local only',
  decision: 'ready_for_task_preview' as const,
};
// #endregion

// #region Tests
describe('ManualScanReview', () => {
  it('renders local-only review fields, blockers, and safety labels by default', () => {
    const markup = renderToStaticMarkup(React.createElement(ManualScanReview, { entry: dimaEntry }));

    expect(markup).toContain('Manual Scan Review — local only');
    expect(markup).toContain('State resets on reload');
    expect(markup).toContain('confirmedEntity');
    expect(markup).toContain('confirmedIntakeType');
    expect(markup).toContain('confirmedProcess');
    expect(markup).toContain('priority');
    expect(markup).toContain('urgency');
    expect(markup).toContain('reviewer');
    expect(markup).toContain('evidenceChecked');
    expect(markup).toContain('reviewNote');
    expect(markup).toContain('decision');
    expect(markup).toContain('previewStatus: blocked');
    expect(markup).toContain('canCreateWorkItem=false');
    expect(markup).toContain('requires explicit Eldad approval');
    expect(markup).toContain('confirmedEntity');
    expect(markup).not.toContain('data-testid="manual-scan-local-preview"');
  });

  it('renders local preview only when all required fields are complete', () => {
    const markup = renderToStaticMarkup(React.createElement(ManualScanReview, { entry: dimaEntry, initialReview: completeReview }));

    expect(markup).toContain('previewStatus: local_preview_only');
    expect(markup).toContain('missingFields: none');
    expect(markup).toContain('local_preview_only: בניית ערר או השגה דימה פיצוי מלחמה מסלול אדום');
    expect(markup).toContain('canCreateWorkItem=false');
    expect(markup).toContain('requires explicit Eldad approval');
  });

  it('resets to blocked state on remount without an initial local review', () => {
    const completeMarkup = renderToStaticMarkup(React.createElement(ManualScanReview, { entry: dimaEntry, initialReview: completeReview }));
    const remountedMarkup = renderToStaticMarkup(React.createElement(ManualScanReview, { entry: dimaEntry }));

    expect(completeMarkup).toContain('previewStatus: local_preview_only');
    expect(remountedMarkup).toContain('previewStatus: blocked');
    expect(remountedMarkup).not.toContain('data-testid="manual-scan-local-preview"');
  });

  it('does not render forbidden action buttons or write to browser storage and network APIs', () => {
    const localStorageSetItem = vi.fn();
    const sessionStorageSetItem = vi.fn();
    const indexedDbOpen = vi.fn();
    const fetchSpy = vi.fn();

    vi.stubGlobal('localStorage', { setItem: localStorageSetItem });
    vi.stubGlobal('sessionStorage', { setItem: sessionStorageSetItem });
    vi.stubGlobal('indexedDB', { open: indexedDbOpen });
    vi.stubGlobal('fetch', fetchSpy);

    const markup = renderToStaticMarkup(React.createElement(ManualScanReview, { entry: dimaEntry }));

    expect(markup).not.toContain('<button');
    expect(markup).not.toContain('>Sync<');
    expect(markup).not.toContain('>Fix<');
    expect(markup).not.toContain('>Promote<');
    expect(markup).not.toContain('>Create<');
    expect(markup).not.toContain('>OCR<');
    expect(markup).not.toContain('>Delete<');
    expect(markup).not.toContain('>Move<');
    expect(markup).not.toContain('>Rename<');
    expect(localStorageSetItem).not.toHaveBeenCalled();
    expect(sessionStorageSetItem).not.toHaveBeenCalled();
    expect(indexedDbOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps the implementation free of filesystem, store, API, and creation calls', () => {
    const source = readFileSync(new URL('./ManualScanReview.tsx', import.meta.url), 'utf8');

    expect(source).not.toContain('node:fs');
    expect(source).not.toContain('node:path');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('createWorkItem(');
    expect(source).not.toContain('createMatter(');
    expect(source).not.toContain('createDocumentRef(');
  });
});
// #endregion
