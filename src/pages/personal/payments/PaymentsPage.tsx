/* ============================================
   FILE: PaymentsPage.tsx
   PURPOSE: Dashboard for handling home payments, anomalies, and filing
   DEPENDENCIES: react, lucide-react, paymentsData
   EXPORTS: PaymentsPage
   ============================================ */
// #region Imports
import { useState } from 'react';
import { CreditCard, AlertTriangle, CheckCircle, FileText, Smartphone, Banknote, Search, Mail } from 'lucide-react';
import { HomeBill, mockBills } from './paymentsData';
// #endregion

// #region Micro-Components

function PaymentsHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          ניהול תשלומים פיננסי 
          <span className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            AGI
          </span>
        </h1>
        <p className="text-slate-400 text-lg">מעקב, זיהוי חריגות צריכה ותשלום מהיר למוסדות ולעסק</p>
      </div>
    </div>
  );
}

function Tabs({ activeTab, setActiveTab }: { activeTab: 'pending' | 'history', setActiveTab: (t: 'pending' | 'history') => void }) {
  return (
    <div className="flex bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-700">
      <button 
        onClick={() => setActiveTab('pending')} 
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
      >
        ממתינים לתשלום
      </button>
      <button 
        onClick={() => setActiveTab('history')} 
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'history' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
      >
        היסטוריית תשלומים
      </button>
    </div>
  );
}

function StatusBadge({ status, hasAnomaly }: { status: string; hasAnomaly: boolean }) {
  if (status === 'שולם') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">
        <CheckCircle className="w-3.5 h-3.5" />שולם
      </span>
    );
  }
  if (hasAnomaly) {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/20">
        <AlertTriangle className="w-3.5 h-3.5" />חריגת צריכה
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded-full border border-slate-600">
      ממתין לתשלום
    </span>
  );
}

function AIBadge({ hasAnomaly }: { hasAnomaly: boolean }) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 relative group">
      <div className="flex items-start gap-3 relative z-10">
        <Search className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="block font-semibold text-slate-300 mb-1">סוכן בקרה AGI:</span>
          {hasAnomaly ? (
            <span className="text-rose-300 leading-relaxed">מזהה קפיצה משמעותית מצריכה קודמת. מומלץ לבדוק.</span>
          ) : (
            <span className="text-emerald-300 leading-relaxed">צריכה תקינה ותואמת היסטוריה.</span>
          )}
        </div>
      </div>
    </div>
  );
}

function BillPaidStatus({ paidVia, filedUnder, confNum }: { paidVia?: string; filedUnder?: string; confNum?: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-sm">
      <div className="flex items-center gap-2 text-slate-300">
        <CheckCircle className="w-4 h-4 text-emerald-400" />
        שולם באמצעות {paidVia}
      </div>
      <div className="flex flex-col gap-1 mt-2 border-t border-slate-700/50 pt-2 text-slate-400">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          תויק ב-Gmail/Drive: <span className="text-white">{filedUnder}</span>
        </div>
        {confNum && (
          <div className="flex items-center gap-2 ml-1 text-xs text-emerald-300/80 mt-1">
            <CheckCircle className="w-3 h-3" />
            מס' אישור במערכת: <span className="font-mono">{confNum}</span> (תועד כהוצאה)
          </div>
        )}
      </div>
    </div>
  );
}

// #endregion

// #region Core Components

function BillCard({ bill, onSelect }: { bill: HomeBill; onSelect: (b: HomeBill) => void }) {
  const bgClass = bill.status === 'שולם' 
    ? 'bg-slate-800/30 border-emerald-500/30' 
    : bill.hasAnomaly ? 'bg-slate-800/80 border-rose-500/50 ring-1 ring-rose-500/20' : 'bg-slate-800/60 border-slate-700/50 hover:border-blue-500/50';

  return (
    <div className={`relative p-6 rounded-2xl border transition-all duration-300 ${bgClass}`}>
      <div className="absolute -top-3 left-6 flex items-center gap-2">
        <StatusBadge status={bill.status} hasAnomaly={bill.hasAnomaly} />
        {bill.sourceEmailId && bill.status === 'ממתין' && (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/20" title="נמשך אוטומטית מ-Gmail">
            <Mail className="w-3.5 h-3.5" /> מיובא מ-Gmail
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-start mt-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100">{bill.type}</h3>
          <p className="text-sm text-slate-400">{bill.provider}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/50 border border-slate-700 text-2xl">
          {bill.type === 'מים' ? '💧' : bill.type === 'חשמל' ? '⚡' : bill.type === 'אגרת מקצוע' ? '💼' : '🏛️'}
        </div>
      </div>
      
      <div className="mt-6 mb-8 flex items-end gap-2">
        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
          ₪{bill.amount.toLocaleString()}
        </span>
        {bill.previousAmount && (
          <span className={`text-sm mb-1 font-medium ${bill.amount > bill.previousAmount ? 'text-rose-400' : 'text-slate-500'}`}>
            (עבר: ₪{bill.previousAmount})
          </span>
        )}
      </div>
      
      <AIBadge hasAnomaly={bill.hasAnomaly} />
      
      {bill.status === 'ממתין' ? (
        <button onClick={() => onSelect(bill)} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-colors">
          <CreditCard className="w-5 h-5" />פעולות תשלום
        </button>
      ) : (
        <BillPaidStatus paidVia={bill.paidVia} filedUnder={bill.filedUnder} confNum={bill.confirmationNumber} />
      )}
    </div>
  );
}

function PaymentMethodBtn({ active, method, icon, label, onClick }: { active: boolean, method: string, icon: React.ReactNode, label: string, onClick: () => void }) {
  const color = method === 'credit' ? 'blue' : method === 'bit' ? 'teal' : 'purple';
  const cls = `w-full p-4 rounded-xl border flex items-center gap-4 transition-all ` + 
    (active ? `bg-${color}-500/20 border-${color}-500 text-white` : `bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800`);
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      <div className="text-right"><div className="font-bold">{label}</div></div>
    </button>
  );
}

function PaymentModal({ bill, onClose, onPay }: { bill: HomeBill; onClose: () => void; onPay: (m: string, confNum: string) => void }) {
  const [method, setMethod] = useState<'credit' | 'bit' | 'transfer' | null>(null);
  const [confNum, setConfNum] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-2">תשלום ל{bill.provider}</h2>
        <div className="text-slate-400 mb-6 flex items-center gap-2 text-lg">
          סה"כ לתשלום: <span className="font-bold text-white">₪{bill.amount.toLocaleString()}</span>
        </div>

        {bill.amount >= 1000 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <div>סכום מהותי. יתוייק בנפרד כהוצאת ליבה למעקב תזרימי.</div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <PaymentMethodBtn active={method==='credit'} method="credit" icon={<CreditCard className="w-6 h-6"/>} label="כרטיס אשראי" onClick={() => setMethod('credit')} />
          <PaymentMethodBtn active={method==='bit'} method="bit" icon={<Smartphone className="w-6 h-6"/>} label="Bit" onClick={() => setMethod('bit')} />
          <PaymentMethodBtn active={method==='transfer'} method="transfer" icon={<Banknote className="w-6 h-6"/>} label="העברה בנקאית" onClick={() => setMethod('transfer')} />
        </div>

        {method && bill.paymentLink && (
          <a 
            href={bill.paymentLink}
            target="_blank" 
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 border border-blue-500/30 hover:border-blue-500 text-blue-300 font-medium rounded-xl mb-6 transition-colors shadow-lg shadow-blue-900/20"
          >
            <CreditCard className="w-5 h-5" />
            מעבר לתשלום מאובטח באתר {bill.provider} (מתוך המייל)
          </a>
        )}

        {method && (
          <div className="mb-6 pt-6 border-t border-slate-700/50">
            <label className="text-sm text-slate-300 mb-2 block">מספר אישור חשבונית (רשות):</label>
            <input 
              type="text" 
              value={confNum}
              onChange={(e) => setConfNum(e.target.value)}
              placeholder="הזן פה לאחר התשלום / משיכה ממייל..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={() => onPay(method!, confNum)} 
            disabled={!method} 
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            סמן כשולם אצלינו
          </button>
          <button onClick={onClose} className="py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors">
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// #endregion

// #region Main Component

/**
 * Props for PaymentsPage
 */
export interface Props {}

/**
 * Main Payments Page Component
 */
export default function PaymentsPage(_props: Props) {
  const [bills, setBills] = useState<HomeBill[]>(mockBills);
  const [selectedBill, setSelectedBill] = useState<HomeBill | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const handlePay = (method: string, confNum: string) => {
    if (!selectedBill) return;
    
    // Exact match to user's Gmail labels ("חשבון מים", "חשבון ארנונה" etc)
    const exactLabel = `חשבון ${selectedBill.type}`;
    const filedUnder = selectedBill.amount >= 1000 ? exactLabel : `חשבוניות שונים`;
    
    const updatedBills = bills.map(b => b.id === selectedBill.id ? { 
      ...b, 
      status: 'שולם' as const, 
      paidVia: method, 
      filedUnder,
      confirmationNumber: confNum || undefined 
    } : b);
    setBills(updatedBills);
    setSelectedBill(null);
  };

  const filteredBills = bills.filter(b => activeTab === 'pending' ? b.status === 'ממתין' : b.status === 'שולם');

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in" dir="rtl">
      <PaymentsHeader />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {filteredBills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800 rounded-3xl border-dashed">
          <div className="text-4xl mb-4 opacity-50">✨</div>
          <h3 className="text-xl font-bold text-slate-300">אין תשלומים שממתינים כרגע</h3>
          <p className="text-slate-500 mt-2">כל החשבונות שנקלטו טופלו או בארכיון.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map(bill => <BillCard key={bill.id} bill={bill} onSelect={setSelectedBill} />)}
        </div>
      )}
      
      {selectedBill && <PaymentModal bill={selectedBill} onClose={() => setSelectedBill(null)} onPay={handlePay} />}
    </div>
  );
}

// #endregion
