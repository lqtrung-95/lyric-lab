import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import { AnalysisFailedError, analyzeLyrics } from "./analyze-lyrics";
import type { ChatFn } from "./groq-chat";
import { buildVocabCandidates } from "./build-vocab-candidates";
import { tokenizeLyricLines } from "./tokenize-lyric-lines";

// Lời hư cấu 夜车 (docs/design-brief.md mục 6).
const lines = tokenizeLyricLines(normalizeLyricLines([
  { text: "窗外的城市慢慢睡了", start: 0, end: 5 },
  { text: "我从来没想过会离开", start: 5, end: 10 },
  { text: "你的笑比星光还亮", start: 10, end: 15 },
  { text: "就算路再远我也不怕", start: 15, end: 20 },
  { text: "把回忆放进口袋里", start: 20, end: 25 },
  { text: "等天亮了我们再出发", start: 25, end: 30 },
]));
const TERMS = ["城市", "离开", "星光", "回忆", "口袋", "天亮", "出发", "慢慢"];
const row = (simplified: string, level: number): DictWordRow => ({
  simplified, traditional: simplified, pinyin: `pin-${simplified}`, meanings: ["m"], hsk_level: level, frequency: null,
});
const dictionary = new Map(TERMS.map((t, i) => [t, [row(t, 3 + (i % 3))]]));
const candidates = buildVocabCandidates(lines, dictionary);
const sinoViet = new Map([["城", ["thành"]], ["市", ["thị"]]]);

const goodOutput = JSON.stringify({
  summary: "Bài ballad về chuyến tàu đêm.",
  moods: ["Hoài niệm"],
  vocab: TERMS.map((term, i) => ({ term, meaningInContext: `nghĩa ${term}`, priority: 90 - i })),
  grammar: [
    { pattern: "从来没 + V + 过", explanation: "chưa từng", example: { zh: "我从来没去过北京。", vi: "Tôi chưa từng đến Bắc Kinh." }, level: 4, lineIndexes: [1], priority: 70 },
    { pattern: "把 + O + V", explanation: "bịa", example: { zh: "z", vi: "v" }, lineIndexes: [0], priority: 60 },
  ],
  translations: lines.map((l) => ({ lineIndex: l.index, vi: `dịch ${l.index}` })),
});
const run = (chat: ChatFn, models = ["m1", "m2"]) =>
  analyzeLyrics({ videoId: "dQw4w9WgXcQ", lyricsSource: "lrclib", lines, candidates, dictionary, sinoViet, chat, models });

describe("analyzeLyrics", () => {
  it("ghép kết quả LLM với từ điển; loại ngữ pháp bịa", async () => {
    const { analysis, attempts } = await run(async () => goodOutput);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].dropped?.map((d) => d.ref)).toEqual(["把 + O + V"]);
    const city = analysis.items.find((i) => i.id === "vocab:城市")!;
    expect(city).toMatchObject({ reading: "pin-城市", sinoViet: "thành thị", level: 3, meaningInContext: "nghĩa 城市" });
    expect(analysis.items.filter((i) => i.type === "grammar")).toHaveLength(1);
    expect(analysis.lines[0].translation).toBe("dịch 0");
    expect(analysis.lines[0].tokens.find((t) => t.text === "城市")?.itemId).toBe("vocab:城市");
    expect(analysis.lines[0].pinyin).toContain("pin-城市");
    expect(analysis.promptVersion).toBe("v1");
    expect(analysis.model).toBe("m1");
  });

  it("model chính trả JSON hỏng → chuyển sang model dự phòng", async () => {
    const { analysis, attempts } = await run(async ({ model }) => (model === "m1" ? "không phải json" : goodOutput));
    expect(attempts.map((a) => [a.model, a.ok])).toEqual([["m1", false], ["m2", true]]);
    expect(analysis.model).toBe("m2");
  });

  it("kết quả quá nghèo (ít từ hợp lệ) cũng coi là thất bại", async () => {
    const poor = JSON.stringify({ ...JSON.parse(goodOutput), vocab: [{ term: "bịa", meaningInContext: "x", priority: 5 }] });
    await expect(run(async () => poor)).rejects.toBeInstanceOf(AnalysisFailedError);
  });

  it("mọi model lỗi → AnalysisFailedError kèm lý do từng lần", async () => {
    const err = await run(async () => { throw new Error("HTTP 500"); }).catch((e) => e as AnalysisFailedError);
    expect(err).toBeInstanceOf(AnalysisFailedError);
    expect(err.attempts.map((a) => a.error)).toEqual(["HTTP 500", "HTTP 500"]);
  });
});
