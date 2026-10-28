import { describe, expect, it } from "vitest";
import { readEntries, recordFluency, summarize, type FluencyEntry } from "./fluency-stats";

const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
const entry = (over: Partial<FluencyEntry> = {}): FluencyEntry => ({ at: 1_000_000, source: "reflex", turns: 5, reactionMs: [1000, 2000], hanChars: 20, words: ["咖啡"], ...over });

describe("fluency stats", () => {
  it("ghi rồi đọc lại; bỏ qua lượt không có câu nào", () => {
    const s = memory();
    const rest = { source: "reflex" as const, turns: 5, reactionMs: [1000], hanChars: 20, words: [] as string[] };
    recordFluency(rest, s);
    recordFluency({ ...rest, turns: 0 }, s);
    expect(readEntries(s)).toHaveLength(1);
  });
  it("dữ liệu hỏng thì trả rỗng", () => {
    const s = memory();
    s.setItem("songhanzi-fluency-v1", "{không phải json");
    expect(readEntries(s)).toEqual([]);
  });
  it("tổng hợp 7 ngày gần nhất", () => {
    const now = 10 * 86_400_000;
    const sum = summarize([entry({ at: now - 8 * 86_400_000 }), entry({ at: now - 1000, words: ["咖啡", "茶"] }), entry({ at: now - 2000, reactionMs: [3000], words: ["茶"] })], now);
    expect(sum).toEqual({ sessions: 2, turns: 10, hanChars: 40, distinctWords: 2, avgReactionMs: 2000 });
  });
  it("không có phản xạ đo được thì avgReactionMs là null", () => {
    expect(summarize([entry({ reactionMs: [] })], 1_000_100).avgReactionMs).toBeNull();
  });
});
