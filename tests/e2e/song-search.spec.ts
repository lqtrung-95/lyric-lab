import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Tìm bài theo tên/nghệ sĩ ở ô nhập trang chủ. API tìm được giả lập để test không phụ thuộc YouTube.
const song = (n: number) => ({ videoId: `srch${String(n).padStart(7, "0")}`, title: `歌曲 ${n}`, channelTitle: "Kênh", durationSec: 200 });
const routeImages = (page: import("@playwright/test").Page) => page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));

test("gõ tên: hiện nhóm 'Đã có' và 'Trên YouTube', bấm kết quả mở bài, đạt axe", async ({ page }) => {
  const urls: string[] = [];
  await routeImages(page);
  await page.route("**/api/search**", (r) => { urls.push(r.request().url()); return r.fulfill({ json: { library: [song(1)], youtube: [song(2), song(3)] } }); });
  await page.goto("/app");
  const input = page.getByLabel(/Dán link YouTube hoặc gõ tên/);
  await input.fill("周杰伦");
  await expect(page.getByRole("region", { name: "Đã có trong Lyric Lab" })).toContainText("歌曲 1");
  await expect(page.getByRole("region", { name: "Trên YouTube" })).toContainText("歌曲 3");
  expect(urls.at(-1)).toContain(encodeURIComponent("周杰伦"));
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);

  await page.getByRole("link", { name: /歌曲 2/ }).click();
  await expect(page).toHaveURL(/\/learn\/srch0000002/);
});

test("YouTube không tìm được: báo 'hãy dán link' và vẫn hiện bài có sẵn", async ({ page }) => {
  await routeImages(page);
  await page.route("**/api/search**", (r) => r.fulfill({ status: 503, json: { error: "search_unavailable", library: [song(1)], youtube: [] } }));
  await page.goto("/app");
  await page.getByLabel(/Dán link YouTube hoặc gõ tên/).fill("bài nào đó");
  await expect(page.getByRole("region", { name: "Đã có trong Lyric Lab" })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "hãy dán link" })).toBeVisible();
});

test("dán link vẫn chạy như cũ và không gọi tìm kiếm; link sai báo lỗi", async ({ page }) => {
  let searched = 0;
  await page.route("**/api/search**", (r) => { searched++; return r.fulfill({ json: { library: [], youtube: [] } }); });
  await page.goto("/app");
  const input = page.getByLabel(/Dán link YouTube hoặc gõ tên/);
  await input.fill("https://youtu.be/short");
  await page.getByRole("button", { name: "Phân tích bài hát" }).click();
  await expect(page.locator("#video-link-error")).toBeVisible();
  await page.waitForTimeout(600);
  expect(searched).toBe(0);
  await input.fill("https://youtu.be/dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Phân tích bài hát" }).click();
  await expect(page).toHaveURL(/\/learn\/dQw4w9WgXcQ/);
});

test("mobile: kết quả không tràn ngang", async ({ page }) => {
  await routeImages(page);
  await page.route("**/api/search**", (r) => r.fulfill({ json: { library: [], youtube: [{ ...song(1), title: "非常非常非常非常非常非常非常非常非常非常长的歌名 Very Long Title" }] } }));
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/app");
  await page.getByLabel(/Dán link YouTube hoặc gõ tên/).fill("dài");
  await expect(page.getByRole("region", { name: "Trên YouTube" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
