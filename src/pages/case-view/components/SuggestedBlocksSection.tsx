/* ============================================
   FILE: SuggestedBlocksSection.tsx
   PURPOSE: בלוקי טיעון מוצעים — נגזרים ממפת התקיפה.
            אלדד בוחר ידנית אילו בלוקים להכניס לטיוטה.
            לא מקדם סטטוס, לא יוצר ערר סופי.
   DEPENDENCIES: react, lucide-react, caseTypes
   EXPORTS: SuggestedBlocksSection (default)
   ============================================ */
import { useState } from 'react';
import { Layers, CheckSquare, Square, PlusCircle, Shield, PenTool, Bot } from 'lucide-react';
import type { SuggestedAttackBlock, CaseDraft } from '../../../data/caseTypes';

// #region Types

interface Props {
  /** בלוקים מוצעים מתוך draft.suggestedBlocks */
  blocks: SuggestedAttackBlock[];
  /** הטיוטה הנוכחית */
  draft: CaseDraft | null;
  /** Callback לעדכון הטיוטה — לא משנה סטטוס */
  onUpdateDraft: (draft: CaseDraft) => void;
}

// #endregion

// #region Helpers

/** צבע לפי עוצמת תקיפה */
function getStrengthColor(level: string): string {
  switch (level) {
    case 'strong': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'weak': return '#ef4444';
    default: return '#94a3b8';
  }
}

/** תווית עברית לעוצמה */
function getStrengthLabel(level: string): string {
  switch (level) {
    case 'strong': return 'חזקה';
    case 'medium': return 'בינונית';
    case 'weak': return 'חלשה';
    default: return level;
  }
}

// #endregion

// #region Component

/**
 * Section: בלוקי טיעון מוצעים
 * - מציג כל בלוק עם checkbox ידני
 * - כפתור "הוסף לטיוטה" מוסיף מקטע טיעון לגוף הטיוטה
 * - לא משנה status, לא מייצר final, לא עוקף את אלדד
 */
export default function SuggestedBlocksSection({ blocks, draft, onUpdateDraft }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(blocks.filter(b => b.includeInDraft).map(b => b.id))
  );

  if (blocks.length === 0) {
    return null;
  }

  /** Toggle checkbox */
  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /** הוסף בלוקים שנבחרו לטיוטה — dedupe, structured section, no status change */
  const handleAddToDraft = () => {
    if (!draft) return;
    
    const selected = blocks.filter(b => selectedIds.has(b.id));
    if (selected.length === 0) return;

    // --- Dedupe: filter out blocks already inserted ---
    const alreadyInserted = new Set(draft.insertedAttackBlockIds ?? []);
    const newBlocks = selected.filter(b => !alreadyInserted.has(b.id));
    
    if (newBlocks.length === 0) {
      // All selected blocks were already inserted — no-op
      return;
    }

    // --- Build structured argument section ---
    const SECTION_MARKER = '═══ טיעונים מוצעים ממפת התקיפה ═══';
    const strengthLabels: Record<string, string> = {
      strong: 'חזקה', medium: 'בינונית', weak: 'חלשה',
    };

    const blockTexts = newBlocks.map((block, idx) => {
      const lines = [
        `── טיעון ${alreadyInserted.size + idx + 1} ──`,
        `רמת חוזק: ${strengthLabels[block.strengthLevel] ?? block.strengthLevel}`,
        ``,
        `טענת הרשות:`,
        `${block.authorityClaim}`,
        ``,
        `טענת נגד מוצעת:`,
        `${block.counterArgument}`,
      ];
      if (block.supportingEvidence.length > 0) {
        lines.push(``, `ראיות תומכות:`);
        block.supportingEvidence.forEach(ev => {
          lines.push(`  • ${ev}`);
        });
      }
      return lines.join('\n');
    }).join('\n\n');

    // --- Inject into draft body ---
    let updatedBody: string;
    if (draft.body.includes(SECTION_MARKER)) {
      // Section exists — append new blocks after existing content (before closing)
      updatedBody = draft.body + '\n\n' + blockTexts;
    } else {
      // First insertion — add section header + blocks
      const sectionHeader = `\n\n${SECTION_MARKER}\n\n`;
      updatedBody = draft.body + sectionHeader + blockTexts;
    }

    // --- Update tracking ---
    const updatedInsertedIds = [
      ...Array.from(alreadyInserted),
      ...newBlocks.map(b => b.id),
    ];

    // Update blocks with include flags
    const updatedBlocks = blocks.map(b => ({
      ...b,
      includeInDraft: selectedIds.has(b.id),
    }));

    // Build updated draft — status stays as-is
    const updatedDraft: CaseDraft = {
      ...draft,
      body: updatedBody,
      suggestedBlocks: updatedBlocks,
      suggestedBlocksInsertedAt: new Date().toISOString(),
      insertedAttackBlockIds: updatedInsertedIds,
      // Status preserved — no auto-promotion
    };

    onUpdateDraft(updatedDraft);
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="case-section" style={{ marginTop: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={20} color="#8b5cf6" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9' }}>
            בלוקי טיעון מוצעים
          </h3>
          <span style={{
            fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12,
            background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
          }}>
            {blocks.length} בלוקים
          </span>
        </div>
        {draft && (
          <button
            onClick={handleAddToDraft}
            disabled={selectedCount === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: selectedCount > 0 ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
              color: selectedCount > 0 ? '#a78bfa' : '#64748b',
              cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
              fontSize: '0.85rem', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <PlusCircle size={14} />
            הוסף {selectedCount > 0 ? `${selectedCount} בלוקים` : ''} לטיוטה
          </button>
        )}
      </div>

      {/* Info banner */}
      <div style={{
        padding: '8px 12px', borderRadius: 6, marginBottom: 16,
        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
        fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Shield size={14} color="#a78bfa" />
        בחירת בלוקים ידנית בלבד. הטיוטה נשארת במצב טיוטה — לא מקודמת להגשה.
      </div>

      {/* Blocks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {blocks.map((block) => {
          const isSelected = selectedIds.has(block.id);
          return (
            <div
              key={block.id}
              onClick={() => handleToggle(block.id)}
              style={{
                padding: 16, borderRadius: 8, cursor: 'pointer',
                background: isSelected ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRight: `4px solid ${getStrengthColor(block.strengthLevel)}`,
                transition: 'all 0.2s',
              }}
            >
              {/* Top row: checkbox + strength */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isSelected
                    ? <CheckSquare size={18} color="#a78bfa" />
                    : <Square size={18} color="#64748b" />
                  }
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: getStrengthColor(block.strengthLevel),
                    textTransform: 'uppercase',
                  }}>
                    {getStrengthLabel(block.strengthLevel)}
                  </span>
                </div>
                
                {/* Author Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {block.source === 'authored_response' ? (
                    <span style={{
                      fontSize: '0.68rem', padding: '3px 8px', borderRadius: 4,
                      background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600
                    }}>
                      <PenTool size={12} /> מקור: תגובת אלדד
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.68rem', padding: '3px 8px', borderRadius: 4,
                      background: 'rgba(148,163,184,0.15)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600
                    }}>
                      <Bot size={12} /> מבוסס תבנית ידע
                    </span>
                  )}
                </div>
              </div>

              {/* Authority Claim */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, marginBottom: 3 }}>
                  טענת הרשות:
                </div>
                <div style={{
                  fontSize: '0.88rem', color: '#f1f5f9',
                  background: 'rgba(239,68,68,0.05)', padding: '6px 10px', borderRadius: 4,
                }}>
                  {block.authorityClaim}
                </div>
              </div>

              {/* Counter Argument */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: 3 }}>
                  טענת נגד מוצעת:
                </div>
                <div style={{
                  fontSize: '0.88rem', color: '#f1f5f9',
                  background: 'rgba(16,185,129,0.05)', padding: '6px 10px', borderRadius: 4,
                }}>
                  {block.counterArgument}
                </div>
              </div>

              {/* Evidence */}
              {block.supportingEvidence.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700, marginBottom: 3 }}>
                    ראיות תומכות:
                  </div>
                  <ul style={{
                    margin: 0, paddingRight: 16, paddingLeft: 0,
                    fontSize: '0.82rem', color: '#cbd5e1',
                  }}>
                    {block.supportingEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!draft && (
        <div style={{
          marginTop: 12, padding: '8px 12px', borderRadius: 6,
          background: 'rgba(245,158,11,0.1)', fontSize: '0.8rem', color: '#fbbf24',
        }}>
          ⚠️ אין טיוטה פעילה. צור טיוטה קודם כדי להוסיף בלוקים.
        </div>
      )}
    </div>
  );
}

// #endregion
