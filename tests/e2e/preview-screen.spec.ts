import { expect, test, type Page } from "@playwright/test";

// Trang thử dùng dữ liệu mẫu hư cấu "夜车" (không gọi DB/AI). Level mặc định HSK 3.
const URL = "/dev/preview-fixture";
const card = (page: Page, term: string) => page.getByRole("article").filter({ has: page.getByRole("heading", { name: term, exact: true }) });

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("hiện từ vựng và ngữ pháp, ẩn mục dưới level HSK 3 và báo số mục đã ẩn", async ({ page }) => {
  await expect(card(page, "离开")).toBeVisible();
  await expect(card(page, "从来没 + V + 过")).toBeVisible();
  await expect(card(page, "出发")).toHaveCount(0); // HSK 2 < HSK 3
  await expect(page.getByRole("button", { name: /Đã ẩn 1 mục dưới HSK 3/ })).toBeVisible();
  await page.getByRole("button", { name: /Đã ẩn 1 mục/ }).click();
  await expect(card(page, "出发")).toBeVisible();
});

test("đổi level cập nhật danh sách ngay và được nhớ sau khi tải lại", async ({ page }) => {
  await page.getByLabel("Level của bạn").selectOption("5");
  await expect(card(page, "离开")).toHaveCount(0);
  await expect(card(page, "回忆")).toBeVisible();
  await page.reload();
  await expect(card(page, "离开")).toHaveCount(0);
  await expect(page.getByLabel("Level của bạn")).toHaveValue("5");
});

test("lọc theo chip cấp", async ({ page }) => {
  await page.getByRole("button", { name: /^HSK 5 \(/ }).click();
  await expect(card(page, "回忆")).toBeVisible();
  await expect(card(page, "离开")).toHaveCount(0);
});

test("'Đã biết' ẩn thẻ và Hoàn tác đưa lại", async ({ page }) => {
  await card(page, "离开").getByRole("button", { name: "Đã biết" }).click();
  await expect(card(page, "离开")).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Đã ẩn" })).toBeVisible();
  await page.getByRole("status").getByRole("button", { name: "Hoàn tác" }).click();
  await expect(card(page, "离开")).toBeVisible();
});

test("'Lưu' bật/tắt và được nhớ sau khi tải lại", async ({ page }) => {
  const save = card(page, "离开").getByRole("button", { name: /^(Lưu|Đã lưu)$/ });
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(card(page, "离开").getByRole("button", { name: "Đã lưu" })).toHaveAttribute("aria-pressed", "true");
});

test("nghe thử đoạn: khung player hiện rồi tự dừng và ẩn khi hết đoạn", async ({ page }) => {
  // Giả lập YouTube IFrame API để test không phụ thuộc mạng; getCurrentTime lớn hơn cuối đoạn nên đoạn dừng ngay.
  await page.route("https://www.youtube.com/iframe_api", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
        window.__ytCalls = [];
        setTimeout(function () { opts.events.onReady({ target: {
          seekTo: function (s) { window.__ytCalls.push('seek:' + s); }, playVideo: function () { window.__ytCalls.push('play'); },
          pauseVideo: function () { window.__ytCalls.push('pause'); }, setPlaybackRate: function () {},
          getCurrentTime: function () { return 999; }, getPlayerState: function () { return 1; } } }); }, 0);
        this.destroy = function () {};
      } }; window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`,
    }),
  );
  await card(page, "离开").getByRole("button", { name: /Nghe đoạn chứa/ }).click();
  const panel = page.getByRole("region", { name: "Nghe thử đoạn" });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("离开");
  const calls = await page.evaluate(() => (window as unknown as { __ytCalls: string[] }).__ytCalls);
  expect(calls[0]).toBe("seek:4.7"); // đầu câu 5,0 s lùi 0,3 s
  await expect.poll(() => page.evaluate(() => (window as unknown as { __ytCalls: string[] }).__ytCalls.includes("pause"))).toBe(true);
  await expect(panel).toBeHidden();
});

test("báo sai: chọn lý do gửi tới /api/reports", async ({ page }) => {
  let body: unknown;
  await page.route("**/api/reports", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: '{"ok":true}' });
  });
  await card(page, "离开").getByRole("button", { name: /Báo sai thẻ/ }).click();
  await page.getByRole("menuitem", { name: "Sai nghĩa" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cảm ơn" })).toBeVisible();
  expect(body).toMatchObject({ itemId: "vocab:离开", reason: "wrong_meaning", promptVersion: "v1" });
});

test("mobile: nút 'Bắt đầu nghe' dính ở đáy màn hình", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  const cta = page.getByRole("link", { name: /^Bắt đầu nghe \(6 câu\)/ });
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  expect(box!.y + box!.height).toBeGreaterThan(700);
});
