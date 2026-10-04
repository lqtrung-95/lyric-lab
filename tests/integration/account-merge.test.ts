import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Gộp tài khoản ẩn danh vào tài khoản đã đăng nhập, và xóa dữ liệu, trên Supabase thật.
// Cần đã chạy migration account_merge_tokens và bật Anonymous sign-ins. Tự bỏ qua khi thiếu biến môi trường.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };

describe.skipIf(!enabled)("gộp tài khoản và xóa dữ liệu", () => {
  let service: SupabaseClient;
  let anonId = "";
  let memberId = "";
  let videoId = "";
  const nickname = `mt${Date.now()}`.slice(0, 20);
  const created: string[] = [];

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, opts);
    // Khóa service role không bị chặn bởi captcha (dự án đã bật cho luồng công khai); nạp phiên vào client anon key
    // để request thật sự chịu RLS, đồng thời giữ đúng is_anonymous:true mà luồng gộp tài khoản cần.
    // Đăng nhập ẩn danh bằng client RIÊNG: supabase-js gắn phiên vừa tạo vào client gọi nó, nên nếu dùng `service` thì
    // mọi request sau đó chạy với quyền của người ẩn danh thay vì service role.
    const signer = createClient(url!, serviceKey!, opts);
    const { data, error } = await signer.auth.signInAnonymously();
    if (error || !data.user || !data.session) throw new Error(`signInAnonymously: ${error?.message}`);
    const anon = createClient(url!, anonKey!, opts);
    await anon.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
    anonId = data.user.id;
    const member = await service.auth.admin.createUser({ email: `merge-test-${Date.now()}@example.test`, email_confirm: true });
    memberId = member.data.user!.id;
    created.push(anonId, memberId);
    await service.from("user_cards").insert({ user_id: anonId, item_key: "vocab:词", kind: "vocab", term: "词", meaning: "từ", reps: 3 });
    await service.from("user_known_terms").insert({ user_id: anonId, item_key: "vocab:好" });
    // Các bảng thêm sau này (bài thích, điểm luyện tập, hồ sơ bảng xếp hạng) phải đi theo khi gộp, không bị xóa cascade.
    const { data: song } = await service.from("songs").select("video_id").limit(1).single();
    videoId = song!.video_id;
    await service.from("user_song_likes").insert({ user_id: anonId, video_id: videoId });
    await service.from("practice_scores").insert({ user_id: anonId, mode: "cloze", points: 120, correct: 4, total: 5, duration_sec: 60 });
    await service.from("leaderboard_profiles").insert({ user_id: anonId, nickname });
  });

  afterAll(async () => {
    for (const id of created) await service.auth.admin.deleteUser(id);
  });

  it("mã chỉ dùng được đúng: xem trước đếm đúng, mã lạ và mã hết hạn bị từ chối", async () => {
    const { createMergeToken, previewMerge } = await import("@/lib/account/merge-account");
    const token = await createMergeToken(service, anonId);
    expect(await previewMerge(service, token)).toEqual({ knownTerms: 1, cards: 1, reviews: 0 });
    await expect(previewMerge(service, "x".repeat(43))).rejects.toMatchObject({ code: "invalid_token" });
    await expect(previewMerge(service, token, new Date(Date.now() + 31 * 60_000))).rejects.toMatchObject({ code: "invalid_token" });
  });

  it("không gộp vào chính nó và không xóa tài khoản không ẩn danh", async () => {
    const { createMergeToken, executeMerge } = await import("@/lib/account/merge-account");
    const token = await createMergeToken(service, anonId);
    await expect(executeMerge(service, token, anonId)).rejects.toMatchObject({ code: "same_account" });
    const memberToken = await createMergeToken(service, memberId); // tài khoản thật không được coi là nguồn
    await expect(executeMerge(service, memberToken, anonId)).rejects.toMatchObject({ code: "not_anonymous" });
    expect((await service.auth.admin.getUserById(memberId)).data.user).not.toBeNull();
  });

  it("gộp: dữ liệu sang tài khoản đích, tài khoản ẩn danh bị xóa, mã dùng một lần", async () => {
    const { createMergeToken, executeMerge, isAccountEmpty } = await import("@/lib/account/merge-account");
    const token = await createMergeToken(service, anonId);
    expect(await isAccountEmpty(service, memberId)).toBe(true);
    expect(await isAccountEmpty(service, anonId)).toBe(false);
    await executeMerge(service, token, memberId);
    expect(await isAccountEmpty(service, memberId)).toBe(false);
    expect((await service.from("user_song_likes").select("video_id").eq("user_id", memberId)).data).toEqual([{ video_id: videoId }]);
    expect((await service.from("practice_scores").select("points").eq("user_id", memberId)).data).toEqual([{ points: 120 }]);
    expect((await service.from("leaderboard_profiles").select("nickname").eq("user_id", memberId)).data).toEqual([{ nickname }]);
    expect((await service.from("user_cards").select("reps").eq("user_id", memberId)).data).toEqual([{ reps: 3 }]);
    expect((await service.from("user_known_terms").select("item_key").eq("user_id", memberId)).data).toEqual([{ item_key: "vocab:好" }]);
    expect((await service.auth.admin.getUserById(anonId)).data.user).toBeNull();
    await expect(executeMerge(service, token, memberId)).rejects.toMatchObject({ code: "invalid_token" });
  });

  it("xóa tài khoản xóa luôn dữ liệu (cascade)", async () => {
    await service.from("user_cards").insert({ user_id: memberId, item_key: "vocab:新", kind: "vocab", term: "新", meaning: "mới" });
    await service.auth.admin.deleteUser(memberId);
    expect((await service.from("user_cards").select("item_key").eq("user_id", memberId)).data).toEqual([]);
    expect((await service.from("user_known_terms").select("item_key").eq("user_id", memberId)).data).toEqual([]);
  });
});
