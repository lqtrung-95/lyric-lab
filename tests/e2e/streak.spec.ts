import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";
import { seedCards } from "./helpers/seed-cards";

// Chuỗi ngày học trên Supabase thật: hoạt động hôm nay và hôm qua cho chuỗi 2 ngày, thẻ hiện trên trang chủ.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

test("thẻ chuỗi ngày học: đếm hoạt động luyện tập, hiện tuần này và đạt axe", async ({ page }) => {
  const sb = serviceClientForTests();
  const userId = await seedCards(page);
  try {
    await page.goto("/app");
    await expect(page.getByRole("region", { name: "Chuỗi ngày học" })).toContainText("Học một chút hôm nay");

    const at = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();
    for (const d of [0, 1]) {
      await sb.from("practice_scores").insert({ user_id: userId, mode: "pinyin", points: 300, correct: 3, total: 4, duration_sec: 30, played_at: at(d) });
    }
    await page.reload();
    const card = page.getByRole("region", { name: "Chuỗi ngày học" });
    await expect(card).toContainText("2");
    await expect(card).toContainText("Hôm nay bạn đã học rồi");
    await expect(card.getByRole("list", { name: /Tuần này: học/ })).toBeVisible();

    // Desktop: nút Chia sẻ mở popup có xem trước ảnh, nút các mạng xã hội và sao chép link (điện thoại dùng share sheet của hệ điều hành).
    await card.getByRole("button", { name: "Chia sẻ" }).click();
    const dialog = page.getByRole("dialog", { name: "Chia sẻ chuỗi ngày học" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Sao chép link" })).toBeVisible();
    await dialog.getByRole("button", { name: "Đóng" }).click();
    await expect(dialog).toBeHidden();

    // Gọn ở cả hai cỡ màn hình: không tràn ngang, không quá cao, nút chia sẻ vẫn bấm được.
    const heights: Record<string, number> = {};
    for (const [name, size] of [["mobile", { width: 390, height: 800 }], ["desktop", { width: 1280, height: 800 }]] as const) {
      await page.setViewportSize(size);
      heights[name] = (await card.boundingBox())!.height;
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await expect(card.getByRole("button", { name: "Chia sẻ" })).toBeVisible();
    }
    expect(heights.mobile).toBeLessThan(330);
    expect(heights.desktop).toBeLessThan(240);

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  } finally {
    await sb.auth.admin.deleteUser(userId);
  }
});
