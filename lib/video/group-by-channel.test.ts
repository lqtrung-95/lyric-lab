import { describe, expect, it } from "vitest";
import { groupByChannel } from "./group-by-channel";
import type { LessonSummary } from "./video-repo";

const v = (videoId: string, channelTitle: string): LessonSummary => ({ videoId, title: videoId, channelTitle, durationSec: 100, levelAvg: 3, lineCount: 10 });

describe("groupByChannel", () => {
  it("kênh nhiều video trước, giữ thứ tự video trong kênh", () => {
    const groups = groupByChannel([v("a", "B"), v("b", "A"), v("c", "A"), v("d", "A"), v("e", "B")]);
    expect(groups.map((g) => [g.channelTitle, g.videos.map((x) => x.videoId)])).toEqual([["A", ["b", "c", "d"]], ["B", ["a", "e"]]]);
  });
  it("cùng số video thì theo tên; tên khác hoa thường hoặc khoảng trắng thì gộp một kênh", () => {
    const groups = groupByChannel([v("a", "Zed"), v("b", "Alpha"), v("c", " alpha ")]);
    expect(groups.map((g) => g.videos.length)).toEqual([2, 1]);
    expect(groups[0].channelTitle).toBe("Alpha");
  });
  it("kênh không có tên gom vào Kênh khác ở cuối", () => {
    const groups = groupByChannel([v("a", ""), v("b", ""), v("c", "X")]);
    expect(groups.map((g) => g.channelTitle)).toEqual(["X", "Kênh khác"]);
  });
  it("danh sách rỗng", () => expect(groupByChannel([])).toEqual([]));
});
