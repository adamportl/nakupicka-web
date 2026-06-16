"use client";

import { useEffect } from "react";

export function LegacyScripts({ scripts }) {
  useEffect(() => {
    let cancelled = false;
    const added = [];

    async function run() {
      for (const spec of scripts) {
        if (cancelled) return;
        await new Promise((resolve) => {
          const script = document.createElement("script");
          Object.entries(spec.attrs || {}).forEach(([key, value]) => {
            if (key === "defer") return;
            if (value === true) script.setAttribute(key, "");
            else script.setAttribute(key, String(value));
          });
          if (spec.content) script.text = spec.content;
          script.onload = resolve;
          script.onerror = resolve;
          added.push(script);
          document.body.appendChild(script);
          if (!spec.attrs?.src) resolve();
        });
      }

      if (!cancelled) {
        document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
      }
    }

    run();

    return () => {
      cancelled = true;
      added.forEach((script) => script.remove());
    };
  }, [scripts]);

  return null;
}
