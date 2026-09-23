import { readFile } from "node:fs/promises";
import path from "node:path";

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function parseAttrs(raw) {
  const attrs = {};
  raw.replace(/([:\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g, (_match, name, dbl, single, bare) => {
    attrs[name] = dbl ?? single ?? bare ?? true;
    return "";
  });
  return attrs;
}

function extractBody(html) {
  return html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
}

function extractTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]*>/g, "").trim() ?? "";
}

function stripScripts(body) {
  return body.replace(scriptRe, "");
}

const serviceNoticeHtml = `
  <section class="service-notice" aria-labelledby="service-notice-title">
    <div class="service-notice-date" aria-hidden="true">
      <span>08</span>
      <span>03</span>
      <span>2027</span>
    </div>
    <div class="service-notice-content">
      <p class="service-notice-label">
        <span class="i18n-cs">Důležité oznámení</span>
        <span class="i18n-en">Important notice</span>
      </p>
      <h2 id="service-notice-title">
        <span class="i18n-cs">Informace o dalším provozu NÁKUPIČKY</span>
        <span class="i18n-en">An update on the future of NiftySpend</span>
      </h2>
      <p>
        <span class="i18n-cs">Provoz aplikace je plánován k ukončení <strong>8. března 2027</strong>. Data všech uživatelů zůstanou dostupná na webu <a href="/app">nakupicka.app</a> do <strong>31. prosince 2027</strong>.</span>
        <span class="i18n-en">The app is currently scheduled to close on <strong>8 March 2027</strong>. Data for all users will remain available at <a href="/app">nakupicka.app</a> until <strong>31 December 2027</strong>.</span>
      </p>
      <p class="service-notice-option">
        <span class="i18n-cs">Současně probíhá jednání o převodu aplikace na společnost <strong>Opensite</strong>. Pokud bude převod dokončen za dohodnutých podmínek, aplikace bude pokračovat a k jejímu ukončení nedojde.</span>
        <span class="i18n-en">A transfer of the app to <strong>Opensite</strong> is also under negotiation. If the transfer is completed under the agreed terms, the app will continue and will not be discontinued.</span>
      </p>
    </div>
  </section>`;

function injectServiceNotice(body, page) {
  if (page === "home") {
    return body.replace(
      /(<main\b[^>]*>)/i,
      `<div class="service-notice-wrap">${serviceNoticeHtml}</div>$1`,
    );
  }

  return body.replace(/(<main\b[^>]*>)/i, `$1${serviceNoticeHtml}`);
}

function extractScripts(body) {
  return [...body.matchAll(scriptRe)].map((match) => ({
    attrs: parseAttrs(match[1] || ""),
    content: match[2] || "",
  }));
}

const legacyFiles = {
  app: "app.html",
  deleteAccount: "delete-account.html",
  emailVerified: "email-verified/index.html",
  home: "index.html",
  podpora: "podpora.html",
  premium: "premium.html",
  privacy: "privacy.html",
  resetPassword: "reset-password/index.html",
};

export async function readLegacyPage(page) {
  const filePath = legacyFiles[page];
  if (!filePath) throw new Error(`Unknown legacy page: ${page}`);

  const html = await readFile(path.join(/* turbopackIgnore: true */ process.cwd(), filePath), "utf8");
  const body = extractBody(html);
  return {
    title: extractTitle(html),
    bodyHtml: injectServiceNotice(stripScripts(body), page),
    scripts: extractScripts(body),
  };
}
