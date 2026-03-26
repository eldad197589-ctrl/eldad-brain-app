/* ============================================
   FILE: wordExportService.ts
   PURPOSE: Generic Word (DOCX) export service with RTL Hebrew support.
            Provides a universal API for any page to generate a DOCX file.
   DEPENDENCIES: docx, file-saver
   EXPORTS: exportToWord, WordExportOptions, WordSection, WordTableData
   ============================================ */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
  SectionType, PageNumber,
} from 'docx';
import { saveAs } from 'file-saver';

// #region Types

/** A table for embedding in a Word section */
export interface WordTableData {
  /** Column headers */
  headers: string[];
  /** Data rows — each row is an array of cell values */
  rows: string[][];
}

/** A content section inside the Word document */
export interface WordSection {
  /** Optional section heading */
  title?: string;
  /** Plain-text paragraphs */
  paragraphs?: string[];
  /** Highlighted callout box */
  highlight?: string;
  /** An embedded table */
  table?: WordTableData;
  /** Signature placeholders */
  signatures?: { name: string; role: string }[];
}

/** Options passed to the export function */
export interface WordExportOptions {
  /** Document title (shown as main heading) */
  title: string;
  /** Subtitle (optional) */
  subtitle?: string;
  /** Downloaded filename (without .docx extension) */
  filename: string;
  /** Content sections */
  sections: WordSection[];
  /** Show D&E branded header (default: true) */
  showHeader?: boolean;
  /** Show D&E branded footer (default: true) */
  showFooter?: boolean;
}

// #endregion

// #region RTL Helpers

/** Hebrew character range regex */
const HEBREW_RE = /[\u0590-\u05FF]/;

/**
 * Detect if a string contains Hebrew characters.
 * @param text - The text to check
 * @returns true if text contains Hebrew
 */
function isHebrew(text: string): boolean {
  return HEBREW_RE.test(text);
}

/**
 * Split mixed Hebrew/English text into directional runs.
 * Critical RTL fix — each "run" in a Word paragraph must have
 * its direction set explicitly to prevent word-flipping.
 * @param text - Mixed-direction text
 * @param bold - Whether runs should be bold
 * @param fontSize - Font size in half-points
 * @returns Array of TextRun objects with correct direction
 */
function splitToRuns(
  text: string,
  bold = false,
  fontSize = 22,
): TextRun[] {
  if (!text) return [];

  // Split on boundaries between Hebrew and non-Hebrew
  const segments = text.match(
    /[\u0590-\u05FF\s\u0600-\u06FF"'״׳,.\-–—:;!?()\/\d%₪]+|[A-Za-z0-9\s&@#$%^*+=<>{}[\]|\\~`'".,\-–—:;!?()\/]+/g
  );

  if (!segments) {
    return [new TextRun({
      text,
      font: 'David Libre',
      size: fontSize,
      bold,
      rightToLeft: true,
    })];
  }

  return segments.map(seg => {
    const hasHeb = isHebrew(seg);
    return new TextRun({
      text: seg.trim() ? seg : ' ',
      font: hasHeb ? 'David Libre' : 'Calibri',
      size: fontSize,
      bold,
      rightToLeft: hasHeb,
    });
  });
}

// #endregion

// #region Document Building

/**
 * Build the title block at the top of the document.
 */
function buildTitleBlock(title: string, subtitle?: string): Paragraph[] {
  const today = new Date().toLocaleDateString('he-IL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const result: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 100 },
      children: splitToRuns(title, true, 36),
    }),
  ];

  if (subtitle) {
    result.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 80 },
      children: splitToRuns(subtitle, false, 22),
    }));
  }

  result.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { after: 200 },
    children: [new TextRun({
      text: `תאריך: ${today}`,
      font: 'David Libre',
      size: 20,
      color: '64748B',
      rightToLeft: true,
    })],
  }));

  // Gold separator
  result.push(new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A84C' },
    },
    spacing: { after: 200 },
  }));

  return result;
}

/**
 * Convert a WordSection to docx Paragraph array.
 */
function buildSection(section: WordSection): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Section title
  if (section.title) {
    elements.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      bidirectional: true,
      spacing: { before: 300, after: 120 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      },
      children: splitToRuns(section.title, true, 26),
    }));
  }

  // Paragraphs
  if (section.paragraphs) {
    for (const text of section.paragraphs) {
      const lines = text.split('\n');
      for (const line of lines) {
        elements.push(new Paragraph({
          bidirectional: true,
          spacing: { after: 80 },
          children: splitToRuns(line, false, 21),
        }));
      }
    }
  }

  // Highlight box
  if (section.highlight) {
    elements.push(new Paragraph({
      bidirectional: true,
      spacing: { before: 40, after: 100 },
      indent: { right: 200 },
      border: {
        right: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B' },
      },
      shading: { fill: 'FFFBEB' },
      children: [
        new TextRun({
          text: '💡 ',
          font: 'Segoe UI Emoji',
          size: 20,
        }),
        ...splitToRuns(section.highlight, false, 20),
      ],
    }));
  }

  // Table
  if (section.table) {
    const headerRow = new TableRow({
      tableHeader: true,
      children: section.table.headers.map(h =>
        new TableCell({
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({
            bidirectional: true,
            children: [new TextRun({
              text: h,
              font: 'David Libre',
              size: 20,
              bold: true,
              rightToLeft: true,
              color: '374151',
            })],
          })],
        })
      ),
    });

    const dataRows = section.table.rows.map(row =>
      new TableRow({
        children: row.map(cell =>
          new TableCell({
            children: [new Paragraph({
              bidirectional: true,
              children: splitToRuns(cell, false, 20),
            })],
          })
        ),
      })
    );

    elements.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }));
  }

  // Signatures
  if (section.signatures) {
    elements.push(new Paragraph({
      spacing: { before: 300 },
      children: [new TextRun({ text: '' })],
    }));

    const sigCells = section.signatures.map(sig =>
      new TableCell({
        width: {
          size: Math.floor(100 / section.signatures!.length),
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.NONE, size: 0 },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 },
        },
        children: [
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: '' })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: '' })] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            border: {
              bottom: { style: BorderStyle.DASHED, size: 1, color: '374151' },
            },
            children: [new TextRun({
              text: '                              ',
              font: 'David Libre', size: 20,
            })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { after: 0 },
            children: splitToRuns(sig.name, true, 20),
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            children: [new TextRun({
              text: sig.role,
              font: 'Calibri',
              size: 16,
              color: '64748B',
            })],
          }),
        ],
      })
    );

    elements.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: { style: BorderStyle.NONE, size: 0 },
        insideVertical: { style: BorderStyle.NONE, size: 0 },
      },
      rows: [new TableRow({ children: sigCells })],
    }));
  }

  return elements;
}

/**
 * Build the branded header paragraphs.
 */
function buildHeader(): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: 'ניהול דוד אלדד רו"ח',
          font: 'David Libre', size: 20, bold: true,
          color: '1E3A5F', rightToLeft: true,
        }),
        new TextRun({
          text: '  |  DAVID ELDAD CPA MANAGEMENT',
          font: 'Calibri', size: 16, color: '5B7FA5',
        }),
      ],
    }),
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A84C' },
      },
      spacing: { after: 100 },
    }),
  ];
}

/**
 * Build the branded footer paragraphs.
 */
function buildFooter(): Paragraph[] {
  const today = new Date().toLocaleDateString('he-IL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return [
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
      },
      spacing: { before: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [
        new TextRun({
          text: 'סניף ראשל"צ | מאירוביץ 55 | טל\': 03-9661234 | ',
          font: 'David Libre', size: 14,
          color: '94A3B8', rightToLeft: true,
        }),
        new TextRun({
          text: 'eldad@robium.net',
          font: 'Calibri', size: 14, color: '5B7FA5',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [
        new TextRun({
          text: `${today} | עמוד `,
          font: 'David Libre', size: 14,
          color: '94A3B8', rightToLeft: true,
        }),
        new TextRun({
          children: [PageNumber.CURRENT],
          font: 'Calibri', size: 14, color: '94A3B8',
        }),
      ],
    }),
  ];
}

// #endregion

// #region Main Export

/**
 * Generate and download a DOCX file from structured data.
 * Implements 3-level RTL support:
 * 1. Paragraph-level bidirectional flag
 * 2. Run-level splitting for mixed Hebrew/English
 * 3. Font switching (David Libre / Calibri)
 * @param options - Document structure and metadata
 */
export async function exportToWord(options: WordExportOptions): Promise<void> {
  const showHeader = options.showHeader !== false;
  const showFooter = options.showFooter !== false;

  // Build all content children
  const titleBlock = buildTitleBlock(options.title, options.subtitle);
  const sectionElements: (Paragraph | Table)[] = [];
  for (const sec of options.sections) {
    sectionElements.push(...buildSection(sec));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'David Libre',
            size: 22,
            rightToLeft: true,
          },
          paragraph: {
            alignment: AlignmentType.RIGHT,
          },
        },
      },
    },
    sections: [{
      properties: {
        type: SectionType.CONTINUOUS,
        page: {
          size: { width: 11906, height: 16838 },
          margin: {
            top: 1000, bottom: 1200,
            right: 1200, left: 1200,
          },
          pageNumbers: { start: 1 },
        },
      },
      headers: showHeader ? {
        default: { options: { children: buildHeader() } },
      } : undefined,
      footers: showFooter ? {
        default: { options: { children: buildFooter() } },
      } : undefined,
      children: [
        ...titleBlock,
        ...sectionElements,
      ] as Paragraph[],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fname = options.filename.endsWith('.docx')
    ? options.filename
    : `${options.filename}.docx`;
  saveAs(blob, fname);
}

// #endregion
