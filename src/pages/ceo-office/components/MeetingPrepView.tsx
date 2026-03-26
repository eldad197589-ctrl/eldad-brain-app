/* ============================================
   FILE: MeetingPrepView.tsx
   PURPOSE: Dynamic "war room" view for meeting preparation — orchestrator
   DEPENDENCIES: react, lucide-react, calendarTypes, MeetingPrepParts
   EXPORTS: MeetingPrepView (default)
   ============================================ */
import { useState, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import type { MeetingPrepStage } from '../../../data/calendarTypes';
import { StageCard } from './MeetingPrepParts';

// #region Types

interface Props {
  /** Meeting ID — used for persisting checklist state */
  meetingId: string;
  /** The preparation stages to render */
  stages: MeetingPrepStage[];
  /** Navigate to an internal route */
  onNavigate?: (path: string) => void;
  /** Open the edit modal */
  onEdit?: () => void;
}

// #endregion

// #region Helpers

/** Load checklist state from localStorage */
function loadChecks(meetingId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`prep-checks-${meetingId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** Save checklist state to localStorage */
function saveChecks(meetingId: string, checks: Record<string, boolean>) {
  localStorage.setItem(`prep-checks-${meetingId}`, JSON.stringify(checks));
}

// #endregion

// #region Component

/**
 * Renders meeting preparation stages with links, message templates, and checklists.
 * Replicates the Hub's "war room" experience in a dynamic, per-meeting way.
 *
 * @param props — meetingId, stages, onNavigate, onEdit
 * @returns Preparation view JSX
 */
export default function MeetingPrepView({ meetingId, stages, onNavigate, onEdit }: Props) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadChecks(meetingId));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<number>(0);

  /** Toggle a checklist item */
  const toggleCheck = useCallback((key: string) => {
    setChecks(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveChecks(meetingId, next);
      return next;
    });
  }, [meetingId]);

  /** Copy message text to clipboard */
  const copyMessage = useCallback(async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text.replace(/\\n/g, '\n'));
      setCopiedId(itemId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch { /* clipboard may not be available */ }
  }, []);

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 28px 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h3 style={{
          fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', margin: 0,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          📦 חומרי הכנה לפגישה
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 8,
              background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
              border: '1px solid rgba(139,92,246,0.25)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
            }}
          >
            <Pencil size={13} /> ערוך
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {stages.map((stage, si) => (
          <StageCard
            key={si}
            stage={stage}
            stageIndex={si}
            expanded={expandedStage === si}
            onToggle={() => setExpandedStage(expandedStage === si ? -1 : si)}
            checks={checks}
            onToggleCheck={toggleCheck}
            copiedId={copiedId}
            onCopy={copyMessage}
            meetingId={meetingId}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

// #endregion
