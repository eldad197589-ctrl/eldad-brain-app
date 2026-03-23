/* ============================================
   FILE: CollapsibleSection.tsx
   PURPOSE: CollapsibleSection component
   DEPENDENCIES: react
   EXPORTS: CollapsibleSection (default)
   ============================================ */
/**
 * FILE: CollapsibleSection.tsx
 * PURPOSE: Collapsible sidebar panel — card-based design with accent color and description
 * DEPENDENCIES: react (useState)
 */

// #region Imports
import { useState } from 'react';
// #endregion

// #region Types
/** Props for the CollapsibleSection component */
interface Props {
  /** Section label (Hebrew) */
  label: string;
  /** Emoji icon for the section */
  emoji: string;
  /** Short description under label */
  description?: string;
  /** Accent color for the panel left-border */
  accentColor?: string;
  /** Whether the section starts expanded */
  defaultOpen: boolean;
  /** If true, section is always open and header is not clickable */
  alwaysOpen?: boolean;
  /** Child navigation items */
  children: React.ReactNode;
}
// #endregion

// #region Component
/**
 * CollapsibleSection — A sidebar panel that toggles visibility of its children.
 * Non-core panels appear as card-style boards with accent color strip.
 */
export default function CollapsibleSection({
  label,
  emoji,
  description,
  accentColor,
  defaultOpen,
  alwaysOpen,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /** Whether to show children */
  const showContent = alwaysOpen || isOpen;

  // Core section — simple, always visible, no card wrapper
  if (alwaysOpen) {
    return <div className="collapsible-section">{children}</div>;
  }

  // Panel-style section with card design
  return (
    <div
      className={`sidebar-panel ${isOpen ? 'sidebar-panel--open' : ''}`}
      style={{
        '--panel-accent': accentColor || '#64748b',
      } as React.CSSProperties}
    >
      <button
        className="sidebar-panel-header"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={showContent}
      >
        <span className="sidebar-panel-emoji">{emoji}</span>
        <div className="sidebar-panel-text">
          <span className="sidebar-panel-label">{label}</span>
          {description && !isOpen && (
            <span className="sidebar-panel-desc">{description}</span>
          )}
        </div>
        <span className={`sidebar-panel-arrow ${showContent ? 'open' : ''}`}>
          ▾
        </span>
      </button>
      {showContent && (
        <div className="sidebar-panel-content">
          {children}
        </div>
      )}
    </div>
  );
}
// #endregion
