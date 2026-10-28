import { describe, expect, it } from "vitest";
import { MAX_CLIP_B64, base64ToBytes, bytesToBase64, parseClip } from "./voice-clip";

describe("đoạn thoại ngắn", () => {
  it("mã hóa và giải mã base64 không mất dữ liệu (cả đoạn lớn hơn một khối 32 KB)", () => {
    const bytes = Uint8Array.from({ length: 70_000 }, (_, i) => i % 256);
    expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes]);
  });

  it("chỉ nhận âm thanh webm/ogg/mp4, base64 hợp lệ và không quá lớn", () => {
    expect(parseClip({ mime: "audio/webm;codecs=opus", b64: "QUJD" })).toEqual({ mime: "audio/webm;codecs=opus", b64: "QUJD" });
    expect(parseClip({ mime: "audio/mp4", b64: "QUJD" })).not.toBeNull();
    expect(parseClip({ mime: "text/html", b64: "QUJD" })).toBeNull();
    expect(parseClip({ mime: "audio/webm", b64: "<script>" })).toBeNull();
    expect(parseClip({ mime: "audio/webm", b64: "A".repeat(MAX_CLIP_B64 + 4) })).toBeNull();
    expect(parseClip({ mime: "audio/webm", b64: "" })).toBeNull();
    expect(parseClip(null)).toBeNull();
  });
});
