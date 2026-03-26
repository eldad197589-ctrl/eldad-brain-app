/* ============================================
// #region Module

   FILE: ClientDetailsForm.tsx
   PURPOSE: Form for inputting client and quote details
   DEPENDENCIES: ../types
   EXPORTS: ClientDetailsForm
   ============================================ */

import React from 'react';
import { ClientType, ServiceItem } from '../types';

interface Props {
  clientName: string;
  clientType: ClientType;
  additionalServices: ServiceItem[];
  onUpdateClient: (name: string, type: ClientType) => void;
  onToggleService: (service: ServiceItem) => void;
}

const AVAILABLE_SERVICES: ServiceItem[] = [
  { id: 'cap_statement_new', name: 'הצהרת הון (ראשונה)', description: 'הפקת הצהרת הון ראשונה כולל מאזן', price: 2000, isMonthly: false },
  { id: 'cap_statement_exist', name: 'הצהרת הון (חוזרת)', description: 'הפקת הצהרת הון חוזרת לאור השוואת הון קודמת', price: 1500, isMonthly: false },
  { id: 'business_plan', name: 'תוכנית עסקית אסטרטגית', description: 'מודל עסקי, ניתוח מתחרים ותמחור דינמי', price: 3500, isMonthly: false },
  { id: 'hour_consult', name: 'פגישת ייעוץ שעמ', description: 'שעת ייעוץ עסקי / מס', price: 450, isMonthly: false },
];

export const ClientDetailsForm: React.FC<Props> = ({
  clientName,
  clientType,
  additionalServices,
  onUpdateClient,
  onToggleService
}) => {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-6 shadow-xl">
      <h2 className="text-xl font-bold bg-gradient-to-l from-white to-[#94a3b8] bg-clip-text text-transparent mb-6">
        פרטי לקוח
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-1">שם הלקוח / תאגיד</label>
          <input
            type="text"
            className="w-full bg-[#0a0e1a] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#10b981] transition-colors"
            placeholder="לדוגמה: רוביום בע״מ"
            value={clientName}
            onChange={(e) => onUpdateClient(e.target.value, clientType)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-1">סיווג הלקוח (מודל עבודה ולוגיקת תמחור)</label>
          <select
            className="w-full bg-[#0a0e1a] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#10b981] transition-colors appearance-none"
            value={clientType}
            onChange={(e) => onUpdateClient(clientName, e.target.value as ClientType)}
          >
            <option value="exempt">עוסק פטור (מחזור נמוך)</option>
            <option value="authorized_small">עוסק מורשה (קטן - עד 25 חשבוניות)</option>
            <option value="authorized_medium">עוסק מורשה (בינוני - 25-100 חשבוניות)</option>
            <option value="company">חברה בע״מ / עמותה (גדול)</option>
            <option value="employee">שכיר / פנסיונר (החזרי מס - עמלת הצלחה)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-[#334155]">
          <h3 className="text-sm font-medium text-[#94a3b8] mb-3">שירותים נוספים (Add-ons)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_SERVICES.map(service => {
              const isSelected = additionalServices.some(s => s.id === service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => onToggleService(service)}
                  className={`flex flex-col text-right p-3 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-[rgba(16,185,129,0.1)] border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-[#0a0e1a] border-[#334155] hover:border-[#64748b]'
                  }`}
                >
                  <div className="flex justify-between items-start w-full mb-1">
                    <span className={`font-medium ${isSelected ? 'text-[#10b981]' : 'text-white'}`}>
                      {service.name}
                    </span>
                    <span className="text-sm font-bold text-[#f59e0b]">
                      ₪{service.price}
                    </span>
                  </div>
                  <span className="text-xs text-[#94a3b8]">{service.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
// #endregion
