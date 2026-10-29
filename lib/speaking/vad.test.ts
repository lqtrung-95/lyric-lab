import { describe, expect, it } from "vitest";
import { CONVERSATION_VAD, DEFAULT_VAD, createVad, rms } from "./vad";

const opts = { threshold: 0.05, endSilenceMs: 1000, minSpeechMs: 300 };

describe("rms", () => {
  it("0 cho khung rỗng hoặc im lặng, đúng giá trị cho sóng vuông", () => {
    expect(rms([])).toBe(0);
    expect(rms([0, 0, 0])).toBe(0);
    expect(rms([0.5, -0.5, 0.5, -0.5])).toBeCloseTo(0.5);
  });
});

describe("createVad", () => {
  it("ghi mốc bắt đầu nói tính từ mẫu đầu tiên", () => {
    const v = createVad(opts);
    expect(v.push(0.01, 1000)).toBe("none");
    expect(v.push(0.01, 1050)).toBe("none");
    expect(v.push(0.2, 1650)).toBe("onset");
    expect(v.onsetMs).toBe(650);
  });
  it("kết thúc lượt khi im lặng đủ lâu sau khi đã nói đủ thời gian", () => {
    const v = createVad(opts);
    v.push(0, 0);
    v.push(0.2, 100);
    v.push(0.2, 300);
    v.push(0.2, 500); // đã có ~400ms tiếng
    expect(v.push(0, 1000)).toBe("none");
    expect(v.push(0, 1600)).toBe("end");
  });
  it("không kết thúc khi chỉ có tiếng động quá ngắn", () => {
    const v = createVad(opts);
    v.push(0, 0);
    v.push(0.3, 50);
    expect(v.push(0, 5000)).toBe("none");
  });
  it("chưa nói thì không bao giờ kết thúc", () => {
    const v = createVad(opts);
    for (let t = 0; t < 10_000; t += 100) expect(v.push(0, t)).toBe("none");
    expect(v.onsetMs).toBeNull();
  });
});

describe("CONVERSATION_VAD kiên nhẫn hơn mặc định", () => {
  /** Nói 1 giây rồi im lặng; trả về sau bao lâu im lặng thì kết thúc (null nếu chưa kết thúc trong 5 giây). */
  const silenceUntilEnd = (o: typeof DEFAULT_VAD): number | null => {
    const vad = createVad(o);
    let t = 0;
    for (; t <= 1000; t += 50) vad.push(0.2, t);
    for (let q = 50; q <= 5000; q += 50) if (vad.push(0, 1000 + q) === "end") return q;
    return null;
  };
  it("mặc định dừng sau ~1,3 giây im lặng, hội thoại chờ ~3 giây", () => {
    expect(silenceUntilEnd(DEFAULT_VAD)).toBeLessThanOrEqual(1400);
    expect(silenceUntilEnd(CONVERSATION_VAD)).toBeGreaterThanOrEqual(3000);
    expect(silenceUntilEnd(CONVERSATION_VAD)).toBeLessThanOrEqual(3100);
  });
});
