import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";

// Bảng xếp hạng trên Supabase thật: tham gia bằng biệt danh, trùng tên bị chặn, điểm hiện đúng hạng, rời bảng.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

test("tham gia, trùng biệt danh, lên bảng, rời bảng", async ({ page }) => {
  const sb = serviceClientForTests();
  const tag = Math.random().toString(36).slice(2, 7);
  const nick = `E2E${tag}`;
  const { data: other } = await sb.auth.admin.createUser({ email: `e2e-lb-${tag}@example.test`, email_confirm: true });
  const otherId = other.user!.id;
  let myId = "";
  try {
    await sb.from("leaderboard_profiles").insert({ user_id: otherId, nickname: `Rival${tag}`, opted_in: true });
    await sb.from("practice_scores").insert({ user_id: otherId, mode: "pinyin", points: 5000, correct: 10, total: 10, duration_sec: 60 });

    await page.goto("/review/leaderboard");
    await expect(page.getByRole("heading", { name: "Bảng xếp hạng", level: 1 })).toBeVisible();

    const input = page.getByLabel(/Biệt danh hiển thị/);
    await input.fill(`rival${tag}`);
    await page.getByRole("button", { name: "Tham gia" }).click();
    await expect(page.locator("#nickname-error")).toBeVisible();

    await input.fill("a");
    await page.getByRole("button", { name: "Tham gia" }).click();
    await expect(page.locator("#nickname-error")).toBeVisible();

    await input.fill(nick);
    await page.getByRole("button", { name: "Tham gia" }).click();
    await expect(page.getByText(`Bạn đang tham gia với biệt danh`)).toBeVisible();

    ({ data: { user_id: myId } = { user_id: "" } } = (await sb.from("leaderboard_profiles").select("user_id").eq("nickname", nick).single()) as { data: { user_id: string } });
    await sb.from("practice_scores").insert({ user_id: myId, mode: "cloze", points: 5200, correct: 10, total: 10, duration_sec: 60 });
    await page.reload();
    const rows = page.getByRole("list", { name: "Xếp hạng" }).getByRole("listitem");
    await expect(rows.filter({ hasText: nick })).toHaveAttribute("aria-current", "true");
    await expect(rows.filter({ hasText: `Rival${tag}` })).toBeVisible();

    await page.getByRole("tab", { name: "Mọi thời gian" }).click();
    await expect(rows.filter({ hasText: nick })).toBeVisible();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);

    await page.getByRole("button", { name: "Rời bảng xếp hạng" }).click();
    await expect(page.getByRole("button", { name: "Tham gia" })).toBeVisible();
    await expect(rows.filter({ hasText: nick })).toHaveCount(0);
  } finally {
    await sb.auth.admin.deleteUser(otherId);
    if (myId) await sb.auth.admin.deleteUser(myId);
  }
});
