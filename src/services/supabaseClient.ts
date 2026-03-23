/* ============================================
   FILE: supabaseClient.ts
   PURPOSE: supabaseClient module
   DEPENDENCIES: @supabase
   EXPORTS: isSupabaseConfigured, getSupabase
   ============================================ */
/**
 * FILE: supabaseClient.ts
 * PURPOSE: Initialize Supabase client with graceful fallback
 * DEPENDENCIES: @supabase/supabase-js
 *
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env,
 * the app uses Supabase for persistence. Otherwise, falls back to localStorage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// #region Configuration

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabaseInstance: SupabaseClient | null = null;

// #endregion

// #region Public API

/**
 * Check if Supabase credentials are configured.
 * When false, the app uses localStorage as fallback.
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_URL.length > 10 && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10);
}

/**
 * Get the Supabase client instance (singleton).
 * Returns null if Supabase is not configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }

  return supabaseInstance;
}

// #endregion
