import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { groupSongReports } = await import("./song-reports");

const row = (video_id: string, reason: string, created_at: string, listed = true) => ({ video_id, reason, created_at, songs: { title: `Bài ${video_id}`, listed } });

describe("groupSongReports", () => {
  it("gộp theo bài, đếm theo lý do, bài báo gần nhất lên đầu", () => {
    const out = groupSongReports([
      row("aaaaaaaaaaa", "lyrics_mismatch", "2026-10-01T00:00:00Z"),
      row("bbbbbbbbbbb", "not_a_song", "2026-10-03T00:00:00Z"),
      row("aaaaaaaaaaa", "lyrics_mismatch", "2026-10-04T00:00:00Z"),
      row("aaaaaaaaaaa", "wrong_language", "2026-10-02T00:00:00Z"),
    ]);
    expect(out.map((s) => s.videoId)).toEqual(["aaaaaaaaaaa", "bbbbbbbbbbb"]);
    expect(out[0]).toMatchObject({ total: 3, byReason: { lyrics_mismatch: 2, wrong_language: 1 }, latestAt: "2026-10-04T00:00:00Z", title: "Bài aaaaaaaaaaa" });
  });
  it("báo hiệu bài đang bị ẩn và bỏ qua lý do lạ khỏi bảng đếm nhưng vẫn tính tổng", () => {
    const out = groupSongReports([row("ccccccccccc", "lyrics_mismatch", "2026-10-01T00:00:00Z", false), row("ccccccccccc", "khac", "2026-10-02T00:00:00Z", false)]);
    expect(out[0]).toMatchObject({ hidden: true, total: 2, byReason: { lyrics_mismatch: 1 } });
  });
  it("không có báo cáo thì rỗng", () => {
    expect(groupSongReports([])).toEqual([]);
  });
});
