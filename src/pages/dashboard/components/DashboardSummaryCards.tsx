/* ============================================
   FILE: DashboardSummaryCards.tsx
   PURPOSE: DashboardSummaryCards component
   DEPENDENCIES: lucide-react, react-router-dom
   EXPORTS: DashboardSummaryCards (default)
   ============================================ */
/**
 * FILE: DashboardSummaryCards.tsx
 * PURPOSE: Show live lists of open tasks, today's meetings, and pending documents on the dashboard
 * DEPENDENCIES: brainStore
 */

// #region Imports
import { useBrainStore } from '../../../store/brainStore';
import { CheckCircle2, FileText, Calendar as CalendarIcon, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
// #endregion

// #region Component
export default function DashboardSummaryCards() {
  const { tasks, meetings, documents, toggleTask } = useBrainStore();

  const openTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayMeetings = meetings.filter(m => m.date === todayDateStr).slice(0, 5);
  const pendingDocs = documents.filter(d => d.status === 'pending').slice(0, 5);

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 12,
    flex: 1, minWidth: 280,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: 10, marginBottom: 4,
  };

  return (
    <div style={{
      display: 'flex', gap: 20, flexWrap: 'wrap',
      marginBottom: 30, padding: '0 20px',
    }}>
      {/* 📋 TASKS */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <CheckCircle2 size={18} color="#3b82f6" />
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>משימות דחופות</h3>
          <span style={{ marginRight: 'auto', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600 }}>
            {openTasks.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {openTasks.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>אין משימות פתוחות</div>
          ) : openTasks.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => toggleTask(t.id)}
                style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent', cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 📅 MEETINGS */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <CalendarIcon size={18} color="#a78bfa" />
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>פגישות להיום</h3>
          <span style={{ marginRight: 'auto', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600 }}>
            {todayMeetings.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todayMeetings.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>אין פגישות היום</div>
          ) : todayMeetings.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 8 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', width: 45, flexShrink: 0 }}>
                {m.time}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                {m.participants?.length > 0 && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>עם {m.participants.join(', ')}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📥 DOCUMENTS */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <FileText size={18} color="#fbbf24" />
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>מסמכים ממתינים</h3>
          <span style={{ marginRight: 'auto', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600 }}>
            {pendingDocs.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingDocs.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>קופסת האינבוקס ריקה</div>
          ) : pendingDocs.map((doc) => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={13} color="#fbbf24" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.description}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {doc.docType} <LinkIcon size={8} /> {doc.linkedTo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⚖️ BOARD / FOUNDERS */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <FileText size={18} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>מסמכי התאגדות</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4, flex: 1 }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
            גישה מהירה להסכם המייסדים (Robium בע"מ), לטבלת המניות השלמה ולתנאי התאגיד.
          </div>
          <Link
            to="/agreement"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 8,
              background: 'rgba(16,185,129,0.1)', color: '#34d399',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
              border: '1px solid rgba(16,185,129,0.25)',
              marginTop: 'auto', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
          >
            <FileText size={16} />
            הסכם מייסדים (מעודכן)
          </Link>
        </div>
      </div>
    </div>
  );
}
// #endregion
