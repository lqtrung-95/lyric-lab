import { describe, expect, it } from "vitest";
import type { DialogueDef } from "@/lib/dialogues/dialogue-types";
import { seededRng } from "@/lib/practice/random";
import { pickReflexItems, questionPairs } from "./reflex-questions";

const d = (id: string, lines: [number, string][]): DialogueDef => ({
  id, title: { zh: "", vi: id }, topic: "life", speakers: ["A", "B"], lines: lines.map(([who, zh]) => ({ who, zh, vi: `vi-${zh}` })),
});

const café = d("cafe", [[0, "你想喝什么？"], [1, "我想喝一杯咖啡。"], [0, "要加糖吗？"], [1, "不用，谢谢。"], [0, "好的。"]]);
const tripD = d("trip", [[0, "你去哪儿？"], [1, "我去北京。"]]);

describe("questionPairs", () => {
  it("lấy cặp hỏi–đáp của hai người khác nhau, bỏ câu không phải hỏi", () => {
    const pairs = questionPairs(café);
    expect(pairs.map((p) => p.q)).toEqual(["你想喝什么？", "要加糖吗？"]);
    expect(pairs[0]).toMatchObject({ a: "我想喝一杯咖啡。", aVi: "vi-我想喝一杯咖啡。", dialogueId: "cafe" });
  });
  it("bỏ cặp mà câu đáp là câu hỏi hoặc quá ngắn", () => {
    expect(questionPairs(d("x", [[0, "你好吗？"], [1, "你呢？"]]))).toEqual([]);
    expect(questionPairs(d("y", [[0, "你好吗？"], [1, "好"]]))).toEqual([]);
  });
});

describe("pickReflexItems", () => {
  it("mỗi hội thoại một câu trước, đủ số lượng khi có thể, lọc theo cấp", () => {
    const levels = new Map<string, number | null>([["cafe", 2], ["trip", 5]]);
    const items = pickReflexItems([café, tripD], levels, 3, 4, seededRng(1));
    expect(items).toHaveLength(2);
    expect(items.every((i) => i.dialogueId === "cafe")).toBe(true);
    const all = pickReflexItems([café, tripD], new Map(), 3, 4, seededRng(1));
    expect(new Set(all.map((i) => i.dialogueId)).size).toBe(2);
    expect(all).toHaveLength(3);
  });
});
