/* ============================================
// #region Module

   FILE: PhasePoA.tsx
   PURPOSE: Power of Attorney (ייפוי כוח) Phase gate
            in the entity formation pipeline.
            Reuses: useKycChecklist (b6 status),
            pdfFormService (Form 2279 generation),
            documentRequirementsEngine (power_of_attorney entry).
   DEPENDENCIES: ./hooks/useKycChecklist, ../../services/pdfFormService,
                 ../../services/documentRequirementsEngine, react-router-dom
   EXPORTS: default
   ============================================ */

// #region Imports
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useKycChecklist } from './hooks/useKycChecklist';
import { generateForm2279, downloadBlob } from '../../services/pdfFormService';
import type { Form2279Data } from '../../services/pdfFormService';
import { DOC_CATALOG } from '../../services/documentRequirementsEngine';
import type { EntityType } from './types';
// #endregion

// #region Types

/** Props for PhasePoA — no external props needed, reads from URL params */
interface Props {}

/** PoA verification state derived from existing systems */
interface PoaVerificationState {
  /** b6 document status from KYC checklist */
  kycDocStatus: 'pending' | 'uploaded' | 'verified' | 'rejected';
  /** Whether PoA is in the document requirements catalog */
  inDocCatalog: boolean;
  /** Overall phase readiness */
  isPhaseComplete: boolean;
  /** Human-readable status label */
  statusLabel: string;
}

// #endregion

// #region Constants

const PHASE_TITLE = 'ייפוי כוח — שלב ייצוג';
const PHASE_DESCRIPTION = 'אימות חתימה על ייפוי כוח (טופס 2279) לצורך ייצוג הלקוח מול רשויות המס, רשם החברות, ובנקים.';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  verified: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2, label: 'אומת ✅' },
  uploaded: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Clock, label: 'הועלה — ממתין לאימות' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle, label: 'טרם הועלה' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle, label: 'נדחה — נדרש מסמך חדש' },
};

// #endregion

// #region Component

/**
 * PhasePoA — Power of Attorney phase gate.
 *
 * Pipeline position: Lead → Quote → Approval → Portal/KYC → **PoA** → Registrar → Bank → Tax → Activation
 *
 * Reuses existing engines:
 * - useKycChecklist: reads b6 (טופס 2279) document status
 * - pdfFormService: generates Form 2279 PDF
 * - documentRequirementsEngine: validates PoA is in the catalog
 *
 * Does NOT create new upload/checklist/tax engines.
 */
const PhasePoA: React.FC<Props> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [generating, setGenerating] = useState(false);

  // Read client context from URL params (passed from KYC/Onboarding)
  const paramName = searchParams.get('name') || '';
  const paramEntity = (searchParams.get('entity') as EntityType) || 'exempt';
  const paramTransfer = searchParams.get('transfer') === 'true';

  // Reuse KYC checklist — b6 = "טופס 2279 / ייפוי כוח לרשויות"
  const { state, toggleDocStatus } = useKycChecklist({
    name: paramName,
    entityType: paramEntity,
    isTransfer: paramTransfer,
  });

  // Derive verification state from existing system data — no detached state
  const verification = useMemo<PoaVerificationState>(() => {
    const b6Doc = state.documents.find(d => d.id === 'b6');
    const kycDocStatus = b6Doc?.status ?? 'pending';

    // Check if power_of_attorney exists in the document requirements catalog
    const inDocCatalog = DOC_CATALOG.some(entry => entry.key === 'power_of_attorney');

    const isPhaseComplete = kycDocStatus === 'verified';

    const statusLabel = STATUS_CONFIG[kycDocStatus]?.label ?? 'לא ידוע';

    return { kycDocStatus, inDocCatalog, isPhaseComplete, statusLabel };
  }, [state.documents]);

  /** Mark b6 as verified (connects to existing KYC state) */
  const handleVerify = useCallback(() => {
    toggleDocStatus('b6', 'verified');
  }, [toggleDocStatus]);

  /** Reset b6 to pending */
  const handleReset = useCallback(() => {
    toggleDocStatus('b6', 'pending');
  }, [toggleDocStatus]);

  /** Generate Form 2279 PDF — reuses existing pdfFormService */
  const handleGeneratePdf = useCallback(async () => {
    setGenerating(true);
    try {
      const formData: Form2279Data = {
        clientName: paramName || state.clientName,
        idNumber: '',
        representativeType: 'primary',
      };
      const blob = await generateForm2279(formData);
      downloadBlob(blob, `ייפוי_כוח_${formData.clientName || 'לקוח'}.pdf`);
    } catch (err) {
      console.error('[PhasePoA] PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [paramName, state.clientName]);

  /** Navigate to next phase — only if PoA is verified */
  const handleProceedToRegistrar = useCallback(() => {
    if (!verification.isPhaseComplete) return;
    const params = new URLSearchParams({
      name: paramName || state.clientName,
      entity: paramEntity,
      transfer: String(paramTransfer),
    });
    navigate(`/registrar?${params.toString()}`);
  }, [verification.isPhaseComplete, navigate, paramName, state.clientName, paramEntity, paramTransfer]);

  const statusConfig = STATUS_CONFIG[verification.kycDocStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 relative overflow-hidden font-heebo" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(139,92,246,0.08)] to-transparent opacity-50 pointer-events-none rounded-full blur-[100px]" />

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 relative z-10">
        <button
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-4 text-sm font-medium"
        >
          <ArrowRight size={16} />
          חזרה לקליטת לקוח (KYC)
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center border border-[rgba(139,92,246,0.3)] text-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <FileSignature size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{PHASE_TITLE}</h1>
            <p className="text-[#94a3b8] font-medium mt-1">{PHASE_DESCRIPTION}</p>
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
                  step === 'PoA'
                    ? 'bg-[rgba(139,92,246,0.2)] border-[#8b5cf6] text-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                    : i < 4
                      ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#10b981]'
                      : 'bg-[rgba(255,255,255,0.03)] border-[#334155] text-[#64748b]'
                }`}
              >
                {step}
              </div>
              {i < 8 && <div className={`w-4 h-[2px] ${i < 4 ? 'bg-[#10b981]' : 'bg-[#334155]'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Status Card */}
        <div className="bg-[#111827] border border-[#334155] rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#8b5cf6]" />
            סטטוס ייפוי כוח
          </h2>

          {/* Status Badge */}
          <div
            className="flex items-center gap-3 p-4 rounded-xl border mb-6"
            style={{ backgroundColor: statusConfig.bg, borderColor: statusConfig.color + '40' }}
          >
            <StatusIcon size={24} style={{ color: statusConfig.color }} />
            <div>
              <div className="text-sm font-bold" style={{ color: statusConfig.color }}>
                {verification.statusLabel}
              </div>
              <div className="text-xs text-[#94a3b8] mt-0.5">
                מסמך b6 — טופס 2279 / ייפוי כוח לרשויות
              </div>
            </div>
          </div>

          {/* Evidence Connection */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8]">KYC Checklist (b6)</span>
              <span className={`font-bold ${verification.kycDocStatus === 'verified' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                {verification.kycDocStatus}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8]">Document Catalog</span>
              <span className={`font-bold ${verification.inDocCatalog ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {verification.inDocCatalog ? 'registered ✓' : 'missing ✗'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8]">לקוח</span>
              <span className="font-bold text-white">{paramName || state.clientName || '—'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {verification.kycDocStatus !== 'verified' ? (
              <button
                onClick={handleVerify}
                className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                אמת ייפוי כוח — Mark as Verified
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94a3b8] rounded-xl font-medium transition-colors text-sm border border-[rgba(255,255,255,0.1)]"
              >
                בטל אימות (החזר ל-pending)
              </button>
            )}
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-[#111827] border border-[#334155] rounded-xl p-6 shadow-xl flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileSignature size={20} className="text-[#8b5cf6]" />
            כלים ומעבר לשלב הבא
          </h2>

          {/* PDF Generator */}
          <div className="bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)] rounded-xl p-4 mb-6">
            <h3 className="text-[#8b5cf6] font-bold mb-2 text-sm">📄 הפק טופס 2279 (ייפוי כוח)</h3>
            <p className="text-xs text-[#94a3b8] mb-3">
              מנוע הפקת ה-PDF הקיים ימלא את הטופס עם פרטי הלקוח ויוצר קובץ מוכן לחתימה.
            </p>
            <button
              onClick={handleGeneratePdf}
              disabled={generating}
              className="w-full py-2.5 bg-[rgba(139,92,246,0.15)] hover:bg-[rgba(139,92,246,0.25)] text-[#8b5cf6] rounded-lg font-bold transition-colors text-sm border border-[rgba(139,92,246,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={16} />
              {generating ? '⏳ מייצר PDF...' : 'הפק ייפוי כוח PDF'}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-[rgba(56,189,248,0.05)] border border-[rgba(56,189,248,0.15)] rounded-xl p-4 mb-6">
            <h3 className="text-[#38bdf8] font-bold mb-1 text-sm">💡 חיבור למערכת</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              סטטוס ייפוי הכוח נקרא ישירות מ-KYC Checklist (מסמך b6) וממנוע דרישת המסמכים (power_of_attorney).
              שינוי הסטטוס כאן משפיע על כל המערכת — בלי state נפרד.
            </p>
          </div>

          {/* Next Phase Button */}
          <div className="mt-auto">
            <button
              onClick={handleProceedToRegistrar}
              disabled={!verification.isPhaseComplete}
              className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                verification.isPhaseComplete
                  ? 'bg-gradient-to-l from-[#8b5cf6] to-[#6d28d9] hover:from-[#7c3aed] hover:to-[#5b21b6] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                  : 'bg-[rgba(255,255,255,0.05)] text-[#64748b] cursor-not-allowed border border-[#334155]'
              }`}
            >
              <ArrowLeft size={18} />
              {verification.isPhaseComplete
                ? 'המשך לשלב הבא — רישום ברשם החברות (Registrar)'
                : 'נדרש אימות ייפוי כוח לפני מעבר'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// #endregion

export default PhasePoA;
