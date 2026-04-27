/* ============================================
   FILE: CaseViewPage.tsx
   PURPOSE: Full case view — reads case from brainStore by route param.
            Composes CaseDocumentList, CaseDraftPreview.
   DEPENDENCIES: react, react-router-dom, zustand, lucide-react,
                 brainStore, caseTypes, draftGenerator
   EXPORTS: CaseViewPage (default)
   ============================================ */
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBrainStore } from '../../store/brainStore';
import { generateAppealDraft } from '../../integrations/gmail/draftGenerator';
import { AlertTriangle, Calendar, FileText, Clock, Shield, Eye, CheckCircle } from 'lucide-react';
import CaseDocumentList from './components/CaseDocumentList';
import CaseLocalDocuments from './components/CaseLocalDocuments';
import CaseDraftPreview from './components/CaseDraftPreview';
import CaseFinalOutput from './components/CaseFinalOutput';
import CaseAttackMapSection from './components/CaseAttackMapSection';
import SuggestedBlocksSection from './components/SuggestedBlocksSection';
import TsilaMetadataIntake from './components/TsilaMetadataIntake';
import CaseTruthSyncPanel from './components/CaseTruthSyncPanel';
import SubmissionPackagePanel from './components/SubmissionPackagePanel';
import TsilaAcademicCore from './components/TsilaAcademicCore';
import CaseCanonicalTab from './components/CaseCanonicalTab';
import TsilaLiveDraft from './components/TsilaLiveDraft';
import type { CaseDraft } from '../../data/caseTypes';
import { DIMA_CASE_SEED } from '../../data/dimaCaseSeed';
import { TSILA_CASE_SEED } from '../../data/tsilaCaseSeed';
import { CASE_BUILDER_VERSION } from '../../services/caseBuilder';
import { buildDimaPackage } from '../../data/dimaAppealPackage';
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

  // ─── Safe Seed Restore for Dima & Tsila ───
  // Only refreshes the case entity from seeds to ensure latest data.
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
    if (caseId === 'tsila-shvartz') {
      const current = useBrainStore.getState().cases.find(x => x.caseId === 'tsila-shvartz');
      const seedVersion = TSILA_CASE_SEED.builtWithVersion ?? 0;
      const currentVersion = current?.builtWithVersion ?? 0;
      if (!current || currentVersion < seedVersion) {
        console.log(`[CaseView] Restoring Tsila from seed (v${seedVersion} > v${currentVersion})`);
        useBrainStore.getState().upsertCase({
          ...TSILA_CASE_SEED,
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

      {/* ─── Final Approval State ─── */}
      {(caseEntity.workflowStage || caseEntity.approvalStatus) && (
        <div style={{
          marginBottom: 24, padding: 16, borderRadius: 8,
          background: caseEntity.approvalStatus === 'pending_eldad' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
          border: `1px solid ${caseEntity.approvalStatus === 'pending_eldad' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
        }}>
          <h3 style={{ margin: '0 0 12px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color={caseEntity.approvalStatus === 'pending_eldad' ? '#fbbf24' : '#60a5fa'} />
            Final Approval State
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Current Stage:</span>
              <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{caseEntity.workflowStage || '-'}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Approval Status:</span>
              <div style={{ color: caseEntity.approvalStatus === 'pending_eldad' ? '#fbbf24' : '#f1f5f9', fontWeight: 600 }}>
                {caseEntity.approvalStatus === 'pending_eldad' ? 'Pending Eldad Approval' : caseEntity.approvalStatus}
              </div>
            </div>
            {caseEntity.approvalStatus === 'pending_eldad' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Waiting For:</span>
                <div style={{ color: '#fbbf24', fontWeight: 600 }}>Eldad</div>
              </div>
            )}
            {caseEntity.nextRequiredAction && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Next Required Action:</span>
                <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{caseEntity.nextRequiredAction}</div>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* ─── Repair Missions (ENGINE 2) ─── */}
      {caseEntity.repairMissions && caseEntity.repairMissions.length > 0 && (
        <div className="case-section" style={{ borderRight: '3px solid #ef4444', marginTop: 16, background: 'rgba(239,68,68,0.05)', padding: 16, borderRadius: '8px 0 0 8px' }}>
          <h3 style={{ margin: '0 0 12px', color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} />
            משימות תיקון פתוחות (Repair Missions)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {caseEntity.repairMissions.filter(rm => rm.status !== 'resolved').map((mission) => (
              <div key={mission.id} style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{mission.errorType === 'visual' ? '👁️ פגם ויזואלי' : '📄 פגם בתוכן'}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(mission.createdAt).toLocaleString('he-IL')}</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {mission.description}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                   <button 
                     onClick={() => {
                       const updated = caseEntity.repairMissions!.map(m => m.id === mission.id ? { ...m, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : m);
                       useBrainStore.getState().updateCase(caseEntity.caseId, { repairMissions: updated });
                     }}
                     style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer' }}
                   >
                     סמן כטופל
                   </button>
                </div>
              </div>
            ))}
            {caseEntity.repairMissions.filter(rm => rm.status !== 'resolved').length === 0 && (
              <div style={{ color: '#10b981', fontSize: '0.85rem' }}>אין משימות תיקון פתוחות.</div>
            )}
          </div>
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

      {/* ─── Documents ─── */}
      <div style={{ marginTop: 24 }}>
        <CaseDocumentList documents={caseEntity.documents} />
      </div>

      {/* ─── Local Vault Documents ─── */}
      <CaseLocalDocuments caseEntity={caseEntity} />

      {/* ==================================================== */}
      {/* ─── PROCESS SPECIFIC SECTIONS ─── */}
      {/* ==================================================== */}
      
      { (caseEntity.caseId === 'dima-rodnitski' || 
         caseEntity.officialCaseNumber === '58749955' || 
         (caseEntity.clientName && caseEntity.clientName.includes('דימה'))) ? (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={20} color="#10b981" />
            תצוגה קנונית למסמך
          </h3>
          <DimaCaseTabs caseEntity={caseEntity} />
        </div>
      ) : caseEntity.processType === 'academic_submission' ? (
        <div style={{ marginTop: 24, padding: 20, background: 'rgba(59,130,246,0.05)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#60a5fa' }}>🎓 אזור עבודה סמינריונית</h3>
          
          <TsilaAcademicCore />
          <TsilaLiveDraft />

          <div style={{ marginTop: 16 }}>
            <SubmissionPackagePanel
              title="חבילת הגשה סופית"
              status="ready"
              masterSource="DOCX (שמרת_עבודה_סופית.docx)"
              canonicalSource="tsila_canonical.json"
              folderPath="דוד אלדד/צילה הפקות/לימודים_צילה"
              deliverables={[
                { fileName: 'שמרת_עבודה_סופית.docx', label: 'DOCX', emoji: '📄', exists: true },
                { fileName: 'שמרת_עבודה_סופית.pdf', label: 'PDF', emoji: '📕', exists: true },
                { fileName: 'tsila_package.html', label: 'HTML', emoji: '🌐', exists: true },
              ]}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <CaseCanonicalTab caseEntity={caseEntity} />
          </div>

          <TsilaMetadataIntake caseId={caseEntity.caseId} />
          <CaseTruthSyncPanel caseEntity={caseEntity} />
        </div>
      ) : (
        <>
          <CaseAttackMapSection 
            attackMap={caseEntity.attackMap} 
            summary={caseEntity.attackSummary} 
          />

          {caseEntity.draft?.suggestedBlocks && caseEntity.draft.suggestedBlocks.length > 0 && (
            <SuggestedBlocksSection
              blocks={caseEntity.draft.suggestedBlocks}
              draft={caseEntity.draft}
              onUpdateDraft={handleUpdateDraft}
            />
          )}

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
            <div style={{ marginTop: 24 }}>
              <CaseCanonicalTab caseEntity={caseEntity} />
            </div>
          </div>
        </>
      )}

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
  academic_submission: 'עבודה אקדמית — הגשה',
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

function DimaCaseTabs({ caseEntity }: { caseEntity: any }) {
  const [activeTab, setActiveTab] = React.useState(1);
  const pkg = buildDimaPackage(caseEntity);
  
  const tabs = [
    'סקירה',
    'מכתב מקדים ושער',
    'כתב הערר',
    'טענות הרשות והמענה',
    'חוות דעת רו״ח',
    'נספחים ואסמכתאות',
    'קבצים להגשה'
  ];

  return (
    <div style={{ marginTop: 24, background: '#1e293b', borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #334155', background: '#0f172a', overflowX: 'auto' }}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '12px 20px',
              background: activeTab === idx ? '#1e293b' : 'transparent',
              color: activeTab === idx ? '#c9a84c' : '#94a3b8',
              border: 'none',
              borderBottom: activeTab === idx ? '2px solid #c9a84c' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === idx ? 600 : 400,
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div style={{ padding: 24 }}>
        {activeTab === 0 && (
           <div style={{ color: '#cbd5e1' }}>
             <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>סקירת התיק</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard icon={<FileText size={16}/>} label="שם לקוח" value={pkg.metadata.appellantName} color="#60a5fa" />
                <StatCard icon={<Shield size={16}/>} label="מספר בקשה" value={pkg.metadata.caseNumber} color="#c9a84c" />
                <StatCard icon={<Calendar size={16}/>} label="סכום נזק נתבע" value={pkg.metadata.damageAmount} color="#ef4444" />
                <StatCard icon={<Clock size={16}/>} label="מסלול" value="אדום — חרבות ברזל" color="#10b981" />
             </div>
             
             {/* Filing Status Indications */}
             <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: 20, borderRadius: 8 }}>
                <h4 style={{ color: '#10b981', marginTop: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={20} />
                  סטטוס הגשה: הערר הוגש
                </h4>
                <ul style={{ color: '#a7f3d0', margin: 0, paddingRight: 20, lineHeight: 1.8 }}>
                  <li>אישור אוטומטי התקבל מ-Ararim</li>
                  <li>ממתין לכתב תשובה מהרשות</li>
                  <li>מעקב: 60 יום ממועד קבלת הערר</li>
                </ul>
             </div>
           </div>
        )}
        
        {activeTab === 1 && (
           <div style={{ color: '#cbd5e1' }}>
             <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>מכתב מקדים ושער</h3>
             <div style={{ background: '#0f172a', padding: 16, borderRadius: 6 }}>
               {pkg.coverLetter.recipient.map((l, i) => <div key={i} style={{ color: '#94a3b8' }}>{l}</div>)}
               <h4 style={{ color: '#f8fafc', marginTop: 16 }}>{pkg.coverLetter.subject}</h4>
               {pkg.coverLetter.bodyParagraphs.map((p, i) => <p key={i} style={{ color: '#cbd5e1' }}>{p}</p>)}
               <h4 style={{ color: '#f8fafc', marginTop: 16 }}>תוכן העניינים:</h4>
               <ul style={{ color: '#cbd5e1' }}>
                 {pkg.coverLetter.tocItems.map((item, i) => <li key={i}>{item}</li>)}
               </ul>
               <p style={{ color: '#94a3b8', marginTop: 16 }}>נערך בסיוע: {pkg.metadata.assistantName}</p>
             </div>
           </div>
        )}
        
        {activeTab === 2 && (
           <div style={{ color: '#cbd5e1' }}>
             <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>כתב הערר</h3>
             {[
               pkg.sections.A_intro,
               pkg.sections.A1_extension,
               pkg.sections.B_normative,
               pkg.sections.C_facts,
               pkg.sections.E_defects,
               pkg.sections.G_summary
             ].map((sec, i) => (
               <div key={i} style={{ marginBottom: 20 }}>
                 <h4 style={{ color: '#c9a84c', marginTop: 0 }}>{sec.title}</h4>
                 {sec.paragraphs?.map((p, j) => <p key={j} style={{ marginBottom: 8 }}>{p}</p>)}
                 {sec === pkg.sections.G_summary && sec.reliefItems && (
                   <ul style={{ paddingRight: 20 }}>{sec.reliefItems.map((ri, j) => <li key={j} style={{ marginBottom: 4 }}>{ri}</li>)}</ul>
                 )}
               </div>
             ))}
             <div style={{ marginBottom: 20 }}>
               <h4 style={{ color: '#c9a84c' }}>{pkg.sections.D_evidence.title}</h4>
               {pkg.sections.D_evidence.preParagraphs.map((p, i) => <p key={i}>{p}</p>)}
               <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, marginBottom: 16 }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid #334155' }}>
                     {pkg.sections.D_evidence.damageTable.headers.map((h, i) => <th key={i} style={{ textAlign: 'right', padding: 8, color: '#f8fafc' }}>{h}</th>)}
                   </tr>
                 </thead>
                 <tbody>
                   {pkg.sections.D_evidence.damageTable.rows.map((row, i) => (
                     <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                       <td style={{ padding: 8 }}>{row.num}</td>
                       <td style={{ padding: 8 }}>{row.description}</td>
                       <td style={{ padding: 8 }}>{row.attribute}</td>
                       <td style={{ padding: 8, fontWeight: 'bold' }}>{row.amount}</td>
                     </tr>
                   ))}
                   <tr style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                     <td style={{ padding: 8 }}>{pkg.sections.D_evidence.damageTable.totalRow.num}</td>
                     <td colSpan={2} style={{ padding: 8 }}>{pkg.sections.D_evidence.damageTable.totalRow.description}</td>
                     <td style={{ padding: 8 }}>{pkg.sections.D_evidence.damageTable.totalRow.amount}</td>
                   </tr>
                 </tbody>
               </table>
               {pkg.sections.D_evidence.postParagraphs.map((p, i) => <p key={i}>{p}</p>)}
             </div>
           </div>
        )}
        
        {activeTab === 3 && (
           <div style={{ color: '#cbd5e1' }}>
             <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>{pkg.sections.F_claims.title}</h3>
             <p style={{ color: '#94a3b8', marginBottom: 16 }}>סה"כ {pkg.sections.F_claims.claims.length} טענות</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {pkg.sections.F_claims.claims.map(claim => (
                 <div key={claim.id} style={{ background: '#0f172a', padding: 16, borderRadius: 8, borderRight: '4px solid #ef4444' }}>
                   <div style={{ color: '#f87171', fontWeight: 'bold', marginBottom: 8 }}>טענת הרשות ({claim.id}): {claim.authorityClaim}</div>
                   <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: 4 }}>המענה שלנו:</div>
                   <div style={{ whiteSpace: 'pre-wrap' }}>{claim.response || '—'}</div>
                 </div>
               ))}
             </div>
           </div>
        )}
        
        {activeTab === 4 && (
           <div style={{ color: '#cbd5e1' }}>
             <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>{pkg.cpaOpinion.title}</h3>
             <p style={{ color: '#94a3b8', marginBottom: 16 }}>מסמך תומך לערר. {pkg.cpaOpinion.sections.length} חלקים.</p>
             {pkg.cpaOpinion.sections.map((sec, i) => (
               <div key={i} style={{ marginBottom: 16 }}>
                 <strong style={{ color: '#c9a84c' }}>{sec.head}</strong>
                 <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{sec.body}</div>
               </div>
             ))}
             <div style={{ marginTop: 24, borderTop: '1px dashed #334155', paddingTop: 16 }}>
               <strong style={{ color: '#f8fafc' }}>{pkg.cpaOpinion.signatureName}</strong>
               <div style={{ color: '#94a3b8' }}>{pkg.cpaOpinion.signatureRole}</div>
             </div>
           </div>
        )}
        
        {activeTab === 5 && (
           <div style={{ color: '#cbd5e1' }}>
             <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>נספחים ואסמכתאות</h3>
             <p style={{ color: '#94a3b8', marginBottom: 16 }}>{pkg.appendices.length} נספחים מחויבים בחבילת ההגשה. נשאבו מתיקיית source-docs הקנונית.</p>
             <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0f172a', borderRadius: 8, overflow: 'hidden' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'right', background: 'rgba(255,255,255,0.05)' }}>
                   <th style={{ padding: '12px 16px' }}>מס'</th>
                   <th style={{ padding: '12px 16px' }}>תיאור</th>
                   <th style={{ padding: '12px 16px' }}>תאריך/סוג</th>
                   <th style={{ padding: '12px 16px' }}>סטטוס</th>
                   <th style={{ padding: '12px 16px' }}>נדרש PDF</th>
                 </tr>
               </thead>
               <tbody>
                 {pkg.appendices.map((app) => (
                   <tr key={app.num} style={{ borderBottom: '1px solid #1e293b' }}>
                     <td style={{ padding: '12px 16px', color: '#60a5fa' }}>נספח {app.num}</td>
                     <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 500 }}>{app.description}</td>
                     <td style={{ padding: '12px 16px' }}>{app.date}</td>
                     <td style={{ padding: '12px 16px', color: app.status === 'הוגש' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{app.status}</td>
                     <td style={{ padding: '12px 16px' }}>כן</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
        
        {activeTab === 6 && (
           <div style={{ color: '#cbd5e1' }}>
             <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>קבצים להגשה</h3>
             <p style={{ color: '#94a3b8', marginBottom: 16 }}>סטטוס הקבצים המוכנים לועדת הערר:</p>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
               <div style={{ background: '#0f172a', padding: 20, borderRadius: 8, border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ fontSize: '32px', marginBottom: 12 }}>📕</div>
                 <strong style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: 8, wordBreak: 'break-all' }}>ערר_דימה_רודניצקי_58749955_סופי_אלדד.pdf</strong>
                 <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, flex: 1 }}>PDF = קובץ ההגשה. הקובץ הרשמי להגשה בוועדת הערר.</p>
                 <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                   <span>✓ מוכן (Canonical)</span>
                 </div>
               </div>
               <div style={{ background: '#0f172a', padding: 20, borderRadius: 8, border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ fontSize: '32px', marginBottom: 12 }}>🌐</div>
                 <strong style={{ color: '#3b82f6', fontSize: '1.1rem', marginBottom: 8, wordBreak: 'break-all' }}>ערר_דימה_רודניצקי_58749955_סופי_אלדד.html</strong>
                 <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, flex: 1 }}>HTML Golden Record. משמש למקור אמת ויזואלי ולארכיון.</p>
                 <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                   <span>✓ מוכן (Visual Truth)</span>
                 </div>
               </div>
               <div style={{ background: '#0f172a', padding: 20, borderRadius: 8, border: '1px solid #334155', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
                 <div style={{ fontSize: '32px', marginBottom: 12 }}>📄</div>
                 <strong style={{ color: '#10b981', fontSize: '1.1rem', marginBottom: 8, wordBreak: 'break-all' }}>ערר_דימה_רודניצקי_58749955_סופי_אלדד.docx</strong>
                 <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, flex: 1 }}>DOCX = עריכה בלבד. אין להגיש קובץ זה לרשות המסים.</p>
                 <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                   <span>✓ זמין לגיבוי עריכה</span>
                 </div>
               </div>
               <div style={{ background: '#0f172a', padding: 20, borderRadius: 8, border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ fontSize: '32px', marginBottom: 12 }}>🗂️</div>
                 <strong style={{ color: '#eab308', fontSize: '1.1rem', marginBottom: 8, wordBreak: 'break-all' }}>חבילת_הגשה_דימה_רודניצקי_סופי_אלדד.zip</strong>
                 <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, flex: 1 }}>תיקיית נספחים מלאה (9 נספחים). מקור: source-docs הקנוני.</p>
                 <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                   <span>✓ ארוז ומוכן להגשה</span>
                 </div>
               </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
// #endregion
