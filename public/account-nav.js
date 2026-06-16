import { getSupabaseBrowserClient } from "./supabase-browser.js";

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
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    logoutBtn?.setAttribute("hidden", "");
    emailEl?.setAttribute("hidden", "");
    return;
  }

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
