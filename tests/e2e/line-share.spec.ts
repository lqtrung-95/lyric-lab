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

  test("popup có nút các mạng xã hội và sao chép link tới bài (link không chứa lời), không có nút Chia sẻ của hệ điều hành", async ({ page }) => {
    await page.addInitScript(() => { navigator.canShare = () => true; });
    await openFixture(page);
    const row = page.locator('[data-line-index="0"]');
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await row.hover();
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ câu này" });
    await expect(dialog.getByRole("img")).toBeVisible();
    for (const name of ["Facebook", "X", "Zalo", "Telegram", "Threads"]) await expect(dialog.getByRole("link", { name, exact: true })).toBeVisible();
    const facebook = await dialog.getByRole("link", { name: "Facebook" }).getAttribute("href");
    expect(decodeURIComponent(facebook!)).toMatch(/\/learn\/[^/]+$/);
    await expect(dialog.getByRole("button", { name: "Sao chép link" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Sao chép ảnh" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Chia sẻ", exact: true })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Đóng" }).click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe("điện thoại Android", () => {
  const { userAgent, viewport, deviceScaleFactor, isMobile, hasTouch } = devices["Pixel 7"];
  test.use({ userAgent, viewport, deviceScaleFactor, isMobile, hasTouch });

  test("bấm chia sẻ ở dòng hiện popup xem ảnh trước, bấm Chia sẻ trong popup mới mở share sheet", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __shared: { name: string; type: string; size: number }[] };
      w.__shared = [];
      navigator.canShare = () => true;
      navigator.share = async (data) => { for (const f of data?.files ?? []) w.__shared.push({ name: f.name, type: f.type, size: f.size }); };
    });
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ câu này" });
    await expect(dialog.getByRole("img")).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Facebook" })).toHaveCount(0); // điện thoại dùng share sheet, không có lưới mạng xã hội
    expect(await page.evaluate(() => (window as unknown as { __shared: unknown[] }).__shared.length)).toBe(0);
    await dialog.getByRole("button", { name: "Chia sẻ" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: unknown[] }).__shared.length)).toBe(1);
    const [file] = await page.evaluate(() => (window as unknown as { __shared: { name: string; type: string; size: number }[] }).__shared);
    expect(file).toMatchObject({ name: "songhanzi-cau-hat.png", type: "image/png" });
    expect(file.size).toBeGreaterThan(10_000);
  });

  test("nút chia sẻ ở câu đang hát là biểu tượng ở cột phải (không chiếm riêng một hàng), đủ vùng bấm 44 px", async ({ page }) => {
    await openFixture(page);
    const button = page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" });
    const box = (await button.boundingBox())!;
    const row = (await page.locator('[data-line-index="0"]').boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(43.5);
    expect(box.height).toBeGreaterThanOrEqual(43.5);
    expect(box.x + box.width).toBeGreaterThan(row.x + row.width - 24); // sát mép phải của dòng
    expect(box.y + box.height).toBeLessThanOrEqual(row.y + row.height); // nằm trong dòng, không kéo dài thêm hàng
  });

  test("mở popup không làm nút Đóng nhận tiêu điểm (không hiện viền tiêu điểm)", async ({ page }) => {
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ câu này" });
    await expect(dialog.getByRole("img")).toBeVisible();
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe("DIALOG");
  });

  test("nút Chia sẻ trong popup nằm một dòng, rộng cả hàng", async ({ page }) => {
    await page.addInitScript(() => { navigator.canShare = () => true; });
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ câu này" });
    const share = (await dialog.getByRole("button", { name: "Chia sẻ" }).boundingBox())!;
    const dlg = (await dialog.boundingBox())!;
    expect(share.height).toBeLessThan(56);
    expect(share.width).toBeGreaterThan(dlg.width * 0.8);
    await page.screenshot({ path: "test-results/line-share-dialog-mobile.png" });
  });

  test("máy không chia sẻ được file thì popup chỉ có Tải ảnh và Đóng", async ({ page }) => {
    await page.addInitScript(() => { navigator.canShare = () => false; });
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ câu này" });
    await expect(dialog.getByRole("img")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Chia sẻ" })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Tải ảnh" })).toBeVisible();
  });

  test("người dùng đóng share sheet thì popup vẫn mở, không báo lỗi", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.canShare = () => true;
      navigator.share = async () => { throw new DOMException("cancelled", "AbortError"); };
    });
    await openFixture(page);
    await page.getByRole("button", { name: "Chia sẻ câu 1 thành ảnh" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ câu này" });
    await expect(dialog.getByRole("img")).toBeVisible();
    await dialog.getByRole("button", { name: "Chia sẻ" }).click();
    await page.waitForTimeout(500);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("alert")).toHaveCount(0);
  });
});
