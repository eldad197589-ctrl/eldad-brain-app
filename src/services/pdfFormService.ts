/* ============================================
   FILE: pdfFormService.ts
   PURPOSE: pdfFormService module
   DEPENDENCIES: pdf-lib, @pdf-lib
   EXPORTS: Form2279Data, downloadBlob
   ============================================ */
/**
 * FILE: pdfFormService.ts
 * PURPOSE: PDF form filling engine — overlays text on existing PDF templates
 *          using coordinate maps. Supports Hebrew RTL text via pdf-lib.
 *          Ported from מודול קליטת לקוח חדש/formGeneratorService.ts.
 * DEPENDENCIES: pdf-lib, @pdf-lib/fontkit
 */
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// #region Types

/** Data for Form 2279 (ייפוי כוח לרשות המיסים) */
export interface Form2279Data {
  /** Client full name */
  clientName: string;
  /** Client ID number (ת.ז / ח.פ) */
  clientIdNumber: string;
  /** Client phone (optional) */
  clientPhone?: string;
  /** Accountant name */
  accountantName: string;
  /** Accountant ID number */
  accountantIdNumber: string;
  /** Accountant license number */
  accountantLicenseNumber: string;
  /** Tax file number (תיק מס) */
  taxFileNumber?: string;
  /** Firm name (for registration section) */
  firmName?: string;
  /** Primary or secondary representation */
  representationType: 'primary' | 'secondary';
  /** Custom date (defaults to today) */
  date?: string;
}

/** A single field position on a PDF page */
interface FieldPosition {
  /** X coordinate (points from left) */
  x: number;
  /** Y coordinate (points from bottom) */
  y: number;
  /** Font size */
  size?: number;
}

// #endregion

// #region Coordinate Maps

/**
 * Field positions for Form 2279 — primary representation.
 * Coordinates are in PDF points (1/72 inch), origin at bottom-left.
 */
const PRIMARY_FIELDS: Record<string, FieldPosition> = {
  clientFirstName: { x: 560, y: 614, size: 9 },
  clientLastName: { x: 440, y: 614, size: 9 },
  clientIdNumber: { x: 310, y: 614, size: 9 },
  clientPhone: { x: 160, y: 614, size: 9 },
  accountantName: { x: 540, y: 532, size: 9 },
  accountantId: { x: 180, y: 532, size: 9 },
  date: { x: 150, y: 392, size: 9 },
  regClientName: { x: 540, y: 277, size: 9 },
  regFileNumber: { x: 250, y: 277, size: 9 },
  regDealerName: { x: 540, y: 252, size: 9 },
  regDealerNumber: { x: 250, y: 252, size: 9 },
  regTaxpayerName: { x: 540, y: 200, size: 9 },
  regTaxpayerId: { x: 250, y: 200, size: 9 },
  regFirmName: { x: 540, y: 152, size: 9 },
  regDate: { x: 150, y: 152, size: 9 },
};

/** Field positions for Form 2279 — secondary representation */
const SECONDARY_FIELDS: Record<string, FieldPosition> = { ...PRIMARY_FIELDS };

// #endregion

// #region Hebrew RTL Helpers

/** Mirror map for paired punctuation (swapped during RTL rendering) */
const MIRROR_MAP: Record<string, string> = {
  '(': ')', ')': '(',
  '[': ']', ']': '[',
  '{': '}', '}': '{',
  '<': '>', '>': '<',
  '«': '»', '»': '«',
};

/**
 * Reverses Hebrew text for RTL rendering in pdf-lib (which is LTR-only).
 * Also mirrors paired punctuation.
 *
 * @param text - The Hebrew text to reverse
 * @returns The reversed text for correct RTL display
 */
function reverseHebrew(text: string): string {
  return text.split('').map(ch => MIRROR_MAP[ch] || ch).join('');
}

// #endregion

// #region Font Loading

const HEBREW_FONT_URL =
  'https://fonts.gstatic.com/s/notosanshebrew/v46/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4utoiJltutR2g.ttf';

let cachedFontBytes: ArrayBuffer | null = null;

/**
 * Loads and caches the Hebrew font (Noto Sans Hebrew).
 *
 * @returns Font bytes as ArrayBuffer
 */
async function getHebrewFont(): Promise<ArrayBuffer> {
  if (cachedFontBytes) return cachedFontBytes;
  const response = await fetch(HEBREW_FONT_URL);
  cachedFontBytes = await response.arrayBuffer();
  return cachedFontBytes;
}

// #endregion

// #region Form 2279 Generator

/**
 * Generates a filled Form 2279 (ייפוי כוח) PDF by overlaying text
 * on the official template PDF.
 *
 * @param data - Client and accountant data to fill in
 * @returns Blob of the generated PDF
 */
export async function generateForm2279(data: Form2279Data): Promise<Blob> {
  const templateUrl = data.representationType === 'primary'
    ? '/forms/poa-primary.pdf'
    : '/forms/poa-secondary.pdf';

  const templateBytes = await fetch(templateUrl).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);

  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await getHebrewFont();
  const hebrewFont = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.getPage(0);
  const fields = data.representationType === 'primary' ? PRIMARY_FIELDS : SECONDARY_FIELDS;

  /** Draw a single field on the page */
  const drawField = (fieldKey: string, text: string | undefined) => {
    if (!text) return;
    const pos = fields[fieldKey];
    if (!pos) return;

    const size = pos.size || 11;
    const reversed = reverseHebrew(text);
    const textWidth = hebrewFont.widthOfTextAtSize(reversed, size);

    page.drawText(reversed, {
      x: pos.x - textWidth,
      y: pos.y,
      size,
      font: hebrewFont,
      color: rgb(0.2, 0.25, 0.35),
    });
  };

  // Split client name
  const nameParts = (data.clientName || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const dateStr = data.date || new Date().toLocaleDateString('he-IL');

  // Section א: Power of Attorney
  drawField('clientFirstName', firstName);
  drawField('clientLastName', lastName);
  drawField('clientIdNumber', data.clientIdNumber);
  drawField('clientPhone', data.clientPhone);
  drawField('accountantName', data.accountantName);
  drawField('accountantId', data.accountantIdNumber);
  drawField('date', dateStr);

  // Section ב: Registration
  drawField('regClientName', data.clientName);
  drawField('regFileNumber', data.clientIdNumber);
  drawField('regDealerName', data.clientName);
  drawField('regDealerNumber', data.clientIdNumber);
  drawField('regTaxpayerName', data.clientName);
  drawField('regTaxpayerId', data.clientIdNumber);
  drawField('regFirmName', data.firmName || data.accountantName);
  drawField('regDate', dateStr);

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

// #endregion

// #region Utilities

/**
 * Downloads a Blob as a file.
 *
 * @param blob - The blob to download
 * @param filename - Filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// #endregion
