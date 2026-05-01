(function () {
  const storageKey = "nakupicka-theme";
  const langKey = "nakupicka-lang";
  const root = document.documentElement;

  function getLang() {
    try {
      const s = localStorage.getItem(langKey);
      if (s === "en" || s === "cs") return s;
    } catch (_) {}
    return "cs";
  }

  const toggle = document.getElementById("themeToggle");

  const themeLabels = {
    cs: { toLight: "Přepnout na světlý vzhled", toDark: "Přepnout na tmavý vzhled" },
    en: { toLight: "Switch to light mode", toDark: "Switch to dark mode" },
  };

  function syncThemeLabel() {
    if (!toggle) return;
    const dark = root.getAttribute("data-theme") === "dark";
    const lang = root.getAttribute("data-lang") || getLang();
    const L = themeLabels[lang] || themeLabels.cs;
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
    toggle.setAttribute("aria-label", dark ? L.toLight : L.toDark);
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch (_) {}
    if (window.nakupickaTrack) {
      window.nakupickaTrack("theme_change", { theme: theme });
    }
    syncThemeLabel();
  }

  const navBtn = document.getElementById("navMenuBtn");
  const siteNav = document.getElementById("siteNav");

  function setMenuOpen(open) {
    document.body.classList.toggle("menu-open", open);
    if (open) {
      document.documentElement.classList.remove("header-hidden");
    }
    if (navBtn) {
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function setMetaAndTitle(lang) {
    const metaDesc = document.getElementById("metaDesc");
    if (metaDesc && metaDesc.hasAttribute("data-desc-cs")) {
      metaDesc.setAttribute(
        "content",
        lang === "en" ? metaDesc.getAttribute("data-desc-en") : metaDesc.getAttribute("data-desc-cs")
      );
    }
    const titleEl = document.querySelector("title[data-title-cs]");
    if (titleEl) {
      document.title = lang === "en" ? titleEl.getAttribute("data-title-en") : titleEl.getAttribute("data-title-cs");
    }
    const navEl = document.getElementById("siteNav");
    if (navEl && navEl.hasAttribute("data-nav-aria-cs")) {
      navEl.setAttribute(
        "aria-label",
        lang === "en" ? navEl.getAttribute("data-nav-aria-en") : navEl.getAttribute("data-nav-aria-cs")
      );
    }
    const footerNav = document.querySelector(".footer-nav[data-footer-aria-cs]");
    if (footerNav) {
      footerNav.setAttribute(
        "aria-label",
        lang === "en" ? footerNav.getAttribute("data-footer-aria-en") : footerNav.getAttribute("data-footer-aria-cs")
      );
    }
    const dock = document.querySelector(".phone-dock-overlay[data-dock-aria-cs]");
    if (dock) {
      dock.setAttribute(
        "aria-label",
        lang === "en" ? dock.getAttribute("data-dock-aria-en") : dock.getAttribute("data-dock-aria-cs")
      );
    }
    document.querySelectorAll(".phone-dock-hit[data-aria-cs]").forEach((btn) => {
      btn.setAttribute(
        "aria-label",
        lang === "en" ? btn.getAttribute("data-aria-en") : btn.getAttribute("data-aria-cs")
      );
    });
  }

  function refreshPreviewCaption() {
    const previewCaption = document.getElementById("previewCaption");
    const active = document.querySelector('.phone-dock-hit[aria-selected="true"]');
    const previewImg = document.getElementById("previewImage");
    const lang = root.getAttribute("data-lang") || "cs";
    if (!active) return;
    const cap = active.getAttribute("data-caption-" + lang) || active.getAttribute("data-caption-cs") || "";
    if (previewCaption) previewCaption.textContent = cap;
    const alt = active.getAttribute("data-alt-" + lang) || active.getAttribute("data-alt-cs") || "";
    if (previewImg) previewImg.alt = alt;
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "cs") return;
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "cs");
    try {
      localStorage.setItem(langKey, lang);
    } catch (_) {}
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    setMetaAndTitle(lang);
    syncThemeLabel();
    refreshPreviewCaption();
    if (window.nakupickaTrack) {
      window.nakupickaTrack("language_change", { lang: lang });
    }
    closeMenu();
  }

  function initLang() {
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        setLang(b.getAttribute("data-set-lang"));
      });
    });
    setLang(getLang());
  }

  function initTheme() {
    let theme;
    try {
      theme = localStorage.getItem(storageKey);
    } catch (_) {
      theme = null;
    }
    if (theme !== "light" && theme !== "dark") {
      theme = "dark";
    }
    applyTheme(theme);
  }

  if (toggle) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* Mobilní menu — musí být před prvním setLang (closeMenu) */
  if (navBtn && siteNav) {
    navBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenuOpen(!document.body.classList.contains("menu-open"));
    });
    siteNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeMenu());
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    document.addEventListener(
      "click",
      () => {
        if (!document.body.classList.contains("menu-open")) return;
        closeMenu();
      },
      false
    );
    siteNav.addEventListener("click", (e) => e.stopPropagation());
  }

  initLang();
  initTheme();

  /* Náhled obrazovek na úvodní stránce — klik na spodní lištu v náhledu */
  const previewImg = document.getElementById("previewImage");
  const previewCaption = document.getElementById("previewCaption");
  const dockHits = document.querySelectorAll(".phone-dock-hit");

  if (previewImg && dockHits.length) {
    dockHits.forEach((tab) => {
      tab.addEventListener("click", () => {
        const src = tab.getAttribute("data-src");
        const lang = root.getAttribute("data-lang") || "cs";
        const alt = tab.getAttribute("data-alt-" + lang) || tab.getAttribute("data-alt-cs") || "";
        const cap = tab.getAttribute("data-caption-" + lang) || tab.getAttribute("data-caption-cs") || "";
        if (src) {
          previewImg.src = src;
          previewImg.alt = alt;
        }
        if (previewCaption) previewCaption.textContent = cap;
        dockHits.forEach((t) => {
          const active = t === tab;
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        if (window.nakupickaTrack) {
          window.nakupickaTrack("preview_tab_change", { tab_id: tab.id || "unknown" });
        }
      });
    });
  }

  /* Skrýt horní lištu při scrollu dolů, znovu zobrazit při scrollu nahoru */
  let lastScrollY = window.scrollY || 0;
  let scrollTicking = false;
  function onScrollHeader() {
    scrollTicking = false;
    const y = window.scrollY || document.documentElement.scrollTop;
    const delta = y - lastScrollY;
    if (!document.body.classList.contains("menu-open")) {
      if (y < 36) {
        document.documentElement.classList.remove("header-hidden");
      } else if (delta > 6 && y > 72) {
        document.documentElement.classList.add("header-hidden");
      } else if (delta < -6) {
        document.documentElement.classList.remove("header-hidden");
      }
    }
    lastScrollY = y;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScrollHeader);
      }
    },
    { passive: true }
  );

  /* ---- Scroll-reveal (Apple-style fade+slide in) ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
        return;
      }
      navigator.serviceWorker.register("/sw.js").then((reg) => reg.update()).catch(() => {});
    });
  }
})();
