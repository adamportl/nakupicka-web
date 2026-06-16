import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";
import { getSupabaseBrowserClient } from "./supabase-browser.js";
import { encodePurchaseDate, parsePurchaseDate } from "./src/common/date-utils.js";

const CATEGORIES = ["Potraviny", "Drogerie", "Nápoje", "Sladkosti", "Domácnost", "Ostatní"];

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomInviteCode() {
  let s = "";
  for (let i = 0; i < 8; i++) s += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
  return s;
}

function normalizeWirePurchase(p) {
  const id = typeof p.id === "string" && p.id.length > 0 ? p.id : crypto.randomUUID();
  return {
    id,
    name: String(p.name ?? ""),
    price: typeof p.price === "number" && !Number.isNaN(p.price) ? p.price : Number(p.price) || 0,
    date: typeof p.date === "number" ? p.date : encodePurchaseDate(parsePurchaseDate(p.date)),
    category: String(p.category ?? "Ostatní"),
    detailCategory: p.detailCategory === null || p.detailCategory === undefined ? null : String(p.detailCategory),
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
    loadSdkFailed:
      "Nepodařilo se načíst knihovnu Supabase (síť nebo blokování skriptů). Zkus obnovit stránku; v konzoli je detail.",
    signIn: "Přihlásit se",
    signUp: "Založit účet",
    email: "E-mail",
    password: "Heslo",
    signOut: "Odhlásit",
    noHousehold: "Zatím nemáš domácnost",
    createHousehold: "Založit domácnost",
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
    errSave: "Uložení se nepovedlo.",
    householdLabel: "Domácnost",
    refresh: "Obnovit",
    syncNote: "Data jsou stejná jako v aplikaci při zapnutém rodinném sdílení.",
    resetSent: "Odkaz pro obnovení hesla jsme odeslali na e-mail.",
    passwordMismatch: "Hesla se neshodují.",
    passwordUpdated: "Heslo je nastavené. Můžeš se přihlásit.",
    recoveryHint: "Otevři odkaz z e-mailu na tomto zařízení.",
    premiumState: "Premium",
    premiumOn: "aktivní",
    premiumOff: "neaktivní (stav z aplikace / App Store)",
    backupTitle: "Záloha dat (Premium)",
    backupNone: "Žádná cloudová záloha.",
    backupMeta: "Poslední uložení: {date}, velikost cca {size} kB.",
    membersCanEdit: "Členové mohou upravovat sdílené nákupy",
    membersTitle: "Členové",
    roleOwner: "Správce",
    roleMember: "Člen",
    canEditShort: "Úpravy",
    invitesIncoming: "Příchozí pozvánky",
    invitesOutgoing: "Odeslané",
    invitePending: "čeká",
    inviteAccept: "Přijmout",
    inviteDecline: "Odmítnout",
    inviteCancel: "Zrušit",
    noInvites: "Žádné pozvánky.",
    emailUnknown: "(e-mail jen pro správce)",
    inviteSent: "Pozvánka uložena.",
    edit: "Upravit",
    delete: "Smazat",
    deleteSelected: "Smazat vybrané",
    undo: "Vrátit zpět",
    save: "Uložit",
    cancel: "Zrušit",
    searchPlaceholder: "Hledat podle názvu, profilu nebo kategorie",
    noMatch: "Žádná položka neodpovídá filtru.",
    confirmDelete: "Opravdu smazat tuto položku?",
    confirmBulkDelete: "Smazat vybrané položky?",
    selectedCount: "Vybráno: {count}",
    undoDeleted: "Smazané položky můžeš vrátit.",
    errInvalidPrice: "Cena musí být číslo.",
    deleteAccount: "Smazat účet",
    deleteAccountConfirm:
      "Tímto nevratně smažete účet i data v cloudu. Opravdu pokračovat?",
    deleteAccountDone: "Účet byl smazán. Byli jste odhlášeni.",
    deleteAccountFailed:
      "Smazání účtu se nepovedlo. Zkuste to později nebo kontaktujte podporu.",
    readonlyPremiumHtml:
      'Úpravy na webu vyžadují Premium (stav se synchronizuje z aplikace). <a href="premium.html">Informace o Premium</a>.',
    setupPremiumHtml:
      'Založení domácnosti na webu je součástí Premium. Stav se synchronizuje z aplikace — <a href="premium.html">Premium</a>.',
    errPremiumRequired: "Úpravy na webu vyžadují Premium.",
    authOtpExpired:
      "Odkaz z e-mailu už vypršel nebo není platný (přihlášení, obnova hesla nebo ověření účtu). Použij znovu „Zapomenuté heslo“ nebo požádej o nový ověřovací e-mail.",
    authAccessDenied: "Přihlášení bylo zrušeno. Zkus se přihlásit znovu (Google nebo e-mail a heslo).",
    authRedirectErrorFallback: "Odkaz pro přihlášení se nepovedl dokončit. Přihlas se prosím běžným způsobem.",
  },
  en: {
    cfgTitle: "Supabase setup",
    cfgHint: "Add SUPABASE_URL and SUPABASE_ANON_KEY to supabase-config.js (Dashboard → API).",
    loadSdkFailed:
      "Could not load the Supabase library (network or blocked scripts). Try again; see the browser console.",
    signIn: "Sign in",
    signUp: "Create account",
    email: "Email",
    password: "Password",
    signOut: "Sign out",
    noHousehold: "No household yet",
    createHousehold: "Create household",
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
    errSave: "Could not save.",
    householdLabel: "Household",
    refresh: "Refresh",
    syncNote: "Same data as in the app when family sync is enabled.",
    resetSent: "We sent a password reset link to your email.",
    passwordMismatch: "Passwords do not match.",
    passwordUpdated: "Password updated. You can sign in.",
    recoveryHint: "Open the email link on this device.",
    premiumState: "Premium",
    premiumOn: "active",
    premiumOff: "inactive (synced from the app / App Store)",
    backupTitle: "Data backup (Premium)",
    backupNone: "No cloud backup yet.",
    backupMeta: "Last saved: {date}, about {size} kB.",
    membersCanEdit: "Members can edit shared purchases",
    membersTitle: "Members",
    roleOwner: "Owner",
    roleMember: "Member",
    canEditShort: "Edit",
    invitesIncoming: "Incoming invitations",
    invitesOutgoing: "Sent",
    invitePending: "pending",
    inviteAccept: "Accept",
    inviteDecline: "Decline",
    inviteCancel: "Cancel",
    noInvites: "No invitations.",
    emailUnknown: "(email visible to owner only)",
    inviteSent: "Invitation saved.",
    edit: "Edit",
    delete: "Delete",
    deleteSelected: "Delete selected",
    undo: "Undo",
    save: "Save",
    cancel: "Cancel",
    searchPlaceholder: "Search by name, profile, or category",
    noMatch: "No items match the current filter.",
    confirmDelete: "Delete this item?",
    confirmBulkDelete: "Delete selected items?",
    selectedCount: "Selected: {count}",
    undoDeleted: "You can undo deleted items.",
    errInvalidPrice: "Price must be a valid number.",
    deleteAccount: "Delete account",
    deleteAccountConfirm:
      "This permanently deletes your account and cloud data. Continue?",
    deleteAccountDone: "Account deleted. You have been signed out.",
    deleteAccountFailed:
      "Could not delete account. Please try again later or contact support.",
    readonlyPremiumHtml:
      'Editing on the web requires Premium (status is synced from the app). <a href="premium.html">About Premium</a>.',
    setupPremiumHtml:
      'Creating a household on the web requires Premium. Status is synced from the app — <a href="premium.html">Premium</a>.',
    errPremiumRequired: "Editing on the web requires Premium.",
    authOtpExpired:
      "The email link expired or is no longer valid (sign-in, password reset, or account verification). Use “Forgot password” or request a new verification email.",
    authAccessDenied: "Sign-in was cancelled. Try again with Google or email and password.",
    authRedirectErrorFallback: "The sign-in link could not be completed. Please sign in the usual way.",
  },
};

function t(key) {
  return STR[lang()][key] ?? STR.cs[key] ?? key;
}

/** Chyba z URL fragmentu po redirectu od Supabase (magic link, OAuth). */
function parseAuthFragmentError(hash) {
  if (!hash || hash.length < 2) return null;
  const trimmed = hash.replace(/^#/, "");
  if (!trimmed) return null;
  const qp = new URLSearchParams(trimmed);
  const err = qp.get("error");
  const code = qp.get("error_code");
  let description = qp.get("error_description") || "";
  if (!err && !code && !description.trim()) return null;
  try {
    description = decodeURIComponent(description.replace(/\+/g, " "));
  } catch (_) {
    /* keep raw */
  }
  return { error: err, code: code || "", description };
}

function formatFragmentAuthErrorMessage(parsed) {
  const code = (parsed.code || "").toLowerCase();
  const oauthErr = (parsed.error || "").toLowerCase();
  if (code === "otp_expired") return t("authOtpExpired");
  if (oauthErr === "access_denied") return t("authAccessDenied");
  if (parsed.description && parsed.description.length > 0 && parsed.description.length < 220) {
    return parsed.description;
  }
  return t("authRedirectErrorFallback");
}

let supabase = null;
let currentHousehold = null;
let purchases = [];
let purchaseSearch = "";
let purchaseSort = "date-desc";
let selectedPurchaseIds = new Set();
let undoStack = [];
let lastModalFocus = null;
let currentDashView = "overview";
let canEdit = false;
/** Zda má uživatel podle domácnosti právo upravovat (bez ohledu na Premium). */
let householdEditAllowed = false;
/** Stav Premium z `user_premium_status` (webové úpravy jen s Premium). */
let hasPremium = false;
let authUserId = null;
let isHouseholdOwner = false;

const el = (id) => document.getElementById(id);

async function refreshPremiumFlag() {
  if (!supabase || !authUserId) {
    hasPremium = false;
    return false;
  }
  try {
    const { data: prem } = await supabase.from("user_premium_status").select("is_premium").eq("user_id", authUserId).maybeSingle();
    hasPremium = prem?.is_premium === true;
    return hasPremium;
  } catch {
    hasPremium = false;
    return false;
  }
}

function syncReadonlyBanner() {
  const note = el("app-can-edit-note");
  if (!note) return;
  const effective = householdEditAllowed && hasPremium;
  if (effective) {
    note.hidden = true;
    return;
  }
  note.hidden = false;
  if (!householdEditAllowed) {
    note.textContent = t("readonly");
  } else {
    note.innerHTML = t("readonlyPremiumHtml");
  }
}

function syncSetupPremiumGate() {
  const note = el("app-setup-premium-note");
  const form = el("form-create-household");
  const btn = form?.querySelector('button[type="submit"]');
  const nameInput = el("setup-household-name");
  if (!hasPremium) {
    if (note) {
      note.hidden = false;
      note.innerHTML = t("setupPremiumHtml");
    }
    if (nameInput) nameInput.disabled = true;
    if (btn) btn.disabled = true;
  } else {
    if (note) note.hidden = true;
    if (nameInput) nameInput.disabled = false;
    if (btn) btn.disabled = false;
  }
}

function showPanel(name) {
  document.querySelectorAll("[data-app-panel]").forEach((n) => {
    n.hidden = n.getAttribute("data-app-panel") !== name;
  });
  if (name !== "dashboard") closePurchaseEditModal();
  try {
    window.scrollTo(0, 0);
  } catch {
    /* ignore */
  }
}

function setDashboardView(view) {
  const root = el("dashboard-root");
  if (!root) return;
  const allowed = new Set(["overview", "purchases", "family", "cloud", "invites"]);
  const next = allowed.has(view) ? view : "overview";
  currentDashView = next;
  root.querySelectorAll("[data-dash-view]").forEach((node) => {
    const viewName = node.getAttribute("data-dash-view");
    if (viewName === "all") return;
    const isTarget = viewName === next;
    if (node.id === "app-add-section" && !canEdit) {
      node.hidden = true;
      return;
    }
    node.hidden = !isTarget;
  });
  root.querySelectorAll("[data-dash-nav]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-dash-nav") === next);
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

function toWireEpoch(value) {
  return typeof value === "number" ? value : encodePurchaseDate(parsePurchaseDate(value));
}

function sortPurchaseList(list) {
  const sorted = [...list];
  if (purchaseSort === "date-asc") sorted.sort((a, b) => toWireEpoch(a.date) - toWireEpoch(b.date));
  else if (purchaseSort === "price-desc") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (purchaseSort === "price-asc") sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (purchaseSort === "name-asc")
    sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), lang() === "en" ? "en" : "cs"));
  else sorted.sort((a, b) => toWireEpoch(b.date) - toWireEpoch(a.date));
  return sorted;
}

function filteredPurchases() {
  const q = purchaseSearch.trim().toLowerCase();
  const base = q
    ? purchases.filter((p) =>
        [p.name, p.profile, p.category, p.displayCategoryLabel]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : purchases;
  return sortPurchaseList(base);
}

function renderUndoBar() {
  const host = el("app-status");
  if (!host || !undoStack.length) return;
  const recent = undoStack[undoStack.length - 1];
  if (!recent || recent.type !== "delete") return;
  const button = `<button type="button" class="app-btn-inline" id="btn-undo-last">${escapeHtml(t("undo"))}</button>`;
  host.innerHTML = `${escapeHtml(t("undoDeleted"))} ${button}`;
  el("btn-undo-last")?.addEventListener("click", async () => {
    const op = undoStack.pop();
    if (!op) return;
    const merged = [...purchases.map((p) => normalizeWirePurchase(p)), ...op.items.map((i) => normalizeWirePurchase(i))];
    try {
      await savePurchasesToServer(merged);
      selectedPurchaseIds.clear();
      host.textContent = t("saved");
      if (window.nakupickaTrack) window.nakupickaTrack("purchase_undo", { restored_count: op.items.length });
    } catch {
      host.textContent = t("errSave");
    }
  });
}

function renderPurchases() {
  const list = el("purchase-list");
  const bulkDelete = el("btn-bulk-delete");
  if (!list) return;
  const sorted = filteredPurchases();
  if (bulkDelete) bulkDelete.disabled = !canEdit || selectedPurchaseIds.size === 0;
  if (!sorted.length) {
    list.innerHTML = `<p class="app-empty">${escapeHtml(purchases.length ? t("noMatch") : t("empty"))}</p>`;
    updateDashboardStats();
    return;
  }
  list.innerHTML = sorted
    .map(
      (p) => `
    <article class="app-purchase-card">
      <label class="app-purchase-check"><input type="checkbox" data-purchase-select="${escapeHtml(p.id)}" ${
        selectedPurchaseIds.has(p.id) ? "checked" : ""
      } ${canEdit ? "" : "disabled"} /></label>
      <div class="app-purchase-main">
        <span class="app-purchase-name">${escapeHtml(p.name)}</span>
        <span class="app-purchase-meta">${escapeHtml(p.displayCategoryLabel)} · ${escapeHtml(p.profile)}</span>
      </div>
      <div class="app-purchase-right">
        <span class="app-purchase-price">${formatMoney(p.price)}&nbsp;Kč</span>
        <span class="app-purchase-date">${formatDateDisplay(p.date)}</span>
      </div>
      <div class="app-purchase-actions">
        <button type="button" class="app-btn-inline" data-edit-purchase="${escapeHtml(p.id)}" ${
        canEdit ? "" : "disabled"
      }>${escapeHtml(t("edit"))}</button>
        <button type="button" class="app-btn-inline" data-delete-purchase="${escapeHtml(p.id)}" ${
        canEdit ? "" : "disabled"
      }>${escapeHtml(t("delete"))}</button>
      </div>
    </article>`
    )
    .join("");
  updateDashboardStats();
  renderUndoBar();
}

function updateDashboardStats() {
  const totalEl = el("app-stat-total");
  const countEl = el("app-stat-count");
  const catEl = el("app-stat-category");
  if (!totalEl || !countEl || !catEl) return;
  const normalized = purchases.map((p) => normalizeWirePurchase(p));
  const total = normalized.reduce((sum, p) => sum + (p.price || 0), 0);
  const count = normalized.length;
  const byCategory = new Map();
  normalized.forEach((p) => {
    const key = p.category || "Ostatní";
    byCategory.set(key, (byCategory.get(key) || 0) + (p.price || 0));
  });
  let top = "—";
  let topVal = -1;
  byCategory.forEach((value, key) => {
    if (value > topVal) {
      top = key;
      topVal = value;
    }
  });
  totalEl.textContent = `${formatMoney(total)} Kč`;
  countEl.textContent = String(count);
  catEl.textContent = top;
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

async function loadCloudAccountSection() {
  const premEl = el("cloud-premium");
  const bakEl = el("cloud-backup");
  if (!premEl || !bakEl || !supabase || !authUserId) return;

  try {
    const on = hasPremium;
    premEl.innerHTML = `<p><strong>${escapeHtml(t("premiumState"))}:</strong> ${on ? escapeHtml(t("premiumOn")) : escapeHtml(t("premiumOff"))}</p>`;
  } catch {
    premEl.innerHTML = `<p class="app-empty-soft">${escapeHtml(t("errGeneric"))}</p>`;
  }

  try {
    const { data: bak } = await supabase.from("user_data_backups").select("updated_at, payload").eq("user_id", authUserId).maybeSingle();
    if (!bak?.payload) {
      bakEl.innerHTML = `<p><strong>${escapeHtml(t("backupTitle"))}</strong> — ${escapeHtml(t("backupNone"))}</p>`;
      return;
    }
    const sizeKb = (JSON.stringify(bak.payload).length / 1024).toFixed(1);
    const d = bak.updated_at ? new Date(bak.updated_at).toLocaleString(lang() === "en" ? "en-GB" : "cs-CZ") : "—";
    bakEl.innerHTML = `<p><strong>${escapeHtml(t("backupTitle"))}</strong></p><p>${escapeHtml(
      t("backupMeta").replace("{date}", d).replace("{size}", sizeKb)
    )}</p>`;
  } catch {
    bakEl.innerHTML = `<p class="app-empty-soft">${escapeHtml(t("errGeneric"))}</p>`;
  }
}

async function loadFamilySection(h) {
  const toggleWrap = el("family-members-toggle");
  const listEl = el("family-members-list");
  if (!listEl) return;

  const { data: authData } = await supabase.auth.getUser();
  const myEmail = authData?.user?.email || "";

  const uid = String(authUserId);
  if (isHouseholdOwner && canEdit && toggleWrap) {
    toggleWrap.hidden = false;
    const checked = !!h.members_can_edit;
    toggleWrap.innerHTML = `
      <label class="app-toggle-row">
        <input type="checkbox" id="toggle-household-edit" data-household-id="${escapeHtml(h.id)}" ${checked ? "checked" : ""} />
        <span>${escapeHtml(t("membersCanEdit"))}</span>
      </label>`;
    const cb = el("toggle-household-edit");
    cb?.addEventListener("change", async () => {
      if (!currentHousehold) return;
      const next = !!cb.checked;
      el("app-status").textContent = t("saving");
      const { error } = await supabase
        .from("households")
        .update({ members_can_edit: next, updated_at: new Date().toISOString() })
        .eq("id", h.id);
      if (error) {
        el("app-status").textContent = error.message || t("errGeneric");
        cb.checked = !next;
        return;
      }
      el("app-status").textContent = t("saved");
      await refreshHouseholdFromServer();
    });
  } else if (toggleWrap) {
    toggleWrap.hidden = true;
    toggleWrap.innerHTML = "";
  }

  const { data: members, error: mErr } = await supabase
    .from("household_members")
    .select("user_id, role, can_edit")
    .eq("household_id", h.id);
  if (mErr || !members?.length) {
    listEl.innerHTML = `<p class="app-empty-soft">${escapeHtml(t("membersTitle"))}: —</p>`;
    return;
  }

  let emailMap = new Map();
  if (isHouseholdOwner) {
    const { data: emails } = await supabase.rpc("household_member_emails", { p_household_id: h.id });
    if (Array.isArray(emails)) {
      emails.forEach((row) => emailMap.set(row.user_id, row.user_email || ""));
    }
  }

  const rows = members
    .map((m) => {
      const isOwnerRow = m.role === "owner";
      const showEmail = isHouseholdOwner
        ? emailMap.get(m.user_id) || "—"
        : String(m.user_id) === uid
          ? myEmail || "—"
          : "—";
      let editCell = "—";
      if (isHouseholdOwner && canEdit && !isOwnerRow) {
        editCell = `<label class="app-toggle-row"><input type="checkbox" data-member-toggle="${escapeHtml(m.user_id)}" ${
          m.can_edit ? "checked" : ""
        } /> ${escapeHtml(t("canEditShort"))}</label>`;
      } else {
        editCell = m.can_edit ? "✓" : "—";
      }
      return `<tr>
        <td>${escapeHtml(isOwnerRow ? t("roleOwner") : t("roleMember"))}</td>
        <td>${escapeHtml(showEmail)}</td>
        <td>${editCell}</td>
      </tr>`;
    })
    .join("");

  listEl.innerHTML = `<table><thead><tr><th>${escapeHtml(t("membersTitle"))}</th><th>e-mail</th><th>${escapeHtml(
    t("canEditShort")
  )}</th></tr></thead><tbody>${rows}</tbody></table>`;

  listEl.querySelectorAll("[data-member-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", async () => {
      const userId = checkbox.getAttribute("data-member-toggle");
      if (!userId || !currentHousehold) return;
      const next = !!checkbox.checked;
      el("app-status").textContent = t("saving");
      const { error } = await supabase
        .from("household_members")
        .update({ can_edit: next })
        .eq("household_id", currentHousehold.id)
        .eq("user_id", userId);
      if (error) {
        el("app-status").textContent = error.message || t("errGeneric");
        checkbox.checked = !next;
        return;
      }
      el("app-status").textContent = t("saved");
    });
  });
}

function normalizeEmailForCompare(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

async function loadInvitesSection(h) {
  const incomingEl = el("invites-incoming");
  const outWrap = el("invites-outgoing-wrap");
  const outEl = el("invites-outgoing");
  if (!incomingEl) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const myEmail = normalizeEmailForCompare(session?.user?.email);

  const { data: incoming } = await supabase.from("household_email_invites").select("*").eq("status", "pending");
  const pendingIn = (incoming || []).filter(
    (r) => r.id && normalizeEmailForCompare(r.invitee_email) === myEmail && myEmail.length > 0
  );

  if (!pendingIn.length) {
    incomingEl.innerHTML = `<p class="app-empty-soft"><strong>${escapeHtml(t("invitesIncoming"))}</strong> — ${escapeHtml(
      t("noInvites")
    )}</p>`;
  } else {
    incomingEl.innerHTML = `<h3 class="app-subheading">${escapeHtml(t("invitesIncoming"))}</h3>
      <table><thead><tr><th>${lang() === "en" ? "Household" : "Domácnost"}</th><th>e-mail</th><th></th></tr></thead><tbody>${pendingIn
        .map(
          (r) => `<tr>
        <td>${escapeHtml(r.household_name_snapshot || "")}</td>
        <td>${escapeHtml(r.invitee_email || "")}</td>
        <td>
          <button type="button" class="app-btn-inline" data-accept-invite="${r.id}">${escapeHtml(t("inviteAccept"))}</button>
          <button type="button" class="app-btn-inline" data-decline-invite="${r.id}">${escapeHtml(t("inviteDecline"))}</button>
        </td>
      </tr>`
        )
        .join("")}</tbody></table>`;
  }

  if (!outWrap || !outEl) return;

  if (!isHouseholdOwner) {
    outWrap.hidden = true;
    return;
  }

  outWrap.hidden = false;
  const { data: outgoing } = await supabase
    .from("household_email_invites")
    .select("*")
    .eq("household_id", h.id)
    .order("created_at", { ascending: false });

  const outPending = (outgoing || []).filter((r) => r.status === "pending");
  if (!outPending.length) {
    outEl.innerHTML = `<p class="app-empty-soft">${escapeHtml(t("noInvites"))}</p>`;
  } else {
    outEl.innerHTML = `<table><thead><tr><th>e-mail</th><th>${escapeHtml(t("invitesOutgoing"))}</th><th></th></tr></thead><tbody>${outPending
      .map(
        (r) => `<tr>
        <td>${escapeHtml(r.invitee_email || "")}</td>
        <td>${escapeHtml(t("invitePending"))}</td>
        <td><button type="button" class="app-btn-inline" data-cancel-invite="${r.id}">${escapeHtml(
          t("inviteCancel")
        )}</button></td>
      </tr>`
      )
      .join("")}</tbody></table>`;
  }

  const form = el("form-invite-email");
  if (form) form.hidden = !canEdit;
}

async function loadExtendedHouseholdUI(h) {
  await loadCloudAccountSection();
  await loadFamilySection(h);
  await loadInvitesSection(h);
}

async function loadHouseholdDetail(h) {
  currentHousehold = h;
  const raw = Array.isArray(h.purchases) ? h.purchases : [];
  purchases = raw.map((p) => enrichForDisplay(p));
  selectedPurchaseIds.clear();
  undoStack = [];

  await refreshPremiumFlag();

  const uid = String(authUserId);
  if (String(h.owner_id) === uid) {
    householdEditAllowed = true;
  } else {
    const { data: m } = await supabase
      .from("household_members")
      .select("can_edit")
      .eq("household_id", h.id)
      .eq("user_id", uid)
      .maybeSingle();
    householdEditAllowed = !!(m && m.can_edit);
  }

  canEdit = householdEditAllowed && hasPremium;

  isHouseholdOwner = String(h.owner_id) === uid;

  el("app-household-title").textContent = h.name || (lang() === "en" ? "Household" : "Domácnost");
  const profileInput = el("add-profile");
  if (profileInput && !profileInput.value.trim()) {
    profileInput.placeholder = h.name || "";
  }
  syncReadonlyBanner();
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
  setDashboardView(currentDashView || "overview");
  try {
    await loadExtendedHouseholdUI(h);
  } catch (e) {
    console.error("[NÁKUPIČKA] rozšířené sekce domácnosti", e);
  }
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

/**
 * Načte domácnosti a zobrazí správný panel.
 * @param prefetchedSession — ihned po `signInWithPassword` ve WebKitu často `getSession()` ještě vrátí null
 *   (zápis session do storage není synchronní). Vždy předat session z odpovědi přihlášení / z `onAuthStateChange`.
 */
async function loadHouseholdsAndOpen(prefetchedSession) {
  const recoveryEl = document.querySelector('[data-app-panel="recovery"]');
  if (recoveryEl && !recoveryEl.hidden) return;

  let session = prefetchedSession?.user ? prefetchedSession : null;
  if (!session) {
    const {
      data: { session: s },
    } = await supabase.auth.getSession();
    session = s;
  }
  if (!session?.user) {
    await new Promise((r) => setTimeout(r, 100));
    const {
      data: { session: s2 },
    } = await supabase.auth.getSession();
    session = s2;
  }
  if (!session?.user) {
    authUserId = null;
    showPanel("auth");
    return;
  }
  authUserId = session.user.id;
  el("app-user-email").textContent = session.user.email || "";

  const { data: rows, error } = await supabase.from("households").select("*").order("updated_at", { ascending: false });
  if (error) {
    el("app-status").textContent = error.message || t("errGeneric");
    showPanel("auth");
    return;
  }
  if (!rows || rows.length === 0) {
    await refreshPremiumFlag();
    syncSetupPremiumGate();
    showPanel("setup");
    return;
  }
  const sel = el("household-select");
  if (sel) {
    sel.innerHTML = rows.map((r) => `<option value="${r.id}">${escapeHtml(r.name || r.id)}</option>`).join("");
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
  await refreshPremiumFlag();
  if (!hasPremium) {
    el("app-status").textContent = t("errPremiumRequired");
    if (window.nakupickaTrack) window.nakupickaTrack("premium_gate_block", { action: "create_household" });
    syncSetupPremiumGate();
    return;
  }
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
    if (window.nakupickaTrack) window.nakupickaTrack("household_create", {});
    return;
  }
  el("app-status").textContent = t("errGeneric");
}

async function onAddPurchase(e) {
  e.preventDefault();
  if (!canEdit || !currentHousehold) return;
  const name = (el("add-name").value || "").trim();
  const priceRaw = (el("add-price").value || "").replace(",", ".").trim();
  const price = parseFloat(priceRaw);
  if (!name || Number.isNaN(price)) {
    el("app-status").textContent = t("errInvalidPrice");
    return;
  }
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
    if (window.nakupickaTrack) window.nakupickaTrack("purchase_add", { category: category });
    el("app-status").textContent = t("saved");
    setTimeout(() => {
      el("app-status").textContent = "";
    }, 2000);
  } catch {
    el("app-status").textContent = t("errSave");
  }
}

async function deletePurchases(ids) {
  if (!currentHousehold || !ids.length) return;
  const current = purchases.map((p) => normalizeWirePurchase(p));
  const deleted = current.filter((p) => ids.includes(p.id));
  const next = current.filter((p) => !ids.includes(p.id));
  undoStack.push({ type: "delete", items: deleted });
  await savePurchasesToServer(next);
  ids.forEach((id) => selectedPurchaseIds.delete(id));
  el("app-status").textContent = t("saved");
  renderUndoBar();
  if (window.nakupickaTrack) window.nakupickaTrack("purchase_delete", { count: ids.length });
}

async function onEditPurchase(id) {
  if (!canEdit || !currentHousehold) return;
  const item = purchases.find((p) => p.id === id);
  if (!item) return;
  openPurchaseEditModal(item);
}

function openPurchaseEditModal(item) {
  const modal = el("purchase-edit-modal");
  if (!modal) return;
  lastModalFocus = document.activeElement;
  el("edit-purchase-id").value = item.id || "";
  el("edit-name").value = item.name || "";
  el("edit-price").value = String(item.price || "");
  el("edit-profile").value = item.profile || "";
  const cat = el("edit-category");
  if (cat) {
    cat.innerHTML = CATEGORIES.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    cat.value = item.category || "Ostatní";
  }
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => el("edit-name")?.focus(), 0);
}

function closePurchaseEditModal() {
  const modal = el("purchase-edit-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastModalFocus && lastModalFocus.focus) lastModalFocus.focus();
}

async function onEditPurchaseSubmit(e) {
  e.preventDefault();
  if (!canEdit || !currentHousehold) return;
  const id = el("edit-purchase-id")?.value || "";
  const nextName = (el("edit-name")?.value || "").trim();
  const nextPrice = parseFloat(String(el("edit-price")?.value || "").replace(",", "."));
  const nextCategory = el("edit-category")?.value || "Ostatní";
  const nextProfile = (el("edit-profile")?.value || "").trim() || currentHousehold?.name || "Domácnost";
  if (!id || !nextName || Number.isNaN(nextPrice)) {
    el("app-status").textContent = t("errInvalidPrice");
    return;
  }
  const next = purchases.map((p) =>
    p.id === id
      ? enrichForDisplay({
          ...normalizeWirePurchase(p),
          name: nextName,
          price: nextPrice,
          category: nextCategory,
          profile: nextProfile,
        })
      : p
  );
  el("app-status").textContent = t("saving");
  try {
    await savePurchasesToServer(next);
    closePurchaseEditModal();
    if (window.nakupickaTrack) window.nakupickaTrack("purchase_edit", { item_id: id });
    el("app-status").textContent = t("saved");
  } catch {
    el("app-status").textContent = t("errSave");
  }
}

async function onInviteEmailSubmit(e) {
  e.preventDefault();
  if (!currentHousehold || !isHouseholdOwner || !canEdit) return;
  const email = (el("invite-email-input")?.value || "").trim().toLowerCase();
  if (!email) return;
  el("app-status").textContent = t("saving");
  const { error } = await supabase.from("household_email_invites").insert({
    household_id: currentHousehold.id,
    invitee_email: email,
    invited_by: authUserId,
    household_name_snapshot: currentHousehold.name || "Domácnost",
    status: "pending",
  });
  if (error) {
    el("app-status").textContent = error.message || t("errGeneric");
    return;
  }
  el("app-status").textContent = t("inviteSent");
  if (window.nakupickaTrack) window.nakupickaTrack("invite_send", {});
  if (el("invite-email-input")) el("invite-email-input").value = "";
  await loadInvitesSection(currentHousehold);
}

async function onDeleteAccount() {
  if (!supabase) return;
  if (!window.confirm(t("deleteAccountConfirm"))) return;
  el("app-status").textContent = t("saving");
  try {
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw error;
    await supabase.auth.signOut();
    currentHousehold = null;
    purchases = [];
    selectedPurchaseIds.clear();
    undoStack = [];
    showPanel("auth");
    el("app-status").textContent = t("deleteAccountDone");
    if (window.nakupickaTrack) window.nakupickaTrack("account_delete_success", {});
  } catch (err) {
    console.error(err);
    el("app-status").textContent = t("deleteAccountFailed");
    if (window.nakupickaTrack) window.nakupickaTrack("account_delete_failed", {});
  }
}

async function onDashboardClick(e) {
  const editBtn = e.target.closest("[data-edit-purchase]");
  if (editBtn) {
    e.preventDefault();
    await onEditPurchase(editBtn.getAttribute("data-edit-purchase"));
    return;
  }

  const delBtn = e.target.closest("[data-delete-purchase]");
  if (delBtn) {
    e.preventDefault();
    const id = delBtn.getAttribute("data-delete-purchase");
    if (!id || !canEdit) return;
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deletePurchases([id]);
    } catch {
      el("app-status").textContent = t("errSave");
    }
    return;
  }

  const acc = e.target.closest("[data-accept-invite]");
  if (acc) {
    e.preventDefault();
    if (!hasPremium) {
      el("app-status").textContent = t("errPremiumRequired");
      if (window.nakupickaTrack) window.nakupickaTrack("premium_gate_block", { action: "accept_invite" });
      return;
    }
    const id = acc.getAttribute("data-accept-invite");
    if (!id) return;
    el("app-status").textContent = t("saving");
    const { error } = await supabase.rpc("accept_household_email_invite", { p_invite_id: id });
    if (error) {
      el("app-status").textContent = error.message || t("errGeneric");
      return;
    }
    el("app-status").textContent = t("saved");
    await loadHouseholdsAndOpen();
    return;
  }

  const dec = e.target.closest("[data-decline-invite]");
  if (dec) {
    e.preventDefault();
    if (!hasPremium) {
      el("app-status").textContent = t("errPremiumRequired");
      if (window.nakupickaTrack) window.nakupickaTrack("premium_gate_block", { action: "decline_invite" });
      return;
    }
    const id = dec.getAttribute("data-decline-invite");
    if (!id) return;
    el("app-status").textContent = t("saving");
    const { error } = await supabase.rpc("decline_household_email_invite", { p_invite_id: id });
    if (error) {
      el("app-status").textContent = error.message || t("errGeneric");
      return;
    }
    el("app-status").textContent = t("saved");
    if (currentHousehold) await loadInvitesSection(currentHousehold);
    return;
  }

  const can = e.target.closest("[data-cancel-invite]");
  if (can) {
    e.preventDefault();
    if (!hasPremium) {
      el("app-status").textContent = t("errPremiumRequired");
      if (window.nakupickaTrack) window.nakupickaTrack("premium_gate_block", { action: "cancel_invite" });
      return;
    }
    const id = can.getAttribute("data-cancel-invite");
    if (!id || !currentHousehold) return;
    el("app-status").textContent = t("saving");
    const { error } = await supabase.from("household_email_invites").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      el("app-status").textContent = error.message || t("errGeneric");
      return;
    }
    el("app-status").textContent = t("saved");
    await loadInvitesSection(currentHousehold);
  }
}

/** Safari / iCloud Keychain: hodnoty někdy nejsou v .value hned; zkusíme krátce znovu. */
async function readAuthInputsWithSafariRetry() {
  function readOnce() {
    const emailEl = el("auth-email");
    const passEl = el("auth-password");
    emailEl?.dispatchEvent(new Event("input", { bubbles: true }));
    passEl?.dispatchEvent(new Event("input", { bubbles: true }));
    return {
      email: (emailEl?.value || "").trim(),
      password: passEl?.value || "",
    };
  }
  let out = readOnce();
  if (!out.email || !out.password) {
    await new Promise((r) => setTimeout(r, 0));
    out = readOnce();
  }
  if (!out.email || !out.password) {
    await new Promise((r) => setTimeout(r, 50));
    out = readOnce();
  }
  return out;
}

function bindForms() {
  function syncSortOptionLabels() {
    const sortEl = el("purchase-sort");
    if (!sortEl) return;
    const currentLang = lang();
    sortEl.querySelectorAll("option").forEach((opt) => {
      const next = opt.getAttribute(currentLang === "en" ? "data-en" : "data-cs");
      if (next) opt.textContent = next;
    });
  }

  syncSortOptionLabels();

  el("purchase-search")?.setAttribute("placeholder", t("searchPlaceholder"));
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      syncSortOptionLabels();
      el("purchase-search")?.setAttribute("placeholder", t("searchPlaceholder"));
      renderPurchases();
    });
  });
  el("purchase-search")?.addEventListener("input", (e) => {
    purchaseSearch = (e.target.value || "").trim();
    renderPurchases();
  });
  el("purchase-sort")?.addEventListener("change", (e) => {
    purchaseSort = e.target.value || "date-desc";
    renderPurchases();
  });
  el("btn-bulk-delete")?.addEventListener("click", async () => {
    if (!canEdit || selectedPurchaseIds.size === 0) return;
    if (!window.confirm(t("confirmBulkDelete"))) return;
    el("app-status").textContent = t("saving");
    try {
      await deletePurchases(Array.from(selectedPurchaseIds));
      selectedPurchaseIds.clear();
      renderPurchases();
    } catch {
      el("app-status").textContent = t("errSave");
    }
  });

  document.querySelectorAll("[data-dash-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setDashboardView(btn.getAttribute("data-dash-nav") || "overview");
    });
  });

  el("form-auth")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { email, password } = await readAuthInputsWithSafariRetry();
    const mode = el("auth-mode")?.value || "signin";
    const submitBtn = el("auth-submit");
    try {
      if (!email || !password) {
        el("app-status").textContent =
          lang() === "en" ? "Enter email and password." : "Vyplň e-mail a heslo.";
        return;
      }
      if (mode === "signup") {
        if (submitBtn) submitBtn.disabled = true;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: new URL("/email-verified", window.location.origin).href },
        });
        if (error) {
          el("app-status").textContent = error.message || t("errAuth");
          return;
        }
        el("app-status").textContent =
          lang() === "en" ? "Check your email to confirm." : "Potvrď e-mail, pokud to projekt vyžaduje.";
        if (window.nakupickaTrack) window.nakupickaTrack("auth_signup_submit", { method: "email" });
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      const { data: signData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        el("app-status").textContent = error.message || t("errAuth");
        if (window.nakupickaTrack) window.nakupickaTrack("auth_signin_failed", { method: "email" });
        return;
      }

      el("app-status").textContent = "";
      let session = signData?.session;
      if (!session?.user) {
        const {
          data: { session: s2 },
        } = await supabase.auth.getSession();
        session = s2;
      }
      if (!session?.user) {
        el("app-status").textContent =
          lang() === "en"
            ? "Confirm your email, then sign in again."
            : "Potvrď e-mail v doručené poště, pak se přihlas znovu.";
        return;
      }

      // Safari (zejm. macOS): session z API je dřív než konzistentní stav v úložišti — vynutíme zápis klientem.
      if (session.access_token && session.refresh_token) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        if (setErr) console.warn("[NÁKUPIČKA] setSession po přihlášení", setErr);
      }

      // Nejen na onAuthStateChange(SIGNED_IN): ve WebKitu může přijít pozdě nebo v jiném pořadí než
      // dokončení signInWithPassword — bez tohoto by zůstala prázdná data / špatný panel.
      el("app-status").textContent = "";
      try {
        await loadHouseholdsAndOpen(session);
      } catch (loadErr) {
        console.error(loadErr);
        el("app-status").textContent = t("errGeneric");
      }
      if (submitBtn) submitBtn.disabled = false;
      if (window.nakupickaTrack) window.nakupickaTrack("auth_signin_success", { method: "email" });
    } catch (err) {
      console.error(err);
      el("app-status").textContent = (err && err.message) || t("errGeneric");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  el("btn-auth-google")?.addEventListener("click", async () => {
    const btn = el("btn-auth-google");
    try {
      if (btn) btn.disabled = true;
      el("app-status").textContent = "";
      const redirectTo = new URL("app.html", window.location.href).href;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        el("app-status").textContent = error.message || t("errGeneric");
        if (window.nakupickaTrack) window.nakupickaTrack("auth_signin_failed", { method: "google" });
        return;
      }
      if (data?.url) {
        if (window.nakupickaTrack) window.nakupickaTrack("auth_signin_start", { method: "google" });
        window.location.assign(data.url);
        return;
      }
      el("app-status").textContent = t("errGeneric");
    } catch (err) {
      console.error(err);
      el("app-status").textContent = (err && err.message) || t("errGeneric");
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  el("btn-signout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    if (window.nakupickaTrack) window.nakupickaTrack("auth_signout", {});
    showPanel("auth");
  });

  el("form-create-household")?.addEventListener("submit", onCreateHousehold);
  el("form-add-purchase")?.addEventListener("submit", onAddPurchase);
  el("btn-refresh")?.addEventListener("click", () => refreshHouseholdFromServer());
  el("form-invite-email")?.addEventListener("submit", onInviteEmailSubmit);
  el("btn-delete-account")?.addEventListener("click", onDeleteAccount);
  el("form-edit-purchase")?.addEventListener("submit", onEditPurchaseSubmit);
  el("purchase-edit-cancel")?.addEventListener("click", closePurchaseEditModal);
  el("purchase-edit-close")?.addEventListener("click", closePurchaseEditModal);
  el("purchase-edit-modal")?.addEventListener("click", (e) => {
    if (e.target && e.target.id === "purchase-edit-modal") closePurchaseEditModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el("purchase-edit-modal")?.hidden) closePurchaseEditModal();
  });
  el("dashboard-root")?.addEventListener("click", onDashboardClick);
  el("dashboard-root")?.addEventListener("change", (e) => {
    const target = e.target;
    if (!target || !target.matches || !target.matches("[data-purchase-select]")) return;
    const id = target.getAttribute("data-purchase-select");
    if (!id) return;
    if (target.checked) selectedPurchaseIds.add(id);
    else selectedPurchaseIds.delete(id);
    const bulkDelete = el("btn-bulk-delete");
    if (bulkDelete) bulkDelete.disabled = !canEdit || selectedPurchaseIds.size === 0;
    const status = el("app-status");
    if (status && selectedPurchaseIds.size > 0) {
      status.textContent = t("selectedCount").replace("{count}", String(selectedPurchaseIds.size));
    }
  });
}

function bindForgotPassword() {
  el("btn-toggle-forgot")?.addEventListener("click", () => {
    const p = el("forgot-panel");
    if (!p) return;
    p.hidden = !p.hidden;
  });
  el("form-forgot")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (el("forgot-email")?.value || "").trim();
    if (!email) return;
    el("app-status").textContent = t("saving");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/reset-password", window.location.origin).href,
    });
    if (error) {
      el("app-status").textContent = error.message || t("errGeneric");
      return;
    }
    el("app-status").textContent = t("resetSent");
    const fp = el("forgot-panel");
    if (fp) fp.hidden = true;
  });
}

function bindRecoveryForm() {
  el("form-recovery-password")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const p1 = el("recovery-password")?.value || "";
    const p2 = el("recovery-password-2")?.value || "";
    if (p1 !== p2) {
      el("app-status").textContent = t("passwordMismatch");
      return;
    }
    el("app-status").textContent = t("saving");
    const { error } = await supabase.auth.updateUser({ password: p1 });
    if (error) {
      el("app-status").textContent = error.message || t("errGeneric");
      return;
    }
    el("app-status").textContent = t("passwordUpdated");
    if (window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    await supabase.auth.signOut();
    showPanel("auth");
    if (el("recovery-password")) el("recovery-password").value = "";
    if (el("recovery-password-2")) el("recovery-password-2").value = "";
  });
}

async function init() {
  try {
    await initCore();
  } catch (e) {
    console.error("[NÁKUPIČKA] init", e);
    const st = el("app-status");
    if (st) st.textContent = t("errGeneric");
  }
}

async function initCore() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    showPanel("config");
    el("config-hint").textContent = t("cfgHint");
    return;
  }

  const rawHash = typeof window !== "undefined" ? window.location.hash || "" : "";
  const recoveryHash = rawHash.length > 0 && /type=recovery/i.test(rawHash);
  const fragmentErr = parseAuthFragmentError(rawHash);

  supabase = getSupabaseBrowserClient();
  if (!supabase) {
    showPanel("config");
    const hint = el("config-hint");
    if (hint) hint.textContent = t("loadSdkFailed");
    console.error(
      "[NÁKUPIČKA] Supabase není k dispozici. Zkontroluj v Network, že se načte UMD skript (supabase.js) před moduly a že globalThis.supabase.createClient existuje."
    );
    return;
  }

  bindForms();
  bindForgotPassword();
  bindRecoveryForm();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "INITIAL_SESSION") return;
    if (event === "PASSWORD_RECOVERY") {
      showPanel("recovery");
      return;
    }
    // Jen skutečné odhlášení — ne každé !session (ve WebKitu občas mezistav po přihlášení přepnul zpět na auth).
    if (!session) {
      if (event === "SIGNED_OUT") {
        authUserId = null;
        showPanel("auth");
      }
      return;
    }
    authUserId = session.user.id;
    el("app-user-email").textContent = session.user.email || "";
    // TOKEN_REFRESHED a další události nesmí znovu načítat domácnosti — způsobovalo to zasekávání / závody.
    if (event !== "SIGNED_IN") return;
    el("app-status").textContent = "";
    try {
      await loadHouseholdsAndOpen(session);
    } catch (e) {
      console.error(e);
      el("app-status").textContent = t("errGeneric");
    }
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (fragmentErr) {
    if (typeof window.history.replaceState === "function") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (!session?.user) {
      const st = el("app-status");
      if (st) st.textContent = formatFragmentAuthErrorMessage(fragmentErr);
    }
  }

  if (session?.user && recoveryHash) {
    showPanel("recovery");
    return;
  }

  if (session?.user) {
    el("app-status").textContent = "";
    try {
      await loadHouseholdsAndOpen();
    } catch (e) {
      console.error(e);
      el("app-status").textContent = t("errGeneric");
    }
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
