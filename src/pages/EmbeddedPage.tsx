/**
 * FILE: EmbeddedPage.tsx
 * PURPOSE: Generic wrapper for loading legacy HTML files in an iframe within the app layout
 * DEPENDENCIES: react-router-dom, lucide-react
 */
import { Link } from 'react-router-dom';
import { Home, ExternalLink } from 'lucide-react';

// #region Types

interface EmbeddedPageProps {
  /** Page title displayed above the iframe */
  title: string;
  /** URL to the HTML file (relative to public/) */
  src: string;
  /** Optional badge text */
  badge?: string;
  /** Optional badge color */
  badgeColor?: string;
}

// #endregion

// #region Component

/**
 * Loads a legacy HTML page inside an iframe with a header and navigation.
 * @param {EmbeddedPageProps} props
 * @returns Embedded page wrapper
 */
export default function EmbeddedPage({ title, src, badge, badgeColor = '#7C3AED' }: EmbeddedPageProps) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {badge && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px',
              borderRadius: 20, background: `${badgeColor}15`, color: badgeColor,
              border: `1px solid ${badgeColor}30`,
            }}>
              {badge}
            </span>
          )}
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/" className="flow-nav-btn"><Home size={16} /> דשבורד</Link>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flow-nav-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ExternalLink size={14} /> פתח בחלון חדש
          </a>
        </div>
      </div>

      {/* Iframe */}
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#fff',
      }}>
        <iframe
          src={src}
          title={title}
          style={{
            width: '100%',
            height: 'calc(100vh - 180px)',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

// #endregion
