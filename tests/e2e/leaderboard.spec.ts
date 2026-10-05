import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";

// Bảng xếp hạng trên Supabase thật: tham gia bằng biệt danh, trùng tên bị chặn, điểm hiện đúng hạng, rời bảng.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

test("tham gia, trùng biệt danh, lên bảng, rời bảng", async ({ page }) => {
  const sb = serviceClientForTests();
  const tag = Math.random().toString(36).slice(2, 7);
  const nick = `E2E${tag}`;
  // Ba đối thủ có điểm cao hơn: người dùng test xếp hạng #4 nên nằm trong danh sách (3 hạng đầu hiện ở bục, không nằm trong danh sách "từ #4").
  // Test không phụ thuộc số người đang có điểm trong tuần thật (đầu tuần có thể rất ít).
  const rivalIds: string[] = [];
  for (const [i, name] of [`Rival${tag}`, `Riv2${tag}`, `Riv3${tag}`].entries()) {
    const { data } = await sb.auth.admin.createUser({ email: `e2e-lb-${tag}-${i}@example.test`, email_confirm: true });
    rivalIds.push(data.user!.id);
    await sb.from("leaderboard_profiles").insert({ user_id: data.user!.id, nickname: name, opted_in: true });
    await sb.from("practice_scores").insert({ user_id: data.user!.id, mode: "pinyin", points: 5900 - i * 100, correct: 10, total: 10, duration_sec: 60 });
  }
  let myId = "";
  try {
    await page.goto("/review/leaderboard");
    await expect(page.getByRole("heading", { name: "Bảng xếp hạng", level: 1 })).toBeVisible();

    const input = page.getByLabel(/Biệt danh hiển thị/);
    await input.fill(`rival${tag}`);
    await page.getByRole("button", { name: "Tham gia" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /Biệt danh/ })).toBeVisible();

    await input.fill("a");
    await page.getByRole("button", { name: "Tham gia" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /Biệt danh/ })).toBeVisible();

    await input.fill(nick);
    await page.getByRole("button", { name: "Tham gia" }).click();
    await expect(page.getByText(`Bạn đang tham gia với biệt danh`)).toBeVisible();

    ({ data: { user_id: myId } = { user_id: "" } } = (await sb.from("leaderboard_profiles").select("user_id").eq("nickname", nick).single()) as { data: { user_id: string } });
    await sb.from("practice_scores").insert({ user_id: myId, mode: "cloze", points: 5200, correct: 10, total: 10, duration_sec: 60 });
    await page.reload();
    const rows = page.getByRole("list", { name: "Xếp hạng" }).getByRole("listitem");
    await expect(rows.filter({ hasText: nick })).toHaveAttribute("aria-current", "true");
    await expect(page.getByText(`Rival${tag}`).first()).toBeVisible(); // đối thủ hạng 1 nằm ở bục

    await page.getByRole("tab", { name: "Mọi thời gian" }).click();
    await expect(rows.filter({ hasText: nick })).toBeVisible();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);

    await page.getByRole("button", { name: "Rời bảng xếp hạng" }).click();
    await expect(page.getByRole("button", { name: "Tham gia" })).toBeVisible();
    await expect(rows.filter({ hasText: nick })).toHaveCount(0);
  } finally {
    for (const id of rivalIds) await sb.auth.admin.deleteUser(id);
    if (myId) await sb.auth.admin.deleteUser(myId);
  }
});
