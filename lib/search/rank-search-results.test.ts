import { describe, expect, it } from "vitest";
import { normalizeSearchQuery } from "./search-types";
import { rankSearchResults } from "./rank-search-results";

const s = (videoId: string, title: string, durationSec?: number) => ({ videoId, title, channelTitle: "K", durationSec });

describe("normalizeSearchQuery", () => {
  it("bỏ ký tự đặc biệt, gộp khoảng trắng, cắt 60 ký tự, từ chối chuỗi quá ngắn", () => {
    expect(normalizeSearchQuery("  周杰伦   稻香 ")).toBe("周杰伦 稻香");
    expect(normalizeSearchQuery("a%b,(c)")).toBe("a b  c".replace(/\s+/g, " "));
    expect(normalizeSearchQuery("x")).toBeNull();
    expect(normalizeSearchQuery("a".repeat(100))!.length).toBe(60);
  });
});

describe("rankSearchResults", () => {
  it("bỏ trùng, video quá ngắn/dài; giữ video không rõ thời lượng", () => {
    const out = rankSearchResults([s("aaaaaaaaaaa", "歌一", 200), s("aaaaaaaaaaa", "歌一", 200), s("bbbbbbbbbbb", "短", 30), s("ccccccccccc", "长", 4000), s("ddddddddddd", "歌四")]);
    expect(out.map((r) => r.videoId)).toEqual(["aaaaaaaaaaa", "ddddddddddd"]);
  });
  it("có từ 3 video chữ Hán trở lên thì bỏ video không có chữ Hán; ít hơn thì giữ hết", () => {
    const han = [s("h1111111111", "歌一", 200), s("h2222222222", "歌二", 200), s("h3333333333", "歌三", 200)];
    expect(rankSearchResults([...han, s("e1111111111", "English cover", 200)])).toHaveLength(3);
    expect(rankSearchResults([han[0], s("e1111111111", "English cover", 200)])).toHaveLength(2);
  });
  it("chỉ giữ video nhúng được khi biết danh sách", () => {
    const out = rankSearchResults([s("aaaaaaaaaaa", "歌一", 200), s("bbbbbbbbbbb", "歌二", 200)], new Set(["bbbbbbbbbbb"]));
    expect(out.map((r) => r.videoId)).toEqual(["bbbbbbbbbbb"]);
  });
  it("tối đa 8 kết quả", () => {
    const many = Array.from({ length: 20 }, (_, i) => s(`v${String(i).padStart(10, "0")}`, `歌${i}`, 200));
    expect(rankSearchResults(many)).toHaveLength(8);
  });
});
