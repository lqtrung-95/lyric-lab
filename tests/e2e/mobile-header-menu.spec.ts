import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Điện thoại: thanh trên chỉ còn logo, Cộng đồng và nút Menu; các lối vào phụ nằm trong bảng Menu. Máy tính: giữ nguyên từng icon, không có nút Menu.
test.describe("điện thoại 375px", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("thanh trên gọn, Menu mở ra bảng có chữ và đi đúng trang", async ({ page }) => {
    await page.goto("/app");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: /Cộng đồng/ })).toBeVisible();
    await expect(header.getByRole("link", { name: "Công cụ" })).toBeHidden();
    await expect(header.getByRole("link", { name: "Bảng xếp hạng" })).toBeHidden();
    await expect(header.getByRole("link", { name: "Góp ý cho SongHanzi" })).toBeHidden();
    // Không tràn ngang: nút cuối nằm trong màn hình.
    const menu = header.getByRole("button", { name: "Menu" });
    const box = (await menu.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(375);
    expect(box.width).toBeGreaterThanOrEqual(44);

    await menu.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    for (const name of ["Công cụ", "Bảng xếp hạng", "Góp ý cho SongHanzi", "Cài đặt và tài khoản"]) await expect(sheet.getByRole("link", { name })).toBeVisible();
    expect((await new AxeBuilder({ page }).include("dialog").analyze()).violations).toEqual([]);

    await sheet.getByRole("link", { name: "Công cụ" }).click();
    await expect(page).toHaveURL(/\/cong-cu$/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });

  test("Esc và nút Đóng đều đóng bảng; đổi giao diện sáng/tối trong menu", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
    await page.getByRole("button", { name: "Menu" }).click();
    const html = page.locator("html");
    const before = await html.evaluate((el) => el.classList.contains("dark"));
    await page.getByRole("dialog", { name: "Menu" }).getByRole("button", { name: /Chuyển sang giao diện/ }).click();
    expect(await html.evaluate((el) => el.classList.contains("dark"))).toBe(!before);
    await page.getByRole("button", { name: "Đóng menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });
});

test("máy tính: đủ icon trên thanh trên, không có nút Menu", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/app");
  const header = page.getByRole("banner");
  for (const name of ["Công cụ", "Bảng xếp hạng", "Góp ý cho SongHanzi", "Cài đặt và tài khoản"]) await expect(header.getByRole("link", { name })).toBeVisible();
  await expect(header.getByRole("button", { name: "Menu" })).toBeHidden();
});
