import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEVEL, initialLearnerState, itemKey, markKnown, parseLearnerState, setLevel, toggleSaved, unmarkKnown, type SavedItem,
} from "./learner-state";

const saved = (key: string): SavedItem => ({ key, videoId: "dQw4w9WgXcQ", type: "vocab", term: "城市", lineIndex: 0, start: 5, savedAt: 1 });

describe("learner state", () => {
  it("itemKey phân biệt từ vựng và ngữ pháp cùng chữ", () => {
    expect(itemKey({ type: "vocab", term: "把" })).not.toBe(itemKey({ type: "grammar", term: "把" }));
  });

  it("setLevel kẹp trong 1–7", () => {
    expect(setLevel(initialLearnerState, 0).level).toBe(1);
    expect(setLevel(initialLearnerState, 99).level).toBe(7);
    expect(setLevel(initialLearnerState, 4.4).level).toBe(4);
  });

  it("markKnown không trùng; unmarkKnown hoàn tác", () => {
    const a = markKnown(markKnown(initialLearnerState, "vocab:城市"), "vocab:城市");
    expect(a.known).toEqual(["vocab:城市"]);
    expect(unmarkKnown(a, "vocab:城市").known).toEqual([]);
  });

  it("toggleSaved lưu rồi bỏ lưu", () => {
    const on = toggleSaved(initialLearnerState, saved("vocab:城市"));
    expect(on.saved).toHaveLength(1);
    expect(toggleSaved(on, saved("vocab:城市")).saved).toEqual([]);
  });

  it("parseLearnerState chịu được dữ liệu hỏng", () => {
    expect(parseLearnerState(null)).toEqual(initialLearnerState);
    expect(parseLearnerState("{hỏng")).toEqual(initialLearnerState);
    const p = parseLearnerState(JSON.stringify({ level: "x", known: [1, "vocab:a"], saved: [{ key: 1 }, saved("vocab:b")] }));
    expect(p.level).toBe(DEFAULT_LEVEL);
    expect(p.known).toEqual(["vocab:a"]);
    expect(p.saved.map((s) => s.key)).toEqual(["vocab:b"]);
  });
});
