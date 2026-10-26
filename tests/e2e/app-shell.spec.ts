import { expect, test } from "@playwright/test";

// Khung điều hướng mới: 6 mục (Hôm nay · Học · Nghe · Ôn & Nói · Khám phá · Thi đấu), tab bar ở điện thoại, thanh bên ở máy tính bảng/máy tính; mục đang chọn theo cả các trang con.
const MAIN = ["Hôm nay", "Học", "Nghe", "Ôn & Nói", "Khám phá", "Thi đấu"];

test("điện thoại: tab bar dưới có đúng 6 mục và đánh dấu mục đang chọn", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/courses");
  const bar = page.getByRole("navigation", { name: "Điều hướng chính" }).last();
  await expect(bar.getByRole("link")).toHaveCount(6);
  for (const name of MAIN) await expect(bar.getByRole("link", { name })).toBeVisible();
  await expect(bar.getByRole("link", { name: "Học" })).toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole("complementary")).toBeHidden(); // thanh bên chỉ có từ md
});

test("máy tính: thanh bên đánh dấu Nghe ở cả thư viện lẫn danh sách video", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const url of ["/library", "/video"]) {
    await page.goto(url);
    await expect(page.getByRole("complementary").getByRole("link", { name: "Nghe" })).toHaveAttribute("aria-current", "page");
  }
  await expect(page.getByRole("navigation", { name: "Loại nội dung để nghe" }).getByRole("link", { name: "Bài hát" })).toBeVisible();
});

test("công tắc Bài hát | Video chuyển giữa hai trang của khu Nghe", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("navigation", { name: "Loại nội dung để nghe" }).getByRole("link", { name: "Video" }).click();
  await expect(page).toHaveURL(/\/video$/);
});

test("mục Ôn & Nói và Thi đấu đi đúng trang", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/app");
  const side = page.getByRole("complementary");
  await side.getByRole("link", { name: "Ôn & Nói" }).click();
  await expect(page).toHaveURL(/\/review$/);
  await side.getByRole("link", { name: "Thi đấu" }).click();
  await expect(page).toHaveURL(/\/room$/);
  await expect(side.getByRole("link", { name: "Thi đấu" })).toHaveAttribute("aria-current", "page");
});
