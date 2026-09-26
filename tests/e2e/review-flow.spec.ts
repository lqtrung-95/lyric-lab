import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";

// Luồng ôn trên Supabase thật: Lưu từ (tạo thẻ New) → Ôn tập → lật → chấm → ghi FSRS + nhật ký → hoàn tác.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

test("Lưu → ôn: lật bằng Space, chấm bằng phím 3, ghi FSRS và nhật ký, hoàn tác", async ({ page }) => {
  const sb = serviceClientForTests();
  let userId = "";
  try {
    await page.goto("/dev/preview-fixture");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const saved = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
    await saved.getByRole("button", { name: "Lưu" }).click();
    await expect.poll(async () => {
      const { data } = await sb.from("user_cards").select("user_id").eq("item_key", "vocab:离开").order("created_at", { ascending: false }).limit(1);
      userId = data?.[0]?.user_id ?? "";
      return userId;
    }, { timeout: 15_000 }).not.toBe("");

    await page.goto("/review");
    await expect(page.getByRole("heading", { name: "离开", exact: true })).toBeVisible();
    await expect(page.getByText("Nhớ nghĩa của từ này")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.keyboard.press("Space");
    await expect(page.getByRole("group", { name: "Bạn nhớ từ này thế nào?" })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press("3");

    // Lịch ôn tính theo ngày: thẻ mới chấm "Được" hẹn 5 ngày sau nên rời hàng đợi ngay, buổi ôn kết thúc.
    await expect(page.getByRole("heading", { name: "Xong buổi ôn hôm nay" })).toBeVisible();

    // Ghi Supabase chạy nền sau khi giao diện đã chuyển: chờ tới khi thấy đủ.
    await expect.poll(async () => (await sb.from("user_cards").select("reps").eq("user_id", userId).eq("item_key", "vocab:离开").single()).data?.reps).toBe(1);
    const { data: card } = await sb.from("user_cards").select("state,due,last_review").eq("user_id", userId).eq("item_key", "vocab:离开").single();
    expect(card!.state).toBe(2);
    const days = (Date.parse(card!.due) - Date.parse(card!.last_review!)) / 86_400_000;
    expect(days).toBe(5);
    const logs = await sb.from("review_logs").select("rating").eq("user_id", userId).order("id");
    expect(logs.data?.map((l) => l.rating)).toEqual([3]);

    await page.getByRole("button", { name: /Hoàn tác/ }).click();
    await expect(page.getByRole("heading", { name: "离开", exact: true })).toBeVisible();
    await expect.poll(async () => (await sb.from("review_logs").select("id").eq("user_id", userId)).data?.length).toBe(0);
    await expect.poll(async () => (await sb.from("user_cards").select("reps").eq("user_id", userId).eq("item_key", "vocab:离开").single()).data?.reps).toBe(0);
  } finally {
    if (userId) await sb.auth.admin.deleteUser(userId);
  }
});

test("chưa có thẻ nào: hướng dẫn cách lưu từ", async ({ page }) => {
  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "Chưa có thẻ nào để ôn" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
