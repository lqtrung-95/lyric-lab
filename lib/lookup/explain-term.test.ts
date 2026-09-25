import { describe, expect, it } from "vitest";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { ExplainError, explainTerm, type CachedExplanation, type ExplainDeps } from "./explain-term";
import type { ExplainRequest } from "./explain-schema";

// Lời hư cấu 夜车.
const lines: AnalyzedLine[] = [{
  index: 0, text: "窗外的城市慢慢睡了", start: 0, end: 5, pinyin: "", translation: "Thành phố dần chìm vào giấc ngủ",
  tokens: [{ text: "窗外" }, { text: "的" }, { text: "城市" }, { text: "慢慢" }, { text: "睡" }, { text: "了" }],
}];
const req: ExplainRequest = { videoId: "dQw4w9WgXcQ", lineIndex: 0, term: "慢慢" };
const good = JSON.stringify({ meaningInContext: "dần dần", note: "Trạng từ lặp" });

function deps(over: Partial<ExplainDeps> = {}) {
  const store = new Map<string, CachedExplanation>();
  const prompts: string[] = [];
  const d: ExplainDeps = {
    readCache: async (r) => store.get(r.term) ?? null,
    writeCache: async (r, v) => { store.set(r.term, v); },
    dictionaryMeanings: async () => ["slowly", "gradually"],
    chat: async ({ user }) => { prompts.push(user); return good; },
    models: ["m1", "m2"],
    ...over,
  };
  return { d, store, prompts };
}

describe("explainTerm", () => {
  it("chưa có cache: gọi LLM với nghĩa từ điển + bản dịch câu, rồi lưu cache", async () => {
    const { d, store, prompts } = deps();
    const out = await explainTerm(lines, req, d);
    expect(out).toEqual({ meaningInContext: "dần dần", note: "Trạng từ lặp", model: "m1", fromCache: false });
    expect(prompts[0]).toContain("slowly; gradually");
    expect(prompts[0]).toContain("Bản dịch câu:");
    expect(store.get("慢慢")?.model).toBe("m1");
  });

  it("lần hai đọc từ cache, không gọi LLM", async () => {
    const { d } = deps();
    await explainTerm(lines, req, d);
    let calls = 0;
    const out = await explainTerm(lines, req, { ...d, chat: async () => { calls++; return good; } });
    expect(out.fromCache).toBe(true);
    expect(calls).toBe(0);
  });

  it("từ không có trong dòng, chỉ số dòng sai, hoặc không phải chữ Hán → term_not_in_line, không gọi LLM", async () => {
    let calls = 0;
    const { d } = deps({ chat: async () => { calls++; return good; } });
    for (const bad of [{ ...req, term: "星光" }, { ...req, lineIndex: 9 }, { ...req, term: "abc" }]) {
      await expect(explainTerm(lines, bad, d)).rejects.toMatchObject({ code: "term_not_in_line" });
    }
    expect(calls).toBe(0);
  });

  it("model chính lỗi hoặc trả JSON sai → dùng model dự phòng", async () => {
    const { d } = deps({ chat: async ({ model }) => (model === "m1" ? "không phải json" : good) });
    expect((await explainTerm(lines, req, d)).model).toBe("m2");
  });

  it("mọi model lỗi → explain_failed; ghi cache lỗi không làm hỏng kết quả", async () => {
    const { d } = deps({ chat: async () => { throw new Error("HTTP 500"); } });
    await expect(explainTerm(lines, req, d)).rejects.toBeInstanceOf(ExplainError);
    const ok = deps({ writeCache: async () => { throw new Error("db down"); } });
    expect((await explainTerm(lines, req, ok.d)).meaningInContext).toBe("dần dần");
  });

  it("allowLlmCall=false chặn trước khi tốn token, nhưng cache vẫn đọc được", async () => {
    let calls = 0;
    const { d } = deps({ allowLlmCall: () => false, chat: async () => { calls++; return good; } });
    await expect(explainTerm(lines, req, d)).rejects.toMatchObject({ code: "rate_limited" });
    expect(calls).toBe(0);
    await d.writeCache(req, { meaningInContext: "x", model: "m" });
    expect((await explainTerm(lines, req, d)).fromCache).toBe(true);
  });
});
