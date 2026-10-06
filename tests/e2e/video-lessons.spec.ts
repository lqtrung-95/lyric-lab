import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Video luyện nghe với dữ liệu hư cấu (API được giả lập, không cần DB). YouTube IFrame API được thay bằng bản giả có thể điều khiển thời gian.
const STUB = `window.__t = 0; window.__playing = true; window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__yt.push('seek:' + s); window.__t = s; },
    playVideo: function () { window.__yt.push('play'); window.__playing = true; },
    pauseVideo: function () { window.__yt.push('pause'); window.__playing = false; },
    setPlaybackRate: function (r) { window.__yt.push('rate:' + r); },
    getCurrentTime: function () { return window.__t; },
    getPlayerState: function () { return window.__playing ? 1 : 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const VIDEO_ID = "aBcDeFgHiJk";
const summary = { videoId: VIDEO_ID, title: "Cuộc trò chuyện mẫu", channelTitle: "Kênh thử", durationSec: 90, levelAvg: 1.5, lineCount: 3 };
const lesson = {
  ...summary, translationSource: "youtube",
  lines: [
    { idx: 0, start: 0, end: 4, text: "你好，朋友。", pinyin: "nǐ hǎo ， péng you 。", translation: "Xin chào, bạn bè.", tokens: [{ text: "你好" }, { text: "，" }, { text: "朋友" }, { text: "。" }] },
    { idx: 1, start: 4, end: 8, text: "今天天气很好。", pinyin: "jīn tiān tiān qì hěn hǎo 。", translation: "Hôm nay thời tiết đẹp.", tokens: [{ text: "今天" }, { text: "天气" }, { text: "很" }, { text: "好" }, { text: "。" }] },
    { idx: 2, start: 8, end: 12, text: "我们去公园吧。", pinyin: "wǒ men qù gōng yuán ba 。", translation: "Chúng ta đi công viên nhé.", tokens: [{ text: "我们" }, { text: "去" }, { text: "公园" }, { text: "吧" }, { text: "。" }] },
  ],
};

async function mockVideoApis(page: Page) {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route("**/api/videos", (route) => route.fulfill({ json: { videos: [summary] } }));
  await page.route(`**/api/videos/${VIDEO_ID}`, (route) => route.fulfill({ json: lesson }));
  await page.route("**/api/lookup?*", (route) => route.fulfill({ json: { entry: { term: "朋友", pinyin: "péng you", sinoViet: "bằng hữu", hskLevel: 1, meanings: ["friend"] } } }));
  await page.route("**/api/explain", (route) => route.fulfill({ json: { meaningInContext: "Chỉ người bạn thân thiết.", fromCache: true, model: "test" } }));
}

const noViolations = async (page: Page) => {
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
};

test("danh sách video: hiện thẻ video đã duyệt, mục Video có trên thanh điều hướng, mở được trang xem", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/video");
  await expect(page.getByRole("heading", { name: "Video luyện nghe" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Video" }).first()).toBeVisible();
  const card = page.getByRole("link", { name: /Cuộc trò chuyện mẫu/ });
  await expect(card).toBeVisible();
  await expect(page.getByText(/HSK ~1\.5 · 3 câu · 2 phút/)).toBeVisible();
  await noViolations(page);
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
});

test("xem video: bản chép chạy theo thời gian, bấm từ tra được và lưu thẻ, bấm câu nhảy tới đó", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}`);
  const line = (n: number) => page.locator(`[data-line-index="${n}"]`);
  await expect(line(0)).toBeVisible();
  await expect(page.getByText("Xin chào, bạn bè.")).toBeVisible();
  await expect(page.locator("ruby").first()).toBeVisible(); // pinyin trên từng chữ
  // Không có nút gợi ý sửa bản dịch (chỉ dành cho bài hát) và không có nút luyện/giải thích riêng của màn Nghe.
  await expect(page.getByRole("button", { name: /gợi ý bản dịch|Gợi ý/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Luyện phát âm câu đang hát" })).toHaveCount(0);

  await line(0).getByRole("button", { name: "朋友" }).click();
  const dialog = page.getByRole("dialog", { name: "Tra từ 朋友" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Chỉ người bạn thân thiết.")).toBeVisible();
  await expect(dialog.getByText("friend")).toBeVisible();
  await noViolations(page);
  await dialog.getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Đã lưu" })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lyric-lab-learner-state") ?? "{}").saved ?? []);
  expect(saved).toMatchObject([{ key: "vocab:朋友", videoId: VIDEO_ID, lineIndex: 0, start: 0, type: "vocab" }]);
  await dialog.getByRole("button", { name: "Đóng" }).click();

  // Phát tới câu 2: câu đang phát chuyển theo thời gian video.
  await page.evaluate(() => { (window as unknown as { __t: number }).__t = 5; });
  await expect(line(1)).toHaveAttribute("aria-current", "true");

  await line(2).click();
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:8");
});

test("video chưa duyệt hoặc không có: báo rõ và có đường về danh sách", async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route(`**/api/videos/${VIDEO_ID}`, (route) => route.fulfill({ status: 404, json: { error: "not_found" } }));
  await page.goto(`/video/${VIDEO_ID}`);
  await expect(page.getByRole("heading", { name: "Không tìm thấy video này" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Về danh sách video" })).toBeVisible();
});
