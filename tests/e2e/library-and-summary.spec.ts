import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { yeCheAnalysis } from "@/lib/preview/fixtures/ye-che-analysis";
import { summarizeSong } from "@/lib/preview/summarize-song";
import { E2E_VIDEO_ID, hasSupabaseEnv, removeFixtureSong, seedFixtureSong, serviceClientForTests } from "./helpers/seed-analysis";

// Thư viện (AC-03), tổng kết bài (RV-03) và lời mời xem tổng kết khi nghe hết bài, trên dữ liệu hư cấu "夜车".
const STUB = `window.__t = 0; window.__playing = true;
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__t = s; }, playVideo: function () { window.__playing = true; }, pauseVideo: function () {},
    setPlaybackRate: function () {}, getCurrentTime: function () { return window.__t; }, getPlayerState: function () { return 1; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const noViolations = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test.describe("thư viện", () => {
  test("trạng thái rỗng của cả hai tab, đạt axe", async ({ page }) => {
    await page.goto("/library");
    await expect(page.getByRole("heading", { name: "Thư viện" })).toBeVisible();
    await expect(page.getByText("Chưa có bài nào.")).toBeVisible();
    await noViolations(page);
    await page.getByRole("tab", { name: "Từ đã lưu" }).click();
    await expect(page.getByText("Chưa lưu từ nào.")).toBeVisible();
    await noViolations(page);
  });

  test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");
  test("từ đã lưu: tìm không dấu, lọc, bỏ lưu", async ({ page }) => {
    const sb = serviceClientForTests();
    let userId = "";
    try {
      await page.goto("/dev/preview-fixture");
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
      await card.getByRole("button", { name: "Lưu" }).click();
      await expect(card.getByRole("button", { name: "Đã lưu" })).toBeVisible();
      await expect.poll(async () => {
        const { data } = await sb.from("user_cards").select("user_id").eq("item_key", "vocab:离开").order("created_at", { ascending: false }).limit(1);
        userId = data?.[0]?.user_id ?? "";
        return userId;
      }, { timeout: 15_000 }).not.toBe("");

      await page.goto("/library");
      await page.getByRole("tab", { name: "Từ đã lưu" }).click();
      await expect(page.getByText("离开", { exact: true })).toBeVisible();
      await noViolations(page);
      await page.getByRole("searchbox", { name: "Tìm từ đã lưu" }).fill("ly khai");
      await expect(page.getByText("1 / 1 mục")).toBeVisible();
      await page.getByRole("searchbox", { name: "Tìm từ đã lưu" }).fill("không có từ này");
      await expect(page.getByText("Không có mục nào khớp bộ lọc.")).toBeVisible();
      await page.getByRole("searchbox", { name: "Tìm từ đã lưu" }).fill("");
      await page.getByRole("button", { name: "Bỏ lưu 离开" }).click();
      await expect(page.getByText("Chưa lưu từ nào.")).toBeVisible();
    } finally {
      if (userId) await sb.auth.admin.deleteUser(userId);
    }
  });
});

test("nghe tới câu cuối: mời xem tổng kết", async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.goto("/dev/listen-fixture");
  await expect(page.getByText("Bạn đã nghe tới cuối bài.")).toHaveCount(0);
  await page.evaluate(() => { (window as unknown as { __t: number }).__t = 27; });
  await expect(page.getByText("Bạn đã nghe tới cuối bài.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Xem tổng kết" })).toHaveAttribute("href", /\/summary$/);
});

test.describe("tổng kết bài", () => {
  test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");
  test.beforeAll(seedFixtureSong);
  test.afterAll(removeFixtureSong);

  test("hiện % từ vựng đã hiểu theo level và mục đã biết, đạt axe", async ({ page }) => {
    const state = { level: 3, known: ["vocab:回忆"], saved: [] };
    await page.goto("/");
    await page.evaluate((s) => localStorage.setItem("lyric-lab-learner-state", JSON.stringify(s)), state);
    await page.goto(`/learn/${E2E_VIDEO_ID}/summary`);
    const expected = summarizeSong(E2E_VIDEO_ID, yeCheAnalysis.items, state);
    await expect(page.getByText(`Hiểu ${expected.understoodPercent}% từ vựng của bài`)).toBeVisible();
    await expect(page.getByRole("link", { name: "Nghe lại" })).toHaveAttribute("href", `/learn/${E2E_VIDEO_ID}/listen`);
    await expect(page.getByRole("link", { name: "Bài mới" })).toBeVisible();
    await noViolations(page);
  });
});
