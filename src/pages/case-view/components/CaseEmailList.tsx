/* ============================================
   FILE: CaseEmailList.tsx
   PURPOSE: Pure component — renders a table of case emails
   DEPENDENCIES: react, lucide-react
   EXPORTS: CaseEmailList (default)
   ============================================ */
import { Mail, ExternalLink } from 'lucide-react';
import type { CaseEmail } from '../../../data/caseTypes';

// #region Types

interface CaseEmailListProps {
  /** Email array from CaseEntity */
  emails: CaseEmail[];
}

// #endregion

// #region Component

/** Pure email list — receives data via props only */
export default function CaseEmailList({ emails }: CaseEmailListProps) {
  if (emails.length === 0) {
    return <div style={{ color: '#64748b', padding: 16, textAlign: 'center' }}>אין מיילים בתיק</div>;
  }

  return (
    <div className="case-section">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
        <Mail size={18} color="#3b82f6" />
        מיילים ({emails.length})
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={thStyle}>תאריך</th>
              <th style={thStyle}>מאת</th>
              <th style={thStyle}>נושא</th>
              <th style={thStyle}>תקציר</th>
            </tr>
          </thead>
          <tbody>
            {emails.map(email => (
              <tr key={email.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={tdStyle}>{formatDate(email.date)}</td>
                <td style={tdStyle}>{extractName(email.from)}</td>
                <td style={{ ...tdStyle, maxWidth: 300 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {email.subject.slice(0, 60)}
                    {email.subject.length > 60 && '...'}
                    <ExternalLink size={12} color="#64748b" />
                  </span>
                </td>
                <td style={{ ...tdStyle, color: '#94a3b8', maxWidth: 250 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span>{email.snippet.slice(0, 80)}{email.snippet.length > 80 ? '...' : ''}</span>
                    {email.isPartial && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                        PARTIAL: חסר {email.missingFields?.join(', ')}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// #endregion

// #region Helpers

const thStyle: React.CSSProperties = {
  textAlign: 'right', padding: '8px 12px', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch { return d; }
}

function extractName(from: string): string {
  const match = from.match(/^([^<]+)/);
  return match ? match[1].trim().replace(/"/g, '') : from;
}

// #endregion
