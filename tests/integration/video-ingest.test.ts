import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { CaptionProvider, CaptionTrackInfo } from "@/lib/captions/caption-provider-types";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { ensureSource, ingestVideo } from "@/lib/video/ingest-video";
import type { VideoMeta } from "@/lib/video/youtube-data-api";

// Nạp video vào DB thật bằng nguồn phụ đề giả (không gọi YouTube): kiểm tra các lý do bỏ qua, trạng thái nháp, ghép bản dịch, chạy lại và làm mới.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CHANNEL = "UCzTestChannel00000000000";
const ids = { ok: "zIngTest_01", noVi: "zIngTest_02", asr: "zIngTest_03", blocked: "zIngTest_04", noEmbed: "zIngTest_05" };

const zhLines = [
  { text: "你好，朋友。", start: 0, end: 3 },
  { text: "今天天气很好。", start: 3, end: 6 },
];
const viLines = [
  { text: "Xin chào, bạn bè.", start: 0, end: 3 },
  { text: "Hôm nay trời đẹp.", start: 3, end: 6 },
];

function fakeProvider(tracksByVideo: Record<string, CaptionTrackInfo[]>, failing = new Set<string>()): CaptionProvider {
  return {
    listTracks: async (id) => tracksByVideo[id] ?? [],
    fetchLines: async (id, track) => {
      if (failing.has(id)) throw new Error("YouTube từ chối tải caption (429)");
      return track.lang.startsWith("vi") ? viLines : zhLines;
    },
  };
}
const meta = (videoId: string, embeddable = true): VideoMeta => ({ videoId, title: `Video thử ${videoId}`, channelTitle: "Kênh thử", channelId: CHANNEL, durationSec: 6, embeddable });
const manualZh: CaptionTrackInfo = { lang: "zh-Hans", kind: "manual" };
const manualVi: CaptionTrackInfo = { lang: "vi", kind: "manual" };

describe.skipIf(!(url && serviceKey))("nạp video luyện nghe (nguồn phụ đề giả, DB thật)", () => {
  let sb: SupabaseClient;
  let sourceId: string;
  const deps = () => ({
    sb, lookup: (t: string[]) => lookupWords(sb as never, t),
    provider: fakeProvider({ [ids.ok]: [manualZh, manualVi], [ids.noVi]: [manualZh], [ids.asr]: [{ lang: "zh-Hans", kind: "asr" }], [ids.blocked]: [manualZh] }, new Set([ids.blocked])),
  });

  beforeAll(async () => {
    sb = createClient(url!, serviceKey!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
    await sb.from("video_lessons").delete().in("video_id", Object.values(ids));
    sourceId = await ensureSource(sb, { id: CHANNEL, title: "Kênh thử" }, false);
  });
  afterAll(async () => {
    await sb.from("video_lessons").delete().in("video_id", Object.values(ids));
    await sb.from("video_sources").delete().eq("youtube_ref", CHANNEL);
  });

  it("nạp video có phụ đề tiếng Trung và tiếng Việt: vào nháp, có pinyin và level, track tiếng Việt bị bỏ qua (bản dịch do AI, chưa có)", async () => {
    const outcome = await ingestVideo(deps(), { meta: meta(ids.ok), sourceId });
    expect(outcome).toMatchObject({ kind: "ingested", lineCount: 2, translatedLineCount: 0, refreshed: false });
    const { data } = await sb.from("video_lessons").select("status, translation_source, source_id, lines").eq("video_id", ids.ok).single();
    expect(data).toMatchObject({ status: "draft", translation_source: "none", source_id: sourceId });
    expect((data!.lines as { pinyin: string; translation: string | null }[])[0]).toMatchObject({ pinyin: expect.stringContaining("nǐ"), translation: null });
  });

  it("chạy lại thì bỏ qua video đã có; --refresh làm mới nhưng giữ nguyên trạng thái đã duyệt", async () => {
    expect(await ingestVideo(deps(), { meta: meta(ids.ok), sourceId })).toEqual({ kind: "skipped", reason: "exists" });
    await sb.from("video_lessons").update({ status: "listed" }).eq("video_id", ids.ok);
    expect(await ingestVideo(deps(), { meta: meta(ids.ok), sourceId, refresh: true })).toMatchObject({ kind: "ingested", refreshed: true });
    expect((await sb.from("video_lessons").select("status").eq("video_id", ids.ok).single()).data?.status).toBe("listed");
  });

  it("video không có track tiếng Việt cũng nạp như nhau, chưa có bản dịch", async () => {
    expect(await ingestVideo(deps(), { meta: meta(ids.noVi), sourceId })).toMatchObject({ kind: "ingested", translatedLineCount: 0 });
    expect((await sb.from("video_lessons").select("translation_source").eq("video_id", ids.noVi).single()).data?.translation_source).toBe("none");
  });

  it("bỏ qua video chỉ có phụ đề tự động hoặc không nhúng được, không ghi gì vào DB", async () => {
    expect(await ingestVideo(deps(), { meta: meta(ids.asr), sourceId })).toEqual({ kind: "skipped", reason: "no_human_zh_captions" });
    expect(await ingestVideo(deps(), { meta: meta(ids.noEmbed, false), sourceId })).toEqual({ kind: "skipped", reason: "not_embeddable" });
    const { data } = await sb.from("video_lessons").select("video_id").in("video_id", [ids.asr, ids.noEmbed]);
    expect(data).toEqual([]);
  });

  it("lỗi tải phụ đề tạm thời được ném ra để nơi gọi thử lại, và không ghi dở vào DB", async () => {
    await expect(ingestVideo(deps(), { meta: meta(ids.blocked), sourceId })).rejects.toThrow(/429/);
    expect((await sb.from("video_lessons").select("video_id").eq("video_id", ids.blocked)).data).toEqual([]);
  });
});
