/* ============================================
// #region Module

   FILE: documentScanner.ts
   PURPOSE: Smart document classification — scans file names and extracted text
            to detect document types, entity type, and personal info (ID number)
   DEPENDENCIES: None (pure logic)
   EXPORTS: scanDocument, aggregateScanResults, ScanResult, AggregatedIntake
   
   RULES (חוקים):
   1. אם לא בטוחים — לא ממלאים. עדיף ריק מאשר שגוי.
   2. זיהוי מסמך = בעיקר לפי שם הקובץ (אמין). תוכן = רק חיזוק, לא מספיק לבד.
   3. ת.ז. מחולצת רק אם יש הקשר ברור ("מספר זהות:", "ת.ז.:")
   4. סוג ישות = רק אם יש מסמך רגולטורי מזהה חד-משמעי (תעודת עוסק מורשה, תעודת התאגדות)
   5. לא מנחשים. לא אוספים עדויות חלשות.
   ============================================ */

import { EntityType } from '../pages/client-onboarding/types';

// #region Types

/** Result of scanning a single document */
export interface ScanResult {
  fileName: string;
  /** KYC document ID that was matched (b1, b2, rc1, etc.) or null */
  matchedDocId: string | null;
  /** Human-readable label of what was detected */
  matchedLabel: string | null;
  /** Entity type inferred from this document, if any */
  inferredEntityType: EntityType | null;
  /** Whether this document implies transfer from previous accountant */
  impliesTransfer: boolean;
  /** ID number (9 digits) extracted from text, if found WITH clear context */
  extractedIdNumber: string | null;
  /** Client name extracted from text, if found */
  extractedName: string | null;
  /** How the match was found */
  confidence: 'filename' | 'content' | 'both';
}

/** Aggregated results from scanning an entire folder */
export interface AggregatedIntake {
  /** Best-guess entity type — ONLY if high-confidence evidence found */
  detectedEntityType: EntityType | null;
  /** Whether any transfer-related docs were found */
  isTransfer: boolean;
  /** Client name (from folder name or extracted from docs) */
  clientName: string;
  /** ID number if extracted with clear context */
  idNumber: string | null;
  /** List of KYC doc IDs that were found */
  foundDocIds: string[];
  /** Full scan details per file */
  details: ScanResult[];
  /** Total files scanned */
  totalScanned: number;
  /** How many files were classified */
  classifiedCount: number;
}

// #endregion

// #region Pattern Definitions

interface DocPattern {
  docId: string;
  label: string;
  /** Patterns to match ONLY in filename (lowercased). This is the primary classifier. */
  filePatterns: string[];
  /** If matched, what entity type does this STRONGLY imply? Only for regulatory docs. */
  impliedEntityType?: EntityType;
  /** Does this document imply transfer? */
  impliedTransfer?: boolean;
}

/**
 * Document patterns — STRICT FILENAME ONLY matching.
 * Rule: we classify documents by their FILENAME, not by scanning content for keywords.
 * Content scanning produced too many false positives (e.g., "מדינת ישראל" in every form).
 */
const DOC_PATTERNS: DocPattern[] = [
  // === Base Documents (permanent file) ===
  {
    docId: 'b1', label: 'צילום תעודת זהות',
    filePatterns: ['תעודת זהות', 'ת_ז', 'ת.ז', 'teudat_zehut', 'id_card', 'צילום_ת.ז'],
  },
  {
    docId: 'b2', label: 'ספח תעודת זהות',
    filePatterns: ['ספח', 'sipach', 'appendix_id'],
  },
  {
    docId: 'b3', label: 'אישור ניהול חשבון בנק',
    filePatterns: ['אישור בנק', 'ניהול חשבון', 'צק מבוטל', 'צ\'ק מבוטל', 'cancelled_check'],
  },
  {
    docId: 'b4', label: 'הצעת מחיר',
    filePatterns: ['הצעת מחיר', 'הצעת_מחיר', 'price_quote'],
  },
  {
    docId: 'b5', label: 'הסכם שכר טרחה',
    filePatterns: ['הסכם שכר טרחה', 'הסכם שכ"ט', 'שכר טרחה', 'fee_agreement'],
  },
  {
    docId: 'b6', label: 'טופס 2279 / ייפוי כוח',
    filePatterns: ['2279', 'ייפוי כוח', 'יפוי כח', 'power_of_attorney'],
  },

  // === Regulatory — STRONG Entity Type Indicators (only filename matters) ===
  {
    docId: 'r1', label: 'תעודת עוסק מורשה',
    filePatterns: ['תעודת עוסק מורשה', 'עוסק מורשה', 'osek_murshe'],
    impliedEntityType: 'authorized',
  },
  {
    docId: 'rc1', label: 'תעודת התאגדות חברה',
    filePatterns: ['תעודת התאגדות', 'certificate_inc', 'incorporation'],
    impliedEntityType: 'company',
  },
  {
    docId: 'rc2', label: 'נסח חברה',
    filePatterns: ['נסח חברה', 'nesach_chevra', 'company_extract'],
    impliedEntityType: 'company',
  },
  {
    docId: 'rc3', label: 'תקנון חברה',
    filePatterns: ['תקנון החברה', 'תקנון חברה', 'articles_of_association'],
    impliedEntityType: 'company',
  },
  {
    docId: 'r2', label: 'הסכם שותפות',
    filePatterns: ['הסכם שותפות', 'שותפות', 'partnership'],
    impliedEntityType: 'partnership',
  },
  {
    docId: 'rn1', label: 'תעודת עמותה',
    filePatterns: ['תעודת עמותה', 'רשם העמותות', 'amuta'],
    impliedEntityType: 'npo',
  },

  // === Transfer Documents ===
  {
    docId: 't1', label: 'מכתב שחרור ממייצג',
    filePatterns: ['מכתב שחרור', 'שחרור ממייצג', 'העברת ייצוג', 'שחרור תיק'],
    impliedTransfer: true,
  },
  {
    docId: 't2', label: 'מאזן בוחן',
    filePatterns: ['מאזן בוחן', 'trial_balance'],
    impliedTransfer: true,
  },
  {
    docId: 't3', label: 'דוחות מע"מ ומקדמות',
    filePatterns: ['דוח מע"מ', 'מקדמות מס', 'vat_report'],
    impliedTransfer: true,
  },
  {
    docId: 't4', label: 'דוחות כספיים רשמיים',
    filePatterns: ['דוחות כספיים', 'דוח כספי', 'financial_statements'],
    impliedTransfer: true,
  },
];

// #endregion

// #region Scanner Logic

/**
 * Scan a single file — check its FILENAME against known patterns.
 * Content is used ONLY for extracting structured data (ID number, name) — NOT for classification.
 * 
 * @param fileName - The file name or relative path
 * @param extractedText - The text extracted from the file (used only for data extraction)
 * @returns ScanResult with classification details
 */
export function scanDocument(fileName: string, extractedText: string = ''): ScanResult {
  const lowerName = fileName.toLowerCase();

  let matchedDocId: string | null = null;
  let matchedLabel: string | null = null;
  let inferredEntityType: EntityType | null = null;
  let impliesTransfer = false;
  const confidence: ScanResult['confidence'] = 'filename';

  // RULE: Only match by FILENAME — content patterns caused too many false positives
  for (const pattern of DOC_PATTERNS) {
    const nameMatch = pattern.filePatterns.some(p => lowerName.includes(p));

    if (nameMatch) {
      matchedDocId = pattern.docId;
      matchedLabel = pattern.label;
      if (pattern.impliedEntityType) inferredEntityType = pattern.impliedEntityType;
      if (pattern.impliedTransfer) impliesTransfer = true;
      break; // First match wins
    }
  }

  // Extract ID number ONLY if there's a CLEAR label right before it
  // Rule: "ת.ז.: 123456789" or "מספר זהות: 123456789" — NOT just any 9-digit number
  let extractedIdNumber: string | null = null;
  if (extractedText) {
    const idPatterns = [
      /ת\.?ז\.?\s*:?\s*(\d{9})/,
      /מספר זהות\s*:?\s*(\d{9})/,
      /ת\.?ז\.?\s+(\d{9})/,
      /identity.*?(\d{9})/i,
    ];
    for (const pattern of idPatterns) {
      const m = extractedText.match(pattern);
      if (m) {
        extractedIdNumber = m[1];
        break;
      }
    }
  }

  // Extract name ONLY from very specific, labeled patterns
  let extractedName: string | null = null;
  if (extractedText) {
    const namePatterns = [
      /שם העוסק\s*:?\s*([א-ת\s]{3,30})/,
      /שם מלא\s*:?\s*([א-ת\s]{3,30})/,
      /שם החברה\s*:?\s*([א-ת\s]{3,40})/,
    ];
    for (const np of namePatterns) {
      const m = extractedText.match(np);
      if (m) {
        extractedName = m[1].trim();
        break;
      }
    }
  }

  return {
    fileName,
    matchedDocId,
    matchedLabel,
    inferredEntityType,
    impliesTransfer,
    extractedIdNumber,
    extractedName,
    confidence,
  };
}

/**
 * Aggregate all scan results from a folder into a unified intake summary.
 * Rule: Only report findings that have STRONG evidence. Never guess.
 * 
 * @param folderName - The folder name (typically the client name)
 * @param results - Array of individual scan results
 * @returns AggregatedIntake with confirmed entity type, found docs, etc.
 */
export function aggregateScanResults(folderName: string, results: ScanResult[]): AggregatedIntake {
  const foundDocIds: string[] = [];
  let detectedEntityType: EntityType | null = null;
  let isTransfer = false;
  let idNumber: string | null = null;
  let extractedClientName: string | null = null;

  // Track entity type evidence — require at least one STRONG match
  const entityVotes: Partial<Record<EntityType, number>> = {};

  for (const r of results) {
    // Only add unique doc IDs
    if (r.matchedDocId && !foundDocIds.includes(r.matchedDocId)) {
      foundDocIds.push(r.matchedDocId);
    }
    if (r.impliesTransfer) isTransfer = true;
    // Only take the FIRST ID number found with clear context
    if (r.extractedIdNumber && !idNumber) idNumber = r.extractedIdNumber;
    if (r.extractedName && !extractedClientName) extractedClientName = r.extractedName;

    if (r.inferredEntityType) {
      entityVotes[r.inferredEntityType] = (entityVotes[r.inferredEntityType] || 0) + 1;
    }
  }

  // RULE: Only set entity type if we have a DEFINITIVE regulatory document
  // (e.g., "תעודת עוסק מורשה" file)
  if (Object.keys(entityVotes).length === 1) {
    // Only one entity type suggested — use it
    detectedEntityType = Object.keys(entityVotes)[0] as EntityType;
  } else if (Object.keys(entityVotes).length > 1) {
    // Conflicting evidence → DON'T GUESS, leave it for the user
    detectedEntityType = null;
  }

  // Use extracted name if available, otherwise folder name
  const clientName = extractedClientName || folderName;

  return {
    detectedEntityType,
    isTransfer,
    clientName,
    idNumber,
    foundDocIds,
    details: results,
    totalScanned: results.length,
    classifiedCount: results.filter(r => r.matchedDocId !== null).length,
  };
}

// #endregion
