import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client (anon key). Returns null if env vars are missing.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        // Implicit flow keeps recovery links portable across devices/browsers.
        // (PKCE requires a stored code_verifier from the device that initiated the flow.)
        flowType: "implicit",
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof localStorage !== "undefined" ? localStorage : undefined,
      },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}
