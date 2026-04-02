/* ============================================
   FILE: CaseDraftPreview.tsx
   PURPOSE: Draft preview + export — reads draft from store, supports Word export
   DEPENDENCIES: react, lucide-react, wordExportService
   EXPORTS: CaseDraftPreview (default)
   ============================================ */
import { FileDown, FileText, Copy, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { CaseDraft } from '../../../data/caseTypes';
import { exportToWord } from '../../../services/wordExportService';

// #region Types

interface CaseDraftPreviewProps {
  /** Draft from CaseEntity (null if not generated yet) */
  draft: CaseDraft | null;
  /** Client name for export filename */
  clientName: string;
  /** Callback to generate a new draft */
  onGenerateDraft: () => void;
}

// #endregion

// #region Component

/** Draft preview with export capability */
export default function CaseDraftPreview({ draft, clientName, onGenerateDraft }: CaseDraftPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  /** Copy draft body to clipboard */
  const handleCopy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(draft.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /** Export as internal Draft */
  const handleDraftExport = async () => {
    if (!draft) return;
    setExporting(true);
    try {
      await exportToWord({
        title: `טיוטה: ${draft.subject}`,
        filename: `טיוטה_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`,
        sections: [
          { paragraphs: ['*** טיוטה בלבד — לא מאושר להגשה ***', '----------------------------------------', ...draft.body.split('\n\n')] },
          { signatures: [{ name: 'אלדד ברגר', role: 'רו"ח — מייצג מורשה (בטיוטה)' }] },
        ],
      });
    } catch (err) {
      console.error('[CaseDraftPreview] Draft export failed:', err);
    }
    setExporting(false);
  };

  /** Export as Final for Submission */
  const handleFinalExport = async () => {
    if (!draft || draft.status !== 'ready_for_submission') return;
    setExporting(true);
    try {
      await exportToWord({
        title: draft.subject,
        filename: `סופי_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`,
        sections: [
          { paragraphs: draft.body.split('\n\n') },
          { signatures: [{ name: 'אלדד ברגר', role: 'רו"ח — מייצג מורשה' }] },
        ],
      });
    } catch (err) {
      console.error('[CaseDraftPreview] Final export failed:', err);
    }
    setExporting(false);
  };

  if (!draft) {
    return (
      <div className="case-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
          <FileText size={18} color="#f59e0b" />
          טיוטת ערר
        </h3>
        <div style={{
          padding: 24, textAlign: 'center', color: '#94a3b8',
          border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12,
        }}>
          <p style={{ marginBottom: 16 }}>טרם נוצרה טיוטה לתיק זה</p>
          <button onClick={onGenerateDraft} className="case-btn-primary">
            ✍️ צור טיוטת ערר
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="case-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <FileText size={18} color="#10b981" />
          טיוטת ערר
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
            ({new Date(draft.createdAt).toLocaleDateString('he-IL')})
          </span>
          {draft.status && (
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 12,
              background: draft.status === 'ready_for_submission' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
              color: draft.status === 'ready_for_submission' ? '#10b981' : '#f59e0b',
              fontWeight: 500
            }}>
              {draft.status.replace(/_/g, ' ')}
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} className="case-btn-secondary" title="העתק">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'הועתק' : 'העתק'}
          </button>
          <button 
            onClick={handleDraftExport} 
            className="case-btn-secondary" 
            disabled={exporting}
            title="ייצוא עריכה (טיוטה)"
          >
            <FileDown size={14} />
            ייצוא טיוטה
          </button>
          <button 
            onClick={handleFinalExport} 
            className="case-btn-primary" 
            disabled={exporting || draft.status !== 'ready_for_submission'}
            title={draft.status === 'ready_for_submission' ? "ייצוא Word סופי להגשה" : "נדרש אישור אלדד לפני ייצוא סופי"}
            style={{ opacity: draft.status !== 'ready_for_submission' ? 0.5 : 1, cursor: draft.status !== 'ready_for_submission' ? 'not-allowed' : 'pointer' }}
          >
            <FileDown size={14} />
            ייצוא סופי
          </button>
          <button onClick={onGenerateDraft} className="case-btn-secondary">
            🔄 חדש
          </button>
        </div>
      </div>

      {draft.sufficiencyWarning && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12, padding: '8px 12px',
          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          borderRadius: 6, fontSize: '0.85rem', fontWeight: 500
        }}>
          <AlertTriangle size={16} />
          <strong>אזהרת מספיקות:</strong> {draft.sufficiencyWarning}
        </div>
      )}

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, padding: 20,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 12, color: '#c9a84c' }}>
          {draft.subject}
        </div>
        <pre style={{
          whiteSpace: 'pre-wrap', fontFamily: 'Heebo, sans-serif', lineHeight: 1.8,
          fontSize: '0.88rem', color: '#e2e8f0', margin: 0,
        }}>
          {draft.body}
        </pre>
      </div>
    </div>
  );
}

// #endregion
