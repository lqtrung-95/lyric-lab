import { describe, expect, it } from "vitest";
import { addRecentSong, parseRecentSongs, type RecentSong, removeRecentSong } from "./recent-songs";

const song = (videoId: string, openedAt = 1): RecentSong => ({ videoId, title: `t-${videoId}`, channelTitle: "c", openedAt });

describe("addRecentSong", () => {
  it("đưa bài mới lên đầu, bỏ bản cũ của cùng video", () => {
    const out = addRecentSong([song("a"), song("b")], song("b", 9));
    expect(out.map((s) => s.videoId)).toEqual(["b", "a"]);
    expect(out[0].openedAt).toBe(9);
  });
  it("giới hạn số bài", () => {
    const list = ["a", "b", "c"].map((id) => song(id));
    expect(addRecentSong(list, song("d"), 3).map((s) => s.videoId)).toEqual(["d", "a", "b"]);
  });
});

describe("parseRecentSongs", () => {
  it("dữ liệu hỏng hoặc sai kiểu → mảng rỗng, bỏ phần tử sai", () => {
    expect(parseRecentSongs(null)).toEqual([]);
    expect(parseRecentSongs("{không phải json")).toEqual([]);
    expect(parseRecentSongs('{"a":1}')).toEqual([]);
    expect(parseRecentSongs(JSON.stringify([song("a"), { videoId: 1 }]))).toHaveLength(1);
  });

  it("removeRecentSong bỏ đúng bài, giữ thứ tự, không đổi khi không có", () => {
    const list = [1, 2, 3].map((n) => ({ videoId: `id${n}`, title: `t${n}`, channelTitle: "c", openedAt: n }));
    expect(removeRecentSong(list, "id2").map((s) => s.videoId)).toEqual(["id1", "id3"]);
    expect(removeRecentSong(list, "none")).toEqual(list);
  });
});
