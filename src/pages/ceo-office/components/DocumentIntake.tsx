/**
 * FILE: DocumentIntake.tsx
 * PURPOSE: Document intake box — receives, classifies, and links documents
 * DEPENDENCIES: brainStore
 *
 * Per MASTER_BRAIN_INSTRUCTIONS Part 10:
 * "כל מסמך נקלט, מזוהה, מסווג, ומקושר לתיק"
 */

import { useState, useMemo } from 'react';
import { FileText, Plus, Check, Trash2, Filter, Mail } from 'lucide-react';
import { useBrainStore, type IncomingDocument } from '../../../store/brainStore';
import EmailImportModal from './EmailImportModal';
import DriveImportModal from './DriveImportModal';

// #region Constants

/** Document type options */
const DOC_TYPES = [
  { value: 'supplier_invoice', label: '📄 חשבונית ספק', color: '#f59e0b' },
  { value: 'client_doc', label: '👤 מסמך לקוח', color: '#3b82f6' },
  { value: 'tax_notice', label: '🏛️ הודעת מס', color: '#ef4444' },
  { value: 'contract', label: '📝 חוזה/הסכם', color: '#a78bfa' },
  { value: 'other', label: '📎 אחר', color: '#94a3b8' },
] as const;

/** Source channel options */
const SOURCES = [
  { value: 'email', label: '📧 מייל' },
  { value: 'whatsapp', label: '💬 וואטסאפ' },
  { value: 'scan', label: '📷 סריקה' },
  { value: 'manual', label: '✍️ ידני' },
] as const;

const STATUS_LABELS: Record<IncomingDocument['status'], { label: string; color: string }> = {
  pending: { label: 'ממתין', color: '#fbbf24' },
  classified: { label: 'סווג', color: '#3b82f6' },
  processed: { label: 'טופל', color: '#10b981' },
};

// #endregion

// #region Component

/**
 * DocumentIntake — Intake box for incoming documents.
 * CEO or agents can add documents → classified → linked to case.
 */
export default function DocumentIntake() {
  const documents = useBrainStore((s) => s.documents);
  const addDocument = useBrainStore((s) => s.addDocument);
  const updateDocStatus = useBrainStore((s) => s.updateDocStatus);
  const deleteDocument = useBrainStore((s) => s.deleteDocument);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [docType, setDocType] = useState('supplier_invoice');
  const [source, setSource] = useState('manual');
  const [linkedTo, setLinkedTo] = useState('');
  const [hasVat, setHasVat] = useState(false);
  const [amount, setAmount] = useState('');

  // Filter
  const [filter, setFilter] = useState<'all' | 'pending' | 'classified' | 'processed'>('all');
  const [showEmailImport, setShowEmailImport] = useState(false);
  const [showDriveImport, setShowDriveImport] = useState(false);

  const filteredDocs = useMemo(() => {
    if (filter === 'all') return documents;
    return documents.filter((d) => d.status === filter);
  }, [documents, filter]);

  const pendingCount = documents.filter((d) => d.status === 'pending').length;

  /** Submit new document */
  const handleSubmit = () => {
    if (!description.trim()) return;
    addDocument({
      description: description.trim(),
      docType,
      source,
      linkedTo: linkedTo.trim() || 'לא מקושר',
      status: 'pending',
      hasVat: docType === 'supplier_invoice' ? hasVat : undefined,
      amount: amount ? parseFloat(amount) : undefined,
    });
    // Reset form
    setDescription('');
    setLinkedTo('');
    setAmount('');
    setHasVat(false);
    setShowForm(false);
  };

  return (
    <>
    <div style={{
      marginBottom: 16, borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(59,130,246,0.2)',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(30,41,59,0.95))',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(59,130,246,0.12)',
      }}>
        <FileText size={18} color="#3b82f6" />
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#60a5fa' }}>
          📥 תיבת קלט מסמכים
        </span>
        {pendingCount > 0 && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
            borderRadius: 10, background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
          }}>
            {pendingCount} ממתינים
          </span>
        )}
        <span style={{
          fontSize: '0.68rem', color: '#64748b', marginRight: 'auto',
        }}>
          סה"כ: {documents.length}
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
            color: '#60a5fa', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          }}
        >
          <Plus size={14} /> קלוט מסמך
        </button>
        <button
          onClick={() => setShowEmailImport(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          }}
        >
          <Mail size={14} /> ייבא ממייל
        </button>
        <button
          onClick={() => setShowDriveImport(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#10b981', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          }}
        >
          <FileText size={14} /> ייבא מ-Drive
        </button>
      </div>

      {/* Intake Form */}
      {showForm && (
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid rgba(59,130,246,0.1)',
          background: 'rgba(0,0,0,0.15)',
        }}>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="תיאור המסמך..."
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
              direction: 'rtl', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} style={selectStyle}>
              {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={source} onChange={(e) => setSource(e.target.value)} style={selectStyle}>
              {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input
              value={linkedTo}
              onChange={(e) => setLinkedTo(e.target.value)}
              placeholder="מקושר ל..."
              style={{ ...selectStyle, width: 120 }}
            />
            {docType === 'supplier_invoice' && (
              <>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#94a3b8' }}>
                  <input type="checkbox" checked={hasVat} onChange={(e) => setHasVat(e.target.checked)} />
                  כולל מע"מ
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="סכום ₪"
                  type="number"
                  style={{ ...selectStyle, width: 90 }}
                />
              </>
            )}
          </div>
          <button onClick={handleSubmit} disabled={!description.trim()} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700,
            background: description.trim() ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${description.trim() ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
            color: description.trim() ? '#34d399' : '#64748b',
            cursor: description.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'Heebo, sans-serif',
          }}>
            ✅ קלוט מסמך
          </button>
        </div>
      )}

      {/* Filter Pills */}
      {documents.length > 0 && (
        <div style={{ padding: '8px 18px', display: 'flex', gap: 6 }}>
          {(['all', 'pending', 'classified', 'processed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '3px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600,
                background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === f ? '#60a5fa' : '#64748b',
                cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
              }}
            >
              {f === 'all' ? `הכל (${documents.length})` : `${STATUS_LABELS[f].label} (${documents.filter((d) => d.status === f).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Document List */}
      <div style={{ padding: '6px 18px 14px' }}>
        {filteredDocs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '14px 0', fontSize: '0.82rem', color: '#64748b' }}>
            {documents.length === 0 ? '📭 אין מסמכים. לחץ "קלוט מסמך" להתחיל.' : '🔍 אין מסמכים בפילטר הנוכחי'}
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const typeInfo = DOC_TYPES.find((t) => t.value === doc.docType);
            const st = STATUS_LABELS[doc.status];
            return (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '0.85rem' }}>{typeInfo?.label.slice(0, 2) || '📎'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {doc.description}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {doc.linkedTo} · {doc.source}
                    {doc.amount ? ` · ₪${doc.amount.toLocaleString()}` : ''}
                    {doc.hasVat ? ' · כולל מע"מ' : ''}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                  borderRadius: 8, background: `${st.color}18`, color: st.color,
                }}>
                  {st.label}
                </span>
                {doc.status === 'pending' && (
                  <button
                    onClick={() => updateDocStatus(doc.id, 'classified')}
                    style={actionBtn('#3b82f6')}
                  >
                    <Filter size={12} /> סווג
                  </button>
                )}
                {doc.status === 'classified' && (
                  <button
                    onClick={() => updateDocStatus(doc.id, 'processed')}
                    style={actionBtn('#10b981')}
                  >
                    <Check size={12} /> טופל
                  </button>
                )}
                <button
                  onClick={() => deleteDocument(doc.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={13} color="#64748b" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>

      {showEmailImport && <EmailImportModal onClose={() => setShowEmailImport(false)} />}
      {showDriveImport && <DriveImportModal onClose={() => setShowDriveImport(false)} />}
    </>
  );
}

// #endregion

// #region Styles

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6, padding: '6px 10px',
  color: '#e2e8f0', fontSize: '0.78rem',
  fontFamily: 'Heebo, sans-serif', outline: 'none',
};

/** Small action button */
function actionBtn(color: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 3,
    padding: '3px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
    background: `${color}15`, border: `1px solid ${color}30`,
    color, cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
  };
}

// #endregion
