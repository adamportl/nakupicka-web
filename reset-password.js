import { getSupabaseBrowserClient } from "./supabase-browser.js";

/** Zachytí recovery token/hash ještě před tím, než klient vyčistí URL. */
function hadAuthRecoveryParams() {
  if (typeof window === "undefined") return false;
  const u = `${window.location.hash || ""}${window.location.search || ""}`;
  return (
    /type=recovery/i.test(u) ||
    /access_token=/i.test(u) ||
    /refresh_token=/i.test(u) ||
    /[&?]code=/.test(u)
  );
}

function el(id) {
  return document.getElementById(id);
}

function csEn(cs, en) {
  const lang = document.documentElement.getAttribute("data-lang") || "cs";
  return lang === "en" ? en : cs;
}

/**
 * Volá getSession po určitou dobu — po redirectu z e-mailu se session z URL nastavuje asynchronně.
 */
async function waitForRecoverySession(supabase, retry, maxWaitMs) {
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

function showFatal(msg) {
  const box = el("reset-form-wrap");
  const err = el("reset-fatal");
  if (box) box.hidden = true;
  if (err) {
    err.hidden = false;
    err.textContent = msg;
  }
}

async function boot() {
  const hint = hadAuthRecoveryParams();
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    showFatal(
      csEn("Spojení nelze inicializovat. Zkuste stránku znovu načíst.", "Could not initialise. Refresh the page and try again."),
    );
    return;
  }

  const { session } = await waitForRecoverySession(supabase, hint, hint ? 6000 : 0);

  if (!session?.user) {
    if (hint) {
      showFatal(
        csEn(
          "Tento odkaz už není platný nebo byl použit vícekrát. Požádejte o nový odkaz pro obnovení hesla.",
          "This link expired or has already been used. Request a new password reset.",
        ),
      );
    } else {
      showFatal(
        csEn(
          "Pro nastavení hesla použij odkaz z e-mailu z položky „Zapomenuté heslo“ ve webové aplikaci.",
          'Use the link from our email after "Forgot password" in the web app.',
        ),
      );
    }
    return;
  }

  el("reset-form-wrap")?.removeAttribute("hidden");

  el("reset-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pwd = el("reset-password-field")?.value || "";
    const pwd2 = el("reset-password-confirm")?.value || "";
    const st = el("reset-status");
    const btn = el("reset-submit");

    if (pwd.length < 6) {
      if (st)
        st.textContent = csEn("Heslo musí mít alespoň 6 znaků.", "Password must be at least 6 characters.");
      return;
    }
    if (pwd !== pwd2) {
      if (st) st.textContent = csEn("Hesla se neshodují.", "Passwords do not match.");
      return;
    }
    if (st) st.textContent = "";

    const submitting = csEn("Ukládám…", "Saving…");

    if (btn) {
      btn.disabled = true;
      btn.dataset.loading = "1";
    }
    if (st) st.textContent = submitting;

    const { error: updErr } = await supabase.auth.updateUser({ password: pwd });

    if (updErr) {
      let m = updErr.message || csEn("Heslo se nepodařilo uložit.", "Could not update password.");
      if (/jwt|session|invalid|expire/i.test(updErr.message || ""))
        m = csEn(
          "Platnost odkazu vypršela. Požádejte o nové obnovení hesla.",
          "Your session expired. Request a new password reset link.",
        );
      if (st) st.textContent = m;
      if (btn) {
        btn.disabled = false;
        delete btn.dataset.loading;
      }
      return;
    }

    await supabase.auth.signOut();

    const stFinal = el("reset-status");
    if (stFinal) stFinal.textContent = "";

    el("reset-form-wrap")?.setAttribute("hidden", "");
    const ok = el("reset-success");
    if (ok) ok.hidden = false;
    try {
      if (window.history.replaceState) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (_) {}

    setTimeout(() => {
      window.location.href = "../app.html";
    }, 2500);
  });
}

document.addEventListener("DOMContentLoaded", () => boot());
