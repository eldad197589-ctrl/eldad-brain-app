/* ============================================
   FILE: CaseDocumentList.tsx
   PURPOSE: Pure component — renders a table of case documents
   DEPENDENCIES: react, lucide-react, caseTypes
   EXPORTS: CaseDocumentList (default)
   ============================================ */
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import type { CaseDocument, CaseDocumentType } from '../../../data/caseTypes';

// #region Types

interface CaseDocumentListProps {
  /** Document array from CaseEntity */
  documents: CaseDocument[];
}

// #endregion

// #region Component

/** Pure document list — receives data via props only */
export default function CaseDocumentList({ documents }: CaseDocumentListProps) {
  if (documents.length === 0) {
    return <div style={{ color: '#64748b', padding: 16, textAlign: 'center' }}>אין מסמכים בתיק</div>;
  }

  return (
    <div className="case-section">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
        <FileText size={18} color="#10b981" />
        מסמכים ({documents.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {documents.map(doc => (
          <div
            key={doc.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{DOC_TYPE_EMOJI[doc.type] || '📄'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{doc.fileName}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 2 }}>{doc.description}</div>
            </div>
            <span style={{
              padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600,
              background: DOC_TYPE_COLOR[doc.type]?.bg || 'rgba(148,163,184,0.1)',
              color: DOC_TYPE_COLOR[doc.type]?.text || '#94a3b8',
            }}>
              {DOC_TYPE_LABEL[doc.type] || doc.type}
            </span>
            {doc.wasSubmitted ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.75rem' }}>
                <CheckCircle size={14} /> הוגש
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.75rem' }}>
                <XCircle size={14} /> לא הוגש
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// #endregion

// #region Display Maps

const DOC_TYPE_EMOJI: Partial<Record<CaseDocumentType, string>> = {
  decision_document: '⚖️',
  response_letter: '✉️',
  license: '🪪',
  calculation: '📊',
  business_records: '📒',
  supporting_scan: '📷',
  request_letter: '📨',
  attachment: '📎',
};

const DOC_TYPE_LABEL: Partial<Record<CaseDocumentType, string>> = {
  decision_document: 'מסמך החלטה',
  response_letter: 'מכתב תגובה',
  license: 'רישיון',
  calculation: 'חישוב',
  business_records: 'רישום עסקי',
  supporting_scan: 'סריקה',
  request_letter: 'בקשת מסמכים',
  attachment: 'נספח',
};

const DOC_TYPE_COLOR: Partial<Record<CaseDocumentType, { bg: string; text: string }>> = {
  decision_document: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  response_letter: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  license: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
  calculation: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  business_records: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' },
  supporting_scan: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' },
  request_letter: { bg: 'rgba(236,72,153,0.15)', text: '#f472b6' },
};

// #endregion
