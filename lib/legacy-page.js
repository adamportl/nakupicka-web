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
    bodyHtml: stripScripts(body),
    scripts: extractScripts(body),
  };
}
