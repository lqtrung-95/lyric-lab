import { describe, expect, it } from "vitest";
import { TONE_TEMPLATES, type ToneId } from "./tone-data";
import { analyzeSyllable, classifyTone, downsample, extractContour, resample, trackPitch, yinPitch } from "./pitch";

const RATE = 16_000;

/** Tín hiệu giọng nói giả: dao động có hài (3 họa âm) với F0 thay đổi theo hàm `f0(t)` (Hz), có đường bao tăng/giảm ở hai đầu. */
function voice(seconds: number, f0: (t: number) => number, rate = RATE): Float32Array {
  const n = Math.floor(seconds * rate);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    phase += (2 * Math.PI * f0(t)) / rate;
    const envelope = Math.min(1, t / 0.03, (seconds - t) / 0.03);
    out[i] = envelope * (Math.sin(phase) + 0.5 * Math.sin(2 * phase) + 0.25 * Math.sin(3 * phase)) * 0.3;
  }
  return out;
}

/** F0 theo mẫu thanh (nửa cung quanh `base` Hz), co giãn biên độ bằng `scale`. */
const toneVoice = (tone: ToneId, base = 200, scale = 1, seconds = 0.6, rate = RATE) =>
  voice(seconds, (t) => {
    const template = TONE_TEMPLATES[tone];
    const pos = Math.min(0.9999, Math.max(0, t / seconds)) * (template.length - 1);
    const lo = Math.floor(pos);
    const semis = (template[lo] + (template[lo + 1] - template[lo]) * (pos - lo)) * scale;
    return base * 2 ** (semis / 12);
  }, rate);

describe("yinPitch", () => {
  it("nhận đúng tần số của sóng hài ở nhiều cao độ (sai số dưới 1%)", () => {
    for (const hz of [100, 150, 220, 330, 400]) {
      const frame = voice(0.3, () => hz).subarray(1600, 2240); // khung 40 ms ở giữa tín hiệu (tránh đoạn tăng/giảm ở hai đầu)
      const got = yinPitch(frame, RATE)!;
      expect(Math.abs(got - hz) / hz).toBeLessThan(0.01);
    }
  });
  it("im lặng và nhiễu trắng không có cao độ", () => {
    expect(yinPitch(new Float32Array(640), RATE)).toBeNull();
    const noise = Float32Array.from({ length: 640 }, (_, i) => Math.sin(i * 12.9898) * 43758.5453 % 1);
    expect(yinPitch(noise, RATE)).toBeNull();
  });
});

describe("downsample", () => {
  it("hạ về 16 kHz giữ đúng độ dài tương ứng và tần số", () => {
    const hi = voice(0.5, () => 180, 48_000);
    const lo = downsample(hi, 48_000);
    expect(lo.length).toBe(Math.floor(hi.length / 3));
    const frames = trackPitch(hi, 48_000).filter((f) => f.f0 !== null);
    expect(Math.abs(frames[frames.length >> 1].f0! - 180)).toBeLessThan(4);
  });
});

describe("resample", () => {
  it("lấy 5 điểm cách đều, giữ hai đầu", () => {
    expect(resample([0, 10], 5)).toEqual([0, 2.5, 5, 7.5, 10]);
    expect(resample([3], 3)).toEqual([3, 3, 3]);
    expect(resample([], 5)).toEqual([]);
  });
});

describe("nhận dạng thanh từ tín hiệu giả (toàn bộ chuỗi dò cao độ → đường → thanh)", () => {
  it("nhận đúng 4 thanh ở giọng thấp, vừa và cao, biên độ hẹp và rộng", () => {
    for (const base of [120, 200, 300]) {
      for (const scale of [0.7, 1, 1.3]) {
        for (const tone of [1, 2, 3, 4] as ToneId[]) {
          const { guess } = analyzeSyllable(toneVoice(tone, base, scale), RATE);
          expect(guess.tone, `thanh ${tone} base ${base} scale ${scale}`).toBe(tone);
        }
      }
    }
  });
  it("nhận đúng khi thu ở 48 kHz", () => {
    for (const tone of [1, 2, 3, 4] as ToneId[]) expect(analyzeSyllable(toneVoice(tone, 220, 1, 0.6, 48_000), 48_000).guess.tone).toBe(tone);
  });
  it("im lặng thì không nhận ra thanh nào", () => {
    const { contour, guess } = analyzeSyllable(new Float32Array(RATE), RATE);
    expect(contour).toEqual([]);
    expect(guess.tone).toBeNull();
  });
});

describe("classifyTone", () => {
  const sampleOf = (tone: ToneId, noise = 0.25, scale = 1) => Array.from({ length: 40 }, (_, i) => {
    const pos = (i / 39) * 4, lo = Math.min(3, Math.floor(pos));
    const t = TONE_TEMPLATES[tone];
    return (t[lo] + (t[lo + 1] - t[lo]) * (pos - lo)) * scale + Math.sin(i * 1.7) * noise;
  });
  it("phân biệt đúng 4 mẫu có nhiễu nhẹ và nhiều biên độ", () => {
    for (const scale of [0.6, 1, 1.5]) for (const tone of [1, 2, 3, 4] as ToneId[]) expect(classifyTone(sampleOf(tone, 0.25, scale)).tone).toBe(tone);
  });
  it("thanh 2 đi lên chứ không bị nhầm thanh 4 và ngược lại", () => {
    expect(classifyTone(Array.from({ length: 30 }, (_, i) => -4 + i * 0.27)).tone).toBe(2);
    expect(classifyTone(Array.from({ length: 30 }, (_, i) => 5 - i * 0.33)).tone).toBe(4);
  });
  it("quá ngắn thì không kết luận", () => {
    expect(classifyTone([0, 1, 2]).tone).toBeNull();
  });
});

describe("extractContour", () => {
  it("nối khoảng trống hữu thanh ngắn và bỏ đoạn vô thanh dài", () => {
    const frames = Array.from({ length: 80 }, (_, i) => ({ time: i * 0.01, f0: i % 17 === 5 ? null : 200 + i }));
    expect(extractContour(frames).length).toBeGreaterThan(50);
    expect(extractContour(Array.from({ length: 30 }, (_, i) => ({ time: i * 0.01, f0: null })))).toEqual([]);
  });
  it("sửa nhảy quãng tám do dò sai", () => {
    const frames = Array.from({ length: 50 }, (_, i) => ({ time: i * 0.01, f0: i === 25 ? 400 : 200 }));
    const contour = extractContour(frames);
    expect(Math.max(...contour) - Math.min(...contour)).toBeLessThan(2);
  });
});
