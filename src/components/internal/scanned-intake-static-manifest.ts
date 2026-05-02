/* ============================================
   FILE: scanned-intake-static-manifest.ts
   PURPOSE: Static read-only manifest for current Scans Inbox folders.
   DEPENDENCIES: None
   EXPORTS: ScannedIntakeStaticManifestEntry, SCANNED_INTAKE_STATIC_MANIFEST
   ============================================ */

// #region Types
export type ScannedIntakeRelatedEntityGuess = 'Dima' | 'Tsila' | 'David Eldad' | 'VAT' | 'Robium' | 'unknown';
export type ScannedIntakeManifestType = 'case' | 'process' | 'personal' | 'business' | 'unknown';
export type ScannedIntakeManifestStatus = 'unreviewed' | 'needs_eldad_review' | 'ready_for_local_review' | 'ignore_for_now';
export type ScannedIntakeManifestRiskLevel = 'low' | 'medium' | 'high';
export type ScannedIntakeForbiddenAction = 'delete' | 'move' | 'rename' | 'OCR' | 'persist' | 'createWorkItem';

/** Static read-only manifest entry for one Scans Inbox folder. */
export interface ScannedIntakeStaticManifestEntry {
  /** Stable local manifest id. */
  id: string;
  /** Folder name as observed in the approved folder index. */
  folderName: string;
  /** Relative folder path under the Scans Inbox. */
  folderPath: string;
  /** Manual entity/process guess, not an operational assignment. */
  relatedEntityGuess: ScannedIntakeRelatedEntityGuess;
  /** Manual intake category guess. */
  intakeType: ScannedIntakeManifestType;
  /** Manual review status for read-only display. */
  status: ScannedIntakeManifestStatus;
  /** Known evidence/file count from the approved metadata-only folder index. */
  evidenceCount: number | null;
  /** Last updated date if known from folder naming. */
  lastUpdated: string | null;
  /** Static risk level for manual review priority. */
  riskLevel: ScannedIntakeManifestRiskLevel;
  /** Read-only note for Eldad review. */
  notes: string;
  /** Safety mode for all entries. */
  allowedMode: 'read_only';
  /** Actions that remain forbidden from this UI. */
  forbiddenActions: ScannedIntakeForbiddenAction[];
}
// #endregion

// #region Constants
const forbiddenActions: ScannedIntakeForbiddenAction[] = ['delete', 'move', 'rename', 'OCR', 'persist', 'createWorkItem'];

/** Static manual manifest for current Scans Inbox folders. */
export const SCANNED_INTAKE_STATIC_MANIFEST: ScannedIntakeStaticManifestEntry[] = [
  {
    id: 'scan-manifest-dima-war-compensation',
    folderName: 'בניית ערר או השגה דימה פיצוי מלחמה מסלול אדום',
    folderPath: 'סריקות/בניית ערר או השגה דימה פיצוי מלחמה מסלול אדום',
    relatedEntityGuess: 'Dima',
    intakeType: 'case',
    status: 'ready_for_local_review',
    evidenceCount: 0,
    lastUpdated: null,
    riskLevel: 'medium',
    notes: 'Active Dima war-compensation intake folder. Static pointer only; no import.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
  {
    id: 'scan-manifest-vat-2026-01-02',
    folderName: 'חומר למעמ דוד אלדד 1-2.26',
    folderPath: 'סריקות/חומר למעמ דוד אלדד 1-2.26',
    relatedEntityGuess: 'VAT',
    intakeType: 'process',
    status: 'needs_eldad_review',
    evidenceCount: 29,
    lastUpdated: null,
    riskLevel: 'medium',
    notes: 'VAT reporting material for January-February 2026, pending manual confirmation.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
  {
    id: 'scan-manifest-vat-2026-03-04',
    folderName: 'חומר למע דוד אלדד 3-4.26',
    folderPath: 'סריקות/חומר למע דוד אלדד 3-4.26',
    relatedEntityGuess: 'VAT',
    intakeType: 'process',
    status: 'needs_eldad_review',
    evidenceCount: 14,
    lastUpdated: null,
    riskLevel: 'medium',
    notes: 'VAT reporting material for March-April 2026, pending manual confirmation.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
  {
    id: 'scan-manifest-bank-card-analysis',
    folderName: 'חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
    folderPath: 'סריקות/חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
    relatedEntityGuess: 'David Eldad',
    intakeType: 'process',
    status: 'needs_eldad_review',
    evidenceCount: 15,
    lastUpdated: null,
    riskLevel: 'medium',
    notes: 'Accounting analysis inbox for bank and credit-card source documents.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
  {
    id: 'scan-manifest-robium-routine',
    folderName: 'טיפול שוטף רוביום',
    folderPath: 'סריקות/טיפול שוטף רוביום',
    relatedEntityGuess: 'Robium',
    intakeType: 'business',
    status: 'needs_eldad_review',
    evidenceCount: 13,
    lastUpdated: null,
    riskLevel: 'medium',
    notes: 'Routine Robium business material requiring manual classification.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
  {
    id: 'scan-manifest-google-notices',
    folderName: 'הודעות חשובות מגוגל',
    folderPath: 'סריקות/הודעות חשובות מגוגל',
    relatedEntityGuess: 'unknown',
    intakeType: 'business',
    status: 'needs_eldad_review',
    evidenceCount: 2,
    lastUpdated: null,
    riskLevel: 'medium',
    notes: 'Google notices need Eldad classification before any operational treatment.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
  {
    id: 'scan-manifest-tax-authority-notices',
    folderName: 'מס הכנסה ושומות — תיקיות הודעות ודרישות',
    folderPath: 'סריקות/2026-04-19 הודעות ודרישות מס הכנסה',
    relatedEntityGuess: 'unknown',
    intakeType: 'process',
    status: 'needs_eldad_review',
    evidenceCount: 7,
    lastUpdated: '2026-04-19',
    riskLevel: 'medium',
    notes: 'Tax authority notices are grouped here as a manual-review manifest entry.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
  {
    id: 'scan-manifest-unknown-business-client-folders',
    folderName: 'אוזנה / בכורי פריש / סיירת א.ח — תיקיות לקוח לא מסווגות',
    folderPath: 'סריקות/תיקיות עסקיות או לקוח לא מסווגות',
    relatedEntityGuess: 'unknown',
    intakeType: 'unknown',
    status: 'needs_eldad_review',
    evidenceCount: 31,
    lastUpdated: null,
    riskLevel: 'high',
    notes: 'Unknown business/client folders must stay manual-review only until Eldad names them.',
    allowedMode: 'read_only',
    forbiddenActions,
  },
];
// #endregion
