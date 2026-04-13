/**
 * Po OAuth (Google) často Supabase vrátí uživatele na „Site URL“ (úvodní stránku) místo na app.html.
 * Tento skript při detekci tokenu v URL nebo PKCE kódu okamžitě přesměruje na webovou aplikaci se stejným
 * hash / query. Na app.html nic nedělá.
 */
(function () {
  try {
    var path = window.location.pathname || "";
    if (/app\.html$/i.test(path)) return;

    var h = window.location.hash || "";
    var s = window.location.search || "";
    var looksAuth =
      (h &&
        /access_token|refresh_token|provider_token|error_code|error_description|type=recovery/.test(h)) ||
      (s && /[?&]code=/.test(s));
    if (!looksAuth) return;

    var u = new URL("app.html", window.location.href);
    u.hash = h;
    u.search = s;
    window.location.replace(u.toString());
  } catch (_) {
    /* ignore */
  }
})();
