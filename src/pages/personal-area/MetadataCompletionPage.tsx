/* ============================================
   FILE: MetadataCompletionPage.tsx
   PURPOSE: Minimal personal-area surface for completing
            structured metadata requests bound to live cases.
            Route: /personal-area/:subjectId
   DEPENDENCIES: react, react-router-dom, brainStore, personalAreaTypes
   EXPORTS: MetadataCompletionPage (default)
   ============================================ */
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Send, Download, MessageCircle } from 'lucide-react';
import { useBrainStore } from '../../store/brainStore';
import type { MetadataField } from '../../data/personalAreaTypes';
import { pullCompletedMetadataToCase } from '../../services/pullMetadataToCase';
import { resolveMetadataForCase, type MetadataResolutionResult } from '../../services/metadataResolver';

// #region Component

interface FieldInputProps {
  field: MetadataField;
  onChange: (value: string) => void;
}

/** Single field input renderer */
function FieldInput({ field, onChange }: FieldInputProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'rgba(30,45,66,0.6)', border: '1px solid rgba(148,163,184,0.25)',
    color: '#e2e8f0', fontSize: '0.92rem', fontFamily: 'Heebo, sans-serif',
    outline: 'none', direction: 'rtl',
  };

  if (field.type === 'select' && field.options) {
    return (
      <select
        value={field.value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        <option value="" style={{ background: '#0f172a' }}>— בחירה —</option>
        {field.options.map(opt => (
          <option key={opt} value={opt} style={{ background: '#0f172a' }}>{opt}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={field.value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, direction: 'ltr' }}
      />
    );
  }

  return (
    <input
      type="text"
      value={field.value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={`הכנס ${field.label}...`}
      style={inputStyle}
    />
  );
}

/** MetadataCompletionPage — minimal personal area metadata form */
export default function MetadataCompletionPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const subjects = useBrainStore(s => s.subjects);
  const requests = useBrainStore(s => s.metadataRequests);
  const updateField = useBrainStore(s => s.updateMetadataField);
  const getSubjectById = useBrainStore(s => s.getSubjectById);

  const subject = subjectId ? getSubjectById(subjectId) : undefined;
  const subjectRequests = useMemo(
    () => requests.filter(r => r.subjectId === subjectId),
    [requests, subjectId]
  );

  // Local draft values (before submit)
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  // Resolver result (auto-resolve on mount)
  const [resolverResult, setResolverResult] = useState<MetadataResolutionResult | null>(null);

  // Step 1: Auto-resolve when page loads
  useEffect(() => {
    subjectRequests.forEach(req => {
      if (req.status === 'pending' || req.status === 'partial') {
        const result = resolveMetadataForCase(req.id);
        setResolverResult(result);
        console.log('[MetadataResolver] Auto-resolve result:', result.status, result.fields);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDraft = (reqId: string, fieldKey: string, value: string) => {
    setDrafts(prev => ({
      ...prev,
      [reqId]: { ...(prev[reqId] || {}), [fieldKey]: value },
    }));
  };

  const submitField = (reqId: string, fieldKey: string) => {
    const value = drafts[reqId]?.[fieldKey];
    if (value && value.trim()) {
      updateField(reqId, fieldKey, value.trim(), 'personal_area');
    }
  };

  const submitAllFields = (reqId: string, fields: MetadataField[]) => {
    fields.forEach(f => {
      const value = drafts[reqId]?.[f.fieldKey] || f.value;
      if (value && value.trim()) {
        updateField(reqId, f.fieldKey, value.trim(), 'personal_area');
      }
    });
  };

  if (!subject) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
        <p style={{ fontSize: '1.2rem' }}>לא נמצא נושא עם מזהה: {subjectId}</p>
        <Link to="/" style={{ color: '#c9a84c', textDecoration: 'none' }}>חזרה לתצוגת המוח</Link>
      </div>
    );
  }

  const portalLabel = subject.personalAreaType === 'private_portal' ? 'אזור אישי פרטי' : 'פורטל לקוח';

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link to="/" style={{ color: '#c9a84c', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <ArrowLeft size={16} /> חזרה לתצוגת המוח
        </Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          🏠 {portalLabel}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          {subject.name} · {subject.role === 'personal' ? 'אישי/פרטי' : 'לקוח'}
        </p>
      </div>

      {/* Requests */}
      {subjectRequests.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center', color: '#64748b',
          background: 'rgba(30,45,66,0.4)', borderRadius: 14,
          border: '1px dashed rgba(148,163,184,0.2)',
        }}>
          <CheckCircle size={32} style={{ marginBottom: 12, color: '#4ade80' }} />
          <p style={{ fontSize: '1rem' }}>אין בקשות השלמה פתוחות 👍</p>
        </div>
      ) : (
        subjectRequests.map(req => {
          const pending = req.fields.filter(f => f.required && !f.value);
          const filled = req.fields.filter(f => f.value);
          const total = req.fields.filter(f => f.required).length;
          const hasWhatsApp = resolverResult?.whatsappLink && pending.length > 0;

          return (
            <div key={req.id} style={{
              background: 'rgba(45,69,98,0.7)', border: '1px solid rgba(160,180,200,0.18)',
              borderRadius: 14, padding: '24px 22px', marginBottom: 16,
              borderTop: `3px solid ${req.status === 'completed' ? '#4ade80' : '#fbbf24'}`,
            }}>
              {/* Request header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{req.title}</h2>
                  {req.note && <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>{req.note}</p>}
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                  background: req.status === 'completed' ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)',
                  color: req.status === 'completed' ? '#4ade80' : '#fbbf24',
                  border: `1px solid ${req.status === 'completed' ? '#4ade8033' : '#fbbf2433'}`,
                }}>
                  {filled.length}/{total} הושלמו
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ height: 4, background: 'rgba(30,45,66,0.8)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(filled.length / total) * 100}%`,
                    background: filled.length === total ? '#4ade80' : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    borderRadius: 10, transition: 'width 0.4s',
                  }} />
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {req.fields.map(field => {
                  const draftValue = drafts[req.id]?.[field.fieldKey];
                  const displayField = draftValue !== undefined
                    ? { ...field, value: draftValue }
                    : field;

                  return (
                    <div key={field.fieldKey}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {field.value ? (
                          <CheckCircle size={14} color="#4ade80" />
                        ) : (
                          <Clock size={14} color="#fbbf24" />
                        )}
                        <label style={{ fontSize: '0.88rem', fontWeight: 600, color: field.value ? '#4ade80' : '#e2e8f0' }}>
                          {field.label}
                          {field.required && <span style={{ color: '#f87171', marginRight: 4 }}>*</span>}
                        </label>
                        {field.filledVia && (
                          <span style={{ fontSize: '0.65rem', color: '#64748b', marginRight: 'auto' }}>
                            מקור: {field.filledVia === 'personal_area' ? 'אזור אישי' : field.filledVia}
                          </span>
                        )}
                      </div>
                      {field.value ? (
                        <div style={{
                          padding: '10px 14px', borderRadius: 8,
                          background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
                          color: '#e2e8f0', fontSize: '0.88rem',
                        }}>
                          ✅ {field.value}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <FieldInput field={displayField} onChange={v => updateDraft(req.id, field.fieldKey, v)} />
                          </div>
                          <button
                            onClick={() => submitField(req.id, field.fieldKey)}
                            disabled={!draftValue?.trim()}
                            style={{
                              padding: '10px 16px', borderRadius: 10, border: 'none',
                              background: draftValue?.trim() ? 'linear-gradient(135deg, #c9a84c, #a3862e)' : 'rgba(100,116,139,0.3)',
                              color: draftValue?.trim() ? '#fff' : '#64748b',
                              cursor: draftValue?.trim() ? 'pointer' : 'default',
                              fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Heebo, sans-serif',
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <Send size={14} /> שלח
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit all */}
              {pending.length > 0 && (
                <button
                  onClick={() => submitAllFields(req.id, req.fields)}
                  style={{
                    marginTop: 20, width: '100%', padding: '14px 20px', borderRadius: 12,
                    border: 'none', background: 'linear-gradient(135deg, #c9a84c, #a3862e)',
                    color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  שלח את כל השדות שמולאו
                </button>
              )}

              {/* WhatsApp outreach — auto-generated by resolver */}
              {hasWhatsApp && (
                <a
                  href={resolverResult!.whatsappLink!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 12, width: '100%', padding: '14px 20px', borderRadius: 12,
                    border: 'none', background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={18} /> שלח בקשה לצילה ב-WhatsApp
                </a>
              )}

              {/* Pull to case — visible only when status is 'completed' */}
              {(req.status === 'completed') && (
                <button
                  onClick={() => {
                    const ok = pullCompletedMetadataToCase(req.id);
                    if (ok) alert('✅ המטא-דאטה הוזרק לתיק בהצלחה!');
                  }}
                  style={{
                    marginTop: 12, width: '100%', padding: '14px 20px', borderRadius: 12,
                    border: 'none', background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    color: '#0f172a', fontSize: '0.95rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Download size={18} /> העבר לתיק החי
                </button>
              )}

              {/* Pulled confirmation */}
              {req.status === 'pulled' && (
                <div style={{
                  marginTop: 12, padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
                  textAlign: 'center', color: '#4ade80', fontSize: '0.88rem', fontWeight: 600,
                }}>
                  ✅ הנתונים הועברו לתיק בהצלחה
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// #endregion
