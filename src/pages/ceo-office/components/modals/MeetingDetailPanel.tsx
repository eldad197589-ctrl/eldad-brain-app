/* ============================================
   FILE: MeetingDetailPanel.tsx
   PURPOSE: MeetingDetailPanel component
   DEPENDENCIES: react, lucide-react
   EXPORTS: MeetingDetailPanel (default)
   ============================================ */
/**
 * FILE: MeetingDetailPanel.tsx
 * PURPOSE: Full-screen modal showing meeting details — topics, related tasks, decisions
 * DEPENDENCIES: Meeting type, Task type, lucide-react
 */

// #region Imports
import { useState } from 'react';
import { X, Users, Clock, Calendar, ExternalLink, CheckCircle2, ChevronLeft, Plus } from 'lucide-react';
import type { Meeting, Task } from '../../types';
import MeetingPrepView from '../MeetingPrepView';
import EditPrepModal from './EditPrepModal';
import { useBrainStore } from '../../../../store/brainStore';
// #endregion

// #region Types
interface Props {
  /** The meeting to display */
  meeting: Meeting;
  /** All tasks in the system (to find related ones) */
  tasks: Task[];
  /** Close handler */
  onClose: () => void;
  /** Navigate to an internal route */
  onNavigate?: (path: string) => void;
}
// #endregion

// #region Component
/**
 * Full meeting detail panel — shows everything that happened in a meeting.
 * Topics, participants, duration, related tasks created from this meeting.
 */
export default function MeetingDetailPanel({ meeting, tasks, onClose, onNavigate }: Props) {
  const [showEditPrep, setShowEditPrep] = useState(false);

  // Read live meeting from store so we get updates after editing prep
  const liveMeeting = useBrainStore(
    s => s.meetings.find(m => m.id === meeting.id)
  ) || meeting;

  // Find tasks generated from this meeting
  const relatedTasks = tasks.filter(t => t.sourceProtocol === meeting.id);
  const doneTasks = relatedTasks.filter(t => t.status === 'done').length;

  /** Handle topic click — navigate if topic has a link */
  const handleTopicClick = (link?: string) => {
    if (!link || !onNavigate) return;
    onClose();
    onNavigate(link);
  };

  /** Safely get topic text — handles both old string format and new object format */
  const getTopicText = (topic: unknown): string => {
    if (typeof topic === 'string') return topic;
    if (topic && typeof topic === 'object' && 'text' in topic) return String((topic as { text: string }).text);
    return '';
  };

  /** Safely get topic link */
  const getTopicLink = (topic: unknown): string | undefined => {
    if (topic && typeof topic === 'object' && 'link' in topic) return (topic as { link?: string }).link;
    return undefined;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, width: '100%', maxWidth: 700,
          maxHeight: '85vh', overflow: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start', gap: 16,
        }}>
          <div style={{
            width: 8, height: 50, borderRadius: 4,
            background: meeting.color, flexShrink: 0, marginTop: 4,
          }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9' }}>
              {meeting.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10, color: '#94a3b8', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> {new Date(meeting.date + 'T00:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} /> {meeting.time} • {meeting.duration} דקות
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} /> {meeting.participants.join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: 'none',
              borderRadius: 10, padding: 8, cursor: 'pointer', color: '#94a3b8',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Badge */}
        <div style={{ padding: '12px 28px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
            background: meeting.completed ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)',
            color: meeting.completed ? '#34d399' : '#60a5fa',
          }}>
            {meeting.completed ? '✅ הושלמה' : '🔵 מתוכננת'}
          </span>
        </div>

        {/* Topics / Agenda */}
        <div style={{ padding: '8px 28px 20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>
            📋 נושאי הדיון
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meeting.topics.map((topic, i) => {
              const text = getTopicText(topic);
              const link = getTopicLink(topic);
              const hasLink = !!link && !!onNavigate;
              return (
                <div
                  key={i}
                  onClick={() => handleTopicClick(link)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: hasLink ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${hasLink ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)'}`,
                    cursor: hasLink ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: `${meeting.color}20`, color: meeting.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ color: hasLink ? '#93c5fd' : '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, flex: 1 }}>
                    {text}
                  </span>
                  {hasLink && (
                    <ChevronLeft size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preparation Stages (War Room) */}
        {liveMeeting.prepStages && liveMeeting.prepStages.length > 0 && (
          <MeetingPrepView
            meetingId={liveMeeting.id}
            stages={liveMeeting.prepStages}
            onNavigate={(path) => { onClose(); onNavigate?.(path); }}
            onEdit={() => setShowEditPrep(true)}
          />
        )}

        {/* Add prep button for meetings without prep stages */}
        {(!liveMeeting.prepStages || liveMeeting.prepStages.length === 0) && (
          <div style={{
            padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              onClick={() => setShowEditPrep(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px 20px', borderRadius: 12,
                background: 'rgba(139,92,246,0.08)', color: '#a78bfa',
                border: '1px dashed rgba(139,92,246,0.3)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
              }}
            >
              <Plus size={16} /> הוסף חומרי הכנה לפגישה
            </button>
          </div>
        )}

        {/* Edit Prep Modal */}
        {showEditPrep && (
          <EditPrepModal
            meetingId={liveMeeting.id}
            initialStages={liveMeeting.prepStages || []}
            onClose={() => setShowEditPrep(false)}
          />
        )}

        {/* Related Tasks from this Protocol */}
        {relatedTasks.length > 0 && (
          <div style={{ padding: '8px 28px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
              ✅ משימות שנוצרו מהפגישה
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 14 }}>
              {doneTasks}/{relatedTasks.length} הושלמו
            </div>
            <div style={{
              width: '100%', height: 6, borderRadius: 3,
              background: 'rgba(255,255,255,0.06)', marginBottom: 16,
            }}>
              <div style={{
                width: `${relatedTasks.length > 0 ? (doneTasks / relatedTasks.length) * 100 : 0}%`,
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {relatedTasks.map(t => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: t.status === 'done' ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${t.status === 'done' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}`,
                  }}
                >
                  <CheckCircle2
                    size={18}
                    color={t.status === 'done' ? '#10b981' : t.priority === 'high' ? '#ef4444' : '#f59e0b'}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: t.status === 'done' ? '#64748b' : '#e2e8f0',
                      fontSize: '0.85rem', fontWeight: 500,
                      textDecoration: t.status === 'done' ? 'line-through' : 'none',
                    }}>
                      {t.title}
                    </div>
                    {t.assignee && (
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>
                        👤 {t.assignee} • עד {t.dueDate}
                      </div>
                    )}
                  </div>
                  <span style={{
                    padding: '3px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600,
                    background: t.priority === 'high' ? 'rgba(239,68,68,0.1)' : t.priority === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    color: t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981',
                  }}>
                    {t.priority === 'high' ? 'דחוף' : t.priority === 'medium' ? 'בינוני' : 'נמוך'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to Protokol (if available) */}
        <div style={{
          padding: '16px 28px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 12, flexWrap: 'wrap',
        }}>
          <a
            href="https://protokol.robium.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              background: 'rgba(124,58,237,0.1)', color: '#a78bfa',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
              border: '1px solid rgba(124,58,237,0.25)',
              transition: 'background 0.2s',
            }}
          >
            <ExternalLink size={16} />
            פתח ב-Protokol AI
          </a>
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
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
// #endregion
