import { describe, expect, it, vi } from "vitest";
import { buildWordNotePrompt } from "./build-word-note-prompt";
import { ExplainWordError, explainWord, type ExplainWordDeps } from "./explain-word";
import type { WordDetail } from "./word-detail-types";

const detail: WordDetail = {
  simplified: "爱", traditionalForms: ["愛"], sinoViet: "ái", hskLevel: 1, gloss: "yêu",
  readings: [{ pinyin: "ài", meanings: ["to love; to be fond of", "affection"], hskLevel: 1, frequency: 130 }],
  chars: [{ hanzi: "爱", traditional: "愛", sinoViet: ["ái"] }],
};
const GOOD = JSON.stringify({ gloss: "yêu, thương", senses: [{ pos: "động từ", meaning: "yêu, thích", usage: "dùng với người và vật" }] });

function deps(over: Partial<ExplainWordDeps> = {}): ExplainWordDeps & { writes: number } {
  const d = { writes: 0, readCache: async () => null, writeCache: async () => { d.writes++; }, chat: async () => GOOD, models: ["m1", "m2"], ...over };
  return d as ExplainWordDeps & { writes: number };
}

describe("explainWord", () => {
  it("có bản lưu thì dùng luôn, không gọi model", async () => {
    const chat = vi.fn();
    const r = await explainWord(detail, deps({ readCache: async () => ({ note: { gloss: "x", senses: [{ meaning: "y" }] }, model: "m0" }), chat }));
    expect(r.fromCache).toBe(true);
    expect(chat).not.toHaveBeenCalled();
  });
  it("chưa có thì gọi model, ghi đệm và trả kết quả", async () => {
    const d = deps();
    const r = await explainWord(detail, d);
    expect(r).toMatchObject({ fromCache: false, stored: { model: "m1", note: { gloss: "yêu, thương" } } });
    expect(d.writes).toBe(1);
  });
  it("model đầu trả sai dạng (có chữ Hán) thì rớt sang model kế", async () => {
    const bad = JSON.stringify({ gloss: "yêu 爱", senses: [{ meaning: "x" }] });
    const chat = vi.fn().mockResolvedValueOnce(bad).mockResolvedValueOnce(GOOD);
    const r = await explainWord(detail, deps({ chat }));
    expect(r.stored.model).toBe("m2");
  });
  it("hết hạn mức thì từ chối trước khi tốn token", async () => {
    const chat = vi.fn();
    await expect(explainWord(detail, deps({ chat, allowLlmCall: () => false }))).rejects.toMatchObject({ code: "rate_limited" });
    expect(chat).not.toHaveBeenCalled();
  });
  it("mọi model lỗi thì báo explain_failed; lỗi ghi đệm không làm mất kết quả", async () => {
    await expect(explainWord(detail, deps({ chat: async () => { throw new Error("boom"); } }))).rejects.toBeInstanceOf(ExplainWordError);
    const r = await explainWord(detail, deps({ writeCache: async () => { throw new Error("db"); } }));
    expect(r.fromCache).toBe(false);
  });
});

describe("buildWordNotePrompt", () => {
  it("đưa pinyin, Hán Việt, HSK và nghĩa Anh vào làm dữ kiện, cấm chữ Hán trong câu trả lời", () => {
    const p = buildWordNotePrompt(detail);
    expect(p).toContain("Hán Việt: ái");
    expect(p).toContain("- ài: to love; to be fond of; affection");
    expect(p).toContain("KHÔNG viết chữ Hán");
  });
});
