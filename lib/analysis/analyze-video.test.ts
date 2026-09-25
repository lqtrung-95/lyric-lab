import { describe, expect, it } from "vitest";
import type { CaptionProvider } from "@/lib/captions/caption-provider-types";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import type { LrclibSearch } from "@/lib/lyrics/lrclib-provider";
import type { VideoMeta } from "@/lib/lyrics/lyrics-types";
import { analyzeVideo, type AnalyzeVideoDeps } from "./analyze-video";
import type { SongAnalysis } from "./analysis-types";
import type { CacheDb } from "./song-analysis-cache";

// Lời hư cấu 夜车 (docs/design-brief.md mục 6), 30 giây.
const TEXTS = ["窗外的城市慢慢睡了", "我从来没想过会离开", "你的笑比星光还亮", "就算路再远我也不怕", "把回忆放进口袋里", "等天亮了我们再出发"];
const video: VideoMeta = { videoId: "dQw4w9WgXcQ", title: "歌手甲 夜车", channelTitle: "歌手甲", durationSec: 30 };
const captions: CaptionProvider = {
  listTracks: async () => [{ lang: "zh-CN", kind: "manual", ref: "r" }],
  fetchLines: async () => TEXTS.map((text, i) => ({ text, start: i * 5, end: i * 5 + 5 })),
};
const lrclib: LrclibSearch = { search: async () => [] };
const TERMS = ["城市", "离开", "星光", "回忆", "口袋", "天亮", "出发", "慢慢"];
const row = (simplified: string): DictWordRow => ({ simplified, traditional: simplified, pinyin: "p", meanings: ["m"], hsk_level: 4, frequency: null });
const llmJson = JSON.stringify({
  summary: "s", moods: ["m"], translations: [],
  vocab: TERMS.map((term) => ({ term, meaningInContext: "nghĩa", priority: 50 })), grammar: [],
});

function fakeDb() {
  const store = { analyses: [] as SongAnalysis[], songs: 0, reads: 0 };
  const db: CacheDb = {
    selectAnalysis: async () => { store.reads++; return { data: store.analyses.map((analysis) => ({ analysis })), error: null }; },
    upsertSong: async () => { store.songs++; return { data: null, error: null }; },
    upsertAnalysis: async (r) => { store.analyses.push(r.analysis); return { data: null, error: null }; },
  };
  return { db, store };
}
const deps = (db: CacheDb, chatCalls: { n: number }): AnalyzeVideoDeps => ({
  captions, lrclib, cache: db,
  chat: async () => { chatCalls.n++; return llmJson; },
  lookupDictionary: async () => new Map(TERMS.map((t) => [t, [row(t)]])),
  lookupSinoViet: async () => new Map(),
  models: ["m1"],
});

describe("analyzeVideo", () => {
  it("lần đầu chạy pipeline và lưu cache; lần hai đọc từ cache, không gọi LLM", async () => {
    const { db, store } = fakeDb();
    const calls = { n: 0 };
    const first = await analyzeVideo(video, deps(db, calls));
    expect(first.fromCache).toBe(false);
    expect(first.analysis.lyricsSource).toBe("youtube_caption");
    expect(store.songs).toBe(1);
    expect(store.analyses).toHaveLength(1);

    const second = await analyzeVideo(video, deps(db, calls));
    expect(second.fromCache).toBe(true);
    expect(calls.n).toBe(1);
  });

  it("báo tiến trình theo thứ tự khi chạy pipeline, không báo khi dùng cache", async () => {
    const { db } = fakeDb();
    const steps: string[] = [];
    const withProgress = { ...deps(db, { n: 0 }), onProgress: (s: string) => steps.push(s) };
    await analyzeVideo(video, withProgress);
    expect(steps).toEqual(["lyrics", "analysis"]);
    await analyzeVideo(video, withProgress);
    expect(steps).toEqual(["lyrics", "analysis"]);
  });

  it("không có lời → ném NoLyricsError, không gọi LLM, không ghi cache", async () => {
    const { db, store } = fakeDb();
    const calls = { n: 0 };
    const noLyrics = { ...deps(db, calls), captions: { listTracks: async () => [], fetchLines: async () => [] } };
    await expect(analyzeVideo(video, noLyrics)).rejects.toMatchObject({ name: "NoLyricsError" });
    expect(calls.n).toBe(0);
    expect(store.analyses).toHaveLength(0);
  });
});
