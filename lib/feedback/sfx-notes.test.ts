import { describe, expect, it } from "vitest";
import { sfxNotes } from "./sfx-notes";

describe("sfxNotes", () => {
  it("đúng đi lên, sai đi xuống, qua chặng là bốn nốt rải lên", () => {
    const up = sfxNotes("correct");
    expect(up[1].freq).toBeGreaterThan(up[0].freq);
    const down = sfxNotes("wrong");
    expect(down[1].freq).toBeLessThan(down[0].freq);
    const done = sfxNotes("complete");
    expect(done).toHaveLength(4);
    expect(done.map((n) => n.freq)).toEqual([...done.map((n) => n.freq)].sort((a, b) => a - b));
  });
  it("hiệu ứng ngắn (dưới 0,7 giây) và đủ nhỏ để không át giọng đọc", () => {
    for (const kind of ["correct", "wrong", "complete"] as const) {
      const notes = sfxNotes(kind);
      expect(Math.max(...notes.map((n) => n.at + n.dur))).toBeLessThan(0.7);
      expect(Math.max(...notes.map((n) => n.gain))).toBeLessThanOrEqual(0.1);
    }
  });
});
