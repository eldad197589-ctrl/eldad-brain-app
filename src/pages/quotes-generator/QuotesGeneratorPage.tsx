/* ============================================
// #region Module

   FILE: QuotesGeneratorPage.tsx
   PURPOSE: Orchestrator page for generating a Smart Bareau quote
   DEPENDENCIES: ./hooks/useQuoteCalculator, ./components/ClientDetailsForm, ./components/QuotePreview
   EXPORTS: default
   ============================================ */

import React from 'react';
import { useQuoteCalculator } from './hooks/useQuoteCalculator';
import { ClientDetailsForm } from './components/ClientDetailsForm';
import { QuotePreview } from './components/QuotePreview';
import { FileText, Printer, ArrowRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToWord } from '../../services/wordExportService';

const QuotesGeneratorPage: React.FC = () => {
  const { state, updateClientInfo, toggleService } = useQuoteCalculator();
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 relative overflow-hidden font-heebo" dir="rtl">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(16,185,129,0.1)] to-transparent opacity-50 pointer-events-none rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(245,158,11,0.05)] to-transparent opacity-50 pointer-events-none rounded-full blur-[80px]" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/hub')} 
            className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-4 text-sm font-medium"
          >
            <ArrowRight size={16} />
            חזרה לדשבורד (Hub)
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center border border-[rgba(16,185,129,0.3)] text-[#10b981]">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-l from-white to-[#10b981] bg-clip-text text-transparent">
                מחולל הצעות מחיר
              </h1>
              <p className="text-[#94a3b8] font-medium">Smart Bareau System — מבוסס על הידע המזוקק מהמחירון</p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <Printer size={18} />
          <span>הדפס / ייצא ל-PDF</span>
        </button>
        <button
          onClick={() => {
            const paragraphs: string[] = [
              `לקוח: ${state.clientName || '[למלא]'}`,
              `סיווג לקוח: ${state.clientType}`,
            ];
            if (state.additionalServices.length > 0) {
              paragraphs.push(`שירותים נוספים: ${state.additionalServices.join(', ')}`);
            }
            exportToWord({
              title: 'הצעת מחיר — Smart Bareau',
              subtitle: `לקוח: ${state.clientName || 'לקוח חדש'}`,
              filename: `הצעת_מחיר_${state.clientName || 'לקוח'}`,
              sections: [{ paragraphs }],
            });
          }}
          className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] mr-2"
        >
          <Download size={18} />
          <span>הורד Word</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* Left/Right splitting => Right is inputs (col-span-4), Left is Preview (col-span-8) */}
        <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
          <ClientDetailsForm
            clientName={state.clientName}
            clientType={state.clientType}
            additionalServices={state.additionalServices}
            onUpdateClient={updateClientInfo}
            onToggleService={toggleService}
          />
          
          <div className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] rounded-xl p-5">
            <h3 className="text-[#10b981] font-bold mb-2">💡 איך זה עובד?</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              המחולל יונק את מחירון Smart Bareau שחולץ מקובץ הידע. הוא מתאים את עלות חבילת הריטיינר החודשית ושכר הטרחה השנתי באופן אקטיבי מיד עם שינוי סיווג הלקוח.
            </p>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-7 print:col-span-12">
          <QuotePreview state={state} />
        </div>

      </div>
    </div>
  );
};

export default QuotesGeneratorPage;
// #endregion
