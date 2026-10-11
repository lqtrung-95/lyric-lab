import { describe, expect, it } from "vitest";
import type { DiscoverSong } from "@/lib/discover/discover-query";
import type { LessonSummary } from "@/lib/video/video-repo";
import { pickTodayStudy } from "./today-plan";

const video = (videoId: string, levelAvg: number | null): LessonSummary => ({ videoId, title: `V ${videoId}`, channelTitle: "k", durationSec: 600, levelAvg, lineCount: 10 });
const song = (videoId: string): DiscoverSong => ({ videoId, title: `S ${videoId}`, channelTitle: "k", levelAvg: 3, listeners: 1, likes: 0 });
const EVEN = "2026-10-12"; // 20738 ngày: số chẵn
const ODD = "2026-10-13";
const base = { continueSong: null, videos: [video("v1", 3.2), video("v2", 1.5)], songs: [song("s1")], level: 3 };

describe("pickTodayStudy", () => {
  it("bài đang nghe dở luôn được ưu tiên", () => {
    const r = pickTodayStudy({ ...base, continueSong: { videoId: "c1", title: "Dở", positionSec: 42 }, dayKey: EVEN });
    expect(r).toMatchObject({ kind: "continue", href: "/learn/c1/listen?t=42" });
  });
  it("ngày chẵn gợi ý video cùng dải level; ngày lẻ gợi ý bài hát", () => {
    expect(pickTodayStudy({ ...base, dayKey: EVEN })).toMatchObject({ kind: "video", videoId: "v1", href: "/video/v1" });
    expect(pickTodayStudy({ ...base, dayKey: ODD })).toMatchObject({ kind: "song", videoId: "s1", href: "/learn/s1" });
  });
  it("không có video hợp dải thì lấy video bất kỳ", () => {
    expect(pickTodayStudy({ ...base, videos: [video("v9", 6)], dayKey: EVEN })).toMatchObject({ kind: "video", videoId: "v9" });
  });
  it("thiếu loại ưu tiên thì lấy loại còn lại", () => {
    expect(pickTodayStudy({ ...base, songs: [], dayKey: ODD })).toMatchObject({ kind: "video" });
    expect(pickTodayStudy({ ...base, videos: [], dayKey: EVEN })).toMatchObject({ kind: "song" });
  });
  it("không có gì thì null; cùng một ngày cho cùng kết quả", () => {
    expect(pickTodayStudy({ ...base, videos: [], songs: [], dayKey: EVEN })).toBeNull();
    expect(pickTodayStudy({ ...base, dayKey: EVEN })).toEqual(pickTodayStudy({ ...base, dayKey: EVEN }));
  });
});
