import { describe, expect, it } from "vitest";
import { buildSsml } from "./build-ssml";
import { MAX_TTS_CHARS, normalizeTtsText, ttsStoragePath } from "./tts-text";

describe("normalizeTtsText", () => {
  it("chuyển giản thể và gọn khoảng trắng", () => {
    expect(normalizeTtsText("  離開  ")).toBe("离开");
    expect(normalizeTtsText("我   爱\n你")).toBe("我 爱 你");
  });

  it("từ chối: không phải chuỗi, rỗng, không có chữ Hán, quá dài", () => {
    for (const bad of [undefined, 42, "", "   ", "hello", "123", "你".repeat(MAX_TTS_CHARS + 1)]) expect(normalizeTtsText(bad)).toBeNull();
    expect(normalizeTtsText("你".repeat(MAX_TTS_CHARS))).not.toBeNull();
  });
});

describe("ttsStoragePath", () => {
  it("ổn định, khác nhau theo nội dung, có đuôi mp3", () => {
    expect(ttsStoragePath("离开")).toBe(ttsStoragePath("离开"));
    expect(ttsStoragePath("离开")).not.toBe(ttsStoragePath("离去"));
    expect(ttsStoragePath("离开")).toMatch(/^zh-CN-XiaoxiaoNeural\/[0-9a-f]{2}\/[0-9a-f]{64}\.mp3$/);
  });
});

describe("buildSsml", () => {
  it("escape ký tự XML để không chèn được thẻ SSML", () => {
    const ssml = buildSsml('</prosody><voice name="x">a&b');
    expect(ssml).not.toContain('</prosody><voice');
    expect(ssml).toContain("&lt;/prosody&gt;&lt;voice name=&quot;x&quot;&gt;a&amp;b");
  });

  it("chứa giọng và tốc độ", () => {
    expect(buildSsml("你好")).toContain('name="zh-CN-XiaoxiaoNeural"');
    expect(buildSsml("你好")).toContain('rate="-10%"');
  });
});
