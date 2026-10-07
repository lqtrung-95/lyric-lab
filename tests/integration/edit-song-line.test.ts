import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";

// Quản trị viên sửa lời một dòng trên Supabase thật, chỉ với bài hư cấu tạm (không đụng bài thật). Tự bỏ qua khi thiếu biến môi trường.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn() }));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && serviceKey);
const VIDEO = "editline001";

describe.skipIf(!enabled)("sửa lời một dòng (quản trị)", () => {
  let sb: SupabaseClient;
  let version = "";
  const analysis = (): SongAnalysis => ({
    videoId: VIDEO, lyricsSource: "lrclib", summary: "", moods: [], promptVersion: version, model: "t",
    lines: [
      { index: 0, text: "我爱你", start: 1, end: 3, pinyin: "wǒ ài nǐ", translation: "Anh yêu em", tokens: [{ text: "我" }, { text: "爱", itemId: "vocab:0" }, { text: "你" }] },
      { index: 1, text: "错的字", start: 4, end: 6, pinyin: "sai", translation: "Chữ sai", tokens: [{ text: "错的字" }] },
    ],
    items: [{ id: "vocab:0", type: "vocab", term: "爱", level: 1, meaningInContext: "yêu", priority: 1, occurrences: [{ lineIndex: 0, start: 1 }] }],
  });

  beforeAll(async () => {
    sb = createClient(url!, serviceKey!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
    version = (await import("@/lib/analysis/build-analysis-prompt")).PROMPT_VERSION;
    await sb.from("songs").upsert({ video_id: VIDEO, title: "Bài thử sửa lời", channel_title: "k", duration_sec: 10, listed: false });
    await sb.from("song_analyses").upsert({ video_id: VIDEO, learn_lang: "zh", explain_lang: "vi", prompt_version: version, lyrics_source: "lrclib", model: "t", analysis: analysis() }, { onConflict: "video_id,learn_lang,explain_lang,prompt_version" });
    await sb.from("line_explanations").upsert({ video_id: VIDEO, line_index: 1, explain_lang: "vi", prompt_version: version, data: { translation: "cũ" }, model: "t" });
  });
  afterAll(async () => { await sb?.from("songs").delete().eq("video_id", VIDEO); await sb?.from("line_explanations").delete().eq("video_id", VIDEO); });

  const stored = async () => (await sb.from("song_analyses").select("analysis").eq("video_id", VIDEO).single()).data!.analysis as SongAnalysis;

  it("đổi chữ Hán: pinyin tự tính từ từ điển, giữ mốc thời gian và bản dịch, xóa lời giải thích cũ của dòng", async () => {
    const { editSongLine } = await import("@/lib/analysis/edit-song-line");
    expect((await sb.from("line_explanations").select("line_index").eq("video_id", VIDEO)).data).toHaveLength(1); // có lời giải thích cũ để xóa
    expect(await editSongLine(VIDEO, { lineIndex: 1, text: "我爱" })).toBe("ok");
    const a = await stored();
    expect(a.lines[1]).toMatchObject({ text: "我爱", start: 4, end: 6, translation: "Chữ sai" });
    expect(a.lines[1].pinyin).toMatch(/wǒ.*ài/);
    expect(a.lines[1].tokens.some((t) => t.itemId === "vocab:0")).toBe(true);
    expect(a.items[0].occurrences.map((o) => o.lineIndex)).toEqual([0, 1]);
    expect(a.lines[0]).toEqual(analysis().lines[0]); // dòng khác không đổi
    const { data } = await sb.from("line_explanations").select("line_index").eq("video_id", VIDEO).eq("line_index", 1);
    expect(data).toEqual([]);
  });

  it("pinyin gõ tay được giữ nguyên; bản dịch đổi được", async () => {
    const { editSongLine } = await import("@/lib/analysis/edit-song-line");
    expect(await editSongLine(VIDEO, { lineIndex: 1, text: "我爱你", pinyin: "wo3 ai4 ni3", translation: "Anh yêu em nhiều" })).toBe("ok");
    expect((await stored()).lines[1]).toMatchObject({ pinyin: "wo3 ai4 ni3", translation: "Anh yêu em nhiều" });
  });

  it("từ chối chữ không có Hán, quá dài, dòng hoặc bài không tồn tại", async () => {
    const { editSongLine, MAX_LINE_TEXT } = await import("@/lib/analysis/edit-song-line");
    expect(await editSongLine(VIDEO, { lineIndex: 1, text: "abc" })).toBe("invalid_text");
    expect(await editSongLine(VIDEO, { lineIndex: 1, text: "我".repeat(MAX_LINE_TEXT + 1) })).toBe("invalid_text");
    expect(await editSongLine(VIDEO, { lineIndex: 99, text: "我爱你" })).toBe("line_not_found");
    expect(await editSongLine("nonexist001", { lineIndex: 0, text: "我爱你" })).toBe("analysis_not_found");
  });
});
