/* ============================================
   FILE: BrainChat.tsx
   PURPOSE: Floating AI chat panel — talk to the Brain from any page
   DEPENDENCIES: react, lucide-react, geminiService, ragService
   EXPORTS: BrainChat (default)
   ============================================ */
/**
 * BrainChat — "דבר עם המוח"
 *
 * Floating chat panel accessible from any page via a FAB button.
 * Uses RAG to ground answers in the knowledge base.
 * Persists chat history in memory during the session.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, Loader2, Brain,
  Minimize2, Maximize2,
} from 'lucide-react';
import {
  sendBrainMessage, isAIConfigured,
  type ChatMessage,
} from '../services/geminiService';
import {
  queryKnowledge, initializeRAG, getRAGStatus,
} from '../services/ragService';
import type { KnowledgeChunk } from '../services/knowledgeChunker';

// #region Component

/** BrainChat — floating chat with AI Brain */
export default function BrainChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiReady = isAIConfigured();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ensure RAG is initialized when chat opens
  useEffect(() => {
    if (isOpen && getRAGStatus() === 'idle') {
      initializeRAG();
    }
  }, [isOpen]);

  /** Send a message */
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading || !aiReady) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Get RAG context for the question
      const ragChunks = await queryKnowledge(input.trim(), 3);
      const knowledgeContext = ragChunks.length > 0
        ? ragChunks.map((c: KnowledgeChunk, i: number) =>
            `[מקור ${i + 1}: ${c.sourceFile} — ${c.sectionTitle}]\n${c.content}`
          ).join('\n\n---\n\n')
        : undefined;

      // Send to Gemini with history + RAG context
      const response = await sendBrainMessage(
        messages,
        input.trim(),
        undefined,
        knowledgeContext,
      );

      const aiMsg: ChatMessage = {
        role: 'model',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);

      // If chat is closed, increment unread
      if (!isOpen) setUnread(prev => prev + 1);
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'model',
        content: `שגיאה: ${err instanceof Error ? err.message : 'לא ניתן לעבד את הבקשה'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, aiReady, messages, isOpen]);

  /** Toggle chat open/close */
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnread(0);
  };

  const panelWidth = isMaximized ? 520 : 380;
  const panelHeight = isMaximized ? '80vh' : '500px';

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          style={{
            position: 'fixed', bottom: 24, left: 24, zIndex: 1000,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #b8942f)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,168,76,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.4)';
          }}
        >
          <Brain size={26} color="#1e293b" />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 20, height: 20, borderRadius: '50%',
              background: '#ef4444', color: '#fff',
              fontSize: '0.65rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 1000,
          width: panelWidth, height: panelHeight,
          borderRadius: 16, overflow: 'hidden',
          background: 'linear-gradient(180deg, #1a2332, #0f172a)',
          border: '1px solid rgba(201,168,76,0.3)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s, height 0.3s',
        }}>
          {/* Panel Header */}
          <div style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(30,41,59,0.95))',
            borderBottom: '1px solid rgba(201,168,76,0.2)',
          }}>
            <Brain size={20} color="#c9a84c" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#c9a84c', flex: 1 }}>
              דבר עם המוח
            </span>
            <button onClick={() => setIsMaximized(!isMaximized)} style={iconBtnStyle}>
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button onClick={toggleChat} style={iconBtnStyle}>
              <X size={14} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: '#64748b', fontSize: '0.82rem',
              }}>
                <Brain size={40} color="#c9a84c" style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontWeight: 700, marginBottom: 4, color: '#94a3b8' }}>
                  שלום אלדד! 👋
                </div>
                <div>שאל אותי מה שתרצה — אני מכיר את כל הידע במערכת</div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {loading && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(201,168,76,0.08)',
                alignSelf: 'flex-end',
              }}>
                <Loader2 size={14} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.78rem', color: '#c9a84c' }}>חושב...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={aiReady ? 'שאל את המוח...' : 'API key לא מוגדר'}
              disabled={loading || !aiReady}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,168,76,0.15)',
                color: '#e2e8f0', fontSize: '0.84rem',
                fontFamily: 'Heebo, sans-serif',
                direction: 'rtl', outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || !aiReady}
              style={{
                padding: '10px 14px', borderRadius: 10,
                background: input.trim() && aiReady
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.3))'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${input.trim() && aiReady ? '#c9a84c' : 'rgba(255,255,255,0.08)'}`,
                color: input.trim() && aiReady ? '#c9a84c' : '#64748b',
                cursor: input.trim() && !loading && aiReady ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// #endregion

// #region Sub-components

/** Single chat message bubble */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end',
    }}>
      <div style={{
        maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
        background: isUser
          ? 'rgba(59,130,246,0.12)'
          : 'rgba(201,168,76,0.08)',
        border: `1px solid ${isUser ? 'rgba(59,130,246,0.2)' : 'rgba(201,168,76,0.15)'}`,
        borderBottomLeftRadius: isUser ? 4 : 12,
        borderBottomRightRadius: isUser ? 12 : 4,
      }}>
        {!isUser && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4,
          }}>
            <Brain size={12} color="#c9a84c" />
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#c9a84c' }}>המוח</span>
          </div>
        )}
        <div style={{
          fontSize: '0.82rem', lineHeight: 1.65, color: '#e2e8f0',
          direction: 'rtl', whiteSpace: 'pre-wrap',
        }}>
          {message.content}
        </div>
        <div style={{
          fontSize: '0.6rem', color: '#475569', marginTop: 4,
          textAlign: isUser ? 'left' : 'right',
        }}>
          {new Date(message.timestamp).toLocaleTimeString('he-IL', {
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

/** Icon button style helper */
const iconBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6, padding: 6, cursor: 'pointer',
  color: '#94a3b8', display: 'flex', alignItems: 'center',
};

// #endregion
