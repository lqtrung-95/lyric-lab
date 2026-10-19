import { describe, expect, it } from "vitest";
import { buildTermSentences } from "./build-term-sentences";

const line = (idx: number, text: string, tokens: string[], translation: string | null = "Dịch.") => ({ idx, text, translation, tokens: tokens.map((t) => ({ text: t })) });
const levels = new Map([["苹果", 1], ["喜欢", 1], ["我", 1], ["吃", 1], ["经济", 5]]);

describe("buildTermSentences", () => {
  const videos = [
    { videoId: "aaaaaaaaaaa", lines: [line(0, "我喜欢吃苹果。", ["我", "喜欢", "吃", "苹果", "。"]), line(1, "苹果", ["苹果"]), line(2, "我吃苹果，你呢。", ["我", "吃", "苹果", "，", "你", "呢", "。"])] },
    { videoId: "bbbbbbbbbbb", lines: [line(0, "我很喜欢苹果。", ["我", "很", "喜欢", "苹果", "。"]), line(1, "我喜欢吃苹果。", ["我", "喜欢", "吃", "苹果", "。"], null)] },
  ];
  it("chỉ giữ câu đủ điều kiện (có dịch, độ dài hợp lệ), đa dạng video, đúng từ HSK", () => {
    const { rows } = buildTermSentences(videos, levels, 2);
    const apple = rows.filter((r) => r.term === "苹果");
    expect(apple).toHaveLength(2);
    expect(new Set(apple.map((r) => r.video_id)).size).toBe(2); // mỗi video một câu
    expect(rows.some((r) => r.video_id === "bbbbbbbbbbb" && r.line_idx === 1)).toBe(false); // không có dịch
    expect(rows.every((r) => levels.has(r.term))).toBe(true);
  });
  it("thống kê theo cấp: từ không có câu vẫn được đếm vào tổng số từ", () => {
    const { stats } = buildTermSentences(videos, levels, 5);
    expect(stats.byLevel[1].words).toBe(4);
    expect(stats.byLevel[1].atLeast1).toBeGreaterThanOrEqual(3);
    expect(stats.byLevel[5]).toEqual({ words: 1, atLeast1: 0, atLeast3: 0 });
  });
  it("video xuất hiện hai lần ở đầu vào không sinh dòng trùng khóa", () => {
    const { rows } = buildTermSentences([...videos, videos[0]], levels, 5);
    const keys = rows.map((r) => `${r.term}|${r.video_id}|${r.line_idx}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
