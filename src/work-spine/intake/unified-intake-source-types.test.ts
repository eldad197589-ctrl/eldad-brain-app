/* ====
   FILE: unified-intake-source-types.test.ts
   PURPOSE: Focused tests for static Unified Intake source contracts.
   DEPENDENCIES: Vitest, Unified Intake source contract and static seed
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, it, expect } from 'vitest';
import { INTAKE_SOURCE_TYPES } from './unified-intake-source-types';
import { ALL_INTAKE_SOURCES } from './unified-intake-source-seed';
// #endregion

// #region Tests
describe('Unified Intake Source Model Hardening', () => {
  it('should define the exact source type contract including protocol', () => {
    expect([...INTAKE_SOURCE_TYPES]).toEqual([
      'email',
      'drive',
      'scan',
      'manual_upload',
      'manual_text',
      'unknown',
      'protocol',
    ]);
  });

  it('should keep static source mocks limited to the original six non-protocol types', () => {
    const types = ALL_INTAKE_SOURCES.map(s => s.sourceType);
    expect(types).toContain('email');
    expect(types).toContain('drive');
    expect(types).toContain('scan');
    expect(types).toContain('manual_upload');
    expect(types).toContain('manual_text');
    expect(types).toContain('unknown');
    expect(types).not.toContain('protocol');
    expect(ALL_INTAKE_SOURCES.length).toBe(6);
  });

  it('every mock must have boundary flags locked to local_preview_only', () => {
    ALL_INTAKE_SOURCES.forEach(source => {
      const boundaryFlags = source.boundaryFlags;
      expect(boundaryFlags.allowedMode).toBe('local_preview_only');
      expect(boundaryFlags.canCreateWorkItem).toBe(false);
      expect(boundaryFlags.canCreateMatter).toBe(false);
      expect(boundaryFlags.canCreateDocumentRef).toBe(false);
      expect(boundaryFlags.requiresEldadApproval).toBe(true);
      expect(boundaryFlags.operationalActionBlocked).toBe(true);
    });
  });

  it('payloadSummary exists and contains no forbidden raw body/base64 fields', () => {
    ALL_INTAKE_SOURCES.forEach(source => {
      expect(source.payloadSummary).toBeDefined();
      const payloadSummary = source.payloadSummary as Record<string, unknown>;
      expect(payloadSummary.rawBody).toBeUndefined();
      expect(payloadSummary.base64).toBeUndefined();
      expect(payloadSummary.buffer).toBeUndefined();
      expect(payloadSummary.fullContent).toBeUndefined();
    });
  });
});
// #endregion
