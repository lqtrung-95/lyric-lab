import { describe, expect, it } from "vitest";
import { cleanCaptionLines } from "./clean-caption-lines";

// Lời hư cấu từ docs/design-brief.md mục 6.
const L = (text: string, start: number, end: number) => ({ text, start, end });

describe("cleanCaptionLines", () => {
  it("bỏ dòng rác và ký hiệu nốt nhạc", () => {
    const out = cleanCaptionLines([
      L("[Music]", 0, 3),
      L("♪", 3, 4),
      L("[音乐]", 4, 5),
      L("♪ 窗外的城市慢慢睡了 ♪", 5, 10),
      L("   ", 10, 11),
    ]);
    expect(out).toEqual([L("窗外的城市慢慢睡了", 5, 10)]);
  });

  it("gộp dòng trùng liên tiếp", () => {
    const out = cleanCaptionLines([L("我从来没想过会离开", 5, 8), L("我从来没想过会离开", 8, 10)]);
    expect(out).toEqual([L("我从来没想过会离开", 5, 10)]);
  });

  it("gộp dòng quá ngắn với dòng liền kề", () => {
    const out = cleanCaptionLines([L("你的笑", 10, 10.4), L("比星光还亮", 10.5, 14)]);
    expect(out).toEqual([L("你的笑 比星光还亮", 10, 14)]);
  });

  it("không gộp khi có khoảng hở lớn", () => {
    const out = cleanCaptionLines([L("你的笑", 10, 10.4), L("比星光还亮", 15, 18)]);
    expect(out).toHaveLength(2);
  });

  it("không sửa mảng đầu vào", () => {
    const input = [L("你的笑", 10, 10.4), L("比星光还亮", 10.5, 14)];
    cleanCaptionLines(input);
    expect(input[0].text).toBe("你的笑");
  });
});
