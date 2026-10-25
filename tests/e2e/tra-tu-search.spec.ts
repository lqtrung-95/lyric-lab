import { expect, test, type Page } from "@playwright/test";

// Trang Tra từ chạy trên từ điển thật (CC-CEDICT + HSK trong Supabase): chỉ dùng từ cơ bản ổn định như 喜欢, 爱.
async function openSearch(page: Page, url = "/tra-tu") {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => localStorage.clear());
}
const box = (page: Page) => page.getByRole("combobox", { name: /Tra từ/ });

test("gõ pinyin không dấu hiện gợi ý, mũi tên + Enter mở trang chi tiết của từ", async ({ page }) => {
  await openSearch(page);
  await box(page).fill("xihuan");
  const option = page.getByRole("option").filter({ hasText: "喜欢" });
  await expect(option).toBeVisible();
  await expect(option).toContainText("xǐ huan");
  await box(page).press("ArrowDown");
  await box(page).press("Enter");
  await expect(page).toHaveURL(/\/tra-tu\/%E5%96%9C%E6%AC%A2$/);
});

test("Enter không chọn gợi ý thì xem mọi kết quả; tìm bằng Hán Việt, phồn thể và nghĩa tiếng Việt", async ({ page }) => {
  await openSearch(page);
  await box(page).fill("thành thị");
  await box(page).press("Enter");
  await expect(page).toHaveURL(/\/tra-tu\?q=/);
  await expect(page.getByRole("region", { name: "Kết quả tra" }).getByRole("link").first()).toContainText("城市");

  await page.goto("/tra-tu?q=" + encodeURIComponent("愛"));
  await expect(page.getByRole("region", { name: "Kết quả tra" }).getByRole("link").first()).toContainText("爱");

  await page.goto("/tra-tu?q=yeu");
  await expect(page.getByRole("region", { name: "Kết quả tra" })).toContainText("yêu");
});

test("không có kết quả thì báo rõ; lịch sử tra gần đây lưu trên thiết bị và xóa được", async ({ page }) => {
  await openSearch(page);
  await box(page).fill("qzxqzxq");
  await box(page).press("Enter");
  await expect(page.getByText(/Không tìm thấy/)).toBeVisible();

  await page.goto("/tra-tu");
  const recent = page.getByRole("region", { name: "Tra gần đây" });
  await expect(recent.getByRole("link", { name: "qzxqzxq" })).toBeVisible();
  await recent.getByRole("button", { name: "Xóa lịch sử" }).click();
  await expect(recent).toHaveCount(0);
});

test("lối vào Tra từ có trong thanh bên và mở đúng trang", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/app");
  await page.getByRole("link", { name: "Tra từ" }).first().click();
  await expect(page).toHaveURL(/\/tra-tu$/);
  await expect(page.getByRole("heading", { level: 1, name: "Tra từ" })).toBeVisible();
});
