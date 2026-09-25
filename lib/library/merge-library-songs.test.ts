import { describe, expect, it } from "vitest";
import { mergeLibrarySongs, type RemoteSongProgress } from "./merge-library-songs";

const remote = (over: Partial<RemoteSongProgress> = {}): RemoteSongProgress => ({
  videoId: "aaaaaaaaaaa", title: "A", channelTitle: "K", durationSec: 200, lastPositionSec: 50, completed: false,
  updatedAt: "2026-03-10T00:00:00Z", ...over,
});
const recent = (videoId: string, openedAt: number) => ({ videoId, title: `R-${videoId}`, channelTitle: "K", openedAt });

describe("mergeLibrarySongs", () => {
  it("tiến độ = vị trí / thời lượng; bài đã nghe hết là 100%", () => {
    const [a, b] = mergeLibrarySongs([remote(), remote({ videoId: "bbbbbbbbbbb", completed: true, lastPositionSec: 10 })], []);
    const byId = Object.fromEntries([a, b].map((s) => [s.videoId, s]));
    expect(byId.aaaaaaaaaaa.progress).toBe(0.25);
    expect(byId.bbbbbbbbbbb.progress).toBe(1);
  });

  it("bài chỉ xem trước (cục bộ) hiện với tiến độ 0; bài trùng chỉ một dòng, lấy thời điểm mới hơn", () => {
    const at = Date.parse("2026-03-11T00:00:00Z");
    const out = mergeLibrarySongs([remote()], [recent("aaaaaaaaaaa", at), recent("ccccccccccc", 1)]);
    expect(out.map((s) => s.videoId)).toEqual(["aaaaaaaaaaa", "ccccccccccc"]);
    expect(out[0].lastAt).toBe(at);
    expect(out[1].progress).toBe(0);
  });

  it("thời lượng 0 không chia cho 0; mới nhất xếp trước", () => {
    const out = mergeLibrarySongs([remote({ durationSec: 0 })], [recent("ddddddddddd", Date.parse("2027-01-01"))]);
    expect(out[0].videoId).toBe("ddddddddddd");
    expect(out[1].progress).toBe(0);
  });
});
