import React, { useState } from 'react';
import { FileText, ArrowRight, CheckCircle2, AlertTriangle, Scale, History, Upload, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FILE: DocumentChangeAgentPage.tsx
 * PURPOSE: Document Change Agent (DCA) UI allowing users to compare documents against baselines.
 * DEPENDENCIES: lucide-react, framer-motion
 */

// #region Types
export interface Props {}

interface DeltaFinding {
  id: string;
  category: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  actionRequired?: string;
}
// #endregion

// #region Data Mock
const MOCK_FINDINGS: DeltaFinding[] = [
  {
    id: 'f1',
    category: 'critical',
    title: 'מנגנון ניהול וקבלת החלטות (Casting Vote)',
    description: 'מעבר לשליטה רוחבית וביטול Casting Vote למנכ"ל. חלוקת האקוויטי שונתה ל-40/40 מול רוב של 75% בהסכם הישן.',
    oldValue: 'למנכ"ל (צד א׳) תהיה זכות הצבעה מכרעת במקרה של שוויון.',
    newValue: 'מנגנון חלוקת שווה (Parity) 40/40 עם מנגנון BMBY בעת מבוי סתום.',
    actionRequired: 'אישור מודל ניהול סיכונים ותזרים (BMBY חושף לסיכון נזילות).'
  },
  {
    id: 'f2',
    category: 'critical',
    title: 'קניין רוחני (IP)',
    description: 'מעבר ממודל העברה מוחלטת (Assignment) למודל רישוי (Licensing).',
    oldValue: 'הקניין רוחני שייך באופן אבסולוטי ושמרני על סך 500,000 ש"ח לחברה.',
    newValue: 'רישיון בלעדי לחברה. ה-IP ההיסטורי נשאר בבעלות המייסדים.',
    actionRequired: 'לוודא בדיון התקנון שזכות השימוש חוזרת למייסדים בפירוק.'
  },
  {
    id: 'f3',
    category: 'info',
    title: 'הסרת שותף בסיס (אוסנת)',
    description: 'ההסכם החדש מוחק כל אזכור לשותפות של צד ג׳.',
    oldValue: '37.5% לאלדד, 37.5% לקיריל, 15% לאוסנת, 10% ESOP',
    newValue: '40% לאלדד, 40% לקיריל, 20% ESOP',
  }
];
// #endregion

// #region Component
/**
 * DocumentChangeAgentPage
 * UI wrapper for generating comparative delta reports between legal documents.
 */
export default function DocumentChangeAgentPage(props: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true); // Default true for demo

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Scale className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              סוכן שינויים במסמכים <span className="text-indigo-400 font-mono text-lg">(DCA)</span>
            </h1>
            <p className="text-slate-400">השוואת גרסאות רציפה, חילוץ דלתא אסטרטגי, וניתוח סיכונים אוטומטי</p>
          </div>
        </div>
      </section>

      {/* Control Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            מקור בסיס (Baseline)
          </h2>
          <div className="flex-1 border-2 border-dashed border-slate-700 bg-slate-800/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <FileText size={32} className="text-emerald-500 mb-2" />
            <span className="font-bold text-slate-200">Robium Founders Agreement V2</span>
            <span className="text-xs text-slate-500 mt-1">גרסת 37.5/37.5/15 (מופקדת)</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Upload size={18} className="text-indigo-400" />
            מסמך יעד (Target)
          </h2>
          <div className="flex-1 border-2 border-indigo-500/30 bg-indigo-500/5 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
            <FileText size={32} className="text-indigo-400 mb-2 relative z-10" />
            <span className="font-bold text-slate-200 relative z-10">Robium Founders Agreement V3</span>
            <span className="text-xs text-indigo-300 relative z-10 mt-1">טיוטת קיריל, מרץ 2026 (40/40)</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => {
            setIsAnalyzing(true);
            setTimeout(() => { setIsAnalyzing(false); setShowResults(true); }, 1500);
          }}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/25 transition-all w-64 justify-center"
        >
          {isAnalyzing ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Play size={18} />
              הפעל סוכן השוואה
            </>
          )}
        </button>
      </div>

      {/* Delta Results */}
      {showResults && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-8"
        >
          <div className="bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <h2 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              דוח השוואת גרסאות (DCA Delta)
            </h2>
            <span className="bg-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full font-mono">
              Confidence: 0.95 | Auto-generated
            </span>
          </div>

          <div className="p-6 space-y-6">
            {MOCK_FINDINGS.map((finding) => (
              <div key={finding.id} className="border border-slate-800 rounded-xl bg-slate-900/50 overflow-hidden">
                <div className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${
                  finding.category === 'critical' ? 'bg-rose-500/10 text-rose-400 border-b border-rose-500/10' :
                  finding.category === 'warning' ? 'bg-amber-500/10 text-amber-400 border-b border-amber-500/10' :
                  'bg-blue-500/10 text-blue-400 border-b border-blue-500/10'
                }`}>
                  {finding.category === 'critical' && <AlertTriangle size={16} />}
                  {finding.title}
                </div>
                
                <div className="p-4">
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">{finding.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 border border-rose-500/20 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1 font-bold">הסכם מקור (V2)</div>
                      <div className="text-sm text-slate-300 line-through decoration-rose-500/50">{finding.oldValue}</div>
                    </div>
                    
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 relative">
                      <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 hidden md:block">
                        <div className="bg-slate-900 border border-slate-700 rounded-full p-1 z-10 relative">
                          <ArrowRight size={14} className="text-slate-400" />
                        </div>
                      </div>
                      <div className="text-xs text-indigo-400 mb-1 font-bold">מסמך יעד (V3)</div>
                      <div className="text-sm text-white">{finding.newValue}</div>
                    </div>
                  </div>

                  {finding.actionRequired && (
                    <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex gap-3">
                      <div className="mt-0.5 text-amber-500">💡</div>
                      <div>
                        <div className="text-xs font-bold text-amber-400 mb-0.5">פעולה נדרשת (Action Item)</div>
                        <div className="text-sm text-slate-300">{finding.actionRequired}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
// #endregion
