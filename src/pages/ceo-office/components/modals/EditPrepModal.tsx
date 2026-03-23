/* ============================================
   FILE: EditPrepModal.tsx
   PURPOSE: EditPrepModal component
   DEPENDENCIES: react, lucide-react
   EXPORTS: EditPrepModal (default)
   ============================================ */
/**
 * FILE: EditPrepModal.tsx
 * PURPOSE: Modal for self-service editing of meeting preparation stages and items
 * DEPENDENCIES: calendarTypes, lucide-react, brainStore
 */
import { useState, useCallback } from 'react';
import {
  X, Plus, Trash2, GripVertical, Link, MessageSquare,
  CheckSquare, Save, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { MeetingPrepStage, MeetingPrepItem } from '../../../../data/calendarTypes';
import { useBrainStore } from '../../../../store/brainStore';

// #region Types

interface Props {
  meetingId: string;
  initialStages: MeetingPrepStage[];
  onClose: () => void;
}

// #endregion

// #region Helpers

const STAGE_COLORS = ['#3b82f6', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6', '#ef4444'];

/** Create an empty stage */
function emptyStage(index: number): MeetingPrepStage {
  return {
    title: `שלב ${index + 1}`,
    color: STAGE_COLORS[index % STAGE_COLORS.length],
    items: [],
  };
}

/** Create an empty item by type */
function emptyItem(type: MeetingPrepItem['type']): MeetingPrepItem {
  if (type === 'link') return { type: 'link', label: '', href: '', isInternal: true };
  if (type === 'message') return { type: 'message', label: '', messageText: '', recipient: '' };
  return { type: 'checklist', label: '', checkItems: [''] };
}

// #endregion

// #region Component

/**
 * Full-screen modal for editing meeting preparation content.
 * User can add/edit/delete stages and their items (links, messages, checklists).
 */
export default function EditPrepModal({ meetingId, initialStages, onClose }: Props) {
  const [stages, setStages] = useState<MeetingPrepStage[]>(
    initialStages.length > 0 ? JSON.parse(JSON.stringify(initialStages)) : [emptyStage(0)]
  );
  const [expandedStage, setExpandedStage] = useState(0);
  const updateMeeting = useBrainStore(s => s.updateMeeting);

  /** Save to store and close */
  const handleSave = useCallback(() => {
    // Clean up empty items
    const cleaned = stages
      .filter(s => s.title.trim())
      .map(s => ({
        ...s,
        items: s.items.filter(item => item.label.trim()),
      }));
    updateMeeting(meetingId, { prepStages: cleaned.length > 0 ? cleaned : undefined });
    onClose();
  }, [stages, meetingId, updateMeeting, onClose]);

  /** Update a stage field */
  const updateStage = useCallback((si: number, updates: Partial<MeetingPrepStage>) => {
    setStages(prev => prev.map((s, i) => i === si ? { ...s, ...updates } : s));
  }, []);

  /** Add a new stage */
  const addStage = useCallback(() => {
    setStages(prev => [...prev, emptyStage(prev.length)]);
    setExpandedStage(stages.length);
  }, [stages.length]);

  /** Delete a stage */
  const deleteStage = useCallback((si: number) => {
    setStages(prev => prev.filter((_, i) => i !== si));
    if (expandedStage >= stages.length - 1) setExpandedStage(Math.max(0, stages.length - 2));
  }, [expandedStage, stages.length]);

  /** Add an item to a stage */
  const addItem = useCallback((si: number, type: MeetingPrepItem['type']) => {
    setStages(prev => prev.map((s, i) =>
      i === si ? { ...s, items: [...s.items, emptyItem(type)] } : s
    ));
  }, []);

  /** Update an item */
  const updateItem = useCallback((si: number, ii: number, updates: Partial<MeetingPrepItem>) => {
    setStages(prev => prev.map((s, i) =>
      i === si ? { ...s, items: s.items.map((item, j) => j === ii ? { ...item, ...updates } : item) } : s
    ));
  }, []);

  /** Delete an item */
  const deleteItem = useCallback((si: number, ii: number) => {
    setStages(prev => prev.map((s, i) =>
      i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s
    ));
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, width: '100%', maxWidth: 700,
          maxHeight: '90vh', overflow: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
            ✏️ עריכת חומרי הכנה לפגישה
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none',
            borderRadius: 10, padding: 8, cursor: 'pointer', color: '#94a3b8',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Stages List */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stages.map((stage, si) => (
            <StageEditor
              key={si}
              stage={stage}
              stageIndex={si}
              expanded={expandedStage === si}
              onToggle={() => setExpandedStage(expandedStage === si ? -1 : si)}
              onUpdateStage={(updates) => updateStage(si, updates)}
              onDelete={() => deleteStage(si)}
              onAddItem={(type) => addItem(si, type)}
              onUpdateItem={(ii, updates) => updateItem(si, ii, updates)}
              onDeleteItem={(ii) => deleteItem(si, ii)}
            />
          ))}

          {/* Add Stage Button */}
          <button
            onClick={addStage}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 12,
              background: 'rgba(59,130,246,0.08)', color: '#60a5fa',
              border: '1px dashed rgba(59,130,246,0.3)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
            }}
          >
            <Plus size={16} /> הוסף שלב חדש
          </button>
        </div>

        {/* Footer — Save */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 12, justifyContent: 'flex-start',
        }}>
          <button
            onClick={handleSave}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', fontWeight: 700, fontSize: '0.88rem',
              border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            }}
          >
            <Save size={16} /> שמור שינויים
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif',
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// #endregion

// #region StageEditor

/** Editable stage card */
function StageEditor({ stage, stageIndex: _stageIndex, expanded, onToggle, onUpdateStage, onDelete, onAddItem, onUpdateItem, onDeleteItem }: {
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
        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Heebo, sans-serif',
      }}
    >
      <Plus size={12} /> {icon} {label}
    </button>
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
          fontSize: '0.72rem', fontWeight: 700, color: stageColor,
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
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>לינק פנימי (ניווט באפליקציה)</span>
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
              width: '100%', minHeight: 100, marginTop: 6,
              padding: '10px 12px', borderRadius: 8,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0', fontSize: '0.82rem',
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

// #region Shared Input

/** Styled text input */
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
        width: '100%', padding: '8px 12px', borderRadius: 8,
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#e2e8f0', fontSize: '0.82rem',
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
          <span style={{ color: stageColor, fontSize: '0.75rem', fontWeight: 700, width: 20, textAlign: 'center' }}>
            {i + 1}
          </span>
          <input
            value={text}
            onChange={e => updateItem(i, e.target.value)}
            dir="rtl"
            placeholder="פריט בצ'ק-ליסט..."
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 6,
              background: 'rgba(15,23,42,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#e2e8f0', fontSize: '0.8rem',
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
          fontSize: '0.72rem', cursor: 'pointer',
          fontFamily: 'Heebo, sans-serif',
        }}
      >
        <Plus size={12} /> הוסף פריט
      </button>
    </div>
  );
}

// #endregion
