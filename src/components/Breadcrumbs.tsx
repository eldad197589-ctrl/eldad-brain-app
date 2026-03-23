/**
 * FILE: Breadcrumbs.tsx
 * PURPOSE: Location-aware breadcrumb trail with back button for navigation clarity
 * DEPENDENCIES: react-router-dom, breadcrumbsMap
 */

// #region Imports
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { buildBreadcrumbChain } from '../data/breadcrumbsMap';
// #endregion

// #region Component

/**
 * Breadcrumbs — Shows the user's current location in the app hierarchy.
 * Displays a clickable trail: 📊 דשבורד › 🏢 לשכת מנכ"ל
 * Includes a back button when not on the root page.
 */
export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const chain = buildBreadcrumbChain(location.pathname);

  // Don't render on dashboard (root) — user is already "home"
  if (chain.length <= 1) return null;

  return (
    <div className="breadcrumbs-bar">
      {/* Back button */}
      <button
        className="breadcrumb-back"
        onClick={() => navigate(-1)}
        title="חזרה"
      >
        <ArrowRight size={14} />
      </button>

      {/* Breadcrumb chain */}
      <nav className="breadcrumb-chain" aria-label="breadcrumb">
        {chain.map((item, idx) => {
          const isLast = idx === chain.length - 1;
          return (
            <span key={item.path} className="breadcrumb-segment">
              {idx > 0 && (
                <ChevronLeft size={12} className="breadcrumb-separator" />
              )}
              {isLast ? (
                <span className="breadcrumb-current">
                  <span className="breadcrumb-emoji">{item.node.emoji}</span>
                  {item.node.label}
                </span>
              ) : (
                <Link to={item.path} className="breadcrumb-link">
                  <span className="breadcrumb-emoji">{item.node.emoji}</span>
                  {item.node.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}

// #endregion
