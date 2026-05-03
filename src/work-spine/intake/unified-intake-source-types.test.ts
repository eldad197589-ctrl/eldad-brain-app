import { describe, it, expect } from 'vitest';
import { ALL_INTAKE_SOURCES } from './unified-intake-source-seed';

describe('Unified Intake Source Model Hardening', () => {
  it('should represent all six source types', () => {
    const types = ALL_INTAKE_SOURCES.map(s => s.sourceType);
    expect(types).toContain('email');
    expect(types).toContain('drive');
    expect(types).toContain('scan');
    expect(types).toContain('manual_upload');
    expect(types).toContain('manual_text');
    expect(types).toContain('unknown');
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
