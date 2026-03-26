/* ============================================
   FILE: exportToWord.ts
   PURPOSE: Adapter that converts agreementData into WordExportOptions
            and calls the generic wordExportService.
   DEPENDENCIES: wordExportService, agreementData
   EXPORTS: exportAgreementToWord
   ============================================ */

import { exportToWord } from '../../services/wordExportService';
import type { WordSection } from '../../services/wordExportService';
import {
  AGREEMENT_CLAUSES, EQUITY_TABLE, SIGNATURES,
} from './agreementData';

// #region Adapter

/**
 * Exports the Founders Agreement as a Word (.docx) file.
 * Converts the structured agreementData into the generic WordExportOptions format.
 */
export async function exportAgreementToWord(): Promise<void> {
  const sections: WordSection[] = [];

  // Parties section
  sections.push({
    paragraphs: [
      'שנערך ונחתם ביום ___ בחודש ___ שנת 2026, בין הצדדים:',
      '1. אלדד דוד, ת.ז. 032263899 (להלן: "צד א\'" או "אלדד");',
      '2. קיריל יאקימנקו, ת.ז. 321271132 (להלן: "צד ב\'" או "קיריל");',
      '3. אהרוני שלחן אוסנת, ת.ז. 038230215 (להלן: "צד ג\'" או "אוסנת");',
      '(כולם יקראו להלן: "המייסדים" או "השותפים").',
    ],
  });

  // Agreement clauses
  for (const clause of AGREEMENT_CLAUSES) {
    const paragraphs: string[] = [];
    let highlight: string | undefined;

    for (const sub of clause.subClauses) {
      if (sub.text) {
        paragraphs.push(`סעיף ${sub.id}  ${sub.text.replace(/\\n/g, '\n')}`);
      }
      if (sub.highlight) {
        highlight = sub.highlight;
      }
    }

    sections.push({
      title: `${clause.number}. ${clause.title}`,
      paragraphs,
      highlight,
    });
  }

  // Equity table
  sections.push({
    title: 'טבלת אחזקות',
    table: {
      headers: ['שם המייסד', 'אחוז אחזקה', 'תפקיד'],
      rows: EQUITY_TABLE.map(r => [r.name, r.percent, r.role]),
    },
  });

  // Signatures
  sections.push({
    signatures: SIGNATURES.map(s => ({ name: s.name, role: s.role })),
  });

  await exportToWord({
    title: 'הסכם מייסדים (Founders Agreement)',
    subtitle: 'לייסוד חברת רוביום בע"מ ("Robium Ltd")',
    filename: `הסכם_מייסדים_רוביום_${new Date().toISOString().slice(0, 10)}`,
    sections,
  });
}

// #endregion
