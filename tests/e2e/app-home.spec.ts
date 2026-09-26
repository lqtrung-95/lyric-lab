import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { E2E_VIDEO_ID, hasSupabaseEnv, removeFixtureSong, seedFixtureSong } from "./helpers/seed-analysis";

// Trang chủ của app (/app): hành động nổi bật, mục tiêu ngày, gợi ý theo level, trạng thái người mới. API được giả lập.
const rec = (n: number) => ({ videoId: `rec${String(n).padStart(8, "0")}`, title: `Bài gợi ý ${n}`, channelTitle: "Kênh", levelAvg: 3.2, listeners: n });
const progress = (over: object = {}) => ({
  videoId: "cont0000001", title: "Bài đang nghe dở", channelTitle: "K", durationSec: 200, lastPositionSec: 84.7, completed: false, updatedAt: "2026-03-10T00:00:00Z", ...over,
});

async function mock(page: Page, opts: { songs?: object[]; discover?: object[] } = {}) {
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  await page.route("**/api/library/songs", (r) => r.fulfill({ json: { songs: opts.songs ?? [] } }));
  const discoverUrls: string[] = [];
  await page.route("**/api/discover**", (r) => { discoverUrls.push(new URL(r.request().url()).search); return r.fulfill({ json: { songs: opts.discover ?? [], hasMore: false } }); });
  return discoverUrls;
}

test("người mới: ba bước, gợi ý theo level (dải HSK 3–4 rồi bù bài chung), thẻ 'Chưa biết học bài nào?' và vòng mục tiêu", async ({ page }) => {
  const urls = await mock(page, { discover: [rec(1), rec(2)] });
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Bắt đầu chỉ với ba bước" })).toBeVisible();
  await expect(page.getByText("Chưa biết học bài nào?")).toBeVisible();
  await expect(page.getByRole("link", { name: "Xem bài gợi ý" })).toHaveAttribute("href", "/library?tab=discover");
  await expect(page.getByRole("img", { name: "Mục tiêu hôm nay: đã học 0 trên 15 thẻ mới" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gợi ý cho bạn" })).toBeVisible();
  await expect(page.getByText("Bài gợi ý 1")).toBeVisible();
  expect(urls[0]).toContain("band=3-4"); // level mặc định là HSK 3
  expect(urls.some((u) => !u.includes("band="))).toBe(true); // ít hơn 4 bài trong dải → bù bằng bài phổ biến chung
  await expect(page.getByRole("heading", { name: "Bài hát gần đây" })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("đang nghe dở: hiện 'Tiếp tục nghe' dẫn tới đúng vị trí; bài gợi ý không lặp bài đã mở", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lyric-lab-recent-songs", JSON.stringify([{ videoId: "rec00000001", title: "Đã mở rồi", channelTitle: "K", openedAt: 1 }])));
  await mock(page, { songs: [progress()], discover: [rec(1), rec(2), rec(3), rec(4), rec(5)] });
  await page.goto("/app");
  await expect(page.getByText("Bài đang nghe dở")).toBeVisible();
  await expect(page.getByText("Dừng ở 1:24")).toBeVisible();
  await expect(page.getByRole("link", { name: "Tiếp tục nghe" })).toHaveAttribute("href", "/learn/cont0000001/listen?t=84");
  await expect(page.getByRole("heading", { name: "Bắt đầu chỉ với ba bước" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Bài hát gần đây" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Bài gợi ý 1/ })).toHaveCount(0); // rec00000001 đã mở nên bị loại
  await expect(page.getByRole("link", { name: /Bài gợi ý 2/ })).toBeVisible();
});

test("không có bài gợi ý: ẩn hàng gợi ý, không lỗi", async ({ page }) => {
  await mock(page, { discover: [] });
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Bắt đầu chỉ với ba bước" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gợi ý cho bạn" })).toHaveCount(0);
});

test("thư viện mở đúng tab theo ?tab=discover", async ({ page }) => {
  await mock(page, { discover: [rec(1)] });
  await page.goto("/library?tab=discover");
  await expect(page.getByRole("tab", { name: "Khám phá" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Bài gợi ý 1")).toBeVisible();
});

test.describe("tiếp tục nghe tại vị trí đã dừng", () => {
  test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");
  test.beforeAll(seedFixtureSong);
  test.afterAll(removeFixtureSong);

  test("?t=12 tua player tới 12 giây; giá trị sai bị bỏ qua", async ({ page }) => {
    await page.route("https://www.youtube.com/iframe_api", (r) => r.fulfill({
      contentType: "text/javascript",
      body: `window.__seeks = []; window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) { el.replaceWith(document.createElement('div'));
        setTimeout(function () { opts.events.onReady({ target: { seekTo: function (s) { window.__seeks.push(s); }, playVideo: function () {}, pauseVideo: function () {},
        setPlaybackRate: function () {}, getCurrentTime: function () { return 0; }, getPlayerState: function () { return 2; } } }); }, 0); this.destroy = function () {}; } };
        window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`,
    }));
    await page.goto(`/learn/${E2E_VIDEO_ID}/listen?t=12`);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __seeks?: number[] }).__seeks ?? [])).toEqual([12]);
    await page.goto(`/learn/${E2E_VIDEO_ID}/listen?t=abc`);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as unknown as { __seeks?: number[] }).__seeks ?? [])).toEqual([]);
  });
});
