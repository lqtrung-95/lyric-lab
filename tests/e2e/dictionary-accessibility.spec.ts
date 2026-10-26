import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { stubYouTube } from "./helpers/youtube-stub";

// WCAG 2.2 AA (axe) cho trang Tra từ: tìm kiếm, kết quả, chi tiết; sáng và tối; điện thoại 390px không tràn ngang.
test.use({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const URLS = ["/dictionary", "/dictionary?q=xihuan", "/dictionary/" + encodeURIComponent("爱")];

for (const theme of ["light", "dark"] as const) {
  for (const url of URLS) {
    test(`axe ${theme}: ${decodeURIComponent(url)}`, async ({ page }) => {
      await stubYouTube(page);
      await page.goto("/dictionary");
      await page.evaluate((t) => localStorage.setItem("lyric-lab-theme", t), theme);
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}
