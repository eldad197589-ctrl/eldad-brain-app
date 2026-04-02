/* ============================================
   FILE: CaseViewPage.tsx
   PURPOSE: Full case view — reads case from brainStore by route param.
            Composes CaseEmailList, CaseDocumentList, CaseDraftPreview.
   DEPENDENCIES: react, react-router-dom, zustand, lucide-react,
                 brainStore, caseTypes, draftGenerator
   EXPORTS: CaseViewPage (default)
   ============================================ */
import { useParams } from 'react-router-dom';
import { useBrainStore } from '../../store/brainStore';
import { generateAppealDraft } from '../../integrations/gmail/draftGenerator';
import { AlertTriangle, Calendar, FileText, Clock, Shield } from 'lucide-react';
import CaseEmailList from './components/CaseEmailList';
import CaseDocumentList from './components/CaseDocumentList';
import CaseDraftPreview from './components/CaseDraftPreview';
import CaseAttackMapSection from './components/CaseAttackMapSection';
import SuggestedBlocksSection from './components/SuggestedBlocksSection';
import type { CaseDraft } from '../../data/caseTypes';

// #region Component

/** CaseViewPage — reads caseId from route, pulls data from store */
export default function CaseViewPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const caseEntity = useBrainStore(s => s.cases.find(c => c.caseId === caseId));
  const updateCaseDraft = useBrainStore(s => s.updateCaseDraft);

  // ─── Not Found ───
  if (!caseId || !caseEntity) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <AlertTriangle size={48} color="#f59e0b" />
        <h2 style={{ marginTop: 16, color: '#f1f5f9' }}>תיק לא נמצא</h2>
        <p style={{ color: '#94a3b8' }}>
          לא נמצא תיק עם מזהה: <code style={{ color: '#60a5fa' }}>{caseId}</code>
        </p>
      </div>
    );
  }

  // ─── Deadline ───
  const deadlineDate = new Date(caseEntity.deadline + 'T00:00:00');
  const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 14;

  // ─── Stats ───
  const submittedDocs = caseEntity.documents.filter(d => d.wasSubmitted).length;
  const totalDocs = caseEntity.documents.length;

  /** Generate appeal draft — preserves all review state, regenerates only template */
  const handleGenerateDraft = () => {
    const result = generateAppealDraft(
      `ערר על החלטה — ${caseEntity.clientName} — בקשה ${caseEntity.officialCaseNumber || ''}`,
      caseEntity.deadline,
      null,
      'war_compensation_red_track'
    );
    
    // Preserve ALL existing review/state — regenerate only base template (subject/body)
    const existing = caseEntity.draft;
    
    // Don't demote status: if already under_review or higher, keep it
    const preservedStatus = existing?.status === 'under_review'
      || existing?.status === 'approved_by_eldad'
      || existing?.status === 'ready_for_submission'
      ? existing.status
      : 'draft';

    const draft: CaseDraft = {
      templateType: result.templateType,
      subject: result.subject,
      body: result.body,
      status: preservedStatus,
      sufficiencyWarning: 'הטיוטה נוצרה מחדש. בלוקי הטיעון והבדיקות נשמרו.',
      createdAt: new Date().toISOString(),
      // Preserve: suggestedBlocks (includes includeInDraft per block)
      suggestedBlocks: existing?.suggestedBlocks,
      // Preserve: export timestamps
      exportedDraftAt: existing?.exportedDraftAt,
      exportedFinalAt: existing?.exportedFinalAt,
      // Preserve: review metadata
      lastReviewedAt: existing?.lastReviewedAt,
      reviewedBy: existing?.reviewedBy,
      // Preserve: insertion tracking
      suggestedBlocksInsertedAt: existing?.suggestedBlocksInsertedAt,
      insertedAttackBlockIds: existing?.insertedAttackBlockIds,
    };
    updateCaseDraft(caseEntity.caseId, draft);
  };

  /** Update draft content (e.g. appending blocks) — does NOT change status */
  const handleUpdateDraft = (updatedDraft: CaseDraft) => {
    updateCaseDraft(caseEntity.caseId, updatedDraft);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 60px' }}>

      {/* ─── Header ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 24, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={24} color="#c9a84c" />
            תיק: {caseEntity.clientName}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            {PROCESS_LABELS[caseEntity.processType] || caseEntity.processType}
            {caseEntity.officialCaseNumber && ` | בקשה מס׳ ${caseEntity.officialCaseNumber}`}
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
          background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`,
        }}>
          <Clock size={16} color={isUrgent ? '#f87171' : '#fbbf24'} />
          <span style={{ color: isUrgent ? '#f87171' : '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
            {daysLeft > 0 ? `${daysLeft} ימים לדדליין` : 'דדליין עבר!'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
            ({deadlineDate.toLocaleDateString('he-IL')})
          </span>
        </div>
      </div>

      {/* ─── Status Strip ─── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatCard icon={<FileText size={16} />} label="סטטוס" value={STATUS_LABELS[caseEntity.status]} color="#3b82f6" />
        <StatCard icon={<Calendar size={16} />} label="מיילים" value={String(caseEntity.emails.length)} color="#8b5cf6" />
        <StatCard icon={<FileText size={16} />} label="מסמכים" value={`${submittedDocs}/${totalDocs} הוגשו`} color="#10b981" />
        <StatCard icon={<AlertTriangle size={16} />} label="סיכונים" value={String(caseEntity.riskFlags.length)} color="#f59e0b" />
      </div>

      {/* ─── Risk Flags ─── */}
      {caseEntity.riskFlags.length > 0 && (
        <div className="case-section" style={{ borderRight: '3px solid #f59e0b' }}>
          <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="#f59e0b" />
            דגלי סיכון
          </h3>
          {caseEntity.riskFlags.map((flag, i) => (
            <div key={i} style={{ color: '#fbbf24', fontSize: '0.85rem', padding: '4px 0' }}>🔴 {flag}</div>
          ))}
        </div>
      )}

      {/* ─── Missing Items ─── */}
      {caseEntity.missingItems.length > 0 && (
        <div className="case-section" style={{ borderRight: '3px solid #ef4444', marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px', color: '#f87171' }}>❌ חסר</h3>
          {caseEntity.missingItems.map((item, i) => (
            <div key={i} style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '2px 0' }}>• {item}</div>
          ))}
        </div>
      )}

      {/* ─── Notes ─── */}
      {caseEntity.notes && (
        <div className="case-section" style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px' }}>📝 הערות</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{caseEntity.notes}</p>
        </div>
      )}

      {/* DEBUG OUTPUT */}
      <pre style={{ background: '#000', color: 'lime', padding: 10, marginTop: 16 }}>
        {JSON.stringify({ 
           keys: Object.keys(caseEntity),
           version: caseEntity.builtWithVersion
        }, null, 2)}
      </pre>

      {/* ─── Emails ─── */}
      <div style={{ marginTop: 24 }}>
        <CaseEmailList emails={caseEntity.emails} />
      </div>

      {/* ─── Documents ─── */}
      <div style={{ marginTop: 24 }}>
        <CaseDocumentList documents={caseEntity.documents} />
      </div>

      {/* ─── Attack Map ─── */}
      <CaseAttackMapSection 
        attackMap={caseEntity.attackMap} 
        summary={caseEntity.attackSummary} 
      />

      {/* ─── Suggested Blocks ─── */}
      {caseEntity.draft?.suggestedBlocks && caseEntity.draft.suggestedBlocks.length > 0 && (
        <SuggestedBlocksSection
          blocks={caseEntity.draft.suggestedBlocks}
          draft={caseEntity.draft}
          onUpdateDraft={handleUpdateDraft}
        />
      )}

      {/* ─── Draft ─── */}
      <div style={{ marginTop: 24 }}>
        <CaseDraftPreview
          draft={caseEntity.draft}
          clientName={caseEntity.clientName}
          onGenerateDraft={handleGenerateDraft}
        />
      </div>
    </div>
  );
}

// #endregion

// #region Sub-components

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 8,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color }}>{value}</div>
    </div>
  );
}

// #endregion

// #region Labels

const PROCESS_LABELS: Record<string, string> = {
  war_compensation_appeal: 'ערר — פיצויי מלחמה מסלול אדום',
  war_compensation_claim: 'תביעת פיצויי מלחמה',
  tax_audit: 'ביקורת מס',
  penalty_appeal: 'ערר על קנס',
  insurance_claim: 'תביעת ביטוח',
  general: 'כללי',
};

const STATUS_LABELS: Record<string, string> = {
  collecting: 'איסוף חומרים',
  reviewing: 'בבדיקה',
  drafting: 'בניסוח',
  submitted: 'הוגש',
  appealed: 'ערר הוגש',
  closed: 'סגור',
};

// #endregion
