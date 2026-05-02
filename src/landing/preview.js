export function initLandingPreview(root) {
  const previewImg = document.getElementById("previewImage");
  const previewCaption = document.getElementById("previewCaption");
  const dockHits = document.querySelectorAll(".phone-dock-hit");

  if (!previewImg || !dockHits.length) return;

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
