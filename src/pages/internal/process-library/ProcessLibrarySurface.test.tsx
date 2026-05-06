/* ==== FILE: src/pages/internal/process-library/ProcessLibrarySurface.test.tsx ==== */

// #region Imports
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PROCESS_LIBRARY_BLUEPRINTS } from '../../../work-spine/process-library/process-library-seed';
import mainSource from '../../../main.tsx?raw';
import processLibrarySurfaceSource from './ProcessLibrarySurface.tsx?raw';
import ProcessLibrarySurface from './ProcessLibrarySurface';
// #endregion

// #region Constants
const FORBIDDEN_SOURCE_PATTERNS = [
  /from ['"].*sidebar/i,
  /from ['"].*Layout/,
  /from ['"].*dashboard/i,
  /from ['"].*neurons/,
  /from ['"].*runtime/i,
  /from ['"].*provider/i,
  /localStorage/,
  /sessionStorage/,
  /fetch\s*\(/,
  /createMatter/,
  /createWorkItem/,
  /createDocumentRef/,
  /new\s+Matter/,
  /new\s+WorkItem/,
  /new\s+DocumentRef/,
] as const;
// #endregion

// #region Helpers
const renderSurface = (): string => renderToStaticMarkup(<ProcessLibrarySurface />);

const asStaticHtmlText = (value: string): string => value.replaceAll('"', '&quot;');
// #endregion

// #region Tests
describe('ProcessLibrarySurface', () => {
  it('renders the read-only Process Library title and warning', () => {
    const markup = renderSurface();

    expect(markup).toContain('ספריית תהליכים');
    expect(markup).toContain('תצוגה בלבד — אין הפעלה, אין יצירת תיק, אין יצירת משימה, אין שמירה');
    expect(markup).toContain('ספריית תהליכים סטטית בלבד');
  });

  it('renders exactly the 13 professional process blueprints', () => {
    const markup = renderSurface();
    const cardCount = (markup.match(/data-testid="process-library-blueprint"/g) ?? []).length;

    expect(cardCount).toBe(13);
    for (const process of PROCESS_LIBRARY_BLUEPRINTS) {
      expect(markup).toContain(asStaticHtmlText(process.hebrewName));
    }
  });

  it('shows related agents, gates, forbidden actions, and operationalExecution false', () => {
    const markup = renderSurface();

    expect(markup).toContain('סוכנים קשורים');
    expect(markup).toContain('שערים נדרשים');
    expect(markup).toContain('פעולות חסומות');
    expect(markup).toContain('operationalExecution');
    expect(markup).toContain('false');
    expect(markup).toContain('אין הפעלת תהליך');
    expect(markup).toContain('אין יצירת הפניית מסמך');
  });

  it('does not render action buttons or operational commands', () => {
    const markup = renderSurface();

    expect(markup).not.toContain('<button');
    expect(markup).not.toContain('התחל תהליך');
    expect(markup).not.toContain('צור תיק');
    expect(markup).not.toContain('צור משימה');
    expect(markup).not.toContain('צור הפניית מסמך');
  });

  it('does not import or create runtime, provider, persistence, or operational objects', () => {
    for (const pattern of FORBIDDEN_SOURCE_PATTERNS) {
      expect(processLibrarySurfaceSource).not.toMatch(pattern);
    }
  });

  it('adds the internal process library route without sidebar wiring', () => {
    expect(mainSource).toContain("import('./pages/internal/process-library/ProcessLibrarySurface')");
    expect(mainSource).toContain('path="/internal/process-library"');
  });
});
// #endregion
