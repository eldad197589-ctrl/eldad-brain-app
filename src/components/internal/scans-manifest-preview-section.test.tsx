/* ============================================
   FILE: scans-manifest-preview-section.test.tsx
   PURPOSE: Focused render tests for the Stage 6C-2 static scans manifest preview.
   DEPENDENCIES: Vitest, React server renderer, static scans manifest fixture
   EXPORTS: Test suite
   ============================================ */

// #region Imports
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ScannedIntakeInspectorPage from '../../pages/internal/ScannedIntakeInspectorPage';
import { STATIC_SCAN_MANIFEST } from '../../work-spine/providers/scans/scan-manifest-seed';
import ScansManifestPreviewSection from './ScansManifestPreviewSection';
// #endregion

// #region Helpers
const renderPreview = (): string => renderToStaticMarkup(<ScansManifestPreviewSection />);
// #endregion

// #region Tests
describe('ScansManifestPreviewSection', () => {
  it('renders every static scan manifest entry', () => {
    const html = renderPreview();
    const renderedEntries = html.match(/data-testid="scans-manifest-preview-entry"/g) ?? [];

    expect(renderedEntries).toHaveLength(STATIC_SCAN_MANIFEST.entries.length);

    STATIC_SCAN_MANIFEST.entries.forEach((entry) => {
      expect(html).toContain(entry.scanId);
      expect(html).toContain(entry.filename);
      expect(html).toContain(entry.scannerIdentity);
      expect(html).toContain(entry.timestamp);
      expect(html).toContain(entry.fileType);
    });
  });

  it('shows static manifest identity and sourceType scan', () => {
    const html = renderPreview();

    expect(html).toContain(STATIC_SCAN_MANIFEST.manifestId);
    expect(html).toContain(STATIC_SCAN_MANIFEST.schemaVersion);
    expect(html).toContain(STATIC_SCAN_MANIFEST.generatedAt);
    expect(html).toContain('sourceType');
    expect(html).toContain('scan');
  });

  it('shows read-only safety warnings', () => {
    const html = renderPreview();

    expect(html).toContain('Static manifest preview only');
    expect(html).toContain('No file read');
    expect(html).toContain('No OCR');
    expect(html).toContain('No file movement');
    expect(html).toContain('No operational record creation');
  });

  it('does not render action buttons or operational handlers', () => {
    const html = renderPreview();

    expect(html).not.toContain('<button');
    expect(html).not.toContain('onClick');
    expect(html).not.toContain('Create</button');
    expect(html).not.toContain('Move</button');
    expect(html).not.toContain('Delete</button');
    expect(html).not.toContain('Route</button');
    expect(html).not.toContain('Sync</button');
  });

  it('handles missing optional metadata safely', () => {
    const html = renderPreview();
    const minimalEntry = STATIC_SCAN_MANIFEST.entries.find((entry) => entry.scanId === 'scan-stage6c1-unknown-low-quality');

    expect(minimalEntry).toBeDefined();
    expect(minimalEntry?.pageCount).toBeUndefined();
    expect(minimalEntry?.fileSizeBytes).toBeUndefined();
    expect(html).toContain('not provided');
    expect(html).toContain('low_quality');
  });

  it('is wired into the internal scanned intake page', () => {
    const html = renderToStaticMarkup(<ScannedIntakeInspectorPage />);

    expect(html).toContain('Scans Manifest Preview');
    expect(html).toContain(STATIC_SCAN_MANIFEST.manifestId);
  });
});
// #endregion
