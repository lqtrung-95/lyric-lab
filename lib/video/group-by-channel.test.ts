import { describe, expect, it } from "vitest";
import { channelFromSlug, channelHref, groupByChannel, videosOfChannel } from "./group-by-channel";
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

describe("địa chỉ trang kênh", () => {
  it("mã hóa tên kênh có dấu, chữ Hán, khoảng trắng và ký tự đặc biệt rồi đọc lại đúng", () => {
    for (const name of ["DaihuaXiyou 呆話西遊", "我的爸爸是條龍", "A/B & C?#", "Kênh 100%"]) {
      const href = channelHref(name);
      expect(href.startsWith("/video/kenh/")).toBe(true);
      expect(href.slice("/video/kenh/".length)).not.toMatch(/[/?#]/);
      expect(channelFromSlug(href.slice("/video/kenh/".length))).toBe(name);
    }
  });
  it("kênh không có tên dùng '-' và đọc lại thành rỗng; slug hỏng không ném lỗi", () => {
    expect(channelHref("  ")).toBe("/video/kenh/-");
    expect(channelFromSlug("-")).toBe("");
    expect(channelFromSlug("%E0%A4%A")).toBe("%E0%A4%A");
  });
});

describe("videosOfChannel", () => {
  it("lọc đúng kênh, không phân biệt hoa thường/khoảng trắng, giữ thứ tự; kênh không tên khớp video không tên", () => {
    const all = [v("a", "Alpha"), v("b", "Beta"), v("c", " alpha "), v("d", "")];
    expect(videosOfChannel(all, "ALPHA").map((x) => x.videoId)).toEqual(["a", "c"]);
    expect(videosOfChannel(all, "").map((x) => x.videoId)).toEqual(["d"]);
    expect(videosOfChannel(all, "Không có")).toEqual([]);
  });
});
