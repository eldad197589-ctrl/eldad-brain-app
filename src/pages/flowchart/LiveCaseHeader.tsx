/* ============================================
   FILE: LiveCaseHeader.tsx
   PURPOSE: Layer A — live case status header for flowchart pages.
            Reads from CaseEntity, displays client info, status,
            deadline, risk/missing counts, and draft state.
   DEPENDENCIES: react, lucide-react, caseTypes
   EXPORTS: LiveCaseHeader
   ============================================ */
import { Link } from 'react-router-dom';
import { Shield, Clock, AlertTriangle, FileX, FileText, ExternalLink } from 'lucide-react';
import type { CaseEntity } from '../../data/caseTypes';

// #region Labels

const STATUS_LABELS: Record<string, string> = {
  collecting: 'איסוף חומרים',
  reviewing: 'בבדיקה',
  drafting: 'בניסוח',
  submitted: 'הוגש',
  appealed: 'ערר הוגש',
  closed: 'סגור',
};

const STATUS_COLORS: Record<string, string> = {
  collecting: '#f59e0b',
  reviewing: '#3b82f6',
  drafting: '#8b5cf6',
  submitted: '#10b981',
  appealed: '#06b6d4',
  closed: '#64748b',
};

const DRAFT_STATUS_LABELS: Record<string, string> = {
  draft: 'טיוטה',
  under_review: 'בבדיקה',
  approved_by_eldad: 'מאושר',
  ready_for_submission: 'מוכן להגשה',
};

const PROCESS_LABELS: Record<string, string> = {
  war_compensation_appeal: 'ערר — פיצויי מלחמה מסלול אדום',
  war_compensation_claim: 'תביעת פיצויי מלחמה',
  tax_audit: 'ביקורת מס',
  penalty_appeal: 'ערר על קנס',
  insurance_claim: 'תביעת ביטוח',
  general: 'כללי',
};

// #endregion

// #region Component

interface LiveCaseHeaderProps {
  /** ישות תיק חיה מ-brainStore */
  caseEntity: CaseEntity;
}

/**
 * LiveCaseHeader — Layer A של ה-Bridge.
 * מציג סטטוס חי של תיק מעל תרשים הזרימה הסטטי.
 */
export default function LiveCaseHeader({ caseEntity }: LiveCaseHeaderProps) {
  const statusColor = STATUS_COLORS[caseEntity.status] || '#94a3b8';
  const statusLabel = STATUS_LABELS[caseEntity.status] || caseEntity.status;
  const processLabel = PROCESS_LABELS[caseEntity.processType] || caseEntity.processType;
  const draftLabel = caseEntity.draft ? DRAFT_STATUS_LABELS[caseEntity.draft.status] || caseEntity.draft.status : null;

  // ─── Deadline calculation ───
  let daysLeftText = '—';
  let deadlineDateText = '';
  let isUrgent = false;

  if (caseEntity.deadline) {
    const deadlineDate = new Date(caseEntity.deadline + 'T00:00:00');
    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    isUrgent = daysLeft <= 14;
    daysLeftText = daysLeft > 0 ? `${daysLeft} ימים` : 'עבר!';
    deadlineDateText = deadlineDate.toLocaleDateString('he-IL');
  }

  const riskCount = caseEntity.riskFlags.length;
  const missingCount = caseEntity.missingItems.length;

  return (
    <div style={{
      background: 'rgba(15,23,42,0.6)',
      border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 24,
      maxWidth: 1000,
      marginRight: 'auto',
      marginLeft: 'auto',
    }}>
      {/* ─── Top Row: Client + Deadline ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 12, marginBottom: 12,
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: '1.2rem', color: '#f1f5f9',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Shield size={20} color="#c9a84c" />
            {caseEntity.clientName}
          </h2>
          <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
            {processLabel}
            {caseEntity.officialCaseNumber && ` | בקשה ${caseEntity.officialCaseNumber}`}
          </p>
        </div>

        {/* Deadline badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
          background: isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.15)'}`,
        }}>
          <Clock size={14} color={isUrgent ? '#f87171' : '#fbbf24'} />
          <span style={{
            color: isUrgent ? '#f87171' : '#fbbf24', fontWeight: 700, fontSize: '0.85rem',
          }}>
            {daysLeftText}
          </span>
          {deadlineDateText && (
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({deadlineDateText})</span>
          )}
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      }}>
        {/* Status */}
        <StatPill icon={<FileText size={13} />} label={statusLabel} color={statusColor} />

        {/* Risks */}
        {riskCount > 0 && (
          <StatPill icon={<AlertTriangle size={13} />} label={`${riskCount} סיכונים`} color="#f59e0b" />
        )}

        {/* Missing */}
        {missingCount > 0 && (
          <StatPill icon={<FileX size={13} />} label={`${missingCount} חסרים`} color="#ef4444" />
        )}

        {/* Draft */}
        {draftLabel && (
          <StatPill icon={<FileText size={13} />} label={`טיוטה: ${draftLabel}`} color="#8b5cf6" />
        )}

        {/* Link to full case */}
        <Link
          to={`/case/${caseEntity.caseId}`}
          style={{
            marginRight: 'auto',
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#c9a84c', fontSize: '0.8rem', textDecoration: 'none',
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.15)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.08)')}
        >
          <ExternalLink size={12} />
          פתח תיק מלא
        </Link>
      </div>
    </div>
  );
}

// #endregion

// #region Sub-components

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

/** StatPill — compact status indicator pill */
function StatPill({ icon, label, color }: StatPillProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 6,
      background: `${color}12`,
      border: `1px solid ${color}25`,
      color,
      fontSize: '0.8rem', fontWeight: 600,
    }}>
      {icon}
      {label}
    </div>
  );
}

// #endregion
