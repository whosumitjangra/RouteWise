import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RouteSearchResponse, SavedRouteRecord } from './types';

let cachedClient: SupabaseClient | null = null;
const LOCAL_STORAGE_KEY = 'routewise_saved_routes_v1';
const SUPABASE_CONFIG_KEY = 'routewise_supabase_config_v1';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // Check browser localStorage custom config if on client
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return { url: parsed.url, anonKey: parsed.anonKey };
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  return { url: '', anonKey: '' };
}

export function setCustomSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (!url || !anonKey) {
      localStorage.removeItem(SUPABASE_CONFIG_KEY);
      cachedClient = null;
      return;
    }
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url, anonKey }));
    cachedClient = createClient(url, anonKey);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, anonKey);
    const { error } = await client.from('saved_routes').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
}

export async function saveRouteToDatabase(payload: {
  origin: string;
  destination: string;
  maxBudget: number;
  priorityMode: 'fastest' | 'cheapest' | 'balanced';
  selectedMode?: string;
  routePayload: RouteSearchResponse;
}): Promise<{ success: boolean; source: 'supabase' | 'local'; record: SavedRouteRecord }> {
  const newRecord: SavedRouteRecord = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `route-${Date.now()}`,
    origin: payload.origin,
    destination: payload.destination,
    max_budget: payload.maxBudget,
    priority_mode: payload.priorityMode,
    selected_mode: payload.selectedMode,
    route_payload: payload.routePayload,
    created_at: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('saved_routes')
        .insert([
          {
            origin: payload.origin,
            destination: payload.destination,
            max_budget: payload.maxBudget,
            priority_mode: payload.priorityMode,
            selected_mode: payload.selectedMode,
            route_payload: payload.routePayload,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return { success: true, source: 'supabase', record: data };
      }
    } catch (e) {
      console.warn('Supabase insert failed, saving to localStorage:', e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const existing = getSavedRoutesFromLocal();
      const updated = [newRecord, ...existing.filter((r) => r.id !== newRecord.id)].slice(0, 25);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }

  return { success: true, source: 'local', record: newRecord };
}

export function getSavedRoutesFromLocal(): SavedRouteRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchAllSavedRoutes(): Promise<{ records: SavedRouteRecord[]; source: 'supabase' | 'local' }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('saved_routes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (!error && data) {
        return { records: data as SavedRouteRecord[], source: 'supabase' };
      }
    } catch (e) {
      console.warn('Failed to fetch from Supabase, loading local:', e);
    }
  }

  return { records: getSavedRoutesFromLocal(), source: 'local' };
}

export async function deleteSavedRoute(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('saved_routes').delete().eq('id', id);
    } catch {
      // Continue to local
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const existing = getSavedRoutesFromLocal();
      const updated = existing.filter((r) => r.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }
  return true;
}
