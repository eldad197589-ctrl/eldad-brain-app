/**
 * FILE: Settings.tsx
 * PURPOSE: Integrations & settings dashboard — connect Gmail, Drive, configure API keys
 * DEPENDENCIES: gmailService, driveService, geminiService
 *
 * Per doctrine: "לשכת מנכ"ל מחוברת לכל הערוצים"
 */

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, HardDrive, MessageSquare, Brain, CheckCircle, XCircle, Key } from 'lucide-react';
import {
  isGmailConnected, signInWithGoogle, signOutGoogle,
  getGoogleClientId, setGoogleClientId,
} from '../../services/gmailService';
import { isDriveConnected } from '../../services/driveService';
import { isAIConfigured } from '../../services/geminiService';

// #region Component

/**
 * Settings page — integration cards for Gmail, Drive, WhatsApp, Gemini.
 */
export default function Settings() {
  const [gmailConnected, setGmailConnected] = useState(isGmailConnected());
  const [driveConnected, setDriveConnected] = useState(isDriveConnected());
  const [aiConfigured, setAiConfigured] = useState(isAIConfigured());
  const [clientId, setClientId] = useState(getGoogleClientId());
  const [showClientIdInput, setShowClientIdInput] = useState(false);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /** Refresh statuses */
  useEffect(() => {
    setGmailConnected(isGmailConnected());
    setDriveConnected(isDriveConnected());
    setAiConfigured(isAIConfigured());
  }, []);

  /** Save Google Client ID */
  const handleSaveClientId = () => {
    if (!clientId.trim()) return;
    setGoogleClientId(clientId.trim());
    setShowClientIdInput(false);
    setSuccess('Client ID נשמר בהצלחה!');
    setTimeout(() => setSuccess(''), 3000);
  };

  /** Connect Gmail */
  const handleConnectGmail = async () => {
    if (!getGoogleClientId()) {
      setShowClientIdInput(true);
      setError('הכנס Google Client ID קודם');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setLoading('gmail');
    setError('');
    try {
      await signInWithGoogle();
      setGmailConnected(true);
      setDriveConnected(true); // Same token
      setSuccess('Gmail + Drive מחוברים!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`שגיאת Gmail: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setLoading('');
    }
  };

  /** Disconnect Gmail */
  const handleDisconnectGmail = () => {
    signOutGoogle();
    setGmailConnected(false);
    setDriveConnected(false);
    setSuccess('Gmail + Drive נותקו');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
        <SettingsIcon size={28} color="#c9a84c" />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
            ⚙️ הגדרות ואינטגרציות
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            חיבור ערוצים חיצוניים · Gmail · Drive · AI
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && <Notification text={error} type="error" />}
      {success && <Notification text={success} type="success" />}

      {/* Google Client ID Setup */}
      <div style={{
        marginBottom: 24, padding: '16px 20px', borderRadius: 12,
        background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Key size={16} color="#c9a84c" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#c9a84c' }}>
            Google Cloud Client ID
          </span>
          <span style={{
            fontSize: '0.68rem', padding: '2px 8px', borderRadius: 8, fontWeight: 600,
            background: clientId ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
            color: clientId ? '#34d399' : '#fbbf24',
          }}>
            {clientId ? '✅ מוגדר' : '⚠️ לא מוגדר'}
          </span>
        </div>

        {showClientIdInput || !clientId ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="xxx.apps.googleusercontent.com"
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', fontSize: '0.82rem', fontFamily: 'monospace',
                direction: 'ltr', outline: 'none',
              }}
            />
            <button onClick={handleSaveClientId} style={btnStyle('#c9a84c')}>שמור</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <code style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {clientId.slice(0, 20)}...
            </code>
            <button onClick={() => setShowClientIdInput(true)} style={btnStyle('#64748b')}>
              שנה
            </button>
          </div>
        )}
      </div>

      {/* Integration Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {/* Gmail */}
        <IntegrationCard
          icon={<Mail size={22} color="#ef4444" />}
          title="📧 Gmail"
          description="קליטת מיילים, קבצים מצורפים, סיווג אוטומטי"
          connected={gmailConnected}
          loading={loading === 'gmail'}
          onConnect={handleConnectGmail}
          onDisconnect={handleDisconnectGmail}
        />

        {/* Drive */}
        <IntegrationCard
          icon={<HardDrive size={22} color="#34d399" />}
          title="📁 Google Drive"
          description="גישה לקבצים, חיפוש מסמכים, הורדה"
          connected={driveConnected}
          loading={loading === 'drive'}
          onConnect={handleConnectGmail}
          onDisconnect={handleDisconnectGmail}
          note="מחובר דרך אותו OAuth כמו Gmail"
        />

        {/* Gemini */}
        <IntegrationCard
          icon={<Brain size={22} color="#a78bfa" />}
          title="🧠 Gemini AI"
          description="ניתוח מסמכים, סיווג, ניסוח מכתבים"
          connected={aiConfigured}
          loading={false}
          onConnect={() => window.open('https://aistudio.google.com/apikey', '_blank')}
          note="VITE_GEMINI_API_KEY ב-.env"
        />

        {/* WhatsApp */}
        <IntegrationCard
          icon={<MessageSquare size={22} color="#25D366" />}
          title="💬 WhatsApp Business"
          description="קליטת מסמכים מוואטסאפ, הודעות ללקוחות"
          connected={false}
          loading={false}
          onConnect={() => {}}
          note="דורש Google Apps Script webhook — בקרוב"
          disabled
        />
      </div>
    </div>
  );
}

// #endregion

// #region Sub-Components

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  loading: boolean;
  onConnect: () => void;
  onDisconnect?: () => void;
  note?: string;
  disabled?: boolean;
}

/** Integration card */
function IntegrationCard({ icon, title, description, connected, loading, onConnect, onDisconnect, note, disabled }: CardProps) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
      border: `1px solid ${connected ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.08)'}`,
      opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>{title}</span>
        {connected ? (
          <CheckCircle size={16} color="#34d399" style={{ marginRight: 'auto' }} />
        ) : (
          <XCircle size={16} color="#64748b" style={{ marginRight: 'auto' }} />
        )}
      </div>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 12px' }}>{description}</p>
      {note && (
        <p style={{ fontSize: '0.68rem', color: '#475569', margin: '0 0 10px', fontStyle: 'italic' }}>{note}</p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {connected ? (
          <>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>✅ מחובר</span>
            {onDisconnect && (
              <button onClick={onDisconnect} style={btnStyle('#ef4444')}>נתק</button>
            )}
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={disabled || loading}
            style={btnStyle(disabled ? '#475569' : '#3b82f6')}
          >
            {loading ? '⏳ מתחבר...' : '🔌 חבר'}
          </button>
        )}
      </div>
    </div>
  );
}

interface NotifProps {
  text: string;
  type: 'error' | 'success';
}

/** Toast notification */
function Notification({ text, type }: NotifProps) {
  const color = type === 'error' ? '#ef4444' : '#10b981';
  return (
    <div style={{
      padding: '10px 18px', borderRadius: 10, marginBottom: 16,
      background: `${color}12`, border: `1px solid ${color}30`,
      fontSize: '0.82rem', fontWeight: 600, color,
    }}>
      {type === 'error' ? '❌' : '✅'} {text}
    </div>
  );
}

/** Small button style */
function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
    background: `${color}15`, border: `1px solid ${color}40`,
    color, cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
  };
}

// #endregion
