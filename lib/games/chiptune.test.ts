import { describe, expect, it } from "vitest";
import { chiptuneNotes } from "./chiptune";

describe("chiptune", () => {
  it("bè trầm chỉ vang trên phách chẵn, bè lead luôn có nốt", () => {
    const notes = Array.from({ length: 16 }, (_, i) => chiptuneNotes(i));
    expect(notes.filter((n) => n.bass !== null)).toHaveLength(8);
    expect(notes.every((n) => n.lead > 100 && Number.isFinite(n.lead))).toBe(true);
  });
  it("vòng hợp âm lặp lại sau bốn ô nhịp", () => {
    expect(chiptuneNotes(3)).toEqual(chiptuneNotes(3 + 32));
  });
});
