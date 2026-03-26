/* ============================================
   FILE: EditPrepModal.tsx
   PURPOSE: Modal for self-service editing of meeting preparation stages and items — orchestrator
   DEPENDENCIES: react, lucide-react, calendarTypes, brainStore, EditPrepParts
   EXPORTS: EditPrepModal (default)
   ============================================ */
import { useState, useCallback } from 'react';
import { X, Plus, Save } from 'lucide-react';
import type { MeetingPrepStage, MeetingPrepItem } from '../../../../data/calendarTypes';
import { useBrainStore } from '../../../../store/brainStore';
import { StageEditor } from './EditPrepParts';

// #region Types

interface Props {
  /** Meeting ID to update */
  meetingId: string;
  /** Current preparation stages */
  initialStages: MeetingPrepStage[];
  /** Close the modal */
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

// #endregion

// #region Component

/**
 * Full-screen modal for editing meeting preparation content.
 * User can add/edit/delete stages and their items (links, messages, checklists).
 *
 * @param props — meetingId, initialStages, onClose
 * @returns Modal JSX
 */
export default function EditPrepModal({ meetingId, initialStages, onClose }: Props) {
  const [stages, setStages] = useState<MeetingPrepStage[]>(
    initialStages.length > 0 ? JSON.parse(JSON.stringify(initialStages)) : [emptyStage(0)]
  );
  const [expandedStage, setExpandedStage] = useState(0);
  const updateMeeting = useBrainStore(s => s.updateMeeting);

  /** Save to store and close */
  const handleSave = useCallback(() => {
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
    const emptyItem = (t: MeetingPrepItem['type']): MeetingPrepItem => {
      if (t === 'link') return { type: 'link', label: '', href: '', isInternal: true };
      if (t === 'message') return { type: 'message', label: '', messageText: '', recipient: '' };
      return { type: 'checklist', label: '', checkItems: [''] };
    };
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
