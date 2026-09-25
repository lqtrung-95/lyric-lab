import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { stubYouTube } from "./helpers/youtube-stub";

// Kiểm tra tự động WCAG 2.2 AA (axe) trên các màn chính, cả giao diện sáng và tối, desktop và mobile.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} phần tử, vd. ${v.nodes[0]?.target.join(" ")}`);
  expect(summary, `${label}: vi phạm truy cập`).toEqual([]);
}

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((t) => { localStorage.setItem("lyric-lab-theme", t); }, theme);
  await page.reload();
}

const SCREENS = [
  { name: "trang chủ", url: "/" },
  { name: "xem trước", url: "/dev/preview-fixture" },
  { name: "nghe", url: "/dev/listen-fixture" },
  { name: "ôn tập (chưa có thẻ)", url: "/review" },
  { name: "cài đặt", url: "/settings" },
  { name: "làm quen", url: "/welcome" },
];

for (const theme of ["light", "dark"] as const) {
  for (const viewport of [{ w: 1440, h: 900, name: "desktop" }, { w: 390, h: 844, name: "mobile" }]) {
    for (const screen of SCREENS) {
      test(`axe: ${screen.name} · ${theme} · ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.w, height: viewport.h });
        await stubYouTube(page);
        await page.goto(screen.url);
        await setTheme(page, theme);
        await page.waitForTimeout(400);
        await audit(page, `${screen.name}/${theme}/${viewport.name}`);
      });
    }
  }
}

test("axe: popover tra từ đang mở", async ({ page }) => {
  await stubYouTube(page);
  await page.route("**/api/lookup**", (r) => r.fulfill({ json: { entry: { term: "慢慢", traditional: "慢慢", pinyin: "màn màn", sinoViet: "mạn mạn", hskLevel: 4, meanings: ["slowly"] } } }));
  await page.route("**/api/explain", (r) => r.fulfill({ json: { meaningInContext: "dần dần", model: "t", fromCache: false } }));
  await page.goto("/dev/listen-fixture");
  await page.locator('[data-line-index="0"]').getByRole("button", { name: "慢慢", exact: true }).dispatchEvent("click");
  await expect(page.getByRole("dialog")).toContainText("dần dần");
  await audit(page, "popover");
});

test("axe: màn lỗi 'không có lời'", async ({ page }) => {
  await page.route("**/api/analyze/**", (r) =>
    r.fulfill({ contentType: "text/event-stream", body: 'event: meta\ndata: {"title":"Bài mẫu","channelTitle":"Kênh","durationSec":30}\n\nevent: error\ndata: {"code":"no_lyrics"}\n\n' }));
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/learn/dQw4w9WgXcQ");
  await expect(page.getByRole("alert").filter({ hasText: "Chưa tìm được lời" })).toBeVisible();
  await audit(page, "màn lỗi");
});
