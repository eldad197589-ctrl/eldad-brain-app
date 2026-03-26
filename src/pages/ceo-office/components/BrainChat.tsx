/* ============================================
   FILE: BrainChat.tsx
   PURPOSE: BrainChat component
   DEPENDENCIES: react, lucide-react
   EXPORTS: BrainChat (default)
   ============================================ */
/**
 * BrainChat — AI Agent Chat Panel for CEO Office
 *
 * A chat interface that connects to the Brain AI (Gemini).
 * Can be contextual (process-specific) or general (Brain Router mode).
 *
 * @example
 * <BrainChat processId="war_compensation" />
 */

// #region Imports
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Bot, User, Loader2, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import { sendBrainMessage, isAIConfigured, type ChatMessage } from '../../../services/geminiService';
import { PROCESS_REGISTRY } from '../../../data/processRegistry';
// #endregion

// #region Types
interface Props {
  /** Optional: lock chat to a specific process context */
  processId?: string;
}

const QUICK_PROMPTS = [
  { label: '🔍 מה התהליכים הזמינים?', prompt: 'מה התהליכים הזמינים במערכת? תן לי רשימה עם תיאור קצר של כל אחד.' },
  { label: '📋 עזור לי עם פיצויי מלחמה', prompt: 'אני רוצה להתחיל תהליך פיצויי מלחמה. מה המסמכים שאני צריך להכין?' },
  { label: '📊 מה הסטטוס של התיקים?', prompt: 'עזור לי לסקור את המצב הנוכחי של התיקים שלי. מה דחוף?' },
  { label: '✉️ כתוב מכתב לבנק', prompt: 'אני צריך מכתב מקצועי לבנק בנושא שחרור כספים ממכירת נכס. תעזור לי לנסח?' },
];
// #endregion

// #region Component
/** BrainChat component — BrainChat component */
export default function BrainChat({ processId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const configured = isAIConfigured();

  const processName = processId
    ? PROCESS_REGISTRY.find(p => p.id === processId)?.name
    : undefined;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendBrainMessage(messages, msg, processId);
      const aiMsg: ChatMessage = {
        role: 'model',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, processId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer',
          background: expanded ? 'rgba(124,58,237,0.08)' : 'transparent',
          borderBottom: expanded ? '1px solid rgba(124,58,237,0.15)' : 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="#a78bfa" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            {processName ? `🤖 סוכן AI — ${processName}` : '🧠 דבר עם המוח'}
          </h3>
          {configured && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#34d399',
            }}>
              Gemini מחובר
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {messages.length > 0 && expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); clearChat(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              title="נקה שיחה"
            >
              <X size={14} color="#64748b" />
            </button>
          )}
          {expanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Messages Area */}
          <div style={{
            height: 350, overflowY: 'auto', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Bot size={40} color="#a78bfa" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 16px' }}>
                  {processName
                    ? `סוכן ה-AI מוכן לעזור לך עם ${processName}`
                    : 'שאל אותי כל שאלה — אנתח, אכתוב, ואנווט אותך'}
                </p>

                {/* Quick prompts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 380, margin: '0 auto' }}>
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(qp.prompt)}
                      style={{
                        padding: '8px 14px', borderRadius: 10, fontSize: '0.8rem',
                        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
                        color: '#c4b5fd', cursor: 'pointer', textAlign: 'right',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 8,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(124,58,237,0.2)',
                }}>
                  {msg.role === 'user'
                    ? <User size={14} color="#60a5fa" />
                    : <Bot size={14} color="#a78bfa" />
                  }
                </div>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
                  fontSize: '0.85rem', lineHeight: 1.6,
                  background: msg.role === 'user'
                    ? 'rgba(59,130,246,0.1)'
                    : 'rgba(124,58,237,0.08)',
                  border: `1px solid ${msg.role === 'user'
                    ? 'rgba(59,130,246,0.2)'
                    : 'rgba(124,58,237,0.15)'}`,
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  direction: 'rtl',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(124,58,237,0.2)',
                }}>
                  <Loader2 size={14} color="#a78bfa" className="spin" />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontStyle: 'italic' }}>
                  המוח חושב...
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 8, fontSize: '0.78rem',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', direction: 'ltr',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}>
            <MessageSquare size={16} color="#64748b" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={processName ? `שאל את הסוכן על ${processName}...` : 'שאל את המוח...'}
              disabled={isLoading || !configured}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#e2e8f0', fontSize: '0.88rem', fontFamily: 'inherit',
                direction: 'rtl',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || !configured}
              style={{
                background: input.trim() ? 'rgba(124,58,237,0.3)' : 'transparent',
                border: '1px solid',
                borderColor: input.trim() ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Send size={16} color={input.trim() ? '#a78bfa' : '#64748b'} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
// #endregion
