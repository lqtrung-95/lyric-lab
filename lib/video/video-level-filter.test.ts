import { describe, expect, it } from "vitest";
import { bandOfLevel, countByBand, filterAndSortVideos, videoBandForLevel } from "./video-level-filter";
import type { LessonSummary } from "./video-repo";

const v = (videoId: string, levelAvg: number | null, durationSec: number): LessonSummary => ({ videoId, title: videoId, channelTitle: "k", durationSec, levelAvg, lineCount: 10 });
const list = [v("a", 3.2, 600), v("b", 1.8, 1200), v("c", null, 300), v("d", 5.1, 900), v("e", 2.5, 100)];

describe("bandOfLevel", () => {
  it("chia dải theo ngưỡng 2,5 / 3,5 / 4,5 (HSK 3 và HSK 4 tách riêng)", () => {
    expect([1.8, 2.49, 2.5, 3.49, 3.5, 4.49, 4.5, 6.2].map(bandOfLevel)).toEqual(["1-2", "1-2", "3", "3", "4", "4", "5+", "5+"]);
    expect(bandOfLevel(null)).toBeNull();
  });
});

describe("videoBandForLevel", () => {
  it("ánh xạ level người học (1–7) sang dải video", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(videoBandForLevel)).toEqual(["1-2", "1-2", "3", "4", "5+", "5+", "5+"]);
  });
});

describe("filterAndSortVideos", () => {
  it("không lọc: giữ đủ mọi video (kể cả chưa có level) theo thứ tự gốc", () => {
    expect(filterAndSortVideos(list, null, "new").map((x) => x.videoId)).toEqual(["a", "b", "c", "d", "e"]);
  });
  it("lọc theo dải bỏ video chưa có level", () => {
    expect(filterAndSortVideos(list, "3", "new").map((x) => x.videoId)).toEqual(["a", "e"]);
    expect(filterAndSortVideos(list, "4", "new")).toEqual([]);
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
  it("đếm số video mỗi dải", () => expect(countByBand(list)).toEqual({ "1-2": 1, "3": 2, "4": 0, "5+": 1 }));
});
