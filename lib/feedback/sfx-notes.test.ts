import { describe, expect, it } from "vitest";
import { comboRatio, sfxNotes } from "./sfx-notes";

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
    for (const kind of ["correct", "wrong", "complete", "xp", "quest", "streak"] as const) {
      const notes = sfxNotes(kind);
      expect(Math.max(...notes.map((n) => n.at + n.dur))).toBeLessThan(0.7);
      expect(Math.max(...notes.map((n) => n.gain))).toBeLessThanOrEqual(0.1);
    }
  });
  it("các hiệu ứng thưởng đi lên; lên cấp dài nhất nhưng vẫn dưới 1 giây", () => {
    for (const kind of ["xp", "quest", "streak", "levelup"] as const) {
      const f = sfxNotes(kind).map((n) => n.freq);
      expect(f).toEqual([...f].sort((a, b) => a - b));
      expect(Math.max(...sfxNotes(kind).map((n) => n.gain))).toBeLessThanOrEqual(0.1);
    }
    expect(Math.max(...sfxNotes("levelup").map((n) => n.at + n.dur))).toBeLessThan(1);
  });
  it("đúng liên tiếp thì cao dần rồi dừng ở một quãng tám; vẫn ngắn và nhỏ", () => {
    const base = sfxNotes("correct", 0)[0].freq;
    const f = [0, 1, 2, 3, 4, 5, 9].map((c) => sfxNotes("correct", c)[0].freq);
    expect(f).toEqual([...f].sort((a, b) => a - b));
    expect(f[5]).toBeCloseTo(base * 2);
    expect(f[6]).toBe(f[5]);
    expect(comboRatio(-3)).toBe(1);
    for (const c of [0, 5]) expect(Math.max(...sfxNotes("correct", c).map((n) => n.at + n.dur))).toBeLessThan(0.7);
  });
  it("tap, perfect, fail: nhỏ, hữu hạn; perfect dưới 1 giây; fail đi xuống", () => {
    for (const kind of ["tap", "perfect", "fail"] as const) {
      const notes = sfxNotes(kind);
      expect(notes.length).toBeGreaterThan(0);
      expect(Math.max(...notes.map((n) => n.gain))).toBeLessThanOrEqual(0.1);
      expect(Math.max(...notes.map((n) => n.at + n.dur))).toBeLessThan(1);
    }
    const f = sfxNotes("fail").map((n) => n.freq);
    expect(f).toEqual([...f].sort((a, b) => b - a));
  });
});
