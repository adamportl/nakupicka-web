import { getSupabaseBrowserClient } from "./supabase-browser.js";

/** Pouze odkazy, kde má smysl čekat na session z implicitního přesměrování Supabase v URL fragmentu/query. */
function hadMagicLinkRecoveryMarkers() {
  if (typeof window === "undefined") return false;
  const u = `${window.location.hash || ""}${window.location.search || ""}`;
  return (
    /type=recovery/i.test(u) ||
    /access_token=/i.test(u) ||
    /refresh_token=/i.test(u) ||
    /[#?&]code=/i.test(u) ||
    /token_hash=/i.test(u)
  );
}

/** Case-insensitive OTP / e-mail v query (Šablona: token, email). */
function searchParamsMap(search) {
  const raw =
    typeof search === "string"
      ? search
      : typeof window !== "undefined"
        ? window.location.search || ""
        : "";
  const qs = new URLSearchParams(raw.replace(/^\?/, ""));
  const lower = Object.create(null);
  for (const [k, v] of qs.entries()) {
    const key = k.toLowerCase();
    if (!(key in lower) && v.trim() !== "") lower[key] = v.trim();
  }
  return lower;
}

function pickParam(lower, aliases) {
  for (const a of aliases) {
    const v = lower[a.toLowerCase()];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function readOtpFromSearch(search) {
  const lower =
    typeof search === "string" ? searchParamsMap(search) : searchParamsMap(window.location.search);
  let token = pickParam(lower, ["token", "otp"]).replace(/\s+/g, "").trim();
  if (!token || !/^\d{6,14}$/.test(token)) return null;
  const email = pickParam(lower, ["email", "e"]);
  return { token, email: email.length > 0 ? email : null };
}

function stripOtpParamsFromLocation() {
  try {
    const u = new URL(window.location.href);
    [...u.searchParams.keys()].forEach((k) => {
      const l = k.toLowerCase();
      if (["token", "otp", "email", "e", "reason"].includes(l)) u.searchParams.delete(k);
    });
    const q = u.searchParams.toString();
    window.history.replaceState(null, "", u.pathname + (q ? `?${q}` : "") + u.hash);
  } catch (_) {}
}

function el(id) {
  return document.getElementById(id);
}

function csEn(cs, en) {
  const lang = document.documentElement.getAttribute("data-lang") || "cs";
  return lang === "en" ? en : cs;
}

/**
 * Čekání na recovery session po redirectu z klasického odkazu (hash / PKCE přes návratové URL).
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
  const gate = el("reset-otp-gate");
  if (gate) gate.hidden = true;
  if (box) box.hidden = true;
  if (err) {
    err.hidden = false;
    err.textContent = msg;
  }
}

function hideFatal() {
  const err = el("reset-fatal");
  if (err) {
    err.hidden = true;
    err.textContent = "";
  }
}

function showOtpEmailGate(token) {
  hideFatal();
  el("reset-form-wrap")?.setAttribute("hidden", "");
  const gate = el("reset-otp-gate");
  const hid = el("reset-otp-token-hidden");
  if (hid) hid.value = token;
  if (gate) gate.hidden = false;
}

let resetSubmitBound = false;

function attachPasswordFormHandler(supabase) {
  if (resetSubmitBound) return;
  resetSubmitBound = true;

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

function revealPasswordCard(supabase) {
  stripOtpParamsFromLocation();
  el("reset-otp-gate")?.setAttribute("hidden", "");
  el("reset-form-wrap")?.removeAttribute("hidden");
  attachPasswordFormHandler(supabase);
}

async function boot() {
  const otpQs = typeof window !== "undefined" ? readOtpFromSearch(window.location.search) : null;
  const hintMagic = hadMagicLinkRecoveryMarkers();

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    showFatal(
      csEn("Spojení nelze inicializovat. Zkuste stránku znovu načíst.", "Could not initialise. Refresh the page and try again."),
    );
    return;
  }

  if (otpQs?.token && otpQs.email) {
    const { error: verErr } = await supabase.auth.verifyOtp({
      email: otpQs.email,
      token: otpQs.token,
      type: "recovery",
    });
    stripOtpParamsFromLocation();
    if (!verErr) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        revealPasswordCard(supabase);
        return;
      }
    }
    showFatal(
      csEn(
        "Kód nebo e-mail nejsou platné. Požádej prosím znovu o odkaz Zapomenuté heslo.",
        "The code or email is not valid. Please request “Forgot password” again.",
      ),
    );
    return;
  }

  const { session: sessionMl } = await waitForRecoverySession(supabase, hintMagic, hintMagic ? 6000 : 0);

  if (!sessionMl?.user) {
    if (otpQs?.token && !otpQs.email) {
      showOtpEmailGate(otpQs.token);
      hideFatal();

      el("form-reset-otp")?.addEventListener(
        "submit",
        async (e) => {
          e.preventDefault();
          const st = el("reset-status");
          const btn = el("reset-otp-submit");
          const mail = (el("reset-otp-email-field")?.value || "").trim();
          const tk = (el("reset-otp-token-hidden")?.value || "").replace(/\s+/g, "").trim();
          if (!mail || !tk) {
            if (st) st.textContent = csEn("Vyplň e-mail.", "Fill in email.");
            return;
          }
          if (btn) btn.disabled = true;
          if (st) st.textContent = csEn("Ověřuji…", "Verifying…");

          const { error: verErr } = await supabase.auth.verifyOtp({
            email: mail,
            token: tk,
            type: "recovery",
          });
          stripOtpParamsFromLocation();

          if (verErr || !(await supabase.auth.getSession()).data.session?.user) {
            if (st)
              st.textContent =
                verErr?.message ||
                csEn(
                  "Kód vypršel nebo nesedí. Požádej prosím nový odkaz z Zapomenuté heslo.",
                  "Code expired or invalid. Request a new reset link.",
                );
            if (btn) btn.disabled = false;
            return;
          }

          revealPasswordCard(supabase);
          if (st) st.textContent = "";
        },
        { once: true },
      );
      return;
    }

    if (hintMagic) {
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

  revealPasswordCard(supabase);
}

document.addEventListener("DOMContentLoaded", () => boot());
