/* ============================================
// #region Module

   FILE: SecureUploadArea.tsx
   PURPOSE: Client-facing document upload area that REUSES the existing
            useKycChecklist logic from the onboarding module.
   DEPENDENCIES: react, lucide-react, ../../client-onboarding/types, ../../client-onboarding/hooks/useKycChecklist
   EXPORTS: SecureUploadArea
   ============================================ */

import React from 'react';
import { Upload, CheckCircle2, Clock, ShieldAlert, SwitchCamera } from 'lucide-react';
import { DocumentItem, EntityType } from '../../client-onboarding/types';
import { useKycChecklist } from '../../client-onboarding/hooks/useKycChecklist';

// #region Component

interface Props {
  clientName: string;
  entityType: EntityType;
  isTransfer: boolean;
}

/**
 * Client-facing secure upload area.
 * Uses the SAME document computation logic as the internal KYC wizard (useKycChecklist).
 */
export const SecureUploadArea: React.FC<Props> = ({ clientName, entityType, isTransfer }) => {
  const { state, updateClientInfo, toggleDocStatus } = useKycChecklist();

  // Sync the external props into the hook on first render
  React.useEffect(() => {
    updateClientInfo(clientName, entityType, isTransfer);
  }, [clientName, entityType, isTransfer]);

  const documents = state.documents;

  const getProgress = () => {
    if (documents.length === 0) return 0;
    const done = documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
    return Math.round((done / documents.length) * 100);
  };

  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toggleDocStatus(docId, 'uploaded');
    }
  };

  const progress = getProgress();

  // Group by category for clear visual separation
  const categories = [
    { id: 'permanent', label: 'תיק קבע (חובה לכל לקוח)', color: '#e2e8f0' },
    { id: 'regulatory', label: 'מסמכים רגולטוריים (לפי סוג התאגדות)', color: '#f59e0b' },
    { id: 'transfer', label: 'מעבר ממייצג קודם', color: '#38bdf8' },
  ];

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#1e293b]">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-[#3b82f6]" />
            אזור העלאה מאובטח (KYC)
          </h2>
          <p className="text-[#94a3b8] mt-1 text-sm">
            רשימת המסמכים הורכבה אוטומטית על ידי המוח של אלדד בהתאם לסוג ההתאגדות שלך.
          </p>
          {isTransfer && (
            <div className="flex items-center gap-2 mt-2 text-xs text-[#38bdf8] bg-[rgba(56,189,248,0.05)] border border-[rgba(56,189,248,0.15)] px-3 py-1.5 rounded-lg w-fit">
              <SwitchCamera size={14} />
              מעבר ממייצג קודם — נוספו דרישות שחרור ודוחות כספיים
            </div>
          )}
        </div>
        {/* Progress */}
        <div className="flex flex-col items-center">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-[#1e293b]" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent"
                strokeDasharray="150" strokeDashoffset={150 - (150 * progress) / 100}
                className={progress === 100 ? "text-[#10b981] transition-all duration-1000" : "text-[#3b82f6] transition-all duration-1000"} />
            </svg>
            <span className="absolute text-xs font-bold text-white">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Document List — Grouped by Category */}
      <div className="space-y-6">
        {categories.map(cat => {
          const catDocs = documents.filter(d => d.category === cat.id);
          if (catDocs.length === 0) return null;
          return (
            <div key={cat.id}>
              <h3 className="font-bold text-sm mb-3 border-b border-[rgba(255,255,255,0.05)] pb-1 inline-block"
                style={{ color: cat.color }}>
                {cat.label}
              </h3>
              <div className="space-y-2">
                {catDocs.map(doc => (
                  <DocRow key={doc.id} doc={doc} onUpload={handleFileUpload} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {progress === 100 && (
        <div className="mt-6 p-4 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center gap-3 text-[#10b981]">
          <CheckCircle2 size={22} />
          <strong>תודה! כל המסמכים נקלטו ויועברו לבדיקת רואה החשבון.</strong>
        </div>
      )}
    </div>
  );
};

// #endregion

// #region DocRow

function DocRow({ doc, onUpload }: { doc: DocumentItem; onUpload: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const isDone = doc.status === 'uploaded' || doc.status === 'verified';
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
      isDone ? 'bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.3)]' : 'bg-[#1e293b] border-transparent hover:border-[#334155]'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isDone ? 'bg-[#10b981] text-white' : 'bg-[#0f172a] text-[#64748b]'
        }`}>
          {isDone ? <CheckCircle2 size={16} /> : <Clock size={16} />}
        </div>
        <div>
          <h4 className={`font-bold text-sm ${isDone ? 'text-[#10b981]' : 'text-white'}`}>{doc.label}</h4>
          {doc.description && <p className="text-xs text-[#94a3b8]">{doc.description}</p>}
        </div>
      </div>
      <div>
        {isDone ? (
          <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-lg border border-[#10b981]/20">✓ התקבל</span>
        ) : (
          <label className="cursor-pointer bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
            <Upload size={14} /> העלאת קובץ
            <input type="file" className="hidden" onChange={(e) => onUpload(doc.id, e)} accept="image/*,.pdf,.doc,.docx" />
          </label>
        )}
      </div>
    </div>
  );
}

// #endregion
