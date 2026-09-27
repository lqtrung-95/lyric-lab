import { expect, test } from "@playwright/test";

// Các nút neo trên trang giới thiệu cuộn mượt; người bật "giảm chuyển động" thì cuộn tức thì.
const scrollBehavior = (page: import("@playwright/test").Page) => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);

test("bấm 'Tính năng' và 'Hỏi đáp' cuộn mượt tới đúng phần", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?landing");
  expect(await scrollBehavior(page)).toBe("smooth");
  await page.getByRole("navigation", { name: "Các phần của trang" }).getByRole("link", { name: "Hỏi đáp" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await expect(page.locator("#faq")).toBeInViewport();
  await page.getByRole("navigation", { name: "Các phần của trang" }).getByRole("link", { name: "Tính năng" }).click();
  await expect(page.locator("#features")).toBeInViewport();
});

test("giảm chuyển động: cuộn tức thì", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?landing");
  expect(await scrollBehavior(page)).toBe("auto");
});

test("nội dung mới có mặt: luyện tập, tìm bài, xếp hạng", async ({ page }) => {
  await page.goto("/?landing");
  await expect(page.getByRole("heading", { name: "Biến từ đã lưu thành phản xạ" })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Tìm bài bằng tên hoặc nghệ sĩ" })).toBeAttached();
  await expect(page.getByText("Bảng xếp hạng có lộ thông tin cá nhân không?")).toBeAttached();
});
