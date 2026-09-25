import { describe, expect, it } from "vitest";
import { buildLineSegments } from "./line-segments";

const tokens = [{ text: "我" }, { text: "从来", itemId: "vocab:从来" }, { text: "没想" }, { text: "过" }, { text: "会" }, { text: "离开", itemId: "vocab:离开" }, { text: "，" }];
const none = { vocabIds: new Set<string>(), grammar: [] };

describe("buildLineSegments", () => {
  it("không tô gì: mỗi token một nhóm nguyên vẹn, dấu câu không phải chữ Hán", () => {
    const groups = buildLineSegments({ tokens }, none);
    expect(groups.map((g) => g.text).join("")).toBe("我从来没想过会离开，");
    expect(groups.every((g) => !g.vocabId && g.parts.every((p) => !p.grammarId))).toBe(true);
    expect(groups.at(-1)!.isHan).toBe(false);
    expect(groups[0].isHan).toBe(true);
  });

  it("tô từ vựng chỉ khi mục nằm trong danh sách hiển thị", () => {
    const groups = buildLineSegments({ tokens }, { vocabIds: new Set(["vocab:离开"]), grammar: [] });
    expect(groups.filter((g) => g.vocabId).map((g) => g.text)).toEqual(["离开"]);
  });

  it("gạch chân ngữ pháp theo ký tự, cắt ngang token nhưng token vẫn nguyên", () => {
    const groups = buildLineSegments({ tokens }, { vocabIds: new Set(), grammar: [{ id: "grammar:0", ranges: [[1, 4], [5, 6]] }] });
    expect(groups.find((g) => g.text === "没想")!.parts).toEqual([{ text: "没", grammarId: "grammar:0" }, { text: "想", grammarId: undefined }]);
    expect(groups.find((g) => g.text === "从来")!.parts).toEqual([{ text: "从来", grammarId: "grammar:0" }]);
    expect(groups.map((g) => g.text).join("")).toBe("我从来没想过会离开，");
  });

  it("từ vựng trùng cụm ngữ pháp mang cả hai nhãn", () => {
    const groups = buildLineSegments({ tokens }, { vocabIds: new Set(["vocab:从来"]), grammar: [{ id: "grammar:0", ranges: [[1, 4]] }] });
    const g = groups.find((x) => x.text === "从来")!;
    expect(g.vocabId).toBe("vocab:从来");
    expect(g.parts[0].grammarId).toBe("grammar:0");
  });
});
