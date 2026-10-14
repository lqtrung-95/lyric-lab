import { describe, expect, it } from "vitest";
import { ASR_CHUNK_OVERLAP_SECONDS, ASR_CHUNK_SECONDS, keepOwnedLines, MAX_ASR_VIDEO_SECONDS, planAsrChunks } from "./asr-chunks";

describe("planAsrChunks", () => {
  it("video ngắn là một đoạn phủ trọn video", () => {
    expect(planAsrChunks(90)).toEqual([{ index: 0, ownStart: 0, ownEnd: 90, windowStart: 0, windowEnd: 90 }]);
  });
  it("video 1301 giây chia 10 đoạn đủ độ dài và một đoạn cuối lấy phần dư", () => {
    const chunks = planAsrChunks(1301);
    expect(chunks).toHaveLength(11);
    expect(chunks.slice(0, 10).every((c) => c.ownEnd - c.ownStart === ASR_CHUNK_SECONDS)).toBe(true);
    expect(chunks[10]).toMatchObject({ ownStart: 1200, ownEnd: 1301 });
  });
  it("phần dư ngắn hơn 45 giây gộp vào đoạn trước", () => {
    const chunks = planAsrChunks(ASR_CHUNK_SECONDS * 2 + 30);
    expect(chunks).toHaveLength(2);
    expect(chunks[1].ownEnd).toBe(270);
  });
  it("các đoạn nối liền nhau, cửa sổ nới theo overlap nhưng không vượt video; video 30 phút không quá 15 đoạn", () => {
    const chunks = planAsrChunks(1000);
    chunks.forEach((c, i) => { if (i > 0) expect(c.ownStart).toBe(chunks[i - 1].ownEnd); });
    expect(chunks[1].windowStart).toBe(chunks[1].ownStart - ASR_CHUNK_OVERLAP_SECONDS);
    expect(chunks[0].windowStart).toBe(0);
    expect(chunks.at(-1)!.windowEnd).toBe(1000);
    expect(planAsrChunks(MAX_ASR_VIDEO_SECONDS).length).toBeLessThanOrEqual(15);
  });
});

describe("keepOwnedLines", () => {
  const chunk = { index: 1, ownStart: 120, ownEnd: 240, windowStart: 114, windowEnd: 246 };
  it("chỉ giữ dòng có điểm giữa thuộc phần sở hữu, nên câu ngang ranh giới có đúng một chủ", () => {
    const lines = [
      { text: "thuộc đoạn trước", start: 115, end: 118 },
      { text: "ngang ranh giới, giữa ở 121", start: 119, end: 123 },
      { text: "giữa đoạn", start: 180, end: 183 },
      { text: "ngang ranh giới sau, giữa ở 239", start: 237, end: 241 },
      { text: "thuộc đoạn sau", start: 243, end: 246 },
    ];
    expect(keepOwnedLines(lines, chunk).map((l) => l.text)).toEqual(["ngang ranh giới, giữa ở 121", "giữa đoạn", "ngang ranh giới sau, giữa ở 239"]);
  });
});
