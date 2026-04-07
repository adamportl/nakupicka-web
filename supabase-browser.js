/**
 * Jeden Supabase klient pro celý web — na stránkách s více moduly (např. app.html:
 * account-nav + app) musí být stejná instance a stejné auth volby, jinak Web Locks
 * a localStorage session kolidují a auth může viset bez requestů.
 *
 * Safari: esm.sh někdy selže na načtení modulů; jsdelivr +esm je stabilnější.
 * Safari / soukromé okno: localStorage může vyhodit — použijeme paměť (session jen do zavření karty).
 */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.86.0/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

let singleton = null;

function createMemoryStorage() {
  const map = new Map();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
  };
}

/** localStorage pokud jde použít, jinak in-memory (Safari soukromé okno apod.) */
function getAuthStorage() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return createMemoryStorage();
    const k = "__nakupicka_sb_ls__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return createMemoryStorage();
  }
}

export function getSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!singleton) {
    singleton = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: getAuthStorage(),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        lock: async (_name, _acquireTimeout, fn) => fn(),
      },
    });
  }
  return singleton;
}
