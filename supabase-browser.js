/**
 * Jeden Supabase klient pro celý web — na stránkách s více moduly (např. app.html:
 * account-nav + app) musí být stejná instance a stejné auth volby, jinak Web Locks
 * a localStorage session kolidují a auth může viset bez requestů.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

let singleton = null;

export function getSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!singleton) {
    singleton = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        lock: async (_name, _acquireTimeout, fn) => fn(),
      },
    });
  }
  return singleton;
}
