import { getSupabaseBrowserClient } from "./supabase-browser.js";

function el(id) {
  return document.getElementById(id);
}

function csEn(cs, en) {
  const lang = document.documentElement.getAttribute("data-lang") || "cs";
  return lang === "en" ? en : cs;
}

/** Šestimístný OTP z šablony ({{ .Token }}), volitelně e-mail ({{ .Email }}). Parametry otp / token, e / email. */
function readOtpFromSearch(search) {
  const raw =
    typeof search === "string"
      ? search
      : typeof window !== "undefined"
        ? window.location.search || ""
        : "";
  const qs = new URLSearchParams(raw.replace(/^\?/, ""));
  let token = (qs.get("token") || qs.get("otp") || "").replace(/\s+/g, "").trim();
  if (!token || !/^\d{6,10}$/.test(token)) return null;
  let email = (qs.get("email") || qs.get("e") || "").trim();
  return { token, email: email.length > 0 ? email : null };
}

function stripOtpParamsFromLocation() {
  try {
    const u = new URL(window.location.href);
    ["token", "otp", "email", "e"].forEach((k) => u.searchParams.delete(k));
    const q = u.searchParams.toString();
    window.history.replaceState(null, "", u.pathname + (q ? `?${q}` : "") + u.hash);
  } catch (_) {}
}

async function verifySignupOtp(supabase, email, token) {
  const types = ["signup", "email"];
  let lastErr = null;
  for (const type of types) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (!error && data?.session?.user) return { error: null };
    lastErr = error ?? lastErr;
  }
  return { error: lastErr };
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
    /[#?&]code=/i.test(u) ||
    /token_hash=/i.test(u) ||
    /[?&](token|otp)=\d/.test(window.location.search || "")
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
  el("verified-otp-gate")?.setAttribute("hidden", "");
  el("verified-success")?.removeAttribute("hidden");
  el("verified-error")?.setAttribute("hidden", "");
  try {
    if (window.history.replaceState)
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (_) {}
}

function showError() {
  hideLoading();
  el("verified-otp-gate")?.setAttribute("hidden", "");
  el("verified-error")?.removeAttribute("hidden");
  el("verified-success")?.setAttribute("hidden", "");
  try {
    if (window.history.replaceState)
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (_) {}
}

function showOtpEmailGate(token) {
  hideLoading();
  el("verified-error")?.setAttribute("hidden", "");
  el("verified-success")?.setAttribute("hidden", "");
  const gate = el("verified-otp-gate");
  const hid = el("verified-otp-token-value");
  if (hid) hid.value = token;
  if (gate) gate.hidden = false;
}

async function boot() {
  const otpFromUrl = typeof window !== "undefined" ? readOtpFromSearch(window.location.search) : null;
  const urlErr = readAuthRedirectError();
  const hintFromUrl = hadEmailCallbackParams();

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const subtitle = el("verified-error-detail");
    if (subtitle) {
      subtitle.textContent = csEn("Spojení nelze inicializovat. Obnov stránku.", "Could not connect. Refresh the page.");
      subtitle.removeAttribute("hidden");
    }
    hideLoading();
    showError();
    return;
  }

  if (otpFromUrl?.token && otpFromUrl.email) {
    const { error: verErr } = await verifySignupOtp(supabase, otpFromUrl.email, otpFromUrl.token);
    stripOtpParamsFromLocation();
    if (!verErr) {
      hideLoading();
      showSuccess();
      return;
    }
    const subtitle = el("verified-error-detail");
    if (subtitle) {
      subtitle.textContent =
        verErr.message ||
        csEn("Kód nebo e-mail nesedí — požádej o nový ověřovací mail.", "The code does not match. Request a new verification email.");
      subtitle.removeAttribute("hidden");
    }
    hideLoading();
    showError();
    return;
  }

  if (otpFromUrl?.token && !otpFromUrl.email) {
    showOtpEmailGate(otpFromUrl.token);

    el("form-verified-otp-email")?.addEventListener(
      "submit",
      async (e) => {
        e.preventDefault();
        const status = el("verified-otp-status");
        const btn = el("verified-otp-submit");
        const mail = (el("verified-otp-email-field")?.value || "").trim();
        const tk = (
          el("verified-otp-token-value")?.value ||
          otpFromUrl.token ||
          ""
        ).replace(/\s+/g, "").trim();
        if (!mail || !tk) {
          if (status) status.textContent = csEn("Vyplň e-mail.", "Fill in email.");
          return;
        }
        if (btn) btn.disabled = true;
        if (status) status.textContent = csEn("Ověřuji…", "Verifying…");

        const { error: verErr } = await verifySignupOtp(supabase, mail, tk);
        stripOtpParamsFromLocation();

        if (verErr) {
          if (status)
            status.textContent =
              verErr.message ||
              csEn("Kód vypršel nebo nesedí. Požádej o nový e-mail.", "Code expired or invalid. Request a new email.");
          if (btn) btn.disabled = false;
          return;
        }

        hideLoading();
        el("verified-otp-gate")?.setAttribute("hidden", "");
        showSuccess();
      },
      { once: true },
    );
    return;
  }

  if (urlErr) {
    stripOtpParamsFromLocation();
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

  const { session, error: sessionErr } = await waitForAuthSession(
    supabase,
    hintFromUrl,
    hintFromUrl ? 6000 : 0,
  );

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
    hideLoading();
    showSuccess();
    return;
  }

  if (hintFromUrl) {
    const subtitle = el("verified-error-detail");
    if (subtitle) {
      subtitle.textContent = csEn("Odkaz je neplatný nebo vypršel.", "The link is invalid or has expired.");
      subtitle.removeAttribute("hidden");
    }
    showError();
    return;
  }

  const subtitle = el("verified-error-detail");
  if (subtitle) {
    subtitle.textContent = csEn(
      "Otevři odkaz z e-mailu po registraci, nebo zadej e-mail níže se žádostí o nový mail.",
      "Open the signup email link, or enter your email below to request a new one.",
    );
    subtitle.removeAttribute("hidden");
  }
  hideLoading();
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
