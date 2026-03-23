/**
 * FILE: useKeyboardShortcuts.ts
 * PURPOSE: Global keyboard shortcuts for quick actions
 * DEPENDENCIES: react, react-router-dom
 *
 * Shortcuts:
 * - Ctrl+K / ⌘+K → Open command palette
 * - Ctrl+1 → Dashboard
 * - Ctrl+2 → CEO Office
 * - Ctrl+3 → Settings
 * - Escape → Close modals
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// #region Types

interface KeyboardOptions {
  /** Callback when Ctrl+K is pressed (open command palette) */
  onCommandPalette?: () => void;
  /** Callback on Escape */
  onEscape?: () => void;
}

// #endregion

// #region Hook

/**
 * useKeyboardShortcuts — Registers global keyboard shortcuts.
 * @param options — Callbacks for specific key combos
 */
export function useKeyboardShortcuts(options: KeyboardOptions = {}) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const target = e.target as HTMLElement;

    // Don't interfere with text inputs
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      if (e.key === 'Escape') {
        (target as HTMLInputElement).blur();
        options.onEscape?.();
      }
      return;
    }

    // Ctrl+K — Command Palette
    if (isCtrl && e.key === 'k') {
      e.preventDefault();
      options.onCommandPalette?.();
      return;
    }

    // Ctrl+1/2/3 — Quick navigation
    if (isCtrl && e.key === '1') { e.preventDefault(); navigate('/'); return; }
    if (isCtrl && e.key === '2') { e.preventDefault(); navigate('/ceo'); return; }
    if (isCtrl && e.key === '3') { e.preventDefault(); navigate('/settings'); return; }

    // Escape
    if (e.key === 'Escape') {
      options.onEscape?.();
    }
  }, [navigate, options]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// #endregion
