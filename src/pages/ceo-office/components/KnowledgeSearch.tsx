/* ============================================
   FILE: KnowledgeSearch.tsx
   PURPOSE: RAG-powered search — ask the Brain questions grounded in knowledge
   DEPENDENCIES: react, lucide-react, ragService
   EXPORTS: KnowledgeSearch (default)
   ============================================ */
/**
 * KnowledgeSearch — "שאל את המוח"
 *
 * Provides a search box where users can ask questions.
 * Uses RAG pipeline to find relevant knowledge and generate answers.
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Sparkles, FileText, AlertCircle } from 'lucide-react';
import {
  initializeRAG, askWithKnowledge, queryKnowledge,
  getRAGStatus, getChunkCount, type RAGStatus,
} from '../../../services/ragService';
import { isAIConfigured } from '../../../services/geminiService';
import type { KnowledgeChunk } from '../../../services/knowledgeChunker';

// #region Types

interface SearchResult {
  answer: string;
  sources: KnowledgeChunk[];
}

// #endregion

// #region Component

/**
 * KnowledgeSearch — search box + AI answer + source citations.
 * Initializes RAG on first render if not already ready.
 */
export default function KnowledgeSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [ragState, setRagState] = useState<RAGStatus>(getRAGStatus());
  const [chunkCount, setChunkCount] = useState(getChunkCount());
  const [error, setError] = useState('');

  // Initialize RAG on mount if not ready
  useEffect(() => {
    const currentStatus = getRAGStatus();
    if (currentStatus === 'idle') {
      initializeRAG().then((status) => {
        setRagState(status);
        setChunkCount(getChunkCount());
      });
    } else {
      setRagState(currentStatus);
      setChunkCount(getChunkCount());
    }
  }, []);

  /** Handle search submission */
  const handleSearch = useCallback(async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Run RAG query and source retrieval in parallel
      const [answer, sources] = await Promise.all([
        askWithKnowledge(query.trim()),
        queryKnowledge(query.trim(), 3),
      ]);

      setResult({ answer, sources });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'שגיאה לא צפויה';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  const aiReady = isAIConfigured();

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(59,130,246,0.2)',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(30,41,59,0.95))',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(59,130,246,0.15)',
      }}>
        <Sparkles size={18} color="#60a5fa" />
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#60a5fa' }}>
          🔍 שאל את המוח
        </span>
        <StatusBadge status={ragState} chunkCount={chunkCount} />
      </div>

      {/* Search Input */}
      <div style={{ padding: '12px 18px', display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={aiReady
            ? 'מה ההנחיות לביטול קנס? איך מחשבים רווח הון?'
            : 'מפתח Gemini לא מוגדר — חיפוש מוגבל'
          }
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(59,130,246,0.2)',
            color: '#e2e8f0', fontSize: '0.88rem',
            fontFamily: 'Heebo, sans-serif',
            direction: 'rtl', outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          style={{
            padding: '10px 18px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700,
            background: query.trim() ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${query.trim() ? '#60a5fa' : 'rgba(255,255,255,0.1)'}`,
            color: query.trim() ? '#60a5fa' : '#64748b',
            cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
            fontFamily: 'Heebo, sans-serif', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.2s',
          }}
        >
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
          {loading ? 'חושב...' : 'שאל'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8,
          color: '#f87171', fontSize: '0.82rem',
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Answer */}
      {result && (
        <div style={{ padding: '0 18px 14px' }}>
          {/* AI Answer */}
          <div style={{
            padding: '14px 16px', borderRadius: 10,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.15)',
            marginBottom: 10,
          }}>
            <div style={{
              fontSize: '0.84rem', lineHeight: 1.7, color: '#e2e8f0',
              direction: 'rtl', whiteSpace: 'pre-wrap',
            }}>
              {result.answer}
            </div>
          </div>

          {/* Sources */}
          {result.sources.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
                marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <FileText size={12} /> מקורות ({result.sources.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.sources.map((src, i) => (
                  <div key={i} style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }}>
                    📄 {src.sourceFile} — {src.sectionTitle}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// #endregion

// #region Sub-components

/** RAG status indicator badge */
function StatusBadge({ status, chunkCount }: { status: RAGStatus; chunkCount: number }) {
  const config: Record<RAGStatus, { label: string; color: string; bg: string }> = {
    idle: { label: 'טוען...', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
    indexing: { label: 'מאנדקס...', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    ready: { label: `${chunkCount} חלקים`, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
    fallback: { label: 'חיפוש מילים', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    error: { label: 'שגיאה', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  };

  const { label, color, bg } = config[status];

  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700,
      padding: '2px 8px', borderRadius: 10,
      background: bg, color, marginRight: 'auto',
    }}>
      {label}
    </span>
  );
}

// #endregion
