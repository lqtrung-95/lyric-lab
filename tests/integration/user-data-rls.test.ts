import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { Rating } from "ts-fsrs";
import { gradeCard, newCardFields } from "@/lib/srs/fsrs-scheduler";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Test tích hợp trên Supabase thật (cần đã chạy migration user_accounts và bật Anonymous sign-ins).
// Tự bỏ qua khi thiếu biến môi trường. Dùng hai tài khoản ẩn danh tạm và xóa sạch sau khi chạy.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);

const clientOptions = { auth: { persistSession: false }, realtime: { transport: ws as never } };
const SONG = "rlsTest0001"; // video_id giả dùng riêng cho test này

const card = (userId: string, itemKey: string, over: Record<string, unknown> = {}) => ({
  user_id: userId, item_key: itemKey, kind: "vocab", term: "词", meaning: "từ", ...over,
});

describe.skipIf(!enabled)("RLS dữ liệu người dùng và hàm phía server", () => {
  let service: SupabaseClient;
  let a: SupabaseClient;
  let b: SupabaseClient;
  let aId = "";
  let bId = "";

  async function signInAnon(): Promise<{ client: SupabaseClient; id: string }> {
    const client = createClient(url!, anonKey!, clientOptions);
    const { data, error } = await client.auth.signInAnonymously();
    if (error || !data.user) throw new Error(`signInAnonymously: ${error?.message}`);
    return { client, id: data.user.id };
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, clientOptions);
    ({ client: a, id: aId } = await signInAnon());
    ({ client: b, id: bId } = await signInAnon());
    await service.from("songs").upsert({ video_id: SONG, title: "rls test", channel_title: "test", duration_sec: 1 });

    const own = await Promise.all([
      a.from("user_profiles").insert({ user_id: aId, level: 3 }),
      a.from("user_known_terms").insert({ user_id: aId, item_key: "vocab:词" }),
      a.from("user_cards").insert(card(aId, "vocab:词")),
      a.from("review_logs").insert({ user_id: aId, item_key: "vocab:词", rating: 3, state: 0, due: new Date().toISOString(), stability: 1, difficulty: 1, elapsed_days: 0, scheduled_days: 1 }),
      a.from("user_song_progress").insert({ user_id: aId, video_id: SONG, last_position_sec: 12 }),
    ]);
    own.forEach((r) => expect(r.error).toBeNull());
  });

  afterAll(async () => {
    if (!service) return;
    await service.from("songs").delete().eq("video_id", SONG);
    for (const id of [aId, bId]) if (id) await service.auth.admin.deleteUser(id);
  });

  const TABLES = ["user_profiles", "user_known_terms", "user_cards", "review_logs", "user_song_progress", "usage_events"];

  it("chủ sở hữu đọc được dữ liệu của mình", async () => {
    for (const t of TABLES.filter((t) => t !== "usage_events")) {
      const { data } = await a.from(t).select("*");
      expect(data, t).toHaveLength(1);
    }
  });

  it("người dùng khác không đọc được hàng nào", async () => {
    for (const t of TABLES) {
      const { data } = await b.from(t).select("*");
      expect(data, t).toEqual([]);
    }
  });

  it("người dùng khác không sửa hay xóa được dữ liệu của A", async () => {
    await b.from("user_cards").update({ meaning: "bị sửa" }).eq("user_id", aId);
    await b.from("user_cards").delete().eq("user_id", aId);
    await b.from("user_profiles").update({ level: 7 }).eq("user_id", aId);
    const { data: c } = await service.from("user_cards").select("meaning").eq("user_id", aId);
    const { data: p } = await service.from("user_profiles").select("level").eq("user_id", aId);
    expect(c).toEqual([{ meaning: "từ" }]);
    expect(p).toEqual([{ level: 3 }]);
  });

  it("không ghi được hàng mang user_id của người khác", async () => {
    const attempts: [string, Record<string, unknown>][] = [
      ["user_cards", card(aId, "vocab:khác")],
      ["user_known_terms", { user_id: aId, item_key: "vocab:khác" }],
      ["user_profiles", { user_id: aId }],
    ];
    for (const [t, row] of attempts) {
      const { error } = await b.from(t).insert(row);
      expect(error, t).not.toBeNull();
    }
  });

  it("client không gọi được consume_usage và merge_user_data; không đọc được bảng cache/usage", async () => {
    expect((await a.rpc("consume_usage", { p_user: aId, p_kind: "analyze", p_limit: 999 })).error).not.toBeNull();
    expect((await a.rpc("merge_user_data", { p_from: bId, p_to: aId })).error).not.toBeNull();
    expect((await a.from("songs").select("*")).data ?? []).toEqual([]);
  });

  it("consume_usage: đúng hạn mức, đếm độc lập theo loại", async () => {
    const use = async (kind: string, limit: number) =>
      (await service.rpc("consume_usage", { p_user: aId, p_kind: kind, p_limit: limit })).data;
    expect([await use("analyze", 2), await use("analyze", 2), await use("analyze", 2)]).toEqual([true, true, false]);
    expect(await use("explain", 2)).toBe(true);
  });

  it("consume_usage: song song không vượt hạn mức", async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () => service.rpc("consume_usage", { p_user: bId, p_kind: "explain", p_limit: 3 })),
    );
    expect(results.filter((r) => r.data === true)).toHaveLength(3);
  });

  it("chấm thẻ: chủ sở hữu cập nhật thẻ, ghi rồi hoàn tác nhật ký (cùng thao tác với review-repo)", async () => {
    const before = newCardFields(new Date());
    const { next, log } = gradeCard(before, Rating.Good, new Date());
    const upd = await a.from("user_cards").update(next).eq("item_key", "vocab:词");
    expect(upd.error).toBeNull();
    const ins = await a.from("review_logs").insert({ ...log, user_id: aId, item_key: "vocab:词" }).select("id").single();
    expect(ins.error).toBeNull();
    const { data: graded } = await a.from("user_cards").select("state,reps").eq("item_key", "vocab:词").single();
    expect(graded).toEqual({ state: 1, reps: 1 });

    await a.from("user_cards").update(before).eq("item_key", "vocab:词");
    expect((await a.from("review_logs").delete().eq("id", ins.data!.id)).error).toBeNull();
    const { data: restored } = await a.from("user_cards").select("state,reps").eq("item_key", "vocab:词").single();
    expect(restored).toEqual({ state: 0, reps: 0 });
    // B không xóa được nhật ký của A.
    expect((await b.from("review_logs").delete().eq("user_id", aId)).error).toBeNull();
    expect((await service.from("review_logs").select("id").eq("user_id", aId)).data).toHaveLength(1);
  });

  it("độ lệch lời: chủ sở hữu ghi/đọc được, giá trị ngoài ±60 bị từ chối, người khác không đọc được", async () => {
    const ok = await a.from("user_song_progress").upsert({ user_id: aId, video_id: SONG, lyric_offset_sec: 1.5 });
    expect(ok.error).toBeNull();
    const { data } = await a.from("user_song_progress").select("lyric_offset_sec,last_position_sec").eq("video_id", SONG).single();
    expect(data).toEqual({ lyric_offset_sec: 1.5, last_position_sec: 12 }); // tiến độ nghe cũ được giữ nguyên
    expect((await a.from("user_song_progress").upsert({ user_id: aId, video_id: SONG, lyric_offset_sec: 99 })).error).not.toBeNull();
    expect((await b.from("user_song_progress").select("lyric_offset_sec").eq("video_id", SONG)).data).toEqual([]);
    await a.from("user_song_progress").upsert({ user_id: aId, video_id: SONG, lyric_offset_sec: 0 });
  });

  it("merge_user_data: luật gộp (thẻ nhiều lượt ôn thắng, cài đặt đích thắng, từ đã biết hợp lại)", async () => {
    // A (ẩn danh) → B (đã đăng nhập). Chuẩn bị B: hồ sơ riêng, thẻ trùng ít lượt ôn hơn, thẻ riêng, từ đã biết riêng.
    const setup = [];
    setup.push(await service.from("user_profiles").insert({ user_id: bId, level: 5 }));
    // Chèn từng hàng: PostgREST điền null cho cột thiếu khi mảng có hàng khác bộ khóa, làm hỏng giá trị mặc định.
    setup.push(await service.from("user_cards").insert(card(bId, "vocab:词", { reps: 1, meaning: "của B" })));
    setup.push(await service.from("user_cards").insert(card(bId, "vocab:riêngB")));
    setup.push(await service.from("user_known_terms").insert({ user_id: bId, item_key: "vocab:riêngB" }));
    setup.forEach((r) => expect(r.error).toBeNull());
    await service.from("user_cards").update({ reps: 4, meaning: "của A" }).eq("user_id", aId).eq("item_key", "vocab:词");

    const { error } = await service.rpc("merge_user_data", { p_from: aId, p_to: bId });
    expect(error).toBeNull();

    const cards = await service.from("user_cards").select("item_key,meaning,reps").eq("user_id", bId).order("item_key");
    expect(cards.data).toEqual([
      { item_key: "vocab:riêngB", meaning: "từ", reps: 0 },
      { item_key: "vocab:词", meaning: "của A", reps: 4 },
    ]);
    expect((await service.from("user_profiles").select("level").eq("user_id", bId)).data).toEqual([{ level: 5 }]);
    const known = await service.from("user_known_terms").select("item_key").eq("user_id", bId).order("item_key");
    expect(known.data).toEqual([{ item_key: "vocab:riêngB" }, { item_key: "vocab:词" }]);
    expect((await service.from("review_logs").select("id").eq("user_id", bId)).data).toHaveLength(1);
    expect((await service.from("user_song_progress").select("last_position_sec").eq("user_id", bId)).data).toEqual([{ last_position_sec: 12 }]);
    for (const t of ["user_cards", "user_known_terms", "user_profiles", "review_logs", "user_song_progress"]) {
      expect((await service.from(t).select("*").eq("user_id", aId)).data, t).toEqual([]);
    }
  });
});
