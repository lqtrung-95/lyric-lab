import { expect, test } from "@playwright/test";
import { stubYouTube } from "./helpers/youtube-stub";

// Bố cục responsive (360 → 1440 px) và vùng bấm ≥ 44 px (WCAG 2.2 AA, CLAUDE.md quy tắc 9).
const SCREENS = ["/", "/dev/preview-fixture", "/dev/listen-fixture"];
const WIDTHS = [360, 390, 768, 1024, 1440];

for (const url of SCREENS) {
  test(`không tràn ngang ở mọi độ rộng: ${url}`, async ({ page }) => {
    await stubYouTube(page);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url);
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${url} tràn ngang ${overflow}px ở ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  for (const width of [390, 1440]) {
    test(`vùng bấm ≥ 44 px: ${url} · ${width}px`, async ({ page }) => {
      await stubYouTube(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url);
      await page.waitForTimeout(400);
      const small = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll("button, a[href], select, input, [role=menuitem]")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // Từ trong lời hát là liên kết nằm giữa câu (ngoại lệ "inline" của WCAG 2.5.8).
          if (el.matches('[lang="zh"][title]')) continue;
          // Liên kết "Bỏ qua tới nội dung" chỉ hiện khi được focus (sr-only), kích thước lúc ẩn không tính.
          if (el.matches(".sr-only")) continue;
          if (r.width < 43.5 || r.height < 43.5) out.push(`${(el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        return out;
      });
      expect(small).toEqual([]);
    });
  }
}
