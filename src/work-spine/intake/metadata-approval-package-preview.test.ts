/* ==== FILE: src/work-spine/intake/metadata-approval-package-preview.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';

import source from './metadata-approval-package-preview.ts?raw';
import {
  METADATA_APPROVAL_PACKAGE_BLOCKED_ACTIONS,
  buildMetadataApprovalPackagePreview,
} from './metadata-approval-package-preview';
// #endregion

// #region Tests
describe('metadata approval package preview', () => {
  const packagePreview = buildMetadataApprovalPackagePreview({
    sourceId: 'static-scan-candidate-1',
    sourceLabel: 'סריקות folder/sample.pdf',
    possibleCategory: 'scan_metadata_candidate',
    confidence: 'medium',
    sourceSignals: ['folderLabel: סריקות', 'extension: pdf'],
    reviewGateId: 'metadata-review-gate:static-scan-candidate-1',
    reviewStatus: 'pending_eldad_review',
  });

  it('builds one metadata-only approval package preview with required safety flags', () => {
    expect(packagePreview).toMatchObject({
      approvalPackageId: 'metadata-approval-package:static-scan-candidate-1',
      packageStatus: 'preview_only_not_submitted',
      previewPackageOnly: true,
      persistenceAllowed: false,
      entityCreationBlocked: true,
      contentUnverified: true,
      contentRead: false,
      ocrPerformed: false,
      providerConnected: false,
      sendingAllowed: false,
      filingAllowed: false,
      submissionAllowed: false,
    });
  });

  it('keeps blocked actions explicit and non-empty', () => {
    expect(packagePreview.blockedActions).toEqual(METADATA_APPROVAL_PACKAGE_BLOCKED_ACTIONS);
    expect(packagePreview.blockedActions).toContain('persistence_blocked');
    expect(packagePreview.blockedActions).toContain('entity_creation_blocked');
    expect(packagePreview.blockedActions).toContain('ocr_blocked');
  });

  it('does not include browser storage, imports, content access, or operational entity code', () => {
    const forbidden = [
      'localStorage',
      'sessionStorage',
      'fetch(',
      "from 'fs'",
      'from "fs"',
      "from 'path'",
      'from "path"',
      'OAuthClient',
      'GmailClient',
      'DriveClient',
      'MavenClient',
      'Matter',
      'WorkItem',
      'DocumentRef',
    ];

    for (const term of forbidden) {
      expect(source).not.toContain(term);
    }
  });
});
// #endregion
