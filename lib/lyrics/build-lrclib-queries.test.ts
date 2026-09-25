import { describe, expect, it } from "vitest";
import { buildLrclibQueries } from "./build-lrclib-queries";

// Tiêu đề hư cấu theo mẫu tiêu đề YouTube thường gặp.
describe("buildLrclibQueries", () => {
  it("lấy tên bài trong 【】 và bỏ Official Music Video", () => {
    const q = buildLrclibQueries("歌手甲 Singer A【夜车 Night Train】-Official Music Video");
    expect(q[0]).toBe("歌手甲 夜车");
    expect(q).toContain("夜车");
    expect(q).toContain("夜车 Night Train");
    expect(q.join(" ")).not.toMatch(/official/i);
  });

  it("bỏ câu trích lời trong 『』 và nhãn 動態歌詞", () => {
    const q = buildLrclibQueries("歌手乙 - 雨天『窗外的城市慢慢睡了』【動態歌詞Lyrics】");
    expect(q.join(" ")).not.toContain("窗外");
    expect(q).toContain("雨天");
    expect(q.join(" ")).not.toContain("動態歌詞");
  });

  it("không có ngoặc: dùng tiêu đề đã làm sạch", () => {
    expect(buildLrclibQueries("夜车 歌手甲 (歌词版)")).toEqual(["夜车 歌手甲", "夜车", "歌手甲"]);
  });

  it("『MV』 ngắn không phải lời nên không làm mất tên bài; chữ phồn đổi sang giản", () => {
    const q = buildLrclibQueries("『MV』歌手甲Singer A - 夜車 官方高畫質 Official HD MV");
    expect(q[0]).toBe("歌手甲 夜车");
  });

  it("tối đa 5 truy vấn, không trùng (kể cả phồn/giản)", () => {
    const q = buildLrclibQueries("夜車【夜车】【夜車】");
    expect(q.length).toBeLessThanOrEqual(5);
    expect(new Set(q.map((s) => s.replace(/車/g, "车"))).size).toBe(q.length);
  });
});
