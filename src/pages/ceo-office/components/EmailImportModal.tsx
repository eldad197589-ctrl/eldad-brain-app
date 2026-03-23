/* ============================================
   FILE: EmailImportModal.tsx
   PURPOSE: EmailImportModal component
   DEPENDENCIES: react, lucide-react
   EXPORTS: EmailImportModal (default)
   ============================================ */
/**
 * FILE: EmailImportModal.tsx
 * PURPOSE: Modal to import work-relevant emails into DocumentIntake
 * DEPENDENCIES: gmailService, emailClassifier, brainStore
 *
 * Flow: Fetch emails → Classify → Show only work-relevant → User selects → Import to store
 */

import { useState } from 'react';
import { Mail, X, Download, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { fetchRecentEmails, isGmailConnected, type GmailMessage } from '../../../services/gmailService';
import { classifyEmail, type EmailClassification } from '../../../services/emailClassifier';
import { useBrainStore } from '../../../store/brainStore';

// #region Types

interface ClassifiedEmail {
  email: GmailMessage;
  classification: EmailClassification;
}

interface EmailImportModalProps {
  onClose: () => void;
}

// #endregion

// #region Component

/**
 * EmailImportModal — Pull emails from Gmail, classify, and import work-relevant ones.
 * Only shows work-relevant emails. Personal/spam are hidden by default.
 */
export default function EmailImportModal({ onClose }: EmailImportModalProps) {
  const addDocument = useBrainStore((s) => s.addDocument);
  const [emails, setEmails] = useState<ClassifiedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  /** Fetch and classify emails */
  const handleFetch = async () => {
    if (!isGmailConnected()) {
      setError('Gmail לא מחובר. עבור להגדרות ← חבר Gmail.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const raw = await fetchRecentEmails(20);
      const classified = raw.map((email) => ({
        email,
        classification: classifyEmail(email.from, email.subject, email.attachments),
      }));
      // Sort: work first, then by confidence
      classified.sort((a, b) => {
        if (a.classification.isWork !== b.classification.isWork) {
          return a.classification.isWork ? -1 : 1;
        }
        return b.classification.confidence - a.classification.confidence;
      });
      setEmails(classified);
    } catch (err) {
      setError(`שגיאה: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  /** Import a single email as a document */
  const handleImport = (item: ClassifiedEmail) => {
    const docTypeMap: Record<string, 'supplier_invoice' | 'client_doc' | 'tax_notice' | 'contract' | 'other'> = {
      supplier_invoice: 'supplier_invoice',
      client_doc: 'client_doc',
      tax_notice: 'tax_notice',
      contract: 'contract',
      other: 'other',
    };
    addDocument({
      description: `${item.email.subject} — ${item.email.from}`,
      docType: docTypeMap[item.classification.suggestedDocType || 'other'] || 'other',
      source: 'email',
      linkedTo: '',
      status: 'pending',
      hasVat: false,
    });
    setImported((prev) => new Set([...prev, item.email.id]));
  };

  const workEmails = emails.filter((e) => e.classification.isWork);
  const personalEmails = emails.filter((e) => !e.classification.isWork);
  const displayEmails = showAll ? emails : workEmails;

  const confidenceColor = (c: number) =>
    c >= 80 ? '#34d399' : c >= 50 ? '#fbbf24' : '#94a3b8';

  const categoryLabels: Record<string, string> = {
    invoice: '📄 חשבונית',
    tax_notice: '🏛️ הודעת מס',
    client: '👤 לקוח',
    bank: '🏦 בנק',
    government: '🏛️ ממשלה',
    legal: '⚖️ משפטי',
    payroll: '💰 שכר',
    general_work: '💼 עבודה',
    personal: '👤 אישי',
    spam: '🗑️ ספאם',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '90%', maxWidth: 720, maxHeight: '80vh',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: 16, border: '1px solid rgba(201,168,76,0.2)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Mail size={20} color="#ef4444" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0', flex: 1 }}>
            📧 ייבוא מיילים — עבודה בלבד
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Controls */}
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <button onClick={handleFetch} disabled={loading} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
            color: '#3b82f6', cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'Heebo, sans-serif',
          }}>
            {loading ? '⏳ טוען...' : '🔄 טען 20 מיילים אחרונים'}
          </button>
          {emails.length > 0 && (
            <>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                ✅ {workEmails.length} מיילי עבודה
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                | {personalEmails.length} אישיים
              </span>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem',
                  background: showAll ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${showAll ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.1)'}`,
                  color: showAll ? '#fbbf24' : '#64748b', cursor: 'pointer',
                  fontFamily: 'Heebo, sans-serif',
                }}
              >
                <Filter size={10} /> {showAll ? 'רק עבודה' : 'הצג הכל'}
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            margin: '8px 20px', padding: '8px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.82rem', color: '#f87171', display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Email List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
          {displayEmails.length === 0 && !loading && emails.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '0.85rem',
            }}>
              📧 לחץ "טען מיילים" כדי לסרוק את תיבת הדואר
            </div>
          )}
          {displayEmails.length === 0 && emails.length > 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '0.85rem',
            }}>
              🎉 אין מיילי עבודה חדשים! הכל נקי.
            </div>
          )}
          {displayEmails.map((item) => {
            const isImported = imported.has(item.email.id);
            const cl = item.classification;
            return (
              <div key={item.email.id} style={{
                padding: '10px 14px', marginBottom: 6, borderRadius: 10,
                background: cl.isWork ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${cl.isWork ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)'}`,
                opacity: cl.isWork ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: 6,
                    background: `${confidenceColor(cl.confidence)}15`,
                    border: `1px solid ${confidenceColor(cl.confidence)}30`,
                    color: confidenceColor(cl.confidence), fontWeight: 700,
                  }}>
                    {categoryLabels[cl.category] || cl.category} {cl.confidence}%
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', flex: 1 }}>
                    {item.email.subject || '(ללא נושא)'}
                  </span>
                  {cl.isWork && !isImported && (
                    <button onClick={() => handleImport(item)} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                      background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
                      color: '#34d399', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <Download size={10} /> קלוט
                    </button>
                  )}
                  {isImported && (
                    <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
                      <CheckCircle size={12} /> נקלט ✅
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {item.email.from} · {cl.reason}
                  {item.email.hasAttachments && ' · 📎 קבצים מצורפים'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// #endregion
