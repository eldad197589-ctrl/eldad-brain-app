/* ============================================
// #region Module

   FILE: ServiceCharter.tsx
   PURPOSE: Displays the elite Service Charter to clients entering the portal.
   DEPENDENCIES: react, lucide-react
   EXPORTS: ServiceCharter
   ============================================ */

import React from 'react';
import { ShieldCheck, Zap, HeartHandshake, FileCheck } from 'lucide-react';

export const ServiceCharter: React.FC = () => {
  return (
    <div className="bg-[rgba(30,41,59,0.5)] border border-[rgba(148,163,184,0.1)] rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c9a84c] opacity-10 blur-[50px] rounded-full" />
      
      <div className="flex flex-col items-center text-center mb-8 relative z-10">
        <h2 className="text-3xl font-black text-white mb-2">אמנת שירות משרדית</h2>
        <p className="text-[#c9a84c] font-medium tracking-wide">משרד רואי חשבון אהרוני, שלחון דוד</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <CharterBox 
          icon={<Zap size={24} />} 
          title="תגובתיות וטכנולוגיה" 
          desc="אנו נעזרים במערכות AI מתקדמות כדי להגיב מהר, לדייק בחישובים, ולמנוע שגיאות אנוש. התיק שלכם מקושר אנליטית 24/7."
        />
        <CharterBox 
          icon={<ShieldCheck size={24} />} 
          title="שקיפות וביטחון" 
          desc="אצלינו אין מסכים שחורים. כל נתון, דוח ותזרים יהיו שקופים לכם. אתם בידיים הבטוחות ביותר מול רשויות המס."
        />
        <CharterBox 
          icon={<FileCheck size={24} />} 
          title="טיפול וביקורת פרואקטיבית" 
          desc="לא מחכים לסוף השנה. אנו מבצעים בקרות שוטפות, מזהים חריגות בזמן אמת, ומתריעים כדי לחסוך לכם מס כחוק."
        />
        <CharterBox 
          icon={<HeartHandshake size={24} />} 
          title="יחס אישי, בגובה העיניים" 
          desc="מעבר למקצועיות, אנחנו כאן כדי להיות שותפים לדרך. תמיד זמינים, תמיד סבלניים להסביר את המספרים בשפה ברורה."
        />
      </div>

      <div className="mt-8 pt-6 border-t border-[rgba(148,163,184,0.1)] text-center relative z-10">
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          ברוכים הבאים לעולם חכם יותר של הנהלת חשבונות.<br/>
          <strong>ההצלחה העסקית שלכם היא כרטיס הביקור שלנו.</strong>
        </p>
      </div>
    </div>
  );
};

function CharterBox({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start p-4 rounded-xl bg-[rgba(15,23,42,0.4)] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(201,168,76,0.2)] transition-colors">
      <div className="w-12 h-12 rounded-full bg-[rgba(201,168,76,0.1)] text-[#c9a84c] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-bold mb-1">{title}</h4>
        <p className="text-sm text-[#94a3b8] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
// #endregion
