/* ============================================
   FILE: CaseLocalDocuments.tsx
   PURPOSE: Phase 4 — read-only local vault documents panel for CaseView.
            Displays indexed file metadata matching the current case.
   DEPENDENCIES: react, lucide-react, localVaultService, localVaultStore, caseTypes
   EXPORTS: CaseLocalDocuments (default)
   ============================================ */

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Folder, FileText } from 'lucide-react';
import { localVaultService, LocalFileReference, ManagedLocalFolder, FolderCategory } from '../../../services/localVaultService';
import { useLocalVaultStore } from '../../../store/localVaultStore';
import type { CaseEntity } from '../../../data/caseTypes';

// #region Types

interface CaseLocalDocumentsProps {
  caseEntity: CaseEntity;
}

interface CategoryChip {
  key: FolderCategory;
  label: string;
  emoji: string;
}

// #endregion

// #region Constants

const CATEGORY_CHIPS: CategoryChip[] = [
  { key: 'client', label: 'לקוח', emoji: '📁' },
  { key: 'generated_output', label: 'תוצר', emoji: '📦' },
  { key: 'archive', label: 'ארכיון', emoji: '🗄️' },
  { key: 'unknown', label: 'אחר', emoji: '❓' },
];

const CATEGORY_COLORS: Record<string, string> = {
  client: '#10b981',
  generated_output: '#8b5cf6',
  archive: '#f59e0b',
  app_source: '#3b82f6',
  system: '#ef4444',
  unknown: '#64748b',
};

const MAX_RESULTS = 50;

// #endregion

// #region Helpers

/**
 * Build search tokens from case entity fields.
 * @returns deduplicated array, max 4 tokens.
 */
function buildSearchTokens(caseEntity: CaseEntity): string[] {
  const tokens: string[] = [];

  if (caseEntity.clientName) {
    const parts = caseEntity.clientName.split(/\s+/).filter(w => w.length >= 2);
    tokens.push(...parts);
  }
  if (caseEntity.officialCaseNumber) {
    tokens.push(caseEntity.officialCaseNumber);
  }
  if (caseEntity.caseId) {
    tokens.push(caseEntity.caseId);
  }

  // Deduplicate
  const unique = [...new Set(tokens)];
  return unique.slice(0, 4);
}

/** Format file size for display */
function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/** Format timestamp as he-IL date */
function formatDate(ts?: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('he-IL');
}

/** Get category badge JSX */
function getCategoryBadge(category?: string) {
  const color = category ? CATEGORY_COLORS[category] : '#64748b';
  const labels: Record<string, string> = {
    client: 'לקוח',
    generated_output: 'תוצר',
    archive: 'ארכיון',
    app_source: 'קוד',
    system: 'מערכת',
    unknown: 'לא מסווג',
  };
  const label = category ? labels[category] || category : '';
  if (!label) return null;
  return (
    <span style={{
      fontSize: '0.6rem', color, padding: '2px 5px', borderRadius: 4,
      background: `${color}18`,
    }}>
      {label}
    </span>
  );
}

// #endregion

// #region Component

/** CaseLocalDocuments — read-only panel showing locally-indexed files relevant to the case */
export default function CaseLocalDocuments({ caseEntity }: CaseLocalDocumentsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCategories, setActiveCategories] = useState<FolderCategory[]>(['client']);
  const [results, setResults] = useState<(LocalFileReference | ManagedLocalFolder)[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const vaultStatus = useLocalVaultStore(s => s.status);
  const lastIndexedAt = useLocalVaultStore(s => s.lastIndexedAt);

  const tokens = useMemo(() => buildSearchTokens(caseEntity), [caseEntity]);

  // Guard: don't render if vault not connected or no index
  if (vaultStatus !== 'connected' || !lastIndexedAt) {
    return null;
  }

  // Search effect
  useEffect(() => {
    if (!isOpen || tokens.length === 0 || activeCategories.length === 0) {
      setResults([]);
      setTotalFound(0);
      return;
    }

    let isActive = true;

    const runSearch = async () => {
      setIsLoading(true);
      try {
        // Accumulate results across tokens × categories
        const hitMap = new Map<string, { item: LocalFileReference | ManagedLocalFolder; hits: number }>();

        for (const category of activeCategories) {
          for (const token of tokens) {
            const res = await localVaultService.searchIndex(token, {
              categoryFilter: category,
              limit: 50,
            });
            if (!isActive) return;

            for (const file of res.files) {
              const existing = hitMap.get(file.relativePath);
              if (existing) {
                existing.hits++;
              } else {
                hitMap.set(file.relativePath, { item: file, hits: 1 });
              }
            }
            for (const folder of res.folders) {
              const existing = hitMap.get(folder.relativePath);
              if (existing) {
                existing.hits++;
              } else {
                hitMap.set(folder.relativePath, { item: folder, hits: 1 });
              }
            }
          }
        }

        if (!isActive) return;

        // Sort by hit count descending, then alphabetically
        const sorted = Array.from(hitMap.values())
          .sort((a, b) => {
            if (b.hits !== a.hits) return b.hits - a.hits;
            return a.item.name.localeCompare(b.item.name, 'he');
          })
          .slice(0, MAX_RESULTS)
          .map(entry => entry.item);

        setResults(sorted);
        setTotalFound(hitMap.size);
      } catch (err) {
        console.error('[CaseLocalDocuments] Search failed', err);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    runSearch();
    return () => { isActive = false; };
  }, [isOpen, tokens, activeCategories]);

  const toggleCategory = (cat: FolderCategory) => {
    setActiveCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const isFile = (item: LocalFileReference | ManagedLocalFolder): item is LocalFileReference => {
    return 'extension' in item;
  };

  return (
    <div style={{
      marginTop: 24, padding: '16px 20px', borderRadius: 10,
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 style={{
          margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          📂 מסמכים מקומיים
        </h3>
        {isOpen ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
      </div>

      {isOpen && (
        <div style={{ marginTop: 16 }}>
          {/* Category Chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {CATEGORY_CHIPS.map(chip => {
              const isActive = activeCategories.includes(chip.key);
              return (
                <button
                  key={chip.key}
                  onClick={() => toggleCategory(chip.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: '0.78rem',
                    border: `1px solid ${isActive ? CATEGORY_COLORS[chip.key] : 'rgba(255,255,255,0.1)'}`,
                    background: isActive ? `${CATEGORY_COLORS[chip.key]}18` : 'transparent',
                    color: isActive ? CATEGORY_COLORS[chip.key] : '#64748b',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{chip.emoji}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tokens debug line */}
          {tokens.length > 0 && (
            <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 10, direction: 'ltr', textAlign: 'right' }}>
              חיפוש: {tokens.join(' · ')}
            </div>
          )}

          {/* Results */}
          <div style={{
            background: 'rgba(0,0,0,0.15)', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.04)',
            maxHeight: 320, overflowY: 'auto',
          }}>
            {isLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                מחפש מסמכים מקומיים...
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                לא נמצאו מסמכים מקומיים עבור תיק זה. נסה לסרוק מחדש את אינדקס הקבצים.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {results.map((item) => (
                  <div
                    key={item.relativePath}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '8px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.02)', gap: 10,
                    }}
                  >
                    {/* Icon */}
                    {isFile(item) ? (
                      <FileText size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                    ) : (
                      <Folder size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
                    )}

                    {/* Name + path */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getCategoryBadge(item.inferredCategory)}
                        <div style={{
                          fontSize: '0.65rem', color: '#64748b',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          direction: 'ltr', textAlign: 'right',
                        }}>
                          {item.relativePath}
                        </div>
                      </div>
                    </div>

                    {/* Metadata badges */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      {isFile(item) && (
                        <span style={{
                          fontSize: '0.65rem', color: '#475569',
                          background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4,
                        }}>
                          {item.extension.toUpperCase() || 'FILE'}
                        </span>
                      )}
                      {isFile(item) && item.size && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b', width: 50, textAlign: 'left' }}>
                          {formatSize(item.size)}
                        </span>
                      )}
                      {isFile(item) && item.lastModified && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b', width: 65, textAlign: 'left' }}>
                          {formatDate(item.lastModified)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && results.length > 0 && (
            <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#64748b', textAlign: 'left' }}>
              נמצאו {totalFound} מסמכים מקומיים התואמים לתיק
              {totalFound > MAX_RESULTS && ` (מציג ${MAX_RESULTS})`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// #endregion
