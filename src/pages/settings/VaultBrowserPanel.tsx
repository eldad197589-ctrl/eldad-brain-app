import { useState, useEffect } from 'react';
import { Search, Folder, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { localVaultService, ManagedLocalFolder, LocalFileReference, FolderCategory } from '../../services/localVaultService';
import { useLocalVaultStore } from '../../store/localVaultStore';

export default function VaultBrowserPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [extensionFilter, setExtensionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FolderCategory | ''>('');
  const [extensions, setExtensions] = useState<Array<{ ext: string; count: number }>>([]);
  
  const [folders, setFolders] = useState<ManagedLocalFolder[]>([]);
  const [files, setFiles] = useState<LocalFileReference[]>([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const vaultStatus = useLocalVaultStore(s => s.status);
  const lastIndexedAt = useLocalVaultStore(s => s.lastIndexedAt);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load extensions on open
  useEffect(() => {
    if (isOpen) {
      localVaultService.getExtensionSummary().then(setExtensions);
    }
  }, [isOpen]);

  // Perform search / list
  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        if (!debouncedQuery && !extensionFilter && !categoryFilter) {
          // Empty search -> list root
          const rootContents = await localVaultService.listFolderContents('');
          if (isActive) {
            setFolders(rootContents.subfolders);
            setFiles(rootContents.files);
            setTotalMatched(rootContents.subfolders.length + rootContents.files.length);
          }
        } else {
          // Search or filter
          const results = await localVaultService.searchIndex(debouncedQuery, { extensionFilter, categoryFilter: categoryFilter as FolderCategory || undefined });
          if (isActive) {
            setFolders(results.folders);
            setFiles(results.files);
            setTotalMatched(results.totalMatched);
          }
        }
      } catch (err) {
        console.error('Vault search failed', err);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      isActive = false;
    };
  }, [isOpen, debouncedQuery, extensionFilter, categoryFilter]);

  if (vaultStatus !== 'connected' || !lastIndexedAt) {
    return null;
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('he-IL');
  };

  const getCategoryBadge = (category?: string) => {
    switch(category) {
      case 'client': return <span style={{ fontSize: '0.6rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 4px', borderRadius: 4 }}>לקוח</span>;
      case 'generated_output': return <span style={{ fontSize: '0.6rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 4px', borderRadius: 4 }}>תוצר</span>;
      case 'archive': return <span style={{ fontSize: '0.6rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 4px', borderRadius: 4 }}>ארכיון</span>;
      case 'app_source': return <span style={{ fontSize: '0.6rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 4px', borderRadius: 4 }}>קוד</span>;
      case 'system': return <span style={{ fontSize: '0.6rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 4px', borderRadius: 4 }}>מערכת</span>;
      case 'unknown': return <span style={{ fontSize: '0.6rem', color: '#64748b', background: 'rgba(100, 116, 139, 0.1)', padding: '2px 4px', borderRadius: 4 }}>לא מסווג</span>;
      default: return null;
    }
  };

  return (
    <div style={{
      marginTop: 12, padding: '14px 16px', borderRadius: 10,
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'
    }}>
      {/* Header */}
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
          🔍 דפדפן אינדקס מקומי
        </span>
        {isOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </div>

      {/* Body */}
      {isOpen && (
        <div style={{ marginTop: 16 }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', right: 10, top: 10 }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="חפש קובץ או תיקייה..."
                style={{
                  width: '100%', padding: '8px 30px 8px 10px', borderRadius: 6,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as FolderCategory | '')}
              style={{
                padding: '8px 12px', borderRadius: 6,
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', fontSize: '0.8rem', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="">כל הקטגוריות</option>
              <option value="client">לקוח</option>
              <option value="generated_output">תוצר</option>
              <option value="archive">ארכיון</option>
              <option value="app_source">קוד</option>
              <option value="system">מערכת</option>
              <option value="unknown">לא מסווג</option>
            </select>
            <select
              value={extensionFilter}
              onChange={e => setExtensionFilter(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 6,
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', fontSize: '0.8rem', outline: 'none', cursor: 'pointer', direction: 'ltr'
              }}
            >
              <option value="">כל הסוגים</option>
              {extensions.map(e => (
                <option key={e.ext} value={e.ext}>.{e.ext} ({e.count})</option>
              ))}
            </select>
          </div>

          {/* Results Area */}
          <div style={{
            background: 'rgba(0,0,0,0.15)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)',
            maxHeight: 300, overflowY: 'auto'
          }}>
            {isLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>טוען...</div>
            ) : folders.length === 0 && files.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>לא נמצאו תוצאות.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {folders.map(folder => (
                  <div key={'folder-' + folder.relativePath} style={{
                    display: 'flex', alignItems: 'center', padding: '8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.02)', gap: 10
                  }}>
                    <Folder size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {folder.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getCategoryBadge(folder.inferredCategory)}
                        <div style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', direction: 'ltr', textAlign: 'right' }}>
                          {folder.relativePath}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {files.map(file => (
                  <div key={'file-' + file.relativePath} style={{
                    display: 'flex', alignItems: 'center', padding: '8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.02)', gap: 10
                  }}>
                    <FileText size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getCategoryBadge(file.inferredCategory)}
                        <div style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', direction: 'ltr', textAlign: 'right' }}>
                          {file.relativePath}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.65rem', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                        {file.extension.toUpperCase() || 'FILE'}
                      </span>
                      {file.size && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b', width: 45, textAlign: 'left' }}>
                          {formatSize(file.size)}
                        </span>
                      )}
                      {file.lastModified && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b', width: 65, textAlign: 'left' }}>
                          {formatDate(file.lastModified)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer info */}
          {!isLoading && (folders.length > 0 || files.length > 0) && (
            <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#64748b', textAlign: 'left' }}>
              מציג {folders.length + files.length} מתוך {totalMatched} תוצאות
            </div>
          )}
        </div>
      )}
    </div>
  );
}
