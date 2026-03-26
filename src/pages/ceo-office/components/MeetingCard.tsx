/* ============================================
   FILE: MeetingCard.tsx
   PURPOSE: MeetingCard component
   DEPENDENCIES: lucide-react
   EXPORTS: MeetingCard (default)
   ============================================ */
// #region Imports

import { Users, Clock, Trash2, Package, Link } from 'lucide-react';
import type { Meeting } from '../types';


// #endregion

// #region Types

interface Props {
  meeting: Meeting;
  onDelete: (id: string) => void;
  onClick?: (meeting: Meeting) => void;
  /** Direct edit prep handler — shown as a button on the card */
  onEditPrep?: (meeting: Meeting) => void;
}


// #endregion

// #region Component

/** MeetingCard component — MeetingCard component */
export default function MeetingCard({ meeting: m, onDelete, onClick, onEditPrep }: Props) {
  const hasPrepStages = m.prepStages && m.prepStages.length > 0;

  return (
    <div
      className="agenda-item"
      style={{ cursor: onClick ? 'pointer' : undefined }}
      onClick={() => onClick?.(m)}
    >
      <div className="agenda-time">{m.time}</div>
      <div className="agenda-color-bar" style={{ background: m.color }} />
      <div className="agenda-content" style={{ flex: 1 }}>
        <h4>{m.title}</h4>
        <p><Users size={12} style={{ display: 'inline', marginLeft: 4 }} /> {m.participants.join(', ')}</p>
        <p><Clock size={12} style={{ display: 'inline', marginLeft: 4 }} /> {m.duration} דק׳</p>
        {m.topics.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {m.topics.slice(0, 3).map((t, i) => (
              <span key={i} className="agenda-badge" style={{ background: `${m.color}15`, color: m.color, marginLeft: 4 }}>
                {typeof t === 'string' ? t : t.text}
              </span>
            ))}
            {m.topics.length > 3 && (
              <span className="agenda-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', marginLeft: 4 }}>
                +{m.topics.length - 3} עוד...
              </span>
            )}
          </div>
        )}

        {/* Actions Container */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {/* Direct Prep Access */}
          {onEditPrep && (
            <button
              onClick={(e) => { e.stopPropagation(); onEditPrep(m); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                background: hasPrepStages ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.08)',
                color: hasPrepStages ? '#a78bfa' : '#60a5fa',
                border: `1px solid ${hasPrepStages ? 'rgba(139,92,246,0.25)' : 'rgba(59,130,246,0.2)'}`,
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
                width: 'fit-content',
              }}
            >
              <Package size={13} />
              {hasPrepStages
                ? `📦 ערוך חומרי הכנה (${m.prepStages!.length} שלבים)`
                : '+ הוסף חומרי הכנה'}
            </button>
          )}

          {/* Share Invitation Link */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              const link = `https://meeting-invite-opal.vercel.app/?title=${encodeURIComponent(m.title)}&time=${encodeURIComponent(m.time)}`;
              navigator.clipboard.writeText(link).then(() => {
                alert('קישור לחדר הפגישה הוירטואלי הועתק בהצלחה!\n\nהקישור: ' + link);
              });
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(16,185,129,0.1)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.2)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
              width: 'fit-content',
            }}
            title="העתק קישור לחדר הפגישה הוירטואלי"
          >
            <Link size={13} /> הגדר חדר וירטואלי (העתק קישור)
          </button>
        </div>
      </div>
      <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(m.id); }} title="מחק">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// #endregion
