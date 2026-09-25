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

    // Thẻ mới chấm "Được" sang bước học (hẹn lại vài phút) nên còn quay lại trong buổi; chấm "Dễ" để kết thúc.
    await expect(page.getByRole("heading", { name: "离开", exact: true })).toBeVisible();
    await page.keyboard.press("Space");
    await page.keyboard.press("4");
    await expect(page.getByRole("heading", { name: "Xong buổi ôn hôm nay" })).toBeVisible();

    const { data: card } = await sb.from("user_cards").select("state,reps").eq("user_id", userId).eq("item_key", "vocab:离开").single();
    expect(card).toMatchObject({ reps: 2 });
    expect(card!.state).toBeGreaterThan(0);
    const logs = await sb.from("review_logs").select("rating").eq("user_id", userId).order("id");
    expect(logs.data?.map((l) => l.rating)).toEqual([3, 4]);

    await page.getByRole("button", { name: /Hoàn tác/ }).click();
    await expect(page.getByRole("heading", { name: "离开", exact: true })).toBeVisible();
    await expect.poll(async () => (await sb.from("review_logs").select("id").eq("user_id", userId)).data?.length).toBe(1);
  } finally {
    if (userId) await sb.auth.admin.deleteUser(userId);
  }
});

test("chưa có thẻ nào: hướng dẫn cách lưu từ", async ({ page }) => {
  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "Chưa có thẻ nào để ôn" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
