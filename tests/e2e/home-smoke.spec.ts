import { expect, test } from "@playwright/test";

test("trang chủ hiển thị tên sản phẩm", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lyric Lab" })).toBeVisible();
});

test("trang bài học đặt noindex", async ({ page }) => {
  await page.goto("/learn/dQw4w9WgXcQ");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
