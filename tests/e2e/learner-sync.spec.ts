import { expect, test } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";

// Đồng bộ trạng thái học với Supabase thật: phiên ẩn danh tự tạo, thẻ "Lưu" ghi vào user_cards,
// và khôi phục được sau khi xóa localStorage (giữ cookie phiên). Dọn tài khoản ẩn danh sau khi chạy.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

test("Lưu ghi thẻ lên Supabase và khôi phục sau khi xóa localStorage", async ({ page }) => {
  const sb = serviceClientForTests();
  let userId = "";
  try {
    await page.goto("/dev/preview-fixture");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
    await card.getByRole("button", { name: "Lưu" }).click();

    await expect.poll(async () => {
      const { data } = await sb.from("user_cards").select("user_id,meaning,state,reps").eq("item_key", "vocab:离开").order("created_at", { ascending: false }).limit(1);
      userId = data?.[0]?.user_id ?? "";
      return data?.[0]?.meaning ? { state: data[0].state, reps: data[0].reps } : null;
    }, { timeout: 15_000 }).toEqual({ state: 0, reps: 0 });

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(card.getByRole("button", { name: "Đã lưu" })).toBeVisible({ timeout: 15_000 });
  } finally {
    if (userId) await sb.auth.admin.deleteUser(userId);
  }
});
