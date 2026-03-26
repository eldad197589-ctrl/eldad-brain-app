/* ============================================
// #region Module

   FILE: DocumentChecklist.tsx
   PURPOSE: Interactive checklist for KYC documents
   DEPENDENCIES: ../types
   EXPORTS: DocumentChecklist
   ============================================ */

import React from 'react';
import { DocumentItem } from '../types';
import { CheckCircle2, Circle, FileCheck2, Upload } from 'lucide-react';

interface Props {
  documents: DocumentItem[];
  onToggleStatus: (id: string, status: DocumentItem['status']) => void;
}

export const DocumentChecklist: React.FC<Props> = ({
  documents,
  onToggleStatus
}) => {
  // Group documents by category
  const categories = [
    { id: 'permanent', label: 'תיק קבע (חובה לכל לקוח)', color: 'text-white' },
    { id: 'regulatory', label: 'מסמכים רגולטוריים (לפי סיווג התאגדות)', color: 'text-[#f59e0b]' },
    { id: 'transfer', label: 'מעבר ממייצג קודם (Transfer)', color: 'text-[#38bdf8]' }
  ];

  const getPercentage = () => {
    if (documents.length === 0) return 0;
    const completed = documents.filter(d => d.status === 'verified' || d.status === 'uploaded').length;
    return Math.round((completed / documents.length) * 100);
  };

  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex justify-between items-end mb-6 border-b border-[#334155] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="text-[#10b981]" /> צ׳קליסט איסוף מסמכים (KYC)
          </h2>
          <p className="text-sm text-[#94a3b8] mt-1">
            הרשימה הינה דינמית והורכבה לפי חוקי קליטת הלקוח במוח של אלדד.
          </p>
        </div>
        
        {/* Progress Circle */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-[#10b981]">{getPercentage()}%</div>
            <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider">השלמה</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {categories.map(cat => {
          const catDocs = documents.filter(d => d.category === cat.id);
          if (catDocs.length === 0) return null;

          return (
            <div key={cat.id}>
              <h3 className={`font-bold text-sm mb-3 ${cat.color} border-b border-[rgba(255,255,255,0.05)] pb-1 inline-block`}>
                {cat.label}
              </h3>
              <div className="space-y-2">
                {catDocs.map(doc => {
                  const isDone = doc.status === 'verified' || doc.status === 'uploaded';
                  const isAutoUploaded = doc.status === 'uploaded';
                  return (
                    <div 
                      key={doc.id}
                      onClick={() => onToggleStatus(doc.id, isDone ? 'pending' : 'verified')}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isDone 
                          ? isAutoUploaded
                            ? 'bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.3)]'
                            : 'bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.3)]' 
                          : 'bg-[#0a0e1a] border-[#334155] hover:border-[#64748b]'
                      }`}
                    >
                      <button className="mt-0.5 flex-shrink-0 focus:outline-none">
                        {isDone 
                          ? isAutoUploaded
                            ? <Upload size={18} className="text-[#3b82f6]" />
                            : <CheckCircle2 size={18} className="text-[#10b981]" />
                          : <Circle size={18} className="text-[#64748b]" />
                        }
                      </button>
                      <div>
                        <div className={`text-sm font-medium transition-colors ${isDone ? 'text-[#e2e8f0]' : 'text-white'}`}>
                          {doc.label}
                          {isAutoUploaded && <span className="text-[10px] text-[#3b82f6] mr-2">🤖 זוהה אוטומטית</span>}
                        </div>
                        {doc.description && (
                          <div className={`text-xs mt-0.5 ${isDone ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
                            {doc.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {getPercentage() === 100 && (
        <div className="mt-6 bg-[rgba(16,185,129,0.1)] border border-[#10b981] rounded-lg p-3 text-center animate-in flex items-center justify-center gap-2">
          <CheckCircle2 className="text-[#10b981]" size={18} />
          <span className="text-[#10b981] font-bold text-sm">תיק הלקוח מוכן לקליטה ברוביום!</span>
        </div>
      )}
    </div>
  );
};
// #endregion
