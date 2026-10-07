import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Tùy chọn email trên Supabase thật: giành quyền gửi chào mừng chỉ một lần, hủy nhận bằng mã, đổi công tắc. Cần đã chạy migration email_prefs;
// tự bỏ qua khi thiếu biến môi trường hoặc chưa có bảng. Xóa tài khoản tạm sau khi chạy.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };

const probe = url && serviceKey ? await createClient(url, serviceKey, opts).from("email_prefs").select("user_id").limit(1) : null;
const enabled = Boolean(probe && !probe.error);

describe.skipIf(!enabled)("tùy chọn email", () => {
  let service: SupabaseClient;
  const userIds: string[] = [];

  beforeAll(() => { service = createClient(url!, serviceKey!, opts); });
  afterAll(async () => { for (const id of userIds) await service?.auth.admin.deleteUser(id); });

  async function newUser() {
    const { data, error } = await createClient(url!, serviceKey!, opts).auth.signInAnonymously();
    if (error || !data.user) throw new Error(`signInAnonymously: ${error?.message}`);
    userIds.push(data.user.id);
    return data.user.id;
  }

  it("tạo hàng mặc định, giành chào mừng đúng một lần (kể cả song song), trả quyền khi lỗi", async () => {
    const { ensurePrefs, claimWelcome, releaseWelcome } = await import("@/lib/email/email-prefs-repo");
    const id = await newUser();
    const prefs = await ensurePrefs(id);
    expect(prefs).toMatchObject({ welcomeSentAt: null, weeklyEnabled: true, reminderEnabled: true });
    expect(prefs.unsubscribeToken).toMatch(/^[a-f0-9]{32}$/);

    const results = await Promise.all([claimWelcome(id), claimWelcome(id), claimWelcome(id)]);
    expect(results.filter(Boolean)).toHaveLength(1);
    await releaseWelcome(id);
    expect(await claimWelcome(id)).toBe(true);
  });

  it("hủy nhận bằng mã tắt cả hai loại; mã sai trả false; đổi công tắc riêng lẻ", async () => {
    const { ensurePrefs, unsubscribeByToken, updatePrefs } = await import("@/lib/email/email-prefs-repo");
    const id = await newUser();
    const { unsubscribeToken } = await ensurePrefs(id);
    expect(await unsubscribeByToken("0".repeat(32))).toBe(false);
    expect(await unsubscribeByToken(unsubscribeToken)).toBe(true);
    expect(await ensurePrefs(id)).toMatchObject({ weeklyEnabled: false, reminderEnabled: false });
    expect(await updatePrefs(id, { weeklyEnabled: true })).toMatchObject({ weeklyEnabled: true, reminderEnabled: false });
  });
});
