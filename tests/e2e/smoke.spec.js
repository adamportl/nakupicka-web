import { expect, test } from "@playwright/test";

test("landing page renders navigation", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("header.site-header")).toBeVisible();
  await expect(page.locator("a[href='app.html']").first()).toBeVisible();
});
