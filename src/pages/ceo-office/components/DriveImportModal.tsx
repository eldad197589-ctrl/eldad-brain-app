/* ============================================
   FILE: DriveImportModal.tsx
   PURPOSE: DriveImportModal component
   DEPENDENCIES: react, lucide-react
   EXPORTS: DriveImportModal (default)
   ============================================ */
/**
 * FILE: DriveImportModal.tsx
 * PURPOSE: Browse and import files directly from Google Drive into the Document Intake system
 * DEPENDENCIES: brainStore, driveService
 */

import { useState, useEffect } from 'react';
import { X, Search, FileText, Download, Loader2, Folder, HardDrive } from 'lucide-react';
import { useBrainStore } from '../../../store/brainStore';
import { listRecentFiles, type DriveFile } from '../../../services/driveService';
import { extractIsraelDomainOrEntity } from '../../../services/emailClassifier';

// #region Types
interface Props {
  onClose: () => void;
}
// #endregion

// #region Component
export default function DriveImportModal({ onClose }: Props) {
  const addDocument = useBrainStore((s) => s.addDocument);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState<string | null>(null);

  // Fetch initial files
  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Pass 20 as maxResults, and searchQuery as the query string
      const results = await listRecentFiles(20, searchQuery);
      setFiles(results);
    } catch (err) {
      console.error('Error fetching drive files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file: DriveFile) => {
    setImporting(file.id);
    try {
      // Download the file metadata to local store logic
      // In a real app we might upload it to our own backend.
      // Here we create a document entry representing this Drive file.
      
      // Basic classifier for the document based on filename
      let docType = 'other';
      if (file.name.includes('חשבונית') || file.name.includes('קבלה')) docType = 'supplier_invoice';
      else if (file.name.includes('הסכם') || file.name.includes('חוזה')) docType = 'contract';
      else if (file.name.includes('מס') || file.name.includes('שומה')) docType = 'tax_notice';

      const linkedEntity = extractIsraelDomainOrEntity(file.name) || 'כללי';

      addDocument({
        description: `יובא מדרייב: ${file.name}`,
        docType,
        source: 'scan', // mapped to scan or drive
        linkedTo: linkedEntity,
        status: 'pending',
      });

      // Remove from list after import
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (err) {
      console.error('Import failed', err);
    } finally {
      setImporting(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%', maxWidth: 700, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: 20, border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(16,185,129,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={22} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>ייבוא מ-Google Drive</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>סריקה וייבוא קבצים ישירות מסביבת הדרייב לאינבוקס</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="#64748b" />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '16px 24px', display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '0 12px',
          }}>
            <Search size={16} color="#64748b" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="חיפוש קבצים בדרייב..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#e2e8f0', fontSize: '0.9rem', padding: '10px 0',
                fontFamily: 'Heebo, sans-serif'
              }}
            />
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            style={{
              background: '#10b981', color: '#fff', border: 'none', borderRadius: 8,
              padding: '0 20px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif'
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'חפש'}
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading && files.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#64748b' }}>
              <Loader2 size={32} className="animate-spin" style={{ marginBottom: 12 }} />
              <span>סורק קבצים בדרייב...</span>
            </div>
          )}

          {!loading && files.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <Folder size={48} opacity={0.3} style={{ margin: '0 auto 12px' }} />
              <div>לא נמצאו קבצים מתאימים בדרייב</div>
            </div>
          )}

          {files.map((file) => (
            <div
              key={file.id}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 8, background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <FileText size={24} color="#10b981" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    textDecoration: 'none', display: 'block'
                  }}
                >
                  {file.name}
                </a>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                  {file.mimeType.split('/').pop()?.toUpperCase()}
                </div>
              </div>

              <button
                onClick={() => handleImport(file)}
                disabled={importing === file.id}
                style={{
                  background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600,
                  cursor: importing === file.id ? 'default' : 'pointer', fontFamily: 'Heebo, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: importing === file.id ? 0.6 : 1
                }}
              >
                {importing === file.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {importing === file.id ? 'קולט...' : 'קלוט מסמך'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// #endregion
