/* ==== FILE: src/work-spine/intake/metadata-review-gate-helper.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  buildMetadataReviewGatePreview,
  METADATA_REVIEW_GATE_BLOCKED_ACTIONS,
} from './metadata-review-gate-helper';
import helperSource from './metadata-review-gate-helper.ts?raw';
// #endregion

// #region Constants
const FORBIDDEN_IMPORT_TERMS = [
  'local' + 'Storage',
  'session' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'useBrain' + 'Store',
  'useMat' + 'ter' + 'Store',
  'brain' + 'Store',
  'matter' + 'Store',
  'fet' + 'ch',
  'google' + 'apis',
  'fs',
  'path',
] as const;

const FORBIDDEN_OPERATIONAL_TERMS = ['Work' + 'Item', 'Mat' + 'ter', 'Document' + 'Ref'] as const;
// #endregion

// #region Helpers
const importLinesFrom = (sourceText: string): readonly string[] =>
  sourceText.split(/\r?\n/).filter((line) => line.trim().startsWith('import '));
// #endregion

// #region Tests
describe('buildMetadataReviewGatePreview', () => {
  it('returns a stateless preview gate for metadata only', () => {
    const gate = buildMetadataReviewGatePreview({
      sourceId: 'metadata-source-1',
      sourceLabel: 'Static metadata source',
      sourceType: 'scan',
      timestampLabel: '2026-05-06',
    });

    expect(gate).toEqual({
      reviewGateId: 'metadata-review-gate:metadata-source-1',
      sourceId: 'metadata-source-1',
      sourceLabel: 'Static metadata source',
      sourceType: 'scan',
      timestampLabel: '2026-05-06',
      reviewStatus: 'pending_eldad_review',
      previewOnly: true,
      noPersistence: true,
      staticReviewGateOnly: true,
      operationalExecution: false,
      contentRead: false,
      ocrPerformed: false,
      providerConnected: false,
      blockedActions: [...METADATA_REVIEW_GATE_BLOCKED_ACTIONS],
    });
  });

  it('keeps required safety flags locked', () => {
    const gate = buildMetadataReviewGatePreview({
      sourceId: 'metadata-source-2',
      sourceLabel: 'Drive metadata only',
      sourceType: 'drive',
      timestampLabel: null,
    });

    expect(gate.previewOnly).toBe(true);
    expect(gate.noPersistence).toBe(true);
    expect(gate.staticReviewGateOnly).toBe(true);
    expect(gate.operationalExecution).toBe(false);
    expect(gate.contentRead).toBe(false);
    expect(gate.ocrPerformed).toBe(false);
    expect(gate.providerConnected).toBe(false);
  });

  it('does not import stores, persistence, providers, filesystem, or database modules', () => {
    const importText = importLinesFrom(helperSource).join('\n');

    for (const forbiddenTerm of FORBIDDEN_IMPORT_TERMS) {
      expect(importText).not.toContain(forbiddenTerm);
    }
  });

  it('does not reference operational entity names', () => {
    for (const forbiddenTerm of FORBIDDEN_OPERATIONAL_TERMS) {
      expect(helperSource).not.toContain(forbiddenTerm);
    }
  });
});
// #endregion
