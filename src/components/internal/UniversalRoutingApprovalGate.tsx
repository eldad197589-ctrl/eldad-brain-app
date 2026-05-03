/* ============================================
   FILE: UniversalRoutingApprovalGate.tsx
   PURPOSE: Local-only mock approval gate for Universal Routing suggestions.
   DEPENDENCIES: React, universal routing static seed
   EXPORTS: UniversalRoutingApprovalGate (default)
   ============================================ */

// #region Imports
import { type ChangeEvent, type CSSProperties, useMemo, useState } from 'react';
import { ALL_SEED_SUGGESTIONS } from '../../work-spine/routing/universal-routing-static-seed';
import type { RoutingCandidateKind } from '../../work-spine/routing/universal-routing-types';
// #endregion

// #region Types
/** Local mock approval fields captured only in component state. */
interface ApprovalGateFields {
  approvedBy: string;
  approvedOutcome: '' | RoutingCandidateKind;
  approvedEntity: string;
  approvedCaseOrProcess: string;
  approvedTargetFolder: string;
  approvedReason: string;
  evidenceReviewed: boolean;
}

/** Display model for an approval blocker. */
interface ApprovalBlocker {
  label: string;
  isBlocking: boolean;
}

/** Props for the approval field controls panel. */
interface ApprovalFieldsPanelProps {
  fields: ApprovalGateFields;
  onFieldChange: ApprovalFieldChangeHandler;
}

/** Props for the blocker list panel. */
interface ApprovalBlockersPanelProps {
  blockers: readonly ApprovalBlocker[];
}

/** Props for the audit preview panel. */
interface AuditPreviewPanelProps {
  auditPreview: string;
}

/** Props for text-like approval fields. */
interface TextApprovalFieldProps {
  label: string;
  testId: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Props for approved outcome selection. */
interface OutcomeApprovalFieldProps {
  value: ApprovalGateFields['approvedOutcome'];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

/** Props for the evidence-reviewed checkbox. */
interface EvidenceReviewedFieldProps {
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

type ApprovalFieldChangeHandler = (
  fieldName: keyof ApprovalGateFields,
) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
// #endregion

// #region Constants
const emptyFields: ApprovalGateFields = {
  approvedBy: '',
  approvedOutcome: '',
  approvedEntity: '',
  approvedCaseOrProcess: '',
  approvedTargetFolder: '',
  approvedReason: '',
  evidenceReviewed: false,
};

const outcomeOptions: Array<ApprovalGateFields['approvedOutcome']> = ['', 'filing', 'task', 'process', 'case_evidence', 'learning', 'unknown'];
// #endregion

// #region Styles
const sectionStyle: CSSProperties = { background: 'rgba(15, 23, 42, 0.86)', border: '1px solid rgba(251, 191, 36, 0.26)', borderRadius: 18, padding: 18, display: 'grid', gap: 16 };
const panelStyle: CSSProperties = { borderRadius: 16, border: '1px solid rgba(148, 163, 184, 0.16)', background: 'rgba(30, 41, 59, 0.58)', padding: 14, display: 'grid', gap: 12 };
const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 };
const labelStyle: CSSProperties = { color: '#94a3b8', fontSize: '0.78rem', display: 'grid', gap: 6 };
const controlStyle: CSSProperties = { borderRadius: 10, border: '1px solid rgba(148, 163, 184, 0.24)', background: 'rgba(15, 23, 42, 0.7)', color: '#f8fafc', padding: '9px 10px' };
const badgeStyle: CSSProperties = { display: 'inline-flex', width: 'fit-content', borderRadius: 999, padding: '5px 9px', color: '#fde68a', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.78rem', fontWeight: 700 };
// #endregion

// #region Helpers
const hasConflictingSuggestions = (): boolean => {
  const uniqueKinds = new Set(ALL_SEED_SUGGESTIONS.map((suggestion) => suggestion.kind));
  return uniqueKinds.size > 1;
};

const hasLowConfidenceSuggestion = (): boolean =>
  ALL_SEED_SUGGESTIONS.some((suggestion) => !suggestion.confidenceScore.isHighConfidence);

const buildBlockers = (fields: ApprovalGateFields): ApprovalBlocker[] => [
  {
    label: 'missing entity/client',
    isBlocking: fields.approvedEntity.trim().length === 0,
  },
  {
    label: 'missing case/process',
    isBlocking:
      ['task', 'process', 'case_evidence'].includes(fields.approvedOutcome) &&
      fields.approvedCaseOrProcess.trim().length === 0,
  },
  {
    label: 'evidence not checked',
    isBlocking: !fields.evidenceReviewed,
  },
  {
    label: 'low confidence',
    isBlocking: hasLowConfidenceSuggestion(),
  },
  {
    label: 'unknown outcome',
    isBlocking: fields.approvedOutcome === '' || fields.approvedOutcome === 'unknown',
  },
  {
    label: 'conflicting suggestions',
    isBlocking: hasConflictingSuggestions(),
  },
  {
    label: 'missing target folder for filing',
    isBlocking: fields.approvedOutcome === 'filing' && fields.approvedTargetFolder.trim().length === 0,
  },
];

const buildAuditPreview = (fields: ApprovalGateFields, blockers: readonly ApprovalBlocker[]): string => {
  const activeBlockers = blockers.filter((blocker) => blocker.isBlocking).map((blocker) => blocker.label);
  const outcome = fields.approvedOutcome || 'not selected';
  const reviewer = fields.approvedBy || 'not captured';
  const entity = fields.approvedEntity || 'not captured';
  const reason = fields.approvedReason || 'not captured';

  return [
    `Mock audit preview only: ${reviewer} reviewed a ${outcome} routing outcome.`,
    `Entity/client: ${entity}.`,
    `Reason: ${reason}.`,
    `Evidence reviewed: ${String(fields.evidenceReviewed)}.`,
    `Allowed later action: none until a separate real-action gate is approved.`,
    `Active blockers: ${activeBlockers.length > 0 ? activeBlockers.join(', ') : 'none in local mock state'}.`,
  ].join(' ');
};
// #endregion

// #region Component Parts
function ApprovalGateHeader() {
  return (
    <div>
      <span style={badgeStyle}>mock gate / local state only</span>
      <h2 style={{ margin: '10px 0 0', color: '#f8fafc' }}>Routing Approval Gate — mock / local only</h2>
      <p style={{ margin: '8px 0 0', color: '#fde68a', lineHeight: 1.7 }}>
        Local mock approval preview only. No persistence, promotion, file operations, live connectors, OCR, or operational creation.
      </p>
    </div>
  );
}

function TextApprovalField({ label, testId, value, onChange }: TextApprovalFieldProps) {
  return (
    <label style={labelStyle}>
      {label}
      <input data-testid={testId} value={value} onChange={onChange} style={controlStyle} />
    </label>
  );
}

function OutcomeApprovalField({ value, onChange }: OutcomeApprovalFieldProps) {
  return (
    <label style={labelStyle}>
      approvedOutcome
      <select data-testid="routing-approval-approved-outcome" value={value} onChange={onChange} style={controlStyle}>
        {outcomeOptions.map((outcome) => (
          <option key={outcome || 'none'} value={outcome}>
            {outcome || 'not selected'}
          </option>
        ))}
      </select>
    </label>
  );
}

function EvidenceReviewedField({ checked, onChange }: EvidenceReviewedFieldProps) {
  return (
    <label style={{ ...labelStyle, alignContent: 'end' }}>
      evidenceReviewed
      <input data-testid="routing-approval-evidence-reviewed" checked={checked} onChange={onChange} type="checkbox" style={{ width: 18, height: 18 }} />
    </label>
  );
}

function ApprovalFieldsPanel({ fields, onFieldChange }: ApprovalFieldsPanelProps) {
  return (
    <div data-testid="routing-approval-fields" style={panelStyle}>
      <h3 style={{ margin: 0, color: '#f8fafc' }}>Approval fields</h3>
      <div style={gridStyle}>
        <TextApprovalField label="approvedBy" testId="routing-approval-approved-by" value={fields.approvedBy} onChange={onFieldChange('approvedBy')} />
        <OutcomeApprovalField value={fields.approvedOutcome} onChange={onFieldChange('approvedOutcome')} />
        <TextApprovalField label="approvedEntity" testId="routing-approval-approved-entity" value={fields.approvedEntity} onChange={onFieldChange('approvedEntity')} />
        <TextApprovalField
          label="approvedCaseOrProcess"
          testId="routing-approval-approved-case-or-process"
          value={fields.approvedCaseOrProcess}
          onChange={onFieldChange('approvedCaseOrProcess')}
        />
        <TextApprovalField
          label="approvedTargetFolder"
          testId="routing-approval-approved-target-folder"
          value={fields.approvedTargetFolder}
          onChange={onFieldChange('approvedTargetFolder')}
        />
        <TextApprovalField label="approvedReason" testId="routing-approval-approved-reason" value={fields.approvedReason} onChange={onFieldChange('approvedReason')} />
        <EvidenceReviewedField checked={fields.evidenceReviewed} onChange={onFieldChange('evidenceReviewed')} />
      </div>
    </div>
  );
}

function ApprovalBlockersPanel({ blockers }: ApprovalBlockersPanelProps) {
  return (
    <div data-testid="routing-approval-blockers" style={panelStyle}>
      <h3 style={{ margin: 0, color: '#f8fafc' }}>Blockers</h3>
      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#e2e8f0', display: 'grid', gap: 6 }}>
        {blockers.map((blocker) => (
          <li key={blocker.label}>
            {blocker.label}: {blocker.isBlocking ? 'blocking' : 'locally satisfied'}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuditPreviewPanel({ auditPreview }: AuditPreviewPanelProps) {
  return (
    <div data-testid="routing-approval-audit-preview" style={panelStyle}>
      <h3 style={{ margin: 0, color: '#f8fafc' }}>Audit text preview</h3>
      <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>{auditPreview}</p>
    </div>
  );
}

function HardSafetyFlagsPanel() {
  return (
    <div data-testid="routing-approval-hard-safety-flags" style={{ ...panelStyle, color: '#fde68a', lineHeight: 1.8 }}>
      <div>canCreateWorkItem=false</div>
      <div>canCreateMatter=false</div>
      <div>canCreateDocumentRef=false</div>
      <div>requiresEldadApproval=true</div>
      <div>operationalActionBlocked=true</div>
    </div>
  );
}
// #endregion

// #region Component
/** UniversalRoutingApprovalGate — Captures local-only mock approval fields while every real action stays blocked. */
export default function UniversalRoutingApprovalGate() {
  const [fields, setFields] = useState<ApprovalGateFields>(emptyFields);
  const blockers = useMemo(() => buildBlockers(fields), [fields]);
  const auditPreview = useMemo(() => buildAuditPreview(fields, blockers), [fields, blockers]);

  const updateField: ApprovalFieldChangeHandler = (fieldName) => (event) => {
    const nextValue = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
    setFields((currentFields) => ({ ...currentFields, [fieldName]: nextValue }));
  };

  return (
    <section data-testid="universal-routing-approval-gate" style={sectionStyle}>
      <ApprovalGateHeader />
      <ApprovalFieldsPanel fields={fields} onFieldChange={updateField} />
      <ApprovalBlockersPanel blockers={blockers} />
      <AuditPreviewPanel auditPreview={auditPreview} />
      <HardSafetyFlagsPanel />
    </section>
  );
}
// #endregion
