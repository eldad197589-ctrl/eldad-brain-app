/* ============================================
   FILE: Settings.tsx
   PURPOSE: Settings component
   DEPENDENCIES: react, lucide-react
   EXPORTS: Settings (default)
   ============================================ */
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
  signInWithGoogle, signOutGoogle,
} from '../../services/gmailService';
import { useIntegrationStore } from '../../store/integrationStore';
import { useLocalVaultStore } from '../../store/localVaultStore';
import VaultBrowserPanel from './VaultBrowserPanel';
import { Database } from 'lucide-react';

// #region Component
const liveIntegrationsFrozen = true;
const freezeMessage = 'Live integrations disabled — requires Agent A approval';

/**
 * Settings page — integration cards for Gmail, Drive, WhatsApp, Gemini.
 */
export default function Settings() {
  const storeClientId = useIntegrationStore((s) => s.googleClientId);
  const token = useIntegrationStore((s) => s.googleAccessToken);
  const setStoreClientId = useIntegrationStore((s) => s.setGoogleClientId);

  const gmailConnected = !!token;
  const driveConnected = !!token;
  const aiConfigured = !!import.meta.env.VITE_GEMINI_API_KEY;
  
  const [clientId, setClientId] = useState(storeClientId);
  const [showClientIdInput, setShowClientIdInput] = useState(false);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const vaultStatus = useLocalVaultStore(s => s.status);
  const vaultLabel = useLocalVaultStore(s => s.label);
  const isScanning = useLocalVaultStore(s => s.isScanning);
  const scannedFolders = useLocalVaultStore(s => s.scannedFolders);
  const scannedFiles = useLocalVaultStore(s => s.scannedFiles);
  const currentPath = useLocalVaultStore(s => s.currentPath);
  const lastIndexedAt = useLocalVaultStore(s => s.lastIndexedAt);
  const totalFolders = useLocalVaultStore(s => s.totalFolders);
  const totalFiles = useLocalVaultStore(s => s.totalFiles);
  
  const initVault = useLocalVaultStore(s => s.initVault);
  const connectVaultRoot = useLocalVaultStore(s => s.connectRoot);
  const checkVaultPermission = useLocalVaultStore(s => s.checkPermission);
  const disconnectVaultRoot = useLocalVaultStore(s => s.disconnectRoot);
  const startIndexScan = useLocalVaultStore(s => s.startIndexScan);
  const clearVaultIndex = useLocalVaultStore(s => s.clearIndex);

  /** Refresh statuses */
  useEffect(() => {
    if (!liveIntegrationsFrozen) initVault();
  }, [initVault]);

  /** Save Google Client ID */
  const handleSaveClientId = () => {
    if (liveIntegrationsFrozen) return;
    if (!clientId.trim()) return;
    setStoreClientId(clientId.trim());
    setShowClientIdInput(false);
    setSuccess('Client ID נשמר בהצלחה!');
    setTimeout(() => setSuccess(''), 3000);
  };

  /** Connect Gmail */
  const handleConnectGmail = async () => {
    if (liveIntegrationsFrozen) return;
    if (!storeClientId) {
      setShowClientIdInput(true);
      setError('הכנס Google Client ID קודם');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setLoading('gmail');
    setError('');
    try {
      await signInWithGoogle();
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
    if (liveIntegrationsFrozen) return;
    signOutGoogle();
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
      <div data-testid="settings-live-freeze-banner" style={{ marginBottom: 16, padding: '12px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fecaca', fontWeight: 800 }}>{freezeMessage}</div>
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
              disabled={liveIntegrationsFrozen}
              placeholder="xxx.apps.googleusercontent.com"
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', fontSize: '0.82rem', fontFamily: 'monospace',
                direction: 'ltr', outline: 'none',
              }}
            />
            <button onClick={handleSaveClientId} disabled={liveIntegrationsFrozen} style={btnStyle('#64748b')}>שמור</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <code style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {clientId.slice(0, 20)}...
            </code>
            <button onClick={() => setShowClientIdInput(true)} disabled={liveIntegrationsFrozen} style={btnStyle('#64748b')}>
              שנה
            </button>
          </div>
        )}
      </div>

      {/* Integration Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {/* Local Brain Vault */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <IntegrationCard
            icon={<Database size={22} color="#10b981" />}
            title="📁 תיקיית המוח המקומית"
            description={vaultLabel ? `מחובר לתיקייה: ${vaultLabel}` : 'חיבור לספריית האם (המוח של אלדד)'}
            connected={vaultStatus === 'connected'}
            loading={false}
            onConnect={vaultStatus === 'permission_required' ? checkVaultPermission : connectVaultRoot}
            connectLabel={vaultStatus === 'permission_required' ? '🔓 אישור הרשאה' : '🔌 חבר תיקייה'}
            onDisconnect={disconnectVaultRoot}
            note={
              vaultStatus === 'unsupported' ? 'הדפדפן לא תומך ב-File System API' :
              vaultStatus === 'permission_required' ? 'נדרש אישור מחודש של הדפדפן' :
              vaultStatus === 'denied' ? 'אין הרשאה לתיקייה' :
              'גישה ישירה למערכת הקבצים ללא העלאה'
            }
            disabled
          />
          
          {/* Index Scan Sub-Panel */}
          {vaultStatus === 'connected' && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>אינדקס קבצים</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {lastIndexedAt && !isScanning && (
                    <button onClick={clearVaultIndex} disabled style={{ ...btnStyle('#64748b'), padding: '4px 10px', fontSize: '0.7rem' }}>נקה אינדקס</button>
                  )}
                  <button 
                    onClick={startIndexScan} 
                    disabled
                    style={{ ...btnStyle('#64748b'), padding: '4px 10px', fontSize: '0.7rem' }}
                  >
                    {isScanning ? '⏳ סורק...' : '🔍 סרוק אינדקס'}
                  </button>
                </div>
              </div>
              
              {isScanning ? (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>
                    סורק: {scannedFolders} תיקיות, {scannedFiles} קבצים
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', direction: 'ltr', textAlign: 'right' }}>
                    {currentPath || '...'}
                  </div>
                </div>
              ) : lastIndexedAt ? (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  <div style={{ marginBottom: 2 }}>עודכן לאחרונה: {new Date(lastIndexedAt).toLocaleString('he-IL')}</div>
                  <div>סה"כ: {totalFolders} תיקיות, {totalFiles} קבצים</div>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>טרם נסרק אינדקס.</div>
              )}
            </div>
          )}

          {/* Vault Browser */}
          <VaultBrowserPanel />
        </div>

        {/* Gmail */}
        <IntegrationCard
          icon={<Mail size={22} color="#ef4444" />}
          title="📧 Gmail"
          description="קליטת מיילים, קבצים מצורפים, סיווג אוטומטי"
          connected={gmailConnected}
          loading={loading === 'gmail'}
          onConnect={handleConnectGmail}
          onDisconnect={handleDisconnectGmail}
          disabled
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
          disabled
        />

        {/* Gemini */}
        <IntegrationCard
          icon={<Brain size={22} color="#a78bfa" />}
          title="🧠 Gemini AI"
          description="ניתוח מסמכים, סיווג, ניסוח מכתבים"
          connected={aiConfigured}
          loading={false}
          onConnect={() => {}}
          note="Configuration visibility only — not a live connection check."
          statusText={aiConfigured ? 'Gemini env key detected' : 'Gemini env key missing'}
          disabled
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
  connectLabel?: string;
  statusText?: string;
}

/** Integration card */
function IntegrationCard({ icon, title, description, connected, loading, onConnect, onDisconnect, note, disabled, connectLabel, statusText }: CardProps) {
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
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>{statusText || '✅ מחובר'}</span>
            {onDisconnect && (
              <button onClick={onDisconnect} disabled={disabled} style={btnStyle(disabled ? '#64748b' : '#ef4444')}>נתק</button>
            )}
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={disabled || loading}
            style={btnStyle(disabled ? '#475569' : '#3b82f6')}
          >
            {loading ? '⏳ מתחבר...' : (connectLabel || '🔌 חבר')}
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
