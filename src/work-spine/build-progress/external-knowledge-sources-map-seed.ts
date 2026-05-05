/* ==== FILE: src/work-spine/build-progress/external-knowledge-sources-map-seed.ts ==== */

// #region Imports
import type {
  ExternalKnowledgeSourceKind,
  ExternalKnowledgeSourceMapRow,
  ExternalKnowledgeSourceStatus,
} from './external-knowledge-sources-map-types';
// #endregion

// #region Constants
export const EXTERNAL_KNOWLEDGE_SOURCES_MAP_TITLE = 'מפת מקורות ידע חיצוניים';
export const EXTERNAL_KNOWLEDGE_SOURCES_MAP_WARNING =
  'מפת מקורות ידע חיצוניים בלבד — לא נקרא תוכן, לא נכרו תיקיות, לא בוצע OCR, לא חוברו ספקים, לא אומתו מקורות, ולא נוצרו רשומות.';
export const EXTERNAL_KNOWLEDGE_SOURCE_ROW_WARNING =
  'מקור זה מוצג כאינדקס בלבד — אין אימות מקור, אין חיבור חי, ואין הרשאה לפעולה.';

export const EXTERNAL_KNOWLEDGE_SOURCE_BLOCKED_ACTIONS = [
  'content_reading_blocked',
  'source_parsing_blocked',
  'folder_mining_blocked',
  'ocr_blocked',
  'provider_connection_blocked',
  'source_verification_blocked',
  'record_creation_blocked',
  'source_action_blocked',
] as const;
// #endregion

// #region Helpers
const sourceRow = (
  sourceId: string,
  label: string,
  domain: string,
  sourceKind: ExternalKnowledgeSourceKind,
  locationHint: string,
  status: ExternalKnowledgeSourceStatus,
  requiredGateBeforeAccess = 'נדרש אישור אלדד נפרד לפני כל גישה, כרייה, קריאת תוכן או חיבור מקור.',
): ExternalKnowledgeSourceMapRow => ({
  sourceId,
  label,
  domain,
  sourceKind,
  locationHint,
  status,
  indexOnly: true,
  contentRead: false,
  sourceParsed: false,
  ocrPerformed: false,
  providerConnected: false,
  sourceVerified: false,
  dataCurrentVerified: false,
  canCreateRecord: false,
  canActOnSource: false,
  blockedActions: EXTERNAL_KNOWLEDGE_SOURCE_BLOCKED_ACTIONS,
  requiredGateBeforeAccess,
  visibleWarning: EXTERNAL_KNOWLEDGE_SOURCE_ROW_WARNING,
});
// #endregion

// #region Static Data
/** Static Stage 18 external source candidates. */
export const EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS: readonly ExternalKnowledgeSourceMapRow[] = [
  sourceRow('external-attendance-v1', 'נוכחון / Attendance', 'attendance', 'professional_system', 'external-attendance-candidate', 'known_external_source'),
  sourceRow('external-employee-system-v1', 'Employee System', 'employee', 'professional_system', 'external-employee-system-candidate', 'needs_source_audit'),
  sourceRow('external-israel-worklaw-attendance-v1', 'Israel Worklaw Attendance Engine', 'employee', 'professional_domain', 'external-worklaw-attendance-candidate', 'partial_static_pointer'),
  sourceRow('external-guardian-v1', 'Guardian / אפוטרופוס', 'legal', 'professional_domain', 'external-guardian-candidate', 'needs_source_audit'),
  sourceRow('external-foreign-resident-capital-gain-v1', 'רווח הון לתושב חוץ', 'tax', 'professional_domain', 'external-capital-gain-candidate', 'needs_source_audit'),
  sourceRow('external-capital-statement-v1', 'הצהרת הון', 'tax', 'professional_domain', 'external-capital-statement-candidate', 'needs_source_audit'),
  sourceRow(
    'external-income-tax-section-102-102a-knowledge-v1',
    'Section 102/102A income tax knowledge',
    'income_tax',
    'professional_domain',
    'Knowledge_Base/tax/income_tax/section_102_102a-label-only',
    'partial_static_pointer',
    'Curated income_tax professional knowledge only; preview/index-only; not client evidence; not operational; Eldad approval required before professional use.',
  ),
  sourceRow(
    'external-urgent-tax-102-scans-2026-05-05-v1',
    'Urgent scans 2026-05-05 mixed intake',
    'unclassified_mixed_intake',
    'file_folder',
    'סריקות/סריקות2026-05-05_דחוף_מסמכים_מהמייל-label-only',
    'needs_source_audit',
    'סריקות is a general intake landing zone, not automatically client evidence. This urgent folder is unclassified mixed intake pending mapping and verification; it may contain client evidence, authority correspondence, professional guidance, or accidental spillover; not operational.',
  ),
  sourceRow('external-robium-protokol-pelephone-v1', 'Robium / Protokol / Pelephone', 'product', 'product_context', 'external-robium-protokol-pelephone-candidate', 'partial_static_pointer'),
  sourceRow('external-smart-bureau-robium-v1', 'Smart Bureau Robium', 'product', 'product_system', 'external-smart-bureau-robium-candidate', 'partial_static_pointer'),
  sourceRow('external-wps-inventory-v1', 'WPS Inventory System', 'inventory', 'product_system', 'external-wps-inventory-candidate', 'unknown_needs_audit'),
  sourceRow('external-new-client-intake-module-v1', 'מודול קליטת לקוח חדש', 'client_intake', 'product_system', 'external-client-intake-module-candidate', 'unknown_needs_audit'),
  sourceRow('external-construction-site-control-v1', 'מערכת לניהול ובקרת אתרי בנייה', 'construction', 'product_system', 'external-construction-control-candidate', 'unknown_needs_audit'),
  sourceRow('external-gravity-ingestion-vault-v1', 'Gravity ingestion vault', 'source_vault', 'source_vault', 'gravity-ingestion-vault-label-only', 'blocked_file_access'),
  sourceRow('external-gmail-data-exports-v1', 'Gmail data exports', 'provider_exports', 'provider_export', 'provider-export-label-only', 'blocked_live_connection'),
  sourceRow('external-drive-data-exports-v1', 'Drive data exports', 'provider_exports', 'provider_export', 'provider-export-label-only', 'blocked_live_connection'),
  sourceRow('external-scans-folder-v1', 'סריקות folder', 'scanned_evidence', 'file_folder', 'scans-folder-label-only', 'blocked_file_access'),
  sourceRow('external-clients-folder-v1', 'לקוחות folder', 'clients', 'file_folder', 'clients-folder-label-only', 'blocked_file_access'),
  sourceRow('external-maven-vat-source-folders-v1', 'Maven/VAT source folders', 'vat', 'file_folder', 'maven-vat-source-folder-label-only', 'blocked_file_access'),
  sourceRow('external-dima-legacy-generated-v1', 'legacy/generated Dima source folders', 'case_context', 'legacy_source_folder', 'legacy-dima-generated-label-only', 'unknown_needs_audit'),
  sourceRow('external-tsila-legacy-generated-v1', 'legacy/generated Tsila source folders', 'case_context', 'legacy_source_folder', 'legacy-tsila-generated-label-only', 'unknown_needs_audit'),
];
// #endregion
