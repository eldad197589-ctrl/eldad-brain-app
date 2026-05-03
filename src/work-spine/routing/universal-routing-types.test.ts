import { describe, it, expect } from 'vitest';
import { ALL_SEED_SUGGESTIONS } from './universal-routing-static-seed';
import * as fs from 'fs';
import * as path from 'path';

describe('Universal Routing Types and Boundaries', () => {
  it('should include all 6 candidate kinds in seed data', () => {
    const kinds = ALL_SEED_SUGGESTIONS.map(s => s.kind);
    expect(kinds).toContain('filing');
    expect(kinds).toContain('task');
    expect(kinds).toContain('process');
    expect(kinds).toContain('case_evidence');
    expect(kinds).toContain('learning');
    expect(kinds).toContain('unknown');
  });

  it('every suggestion must have strictly enforced boundaries', () => {
    ALL_SEED_SUGGESTIONS.forEach(suggestion => {
      const b = suggestion.boundary;
      expect(b.allowedMode).toBe('local_preview_only');
      expect(b.canCreateWorkItem).toBe(false);
      expect(b.canCreateMatter).toBe(false);
      expect(b.canCreateDocumentRef).toBe(false);
      expect(b.requiresEldadApproval).toBe(true);
    });
  });

  it('every suggestion has required routing fields', () => {
    ALL_SEED_SUGGESTIONS.forEach(suggestion => {
      expect(suggestion.input.sourceChannel).toBeDefined();
      expect(suggestion.input.originalMetadata).toBeDefined();
      expect(Array.isArray(suggestion.detectedEntities)).toBe(true);
      expect(Array.isArray(suggestion.detectedKeywords)).toBe(true);
      expect(suggestion.confidenceScore).toBeDefined();
      expect(typeof suggestion.confidenceScore.score).toBe('number');
      expect(typeof suggestion.suggestedReason).toBe('string');
    });
  });

  it('verifies that the types file contains no operational imports', () => {
    const sourceCode = fs.readFileSync(path.join(__dirname, 'universal-routing-types.ts'), 'utf-8');
    expect(sourceCode).not.toContain('import {');
    expect(sourceCode).not.toContain('require(');
    // Ensures pure types
    expect(sourceCode).not.toContain('fetch');
    expect(sourceCode).not.toContain('googleapis');
  });
});
