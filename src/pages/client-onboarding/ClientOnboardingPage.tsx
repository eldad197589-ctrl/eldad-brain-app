/* ============================================
// #region Module

   FILE: ClientOnboardingPage.tsx
   PURPOSE: Orchestrator page for Client Onboarding Wizard
   DEPENDENCIES: ./hooks/useKycChecklist, ./components/*
   EXPORTS: default
   ============================================ */

import React from 'react';
import { useKycChecklist } from './hooks/useKycChecklist';
import { ClientDetailsForm } from './components/ClientDetailsForm';
import { DocumentChecklist } from './components/DocumentChecklist';
import { ArrowRight, UserPlus, FolderSync, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EntityType } from './types';

const ClientOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parse query params from Smart Folder Intake
  const paramName = searchParams.get('name') || undefined;
  const paramEntity = (searchParams.get('entity') as EntityType) || undefined;
  const paramTransfer = searchParams.get('transfer') === 'true';
  const paramFound = searchParams.get('found')?.split(',').filter(Boolean) || undefined;
  const paramIdNumber = searchParams.get('idNumber') || undefined;

  // Initialize hook WITH pre-detected values from the smart intake
  const { state, updateClientInfo, toggleDocStatus } = useKycChecklist({
    name: paramName,
    entityType: paramEntity,
    isTransfer: paramTransfer,
    foundDocIds: paramFound,
    idNumber: paramIdNumber,
  });

  const isAutoPopulated = !!paramName;
  const foundCount = paramFound?.length || 0;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 relative overflow-hidden font-heebo" dir="rtl">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(56,189,248,0.08)] to-transparent opacity-50 pointer-events-none rounded-full blur-[100px]" />

      {/* Auto-Populated Banner */}
      {isAutoPopulated && (
        <div className="max-w-7xl mx-auto mb-4 relative z-10 bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <Sparkles size={20} className="text-emerald-400 flex-shrink-0" />
          <div className="text-sm text-emerald-300">
            <strong>קליטה חכמה —</strong> שם הלקוח, סוג הישות, ו-{foundCount} מסמכי KYC זוהו ומולאו אוטומטית מהתיקייה שהועלתה
          </div>
        </div>
      )}

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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(56,189,248,0.1)] flex items-center justify-center border border-[rgba(56,189,248,0.3)] text-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.15)]">
              <UserPlus size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                אשף קליטת לקוח (KYC)
              </h1>
              <p className="text-[#94a3b8] font-medium mt-1">מערכת חכמה להרכבת תיק לקוח לפי חוקי מודול קליטת לקוח</p>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] font-medium transition-all text-sm">
          <FolderSync size={16} />
          <span>סנכרון תיקי הארכיון</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ClientDetailsForm
            clientName={state.clientName}
            entityType={state.entityType}
            isTransfer={state.isTransfer}
            onUpdate={updateClientInfo}
          />
          
          <div className="bg-[rgba(56,189,248,0.05)] border border-[rgba(56,189,248,0.2)] rounded-xl p-5">
            <h3 className="text-[#38bdf8] font-bold mb-2">💡 חיבור אסטרטגי פרימיום</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              הזכיר ללקוח כי קיימת אפשרות לפתיחת חשבון בנק מהירה בתנאי VIP מול <strong>מירלה כהן (בנק מרכנתיל)</strong>. ניתן להפיק הפניה בלחיצת כפתור מהמערכת.
            </p>
          </div>
        </div>

        {/* Right Side: Dynamic Checklist */}
        <div className="lg:col-span-7 h-[700px]">
          <DocumentChecklist 
            documents={state.documents}
            onToggleStatus={toggleDocStatus}
          />
        </div>

      </div>
    </div>
  );
};

export default ClientOnboardingPage;
// #endregion
