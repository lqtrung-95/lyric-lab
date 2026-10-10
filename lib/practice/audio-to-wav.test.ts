import { describe, expect, it } from "vitest";
import { bytesToBase64, encodeWav } from "./audio-to-wav";

describe("encodeWav", () => {
  it("tạo tiêu đề WAV PCM 16-bit mono đúng kích thước", () => {
    const wav = encodeWav(new Float32Array([0, 0.5, -0.5, 1, -1]), 16_000);
    const view = new DataView(wav.buffer);
    const tag = (o: number) => String.fromCharCode(...wav.subarray(o, o + 4));
    expect(wav.length).toBe(44 + 5 * 2);
    expect([tag(0), tag(8), tag(12), tag(36)]).toEqual(["RIFF", "WAVE", "fmt ", "data"]);
    expect(view.getUint32(4, true)).toBe(36 + 10);
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(10);
  });

  it("đổi mẫu -1..1 sang số nguyên 16-bit và chặn giá trị vượt ngưỡng", () => {
    const view = new DataView(encodeWav(new Float32Array([0, 1, -1, 2, -2])).buffer);
    expect([0, 1, 2, 3, 4].map((i) => view.getInt16(44 + i * 2, true))).toEqual([0, 32767, -32768, 32767, -32768]);
  });
});

describe("bytesToBase64", () => {
  it("mã hóa đúng, kể cả dãy dài hơn một khúc", () => {
    expect(bytesToBase64(new Uint8Array([65, 66, 67]))).toBe("QUJD");
    const long = new Uint8Array(100_000).fill(7);
    expect(Buffer.from(bytesToBase64(long), "base64").equals(Buffer.from(long))).toBe(true);
  });
});
