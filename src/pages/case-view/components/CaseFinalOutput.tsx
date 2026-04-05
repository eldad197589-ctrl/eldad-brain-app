import { CheckCircle2, FileText, Download, FolderOpen, ShieldCheck } from 'lucide-react';
import type { CaseDraft } from '../../../data/caseTypes';

export default function CaseFinalOutput({
  draft,
  clientName,
}: {
  draft: CaseDraft;
  clientName: string;
}) {
  const fileName = `טיוטה_${clientName.replace(/\s+/g, '_')}_סופי.docx`;
  // Construct a dummy local path representation for UI purposes as requested by user
  const localDest = `brain-app\\cases\\${clientName.replace(/\s+/g, '-')}\\final\\${fileName}`;

  return (
    <div style={{
      padding: '20px', borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(30,41,59,0.95))',
      border: '1px solid rgba(34,197,94,0.3)',
      display: 'flex', flexDirection: 'column', gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(34,197,94,0.15)', paddingBottom: 12 }}>
        <CheckCircle2 size={24} color="#22c55e" />
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#22c55e' }}>Final Output מוכן להגשה</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem', color: '#e2e8f0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#94a3b8', width: 120 }}>שם הקובץ:</span>
          <span style={{ fontWeight: 600 }}>{fileName}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#94a3b8', width: 120 }}>סטטוס ייצוא:</span>
          <span style={{ color: '#34d399' }}>{draft.exportedFinalAt ? 'הושלם בהצלחה' : 'ממתין לייצוא סופי'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#94a3b8', width: 120 }}>זמן ייצוא:</span>
          <span>{draft.exportedFinalAt ? new Date(draft.exportedFinalAt).toLocaleString('he-IL') : '-'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#94a3b8', width: 120 }}>נתיב שמירה מקומי:</span>
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.8rem', color: '#60a5fa' }}>
            {localDest}
          </code>
        </div>
      </div>

      {draft.sufficiencyWarning && draft.sufficiencyWarning.includes('[AUDIT]') && (
        <div style={{
          marginTop: 8, padding: 12, borderRadius: 8,
          background: 'rgba(234,179,8,0.1)', border: '1px dashed rgba(234,179,8,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#eab308', fontWeight: 600, fontSize: '0.85rem' }}>
            <ShieldCheck size={16} /> Data Audit Trail
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'pre-line' }}>
            {draft.sufficiencyWarning}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          background: '#22c55e', color: 'white', border: 'none', borderRadius: 8,
          fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
        }}
        onClick={() => alert(`פתיחת הקובץ מנתיב: ${localDest}`)}
        >
          <FileText size={18} /> פתח קובץ
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
        }}
        onClick={() => alert(`הצגת תיקייה: brain-app\\cases\\${clientName.replace(/\s+/g, '-')}\\final`)}
        >
          <FolderOpen size={18} /> הצג בתיקייה
        </button>
      </div>

    </div>
  );
}
