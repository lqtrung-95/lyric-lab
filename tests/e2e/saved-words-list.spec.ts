import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Tab "Từ đã lưu" của thư viện: bố cục dòng khi nghĩa rất dài, và nghe đoạn hát chứa từ ngay trong danh sách. Dữ liệu hư cấu.
const LONG = "Từ “巢” ở đây mang nghĩa bóng, chỉ nơi trú ngơi, nơi an toàn. Trong câu hát, nó diễn tả cảm giác cô đơn đã tạo ra một tổ trong trái tim người hát. Đây là phần giải thích rất dài để kiểm tra bố cục không bị vỡ.";
const STATE = {
  level: 3, known: [],
  saved: [
    { key: "vocab:巢", videoId: "e2eFixture1", type: "vocab", term: "巢", lineIndex: 3, start: 0, savedAt: 2, reading: "cháo", sinoViet: "sào", level: null, meaning: LONG },
    { key: "vocab:若", videoId: "e2eFixture1", type: "vocab", term: "若", lineIndex: 4, start: 0, savedAt: 1, reading: "ruò", sinoViet: "nhược", level: 6, meaning: "nếu không gặp lại nữa" },
  ],
};
const STUB = `window.__yt = []; window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) { el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: { seekTo: function (s) { window.__yt.push('seek:' + s); }, playVideo: function () { window.__yt.push('play'); }, pauseVideo: function () {},
  setPlaybackRate: function () {}, getCurrentTime: function () { return 0; }, getPlayerState: function () { return 2; } } }); }, 0); this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

async function open(page: Page, contextStatus = 200) {
  await page.addInitScript((s) => localStorage.setItem("lyric-lab-learner-state", JSON.stringify(s)), STATE);
  await page.route("https://www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, json: {} }));
  await page.route("**/api/review/context**", (r) => contextStatus === 200
    ? r.fulfill({ json: { videoId: "e2eFixture1", title: "夜车", artist: "Mẫu", lines: { 3: { text: "我心里有个巢", pinyin: "wǒ xīn lǐ", start: 12, end: 17 } } } })
    : r.fulfill({ status: contextStatus, json: { error: "song_unavailable" } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/library");
  await page.getByRole("tab", { name: "Từ đã lưu" }).click();
}

test("nghĩa rất dài bị cắt 2 dòng và cụm nút vẫn nằm cùng hàng với từ (không bị đẩy xuống)", async ({ page }) => {
  await open(page);
  const row = page.getByRole("listitem").filter({ hasText: "巢" });
  const term = await row.locator("[lang=zh]").first().boundingBox();
  const remove = await row.getByRole("button", { name: "Bỏ lưu 巢" }).boundingBox();
  const meaning = await row.locator("p[title]").boundingBox();
  expect(remove!.y).toBeLessThan(term!.y + term!.height); // nút nằm ngang hàng với chữ Hán, không rơi xuống dưới nghĩa
  expect(meaning!.height).toBeLessThanOrEqual(52); // tối đa 2 dòng
  expect(await row.locator("p[title]").getAttribute("title")).toBe(LONG); // đọc đủ khi rê chuột
  expect(await row.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(140);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("bấm ▶ nghe đúng đoạn hát chứa từ (lùi 0,3 giây), có nút loa đọc từ", async ({ page }) => {
  await open(page);
  const row = page.getByRole("listitem").filter({ hasText: "巢" });
  await expect(row.getByRole("button", { name: "Nghe phát âm 巢" })).toBeVisible();
  await row.getByRole("button", { name: "Nghe đoạn hát chứa 巢" }).click();
  await expect(page.getByRole("region", { name: "Nghe thử đoạn" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:11.7");
});

test("bài đã bị gỡ: báo lỗi rõ ràng, không treo", async ({ page }) => {
  await open(page, 404);
  await page.getByRole("listitem").filter({ hasText: "巢" }).getByRole("button", { name: "Nghe đoạn hát chứa 巢" }).click();
  await expect(page.getByText("Không tìm thấy câu hát chứa “巢”")).toBeVisible();
});
