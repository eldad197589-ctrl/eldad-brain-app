/* ============================================
// #region Module

   FILE: ClientDetailsForm.tsx
   PURPOSE: Form for inputting basic client onboarding details
   DEPENDENCIES: ../types
   EXPORTS: ClientDetailsForm
   ============================================ */

import React from 'react';
import { EntityType } from '../types';
import { Building2, UserCircle, SwitchCamera } from 'lucide-react';

interface Props {
  clientName: string;
  entityType: EntityType;
  isTransfer: boolean;
  onUpdate: (name: string, type: EntityType, transfer: boolean) => void;
}

export const ClientDetailsForm: React.FC<Props> = ({
  clientName,
  entityType,
  isTransfer,
  onUpdate
}) => {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[rgba(56,189,248,0.1)] to-transparent rounded-full blur-2xl pointer-events-none" />
      
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <UserCircle className="text-[#38bdf8]" /> פרטי הלקוח הנקלט
      </h2>

      <div className="space-y-5 relative z-10">
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-1">שם הלקוח / חברה</label>
          <input
            type="text"
            className="w-full bg-[#0a0e1a] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#38bdf8] transition-colors"
            placeholder="לדוגמה: אלפא טכנולוגיות בע״מ"
            value={clientName}
            onChange={(e) => onUpdate(e.target.value, entityType, isTransfer)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-1 flex items-center gap-2">
            <Building2 size={16} /> סוג התאגדות רשמית
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {[
              { id: 'exempt', label: 'עוסק פטור' },
              { id: 'authorized', label: 'עוסק מורשה' },
              { id: 'partnership', label: 'שותפות (רשומה/לא רשומה)' },
              { id: 'company', label: 'חברה בע״מ' },
              { id: 'npo', label: 'עמותה / מלכ״ר' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => onUpdate(clientName, type.id as EntityType, isTransfer)}
                className={`py-2 px-3 text-sm rounded-lg border transition-all text-center ${
                  entityType === type.id
                    ? 'bg-[rgba(56,189,248,0.15)] border-[#38bdf8] text-[#38bdf8] font-bold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'bg-[#0a0e1a] border-[#334155] text-[#94a3b8] hover:border-[#64748b]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#334155]">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-12 h-6 rounded-full transition-colors relative ${isTransfer ? 'bg-[#38bdf8]' : 'bg-[#334155]'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isTransfer ? 'left-1' : 'left-7'}`} />
            </div>
            <span className="text-sm font-medium text-[#e2e8f0] flex items-center gap-2">
              <SwitchCamera size={16} className={isTransfer ? 'text-[#38bdf8]' : 'text-[#64748b]'} />
              מעבר ממייצג קודם (רו״ח / יועץ מס אחר)
            </span>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={isTransfer} 
              onChange={(e) => onUpdate(clientName, entityType, e.target.checked)} 
            />
          </label>
          {isTransfer && (
            <p className="text-xs text-[#38bdf8] mt-2 bg-[rgba(56,189,248,0.05)] p-2 rounded border border-[rgba(56,189,248,0.1)]">
              המערכת תוסיף דרישה למכתב שחרור ודוחות כספיים קודמים אוטומטית.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
// #endregion
