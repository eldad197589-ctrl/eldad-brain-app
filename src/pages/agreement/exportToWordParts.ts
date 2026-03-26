/* ============================================
   FILE: exportToWordParts.ts
   PURPOSE: RTL helpers and document builder functions for Word export
   DEPENDENCIES: docx, agreementData
   EXPORTS: splitToRuns, goldLine, buildPartiesSection, buildClauseParagraphs,
            buildEquityTable, buildSignatures
   ============================================ */

// #region Imports
import {
  Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
} from 'docx';
import {
  AGREEMENT_CLAUSES, EQUITY_TABLE, SIGNATURES,
} from './agreementData';
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
 * This is the critical RTL fix — each "run" in a Word paragraph
 * must have its direction set explicitly to prevent word-flipping.
 * @param text - Mixed-direction text
 * @param bold - Whether runs should be bold
 * @param fontSize - Font size in half-points
 * @returns Array of TextRun objects with correct direction
 */
export function splitToRuns(
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

// #region Document Builders

/**
 * Create a horizontal line paragraph (gold separator).
 */
export function goldLine(): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A84C' },
    },
    spacing: { after: 200 },
  });
}

/**
 * Build the parties/header section of the agreement.
 */
export function buildPartiesSection(): Paragraph[] {
  const today = new Date().toLocaleDateString('he-IL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 100 },
      children: splitToRuns('הסכם מייסדים (Founders Agreement)', true, 36),
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 80 },
      children: splitToRuns('לייסוד חברת רוביום בע"מ ("Robium Ltd")', false, 22),
    }),
    new Paragraph({
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
    }),
    goldLine(),
    new Paragraph({
      bidirectional: true,
      spacing: { after: 80 },
      children: splitToRuns('שנערך ונחתם ביום ___ בחודש ___ שנת 2026, בין הצדדים:', true, 22),
    }),
    new Paragraph({
      bidirectional: true,
      spacing: { after: 40 },
      children: splitToRuns('1. אלדד דוד, ת.ז. 032263899 (להלן: "צד א\'" או "אלדד");', false, 22),
    }),
    new Paragraph({
      bidirectional: true,
      spacing: { after: 40 },
      children: splitToRuns('2. קיריל יאקימנקו, ת.ז. 321271132 (להלן: "צד ב\'" או "קיריל");', false, 22),
    }),
    new Paragraph({
      bidirectional: true,
      spacing: { after: 40 },
      children: splitToRuns('3. אהרוני שלחן אוסנת, ת.ז. 038230215 (להלן: "צד ג\'" או "אוסנת");', false, 22),
    }),
    new Paragraph({
      bidirectional: true,
      spacing: { after: 200 },
      children: splitToRuns('(כולם יקראו להלן: "המייסדים" או "השותפים").', false, 20),
    }),
    goldLine(),
  ];
}

/**
 * Build all agreement clause paragraphs from the data source.
 */
export function buildClauseParagraphs(): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const clause of AGREEMENT_CLAUSES) {
    // Clause title
    paragraphs.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      bidirectional: true,
      spacing: { before: 300, after: 120 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      },
      children: splitToRuns(`${clause.number}. ${clause.title}`, true, 26),
    }));

    // Sub-clauses
    for (const sub of clause.subClauses) {
      if (sub.text) {
        const lines = sub.text.split('\\n');
        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          const runs: TextRun[] = [];
          if (li === 0) {
            runs.push(new TextRun({
              text: `סעיף ${sub.id}  `,
              font: 'David Libre',
              size: 20,
              bold: true,
              color: '4338CA',
              rightToLeft: true,
            }));
          }
          runs.push(...splitToRuns(line, false, 21));
          paragraphs.push(new Paragraph({
            bidirectional: true,
            spacing: { after: li === lines.length - 1 ? 80 : 20 },
            children: runs,
          }));
        }
      }

      // Highlight box
      if (sub.highlight) {
        paragraphs.push(new Paragraph({
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
            ...splitToRuns(sub.highlight, false, 20),
          ],
        }));
      }
    }
  }

  return paragraphs;
}

/**
 * Build the equity table.
 */
export function buildEquityTable(): (Paragraph | Table)[] {
  const headerStyle = {
    font: 'David Libre',
    size: 20,
    bold: true as const,
    rightToLeft: true,
    color: '374151',
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ bidirectional: true, children: [new TextRun({ text: 'שם המייסד', ...headerStyle })] })],
      }),
      new TableCell({
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ bidirectional: true, children: [new TextRun({ text: 'אחוז אחזקה', ...headerStyle })] })],
      }),
      new TableCell({
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ bidirectional: true, children: [new TextRun({ text: 'תפקיד', ...headerStyle })] })],
      }),
    ],
  });

  const dataRows = EQUITY_TABLE.map(row =>
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({
            bidirectional: true,
            children: splitToRuns(row.name, true, 20),
          })],
        }),
        new TableCell({
          children: [new Paragraph({
            bidirectional: true,
            children: [new TextRun({
              text: row.percent,
              font: 'Calibri',
              size: 20,
              bold: true,
            })],
          })],
        }),
        new TableCell({
          children: [new Paragraph({
            bidirectional: true,
            children: splitToRuns(row.role, false, 20),
          })],
        }),
      ],
    })
  );

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      bidirectional: true,
      spacing: { before: 300, after: 120 },
      children: splitToRuns('טבלת אחזקות', true, 26),
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }),
  ];
}

/**
 * Build the signatures section.
 */
export function buildSignatures(): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      bidirectional: true,
      spacing: { before: 400, after: 200 },
      children: splitToRuns('חתימות', true, 26),
    }),
  ];

  const sigCells = SIGNATURES.map(sig =>
    new TableCell({
      width: { size: 33, type: WidthType.PERCENTAGE },
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
          children: [new TextRun({ text: '                              ', font: 'David Libre', size: 20 })],
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

  paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: '' })] }));

  const sigTable = new Table({
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
  });

  return [...paragraphs, sigTable as unknown as Paragraph];
}

// #endregion
