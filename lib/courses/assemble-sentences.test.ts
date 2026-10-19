import { describe, expect, it } from "vitest";
import { assembleSentences } from "./assemble-sentences";

const lesson = (lines: [number, string, string | null][]) => ({ lines: lines.map(([idx, text, translation]) => ({ idx, start: idx * 4, end: idx * 4 + 3, text, pinyin: "p", translation })) });

describe("assembleSentences", () => {
  const lessons = new Map([
    ["aaaaaaaaaaa", lesson([[0, "我吃苹果。", "Tôi ăn táo."], [1, "好苹果。", null]])],
    ["bbbbbbbbbbb", lesson([[0, "苹果很好吃。", "Táo rất ngon."]])],
  ]);
  it("ghép lời video, sắp theo điểm, giới hạn số câu mỗi từ", () => {
    const out = assembleSentences([
      { term: "苹果", video_id: "aaaaaaaaaaa", line_idx: 0, quality: 70 },
      { term: "苹果", video_id: "bbbbbbbbbbb", line_idx: 0, quality: 90 },
    ], lessons, 1);
    expect(out["苹果"]).toHaveLength(1);
    expect(out["苹果"][0]).toMatchObject({ videoId: "bbbbbbbbbbb", text: "苹果很好吃。", start: 0, end: 3, translation: "Táo rất ngon." });
  });
  it("bỏ dòng không còn tồn tại, video không còn, hoặc mất bản dịch", () => {
    const out = assembleSentences([
      { term: "苹果", video_id: "aaaaaaaaaaa", line_idx: 1, quality: 95 }, // mất bản dịch
      { term: "苹果", video_id: "aaaaaaaaaaa", line_idx: 9, quality: 95 }, // dòng không còn
      { term: "苹果", video_id: "ccccccccccc", line_idx: 0, quality: 95 }, // video không còn
      { term: "苹果", video_id: "aaaaaaaaaaa", line_idx: 0, quality: 60 },
    ], lessons, 3);
    expect(out["苹果"].map((s) => s.lineIdx)).toEqual([0]);
  });
});
