import { describe, expect, it } from "vitest";
import { SCENES } from "../scenes";
import { buildCloze, segmentLine } from "./segment-and-cloze";
import { SCENE_STORIES } from "./stories";

describe("truyện của cảnh", () => {
  it.each(Object.entries(SCENE_STORIES))("%s: cảnh có thật, dùng gần hết từ của cảnh, câu ngắn, câu hỏi hợp lệ", (id, story) => {
    const scene = SCENES[id];
    expect(scene, id).toBeDefined();
    const terms = scene.objects.map((o) => o.term);
    const text = story.lines.map((l) => l.zh).join("");
    const used = terms.filter((t) => text.includes(t));
    expect(used.length, `dùng ${used.length}/${terms.length}: thiếu ${terms.filter((t) => !text.includes(t)).join(" ")}`).toBeGreaterThanOrEqual(Math.min(terms.length, 10));
    for (const l of story.lines) {
      expect(l.zh.length, l.zh).toBeLessThanOrEqual(40);
      expect(l.vi.length, l.zh).toBeGreaterThan(0);
    }
    expect(story.lines.length).toBeGreaterThanOrEqual(6);
    expect(story.question.wrong.length).toBeGreaterThanOrEqual(2);
    expect(story.question.wrong).not.toContain(story.question.right);
  });
});

describe("cắt câu và dựng bài điền từ", () => {
  const terms = ["筷子", "面条", "汤"];

  it("đánh dấu từ của cảnh, giữ nguyên phần còn lại", () => {
    expect(segmentLine("他用筷子吃面条。", terms)).toEqual([{ text: "他用" }, { text: "筷子", term: "筷子" }, { text: "吃" }, { text: "面条", term: "面条" }, { text: "。" }]);
    expect(segmentLine("没有从词。", terms)).toEqual([{ text: "没有从词。" }]);
  });

  it("ưu tiên từ dài khi trùng chỗ", () => {
    expect(segmentLine("小猫在门口。", ["猫", "门", "门口"])).toEqual([{ text: "小" }, { text: "猫", term: "猫" }, { text: "在" }, { text: "门口", term: "门口" }, { text: "。" }]);
  });

  it("mỗi từ khoét một lần, đáp án gồm đáp án đúng, các câu theo thứ tự truyện, đáp án nhiễu không trùng chữ có sẵn trong câu", () => {
    const lines = [{ zh: "他用筷子吃面条。" }, { zh: "他喝了汤。" }, { zh: "他又吃了面条。" }, { zh: "没有。" }];
    const items = buildCloze(lines, terms, 4, () => 0.3);
    expect(items.map((i) => i.answer)).toEqual(["筷子", "汤", "面条"].filter((a) => items.some((i) => i.answer === a)));
    expect(new Set(items.map((i) => i.answer)).size).toBe(items.length);
    for (const i of items) {
      expect(i.options).toContain(i.answer);
      expect(new Set(i.options).size).toBe(i.options.length);
      expect(i.before + i.answer + i.after).toBe(lines[i.lineIndex].zh);
      expect(i.options.filter((o) => o !== i.answer).every((o) => !i.before.includes(o) && !i.after.includes(o))).toBe(true);
    }
    expect(items.map((i) => i.lineIndex)).toEqual([...items.map((i) => i.lineIndex)].sort((a, b) => a - b));
  });

  it("truyện thật của các cảnh dựng được ít nhất 4 câu điền từ", () => {
    for (const [id, story] of Object.entries(SCENE_STORIES)) expect(buildCloze(story.lines, SCENES[id].objects.map((o) => o.term)).length, id).toBe(4);
  });
});
