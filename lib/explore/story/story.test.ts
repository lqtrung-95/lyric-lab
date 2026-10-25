import { describe, expect, it } from "vitest";
import { judge, readyToAccuse } from "./deduction";
import { enterNode, pickEntry, step, visibleChoices } from "./dialogue";
import { currentObjective, objectiveProgress } from "./objectives";
import { addFlag, applyEffects, emptyStory, holds, loadStory, recordCheck, saveStory, STORY_KEY } from "./story-state";
import type { DialogueNode, Objective } from "./story-types";

describe("story-state", () => {
  it("holds: đủ cờ all, không có cờ none; không điều kiện thì luôn đúng", () => {
    expect(holds(undefined, [])).toBe(true);
    expect(holds({ all: ["a", "b"] }, ["a"])).toBe(false);
    expect(holds({ all: ["a"], none: ["x"] }, ["a", "x"])).toBe(false);
    expect(holds({ all: ["a"], none: ["x"] }, ["a"])).toBe(true);
  });

  it("applyEffects đặt cờ và thêm manh mối không trùng, không sửa bản cũ", () => {
    const p0 = emptyStory();
    const p1 = applyEffects(p0, [{ flag: "f" }, { clue: "c" }, { flag: "f" }]);
    expect(p1.flags).toEqual(["f", "clue:c"]);
    expect(p1.clues).toEqual(["c"]);
    expect(p1.flags).toContain("clue:c"); // manh mối cũng đặt cờ
    expect(p0.flags).toEqual([]);
    expect(applyEffects(p1, [{ clue: "c" }]).clues).toEqual(["c"]);
    expect(addFlag(p1, "g").flags).toEqual(["f", "clue:c", "g"]);
  });

  it("recordCheck đếm đúng/tổng; lưu rồi đọc lại đúng, dữ liệu hỏng thì bắt đầu mới", () => {
    const p = recordCheck(recordCheck(emptyStory(), true), false);
    expect(p.checks).toEqual({ right: 1, total: 2 });
    const mem = new Map<string, string>();
    const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    saveStory(storage, p);
    expect(loadStory(storage)).toEqual(p);
    mem.set(STORY_KEY, "{hỏng");
    expect(loadStory(storage)).toEqual(emptyStory());
    mem.set(STORY_KEY, JSON.stringify({ flags: "x" }));
    expect(loadStory(storage)).toEqual(emptyStory());
  });
});

describe("dialogue", () => {
  const node: DialogueNode = {
    id: "n1", speaker: "owl", zh: "你好", vi: "Xin chào", effects: [{ flag: "met" }],
    choices: [
      { zh: "对", vi: "đúng", next: "n2", check: "right", effects: [{ clue: "c1" }] },
      { zh: "错", vi: "sai", next: "n3", check: "wrong" },
      { zh: "秘密", vi: "bí mật", next: "n4", when: { all: ["secret"] } },
    ],
  };

  it("pickEntry chọn mục đầu tiên có điều kiện đúng; không có thì null", () => {
    const entries = [{ when: { all: ["done"] }, node: "after" }, { node: "first" }];
    expect(pickEntry(entries, [])).toBe("first");
    expect(pickEntry(entries, ["done"])).toBe("after");
    expect(pickEntry([{ when: { all: ["x"] }, node: "n" }], [])).toBeNull();
    expect(pickEntry(undefined, [])).toBeNull();
  });

  it("enterNode áp hiệu ứng của câu; lựa chọn có điều kiện chỉ hiện khi đủ cờ", () => {
    const p = enterNode(emptyStory(), node);
    expect(p.flags).toEqual(["met"]);
    expect(visibleChoices(node, p.flags)).toHaveLength(2);
    expect(visibleChoices(node, ["secret"])).toHaveLength(3);
  });

  it("step: chọn đúng áp hiệu ứng và ghi kiểm tra đúng; chọn sai ghi sai; chỉ số sai thì ở lại; không có lựa chọn thì sang next", () => {
    const base = emptyStory();
    const right = step(node, base, 0);
    expect(right).toMatchObject({ next: "n2", moved: true });
    expect(right.progress.clues).toEqual(["c1"]);
    expect(right.progress.checks).toEqual({ right: 1, total: 1 });
    expect(step(node, base, 1).progress.checks).toEqual({ right: 0, total: 1 });
    expect(step(node, base, 9)).toMatchObject({ next: "n1", moved: false });
    expect(step({ id: "x", speaker: "a", zh: "z", vi: "v", next: "y" }, base, null)).toMatchObject({ next: "y", moved: true });
    expect(step({ id: "x", speaker: "a", zh: "z", vi: "v" }, base, null).next).toBeNull();
  });
});

describe("objectives và deduction", () => {
  const objectives: Objective[] = [
    { id: "a", text: "A", done: { all: ["a"] } },
    { id: "b", text: "B", when: { all: ["a"] }, done: { all: ["b"] } },
    { id: "c", text: "C", when: { all: ["b"] }, done: { all: ["c"] } },
  ];

  it("mục tiêu hiện tại là mục đầu tiên đang hiện mà chưa xong", () => {
    expect(currentObjective(objectives, [])?.id).toBe("a");
    expect(currentObjective(objectives, ["a"])?.id).toBe("b");
    expect(currentObjective(objectives, ["a", "b", "c"])).toBeNull();
    expect(objectiveProgress(objectives, ["a", "b"])).toEqual({ done: 2, total: 3 });
  });

  const story = { solution: { suspectId: "fox", keyClues: ["pen", "sheet", "witness"], needed: 2 } };
  it("judge: sai thủ phạm; đúng thủ phạm nhưng bằng chứng yếu; đủ bằng chứng", () => {
    expect(judge(story, "cat", ["pen", "sheet"])).toEqual({ type: "wrong_suspect", suspectId: "cat" });
    expect(judge(story, "fox", ["pen", "menu", "receipt"])).toEqual({ type: "weak_evidence", matched: 1, needed: 2 });
    expect(judge(story, "fox", ["pen", "pen", "menu"])).toEqual({ type: "weak_evidence", matched: 1, needed: 2 }); // chọn trùng không tính hai lần
    expect(judge(story, "fox", ["pen", "sheet"])).toEqual({ type: "solved" });
  });

  it("readyToAccuse chỉ khi đã nghe lời khai mọi nghi phạm", () => {
    const suspects = [{ metFlag: "met:a" }, { metFlag: "met:b" }];
    expect(readyToAccuse(suspects, ["met:a"])).toBe(false);
    expect(readyToAccuse(suspects, ["met:a", "met:b"])).toBe(true);
  });
});
