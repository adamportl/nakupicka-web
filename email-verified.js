import { getSupabaseBrowserClient } from "./supabase-browser.js";

function el(id) {
  return document.getElementById(id);
}

function csEn(cs, en) {
  const lang = document.documentElement.getAttribute("data-lang") || "cs";
  return lang === "en" ? en : cs;
}

/** Chyba předaná v redirect URL (implicit / někdy query). */
function readAuthRedirectError() {
  if (typeof window === "undefined") return null;
  const raw = [window.location.hash.replace(/^#/, ""), window.location.search.replace(/^\?/, "")]
    .filter(Boolean)
    .join("&");
  if (!raw) return null;
  const qp = new URLSearchParams(raw);
  const code = qp.get("error_code") || qp.get("error");
  const desc = qp.get("error_description");
  if (!code && !desc) return null;
  let description = "";
  if (desc) {
    try {
      description = decodeURIComponent(desc.replace(/\+/g, " "));
    } catch {
      description = desc;
    }
  }
  return { code, description };
}

function hadEmailCallbackParams() {
  if (typeof window === "undefined") return false;
  const u = `${window.location.hash || ""}${window.location.search || ""}`;
  return (
    /type=signup/i.test(u) ||
    /type=magiclink/i.test(u) ||
    /access_token=/i.test(u) ||
    /refresh_token=/i.test(u) ||
    /[&?]code=/.test(u)
  );
}

async function waitForAuthSession(supabase, retry, maxWaitMs) {
  async function fetchOnce() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) return { session: null, error };
    if (session?.user) return { session, error: null };
    return { session: null, error: null };
  }

  const first = await fetchOnce();
  if (first.session || first.error || !retry || maxWaitMs <= 0) return first;

  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 120));
    const next = await fetchOnce();
    if (next.session || next.error) return next;
  }
  return fetchOnce();
}

function hideLoading() {
  const load = el("verified-loading");
  if (load) load.hidden = true;
}

function showSuccess() {
  hideLoading();
  el("verified-success")?.removeAttribute("hidden");
  el("verified-error")?.setAttribute("hidden", "");
  try {
    if (window.history.replaceState)
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (_) {}
}

function showError() {
  hideLoading();
  el("verified-error")?.removeAttribute("hidden");
  el("verified-success")?.setAttribute("hidden", "");
  try {
    if (window.history.replaceState)
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (_) {}
}

async function boot() {
  const urlErr = readAuthRedirectError();

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const subtitle = el("verified-error-detail");
    if (subtitle) {
      subtitle.textContent = csEn("Spojení nelze inicializovat. Obnov stránku.", "Could not connect. Refresh the page.");
      subtitle.removeAttribute("hidden");
    }
    showError();
    return;
  }

  if (urlErr) {
    const subtitle = el("verified-error-detail");
    if (subtitle) {
      const extra = urlErr.description || urlErr.code || "";
      subtitle.textContent = extra
        ? `${csEn("Odkaz je neplatný nebo vypršel.", "The link is invalid or has expired.")} ${extra}`
        : csEn("Odkaz je neplatný nebo vypršel.", "The link is invalid or has expired.");
      subtitle.removeAttribute("hidden");
    }
    showError();
    return;
  }

  const hint = hadEmailCallbackParams();
  const { session, error: sessionErr } = await waitForAuthSession(supabase, hint, hint ? 6000 : 0);

  if (sessionErr) {
    const subtitle = el("verified-error-detail");
    if (subtitle) {
      subtitle.textContent = sessionErr.message || csEn("Došlo k chybě.", "Something went wrong.");
      subtitle.removeAttribute("hidden");
    }
    showError();
    return;
  }

  if (session?.user) {
    showSuccess();
    return;
  }

  if (hint) {
    const subtitle = el("verified-error-detail");
    if (subtitle) {
      subtitle.textContent = csEn(
        "Odkaz je neplatný nebo vypršel.",
        "The link is invalid or has expired.",
      );
      subtitle.removeAttribute("hidden");
    }
    showError();
    return;
  }

  const subtitle = el("verified-error-detail");
  if (subtitle) {
    subtitle.textContent = csEn(
      "Otevři ověřovací odkaz z e-mailu, který jsme poslali po registraci.",
      "Open the verification link from the email we sent after you signed up.",
    );
    subtitle.removeAttribute("hidden");
  }
  showError();
}

el("form-resend-verification")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const supabase = getSupabaseBrowserClient();
  const status = el("verified-resend-status");
  const emailInput = el("resend-email");
  const btn = el("resend-submit");
  const email = (emailInput?.value || "").trim();

  if (!email) {
    if (status) status.textContent = csEn("Zadej e-mail.", "Enter your email.");
    return;
  }
  if (!supabase) {
    if (status) status.textContent = csEn("Klient není k dispozici.", "Service unavailable.");
    return;
  }

  if (btn) btn.disabled = true;
  if (status) status.textContent = csEn("Odesílám…", "Sending…");

  const redirectTo = new URL("/email-verified", window.location.origin).href;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    if (status) status.textContent = error.message || csEn("Nepodařilo se odeslat.", "Could not send.");
    if (btn) btn.disabled = false;
    return;
  }

  if (status)
    status.textContent = csEn(
      "Pokud účet existuje, poslali jsme nový e-mail. Zkontroluj schránku.",
      "If an account exists, we sent a new email. Check your inbox.",
    );
  if (btn) btn.disabled = false;
});

document.addEventListener("DOMContentLoaded", () => boot());
