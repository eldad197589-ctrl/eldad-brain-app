/* ============================================
   FILE: DynamicWorkspace.tsx
   PURPOSE: Dynamic meeting workspace — shows real tasks, auto-links, and notes
   DEPENDENCIES: react, lucide-react, brainStore, meetingMaterials, DynamicWorkspaceParts
   EXPORTS: DynamicWorkspace (default)
   ============================================ */
/**
 * DynamicWorkspace — Real Meeting Preparation
 *
 * Pulls REAL tasks from the store, auto-discovers relevant documents,
 * and provides a notes area. Replaces static prep stages with live data.
 */
// #region Imports

import { useMemo, useCallback } from 'react';
import {
  FileText, ListTodo,
  AlertTriangle, Clock, Link2, ExternalLink,
} from 'lucide-react';
import type { Meeting } from '../../../../data/calendarTypes';
import { useBrainStore } from '../../../../store/brainStore';
import { collectMeetingMaterials } from '../../meetingMaterials';
import { TaskRow, MeetingNotesArea } from './DynamicWorkspaceParts';

// #endregion

// #region Types

interface Props {
  /** The meeting to show workspace for */
  meeting: Meeting;
  /** Navigate to an internal route */
  onNavigate?: (path: string) => void;
  /** Close the parent panel (for navigation) */
  onClose: () => void;
}

// #endregion

// #region Component

/**
 * Dynamic meeting workspace — shows real tasks, auto-links, and notes.
 * Replaces static prep stages with live, interactive data from the store.
 *
 * @param props — meeting, onNavigate, onClose
 * @returns Dynamic workspace JSX
 */
export default function DynamicWorkspace({ meeting, onNavigate, onClose }: Props) {
  const tasks = useBrainStore(s => s.tasks);
  const toggleTask = useBrainStore(s => s.toggleTask);
  const toggleSubTask = useBrainStore(s => s.toggleSubTask);

  const materials = useMemo(
    () => collectMeetingMaterials(meeting.id, meeting, tasks),
    [meeting.id, meeting, tasks]
  );

  const allTasks = [...materials.directTasks, ...materials.carryoverTasks];
  const openCount = allTasks.filter(t => t.status !== 'done').length;

  const handleNavigate = useCallback((path: string) => {
    onClose();
    onNavigate?.(path);
  }, [onClose, onNavigate]);

  return (
    <div style={{
      padding: '16px 28px 24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Section Title */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16,
      }}>
        <span style={{
          fontSize: '1rem', fontWeight: 800, color: '#f1f5f9',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🎯 חדר מלחמה
        </span>
        {openCount > 0 && (
          <span style={{
            padding: '3px 10px', borderRadius: 20,
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            fontSize: '0.72rem', fontWeight: 700,
          }}>
            {openCount} משימות פתוחות
          </span>
        )}
      </div>

      {/* === Zone 1: Open Tasks === */}
      {allTasks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0',
            marginBottom: 10,
          }}>
            <ListTodo size={16} color="#3b82f6" />
            משימות לפני הפגישה
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              ({allTasks.filter(t => t.status !== 'done').length} פתוחות מתוך {allTasks.length})
            </span>
          </div>

          {/* Direct tasks */}
          {materials.directTasks.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {materials.carryoverTasks.length > 0 && (
                <div style={{
                  fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Clock size={12} /> משימות מפגישה זו
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {materials.directTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onToggleSub={toggleSubTask}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Carryover tasks */}
          {materials.carryoverTasks.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.72rem', color: '#f59e0b', marginBottom: 6, marginTop: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <AlertTriangle size={12} /> משימות פתוחות מפגישות קודמות
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {materials.carryoverTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onToggleSub={toggleSubTask}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === Zone 2: Auto-discovered Documents === */}
      {materials.autoLinks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0',
            marginBottom: 10,
          }}>
            <Link2 size={16} color="#06b6d4" />
            מסמכים ודפים רלוונטיים
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {materials.autoLinks.map((link, i) => (
              <div
                key={i}
                onClick={() => handleNavigate(link.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(6,182,212,0.04)',
                  border: '1px solid rgba(6,182,212,0.15)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <FileText size={16} color="#06b6d4" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                    {link.reason}
                  </div>
                </div>
                <ExternalLink size={13} color="#06b6d4" style={{ opacity: 0.5, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === Zone 3: Meeting Notes === */}
      <MeetingNotesArea
        meetingId={meeting.id}
        initialNotes={meeting.meetingNotes || ''}
      />
    </div>
  );
}

// #endregion
