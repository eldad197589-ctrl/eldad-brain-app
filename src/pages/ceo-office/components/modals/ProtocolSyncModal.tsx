/* ============================================
   FILE: ProtocolSyncModal.tsx
   PURPOSE: ProtocolSyncModal component
   DEPENDENCIES: react, lucide-react
   EXPORTS: ProtocolSyncModal (default)
   ============================================ */
import { useState, useMemo } from 'react';
import { Calendar, RefreshCw, Check } from 'lucide-react';
import type { Meeting, Task } from '../../types';
import { detectCategory } from '../../constants';

interface Props {
  meetings: Meeting[];
  tasks: Task[];
  onAdd: (t: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export default function ProtocolSyncModal({ meetings, tasks, onAdd, onClose }: Props) {
  // Gather all topics from all meetings
  const allTopics = useMemo(() => {
    const topics: { topic: string; meetingId: string; meetingTitle: string; meetingDate: string; color: string }[] = [];
    meetings.forEach(m => {
      m.topics.forEach(t => {
        topics.push({ topic: typeof t === 'string' ? t : t.text, meetingId: m.id, meetingTitle: m.title, meetingDate: m.date, color: m.color });
      });
    });
    return topics;
  }, [meetings]);

  // Check which topics already have matching tasks
  const existingTaskTitles = useMemo(() =>
    new Set(tasks.map(t => t.title.toLowerCase())),
    [tasks]
  );

  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSync = () => {
    selected.forEach(idx => {
      const item = allTopics[idx];
      if (!item) return;
      onAdd({
        title: item.topic,
        dueDate: item.meetingDate,
        priority: 'medium',
        status: 'todo',
        category: detectCategory(item.topic),
        sourceProtocol: item.meetingId,
      });
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <h2 className="modal-title">
          <RefreshCw size={22} style={{ color: '#a78bfa' }} />
          עדכון משימות מפרוטוקול
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px' }}>
          בחר נושאים מפגישות כדי להוסיף אותם כמשימות ללוח השנה
        </p>

        {allTopics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
            <Calendar size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>אין נושאים מפגישות</p>
          </div>
        ) : (
          <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: 16 }}>
            {allTopics.map((item, idx) => {
              const isExisting = existingTaskTitles.has(item.topic.toLowerCase());
              const isSelected = selected.has(idx);

              if (isExisting) {
                return (
                  <div key={idx} className="protocol-existing">
                    ✅ {item.topic} — כבר קיימת
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`protocol-topic-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggle(idx)}
                >
                  <div className="protocol-topic-check">
                    {isSelected && <Check size={12} color="#fff" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{item.topic}</div>
                    <div className="protocol-meeting-badge" style={{ background: `${item.color}15`, color: item.color }}>
                      {item.meetingTitle} · {item.meetingDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={handleSync}
            disabled={selected.size === 0}
            style={{ opacity: selected.size === 0 ? 0.4 : 1 }}
          >
            ✅ הוסף {selected.size > 0 ? `${selected.size} משימות` : 'משימות'}
          </button>
          <button className="btn-secondary" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
