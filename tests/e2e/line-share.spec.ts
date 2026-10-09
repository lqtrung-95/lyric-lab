import { devices, expect, test, type Page } from "@playwright/test";

// Chia sẻ một câu lời thành ảnh (dữ liệu mẫu hư cấu "夜车"). YouTube IFrame API được thay bằng bản giả: bài đứng ở 0 giây nên câu 1 là câu đang hát.
const STUB = `window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function () {}, playVideo: function () {}, pauseVideo: function () {}, setPlaybackRate: function () {},
    getCurrentTime: function () { return 0; }, getPlayerState: function () { return 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

async function openFixture(page: Page) {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.goto("/dev/listen-fixture");
  await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
  // Chờ React gắn xong sự kiện cho dòng lời: bấm trước đó sẽ rơi vào khoảng trống, popup không mở.
  await page.waitForFunction(() => {
    const row = document.querySelector("[data-line-index]");
    return !!row && Object.keys(row).some((k) => k.startsWith("__reactProps"));
  });
}

test.describe("máy tính", () => {
  test("bấm chia sẻ mở popup có ảnh, nút Tải ảnh tải được file PNG", async ({ page }) => {
    await openFixture(page);
    // Nút chia sẻ chỉ hiện khi rê chuột lên dòng; cuộn dòng xuống dưới phần video dính ở đầu trang rồi mới bấm (bấm ép sẽ trúng phần dính).
    const row = page.locator('[data-line-index="0"]');
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await row.hover();
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ câu này" });
    await expect(dialog.getByRole("img")).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent("download"), dialog.getByRole("button", { name: "Tải ảnh" }).click()]);
    expect(download.suggestedFilename()).toBe("songhanzi-cau-hat.png");
  });
});

test.describe("điện thoại Android", () => {
  const { userAgent, viewport, deviceScaleFactor, isMobile, hasTouch } = devices["Pixel 7"];
  test.use({ userAgent, viewport, deviceScaleFactor, isMobile, hasTouch });

  test("bấm chia sẻ mở thẳng share sheet với file ảnh, không hiện popup", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __shared: { name: string; type: string; size: number }[] };
      w.__shared = [];
      navigator.canShare = () => true;
      navigator.share = async (data) => { for (const f of data?.files ?? []) w.__shared.push({ name: f.name, type: f.type, size: f.size }); };
    });
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: unknown[] }).__shared.length)).toBe(1);
    const [file] = await page.evaluate(() => (window as unknown as { __shared: { name: string; type: string; size: number }[] }).__shared);
    expect(file).toMatchObject({ name: "songhanzi-cau-hat.png", type: "image/png" });
    expect(file.size).toBeGreaterThan(10_000);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("máy không chia sẻ được file thì hiện popup để xem ảnh và tải về", async ({ page }) => {
    await page.addInitScript(() => { navigator.canShare = () => false; });
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    await expect(page.getByRole("dialog", { name: "Chia sẻ câu này" }).getByRole("img")).toBeVisible();
  });

  test("người dùng đóng share sheet thì không hiện popup", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.canShare = () => true;
      navigator.share = async () => { throw new DOMException("cancelled", "AbortError"); };
    });
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
