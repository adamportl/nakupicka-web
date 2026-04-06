import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

/** Stejný offset jako Swift JSONEncoder/Decoder pro `Date` (sekundy od 1. 1. 2001). */
const REFERENCE_OFFSET = 978307200;

const CATEGORIES = ["Potraviny", "Drogerie", "Nápoje", "Sladkosti", "Domácnost", "Ostatní"];

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomInviteCode() {
  let s = "";
  for (let i = 0; i < 8; i++) s += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
  return s;
}

function parsePurchaseDate(raw) {
  if (raw == null) return new Date();
  if (typeof raw === "number") return new Date((raw + REFERENCE_OFFSET) * 1000);
  if (typeof raw === "string") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

function encodePurchaseDate(d) {
  return d.getTime() / 1000 - REFERENCE_OFFSET;
}

function normalizeWirePurchase(p) {
  const id = typeof p.id === "string" && p.id.length > 0 ? p.id : crypto.randomUUID();
  return {
    id,
    name: String(p.name ?? ""),
    price: typeof p.price === "number" && !Number.isNaN(p.price) ? p.price : Number(p.price) || 0,
    date: typeof p.date === "number" ? p.date : encodePurchaseDate(parsePurchaseDate(p.date)),
    category: String(p.category ?? "Ostatní"),
    detailCategory: p.detailCategory == null ? null : String(p.detailCategory),
    profile: String(p.profile ?? "Domácnost"),
  };
}

function lang() {
  return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "cs";
}

const STR = {
  cs: {
    cfgTitle: "Nastavení Supabase",
    cfgHint: "Do souboru supabase-config.js doplň SUPABASE_URL a SUPABASE_ANON_KEY (Dashboard → API).",
    signIn: "Přihlásit se",
    signUp: "Založit účet",
    email: "E-mail",
    password: "Heslo",
    signOut: "Odhlásit",
    noHousehold: "Zatím nemáš domácnost",
    createHousehold: "Založit domácnost",
    joinHousehold: "Připojit se kódem",
    householdName: "Název domácnosti",
    inviteCode: "Kód pozvánky",
    join: "Připojit",
    purchases: "Položky nákupů",
    empty: "Zatím žádné položky — přidej první níže.",
    readonly: "Máš přístup jen ke čtení.",
    addTitle: "Přidat položku",
    itemName: "Název",
    price: "Cena (Kč)",
    category: "Kategorie",
    profile: "Profil / štítek",
    add: "Přidat",
    saving: "Ukládám…",
    saved: "Uloženo.",
    errGeneric: "Něco se nepovedlo.",
    errAuth: "Zkontroluj e-mail a heslo.",
    errJoin: "Kód není platný nebo už jsi členem.",
    errSave: "Uložení se nepovedlo.",
    householdLabel: "Domácnost",
    refresh: "Obnovit",
    syncNote: "Data jsou stejná jako v aplikaci při zapnutém rodinném sdílení.",
  },
  en: {
    cfgTitle: "Supabase setup",
    cfgHint: "Add SUPABASE_URL and SUPABASE_ANON_KEY to supabase-config.js (Dashboard → API).",
    signIn: "Sign in",
    signUp: "Create account",
    email: "Email",
    password: "Password",
    signOut: "Sign out",
    noHousehold: "No household yet",
    createHousehold: "Create household",
    joinHousehold: "Join with code",
    householdName: "Household name",
    inviteCode: "Invite code",
    join: "Join",
    purchases: "Purchases",
    empty: "No items yet — add the first one below.",
    readonly: "You have read-only access.",
    addTitle: "Add item",
    itemName: "Name",
    price: "Price (CZK)",
    category: "Category",
    profile: "Profile / label",
    add: "Add",
    saving: "Saving…",
    saved: "Saved.",
    errGeneric: "Something went wrong.",
    errAuth: "Check your email and password.",
    errJoin: "Invalid code or you are already a member.",
    errSave: "Could not save.",
    householdLabel: "Household",
    refresh: "Refresh",
    syncNote: "Same data as in the app when family sync is enabled.",
  },
};

function t(key) {
  return STR[lang()][key] ?? STR.cs[key] ?? key;
}

let supabase = null;
let currentHousehold = null;
let purchases = [];
let canEdit = false;
let authUserId = null;

const el = (id) => document.getElementById(id);

function showPanel(name) {
  document.querySelectorAll("[data-app-panel]").forEach((n) => {
    n.hidden = n.getAttribute("data-app-panel") !== name;
  });
}

function formatMoney(n) {
  return new Intl.NumberFormat(lang() === "en" ? "en-US" : "cs-CZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDateDisplay(wireDate) {
  const d = parsePurchaseDate(wireDate);
  return new Intl.DateTimeFormat(lang() === "en" ? "en-GB" : "cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function renderPurchases() {
  const list = el("purchase-list");
  const sorted = [...purchases].sort((a, b) => {
    const da = typeof a.date === "number" ? a.date : encodePurchaseDate(parsePurchaseDate(a.date));
    const db = typeof b.date === "number" ? b.date : encodePurchaseDate(parsePurchaseDate(b.date));
    return db - da;
  });
  if (!sorted.length) {
    list.innerHTML = `<p class="app-empty">${t("empty")}</p>`;
    return;
  }
  list.innerHTML = sorted
    .map(
      (p) => `
    <article class="app-purchase-card">
      <div class="app-purchase-main">
        <span class="app-purchase-name">${escapeHtml(p.name)}</span>
        <span class="app-purchase-meta">${escapeHtml(p.displayCategoryLabel)} · ${escapeHtml(p.profile)}</span>
      </div>
      <div class="app-purchase-right">
        <span class="app-purchase-price">${formatMoney(p.price)}&nbsp;Kč</span>
        <span class="app-purchase-date">${formatDateDisplay(p.date)}</span>
      </div>
    </article>`
    )
    .join("");
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

/** Pro zobrazení: odvozený label kategorie (jako `displayCategoryLabel` v iOS). */
function enrichForDisplay(p) {
  const w = normalizeWirePurchase(p);
  const d = (w.detailCategory || "").trim();
  return {
    ...w,
    displayCategoryLabel: d || w.category,
  };
}

async function loadHouseholdDetail(h) {
  currentHousehold = h;
  const raw = Array.isArray(h.purchases) ? h.purchases : [];
  purchases = raw.map((p) => enrichForDisplay(p));

  const uid = String(authUserId);
  if (String(h.owner_id) === uid) {
    canEdit = true;
  } else {
    const { data: m } = await supabase
      .from("household_members")
      .select("can_edit")
      .eq("household_id", h.id)
      .eq("user_id", uid)
      .maybeSingle();
    canEdit = !!(m && m.can_edit);
  }

  el("app-household-title").textContent = h.name || (lang() === "en" ? "Household" : "Domácnost");
  const profileInput = el("add-profile");
  if (profileInput && !profileInput.value.trim()) {
    profileInput.placeholder = h.name || "";
  }
  el("app-can-edit-note").hidden = canEdit;
  el("app-add-section").hidden = !canEdit;
  const form = el("form-add-purchase");
  if (form) {
    form.querySelectorAll("input, select, button").forEach((x) => {
      if (x.type === "button") return;
      x.disabled = !canEdit;
    });
  }
  renderPurchases();
  showPanel("dashboard");
}

async function refreshHouseholdFromServer() {
  if (!currentHousehold) return;
  const { data, error } = await supabase.from("households").select("*").eq("id", currentHousehold.id).maybeSingle();
  if (error || !data) {
    el("app-status").textContent = t("errGeneric");
    return;
  }
  await loadHouseholdDetail(data);
  el("app-status").textContent = t("saved");
  setTimeout(() => {
    el("app-status").textContent = "";
  }, 2000);
}

async function savePurchasesToServer(nextList) {
  const wire = nextList.map((p) => normalizeWirePurchase(p));
  const iso = new Date().toISOString();
  const { error } = await supabase
    .from("households")
    .update({ purchases: wire, updated_at: iso })
    .eq("id", currentHousehold.id);
  if (error) throw error;
  purchases = wire.map((p) => enrichForDisplay(p));
  renderPurchases();
}

async function loadHouseholdsAndOpen() {
  const { data: rows, error } = await supabase.from("households").select("*").order("updated_at", { ascending: false });
  if (error) {
    el("app-status").textContent = error.message || t("errGeneric");
    showPanel("auth");
    return;
  }
  if (!rows || rows.length === 0) {
    showPanel("setup");
    return;
  }
  const sel = el("household-select");
  if (sel) {
    sel.innerHTML = rows
      .map(
        (r) =>
          `<option value="${r.id}">${escapeHtml(r.name || r.id)} (${escapeHtml(r.invite_code || "")})</option>`
      )
      .join("");
    sel.value = rows[0].id;
    sel.onchange = async () => {
      const id = sel.value;
      const row = rows.find((r) => r.id === id);
      if (row) await loadHouseholdDetail(row);
    };
  }
  await loadHouseholdDetail(rows[0]);
}

async function onCreateHousehold(e) {
  e.preventDefault();
  const nameInput = el("setup-household-name");
  const name = (nameInput?.value || "").trim() || (lang() === "en" ? "Our household" : "Naše rodina");
  el("app-status").textContent = t("saving");
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();
  if (uerr || !user) {
    el("app-status").textContent = t("errAuth");
    return;
  }
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomInviteCode();
    const { error: insErr } = await supabase.from("households").insert({
      name,
      invite_code: code,
      members_can_edit: true,
      owner_id: user.id,
      purchases: [],
    });
    if (insErr) {
      const msg = String(insErr.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505")) continue;
      el("app-status").textContent = insErr.message;
      return;
    }
    const { data: row } = await supabase.from("households").select("*").eq("invite_code", code).maybeSingle();
    if (!row) {
      el("app-status").textContent = t("errGeneric");
      return;
    }
    const { error: memErr } = await supabase.from("household_members").insert({
      household_id: row.id,
      user_id: user.id,
      role: "owner",
      can_edit: true,
    });
    if (memErr) {
      el("app-status").textContent = memErr.message;
      return;
    }
    el("app-status").textContent = "";
    await loadHouseholdDetail(row);
    return;
  }
  el("app-status").textContent = t("errGeneric");
}

async function onJoinHousehold(e) {
  e.preventDefault();
  const code = (el("setup-invite-code").value || "").trim();
  if (!code) return;
  el("app-status").textContent = t("saving");
  const { error } = await supabase.rpc("join_household", { invite: code });
  if (error) {
    el("app-status").textContent = t("errJoin");
    return;
  }
  el("app-status").textContent = "";
  el("setup-invite-code").value = "";
  await loadHouseholdsAndOpen();
}

async function onAddPurchase(e) {
  e.preventDefault();
  if (!canEdit || !currentHousehold) return;
  const name = (el("add-name").value || "").trim();
  const priceRaw = (el("add-price").value || "").replace(",", ".").trim();
  const price = parseFloat(priceRaw);
  if (!name || Number.isNaN(price)) return;
  const category = el("add-category").value || "Ostatní";
  const profile = (el("add-profile").value || "").trim() || currentHousehold.name || "Domácnost";
  const next = normalizeWirePurchase({
    id: crypto.randomUUID(),
    name,
    price,
    date: encodePurchaseDate(new Date()),
    category,
    detailCategory: null,
    profile,
  });
  el("app-status").textContent = t("saving");
  try {
    const merged = [...purchases.map((p) => normalizeWirePurchase(p)), next];
    await savePurchasesToServer(merged);
    el("add-name").value = "";
    el("add-price").value = "";
    el("app-status").textContent = t("saved");
    setTimeout(() => {
      el("app-status").textContent = "";
    }, 2000);
  } catch {
    el("app-status").textContent = t("errSave");
  }
}

function bindForms() {
  el("form-auth")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = el("auth-email").value.trim();
    const password = el("auth-password").value;
    const mode = el("auth-mode").value;
    el("app-status").textContent = t("saving");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      });
      if (error) {
        el("app-status").textContent = error.message || t("errAuth");
        return;
      }
      el("app-status").textContent = lang() === "en" ? "Check your email to confirm." : "Potvrď e-mail, pokud to projekt vyžaduje.";
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        el("app-status").textContent = t("errAuth");
        return;
      }
      el("app-status").textContent = "";
    }
  });

  el("btn-signout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    showPanel("auth");
  });

  el("form-create-household")?.addEventListener("submit", onCreateHousehold);
  el("form-join-household")?.addEventListener("submit", onJoinHousehold);
  el("form-add-purchase")?.addEventListener("submit", onAddPurchase);
  el("btn-refresh")?.addEventListener("click", () => refreshHouseholdFromServer());
}

async function init() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    showPanel("config");
    el("config-hint").textContent = t("cfgHint");
    return;
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  bindForms();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "INITIAL_SESSION") return;
    if (!session) {
      authUserId = null;
      showPanel("auth");
      return;
    }
    authUserId = session.user.id;
    el("app-user-email").textContent = session.user.email || "";
    await loadHouseholdsAndOpen();
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) {
    authUserId = session.user.id;
    el("app-user-email").textContent = session.user.email || "";
    await loadHouseholdsAndOpen();
  } else {
    showPanel("auth");
  }
}

function fillCategorySelect() {
  const sel = el("add-category");
  if (!sel) return;
  sel.innerHTML = CATEGORIES.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  el("config-title").textContent = t("cfgTitle");
  fillCategorySelect();
  init();
});
