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

    const download = page.waitForEvent("download");
    await card.getByRole("button", { name: "Chia sẻ" }).click();
    expect((await download).suggestedFilename()).toBe("lyric-lab-streak.png");

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  } finally {
    await sb.auth.admin.deleteUser(userId);
  }
});
