/**
 * FILE: useRecentPages.ts
 * PURPOSE: Tracks recently visited pages for CommandPalette "recent pages" section
 * DEPENDENCIES: react-router-dom, localStorage
 */

// #region Imports
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveBreadcrumb } from '../data/breadcrumbsMap';
// #endregion

// #region Types

/** A recently visited page entry */
export interface RecentPage {
  /** Route path */
  path: string;
  /** Hebrew display label */
  label: string;
  /** Emoji icon */
  emoji: string;
  /** Timestamp of last visit */
  timestamp: number;
}

// #endregion

// #region Constants
const STORAGE_KEY = 'brain-recent-pages';
const MAX_RECENT = 5;
// #endregion

// #region Hook

/**
 * useRecentPages — Tracks page visits and stores last 5 in localStorage.
 * Automatically records each route change.
 * @returns Array of recent pages, most recent first
 */
export function useRecentPages(): RecentPage[] {
  const location = useLocation();
  const [recentPages, setRecentPages] = useState<RecentPage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Record page visit on location change
  useEffect(() => {
    const path = location.pathname;
    const node = resolveBreadcrumb(path);
    if (!node) return; // Skip unknown routes

    setRecentPages(prev => {
      // Remove existing entry for this path
      const filtered = prev.filter(p => p.path !== path);
      // Add to front
      const updated = [
        { path, label: node.label, emoji: node.emoji, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT);

      // Persist
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch { /* localStorage full — ignore */ }

      return updated;
    });
  }, [location.pathname]);

  return recentPages;
}

/**
 * useRecentPagesStatic — Returns recent pages without tracking.
 * Use in components that just want to read recent pages (like CommandPalette).
 */
export function useRecentPagesStatic(): RecentPage[] {
  const getStored = useCallback((): RecentPage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const [pages, setPages] = useState<RecentPage[]>(getStored);

  // Re-read when component mounts or storage changes
  useEffect(() => {
    setPages(getStored());

    const handler = () => setPages(getStored());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [getStored]);

  return pages;
}

// #endregion
