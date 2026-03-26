/* ============================================
   FILE: EditPrepParts.tsx
   PURPOSE: Sub-components for EditPrepModal (StageEditor, ItemEditor, ChecklistEditor, EditInput, AddItemBtn)
   DEPENDENCIES: react, lucide-react, calendarTypes
   EXPORTS: StageEditor
   ============================================ */
import {
  Plus, Trash2, GripVertical, Link, MessageSquare,
  CheckSquare, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { MeetingPrepStage, MeetingPrepItem } from '../../../../data/calendarTypes';

// #region Constants

const STAGE_COLORS = ['#3b82f6', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6', '#ef4444'];

// #endregion

// #region EditInput

/** Styled text input for edit forms */
function EditInput({ value, onChange, placeholder, dir = 'rtl' }: {
  value: string; onChange: (v: string) => void; placeholder: string; dir?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      dir={dir}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: 8,
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#e2e8f0', fontSize: '0.95rem',
        fontFamily: 'Heebo, sans-serif', outline: 'none',
        marginTop: 6,
      }}
    />
  );
}

// #endregion

// #region ChecklistEditor

/** Editable list of checklist items */
function ChecklistEditor({ items, onChange, stageColor }: {
  items: string[]; onChange: (items: string[]) => void; stageColor: string;
}) {
  const updateItem = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };

  const deleteItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    onChange([...items, '']);
  };

  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((text, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: stageColor, fontSize: '0.85rem', fontWeight: 700, width: 20, textAlign: 'center' }}>
            {i + 1}
          </span>
          <input
            value={text}
            onChange={e => updateItem(i, e.target.value)}
            dir="rtl"
            placeholder="פריט בצ'ק-ליסט..."
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 6,
              background: 'rgba(15,23,42,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#e2e8f0', fontSize: '0.92rem',
              fontFamily: 'Heebo, sans-serif', outline: 'none',
            }}
          />
          <button onClick={() => deleteItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 6,
          background: 'transparent', color: '#64748b',
          border: '1px dashed rgba(255,255,255,0.08)',
          fontSize: '0.82rem', cursor: 'pointer',
          fontFamily: 'Heebo, sans-serif',
        }}
      >
        <Plus size={12} /> הוסף פריט
      </button>
    </div>
  );
}

// #endregion

// #region ItemEditor

/** Editable item — adapts form fields based on item type */
function ItemEditor({ item, stageColor, onUpdate, onDelete }: {
  item: MeetingPrepItem; stageColor: string;
  onUpdate: (updates: Partial<MeetingPrepItem>) => void;
  onDelete: () => void;
}) {
  const iconMap = { link: <Link size={14} />, message: <MessageSquare size={14} />, checklist: <CheckSquare size={14} /> };
  const labelMap = { link: 'לינק', message: 'הודעה', checklist: "צ'ק-ליסט" };

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 10,
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(255,255,255,0.06)`,
    }}>
      {/* Item type badge + delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', fontWeight: 700, color: stageColor,
          padding: '3px 8px', borderRadius: 6,
          background: `${stageColor}15`,
        }}>
          {iconMap[item.type]} {labelMap[item.type]}
        </span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* Label (common to all types) */}
      <EditInput value={item.label} onChange={v => onUpdate({ label: v })} placeholder="שם הפריט..." />

      {/* Type-specific fields */}
      {item.type === 'link' && (
        <>
          <EditInput value={item.href || ''} onChange={v => onUpdate({ href: v })} placeholder="כתובת (למשל: /agreement)" dir="ltr" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={item.isInternal ?? true}
              onChange={e => onUpdate({ isInternal: e.target.checked })}
              style={{ accentColor: stageColor }}
            />
            <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>לינק פנימי (ניווט באפליקציה)</span>
          </label>
        </>
      )}

      {item.type === 'message' && (
        <>
          <EditInput value={item.recipient || ''} onChange={v => onUpdate({ recipient: v })} placeholder="נמען (למשל: קבוצת המייסדים)" />
          <textarea
            value={item.messageText || ''}
            onChange={e => onUpdate({ messageText: e.target.value })}
            dir="rtl"
            placeholder="תוכן ההודעה..."
            style={{
              width: '100%', minHeight: 140, marginTop: 6,
              padding: '12px 14px', borderRadius: 8,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0', fontSize: '0.95rem',
              fontFamily: 'Heebo, sans-serif',
              resize: 'vertical', outline: 'none', lineHeight: 1.7,
            }}
          />
        </>
      )}

      {item.type === 'checklist' && (
        <ChecklistEditor
          items={item.checkItems || []}
          onChange={checkItems => onUpdate({ checkItems })}
          stageColor={stageColor}
        />
      )}
    </div>
  );
}

// #endregion

// #region AddItemBtn

/** Small button for adding an item type */
function AddItemBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
        border: '1px dashed rgba(255,255,255,0.1)',
        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Heebo, sans-serif',
      }}
    >
      <Plus size={12} /> {icon} {label}
    </button>
  );
}

// #endregion

// #region StageEditor

/**
 * Editable stage card with items.
 *
 * @param stage — Stage data
 * @param stageIndex — Index of the stage
 * @param expanded — Whether items are visible
 */
export function StageEditor({ stage, stageIndex: _stageIndex, expanded, onToggle, onUpdateStage, onDelete, onAddItem, onUpdateItem, onDeleteItem }: {
  stage: MeetingPrepStage; stageIndex: number; expanded: boolean;
  onToggle: () => void;
  onUpdateStage: (updates: Partial<MeetingPrepStage>) => void;
  onDelete: () => void;
  onAddItem: (type: MeetingPrepItem['type']) => void;
  onUpdateItem: (ii: number, updates: Partial<MeetingPrepItem>) => void;
  onDeleteItem: (ii: number) => void;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${expanded ? `${stage.color}40` : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 14, borderTop: `3px solid ${stage.color}`,
    }}>
      {/* Stage Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
      }}>
        <GripVertical size={14} color="#475569" />
        <input
          value={stage.title}
          onChange={e => onUpdateStage({ title: e.target.value })}
          dir="rtl"
          placeholder="שם השלב..."
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: '#f1f5f9', fontSize: '0.92rem', fontWeight: 700,
            fontFamily: 'Heebo, sans-serif', outline: 'none',
          }}
        />
        {/* Color picker */}
        <div style={{ display: 'flex', gap: 4 }}>
          {STAGE_COLORS.map(c => (
            <div
              key={c}
              onClick={() => onUpdateStage({ color: c })}
              style={{
                width: 16, height: 16, borderRadius: '50%',
                background: c, cursor: 'pointer',
                border: stage.color === c ? '2px solid white' : '2px solid transparent',
                transition: 'border 0.2s',
              }}
            />
          ))}
        </div>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Items */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stage.items.map((item, ii) => (
            <ItemEditor
              key={ii}
              item={item}
              stageColor={stage.color}
              onUpdate={(updates) => onUpdateItem(ii, updates)}
              onDelete={() => onDeleteItem(ii)}
            />
          ))}

          {/* Add Item Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <AddItemBtn icon={<Link size={13} />} label="לינק" onClick={() => onAddItem('link')} />
            <AddItemBtn icon={<MessageSquare size={13} />} label="הודעה" onClick={() => onAddItem('message')} />
            <AddItemBtn icon={<CheckSquare size={13} />} label="צ'ק-ליסט" onClick={() => onAddItem('checklist')} />
          </div>
        </div>
      )}
    </div>
  );
}

// #endregion
