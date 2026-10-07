import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Danh sách và xử lý báo cáo bài hát trên Supabase thật, với bài hư cấu tạm và hai tài khoản ẩn danh tạm. Tự bỏ qua khi thiếu biến môi trường.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && serviceKey);
const VIDEO = "reportadm01";

describe.skipIf(!enabled)("báo cáo bài hát (quản trị)", () => {
  let sb: SupabaseClient;
  const users: string[] = [];

  beforeAll(async () => {
    sb = createClient(url!, serviceKey!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
    await sb.from("songs").upsert({ video_id: VIDEO, title: "Bài thử báo cáo", channel_title: "k", duration_sec: 10, listed: false });
    for (let i = 0; i < 2; i++) {
      const { data } = await createClient(url!, serviceKey!, { auth: { persistSession: false }, realtime: { transport: ws as never } }).auth.signInAnonymously();
      users.push(data.user!.id);
    }
    await sb.from("song_reports").insert([{ video_id: VIDEO, user_id: users[0], reason: "lyrics_mismatch" }, { video_id: VIDEO, user_id: users[1], reason: "not_a_song" }]);
  });
  afterAll(async () => {
    await sb?.from("songs").delete().eq("video_id", VIDEO);
    for (const id of users) await sb?.auth.admin.deleteUser(id);
  });

  it("gộp báo cáo theo bài kèm trạng thái ẩn, rồi xóa khi đã xử lý", async () => {
    const { listReportedSongs, dismissSongReports } = await import("@/lib/admin/song-reports");
    const [song] = await listReportedSongs(VIDEO);
    expect(song).toMatchObject({ videoId: VIDEO, title: "Bài thử báo cáo", hidden: true, total: 2, byReason: { lyrics_mismatch: 1, not_a_song: 1 } });
    expect((await listReportedSongs()).some((s) => s.videoId === VIDEO)).toBe(true);
    expect(await dismissSongReports(VIDEO)).toBe(2);
    expect(await listReportedSongs(VIDEO)).toEqual([]);
  });
});
