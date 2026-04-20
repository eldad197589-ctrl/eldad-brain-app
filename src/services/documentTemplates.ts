/* ============================================
   FILE: documentTemplates.ts
   PURPOSE: Document template system — types, branding, and builder.
            Template variants are defined in documentTemplateVariants.ts.
   DEPENDENCIES: ./wordExportService, ../data/caseTypes
   EXPORTS: DocumentTemplate, DocumentVariant, OfficeBranding,
            SignatureBlockConfig, AddresseeConfig, TOCEntry,
            RecipientType, TemplateOverrides, ReportMode,
            DE_BRANDING, buildTemplateWordSections
   ============================================ */

import type { WordSection, WordTableData } from './wordExportService';
import type { CaseEntity } from '../data/caseTypes';

// #region Types

/** Supported document variants */
export type DocumentVariant = 'appeal' | 'expert_opinion' | 'letter' | 'report';

/** Office branding info — D&E CPA firm identity */
export interface OfficeBranding {
  firmNameHe: string;
  firmNameEn: string;
  accountants: string;
  branches: { name: string; address: string }[];
  email: string;
  phone: string;
  fax: string;
}

/** Signature block configuration */
export interface SignatureBlockConfig {
  /** Signer name — dynamic from entity or hardcoded */
  signerName: string;
  /** Signer role (e.g. "המערער", "רו\"ח") */
  signerRole: string;
  /** Optional credit line (e.g. "נערך בסיוע מקצועי של...") */
  creditLine?: string;
  /** Optional stamp/seal text */
  stampText?: string;
}

/** Addressee (נמען) block configuration */
export interface AddresseeConfig {
  /** "לכבוד" prefix label */
  prefix: string;
  /** Addressee name/org */
  name: string;
  /** Optional address lines */
  addressLines?: string[];
}

/** Table of Contents entry */
export interface TOCEntry {
  /** Section title */
  title: string;
  /** Anchor ID for digital version links */
  anchorId: string;
}

/** Recipient type for letter template */
export type RecipientType =
  | 'authority'   // רשות (מס הכנסה, ביטוח לאומי, וכו')
  | 'bank'        // בנק
  | 'client'      // לקוח
  | 'third_party' // צד שלישי
  | 'employee'    // עובד
  | 'lawyer'      // עו"ד
  | 'court'       // בית משפט / בית דין
  | 'other';      // אחר

/** Report mode — affects structure and subject visibility */
export type ReportMode = 'internal' | 'submitted';

/**
 * Runtime overrides — allow caller to turn on optional features
 * without changing the template definition.
 */
export interface TemplateOverrides {
  /** Force cover page on/off (overrides template default) */
  forceCoverPage?: boolean;
  /** Force TOC on/off */
  forceTOC?: boolean;
  /** Custom TOC entries (overrides template.buildTOC) */
  customTOC?: TOCEntry[];
  /** Override addressee (for letter: recipient type + custom name) */
  recipientType?: RecipientType;
  recipientName?: string;
  recipientAddress?: string[];
  /** Override subject line */
  subjectOverride?: string;
  /** Report mode (internal vs submitted) */
  reportMode?: ReportMode;
  /** Custom subtitle for cover page */
  coverSubtitle?: string;
}

/**
 * Full document template definition.
 * Mirrors the Gravity Design System: header → gold line → content → footer.
 */
export interface DocumentTemplate {
  /** Template variant identifier */
  variant: DocumentVariant;
  /** Display name in Hebrew */
  displayName: string;
  /** Description of when to use */
  description: string;

  // ── Structure Flags ──
  hasCoverPage: boolean;
  hasTOC: boolean;
  hasAddressee: boolean;
  hasSubjectLine: boolean;
  hasEvidenceAppendix: boolean;
  hasBrandedHeader: boolean;
  hasBrandedFooter: boolean;

  /** Expected section heading pattern */
  sectionPattern: 'hebrew_letters' | 'numbers' | 'none';

  // ── Builder Functions ──
  buildAddressee: (entity: CaseEntity) => AddresseeConfig | null;
  buildSubjectLine: (entity: CaseEntity) => string;
  buildSignatures: (entity: CaseEntity) => SignatureBlockConfig[];
  buildTOC: (entity: CaseEntity) => TOCEntry[];
  buildEvidenceTable: (entity: CaseEntity) => WordTableData | null;
}

// #endregion

// #region D&E Branding Constants

/** D&E Office Branding — Gravity Design System */
export const DE_BRANDING: OfficeBranding = {
  firmNameHe: 'ניהול דוד אלדד רו"ח',
  firmNameEn: 'DAVID ELDAD CPA MANAGEMENT',
  accountants: 'דוד אלדד, רו"ח',
  branches: [
    { name: 'סניף ראשל"צ', address: 'מאירוביץ 55' },
    { name: 'סניף אשקלון', address: 'ישפה 2' },
  ],
  email: 'eldad@robium.net',
  phone: '03-9661234',
  fax: '077-9167711',
};

// #endregion

// #region Template → WordSection[] Builder

/**
 * Build professional WordSection[] from a template + entity.
 * This adds structural elements (cover, TOC, addressee, evidence, signatures)
 * around the content sections that the body parser provides.
 *
 * @param template - The document template to use
 * @param entity - The case entity
 * @param contentSections - The body content sections (from FinalizationConfig.parseBody)
 * @param overrides - Optional runtime overrides for optional features
 * @returns Complete WordSection[] ready for wordExportService
 */
export function buildTemplateWordSections(
  template: DocumentTemplate,
  entity: CaseEntity,
  contentSections: WordSection[],
  overrides?: TemplateOverrides,
): WordSection[] {
  const result: WordSection[] = [];

  // ── Cover Page (template default OR override) ──
  const showCover = overrides?.forceCoverPage ?? template.hasCoverPage;
  if (showCover) {
    const subtitle = overrides?.coverSubtitle || template.displayName;
    result.push({
      title: DE_BRANDING.firmNameHe,
      paragraphs: [
        DE_BRANDING.firmNameEn,
        '',
        subtitle,
        '',
        entity.clientName,
        '',
        `תאריך: ${new Date().toLocaleDateString('he-IL')}`,
      ],
    });
  }

  // ── Table of Contents (template default OR override) ──
  const showTOC = overrides?.forceTOC ?? template.hasTOC;
  if (showTOC) {
    const tocEntries = overrides?.customTOC || template.buildTOC(entity);
    if (tocEntries.length > 0) {
      result.push({
        title: 'תוכן עניינים',
        paragraphs: tocEntries.map((e, i) => `${i + 1}. ${e.title}`),
      });
    }
  }

  // ── Addressee Block (with recipient override for letters) ──
  if (template.hasAddressee) {
    if (overrides?.recipientName) {
      result.push({
        paragraphs: ['לכבוד', overrides.recipientName, ...(overrides.recipientAddress || [])],
      });
    } else {
      const addr = template.buildAddressee(entity);
      if (addr) {
        result.push({ paragraphs: [addr.prefix, addr.name, ...(addr.addressLines || [])] });
      }
    }
  }

  // ── Subject Line (with override) ──
  const showSubject = template.hasSubjectLine || !!overrides?.subjectOverride;
  if (showSubject) {
    const subjectText = overrides?.subjectOverride || template.buildSubjectLine(entity);
    result.push({ paragraphs: [subjectText] });
  }

  // ── Body Content ──
  result.push(...contentSections);

  // ── Evidence Appendix Table ──
  if (template.hasEvidenceAppendix) {
    const evidenceTable = template.buildEvidenceTable(entity);
    if (evidenceTable && evidenceTable.rows.length > 0) {
      result.push({ title: 'נספח: טבלת אסמכתאות', table: evidenceTable });
    }
  }

  // ── Signature Block(s) ──
  const signatures = template.buildSignatures(entity);
  for (const sig of signatures) {
    result.push({ signatures: [{ name: sig.signerName, role: sig.signerRole }] });
    if (sig.creditLine) {
      result.push({ paragraphs: [`(${sig.creditLine})`] });
    }
    if (sig.stampText) {
      result.push({ paragraphs: [`[${sig.stampText}]`] });
    }
  }

  return result;
}

// #endregion
