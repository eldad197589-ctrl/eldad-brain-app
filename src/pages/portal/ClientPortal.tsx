/* ============================================
// #region Module

   FILE: ClientPortal.tsx
   PURPOSE: The personalized 'Client World' — uses SAME types as the internal KYC module.
   DEPENDENCIES: react, react-router-dom, lucide-react, ServiceCharter, SecureUploadArea, ../../client-onboarding/types
   EXPORTS: default
   ============================================ */

import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { EntityType } from '../client-onboarding/types';
import { ServiceCharter } from './components/ServiceCharter';
import { SecureUploadArea } from './components/SecureUploadArea';

// #region Entity Labels

const ENTITY_LABELS: Record<EntityType, string> = {
  exempt: 'עוסק פטור',
  authorized: 'עוסק מורשה',
  partnership: 'שותפות',
  company: 'חברה בע"מ',
  npo: 'עמותה / מלכ"ר',
};

const VALID_ENTITIES: string[] = ['exempt', 'authorized', 'partnership', 'company', 'npo'];

// #endregion

// #region Component

const ClientPortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();

  // Query params: ?name=David&entity=company&transfer=1
  const clientName = searchParams.get('name') || 'לקוח יקר';
  const rawEntity = searchParams.get('entity');
  const entityType: EntityType = rawEntity && VALID_ENTITIES.includes(rawEntity) ? (rawEntity as EntityType) : 'exempt';
  const isTransfer = searchParams.get('transfer') === '1';

  // Token reserved for future API validation
  console.log('[ClientPortal] Token:', token);

  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col font-heebo" dir="rtl">
      {/* Header */}
      <header className="bg-[#0a0e1a] border-b border-[#1e293b] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a18028] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(201,168,76,0.4)]">
              אש
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">אהרוני שלחון דוד</h1>
              <p className="text-xs text-[#94a3b8] font-medium tracking-widest">משרד רואי חשבון וייעוץ עסקי</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-sm font-bold">
            <Shield size={16} /> חיבור מאובטח
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10 text-center md:text-right">
          <h2 className="text-4xl font-black text-white mb-2">
            ברוך הבא, <span className="text-[#3b82f6]">{clientName}</span>.
          </h2>
          <p className="text-[#94a3b8] text-base">
            סוג: <strong className="text-white">{ENTITY_LABELS[entityType]}</strong>
            {isTransfer && <> · <strong className="text-[#38bdf8]">מעבר ממייצג קודם</strong></>}
          </p>
          <p className="text-sm text-[#64748b] mt-1">כל המסמכים שתעלה כאן ייקלטו ישירות לתיק שלך במערכת המשרד.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 flex flex-col gap-6">
            <ServiceCharter />
            <div className="p-6 rounded-2xl bg-[#0a0e1a] border border-[#1e293b]">
              <h3 className="font-bold text-white mb-2">זקוקים לעזרה?</h3>
              <p className="text-sm text-[#94a3b8] mb-4">שלחו הודעה ישירות למשרד — תגיע ישר לדשבורד של רואה החשבון.</p>
              <button className="w-full py-3 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl font-bold transition-colors">
                פתח צ'אט עם המשרד
              </button>
            </div>
          </div>
          <div className="xl:col-span-7">
            <SecureUploadArea clientName={clientName} entityType={entityType} isTransfer={isTransfer} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0e1a] border-t border-[#1e293b] py-6 text-center mt-auto">
        <p className="text-xs text-[#64748b]">
          © {new Date().getFullYear()} משרד רו"ח אהרוני שלחון דוד. כל הזכויות שמורות. מופעל באמצעות מערכת Eldad Brain.
        </p>
      </footer>
    </div>
  );
};

// #endregion

export default ClientPortal;
