import { describe, expect, it } from "vitest";
import { BEATS_PER_BAR, chordTones, initialMusicState, midiToHz, MOODS, planBar, secondsPerBeat, type Mood, type MusicState } from "./ambient-music";
import { karplusStrong } from "../../components/explore/pluck-synth";

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const mod12 = (n: number) => ((n % 12) + 12) % 12;
const moods = Object.keys(MOODS) as Mood[];

function play(mood: Mood, bars: number, seed = 42) {
  const rng = seeded(seed);
  let state: MusicState = initialMusicState();
  const out: { bar: number; notes: ReturnType<typeof planBar>["notes"] }[] = [];
  for (let bar = 0; bar < bars; bar++) {
    const r = planBar(mood, state, rng);
    out.push({ bar, notes: r.notes });
    state = r.next;
  }
  return out;
}

describe("ambient-music", () => {
  it("midiToHz: A4 = 440, lên một quãng tám thì gấp đôi", () => {
    expect(midiToHz(69)).toBeCloseTo(440);
    expect(midiToHz(81)).toBeCloseTo(880);
  });

  for (const mood of moods) {
    it(`${mood}: phách trong ô nhịp, độ to hợp lệ, giai điệu thuộc gam hoặc hợp âm hiện tại, nốt mạnh là nốt hợp âm, trầm thấp hơn giai điệu`, () => {
      const cfg = MOODS[mood];
      for (const { bar, notes } of play(mood, 120)) {
        const chord = cfg.progression[bar % cfg.progression.length];
        const tones = chordTones(chord).map(mod12);
        const melody = notes.filter((n) => n.voice === "melody");
        const bass = notes.filter((n) => n.voice === "bass");
        expect(bass.length).toBeGreaterThanOrEqual(1);
        expect(notes.filter((n) => n.voice === "pad")).toHaveLength(3);
        for (const n of notes) {
          expect(n.beat).toBeGreaterThanOrEqual(0);
          expect(n.beat).toBeLessThan(BEATS_PER_BAR);
          expect(n.beat * 2 % 1).toBe(0); // lưới nửa phách
          expect(n.gain).toBeGreaterThan(0);
          expect(n.gain).toBeLessThanOrEqual(1);
        }
        for (const n of melody) {
          const rel = mod12(n.midi - cfg.rootMidi);
          expect(cfg.scale.includes(rel) || tones.includes(rel), `ô ${bar}: nốt ${n.midi}`).toBe(true);
          expect(n.midi).toBeGreaterThan(Math.max(...bass.map((b) => b.midi)));
          if (n.beat === 0 || n.beat === 2) expect(tones.includes(rel), `nốt mạnh ô ${bar}`).toBe(true);
        }
        // Ô thứ tư của câu kết bằng nốt của hợp âm ở phách 3.
        if (bar % 4 === 3) expect(melody.some((n) => n.beat === 2)).toBe(true);
      }
    });
  }

  it("rải hợp âm chỉ có ở cảnh bật arp; vòng hòa âm lặp mỗi bốn ô nhịp", () => {
    expect(MOODS.hospital.arp).toBe(false);
    expect(play("hospital", 8).every((b) => b.notes.every((n) => n.voice !== "arp"))).toBe(true);
    expect(play("eatery", 8).some((b) => b.notes.some((n) => n.voice === "arp"))).toBe(true);
    const roots = play("room", 8).map((b) => Math.min(...b.notes.filter((n) => n.voice === "bass").map((n) => n.midi)));
    expect(roots.slice(0, 4)).toEqual(roots.slice(4, 8));
    expect(new Set(roots.slice(0, 4)).size).toBeGreaterThan(1); // có đổi hợp âm
  });

  it("cùng hạt giống ra cùng bản nhạc; nhịp từng cảnh khác nhau và cảnh yên tĩnh thưa hơn cảnh rộn ràng", () => {
    expect(play("room", 8, 5)).toEqual(play("room", 8, 5));
    expect(secondsPerBeat("shop")).toBeLessThan(secondsPerBeat("hospital"));
    const count = (m: Mood) => play(m, 120).reduce((s, b) => s + b.notes.filter((n) => n.voice === "melody").length, 0);
    expect(count("market")).toBeGreaterThan(count("hospital"));
  });
});

describe("karplusStrong (tiếng đàn dây gảy)", () => {
  it("ra mẫu hữu hạn trong [-1, 1], đúng độ dài, và tắt dần theo thời gian", () => {
    const sr = 44100;
    const out = karplusStrong(440, sr, 1.5, seeded(3));
    expect(out).toHaveLength(Math.floor(sr * 1.5));
    expect(out.every((v) => Number.isFinite(v) && Math.abs(v) <= 1)).toBe(true);
    const rms = (a: number, b: number) => Math.sqrt(out.slice(a, b).reduce((s, v) => s + v * v, 0) / (b - a));
    expect(rms(0, 4410)).toBeGreaterThan(rms(out.length - 8820, out.length - 4410) * 2);
  });
});
