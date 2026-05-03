/* ============================================
   FILE: unified-provider-preview-section.test.tsx
   PURPOSE: Focused tests for Stage 5E unified provider preview UI.
   DEPENDENCIES: Vitest, React, react-dom/server, Stage 5D registry, UnifiedProviderPreviewSection
   EXPORTS: None
   ============================================ */

// #region Imports
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import UnifiedIntakeInspectorPage from '../../pages/internal/UnifiedIntakeInspectorPage';
import { METADATA_ADAPTER_REGISTRY } from '../../work-spine/providers/metadata-adapter-registry';
import UnifiedProviderPreviewSection from './UnifiedProviderPreviewSection';
// #endregion

// #region Constants
const forbiddenActionLabels = [
  'Connect',
  'OAuth',
  'Login',
  'Refresh',
  'Fetch',
  'Sync',
  'Download',
  'Export',
  'OCR',
  'Upload',
  'Import',
  'Create',
  'Approve',
  'Route',
  'Save',
  'Delete',
  'Move',
];
// #endregion

// #region Tests
describe('UnifiedProviderPreviewSection', () => {
  it('renders Gmail, Drive, and Scans providers from the Stage 5D registry', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedProviderPreviewSection));

    expect(markup).toContain('Unified provider preview');
    expect(markup).toContain('Metadata only');
    expect(markup).toContain('No live provider connected');
    expect(markup).toContain('No operational action can be created from this preview');
    expect((markup.match(/data-testid="unified-provider-preview-card"/g) ?? []).length).toBe(
      METADATA_ADAPTER_REGISTRY.length,
    );

    for (const adapter of METADATA_ADAPTER_REGISTRY) {
      expect(markup).toContain(adapter.adapterId);
      expect(markup).toContain(adapter.providerKind);
      expect(markup).toContain(adapter.displayName);
    }
  });

  it('shows metadata-only mode and all capabilities as false', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedProviderPreviewSection));

    expect((markup.match(/metadata_only/g) ?? []).length).toBe(3);
    expect((markup.match(/liveConnection: false/g) ?? []).length).toBe(3);
    expect((markup.match(/oauth: false/g) ?? []).length).toBe(3);
    expect((markup.match(/apiAccess: false/g) ?? []).length).toBe(3);
    expect((markup.match(/fileSystemAccess: false/g) ?? []).length).toBe(3);
    expect((markup.match(/contentRead: false/g) ?? []).length).toBe(3);
    expect((markup.match(/createsOperationalRecords: false/g) ?? []).length).toBe(3);
    expect((markup.match(/persists: false/g) ?? []).length).toBe(3);
  });

  it('shows normalized source types, source metadata, and boundary flags', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedProviderPreviewSection));

    expect(markup).toContain('email');
    expect(markup).toContain('drive');
    expect(markup).toContain('scan');
    expect(markup).toContain('gmail:gmail-stage5a-message-001');
    expect(markup).toContain('drive:drive-stage5b-hebrew-001');
    expect(markup).toContain('scan:scan-stage5c-invoice-001');
    expect(markup).toContain('חשבונית-מע״מ-מאי.pdf');
    expect((markup.match(/allowedMode: local_preview_only/g) ?? []).length).toBe(3);
    expect((markup.match(/canCreateWorkItem: false/g) ?? []).length).toBe(3);
    expect((markup.match(/canCreateMatter: false/g) ?? []).length).toBe(3);
    expect((markup.match(/canCreateDocumentRef: false/g) ?? []).length).toBe(3);
    expect((markup.match(/requiresEldadApproval: true/g) ?? []).length).toBe(3);
    expect((markup.match(/operationalActionBlocked: true/g) ?? []).length).toBe(3);
  });

  it('does not render forbidden action buttons or operational controls', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedProviderPreviewSection));

    expect((markup.match(/<button/g) ?? []).length).toBe(0);
    expect(markup).not.toContain('onClick');

    for (const label of forbiddenActionLabels) {
      expect(markup).not.toContain(`>${label}<`);
    }
  });

  it('is integrated into the hidden Unified Intake inspector page', () => {
    const markup = renderToStaticMarkup(React.createElement(UnifiedIntakeInspectorPage));

    expect((markup.match(/data-testid="unified-provider-preview-section"/g) ?? []).length).toBe(1);
    expect(markup).toContain('gmail_metadata_adapter');
    expect(markup).toContain('drive_metadata_adapter');
    expect(markup).toContain('scans_metadata_adapter');
  });
});
// #endregion
