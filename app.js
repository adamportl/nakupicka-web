import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";
import { getSupabaseBrowserClient } from "./supabase-browser.js";

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
let isHouseholdOwner = false;

/** Zabrání paralelním běhům (login + listener / duplicitní SIGNED_IN). */
let loadHouseholdsInFlight = null;

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

async function loadCloudAccountSection() {
  const premEl = el("cloud-premium");
  const bakEl = el("cloud-backup");
  if (!premEl || !bakEl || !supabase || !authUserId) return;

  try {
    const { data: prem } = await supabase.from("user_premium_status").select("*").eq("user_id", authUserId).maybeSingle();
    const on = prem?.is_premium === true;
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

async function loadInvitesSection(h) {
  const incomingEl = el("invites-incoming");
  const outWrap = el("invites-outgoing-wrap");
  const outEl = el("invites-outgoing");
  if (!incomingEl) return;

  const { data: incoming } = await supabase.from("household_email_invites").select("*").eq("status", "pending");
  const pendingIn = (incoming || []).filter((r) => r.id);

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

  isHouseholdOwner = String(h.owner_id) === uid;

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
  await loadExtendedHouseholdUI(h);
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
  if (loadHouseholdsInFlight) return loadHouseholdsInFlight;
  loadHouseholdsInFlight = (async () => {
    try {
      const recoveryEl = document.querySelector('[data-app-panel="recovery"]');
      if (recoveryEl && !recoveryEl.hidden) return;

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
        sel.innerHTML = rows.map((r) => `<option value="${r.id}">${escapeHtml(r.name || r.id)}</option>`).join("");
        sel.value = rows[0].id;
        sel.onchange = async () => {
          const id = sel.value;
          const row = rows.find((r) => r.id === id);
          if (row) await loadHouseholdDetail(row);
        };
      }
      await loadHouseholdDetail(rows[0]);
    } finally {
      loadHouseholdsInFlight = null;
    }
  })();
  return loadHouseholdsInFlight;
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
  if (el("invite-email-input")) el("invite-email-input").value = "";
  await loadInvitesSection(currentHousehold);
}

async function onDashboardClick(e) {
  const acc = e.target.closest("[data-accept-invite]");
  if (acc) {
    e.preventDefault();
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

function bindForms() {
  el("form-auth")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (el("auth-email")?.value || "").trim();
    const password = el("auth-password")?.value || "";
    const mode = el("auth-mode")?.value || "signin";
    const submitBtn = el("auth-submit");
    el("app-status").textContent = t("saving");
    if (submitBtn) submitBtn.disabled = true;
    try {
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
        el("app-status").textContent =
          lang() === "en" ? "Check your email to confirm." : "Potvrď e-mail, pokud to projekt vyžaduje.";
        return;
      }

      const { data: signData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        el("app-status").textContent = error.message || t("errAuth");
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

      authUserId = session.user.id;
      el("app-user-email").textContent = session.user.email || "";
      try {
        await loadHouseholdsAndOpen();
      } catch (loadErr) {
        console.error(loadErr);
        el("app-status").textContent = t("errGeneric");
      }
    } catch (err) {
      console.error(err);
      el("app-status").textContent = (err && err.message) || t("errGeneric");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  el("btn-signout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    showPanel("auth");
  });

  el("form-create-household")?.addEventListener("submit", onCreateHousehold);
  el("form-add-purchase")?.addEventListener("submit", onAddPurchase);
  el("btn-refresh")?.addEventListener("click", () => refreshHouseholdFromServer());
  el("form-invite-email")?.addEventListener("submit", onInviteEmailSubmit);
  el("dashboard-root")?.addEventListener("click", onDashboardClick);
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
      redirectTo: window.location.origin + window.location.pathname,
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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    showPanel("config");
    el("config-hint").textContent = t("cfgHint");
    return;
  }

  const recoveryHash =
    typeof window !== "undefined" && window.location.hash && /type=recovery/i.test(window.location.hash);

  supabase = getSupabaseBrowserClient();

  bindForms();
  bindForgotPassword();
  bindRecoveryForm();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "INITIAL_SESSION") return;
    if (event === "PASSWORD_RECOVERY") {
      showPanel("recovery");
      return;
    }
    if (!session) {
      authUserId = null;
      showPanel("auth");
      return;
    }
    authUserId = session.user.id;
    el("app-user-email").textContent = session.user.email || "";
    // TOKEN_REFRESHED a další události nesmí znovu načítat domácnosti — způsobovalo to zasekávání / závody.
    if (event !== "SIGNED_IN") return;
    try {
      await loadHouseholdsAndOpen();
    } catch (e) {
      console.error(e);
      el("app-status").textContent = t("errGeneric");
    }
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user && recoveryHash) {
    showPanel("recovery");
    return;
  }

  if (session?.user) {
    authUserId = session.user.id;
    el("app-user-email").textContent = session.user.email || "";
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
