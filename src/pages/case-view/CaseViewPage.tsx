/* ============================================
   FILE: CaseViewPage.tsx
   PURPOSE: Full case view — reads case from brainStore by route param.
            Composes CaseEmailList, CaseDocumentList, CaseDraftPreview.
   DEPENDENCIES: react, react-router-dom, zustand, lucide-react,
                 brainStore, caseTypes, draftGenerator
   EXPORTS: CaseViewPage (default)
   ============================================ */
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBrainStore } from '../../store/brainStore';
import { generateAppealDraft } from '../../integrations/gmail/draftGenerator';
import { AlertTriangle, Calendar, FileText, Clock, Shield } from 'lucide-react';
import CaseEmailList from './components/CaseEmailList';
import CaseDocumentList from './components/CaseDocumentList';
import CaseDraftPreview from './components/CaseDraftPreview';
import CaseFinalOutput from './components/CaseFinalOutput';
import CaseAttackMapSection from './components/CaseAttackMapSection';
import SuggestedBlocksSection from './components/SuggestedBlocksSection';
import type { CaseDraft } from '../../data/caseTypes';
import { DIMA_CASE_SEED } from '../../data/dimaCaseSeed';
import { CASE_BUILDER_VERSION } from '../../services/caseBuilder';
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

  // ─── Safe Seed Restore for Dima ───
  // Only refreshes the case entity from DIMA_CASE_SEED (attack map + documents).
  // Does NOT touch draft status, does NOT auto-export, does NOT force-close.
  useEffect(() => {
    if (caseId === 'dima-rodnitski') {
      const current = useBrainStore.getState().cases.find(x => x.caseId === 'dima-rodnitski');
      const seedVersion = DIMA_CASE_SEED.builtWithVersion ?? 0;
      const currentVersion = current?.builtWithVersion ?? 0;
      if (!current || currentVersion < seedVersion) {
        console.log(`[CaseView] Restoring Dima from seed (v${seedVersion} > v${currentVersion})`);
        useBrainStore.getState().upsertCase({
          ...DIMA_CASE_SEED,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }, [caseId]);

  // ─── Deadline ───
  const deadlineDate = new Date(caseEntity.deadline + 'T00:00:00');
  const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 14;

  // ─── Stats ───
  const submittedDocs = caseEntity.documents.filter(d => d.wasSubmitted).length;
  const totalDocs = caseEntity.documents.length;

  /** Generate appeal draft — rebuilds from attack map blocks, NOT from generic template */
  const handleGenerateDraft = () => {
    const existing = caseEntity.draft;
    
    // === הגנה 1: ברירת מחדל = לא לדרוס טיוטה מהותית ===
    const hasRealContent = existing?.body && existing.body.length > 200 
      && !existing.body.includes('[נימוקים מפורטים]')
      && !existing.body.includes('[תיאור הנזק');
    
    if (hasRealContent) {
      const confirmed = window.confirm(
        'הטיוטה הנוכחית מכילה תוכן מהותי (ערר מקצועי).\n\n'
        + 'לחיצה על "אישור" תיצור טיוטה חדשה מגוף מפת התקיפה.\n'
        + 'הטיוטה הקודמת תישמר כ-snapshot.\n'
        + 'לחיצה על "ביטול" תשמור על הטיוטה הקיימת.'
      );
      if (!confirmed) return;
    }

    // === הגנה 2: שמירת snapshot לפני דריסה ===
    const snapshot = existing?.body ? {
      body: existing.body,
      subject: existing.subject,
      savedAt: new Date().toISOString(),
      builtFromVersion: existing.builtFromVersion,
    } : undefined;

    // === Source of truth: rebuild from seed (attack map blocks) ===
    const seedCase = DIMA_CASE_SEED;
    const seedDraft = seedCase.draft;
    const now = new Date().toISOString();
    
    if (seedDraft && seedDraft.body && !seedDraft.body.includes('[נימוקים מפורטים]')) {
      const draft: CaseDraft = {
        templateType: seedDraft.templateType,
        subject: seedDraft.subject,
        body: seedDraft.body,
        status: 'draft',
        sufficiencyWarning: null,
        createdAt: now,
        builtFromVersion: CASE_BUILDER_VERSION,
        builtFromSource: 'seed_blocks',
        previousSnapshot: snapshot,
        suggestedBlocks: existing?.suggestedBlocks ?? seedDraft.suggestedBlocks,
        exportedDraftAt: existing?.exportedDraftAt,
        exportedFinalAt: existing?.exportedFinalAt,
        lastReviewedAt: existing?.lastReviewedAt,
        reviewedBy: existing?.reviewedBy,
        suggestedBlocksInsertedAt: existing?.suggestedBlocksInsertedAt,
        insertedAttackBlockIds: existing?.insertedAttackBlockIds,
      };
      console.log(`[Draft] ✅ נבנה מ-seed_blocks | version=${CASE_BUILDER_VERSION} | ${now}`);
      updateCaseDraft(caseEntity.caseId, draft);
    } else {
      // Fallback for non-Dima cases: generic template
      const result = generateAppealDraft(
        `ערר על החלטה — ${caseEntity.clientName} — בקשה ${caseEntity.officialCaseNumber || ''}`,
        caseEntity.deadline,
        null,
        'war_compensation_red_track'
      );
      const draft: CaseDraft = {
        templateType: result.templateType,
        subject: result.subject,
        body: result.body,
        status: 'draft',
        sufficiencyWarning: 'טיוטה גנרית — נדרשת כתיבה ידנית.',
        createdAt: now,
        builtFromVersion: CASE_BUILDER_VERSION,
        builtFromSource: 'generic_template',
        previousSnapshot: snapshot,
        suggestedBlocks: existing?.suggestedBlocks,
      };
      console.log(`[Draft] ⚠️ נבנה מ-generic_template | version=${CASE_BUILDER_VERSION} | ${now}`);
      updateCaseDraft(caseEntity.caseId, draft);
    }
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
          caseEntity={caseEntity}
          clientName={caseEntity.clientName}
          onGenerateDraft={handleGenerateDraft}
        />
        {(caseEntity.draft?.status === 'ready_for_submission' || caseEntity.draft?.exportedFinalAt) && (
          <div style={{ marginTop: 24 }}>
            <CaseFinalOutput draft={caseEntity.draft} clientName={caseEntity.clientName} />
          </div>
        )}
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
