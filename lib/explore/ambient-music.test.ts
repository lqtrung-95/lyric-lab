import { describe, expect, it } from "vitest";
import { BEATS_PER_BAR, initialMusicState, midiToHz, MOODS, planBar, secondsPerBeat, type Mood } from "./ambient-music";

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const inScale = (mood: Mood, midi: number) => MOODS[mood].scale.includes(((midi - MOODS[mood].rootMidi) % 12 + 12) % 12);

describe("ambient-music", () => {
  it("midiToHz: A4 = 440, lên một quãng tám thì gấp đôi", () => {
    expect(midiToHz(69)).toBeCloseTo(440);
    expect(midiToHz(81)).toBeCloseTo(880);
  });

  for (const mood of ["room", "eatery"] as const) {
    it(`${mood}: mọi nốt thuộc gam ngũ cung, nốt trầm thấp hơn giai điệu, phách trong ô nhịp, nhiều ô nhịp liên tiếp đều hợp lệ`, () => {
      const rng = seeded(42);
      let state = initialMusicState();
      let melody = 0;
      for (let bar = 0; bar < 200; bar++) {
        const { notes, next } = planBar(mood, state, rng);
        const bass = notes.filter((n) => n.voice === "bass");
        expect(bass).toHaveLength(1);
        for (const n of notes) {
          expect(inScale(mood, n.midi), `${n.midi}`).toBe(true);
          expect(n.beat).toBeGreaterThanOrEqual(0);
          expect(n.beat).toBeLessThan(BEATS_PER_BAR);
          expect(n.gain).toBeGreaterThan(0);
          expect(n.gain).toBeLessThanOrEqual(1);
          if (n.voice === "melody") { melody++; expect(n.midi).toBeGreaterThan(bass[0].midi); }
        }
        state = next;
      }
      // Mật độ thật sự gần cấu hình: 200 ô nhịp x 4 phách.
      expect(melody / (200 * BEATS_PER_BAR)).toBeGreaterThan(MOODS[mood].density - 0.1);
      expect(melody / (200 * BEATS_PER_BAR)).toBeLessThan(MOODS[mood].density + 0.1);
    });
  }

  it("cùng hạt giống ra cùng bản nhạc; quán ăn nhanh hơn phòng", () => {
    const a = planBar("room", initialMusicState(), seeded(5));
    const b = planBar("room", initialMusicState(), seeded(5));
    expect(a).toEqual(b);
    expect(secondsPerBeat("eatery")).toBeLessThan(secondsPerBeat("room"));
  });
});
