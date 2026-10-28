import { describe, expect, it } from "vitest";
import { createVad, rms } from "./vad";

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
