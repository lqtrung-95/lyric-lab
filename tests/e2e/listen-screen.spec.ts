import { expect, test, type Page } from "@playwright/test";

// Màn Nghe với dữ liệu mẫu hư cấu "夜车" (6 câu, mỗi câu 5 giây: câu n bắt đầu ở 5*(n-1)).
// YouTube IFrame API được thay bằng bản giả có thể điều khiển thời gian qua window.__t.
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

const setTime = (page: Page, t: number) => page.evaluate((v) => { (window as unknown as { __t: number }).__t = v; }, t);
const calls = (page: Page) => page.evaluate(() => (window as unknown as { __yt: string[] }).__yt);
const line = (page: Page, n: number) => page.locator(`[data-line-index="${n - 1}"]`);

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.goto("/dev/listen-fixture");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("lời chạy theo thời gian phát và panel 'Đang hát' đổi theo câu", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  await expect(page.getByText("Câu 02 đang phát", { exact: true })).toBeVisible();
  await expect(page.getByRole("complementary").getByText("离开")).toBeVisible();
  await setTime(page, 12);
  await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("complementary").getByText("星光")).toBeVisible();
  await expect(page.getByRole("complementary").getByText("离开")).toHaveCount(0);
});

test("từ vựng tô nền, ngữ pháp gạch chân: hai kiểu khác nhau", async ({ page }) => {
  await setTime(page, 6);
  const row = line(page, 2);
  await expect(row.getByText("Từ vựng:").first()).toBeAttached(); // nhãn cho trình đọc màn hình
  await expect(row.locator(".ring-2").first()).toBeVisible(); // từ vựng: nền + viền
  await expect(row.locator(".border-b-2").first()).toBeVisible(); // ngữ pháp: gạch chân
});

test("bấm câu để nhảy tới đầu câu", async ({ page }) => {
  await line(page, 4).click();
  expect(await calls(page)).toContain("seek:15");
  await expect(line(page, 4)).toHaveAttribute("aria-current", "true");
});

test("lặp câu: phát tới hết câu thì quay về đầu câu, bấm lại để tắt", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  const loop = page.getByRole("button", { name: "Lặp câu đang hát" });
  await loop.click();
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu 2" })).toBeVisible();
  await setTime(page, 9.98);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __t: number }).__t)).toBe(5);
  await loop.click();
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu" })).toHaveCount(0);
});

test("tốc độ 0,75x được áp dụng và nhớ sau khi tải lại", async ({ page }) => {
  await page.getByRole("button", { name: "0,75x" }).click();
  await expect.poll(() => calls(page)).toContain("rate:0.75");
  await page.reload();
  await expect(page.getByRole("button", { name: "0,75x" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => calls(page)).toContain("rate:0.75");
});

test("tắt pinyin và bản dịch, lựa chọn được nhớ", async ({ page }) => {
  await expect(page.getByText("wǒ cónglái méi xiǎng guò huì líkāi")).toBeVisible();
  await page.getByRole("button", { name: "Pinyin" }).first().click();
  await page.getByRole("button", { name: "Bản dịch" }).first().click();
  await expect(page.getByText("wǒ cónglái méi xiǎng guò huì líkāi")).toHaveCount(0);
  await expect(page.getByText("Anh chưa từng nghĩ mình sẽ rời đi")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("wǒ cónglái méi xiǎng guò huì líkāi")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Pinyin" }).first()).toHaveAttribute("aria-pressed", "false");
});

test("phím tắt: Space phát/dừng, mũi tên đổi câu, L lặp câu", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("Space");
  expect(await calls(page)).toContain("pause");
  await page.keyboard.press("ArrowRight");
  expect(await calls(page)).toContain("seek:10");
  await page.keyboard.press("ArrowLeft");
  expect(await calls(page)).toContain("seek:0"); // từ câu 3 (đang ở 10 s) lùi về câu 2 = 5 s
  await page.keyboard.press("l");
  await expect(page.getByRole("button", { name: "Lặp câu đang hát" })).toHaveAttribute("aria-pressed", "true");
});

test("mobile: panel 'Đang hát' thu gọn mặc định, mở ra thấy thẻ của câu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setTime(page, 6);
  const toggle = page.getByRole("button", { name: /Đang hát · Câu 02/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("complementary").getByText("rời đi, rời khỏi")).toBeHidden();
  await toggle.click();
  await expect(page.getByRole("complementary").getByText("rời đi, rời khỏi")).toBeVisible();
});
