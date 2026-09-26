import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// View `discover_songs` (tab Khám phá) trên Supabase thật. Cần đã chạy migration discover_songs. Tự bỏ qua khi thiếu biến môi trường.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };
const IDS = ["disc0000001", "disc0000002", "disc0000003", "disc0000004"] as const;

describe.skipIf(!enabled)("view discover_songs", () => {
  const service = enabled ? createClient(url!, serviceKey!, opts) : (null as never);

  beforeAll(async () => {
    await service.from("songs").upsert(IDS.map((id, i) => ({ video_id: id, title: `Bài thử ${i}`, channel_title: "k", duration_sec: 1, level_avg: 3, listed: id !== IDS[1] })));
    // Bài 0, 1, 2 có phân tích; bài 3 chưa có.
    await service.from("song_analyses").upsert(IDS.slice(0, 3).map((id) => ({
      video_id: id, learn_lang: "zh", explain_lang: "vi", prompt_version: "test", lyrics_source: "lrclib", model: "t", analysis: {},
    })), { onConflict: "video_id,learn_lang,explain_lang,prompt_version" });
    // Bài 2 bị báo sai 5 lần.
    await service.from("item_reports").insert(Array.from({ length: 5 }, () => ({ video_id: IDS[2], prompt_version: "test", item_id: "vocab:x", reason: "wrong_meaning" })));
  });

  afterAll(async () => {
    await service.from("songs").delete().in("video_id", [...IDS]); // xóa cascade phân tích và báo sai
  });

  it("chỉ gồm bài được niêm yết, có phân tích và chưa bị báo sai nhiều", async () => {
    const { data, error } = await service.from("discover_songs").select("video_id,listeners,level_avg").in("video_id", [...IDS]);
    expect(error).toBeNull();
    expect(data).toEqual([{ video_id: IDS[0], listeners: 0, level_avg: 3 }]);
  });

  it("client thường (anon key) không đọc được view", async () => {
    const anon = createClient(url!, anonKey!, opts);
    const res = await anon.from("discover_songs").select("video_id").limit(1);
    expect(res.error ?? res.data?.length === 0 ? true : false).toBe(true);
    expect(res.data ?? []).toEqual([]);
  });
});
