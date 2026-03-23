/**
 * FILE: pdfLetterService.ts
 * PURPOSE: Generates professional PDF letters (release letters, document requests)
 *          with office letterhead, logo, header/footer.
 *          Ported from מודול קליטת לקוח חדש/formGeneratorService.ts (release letter section).
 * DEPENDENCIES: pdf-lib, @pdf-lib/fontkit, officeProfile
 */
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { OfficeProfile } from '../data/officeProfile';

// #region Types

/** Data for generating a professional letter */
export interface LetterPdfData {
  /** Recipient name */
  recipientName: string;
  /** Client name (for subject line) */
  clientName: string;
  /** Client ID (for subject line) */
  clientId: string;
  /** Subject line (הנדון) */
  subject: string;
  /** Full letter body lines (each string = one line) */
  bodyLines: string[];
  /** Office profile for branding */
  profile: OfficeProfile;
  /** Custom date (defaults to today) */
  date?: string;
}

// #endregion

// #region Font

const HEBREW_FONT_URL =
  'https://fonts.gstatic.com/s/notosanshebrew/v46/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4utoiJltutR2g.ttf';

let cachedFontBytes: ArrayBuffer | null = null;

/**
 * @returns Cached Hebrew font bytes
 */
async function getHebrewFont(): Promise<ArrayBuffer> {
  if (cachedFontBytes) return cachedFontBytes;
  const bytes = await fetch(HEBREW_FONT_URL).then(r => r.arrayBuffer());
  cachedFontBytes = bytes;
  return bytes;
}

// #endregion

// #region RTL Helpers

const MIRROR: Record<string, string> = {
  '(': ')', ')': '(', '[': ']', ']': '[',
  '{': '}', '}': '{', '<': '>', '>': '<',
};

/** @param text Hebrew text to prepare for pdf-lib */
function rtl(text: string): string {
  return text.split('').map(ch => MIRROR[ch] || ch).join('');
}

// #endregion

// #region Letter Generator

/**
 * Generates a professional PDF letter on A4 with office letterhead.
 *
 * @param data - Letter content and office profile
 * @returns Blob of the generated PDF
 */
export async function generateLetterPdf(data: LetterPdfData): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await getHebrewFont();
  const hebrewFont = await pdfDoc.embedFont(fontBytes);

  const marginRight = width - 50;
  let y = height - 50;
  const lineHeight = 20;

  /** Draw RTL text at position */
  const draw = (text: string, x: number, yPos: number, size = 12, color: [number, number, number] = [0, 0, 0]) => {
    if (!text) return;
    const reversed = rtl(text);
    const tw = hebrewFont.widthOfTextAtSize(reversed, size);
    page.drawText(reversed, {
      x: x - tw,
      y: yPos,
      size,
      font: hebrewFont,
      color: rgb(color[0], color[1], color[2]),
    });
  };

  /** Draw centered text */
  const drawCenter = (text: string, yPos: number, size = 12) => {
    if (!text) return;
    const reversed = rtl(text);
    const tw = hebrewFont.widthOfTextAtSize(reversed, size);
    page.drawText(reversed, {
      x: (width - tw) / 2,
      y: yPos,
      size,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });
  };

  // ── 1. LOGO ──
  try {
    const imgBytes = await fetch(data.profile.logoUrl).then(r => r.arrayBuffer());
    let img;
    try { img = await pdfDoc.embedPng(imgBytes); } catch { img = await pdfDoc.embedJpg(imgBytes); }
    const scale = Math.min(140 / img.width, 80 / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    page.drawImage(img, { x: (width - w) / 2, y: height - 40 - h, width: w, height: h });
    y = height - 40 - h - 10;
  } catch {
    // No logo — text fallback
  }

  // Firm name
  drawCenter(data.profile.firmName, y, 14);
  y -= 18;
  if (data.profile.firmNameEn) {
    const enText = data.profile.firmNameEn;
    const enW = hebrewFont.widthOfTextAtSize(enText, 10);
    page.drawText(enText, { x: (width - enW) / 2, y, size: 10, font: hebrewFont, color: rgb(0.4, 0.4, 0.4) });
    y -= 16;
  }

  // Separator
  page.drawLine({ start: { x: 50, y }, end: { x: marginRight, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  y -= 25;

  // ── 2. DATE ──
  const dateStr = data.date || new Date().toLocaleDateString('he-IL');
  draw(`תאריך: ${dateStr}`, marginRight, y, 11);
  y -= 30;

  // ── 3. RECIPIENT ──
  if (data.recipientName) {
    draw('לכבוד:', marginRight, y, 12);
    y -= lineHeight;
    draw(data.recipientName, marginRight, y, 12);
    y -= lineHeight;
    page.drawLine({ start: { x: 50, y: y + 5 }, end: { x: marginRight, y: y + 5 }, thickness: 0.3, color: rgb(0.8, 0.8, 0.8) });
    y -= 10;
  }

  // ── 4. GREETING + SUBJECT ──
  draw('א. נ.', marginRight, y, 12);
  y -= 30;

  if (data.subject) {
    const subjectText = `הנדון: ${data.subject}`;
    const subReversed = rtl(subjectText);
    const subW = hebrewFont.widthOfTextAtSize(subReversed, 13);
    const subX = marginRight - subW;
    page.drawText(subReversed, { x: subX, y, size: 13, font: hebrewFont, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: subX, y: y - 2 }, end: { x: marginRight, y: y - 2 }, thickness: 0.8, color: rgb(0, 0, 0) });
    y -= 35;
  }

  // ── 5. BODY ──
  for (const line of data.bodyLines) {
    if (!line) { y -= lineHeight; continue; }
    const indent = line.startsWith('-') || line.startsWith('•');
    draw(line, indent ? marginRight - 15 : marginRight, y, 12);
    y -= lineHeight;
  }

  // ── 6. CLOSING ──
  y -= 10;
  draw('בכבוד רב,', marginRight, y, 12);
  y -= lineHeight;
  draw(data.profile.firmName, marginRight, y, 12);
  y -= lineHeight;
  if (data.profile.phone) {
    draw(data.profile.phone, marginRight, y, 11);
    y -= lineHeight;
  }

  // ── 7. FOOTER ──
  const footerY = 40;
  page.drawRectangle({ x: 0, y: 0, width, height: footerY + 15, color: rgb(0.95, 0.95, 0.97) });
  page.drawLine({ start: { x: 0, y: footerY + 15 }, end: { x: width, y: footerY + 15 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  drawCenter(data.profile.address, footerY, 9);
  const contact = [data.profile.phone, data.profile.email].filter(Boolean).join('  |  ');
  drawCenter(contact, footerY - 14, 9);

  const savedBytes = await pdfDoc.save();
  return new Blob([savedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

// #endregion
