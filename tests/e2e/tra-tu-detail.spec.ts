import { expect, test } from "@playwright/test";

// Trang chi tiết từ trên từ điển thật; chỉ dùng từ cơ bản ổn định (爱, 的).
test("đầu trang chi tiết: chữ Hán lớn, pinyin, phồn thể, Hán Việt, HSK, nghĩa tiếng Việt đã duyệt và nghĩa Anh", async ({ page }) => {
  await page.goto("/tra-tu/" + encodeURIComponent("爱"));
  await expect(page.getByRole("heading", { level: 1, name: "爱" })).toBeVisible();
  const head = page.getByRole("region", { name: "Từ 爱" });
  await expect(head).toContainText("ài");
  await expect(head).toContainText("愛");
  await expect(head).toContainText("ái");
  await expect(head).toContainText("HSK 1");
  await expect(head.getByRole("button", { name: /Nghe phát âm 爱/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Nghĩa tiếng Việt" })).toContainText("yêu");
  await expect(page.getByRole("region", { name: "Nghĩa tiếng Anh" })).toContainText("to love");
});

test("từ nhiều âm hiện mỗi cách đọc một khối, cách đọc thông dụng (de) đứng đầu", async ({ page }) => {
  await page.goto("/tra-tu/" + encodeURIComponent("的"));
  await expect(page.getByRole("region", { name: "Từ 的" })).toContainText(/^[\s\S]*de · /);
  const headings = page.getByRole("region", { name: "Nghĩa tiếng Anh" }).getByRole("heading", { level: 3 });
  await expect(headings.first()).toContainText("de");
  expect(await headings.count()).toBeGreaterThan(1);
});

test("nút Lưu thẻ ôn bật/tắt được khi từ có câu thật làm nguồn", async ({ page }) => {
  await page.goto("/tra-tu/" + encodeURIComponent("爱"));
  await page.waitForLoadState("networkidle");
  const save = page.getByRole("button", { name: /thẻ ôn/ });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await expect(save).toContainText("Đã lưu thẻ ôn");
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "false");
});

test("đường dẫn không phải từ trong từ điển chuyển sang tìm kiếm", async ({ page }) => {
  await page.goto("/tra-tu/xihuan");
  await expect(page).toHaveURL(/\/tra-tu\?q=xihuan/);
  await expect(page.getByRole("region", { name: "Kết quả tra" })).toContainText("喜欢");
});
