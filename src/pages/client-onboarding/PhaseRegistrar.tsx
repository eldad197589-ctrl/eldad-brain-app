/* ============================================
// #region Module

   FILE: PhaseRegistrar.tsx
   PURPOSE: Registrar (רשם החברות / שותפויות / עמותות) Phase gate.
            Verifies regulatory documents exist before proceeding to Bank/Tax.
            Reuses: useKycChecklist (rc1, rc2, rc3, r2, rn1, etc.)
   DEPENDENCIES: ./hooks/useKycChecklist, react-router-dom
   EXPORTS: default
   ============================================ */

// #region Imports
import React, { useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ShieldAlert,
  Clock,
  PlayCircle
} from 'lucide-react';
import { useKycChecklist } from './hooks/useKycChecklist';
import type { EntityType } from './types';
// #endregion

// #region Component

const PhaseRegistrar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read client context
  const paramName = searchParams.get('name') || '';
  const paramEntity = (searchParams.get('entity') as EntityType) || 'exempt';
  const paramTransfer = searchParams.get('transfer') === 'true';

  // Reuse KYC checklist to monitor regulatory docs
  const { state, toggleDocStatus } = useKycChecklist({
    name: paramName,
    entityType: paramEntity,
    isTransfer: paramTransfer,
  });

  // Calculate phase readiness
  const readiness = useMemo(() => {
    let requiresRegistrar = false;
    let requiredDocIds: string[] = [];
    let title = 'רשם החברות והתאגידים';
    let desc = 'אימות מסמכי התאגדות תקינים מול רשם החברות/עמותות.';

    if (paramEntity === 'company') {
      requiresRegistrar = true;
      requiredDocIds = ['rc1', 'rc2', 'rc3']; // Incorporation, Nesach, By-laws
      title = 'רישום ברשם החברות';
      desc = 'אימות תעודת התאגדות, נסח חברה עדכני ותקנון בעלי מניות.';
    } else if (paramEntity === 'npo') {
      requiresRegistrar = true;
      requiredDocIds = ['rn1', 'rn2', 'rn3'];
      title = 'רישום ברשם העמותות';
    } else if (paramEntity === 'partnership') {
      requiresRegistrar = true;
      // r1 = מע"מ, r2 = שותפות (from useKycChecklist)
      requiredDocIds = ['r2'];
      title = 'אימות רשם השותפויות';
    }

    // Check statuses
    const relevantDocs = state.documents.filter(d => requiredDocIds.includes(d.id));
    const isReady = requiresRegistrar 
      ? relevantDocs.length > 0 && relevantDocs.every(d => d.status === 'verified' || d.status === 'uploaded')
      : true; // If not required, automatically ready

    return {
      requiresRegistrar,
      requiredDocIds,
      relevantDocs,
      title,
      desc,
      isReady
    };
  }, [state.documents, paramEntity]);

  const handleProceedToBank = useCallback(() => {
    if (!readiness.isReady) return;
    const params = new URLSearchParams({
      name: paramName || state.clientName,
      entity: paramEntity,
      transfer: String(paramTransfer),
    });
    // Assuming next is BankOnboardingPhase (route: /bank)
    navigate(`/bank?${params.toString()}`);
  }, [readiness.isReady, navigate, paramName, state.clientName, paramEntity, paramTransfer]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 relative overflow-hidden font-heebo" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(245,158,11,0.08)] to-transparent opacity-50 pointer-events-none rounded-full blur-[100px]" />

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 relative z-10">
        <button
          onClick={() => navigate(`/poa?${searchParams.toString()}`)}
          className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-4 text-sm font-medium"
        >
          <ArrowRight size={16} />
          חזרה לשלב ייפוי כוח
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center border border-[rgba(245,158,11,0.3)] text-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{readiness.title}</h1>
            <p className="text-[#94a3b8] font-medium mt-1">{readiness.desc}</p>
          </div>
        </div>
      </div>

      {/* Pipeline Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8 relative z-10">
        <div className="flex items-center gap-1 text-xs font-bold">
          {['Lead', 'Quote', 'Approval', 'KYC', 'PoA', 'Registrar', 'Bank', 'Tax', 'Activation'].map((step, i) => (
            <React.Fragment key={step}>
              <div
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  step === 'Registrar'
                    ? 'bg-[rgba(245,158,11,0.2)] border-[#f59e0b] text-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : i < 5
                      ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#10b981]'
                      : 'bg-[rgba(255,255,255,0.03)] border-[#334155] text-[#64748b]'
                }`}
              >
                {step}
              </div>
              {i < 8 && <div className={`w-4 h-[2px] ${i < 5 ? 'bg-[#10b981]' : 'bg-[#334155]'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Status Card */}
        <div className="bg-[#111827] border border-[#334155] rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldAlert size={20} className="text-[#f59e0b]" />
             בקרת מסמכי תאגיד
          </h2>

          {!readiness.requiresRegistrar ? (
            <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] rounded-xl p-6 text-center">
              <CheckCircle2 size={32} className="text-[#10b981] mx-auto mb-3" />
              <div className="text-[#10b981] font-bold">לא נדרש תהליך רשם</div>
              <p className="text-xs text-[#94a3b8] mt-2">
                לסוג ישות זה (עוסק פטור/מורשה) אין דרישת התאגדות ברשם החברות. ניתן לדלג לשלב פתיחת חשבון בנק.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {readiness.relevantDocs.map(doc => {
                const isVerified = doc.status === 'verified';
                const isUploaded = doc.status === 'uploaded';
                
                return (
                  <div 
                    key={doc.id}
                    onClick={() => toggleDocStatus(doc.id, isVerified || isUploaded ? 'pending' : 'verified')}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isVerified || isUploaded
                        ? 'bg-[rgba(16,185,129,0.05)] border-[#10b981] border-opacity-30'
                        : 'bg-[#0a0e1a] border-[#334155] hover:border-[#64748b]'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isVerified ? (
                        <CheckCircle2 size={18} className="text-[#10b981]" />
                      ) : isUploaded ? (
                        <Clock size={18} className="text-[#3b82f6]" />
                      ) : (
                        <AlertCircle size={18} className="text-[#f59e0b]" />
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isVerified || isUploaded ? 'text-[#10b981]' : 'text-white'}`}>
                        {doc.label}
                      </div>
                      {doc.description && <div className="text-xs text-[#94a3b8] mt-1">{doc.description}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="bg-[#111827] border border-[#334155] rounded-xl p-6 shadow-xl flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileCheck2 size={20} className="text-[#f59e0b]" />
            המשך תהליך
          </h2>

          <div className="bg-[rgba(56,189,248,0.05)] border border-[rgba(56,189,248,0.15)] rounded-xl p-4 mb-6 mt-auto">
            <h3 className="text-[#38bdf8] font-bold mb-1 text-sm">💡 הוספת ישות למערכת</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              שלב זה מוודא שיש לארגון קיום משפטי פורמלי לפני שפונים לבנקים או לרשויות המס. המסמכים יאומתו ויסתנכרנו אוטומטית מול אזור העלאת קבצים של הלקוח.
            </p>
          </div>

          <div>
            <button
              onClick={handleProceedToBank}
              disabled={!readiness.isReady}
              className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                readiness.isReady
                  ? 'bg-gradient-to-l from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#b45309] text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'bg-[rgba(255,255,255,0.05)] text-[#64748b] cursor-not-allowed border border-[#334155]'
              }`}
            >
              <ArrowLeft size={18} />
              {readiness.isReady 
                ? 'המשיכו לשלב אימות הבנק (Bank Onboarding)'
                : 'יש להשלים את כל מסמכי ההתאגדות'
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PhaseRegistrar;
export { PhaseRegistrar };
// #endregion
