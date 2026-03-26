/* ============================================
// #region Module

   FILE: FolderIngester.tsx
   PURPOSE: Smart folder intake — scans local folders, classifies documents,
            detects entity type, and auto-populates KYC checklist
   DEPENDENCIES: lucide-react, fileExtractor, knowledgeChunker, ragService,
                 clientService, documentScanner
   EXPORTS: FolderIngester
   ============================================ */
import React, { useRef, useState } from 'react';
import { FolderUp, HardDrive, Loader2, FileWarning, ChevronDown, ChevronRight, CheckCircle2, Brain, ArrowLeft } from 'lucide-react';
import { extractTextFromFile } from '../../../services/fileExtractor';
import { chunkMarkdown } from '../../../services/knowledgeChunker';
import { ingestLocalRawText } from '../../../services/ragService';
import { createOrUpdateClient } from '../../../services/clientService';
import { scanDocument, aggregateScanResults, ScanResult, AggregatedIntake } from '../../../services/documentScanner';
import { useNavigate } from 'react-router-dom';

// #region Types

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface IngestStatus {
  totalFiles: number;
  processedFiles: number;
  successFiles: number;
  failedFiles: number;
  newChunks: number;
  currentFileName: string;
  errors: string[];
  stage: 'idle' | 'scanning' | 'extracting' | 'embedding' | 'complete';
}

// #endregion

// #region Component

export const FolderIngester: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [intake, setIntake] = useState<AggregatedIntake | null>(null);
  const [status, setStatus] = useState<IngestStatus>({
    totalFiles: 0, processedFiles: 0, successFiles: 0,
    failedFiles: 0, newChunks: 0, currentFileName: '',
    errors: [], stage: 'idle'
  });

  /** Main handler — scans, classifies, ingests */
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validExtensions = ['txt', 'md', 'docx', 'pdf', 'html', 'csv'];
    const validFiles = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext && validExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      alert('לא נמצאו קבצים נתמכים בתיקייה (נתמך: PDF, DOCX, TXT, MD, CSV, HTML)');
      return;
    }

    setIntake(null);
    setStatus({
      totalFiles: validFiles.length, processedFiles: 0, successFiles: 0,
      failedFiles: 0, newChunks: 0, currentFileName: 'מכין קבצים...',
      errors: [], stage: 'extracting'
    });

    let totalNewChunks = 0;
    const scanResults: ScanResult[] = [];

    // Extract folder name (client name)
    let clientName = '';
    if (validFiles.length > 0 && validFiles[0].webkitRelativePath) {
      const parts = validFiles[0].webkitRelativePath.split(/[/\\]/);
      clientName = parts.length > 1 ? parts[0] : '';
    }
    if (!clientName) {
      clientName = `לקוח (${new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })})`;
    }

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const filePath = file.webkitRelativePath || file.name;

      setStatus(prev => ({ ...prev, currentFileName: `🔍 סורק: ${file.name}...` }));

      try {
        // 1. Extract text (required for scanning)
        const text = await extractTextFromFile(file);

        // 2. Smart scan — classify the document (ALWAYS runs)
        const scanResult = scanDocument(filePath, text || '');
        scanResults.push(scanResult);

        // 3. Try RAG ingestion (optional — may fail if RAG not initialized)
        if (text && text.length >= 10) {
          setStatus(prev => ({
            ...prev,
            currentFileName: `📊 מאנדקס: ${file.name}...`,
            stage: 'embedding'
          }));

          try {
            const chunks = chunkMarkdown(text, filePath);
            const addedChunks = await ingestLocalRawText(chunks);
            totalNewChunks += addedChunks;
          } catch (ragErr: unknown) {
            // RAG failed — that's OK, the scan result is still valid
            console.warn(`[FolderIngester] RAG skipped for ${file.name}:`, ragErr);
          }
        }

        setStatus(prev => ({
          ...prev,
          processedFiles: prev.processedFiles + 1,
          successFiles: prev.successFiles + 1,
          newChunks: totalNewChunks
        }));
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
        console.error(`[FolderIngester] Failed: ${file.name}`, err);
        // Still add the scan result even if text extraction failed
        if (!scanResults.find(r => r.fileName === filePath)) {
          scanResults.push(scanDocument(filePath, ''));
        }
        setStatus(prev => ({
          ...prev,
          processedFiles: prev.processedFiles + 1,
          failedFiles: prev.failedFiles + 1,
          errors: [...prev.errors, `${file.name}: ${errMsg}`]
        }));
      }
    }

    // 4. Aggregate scan results
    const aggregated = aggregateScanResults(clientName, scanResults);
    setIntake(aggregated);

    setStatus(prev => ({ ...prev, stage: 'complete', currentFileName: 'תהליך הסתיים' }));

    // 5. Register client
    let createdClientId = '';
    if (aggregated.clientName && validFiles.length > 0) {
      try {
        createdClientId = await createOrUpdateClient(aggregated.clientName, validFiles.length);
      } catch (e) {
        console.error('[FolderIngester] Client registration error:', e);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';

    // Don't auto-navigate — let user review the findings first
    void createdClientId;
  };

  /** Navigate to KYC with all auto-detected params */
  const goToOnboarding = () => {
    if (!intake) return;
    const params = new URLSearchParams();
    params.set('name', intake.clientName);
    if (intake.detectedEntityType) params.set('entity', intake.detectedEntityType);
    if (intake.isTransfer) params.set('transfer', 'true');
    if (intake.foundDocIds.length > 0) params.set('found', intake.foundDocIds.join(','));
    if (intake.idNumber) params.set('idNumber', intake.idNumber);
    navigate(`/onboarding?${params.toString()}`);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mb-8 transition-all">
      {/* Header / Toggle */}
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <HardDrive size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 m-0">📥 תיבת קלט מסמכים — קליטה חכמה</h3>
            <p className="text-sm text-slate-400 m-0">העלה תיקייה → המערכת תסרוק, תזהה סוג ישות, ותמלא את ה-KYC אוטומטית</p>
          </div>
        </div>
        <div className="text-slate-500">
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
          {/* Upload Button */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <input type="file" ref={fileInputRef} className="hidden"
              webkitdirectory="" directory="" multiple onChange={handleFolderSelect} />
            <button onClick={() => fileInputRef.current?.click()}
              disabled={status.stage === 'extracting' || status.stage === 'embedding'}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
              {status.stage === 'idle' || status.stage === 'complete' ? (
                <><FolderUp size={20} /><span>בחר תיקייה לקליטה חכמה</span></>
              ) : (
                <><Loader2 size={20} className="animate-spin" /><span>סורק ומזהה מסמכים...</span></>
              )}
            </button>
            <div className="text-sm text-slate-400">
              * נתמך: PDF (כולל סריקות עם OCR), Word, טקסט. המערכת תזהה אוטומטית ת.ז., סוג ישות, ומסמכי KYC.
            </div>
          </div>

          {/* Progress Bar */}
          {status.stage !== 'idle' && (
            <ProgressPanel status={status} />
          )}

          {/* Smart Scan Findings */}
          {intake && (
            <IntakeFindings intake={intake} onGoToOnboarding={goToOnboarding} />
          )}
        </div>
      )}
    </div>
  );
};

// #endregion

// #region ProgressPanel

function ProgressPanel({ status }: { status: IngestStatus }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-slate-200">
          {status.stage === 'complete' ? '✅ סריקה הושלמה!' : status.currentFileName}
        </span>
        <span className="text-sm font-bold text-blue-400">
          {status.processedFiles} / {status.totalFiles} קבצים
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4 overflow-hidden">
        <div className={`h-2.5 rounded-full transition-all duration-300 ${status.stage === 'complete' ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${(status.processedFiles / Math.max(status.totalFiles, 1)) * 100}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <StatBox value={status.successFiles} label="הצלחות" color="text-green-400" />
        <StatBox value={status.failedFiles} label="שגיאות" color="text-red-400" />
        <StatBox value={status.newChunks} label="חלקי ידע חדשים" color="text-blue-400" prefix="+" />
      </div>
      {status.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h4 className="flex items-center gap-2 text-red-400 font-medium text-sm mb-2">
            <FileWarning size={16} /> קבצים שנכשלו
          </h4>
          <ul className="text-xs text-slate-300 space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {status.errors.map((err, idx) => <li key={idx} className="truncate">{err}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatBox({ value, label, color, prefix = '' }: { value: number; label: string; color: string; prefix?: string }) {
  return (
    <div className="bg-slate-900/50 rounded-lg py-2 border border-slate-700/50">
      <div className={`text-2xl font-bold ${color}`}>{prefix}{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

// #endregion

// #region IntakeFindings

const ENTITY_LABELS: Record<string, string> = {
  exempt: 'עוסק פטור', authorized: 'עוסק מורשה',
  company: 'חברה בע"מ', partnership: 'שותפות', npo: 'עמותה / מלכ"ר',
};

function IntakeFindings({ intake, onGoToOnboarding }: { intake: AggregatedIntake; onGoToOnboarding: () => void }) {
  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <Brain size={24} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-300">🧠 ממצאי סריקה חכמה</h3>
          <p className="text-sm text-slate-400">
            נסרקו {intake.totalScanned} קבצים — זוהו {intake.classifiedCount} מסמכים
          </p>
        </div>
      </div>

      {/* Key Findings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <FindingCard emoji="👤" title="שם לקוח" value={intake.clientName} />
        <FindingCard emoji="🏢" title="סוג ישות"
          value={intake.detectedEntityType ? ENTITY_LABELS[intake.detectedEntityType] : '⚠️ לא זוהה — ידני'}
          highlight={!!intake.detectedEntityType} />
        <FindingCard emoji="🔄" title="סטטוס"
          value={intake.isTransfer ? 'העברת ייצוג' : 'עסק חדש / קיים'} />
        <FindingCard emoji="🪪" title="ת.ז." value={intake.idNumber || 'לא חולצה'} />
      </div>

      {/* Found Documents */}
      <div className="mb-5">
        <h4 className="text-sm font-bold text-slate-300 mb-2">📋 מסמכי KYC שזוהו לפי שם הקובץ ({intake.foundDocIds.length})</h4>
        <div className="flex flex-wrap gap-2">
          {intake.details.filter(d => d.matchedDocId).map(d => (
            <span key={d.matchedDocId} className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={12} /> {d.matchedLabel}
              <span className="text-emerald-600">(שם קובץ)</span>
            </span>
          ))}
          {intake.foundDocIds.length === 0 && (
            <span className="text-xs text-slate-500">לא זוהו מסמכי KYC לפי שמות הקבצים — השדות יהיו ריקים וימולאו ידנית</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button onClick={onGoToOnboarding}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-base">
        <ArrowLeft size={18} />
        {intake.foundDocIds.length > 0
          ? `המשך לאשף קליטת לקוח — עם ${intake.foundDocIds.length} מסמכים שזוהו`
          : 'המשך לאשף קליטת לקוח — מילוי ידני'
        }
      </button>
    </div>
  );
}

function FindingCard({ emoji, title, value, highlight = false }: { emoji: string; title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${highlight ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <div className="text-lg mb-1">{emoji}</div>
      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{title}</div>
      <div className="text-sm font-bold text-white mt-0.5 truncate">{value}</div>
    </div>
  );
}

// #endregion
