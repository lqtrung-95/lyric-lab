import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Cần đã chạy migration bảng xếp hạng; tự bỏ qua khi thiếu biến môi trường.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };
const tag = Math.random().toString(36).slice(2, 7);

describe.skipIf(!enabled)("bảng xếp hạng", () => {
  let service: SupabaseClient;
  let anon: SupabaseClient;
  const ids: string[] = [];

  async function makeUser(nick: string | null, opts2: { hidden?: boolean; scores: { points: number; daysAgo?: number }[] }) {
    const { data, error } = await service.auth.admin.createUser({ email: `lb-${tag}-${ids.length}@example.test`, email_confirm: true });
    if (error) throw error;
    const id = data.user.id;
    ids.push(id);
    if (nick) await service.from("leaderboard_profiles").insert({ user_id: id, nickname: nick, opted_in: true, hidden: opts2.hidden ?? false });
    for (const s of opts2.scores) {
      await service.from("practice_scores").insert({ user_id: id, mode: "pinyin", points: s.points, correct: 5, total: 10, duration_sec: 60, played_at: new Date(Date.now() - (s.daysAgo ?? 0) * 86400000).toISOString() });
    }
    return id;
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, opts);
    anon = createClient(url!, anonKey!, opts);
    await makeUser(`Top${tag}`, { scores: [{ points: 5500 }, { points: 100 }] });
    await makeUser(`Old${tag}`, { scores: [{ points: 5990, daysAgo: 30 }] });
    await makeUser(`Hid${tag}`, { hidden: true, scores: [{ points: 5999 }] });
    await makeUser(null, { scores: [{ points: 5999 }] });
  });

  afterAll(async () => {
    for (const id of ids) await service.auth.admin.deleteUser(id);
  });

  const top = async (scope: string) => (await service.rpc("leaderboard_top", { p_scope: scope, p_limit: 500 })).data as { nickname: string; points: number }[];

  it("chỉ người tham gia và không bị ẩn xuất hiện", async () => {
    const names = (await top("all")).map((r) => r.nickname);
    expect(names).toContain(`Top${tag}`);
    expect(names).not.toContain(`Hid${tag}`);
  });

  it("bảng tuần bỏ điểm cũ, bảng mọi thời gian giữ", async () => {
    expect((await top("week")).map((r) => r.nickname)).not.toContain(`Old${tag}`);
    expect((await top("all")).map((r) => r.nickname)).toContain(`Old${tag}`);
  });

  it("biệt danh không phân biệt hoa thường", async () => {
    const id = await makeUser(null, { scores: [] });
    const { error } = await service.from("leaderboard_profiles").insert({ user_id: id, nickname: `top${tag}`.toUpperCase(), opted_in: true });
    expect(error?.code).toBe("23505");
  });

  it("client không đọc được bảng hay gọi hàm", async () => {
    expect((await anon.from("practice_scores").select("*")).data ?? []).toEqual([]);
    expect((await anon.from("leaderboard_profiles").select("*")).data ?? []).toEqual([]);
    expect((await anon.rpc("leaderboard_top", { p_scope: "all", p_limit: 5 })).error).not.toBeNull();
  });
});
