import { expect, test } from "@playwright/test";

test("trang chủ hiển thị tiêu đề và điều hướng chính", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("nhớ cả trăm chữ Hán");
  await expect(page.getByRole("link", { name: "Lyric Lab" })).toBeVisible();
});

test("giao diện tối bật được và được nhớ sau khi tải lại", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Chuyển sang giao diện tối" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("trang bài học đặt noindex", async ({ page }) => {
  await page.goto("/learn/dQw4w9WgXcQ");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
