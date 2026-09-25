import { describe, expect, it } from "vitest";
import { buildLineSegments } from "./line-segments";

const tokens = [{ text: "我" }, { text: "从来", itemId: "vocab:从来" }, { text: "没想" }, { text: "过" }, { text: "会" }, { text: "离开", itemId: "vocab:离开" }];
const none = { vocabIds: new Set<string>(), grammar: [] };

describe("buildLineSegments", () => {
  it("không tô gì: mỗi token một đoạn, không có nhãn", () => {
    const segs = buildLineSegments({ tokens }, none);
    expect(segs.map((s) => s.text).join("")).toBe("我从来没想过会离开");
    expect(segs.every((s) => !s.vocabId && !s.grammarId)).toBe(true);
  });

  it("tô từ vựng chỉ khi mục nằm trong danh sách hiển thị", () => {
    const segs = buildLineSegments({ tokens }, { vocabIds: new Set(["vocab:离开"]), grammar: [] });
    expect(segs.filter((s) => s.vocabId).map((s) => s.text)).toEqual(["离开"]);
  });

  it("gạch chân ngữ pháp theo ký tự, cắt ngang token", () => {
    const segs = buildLineSegments({ tokens }, { vocabIds: new Set(), grammar: [{ id: "grammar:0", ranges: [[1, 4], [5, 6]] }] });
    expect(segs.filter((s) => s.grammarId).map((s) => s.text)).toEqual(["从来", "没", "过"]);
    expect(segs.map((s) => s.text).join("")).toBe("我从来没想过会离开");
  });

  it("từ vựng trùng cụm ngữ pháp mang cả hai nhãn", () => {
    const segs = buildLineSegments({ tokens }, { vocabIds: new Set(["vocab:从来"]), grammar: [{ id: "grammar:0", ranges: [[1, 4], [5, 6]] }] });
    expect(segs.find((s) => s.text === "从来")).toMatchObject({ vocabId: "vocab:从来", grammarId: "grammar:0" });
  });
});
