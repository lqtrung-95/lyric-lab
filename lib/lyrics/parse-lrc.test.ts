import { describe, expect, it } from "vitest";
import { parseLrc } from "./parse-lrc";

// Lời hư cấu từ docs/design-brief.md mục 6.
describe("parseLrc", () => {
  it("đọc dòng, end = start dòng kế, dòng cuối kéo dài mặc định", () => {
    const lrc = "[ti:夜车]\n[00:00.00]窗外的城市慢慢睡了\n[00:05.50]我从来没想过会离开\n[00:10.00]你的笑比星光还亮";
    expect(parseLrc(lrc)).toEqual([
      { text: "窗外的城市慢慢睡了", start: 0, end: 5.5 },
      { text: "我从来没想过会离开", start: 5.5, end: 10 },
      { text: "你的笑比星光还亮", start: 10, end: 15 },
    ]);
  });

  it("dòng rỗng làm mốc kết thúc rồi bị loại", () => {
    const lrc = "[00:00.00]窗外的城市慢慢睡了\n[00:04.00]\n[00:08.00]我从来没想过会离开";
    const out = parseLrc(lrc);
    expect(out).toHaveLength(2);
    expect(out[0].end).toBe(4);
  });

  it("nhiều thẻ thời gian trên một dòng, sắp xếp theo thời gian, hỗ trợ .x và :xx", () => {
    const out = parseLrc("[00:10.5][00:02:25]就算路再远我也不怕");
    expect(out.map((l) => l.start)).toEqual([2.25, 10.5]);
  });

  it("không có thẻ thời gian → mảng rỗng", () => {
    expect(parseLrc("chỉ là văn bản\nkhông có thẻ")).toEqual([]);
  });
});
