/* ============================================
   FILE: brain-diagnostics-static-manifest.ts
   PURPOSE: Static folder-reality manifest for the read-only Brain diagnostics view.
   DEPENDENCIES: None
   EXPORTS: BrainDiagnosticsStaticManifest, BRAIN_DIAGNOSTICS_STATIC_MANIFEST
   ============================================ */

// #region Types
/** Static count for one known professional folder root. */
export interface BrainDiagnosticsFolderCount {
  /** Root folder label from the historical work index. */
  path: string;
  /** Number of directories observed during the approved metadata-only audit. */
  dirs: number;
  /** Number of files observed during the approved metadata-only audit. */
  files: number;
  /** Read-only interpretation for the diagnostics screen. */
  role: string;
}

/** Static active case or process entry known from folder reality. */
export interface BrainDiagnosticsWorkingSetItem {
  /** Human-facing work name. */
  name: string;
  /** Work role in the Brain diagnostics view. */
  role: string;
  /** Whether this is a case, client/entity folder, or process. */
  kind: string;
}

/** Static workflow domain from historical professional folders. */
export interface BrainDiagnosticsWorkflowDomain {
  /** Workflow domain name. */
  name: string;
  /** Why this domain matters for the Brain. */
  role: string;
}

/** Static no-touch group that must remain blocked from this diagnostics view. */
export interface BrainDiagnosticsFrozenGroup {
  /** Frozen group label. */
  name: string;
  /** Safety reason for keeping the group read-only. */
  reason: string;
}

/** Static manifest used by the read-only diagnostics view. */
export interface BrainDiagnosticsStaticManifest {
  /** Professional folder roots and metadata-only counts. */
  folderCounts: BrainDiagnosticsFolderCount[];
  /** Active working set visible in folder reality. */
  activeWorkingSet: BrainDiagnosticsWorkingSetItem[];
  /** Workflow domains visible in historical professional work. */
  workflowDomains: BrainDiagnosticsWorkflowDomain[];
  /** Groups that must not be touched from this view. */
  frozenNoTouchGroups: BrainDiagnosticsFrozenGroup[];
  /** Static intake inbox status for scans. */
  intakeInboxStatus: string;
}
// #endregion

// #region Manifest
/** Static folder-reality manifest from the approved metadata-only historical work index. */
export const BRAIN_DIAGNOSTICS_STATIC_MANIFEST: BrainDiagnosticsStaticManifest = {
  folderCounts: [
    {
      path: 'לקוחות/',
      dirs: 147,
      files: 593,
      role: 'official client and case practice tree',
    },
    {
      path: 'דוד אלדד/',
      dirs: 69,
      files: 405,
      role: 'David Eldad CPA entity and client professional work',
    },
    {
      path: 'סריקות/',
      dirs: 34,
      files: 132,
      role: 'mixed intake inbox awaiting manual classification',
    },
  ],
  activeWorkingSet: [
    { name: 'Dima', kind: 'active case', role: 'war-compensation case candidate' },
    { name: 'Tsila', kind: 'active case/client', role: 'client/entity work candidate' },
    { name: 'VAT / מע"מ process', kind: 'active process', role: 'tax reporting workflow, not automatically a case' },
  ],
  workflowDomains: [
    { name: 'חוות דעת', role: 'expert opinions and professional learning corpus' },
    { name: 'מע"מ', role: 'VAT reporting and intake workflow' },
    { name: 'פיצויי מלחמה', role: 'war-compensation case workflow' },
    { name: 'הנהלת חשבונות', role: 'bookkeeping and accounting workflow' },
    { name: 'חישובים מיוחדים', role: 'special calculations and case outputs' },
  ],
  frozenNoTouchGroups: [
    { name: 'client folders', reason: 'official professional memory, not runtime data' },
    { name: 'source documents', reason: 'private source material must not be imported from this view' },
    { name: 'scans inbox', reason: 'mixed intake requires manual review before classification' },
    { name: 'duplicate/scratch Dima materials', reason: 'preservation review is not cleanup approval' },
    { name: 'Knowledge_Base', reason: 'knowledge material remains outside this UI flow' },
    { name: 'restricted insights', reason: 'approval/redaction gate remains active' },
    { name: 'package/config files', reason: 'tooling changes are outside diagnostics scope' },
    {
      name: 'operational Store/Persistence/WorkItem/Matter/DocumentRef paths',
      reason: 'this view cannot promote or create operational records',
    },
  ],
  intakeInboxStatus: 'סריקות/ is a mixed intake inbox. Display only; no sync, import, OCR, or classification runs from here.',
};
// #endregion
