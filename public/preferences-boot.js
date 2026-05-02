/**
 * Časná inicializace (head, bez defer): jazyk a světlý/tmavý podle systému,
 * dokud uživatel neuloží vlastní volbu přes přepínače na stránce (script.js).
 */
(function () {
  try {
    var root = document.documentElement;

    function detectLang() {
      var list =
        typeof navigator !== "undefined" && navigator.languages && navigator.languages.length
          ? navigator.languages
          : typeof navigator !== "undefined" && navigator.language
            ? [navigator.language]
            : [];
      for (var i = 0; i < list.length; i++) {
        var base = String(list[i] || "").toLowerCase().split("-")[0];
        if (base === "cs") return "cs";
      }
      return "en";
    }

    function langFromUrl() {
      try {
        var q = typeof window !== "undefined" ? window.location.search : "";
        if (!q || q.length < 2) return null;
        var p = new URLSearchParams(q).get("lang");
        if (p === "cs" || p === "en") return p;
      } catch (_) {}
      return null;
    }

    function themeFromSystem() {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    var choiceLang = null;
    try {
      var lc = localStorage.getItem("nakupicka-lang-choice");
      if (lc === "cs" || lc === "en") choiceLang = lc;
    } catch (_) {}
    var lang = langFromUrl() || choiceLang || detectLang();
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "cs");

    var choiceTheme = null;
    try {
      var tc = localStorage.getItem("nakupicka-theme-choice");
      if (tc === "light" || tc === "dark") choiceTheme = tc;
    } catch (_) {}
    var theme = choiceTheme || themeFromSystem();
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  } catch (_) {}
})();
