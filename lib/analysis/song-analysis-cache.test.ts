import { describe, expect, it, vi } from "vitest";
import { yeCheAnalysis } from "@/lib/preview/fixtures/ye-che-analysis";
import { saveAnalysis, type CacheDb, type CacheKey } from "./song-analysis-cache";

const key: CacheKey = { videoId: "abcdefghijk", learnLang: "zh", explainLang: "vi", promptVersion: "v-test" };
const video = { videoId: key.videoId, title: "夜车", channelTitle: "歌手示例", durationSec: 30 };
const ok = { data: null, error: null };

function makeDb(overrides: Partial<CacheDb> = {}): CacheDb & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    selectAnalysis: async () => ({ data: null, error: null }),
    upsertSong: async () => { calls.push("song"); return ok; },
    upsertAnalysis: async () => { calls.push("analysis"); return ok; },
    ...overrides,
  };
}

describe("saveAnalysis: nhóm cảm xúc", () => {
  it("ghi nhóm cảm xúc suy ra từ moods của bài sau khi đã lưu phân tích", async () => {
    const updateMoodGroups = vi.fn(async () => ok);
    const db = makeDb({ updateMoodGroups });
    await saveAnalysis(db, key, video, { ...yeCheAnalysis, moods: ["Hoài niệm", "Hy vọng"] });
    expect(db.calls).toEqual(["song", "analysis"]);
    expect(updateMoodGroups).toHaveBeenCalledWith(key.videoId, ["hoai-niem", "hy-vong"]);
  });

  it("lỗi khi ghi nhóm cảm xúc (vd. chưa chạy migration) không làm hỏng việc lưu phân tích", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const db = makeDb({ updateMoodGroups: async () => { throw new Error("column mood_groups does not exist"); } });
    await expect(saveAnalysis(db, key, video, yeCheAnalysis)).resolves.toBeUndefined();
    expect(db.calls).toEqual(["song", "analysis"]);
    error.mockRestore();
  });

  it("db không có updateMoodGroups (script, test) vẫn lưu bình thường", async () => {
    const db = makeDb();
    await expect(saveAnalysis(db, key, video, yeCheAnalysis)).resolves.toBeUndefined();
  });
});
