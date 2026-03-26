/* ============================================
   FILE: MeetingPrepParts.tsx
   PURPOSE: Sub-components for MeetingPrepView (StageCard, PrepItemCard, LinkItem, MessageItem, ChecklistItem)
   DEPENDENCIES: react, lucide-react, calendarTypes
   EXPORTS: StageCard
   ============================================ */
import { useState } from 'react';
import {
  ExternalLink, Copy, Check, ChevronDown, ChevronUp,
  FileText, Users, CheckSquare, Square,
} from 'lucide-react';
import type { MeetingPrepStage, MeetingPrepItem } from '../../../data/calendarTypes';

// #region LinkItem

/** Link prep item */
function LinkItem({ item, stageColor, onNavigate }: {
  item: MeetingPrepItem; stageColor: string; onNavigate?: (path: string) => void;
}) {
  const handleClick = () => {
    if (item.isInternal && item.href && onNavigate) {
      onNavigate(item.href);
    } else if (item.href) {
      window.open(item.href, '_blank');
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 10,
        background: `${stageColor}08`,
        border: `1px solid ${stageColor}20`,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      <div style={{
        padding: 8, borderRadius: 8,
        background: `${stageColor}15`, color: stageColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {item.isInternal ? <FileText size={18} /> : <ExternalLink size={18} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#e2e8f0' }}>{item.label}</div>
        {item.href && (
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            {item.isInternal ? `לשכת המנכ"ל → ${item.href}` : item.href}
          </div>
        )}
      </div>
      <ExternalLink size={14} color={stageColor} style={{ flexShrink: 0, opacity: 0.6 }} />
    </div>
  );
}

// #endregion

// #region MessageItem

/** Message template prep item */
function MessageItem({ item, itemKey, copiedId, onCopy, stageColor }: {
  item: MeetingPrepItem; itemKey: string;
  copiedId: string | null; onCopy: (text: string, id: string) => void;
  stageColor: string;
}) {
  const [showMessage, setShowMessage] = useState(false);
  const isCopied = copiedId === itemKey;

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${stageColor}25`,
      background: `${stageColor}06`,
    }}>
      <div
        onClick={() => setShowMessage(!showMessage)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', cursor: 'pointer',
        }}
      >
        <div style={{
          padding: 8, borderRadius: 8,
          background: `${stageColor}15`, color: stageColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Users size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#e2e8f0' }}>{item.label}</div>
          {item.recipient && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              נמען: {item.recipient}
            </div>
          )}
        </div>
        {showMessage
          ? <ChevronUp size={14} color="#64748b" />
          : <ChevronDown size={14} color="#64748b" />}
      </div>

      {showMessage && item.messageText && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            padding: '14px 16px', borderRadius: 10,
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.8,
            whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto',
            fontFamily: 'Heebo, sans-serif',
          }}>
            {item.messageText.replace(/\\n/g, '\n')}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(item.messageText || '', itemKey); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', marginTop: 10, padding: '10px 16px', borderRadius: 10,
              background: isCopied ? 'rgba(16,185,129,0.15)' : `${stageColor}12`,
              border: `1px solid ${isCopied ? 'rgba(16,185,129,0.4)' : `${stageColor}30`}`,
              color: isCopied ? '#34d399' : stageColor,
              fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
            }}
          >
            {isCopied ? <><Check size={16} /> הועתק בהצלחה!</> : <><Copy size={16} /> העתק הודעה</>}
          </button>
        </div>
      )}
    </div>
  );
}

// #endregion

// #region ChecklistItem

/** Checklist prep item */
function ChecklistItem({ item, itemKey, checks, onToggleCheck, stageColor }: {
  item: MeetingPrepItem; itemKey: string;
  checks: Record<string, boolean>; onToggleCheck: (key: string) => void;
  stageColor: string;
}) {
  const total = item.checkItems?.length || 0;
  const done = item.checkItems?.filter((_, i) => checks[`${itemKey}-${i}`]).length || 0;

  return (
    <div style={{
      borderRadius: 10, padding: '14px 16px',
      border: `1px solid ${stageColor}25`,
      background: `${stageColor}06`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0' }}>
          ✅ {item.label}
        </div>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700, color: stageColor,
          fontFamily: 'monospace',
        }}>
          {done}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)',
        marginBottom: 12, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: total > 0 ? `${(done / total) * 100}%` : '0%',
          background: done === total && total > 0
            ? 'linear-gradient(90deg, #10b981, #34d399)'
            : `linear-gradient(90deg, ${stageColor}, ${stageColor}cc)`,
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Check items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {item.checkItems?.map((text, ci) => {
          const key = `${itemKey}-${ci}`;
          const checked = !!checks[key];
          return (
            <div
              key={ci}
              onClick={() => onToggleCheck(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                background: checked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${checked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)'}`,
                transition: 'all 0.2s',
              }}
            >
              {checked
                ? <CheckSquare size={16} color="#10b981" />
                : <Square size={16} color="#475569" />}
              <span style={{
                fontSize: '0.9rem',
                color: checked ? '#64748b' : '#e2e8f0',
                textDecoration: checked ? 'line-through' : 'none',
                fontWeight: 500,
              }}>
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// #endregion

// #region StageCard

/**
 * A single preparation stage card with items.
 *
 * @param stage — Stage data
 * @param stageIndex — Index of the stage
 * @param expanded — Whether stage content is visible
 * @param onToggle — Toggle callback
 */
export function StageCard({ stage, stageIndex, expanded, onToggle, checks, onToggleCheck, copiedId, onCopy, meetingId, onNavigate }: {
  stage: MeetingPrepStage; stageIndex: number; expanded: boolean;
  onToggle: () => void; checks: Record<string, boolean>;
  onToggleCheck: (key: string) => void; copiedId: string | null;
  onCopy: (text: string, id: string) => void; meetingId: string;
  onNavigate?: (path: string) => void;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${expanded ? `${stage.color}40` : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 14, overflow: 'hidden',
      borderTop: `3px solid ${stage.color}`,
      transition: 'all 0.3s',
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
            background: `${stage.color}20`, color: stage.color,
            border: `1px solid ${stage.color}40`,
          }}>
            שלב {stageIndex + 1}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
            {stage.title}
          </span>
        </div>
        {expanded
          ? <ChevronUp size={16} color="#64748b" />
          : <ChevronDown size={16} color="#64748b" />}
      </div>

      {expanded && (
        <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stage.items.map((item, ii) => {
            const itemKey = `${meetingId}-${stageIndex}-${ii}`;
            if (item.type === 'link') return <LinkItem key={ii} item={item} stageColor={stage.color} onNavigate={onNavigate} />;
            if (item.type === 'message') return <MessageItem key={ii} item={item} itemKey={itemKey} copiedId={copiedId} onCopy={onCopy} stageColor={stage.color} />;
            if (item.type === 'checklist') return <ChecklistItem key={ii} item={item} itemKey={itemKey} checks={checks} onToggleCheck={onToggleCheck} stageColor={stage.color} />;
            return null;
          })}
        </div>
      )}
    </div>
  );
}

// #endregion
