import { LegacyScripts } from "@/components/LegacyScripts";
import { readLegacyPage } from "@/lib/legacy-page";

export async function LegacyPage({ appCss = false, page }) {
  const legacyPage = await readLegacyPage(page);

  return (
    <>
      {appCss ? <link rel="stylesheet" href="/app.css" /> : null}
      <div dangerouslySetInnerHTML={{ __html: legacyPage.bodyHtml }} />
      <LegacyScripts scripts={legacyPage.scripts} />
    </>
  );
}
