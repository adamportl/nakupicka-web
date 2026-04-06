import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

function closeDropdown(wrap, trigger) {
  wrap.classList.remove("is-open");
  trigger?.setAttribute("aria-expanded", "false");
}

function openDropdown(wrap, trigger) {
  wrap.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");
}

async function init() {
  const wrap = document.getElementById("navUserWrap");
  const trigger = document.getElementById("navUserTrigger");
  const dropdown = document.getElementById("navUserDropdown");
  const logoutBtn = document.getElementById("navUserLogout");
  const emailEl = document.getElementById("navUserEmail");

  if (!wrap || !trigger || !dropdown) return;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    logoutBtn?.setAttribute("hidden", "");
    emailEl?.setAttribute("hidden", "");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  async function refresh() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      logoutBtn?.removeAttribute("hidden");
      emailEl?.removeAttribute("hidden");
      if (emailEl) emailEl.textContent = session.user.email || "";
    } else {
      logoutBtn?.setAttribute("hidden", "");
      emailEl?.setAttribute("hidden", "");
      if (emailEl) emailEl.textContent = "";
    }
  }

  await refresh();
  supabase.auth.onAuthStateChange(() => {
    refresh();
  });

  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.auth.signOut();
    closeDropdown(wrap, trigger);
    window.location.reload();
  });

  const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

  trigger.addEventListener("click", (e) => {
    if (!coarse) return;
    e.preventDefault();
    e.stopPropagation();
    if (wrap.classList.contains("is-open")) {
      closeDropdown(wrap, trigger);
    } else {
      openDropdown(wrap, trigger);
    }
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      closeDropdown(wrap, trigger);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown(wrap, trigger);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
