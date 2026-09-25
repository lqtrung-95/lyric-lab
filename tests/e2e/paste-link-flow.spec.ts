import { expect, test } from "@playwright/test";

test("link sai báo lỗi ngay dưới ô nhập, không rời trang chủ", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Dán link YouTube của bài hát").fill("không phải link");
  await page.getByRole("button", { name: "Phân tích bài hát" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Link chưa đúng" })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("link đúng chuyển sang trang bài học và hiện lỗi 'không có lời' khi server báo", async ({ page }) => {
  // Giả lập luồng SSE để test không phụ thuộc YouTube/Groq.
  await page.route("**/api/analyze/**", (route) =>
    route.fulfill({
      contentType: "text/event-stream",
      body: 'event: meta\ndata: {"title":"Bài mẫu","channelTitle":"Kênh mẫu","durationSec":30}\n\nevent: error\ndata: {"code":"no_lyrics"}\n\n',
    }),
  );
  await page.goto("/");
  await page.getByLabel("Dán link YouTube của bài hát").fill("https://youtu.be/dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Phân tích bài hát" }).click();
  await expect(page).toHaveURL(/\/learn\/dQw4w9WgXcQ$/);
  await expect(page.getByRole("heading", { name: "Bài mẫu" })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "Chưa tìm được lời" })).toBeVisible();
  await page.getByRole("link", { name: "Dán link khác" }).click();
  await expect(page).toHaveURL(/\/$/);
});
