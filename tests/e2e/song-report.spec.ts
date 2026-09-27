import { expect, test } from "@playwright/test";
import { E2E_VIDEO_ID, hasSupabaseEnv, removeFixtureSong, seedFixtureSong, serviceClientForTests } from "./helpers/seed-analysis";

// Báo cả bài sai trên Supabase thật: ghi báo cáo, mỗi người một lần, đủ 3 người thì bài bị ẩn khỏi Khám phá.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

test("báo bài sai: ghi lý do, báo lại chỉ cập nhật, người thứ 3 làm bài bị ẩn", async ({ page }) => {
  const sb = serviceClientForTests();
  await seedFixtureSong();
  await sb.from("songs").update({ listed: true }).eq("video_id", E2E_VIDEO_ID);
  const others: string[] = [];
  try {
    for (let i = 0; i < 2; i++) {
      const { data } = await sb.auth.admin.createUser({ email: `e2e-sr-${Date.now()}-${i}@example.test`, email_confirm: true });
      others.push(data.user!.id);
      await sb.from("song_reports").insert({ video_id: E2E_VIDEO_ID, user_id: data.user!.id, reason: "not_a_song" });
    }
    await page.goto(`/learn/${E2E_VIDEO_ID}`);
    await page.getByRole("button", { name: "Báo bài này sai" }).click();
    await page.getByRole("button", { name: "Lời không khớp với video" }).click();
    await expect(page.getByText("Cảm ơn bạn đã báo")).toBeVisible();

    const { data: rows } = await sb.from("song_reports").select("reason").eq("video_id", E2E_VIDEO_ID);
    expect(rows).toHaveLength(3);
    expect(rows!.filter((r) => r.reason === "lyrics_mismatch")).toHaveLength(1);
    const { data: song } = await sb.from("songs").select("listed").eq("video_id", E2E_VIDEO_ID).single();
    expect(song!.listed).toBe(false);
  } finally {
    await removeFixtureSong();
    for (const id of others) await sb.auth.admin.deleteUser(id);
    // người dùng ẩn danh của trang cũng bị dọn cascade khi bài bị xóa; phiên tạm để lại không ảnh hưởng dữ liệu
  }
});
