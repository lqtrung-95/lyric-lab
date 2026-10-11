import { describe, expect, it } from "vitest";
import { bandOfLevel, countByBand, filterAndSortVideos } from "./video-level-filter";
import type { LessonSummary } from "./video-repo";

const v = (videoId: string, levelAvg: number | null, durationSec: number): LessonSummary => ({ videoId, title: videoId, channelTitle: "k", durationSec, levelAvg, lineCount: 10 });
const list = [v("a", 3.2, 600), v("b", 1.8, 1200), v("c", null, 300), v("d", 5.1, 900), v("e", 2.5, 100)];

describe("bandOfLevel", () => {
  it("chia dải theo ngưỡng 2,5 / 4,5 / 6,5 giống tab Khám phá", () => {
    expect([1.8, 2.49, 2.5, 4.49, 4.5, 6.4, 6.5, 7].map(bandOfLevel)).toEqual(["1-2", "1-2", "3-4", "3-4", "5-6", "5-6", "7", "7"]);
    expect(bandOfLevel(null)).toBeNull();
  });
});

describe("filterAndSortVideos", () => {
  it("không lọc: giữ đủ mọi video (kể cả chưa có level) theo thứ tự gốc", () => {
    expect(filterAndSortVideos(list, null, "new").map((x) => x.videoId)).toEqual(["a", "b", "c", "d", "e"]);
  });
  it("lọc theo dải bỏ video chưa có level", () => {
    expect(filterAndSortVideos(list, "3-4", "new").map((x) => x.videoId)).toEqual(["a", "e"]);
    expect(filterAndSortVideos(list, "7", "new")).toEqual([]);
  });
  it("sắp dễ → khó: video chưa có level xuống cuối; ngắn → dài theo thời lượng", () => {
    expect(filterAndSortVideos(list, null, "easy").map((x) => x.videoId)).toEqual(["b", "e", "a", "d", "c"]);
    expect(filterAndSortVideos(list, null, "short").map((x) => x.videoId)).toEqual(["e", "c", "a", "d", "b"]);
  });
  it("không làm đổi mảng gốc", () => {
    const copy = [...list];
    filterAndSortVideos(list, null, "easy");
    expect(list).toEqual(copy);
  });
});

describe("countByBand", () => {
  it("đếm số video mỗi dải", () => expect(countByBand(list)).toEqual({ "1-2": 1, "3-4": 2, "5-6": 1, "7": 0 }));
});
