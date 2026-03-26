/* ============================================
   FILE: clientService.ts
   PURPOSE: CRUD operations for clients in Supabase
   DEPENDENCIES: supabaseClient
   EXPORTS: getClients, createOrUpdateClient, getClientStats
   ============================================ */
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

export interface BrainClient {
  id: string; // Typically the client name or a UUID
  name: string;
  status: 'פעיל' | 'הושלם' | 'מוקפא';
  files_count: number;
  last_ingest_date?: string;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = 'brain_clients_fallback';

/**
 * Get all real clients from Supabase or LocalStorage
 */
export async function getClients(): Promise<BrainClient[]> {
  if (!isSupabaseConfigured()) {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  try {
    const { data, error } = await getSupabase()!
      .from('clients')
      .select('*')
      .order('last_ingest_date', { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty
      if (error.code === '42P01') {
        console.warn(`[clientService] Table 'clients' doesn't exist yet. Run SQL schema.`);
        return [];
      }
      throw error;
    }

    return (data || []) as BrainClient[];
  } catch (err) {
    console.error('[clientService] Error fetching clients:', err);
    return [];
  }
}

/**
 * Creates a new client or updates an existing client's file count.
 * Used primarily when a user ingests a folder with the client's name.
 * Returns the client ID for routing.
 */
export async function createOrUpdateClient(clientName: string, newFilesCount: number): Promise<string> {
  const safeName = clientName.trim();
  const fallbackId = `client_${Date.now()}`;

  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const clients = await getClients();
    const existing = clients.find(c => c.name === safeName);
    
    if (existing) {
      existing.files_count = (existing.files_count || 0) + newFilesCount;
      existing.last_ingest_date = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
      return existing.id;
    } else {
      const newClient: BrainClient = {
        id: fallbackId,
        name: safeName,
        status: 'פעיל',
        files_count: newFilesCount,
        last_ingest_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      clients.push(newClient);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
      return newClient.id;
    }
  }

  try {
    // 1. Check if client already exists (we use exact name match)
    const { data: existing } = await getSupabase()!
      .from('clients')
      .select('id, files_count')
      .eq('name', safeName)
      .limit(1)
      .single();

      if (existing) {
      // Update existing
      await getSupabase()!
        .from('clients')
        .update({ 
          files_count: existing.files_count + newFilesCount,
          last_ingest_date: new Date().toISOString()
        })
        .eq('id', existing.id);
      return existing.id;
    } else {
      // Insert new
      const newId = `client_${Date.now()}`;
      await getSupabase()!
        .from('clients')
        .insert({
          id: newId,
          name: safeName,
          status: 'פעיל',
          files_count: newFilesCount,
          last_ingest_date: new Date().toISOString()
        });
      return newId;
    }
  } catch (err) {
    console.error(`[clientService] Error updating client ${safeName}:`, err);
    return '';
  }
}

/**
 * Fetch top level stats for the dashboard based on real clients
 */
export async function getClientStats() {
  const clients = await getClients();
  
  return {
    totalClients: clients.length,
    active: clients.filter(c => c.status === 'פעיל').length,
    completed: clients.filter(c => c.status === 'הושלם').length,
    filesInSystem: clients.reduce((acc, c) => acc + (c.files_count || 0), 0)
  };
}
