import { expect, test } from "@playwright/test";

// Công tắc âm thanh hiệu ứng ở Cài đặt: mặc định theo thiết bị (máy tính bật, điện thoại tắt), đổi được và nhớ lại sau khi tải lại.
test("máy tính: âm thanh hiệu ứng mặc định bật, tắt được và nhớ lựa chọn", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/settings?tab=learning");
  const sw = page.getByRole("switch", { name: "Âm thanh hiệu ứng" });
  await expect(sw).toHaveAttribute("aria-checked", "true");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await page.reload();
  await expect(page.getByRole("switch", { name: "Âm thanh hiệu ứng" })).toHaveAttribute("aria-checked", "false");
});

test("điện thoại: âm thanh hiệu ứng mặc định tắt", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" });
  const page = await ctx.newPage();
  await page.goto("/settings?tab=learning");
  await expect(page.getByRole("switch", { name: "Âm thanh hiệu ứng" })).toHaveAttribute("aria-checked", "false");
  await ctx.close();
});
