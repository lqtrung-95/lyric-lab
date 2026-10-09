import { devices, expect, test, type Page } from "@playwright/test";
import { stubYouTube, YOUTUBE_STUB } from "./helpers/youtube-stub";

// Hướng dẫn màn Nghe (dữ liệu mẫu hư cấu "夜车"). Tự mở ở lần nghe đầu; bài test khác không bị che vì hướng dẫn tắt khi chạy bằng trình duyệt tự động hoá.
const forceTour = (page: Page) => page.addInitScript(() => { (window as unknown as { __forceListenTour: boolean }).__forceListenTour = true; });
const tour = (page: Page) => page.getByRole("dialog", { name: /Lời bài hát|Pinyin và bản dịch|Tốc độ, lặp câu, ghim|Giải thích và luyện nói|Lời bị lệch\?/ });

async function walkThrough(page: Page) {
  const titles = ["Lời bài hát", "Pinyin và bản dịch", "Tốc độ, lặp câu, ghim", "Giải thích và luyện nói", "Lời bị lệch?"];
  for (const [i, title] of titles.entries()) {
    const dialog = page.getByRole("dialog", { name: title });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(`Hướng dẫn ${i + 1}/${titles.length}`);
    // Thẻ nằm trọn trong màn hình và không đè lên khung đang được chỉ.
    const box = (await dialog.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await dialog.getByRole("button", { name: i === titles.length - 1 ? "Xong" : "Tiếp" }).click();
  }
  await expect(tour(page)).toHaveCount(0);
}

test.describe("máy tính", () => {
  test("tự hiện ở lần nghe đầu, đi hết 5 bước, rồi không hiện lại", async ({ page }) => {
    await forceTour(page);
    await stubYouTube(page);
    await page.goto("/dev/listen-fixture");
    await walkThrough(page);
    await page.reload();
    await page.waitForTimeout(2500);
    await expect(tour(page)).toHaveCount(0);
  });

  test("Bỏ qua và Esc đều đóng và ghi nhớ; nút Hướng dẫn mở lại", async ({ page }) => {
    await forceTour(page);
    await stubYouTube(page);
    await page.goto("/dev/listen-fixture");
    await expect(tour(page)).toBeVisible();
    await page.getByRole("button", { name: "Bỏ qua" }).click();
    await expect(tour(page)).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(2500);
    await expect(tour(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Xem hướng dẫn màn Nghe" }).click();
    await expect(page.getByRole("dialog", { name: "Lời bài hát" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tour(page)).toHaveCount(0);
  });

  test("không tự mở khi chạy bằng trình duyệt tự động hoá (không che các test khác)", async ({ page }) => {
    await stubYouTube(page);
    await page.goto("/dev/listen-fixture");
    await page.waitForTimeout(2500);
    await expect(tour(page)).toHaveCount(0);
  });
});

test.describe("điện thoại Android", () => {
  const { userAgent, viewport, deviceScaleFactor, isMobile, hasTouch } = devices["Pixel 7"];
  test.use({ userAgent, viewport, deviceScaleFactor, isMobile, hasTouch });

  test("đi hết các bước, thẻ nằm trọn trong màn hình", async ({ page }) => {
    await forceTour(page);
    await stubYouTube(page);
    await page.goto("/dev/listen-fixture");
    await walkThrough(page);
  });

  test("mở từ link chia sẻ câu (đã có vị trí) thì chờ bấm phát mới hiện hướng dẫn", async ({ page }) => {
    await forceTour(page);
    // Player giả bắt đầu ở trạng thái tạm dừng, như người nhận link thật (trình duyệt không cho tự phát).
    await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: YOUTUBE_STUB.replace("window.__playing = true;", "window.__playing = false;") }));
    await page.goto("/dev/listen-fixture?t=10");
    await page.waitForTimeout(2500);
    await expect(tour(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Phát", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Lời bài hát" })).toBeVisible();
  });
});
