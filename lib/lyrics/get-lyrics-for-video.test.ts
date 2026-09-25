import { describe, expect, it } from "vitest";
import type { CaptionProvider } from "@/lib/captions/caption-provider-types";
import { CaptionError } from "@/lib/captions/caption-errors";
import type { LrclibSearch } from "./lrclib-provider";
import { NoLyricsError, type LrclibItem, type VideoMeta } from "./lyrics-types";
import { getLyricsForVideo } from "./get-lyrics-for-video";

// Bài hư cấu 夜车 (docs/design-brief.md mục 6), 30 giây.
const TEXTS = ["窗外的城市慢慢睡了", "我从来没想过会离开", "你的笑比星光还亮", "就算路再远我也不怕", "把回忆放进口袋里", "等天亮了我们再出发"];
const lines = TEXTS.map((text, i) => ({ text, start: i * 5, end: i * 5 + 5 }));
const lrc = TEXTS.map((t, i) => `[00:${String(i * 5).padStart(2, "0")}.00]${t}`).join("\n");
const video: VideoMeta = { videoId: "dQw4w9WgXcQ", title: "歌手甲【夜车】Official MV", channelTitle: "歌手甲", durationSec: 30 };
const lrclibItem: LrclibItem = { id: 9, trackName: "夜车", artistName: "歌手甲", duration: 31, instrumental: false, syncedLyrics: lrc };

const captions = (o: Partial<CaptionProvider> = {}): CaptionProvider => ({
  listTracks: async () => [{ lang: "zh-CN", kind: "manual", ref: "r" }],
  fetchLines: async () => lines,
  ...o,
});
const lrclib = (items: LrclibItem[] | Error): LrclibSearch => ({
  search: async () => { if (items instanceof Error) throw items; return items; },
});

describe("getLyricsForVideo", () => {
  it("ưu tiên caption YouTube khi đạt chất lượng, không gọi LRCLIB", async () => {
    const r = await getLyricsForVideo(video, { captions: captions(), lrclib: lrclib(new Error("không được gọi")) });
    expect(r.source).toBe("youtube_caption");
    expect(r.lines).toHaveLength(6);
    expect(r.attempts).toEqual([{ source: "youtube_caption", outcome: "used", detail: "zh-CN/manual" }]);
  });

  it("không có track → dùng LRCLIB", async () => {
    const r = await getLyricsForVideo(video, { captions: captions({ listTracks: async () => [] }), lrclib: lrclib([lrclibItem]) });
    expect(r.source).toBe("lrclib");
    expect(r.lines[0]).toMatchObject({ text: "窗外的城市慢慢睡了", start: 0 });
    expect(r.attempts.map((a) => a.outcome)).toEqual(["no_data", "used"]);
  });

  it("caption bị chặn (429) → ghi lỗi rồi dùng LRCLIB", async () => {
    const blocked = captions({ fetchLines: async () => { throw new CaptionError("blocked", "429"); } });
    const r = await getLyricsForVideo(video, { captions: blocked, lrclib: lrclib([lrclibItem]) });
    expect(r.source).toBe("lrclib");
    expect(r.attempts[0]).toMatchObject({ source: "youtube_caption", outcome: "error" });
  });

  it("caption là pinyin Latin → low_quality, rơi sang LRCLIB", async () => {
    const pinyin = captions({ fetchLines: async () => TEXTS.map((_, i) => ({ text: "chuang wai de cheng shi", start: i * 5, end: i * 5 + 5 })) });
    const r = await getLyricsForVideo(video, { captions: pinyin, lrclib: lrclib([lrclibItem]) });
    expect(r.attempts[0].outcome).toBe("low_quality");
    expect(r.source).toBe("lrclib");
  });

  it("LRCLIB chỉ có bản lệch độ dài → NoLyricsError kèm lý do", async () => {
    const far = { ...lrclibItem, duration: 90 };
    const promise = getLyricsForVideo(video, { captions: captions({ listTracks: async () => [] }), lrclib: lrclib([far]) });
    await expect(promise).rejects.toBeInstanceOf(NoLyricsError);
    await promise.catch((e: NoLyricsError) => expect(e.attempts.at(-1)?.outcome).toBe("no_match"));
  });

  it("cả hai nguồn lỗi mạng → NoLyricsError, không ném lỗi lạ", async () => {
    const promise = getLyricsForVideo(video, {
      captions: captions({ listTracks: async () => { throw new Error("mạng"); } }),
      lrclib: lrclib(new Error("HTTP 500")),
    });
    await expect(promise).rejects.toBeInstanceOf(NoLyricsError);
  });
});
