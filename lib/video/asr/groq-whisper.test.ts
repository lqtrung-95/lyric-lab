import { describe, expect, it, vi } from "vitest";
import { isHallucinatedWhisperSegment, transcribeWithGroq, whisperSegmentsToRaw } from "./groq-whisper";

describe("whisper segments", () => {
  it("loại đoạn bịa khi im lặng hoặc lặp chữ, đổi sang giản thể và cộng offset", () => {
    const raw = whisperSegmentsToRaw([
      { start: 0, end: 2, text: "這是一個測試", avg_logprob: -0.2, no_speech_prob: 0.01, compression_ratio: 1.2 },
      { start: 2, end: 4, text: "请订阅", avg_logprob: -1.5, no_speech_prob: 0.9, compression_ratio: 1 },
      { start: 4, end: 6, text: "好好好好好好好好", avg_logprob: -0.3, no_speech_prob: 0, compression_ratio: 3 },
    ], 100);
    expect(raw).toEqual([{ start: 100, end: 102, text: "这是一个测试" }]);
    expect(isHallucinatedWhisperSegment({ start: 0, end: 1, text: "x", no_speech_prob: 0.7, avg_logprob: -0.5 })).toBe(false);
  });
});

describe("transcribeWithGroq", () => {
  it("gửi file, ngôn ngữ zh và nhận segments", async () => {
    const fetchFn = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const form = init!.body as FormData;
      expect(form.get("language")).toBe("zh");
      expect(form.get("response_format")).toBe("verbose_json");
      expect((init!.headers as Record<string, string>).Authorization).toBe("Bearer k");
      return new Response(JSON.stringify({ segments: [{ start: 0, end: 1, text: "你好" }] }));
    });
    expect(await transcribeWithGroq(new Uint8Array([1, 2]), "a.mp3", "k", fetchFn as never)).toHaveLength(1);
  });
  it("ném lỗi kèm mã khi Groq từ chối", async () => {
    await expect(transcribeWithGroq(new Uint8Array(), "a.mp3", "k", (async () => new Response("quá lớn", { status: 413 })) as never)).rejects.toThrow("Groq Whisper 413");
  });
});
