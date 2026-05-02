(function () {
  var queue = [];

  function push(event, payload) {
    queue.push({ event: event, payload: payload || {}, ts: Date.now() });
    try {
      localStorage.setItem("nakupicka-analytics-queue", JSON.stringify(queue.slice(-200)));
    } catch (_) {}
  }

  window.nakupickaTrack = function (event, payload) {
    if (!event) return;
    push(String(event), payload || {});
    if (window.gtag) {
      window.gtag("event", event, payload || {});
    }
    if (window.plausible) {
      window.plausible(event, { props: payload || {} });
    }
  };

  function trackLinkClick() {
    document.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        var href = a.getAttribute("href") || "";
        if (href.includes("apps.apple.com")) {
          window.nakupickaTrack("app_store_click", { source_page: location.pathname });
        }
        if (href.includes("premium.html")) {
          window.nakupickaTrack("premium_page_click", { source_page: location.pathname });
        }
        if (href.includes("app.html")) {
          window.nakupickaTrack("web_app_click", { source_page: location.pathname });
        }
      });
    });
  }

  function hydrateQueue() {
    try {
      var raw = localStorage.getItem("nakupicka-analytics-queue");
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) queue = parsed;
    } catch (_) {}
  }

  hydrateQueue();
  trackLinkClick();
  window.nakupickaTrack("page_view", {
    path: location.pathname,
    lang: document.documentElement.getAttribute("data-lang") || "cs",
  });
})();
