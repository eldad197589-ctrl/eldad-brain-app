/**
 * FILE: BrainLearnedBlock.tsx
 * PURPOSE: Shows what the brain learned today + quick input to add knowledge
 * DEPENDENCIES: brainStore
 *
 * Per MASTER_BRAIN_INSTRUCTIONS Part 6:
 * "🧠 המוח למד — עדכוני ידע שנוספו היום"
 * Empty = shows 0. Not fake examples.
 */

import { useState, useMemo } from 'react';
import { Brain, Plus, Send } from 'lucide-react';
import { useBrainStore, type KnowledgeEntry } from '../../../store/brainStore';

// #region Component

/**
 * BrainLearnedBlock — Shows today's knowledge + quick add input.
 * If nothing was learned today — shows input invitation.
 */
export default function BrainLearnedBlock() {
  const knowledgeLog = useBrainStore((s) => s.knowledgeLog);
  const addKnowledge = useBrainStore((s) => s.addKnowledge);

  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');

  /** Filter entries from today only */
  const todayEntries = useMemo<KnowledgeEntry[]>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return knowledgeLog.filter((e) => e.timestamp.startsWith(todayStr));
  }, [knowledgeLog]);

  /** Add a quick knowledge entry */
  const handleAdd = () => {
    if (!inputText.trim()) return;
    addKnowledge({
      summary: inputText.trim(),
      source: 'conversation',
      layer: 'knowledge',
    });
    setInputText('');
    setShowInput(false);
  };

  return (
    <div style={{
      marginBottom: 16, borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(139,92,246,0.2)',
      background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(30,41,59,0.95))',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(139,92,246,0.15)',
      }}>
        <Brain size={18} color="#a78bfa" />
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#a78bfa' }}>
          🧠 המוח למד היום
        </span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
          borderRadius: 10, background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
          marginRight: 'auto',
        }}>
          {todayEntries.length}
        </span>
        <button
          onClick={() => setShowInput(!showInput)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            color: '#a78bfa', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          }}
        >
          <Plus size={12} /> הוסף ידע
        </button>
      </div>

      {/* Quick Add Input */}
      {showInput && (
        <div style={{
          padding: '10px 18px', borderBottom: '1px solid rgba(139,92,246,0.1)',
          display: 'flex', gap: 8,
        }}>
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="מה למדת היום? (לדוגמה: נוהל חדש לקליטת ספק)"
            autoFocus
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)',
              color: '#e2e8f0', fontSize: '0.82rem', fontFamily: 'Heebo, sans-serif',
              direction: 'rtl', outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!inputText.trim()}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
              background: inputText.trim() ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${inputText.trim() ? '#a78bfa' : 'rgba(255,255,255,0.1)'}`,
              color: inputText.trim() ? '#a78bfa' : '#64748b',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'Heebo, sans-serif', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Send size={12} /> שמור
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '10px 18px' }}>
        {todayEntries.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '12px 0',
            fontSize: '0.82rem', color: '#64748b',
          }}>
            אין עדכוני ידע להיום. לחץ "הוסף ידע" למעלה.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayEntries.map((entry) => (
              <div key={entry.id} style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.1)',
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c4b5fd' }}>
                  {entry.summary}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                  {entry.source} · שכבה {entry.layer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// #endregion
