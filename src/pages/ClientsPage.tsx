/* ============================================
   FILE: ClientsPage.tsx
   PURPOSE: ClientsPage component
   DEPENDENCIES: react, lucide-react, react-router-dom
   EXPORTS: ClientsPage (default)
   ============================================ */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALL_CLIENTS, PROCESS_LABELS, FILTER_OPTIONS, type ClientProcess, type Client } from '../data/clients';

const STORAGE_KEY = 'brain-client-statuses';

function loadClients(): Client[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const statusMap: Record<string, 'active' | 'done'> = JSON.parse(saved);
      return ALL_CLIENTS.map(c => ({
        ...c,
        status: statusMap[c.name] ?? c.status,
      }));
    }
  } catch { /* ignore bad data */ }
  return ALL_CLIENTS;
}

function saveClients(clients: Client[]) {
  const statusMap: Record<string, 'active' | 'done'> = {};
  clients.forEach(c => { statusMap[c.name] = c.status; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(loadClients);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClientProcess | 'all'>('all');

  // Auto-save whenever statuses change
  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  const filtered = useMemo(() => {
    let list = clients;
    if (filter !== 'all') list = list.filter(c => c.process === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.source.toLowerCase().includes(q));
    }
    return list;
  }, [clients, search, filter]);

  const activeCount = clients.filter(c => c.status === 'active').length;

  const updateStatus = useCallback((client: Client, newStatus: 'active' | 'done') => {
    setClients(prev => prev.map(c => (c.name === client.name ? { ...c, status: newStatus } : c)));
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Users size={28} style={{ color: '#c9a84c' }} />
              כל תיקי הלקוחות
              <span style={{
                background: 'linear-gradient(135deg, #c9a84c, #a3862e)',
                padding: '4px 16px', borderRadius: 100, fontSize: '0.85rem', color: '#fff', fontWeight: 700,
              }}>
                {clients.length}
              </span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              {clients.length} תיקים · 8 תהליכים · {activeCount} פעילים · 22+ שנות ניסיון
            </p>
          </div>
          <Link to="/" style={{
            textDecoration: 'none', color: '#c9a84c', fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <ArrowLeft size={16} /> חזרה לדשבורד
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="brain-stats-bar" style={{ marginBottom: 20 }}>
        {[
          { n: clients.length, l: 'סה"כ תיקים', c: '#c9a84c' },
          { n: activeCount, l: 'פעילים', c: '#34d399' },
          { n: clients.length - activeCount, l: 'הושלמו', c: '#64748b' },
          { n: new Set(clients.map(c => c.process)).size, l: 'תהליכים', c: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} className="brain-stat">
            <div className="brain-stat-num" style={{ color: s.c }}>{s.n}</div>
            <div className="brain-stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 חפש שם לקוח..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingRight: 16, fontSize: '0.92rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: '0.82rem', fontWeight: filter === f.key ? 600 : 500,
                border: `1px solid ${filter === f.key ? '#c9a84c' : 'rgba(148,163,184,0.2)'}`,
                background: filter === f.key ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))' : 'transparent',
                color: filter === f.key ? '#c9a84c' : '#94a3b8',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Heebo, sans-serif',
              }}
            >
              {f.label}{f.count ? ` (${f.count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: 12, fontSize: '0.82rem', color: '#64748b' }}>
        מציג {filtered.length} מתוך {clients.length} לקוחות
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'שם לקוח', 'תהליך', 'סטטוס', 'מקור'].map(h => (
                  <th key={h} style={{
                    textAlign: 'right', padding: '12px 14px', fontSize: '0.78rem', fontWeight: 600,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5,
                    borderBottom: '1px solid rgba(148,163,184,0.2)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const p = PROCESS_LABELS[c.process];
                return (
                  <tr key={i} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.88rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 12px', borderRadius: 8,
                        fontSize: '0.72rem', fontWeight: 600,
                        background: `${p.color}1A`, color: p.color, border: `1px solid ${p.color}33`,
                      }}>
                        {p.text}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: c.status === 'active' ? '#34d399' : '#64748b',
                          boxShadow: c.status === 'active' ? '0 0 8px rgba(52,211,153,0.4)' : 'none',
                          display: 'inline-block', flexShrink: 0
                        }} />
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c, e.target.value as 'active' | 'done')}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(148,163,184,0.3)',
                            color: c.status === 'active' ? '#e2e8f0' : '#94a3b8',
                            fontSize: '0.82rem',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontFamily: 'Heebo, sans-serif'
                          }}
                        >
                          <option value="active" style={{ background: '#0f172a', color: '#e2e8f0' }}>פעיל</option>
                          <option value="done" style={{ background: '#0f172a', color: '#e2e8f0' }}>הושלם</option>
                        </select>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {c.source}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', fontSize: '0.95rem' }}>
            <p>לא נמצאו תוצאות 😕</p>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>נסה חיפוש אחר</p>
          </div>
        )}
      </div>
    </div>
  );
}
