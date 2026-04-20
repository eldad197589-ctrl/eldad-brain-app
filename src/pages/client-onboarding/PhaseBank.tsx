/* ============================================
// #region Module

   FILE: PhaseBank.tsx
   PURPOSE: Generic Bank Onboarding Phase.
            Allows selecting a bank, viewing verified registrar/KYC docs,
            and providing bank-specific forms. Supports a robust manual 
            override if the bank template is partial or not loaded.
   DEPENDENCIES: ./hooks/useKycChecklist, ./data/bankRegistry, react-router-dom
   EXPORTS: default
   ============================================ */

// #region Imports
import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Lock,
} from 'lucide-react';
import { useKycChecklist } from './hooks/useKycChecklist';
import { BANK_REGISTRY } from './data/bankRegistry';
import type { EntityType } from './types';
// #endregion

// #region Types

type BankReadyCondition = 
  | 'pending'
  | 'bank_opened_verified_by_evidence'
  | 'bank_phase_completed_by_manual_override_with_evidence';

interface ManualOverrideData {
  supportingDocumentRequired: string; // The ID of the document (should be b3)
  approvedBy: string;
  approvedAt: string;
  overrideReason: string;
}

// #endregion

// #region Component

const PhaseBank: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL context
  const paramName = searchParams.get('name') || '';
  const paramEntity = (searchParams.get('entity') as EntityType) || 'exempt';
  const paramTransfer = searchParams.get('transfer') === 'true';

  const { state, toggleDocStatus } = useKycChecklist({
    name: paramName,
    entityType: paramEntity,
    isTransfer: paramTransfer,
  });

  // Local State
  const [selectedBankId, setSelectedBankId] = useState<string>('mercantile');
  const [overrideData, setOverrideData] = useState<Partial<ManualOverrideData>>({
    supportingDocumentRequired: 'b3',
    approvedBy: '',
    overrideReason: '',
  });
  
  // What is the current condition of the phase?
  const [readyCondition, setReadyCondition] = useState<BankReadyCondition>('pending');

  const selectedBank = BANK_REGISTRY[selectedBankId];

  // Derive foundation docs from existing KYC state
  const foundationDocs = useMemo(() => {
    let requiredDocIds: string[] = ['b1', 'b6']; // ID card, PoA

    if (paramEntity === 'company') {
      requiredDocIds.push('rc1', 'rc2', 'rc3');
    } else if (paramEntity === 'npo') {
      requiredDocIds.push('rn1', 'rn2', 'rn3');
    } else if (paramEntity === 'partnership') {
      requiredDocIds.push('r2');
    }

    return state.documents.filter(d => requiredDocIds.includes(d.id));
  }, [state.documents, paramEntity]);

  const b3Doc = state.documents.find(d => d.id === 'b3');
  const hasB3FallbackEvidence = b3Doc?.status === 'verified' || b3Doc?.status === 'uploaded';

  // Bank Evidence consists of either fulfilling ALL bank-specific required docs (if known)
  // OR having the fallback b3 account verification document.
  const hasBankEvidence = useMemo(() => {
    if (selectedBank.templateStatus === 'VERIFIED' || selectedBank.templateStatus === 'PARTIAL') {
      const bankDocsOk = selectedBank.requiredBankSpecificDocuments.every(reqDoc => {
        const found = state.documents.find(d => d.id === reqDoc.id);
        return found?.status === 'verified' || found?.status === 'uploaded';
      });
      if (bankDocsOk && selectedBank.requiredBankSpecificDocuments.length > 0) return true;
    }
    return hasB3FallbackEvidence;
  }, [selectedBank, state.documents, hasB3FallbackEvidence]);

  // Manual Override Handler
  const handleManualOverride = useCallback(() => {
    if (!hasBankEvidence) {
      alert('שגיאה: לא ניתן לבצע עקיפה ללא הוכחה. נדרש "אישור ניהול חשבון" או מסמך הרשמה ספציפי מאומת.');
      return;
    }
    
    if (overrideData.approvedBy && overrideData.overrideReason) {
      setReadyCondition('bank_phase_completed_by_manual_override_with_evidence');
      // Update overrideData with timestamp
      setOverrideData(prev => ({
        ...prev,
        approvedAt: new Date().toISOString()
      }));
    } else {
      alert('יש להזין איש מאשר וסיבת החסימה.');
    }
  }, [hasBankEvidence, overrideData]);

  // Standard Success Handler
  const handleVerifyBankOpened = useCallback(() => {
    if (hasBankEvidence) {
      setReadyCondition('bank_opened_verified_by_evidence');
    }
  }, [hasBankEvidence]);

  const handleProceedToTax = useCallback(() => {
    if (readyCondition === 'pending') return;
    const params = new URLSearchParams({
      name: paramName || state.clientName,
      entity: paramEntity,
      transfer: String(paramTransfer),
    });
    // Next phase is Tax Onboarding (Institutional Reports flow)
    navigate(`/flow/institutional-reports?${params.toString()}`);
  }, [readyCondition, navigate, paramName, state.clientName, paramEntity, paramTransfer]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 relative overflow-hidden font-heebo" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(14,165,233,0.08)] to-transparent opacity-50 pointer-events-none rounded-full blur-[100px]" />

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 relative z-10">
        <button
          onClick={() => navigate(`/registrar?${searchParams.toString()}`)}
          className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-4 text-sm font-medium"
        >
          <ArrowRight size={16} />
          חזרה לבקרת רשם (Registrar)
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(14,165,233,0.1)] flex items-center justify-center border border-[rgba(14,165,233,0.3)] text-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.15)]">
            <Building size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">פתיחת או הוספת חשבון בנק</h1>
            <p className="text-[#94a3b8] font-medium mt-1">Generic Bank Onboarding — איסוף ואימות מסמכים בנקאיים</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Side: Setup & Evidence */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Bank Selection */}
          <div className="bg-[#111827] border border-[#334155] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">בחירת בנק תאגידי</h2>
            <select
              className="w-full bg-[#0a0e1a] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#0ea5e9] transition-colors"
              value={selectedBankId}
              onChange={(e) => {
                setSelectedBankId(e.target.value);
                setReadyCondition('pending');
              }}
            >
              {Object.values(BANK_REGISTRY).map(bank => (
                <option key={bank.bankId} value={bank.bankId}>
                  {bank.bankName} — Template: {bank.templateStatus}
                </option>
              ))}
            </select>
            
            <div className="mt-4 text-sm text-[#94a3b8] p-4 bg-[rgba(255,255,255,0.03)] border border-[#334155] rounded-lg">
              {selectedBank.notes || 'אין הערות ייעודיות לבנק זה.'}
            </div>
          </div>

          {/* Foundation Evidence (Reused) */}
          <div className="bg-[#111827] border border-[#334155] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
              <span>מסמכי ליבה מחייבים (Reused from KYC)</span>
              <span className="text-xs px-2 py-1 bg-[rgba(16,185,129,0.1)] text-[#10b981] rounded-full border border-[rgba(16,185,129,0.2)]">Auto-Synced</span>
            </h2>
            <p className="text-xs text-[#64748b] mb-4">מסמכים אלו הגיעו אוטומטית משלבים קודמים ולא ידרשו העלאה כפולה לצד הבנק.</p>
            
            <div className="space-y-2">
              {foundationDocs.map(doc => {
                const isOk = doc.status === 'verified' || doc.status === 'uploaded';
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#334155] bg-[#0a0e1a]">
                    {isOk ? <CheckCircle2 size={16} className="text-[#10b981]" /> : <AlertCircle size={16} className="text-[#f59e0b]" />}
                    <span className={`text-sm ${isOk ? 'text-[#e2e8f0]' : 'text-[#94a3b8]'}`}>{doc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bank Specific (Template Based) */}
          <div className="bg-[#111827] border border-[#334155] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">מסמכים ייעודיים לבנק: {selectedBank.bankName}</h2>
            
            {selectedBank.templateStatus === 'NOT_LOADED' ? (
              <div className="text-center p-6 border border-dashed border-[#334155] rounded-xl">
                <AlertCircle size={24} className="text-[#64748b] mx-auto mb-2" />
                <div className="text-[#94a3b8] text-sm">אין תבנית מסמכים ציבורית משויכת לבנק זה.</div>
                <div className="text-xs text-[#64748b] mt-1">יש להשתמש במסלול אישור ידני (Manual Route) לפתיחה.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBank.requiredBankSpecificDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(14,165,233,0.3)] bg-[rgba(14,165,233,0.05)]">
                    <FileText size={18} className="text-[#0ea5e9]" />
                    <div>
                      <div className="text-sm font-bold text-[#e2e8f0]">{doc.name}</div>
                      {doc.description && <div className="text-xs text-[#94a3b8]">{doc.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Manual Override & Next Phase */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Main Phase Status & Evidence Resolution */}
          <div className={`bg-[#111827] border rounded-xl p-6 shadow-xl transition-all ${
            readyCondition !== 'pending' ? 'border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[#334155]'
          }`}>
            <h2 className="text-lg font-bold text-white mb-4">מצב דרישות ומוכנות חשבון</h2>
            
            <div className="mb-6 p-4 rounded-xl border border-[#334155] bg-[#0a0e1a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">ראיית סמך מרכזית לפתיחה</span>
                {hasBankEvidence ? (
                  <span className="text-xs px-2 py-1 bg-[rgba(16,185,129,0.1)] text-[#10b981] rounded border border-[#10b981] font-bold">הוכחה קיימת</span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b] rounded border border-[#f59e0b] font-bold">חסר עדות</span>
                )}
              </div>
              <div className="text-sm text-[#94a3b8]">
                הוכחת פעילות: אישור ניהול חשבון בנק (b3) או השלמת מסמכי התבנית במלואם.
              </div>
            </div>

            {/* Success display */}
            {readyCondition !== 'pending' && (
              <div className="p-4 bg-[rgba(16,185,129,0.1)] border border-[#10b981] rounded-lg mb-6">
                <div className="flex items-center gap-2 text-[#10b981] font-bold mb-1">
                  <CheckCircle2 size={18} /> אושר לפעילות
                </div>
                <div className="text-xs text-[#10b981] font-mono break-all">
                  CONDITION: {readyCondition}
                </div>
              </div>
            )}

            {/* Resolution Buttons */}
            {readyCondition === 'pending' && (
              <div className="space-y-3">
                <button
                  onClick={handleVerifyBankOpened}
                  disabled={!hasBankEvidence}
                  className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#1e293b] disabled:text-[#64748b] text-white rounded-xl font-bold transition-colors"
                >
                  אשר פתיחת חשבון רשמית (Verified by Evidence)
                </button>
              </div>
            )}
          </div>

          {/* Manual Completion Path (Only active if not already successful) */}
          {readyCondition === 'pending' && (
            <div className="bg-[#111827] border border-[#ef4444] border-opacity-30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 border-t-[40px] border-l-[40px] border-t-[#ef4444] border-l-transparent border-opacity-20 flex justify-end items-start p-1 text-[#ef4444]">
                <Lock size={14} className="mt-[-35px] mr-[-5px]" />
              </div>
              
              <h3 className="text-[#ef4444] font-bold mb-3 flex items-center gap-2">
                Manual Override Path
              </h3>
              <p className="text-xs text-[#94a3b8] mb-4">
                השתמש רק אם הבנק חסר Template חלקי, אך יש מסמך מזהה שמוכיח פתיחה (`b3`).
              </p>
              
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#64748b] block mb-1">Supporting Doc ID</label>
                  <input readOnly value={overrideData.supportingDocumentRequired} className="w-full bg-[#0a0e1a] border border-[#334155] rounded px-3 py-2 text-sm text-[#e2e8f0]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#64748b] block mb-1">Approved By (Required)</label>
                  <input 
                    value={overrideData.approvedBy} 
                    onChange={e => setOverrideData(prev => ({...prev, approvedBy: e.target.value}))} 
                    className="w-full bg-[#0a0e1a] border border-[#334155] focus:border-[#ef4444] rounded px-3 py-2 text-sm text-white focus:outline-none" 
                    placeholder="שם המאשר (לדוגמה: אלדד)"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#64748b] block mb-1">Reason (Required)</label>
                  <input 
                    value={overrideData.overrideReason} 
                    onChange={e => setOverrideData(prev => ({...prev, overrideReason: e.target.value}))} 
                    className="w-full bg-[#0a0e1a] border border-[#334155] focus:border-[#ef4444] rounded px-3 py-2 text-sm text-white focus:outline-none" 
                    placeholder="לדוגמה: אושר בטלפון ישירות מול פקידת הבנק"
                  />
                </div>
              </div>

              <button
                onClick={handleManualOverride}
                disabled={!hasBankEvidence || !overrideData.approvedBy || !overrideData.overrideReason}
                className="w-full py-2.5 bg-transparent border border-[#ef4444] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] rounded-lg font-bold transition-colors text-sm disabled:opacity-50"
              >
                החל Override (עם הוכחה)
              </button>
            </div>
          )}

          {/* Next Phase */}
          <div className="mt-auto pt-6">
            <button
              onClick={handleProceedToTax}
              disabled={readyCondition === 'pending'}
              className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                readyCondition !== 'pending'
                  ? 'bg-gradient-to-l from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#047857] text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-[rgba(255,255,255,0.05)] text-[#64748b] cursor-not-allowed border border-[#334155]'
              }`}
            >
              <ArrowLeft size={18} />
              {readyCondition !== 'pending'
                ? 'המשך לשלב רישום במס (Tax/VAT)'
                : 'נדרש אישור חשבון (b3) במערכת'
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PhaseBank;
// #endregion
