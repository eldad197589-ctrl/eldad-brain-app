/* ============================================
// #region Module

   FILE: PricingManagerPage.tsx
   PURPOSE: Full dashboard for the CEO to manage ALL Smart Bareau pricing.
   DEPENDENCIES: react, react-router-dom, lucide-react, pricingService
   EXPORTS: default
   ============================================ */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Settings, Save, CheckCircle2, Clock, Briefcase, Calculator } from 'lucide-react';
import { getPricingMatrix, savePricingMatrix, SmartBareauPricing, ClientTypeKey } from '../quotes-generator/services/pricingService';

// #region Component

const PricingManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [matrix, setMatrix] = useState<SmartBareauPricing | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { setMatrix(getPricingMatrix()); }, []);

  const handleSave = () => {
    if (matrix) {
      savePricingMatrix(matrix);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const updateRetainer = (type: ClientTypeKey, field: string, value: string) => {
    if (!matrix) return;
    setMatrix({
      ...matrix,
      retainers: {
        ...matrix.retainers,
        [type]: { ...matrix.retainers[type], [field]: parseInt(value) || 0 }
      }
    });
  };

  const updateHourly = (idx: number, value: string) => {
    if (!matrix) return;
    const updated = [...matrix.hourlyRates];
    updated[idx] = { ...updated[idx], pricePerHour: parseInt(value) || 0 };
    setMatrix({ ...matrix, hourlyRates: updated });
  };

  const updateService = (idx: number, value: string) => {
    if (!matrix) return;
    const updated = [...matrix.services];
    updated[idx] = { ...updated[idx], price: parseInt(value) || 0 };
    setMatrix({ ...matrix, services: updated });
  };

  if (!matrix) return <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center">טוען...</div>;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 relative overflow-hidden font-heebo" dir="rtl">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(124,58,237,0.1)] to-transparent opacity-50 pointer-events-none rounded-full blur-[80px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('/hub')} className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-4 text-sm font-medium">
              <ArrowRight size={16} /> חזרה למרכז השליטה
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[rgba(124,58,237,0.1)] flex items-center justify-center border border-[rgba(124,58,237,0.3)] text-[#a855f7]">
                <Settings size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-l from-white to-[#a855f7] bg-clip-text text-transparent">ניהול מחירון מלא — Smart Bareau</h1>
                <p className="text-[#94a3b8] font-medium">כל התעריפים, השירותים, ושעות הייעוץ. שינויים ישפיעו מיד על מחולל ההצעות.</p>
              </div>
            </div>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isSaved ? 'bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-[#a855f7] hover:bg-[#9333ea] shadow-[0_0_20px_rgba(168,85,247,0.3)]'} text-white`}>
            {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            <span>{isSaved ? 'המחירון עודכן!' : 'שמור שינויים'}</span>
          </button>
        </div>

        {/* ═══ SECTION 1: Retainers ═══ */}
        <SectionTitle icon={<Briefcase size={20} />} title="חבילות ריטיינר (חיוב חודשי + שנתי)" color="#a855f7" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
          {(Object.keys(matrix.retainers) as ClientTypeKey[]).map((type) => {
            const r = matrix.retainers[type];
            const isEmployee = type === 'employee';
            return (
              <div key={type} className="bg-[rgba(30,41,59,0.5)] border border-[rgba(148,163,184,0.1)] rounded-xl p-5 hover:border-[rgba(168,85,247,0.3)] transition-colors">
                <h3 className="text-base font-bold text-white mb-1">{r.label}</h3>
                <p className="text-xs text-[#64748b] mb-4">{r.includes.join(' · ')}</p>
                {!isEmployee ? (
                  <div className="space-y-3">
                    <PriceInput label="חודשי (₪)" value={r.baseMonthlyFee} onChange={(v) => updateRetainer(type, 'baseMonthlyFee', v)} />
                    <PriceInput label="דוח שנתי (₪)" value={r.annualReportFee} onChange={(v) => updateRetainer(type, 'annualReportFee', v)} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <PriceInput label="דמי פתיחת תיק (₪)" value={r.setupFee || 0} onChange={(v) => updateRetainer(type, 'setupFee', v)} />
                    <PriceInput label="עמלת הצלחה (%)" value={r.successFeePercent || 0} onChange={(v) => updateRetainer(type, 'successFeePercent', v)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ SECTION 2: Hourly Rates ═══ */}
        <SectionTitle icon={<Clock size={20} />} title="תעריפי שעה (Hourly)" color="#f59e0b" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {matrix.hourlyRates.map((hr, idx) => (
            <div key={hr.id} className="bg-[rgba(30,41,59,0.5)] border border-[rgba(148,163,184,0.1)] rounded-xl p-5">
              <h3 className="text-base font-bold text-white mb-3">{hr.name}</h3>
              <PriceInput label="₪ לשעה" value={hr.pricePerHour} onChange={(v) => updateHourly(idx, v)} />
            </div>
          ))}
        </div>

        {/* ═══ SECTION 3: Service Catalog ═══ */}
        <SectionTitle icon={<Calculator size={20} />} title="קטלוג שירותים בודדים (Per Case / Project)" color="#3b82f6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {matrix.services.map((svc, idx) => (
            <div key={svc.id} className="bg-[rgba(30,41,59,0.5)] border border-[rgba(148,163,184,0.1)] rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{svc.name}</h4>
                <p className="text-xs text-[#64748b]">{svc.description}</p>
              </div>
              <div className="w-32">
                <PriceInput label={svc.isMonthly ? '₪/חודש' : '₪'} value={svc.price} onChange={(v) => updateService(idx, v)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// #endregion

// #region Sub-components

function SectionTitle({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-2">
      <div className="p-2 rounded-lg" style={{ background: `${color}20`, color }}>{icon}</div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
  );
}

function PriceInput({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-[#64748b] mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#050814] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#a855f7]"
        dir="ltr" style={{ textAlign: 'right' }} />
    </div>
  );
}

// #endregion

export default PricingManagerPage;
