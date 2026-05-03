/* ============================================
   FILE: universal-routing-suggestion.test.tsx
   PURPOSE: Focused tests for static Universal Routing suggestion UI.
   DEPENDENCIES: Vitest, React, react-dom/server, fs, UniversalRoutingSuggestionSection
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import UniversalRoutingSuggestionSection from './UniversalRoutingSuggestionSection';
import { ALL_SEED_SUGGESTIONS } from '../../work-spine/routing/universal-routing-static-seed';
// #endregion

// #region Constants
const projectRoot = process.cwd().replace(/\\/g, '/');
const componentSource = readFileSync(`${projectRoot}/src/components/internal/UniversalRoutingSuggestionSection.tsx`, 'utf8');
const seedSource = readFileSync(`${projectRoot}/src/work-spine/routing/universal-routing-static-seed.ts`, 'utf8');
const combinedSource = `${componentSource}\n${seedSource}`;

const routeKinds = ['filing', 'task', 'process', 'case_evidence', 'learning', 'unknown'];
const staticExamples = [
  'Routine invoice, no special anomalies detected.',
  'Contains penalty keywords requiring urgent action.',
  'VAT document identified for monthly process.',
  'Matched Dima Rodnitski ID and appeal keywords.',
  'Matched Tsila Shvartz academic documents.',
  'Legal precedent detected, candidate for Brain learning.',
  'Low confidence matching, requires manual triage.',
];
const forbiddenImports = [
  'zustand',
  'Store',
  'Persistence',
  'gmailService',
  'driveService',
  'fetch(',
  'googleapis',
  'axios',
  'createWorkItem',
  'createMatter',
  'createDocumentRef',
  'MatterRecord',
  'ocrService',
];
// #endregion

// #region Tests
describe('Universal Routing Suggestion Section', () => {
  it('renders all six routing candidate types and all static examples', () => {
    const markup = renderToStaticMarkup(React.createElement(UniversalRoutingSuggestionSection));

    expect(markup).toContain('Universal Routing Suggestions — local only');
    expect((markup.match(/data-testid="universal-routing-suggestion-card"/g) ?? []).length).toBe(7);

    for (const kind of routeKinds) {
      expect(markup).toContain(`>${kind}<`);
    }

    for (const example of staticExamples) {
      expect(markup).toContain(example);
    }
  });

  it('shows local-only approval and creation-blocked boundaries for every suggestion', () => {
    const markup = renderToStaticMarkup(React.createElement(UniversalRoutingSuggestionSection));

    expect(ALL_SEED_SUGGESTIONS).toHaveLength(7);
    expect((markup.match(/local_preview_only/g) ?? []).length).toBe(7);
    expect((markup.match(/canCreateWorkItem=false/g) ?? []).length).toBe(7);
    expect((markup.match(/canCreateMatter=false/g) ?? []).length).toBe(7);
    expect((markup.match(/canCreateDocumentRef=false/g) ?? []).length).toBe(7);
    expect((markup.match(/requiresEldadApproval=true/g) ?? []).length).toBe(7);
    expect(markup).toContain('Static suggestions only. No routing, promotion, persistence, or operational creation.');
  });

  it('renders confidence, suggested reason, entities, and keywords', () => {
    const markup = renderToStaticMarkup(React.createElement(UniversalRoutingSuggestionSection));

    expect(markup).toContain('Confidence');
    expect(markup).toContain('Suggested reason');
    expect(markup).toContain('Detected entities');
    expect(markup).toContain('Detected keywords');
    expect(markup).toContain('דימה רודניצקי');
    expect(markup).toContain('צילה שוורץ');
    expect(markup).toContain('חשבונית');
    expect(markup).toContain('מע&quot;מ');
  });

  it('does not render forbidden operational action buttons', () => {
    const markup = renderToStaticMarkup(React.createElement(UniversalRoutingSuggestionSection));

    expect((markup.match(/<button/g) ?? []).length).toBe(0);
    expect(markup).not.toContain('>Create<');
    expect(markup).not.toContain('>Promote<');
    expect(markup).not.toContain('>Sync<');
    expect(markup).not.toContain('>Fix<');
    expect(markup).not.toContain('>Route<');
  });

  it('keeps component and seed source free of store, persistence, API, and operational creation imports', () => {
    for (const forbidden of forbiddenImports) {
      expect(combinedSource).not.toContain(forbidden);
    }

    expect(combinedSource).not.toContain('from "../../store');
    expect(combinedSource).not.toContain('from "../store');
    expect(combinedSource).not.toContain('useBrainStore');
    expect(combinedSource).not.toContain('useMatterStore');
    expect(combinedSource).not.toContain('node:path');
  });
});
// #endregion
