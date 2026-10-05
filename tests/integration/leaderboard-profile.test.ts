import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Biệt danh dùng chung (phòng thi đấu + bảng xếp hạng) và việc tham gia bảng xếp hạng là hai thứ riêng, trên Supabase thật.
// Tự bỏ qua khi thiếu biến môi trường; xóa tài khoản tạm sau khi chạy.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && serviceKey && process.env.GROQ_API_KEY && process.env.YOUTUBE_DATA_API_KEY);
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };

describe.skipIf(!enabled)("hồ sơ: biệt danh dùng chung và tham gia bảng xếp hạng", () => {
  let service: SupabaseClient;
  const ids: string[] = [];
  const tag = String(Date.now() % 1_000_000);

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, opts);
    for (let i = 0; i < 2; i++) {
      const signer = createClient(url!, serviceKey!, opts); // client riêng: phiên ẩn danh không được gắn vào `service`
      const { data, error } = await signer.auth.signInAnonymously();
      if (error || !data.user) throw new Error(`signInAnonymously: ${error?.message}`);
      ids.push(data.user.id);
    }
  });
  afterAll(async () => {
    for (const id of ids) await service.auth.admin.deleteUser(id);
  });

  const row = async (id: string) => (await service.from("leaderboard_profiles").select("nickname, opted_in").eq("user_id", id).maybeSingle()).data;

  it("chỉ đặt biệt danh: tạo hồ sơ CHƯA tham gia bảng (không tự công khai điểm); đổi tên giữ nguyên trạng thái", async () => {
    const { saveProfile } = await import("@/lib/leaderboard/profile-repo");
    expect(await saveProfile(ids[0], { nickname: `Linh${tag}` })).toBe("ok");
    expect(await row(ids[0])).toEqual({ nickname: `Linh${tag}`, opted_in: false });
    expect(await saveProfile(ids[0], { nickname: `Linh2${tag}` })).toBe("ok");
    expect(await row(ids[0])).toEqual({ nickname: `Linh2${tag}`, opted_in: false });
  });

  it("tham gia bảng bằng biệt danh sẵn có (không cần nhập lại), đổi tên không làm rời bảng, rời bảng giữ biệt danh", async () => {
    const { saveProfile } = await import("@/lib/leaderboard/profile-repo");
    expect(await saveProfile(ids[0], { optedIn: true })).toBe("ok");
    expect(await row(ids[0])).toEqual({ nickname: `Linh2${tag}`, opted_in: true });
    expect(await saveProfile(ids[0], { nickname: `Linh3${tag}` })).toBe("ok");
    expect(await row(ids[0])).toEqual({ nickname: `Linh3${tag}`, opted_in: true });
    expect(await saveProfile(ids[0], { optedIn: false })).toBe("ok");
    expect(await row(ids[0])).toEqual({ nickname: `Linh3${tag}`, opted_in: false });
  });

  it("tham gia bảng khi chưa có biệt danh thì cần biệt danh; biệt danh kèm optedIn tạo hồ sơ đã tham gia", async () => {
    const { saveProfile } = await import("@/lib/leaderboard/profile-repo");
    expect(await saveProfile(ids[1], { optedIn: true })).toBe("nickname_required");
    expect(await row(ids[1])).toBeNull();
    expect(await saveProfile(ids[1], { optedIn: true, nickname: `Minh${tag}` })).toBe("ok");
    expect(await row(ids[1])).toEqual({ nickname: `Minh${tag}`, opted_in: true });
  });

  it("biệt danh duy nhất không phân biệt hoa thường; tên sai định dạng bị từ chối", async () => {
    const { saveProfile } = await import("@/lib/leaderboard/profile-repo");
    expect(await saveProfile(ids[0], { nickname: `MINH${tag}` })).toBe("taken");
    expect(await row(ids[0])).toMatchObject({ nickname: `Linh3${tag}` }); // không đổi khi bị trùng
    expect(await saveProfile(ids[0], { nickname: "ab" })).toBe("too_short");
    expect(await saveProfile(ids[0], { nickname: "tên<script>" })).toBe("invalid_chars");
  });
});
