import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";
import { seedCards } from "./helpers/seed-cards";

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

test("nút 'Hoàn tác' căn giữa ở màn kết thúc buổi ôn", async ({ page }) => {
  const sb = serviceClientForTests();
  let userId = "";
  try {
    await page.goto("/dev/preview-fixture");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
    await card.getByRole("button", { name: "Lưu" }).click();
    await expect.poll(async () => {
      const { data } = await sb.from("user_cards").select("user_id").eq("item_key", "vocab:离开").order("created_at", { ascending: false }).limit(1);
      userId = data?.[0]?.user_id ?? "";
      return userId;
    }, { timeout: 15_000 }).not.toBe("");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/review");
    await expect(page.getByRole("heading", { name: "离开", exact: true })).toBeVisible(); // đợi thẻ tải xong rồi mới bấm phím
    await page.keyboard.press("Space");
    await page.keyboard.press("3");
    await expect(page.getByRole("heading", { name: "Xong buổi ôn hôm nay" })).toBeVisible();
    const undo = await page.getByRole("button", { name: /Hoàn tác/ }).boundingBox();
    const message = await page.getByRole("heading", { name: "Xong buổi ôn hôm nay" }).boundingBox();
    const centerX = (b: { x: number; width: number }) => b.x + b.width / 2;
    expect(Math.abs(centerX(undo!) - centerX(message!))).toBeLessThanOrEqual(2);
  } finally {
    if (userId) await sb.auth.admin.deleteUser(userId);
  }
});

test("hết hạn mức thẻ mới: nói rõ còn bao nhiêu thẻ đang chờ và cho học thêm ngay", async ({ page }) => {
  const sb = serviceClientForTests();
  const userId = await seedCards(page);
  try {
    // Hạn mức 2 thẻ mới/ngày và đã học đủ 2 thẻ hôm nay → 4 thẻ mới còn lại phải chờ.
    await sb.from("user_profiles").upsert({ user_id: userId, new_cards_per_day: 2 });
    const { data: cards } = await sb.from("user_cards").select("item_key,due,stability,difficulty,elapsed_days,scheduled_days,learning_steps,reps,lapses,state,last_review").eq("user_id", userId).order("created_at").limit(2);
    for (const c of cards!) {
      await sb.from("review_logs").insert({ user_id: userId, item_key: c.item_key, rating: 3, state: 0, due: c.due, stability: 0, difficulty: 0, elapsed_days: 0, scheduled_days: 5 });
      await sb.from("user_cards").update({ state: 2, reps: 1, stability: 5, difficulty: 5, scheduled_days: 5, due: new Date(Date.now() + 5 * 86_400_000).toISOString(), last_review: new Date().toISOString() }).eq("user_id", userId).eq("item_key", c.item_key);
    }
    await page.goto("/review");
    await expect(page.getByRole("heading", { name: "Bạn đã học đủ thẻ mới hôm nay" })).toBeVisible();
    await expect(page.getByText("Hôm nay bạn đã học 2/2 thẻ mới")).toBeVisible();
    await expect(page.getByText("Còn 4 thẻ mới đang chờ")).toBeVisible();
    await expect(page.getByRole("link", { name: "Đổi hạn mức mỗi ngày" })).toHaveAttribute("href", "/settings");
    await page.getByRole("button", { name: "Học thêm 4 thẻ mới" }).click();
    await expect(page.getByText("Còn 4 thẻ")).toBeVisible(); // hàng đợi có đủ 4 thẻ
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  } finally {
    await sb.auth.admin.deleteUser(userId);
  }
});
