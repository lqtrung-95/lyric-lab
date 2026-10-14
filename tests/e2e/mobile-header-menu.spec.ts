import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Điện thoại và máy tính bảng (dưới 1280px, gồm iPad Pro 13 dọc 1032px): thanh trên chỉ còn logo, Cộng đồng và nút Menu; các lối vào phụ nằm trong bảng Menu. Màn rộng từ 1280px: giữ nguyên từng icon, không có nút Menu.
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

test.describe("máy tính bảng", () => {
  for (const [width, height] of [[1032, 1376], [820, 1180], [1180, 820]]) {
    test(`iPad ${width}px: thanh điều hướng không xuống dòng chữ, icon phụ gom vào Menu, bảng Menu mở được`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/app");
      const header = page.getByRole("banner");
      // Mỗi mục điều hướng nằm gọn một dòng (chiều cao = vùng bấm tối thiểu, không bị chữ xuống dòng làm cao lên).
      for (const name of ["Trang chủ", "Thi đấu", "Video", "Thư viện"]) {
        const box = (await header.getByRole("link", { name, exact: true }).boundingBox())!;
        expect(box.height, `${name} bị xuống dòng`).toBeLessThanOrEqual(48);
      }
      for (const name of ["Công cụ", "Bảng xếp hạng", "Góp ý cho SongHanzi", "Cài đặt và tài khoản"]) await expect(header.getByRole("link", { name })).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await header.getByRole("button", { name: "Menu" }).click();
      const sheet = page.getByRole("dialog", { name: "Menu" });
      await expect(sheet.getByRole("link", { name: "Cài đặt và tài khoản" })).toBeVisible();
      const sheetBox = (await sheet.boundingBox())!;
      expect(sheetBox.width).toBeLessThan(width); // trên iPad bảng không trải hết bề ngang
    });
  }
});
