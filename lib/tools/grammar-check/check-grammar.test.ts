import { describe, expect, it, vi } from "vitest";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import { checkGrammar, cleanSentence, GrammarError, normalizeGrammar } from "./check-grammar";
import { buildGrammarPrompt, GRAMMAR_SYSTEM_PROMPT } from "./grammar-prompt";
import { grammarOutputSchema, isMostlyHan } from "./grammar-schema";

const good = { verdict: "wrong", minimalFix: "我昨天去了商店。", natural: "我昨天去商店了。", summary: "Thiếu trợ từ 了 để chỉ hành động đã xảy ra.", issues: [{ snippet: "去商店", problem: "Hành động đã xảy ra cần 了.", fix: "去了商店" }] };
const chatReturning = (...replies: (string | Error)[]): ChatFn => {
  const fn = vi.fn<ChatFn>();
  for (const r of replies) fn.mockImplementationOnce(async () => { if (r instanceof Error) throw r; return r; });
  return fn;
};

describe("cleanSentence", () => {
  it("giữ câu hợp lệ, bỏ khoảng trắng thừa", () => {
    expect(cleanSentence("  我 昨天去商店。 ")).toBe("我 昨天去商店。");
  });
  it("từ chối câu trống, quá ngắn, quá dài hoặc không có chữ", () => {
    expect(cleanSentence("  ")).toBeNull();
    expect(cleanSentence("我")).toBeNull();
    expect(cleanSentence("好".repeat(121))).toBeNull();
    expect(cleanSentence("123 456!")).toBeNull();
  });
});

describe("grammarOutputSchema", () => {
  it("nhận đầu ra đúng dạng", () => { expect(grammarOutputSchema.parse(good).verdict).toBe("wrong"); });
  it("từ chối giải thích viết bằng tiếng Trung", () => {
    expect(grammarOutputSchema.safeParse({ ...good, summary: "这个句子缺少了字,应该加上。" }).success).toBe(false);
    expect(isMostlyHan("这个句子")).toBe(true);
  });
  it("từ chối câu sửa không có chữ Hán", () => {
    expect(grammarOutputSchema.safeParse({ ...good, natural: "I went to the store" }).success).toBe(false);
  });
});

describe("normalizeGrammar", () => {
  const sentence = "我昨天去商店。";
  it("câu đúng thì bỏ câu sửa và danh sách lỗi", () => {
    const out = normalizeGrammar(sentence, grammarOutputSchema.parse({ ...good, verdict: "ok" }));
    expect(out.minimalFix).toBeUndefined();
    expect(out.issues).toEqual([]);
  });
  it("bỏ lỗi trỏ vào đoạn không có trong câu gốc và bỏ câu sửa giống hệt câu gốc", () => {
    const out = normalizeGrammar(sentence, grammarOutputSchema.parse({ ...good, minimalFix: "我昨天去商店。", issues: [...good.issues, { snippet: "不存在", problem: "Lỗi không có thật." }] }));
    expect(out.issues.map((i) => i.snippet)).toEqual(["去商店"]);
    expect(out.minimalFix).toBeUndefined();
  });
});

describe("checkGrammar", () => {
  it("trả kết quả của model đầu tiên hợp lệ, kèm tên model", async () => {
    const r = await checkGrammar("我昨天去商店。", { chat: chatReturning(JSON.stringify(good)), models: ["m1"] });
    expect(r).toMatchObject({ verdict: "wrong", model: "m1", minimalFix: "我昨天去了商店。" });
  });
  it("bóc rào ```json và rớt sang model kế khi model đầu lỗi hoặc sai dạng", async () => {
    const chat = chatReturning(new Error("503"), "không phải JSON", "```json\n" + JSON.stringify(good) + "\n```");
    const r = await checkGrammar("我昨天去商店。", { chat, models: ["a", "b", "c"] });
    expect(r.model).toBe("c");
  });
  it("mọi model lỗi thì báo check_failed; câu không hợp lệ thì báo invalid_sentence mà không gọi model", async () => {
    await expect(checkGrammar("我昨天去商店。", { chat: chatReturning(new Error("x")), models: ["a"] })).rejects.toMatchObject({ code: "check_failed" });
    const chat = chatReturning();
    await expect(checkGrammar(" ", { chat, models: ["a"] })).rejects.toBeInstanceOf(GrammarError);
    expect(chat).not.toHaveBeenCalled();
  });
  it("hết hạn mức thì báo rate_limited và không gọi model", async () => {
    const chat = chatReturning(JSON.stringify(good));
    await expect(checkGrammar("我昨天去商店。", { chat, models: ["a"], allowLlmCall: () => false })).rejects.toMatchObject({ code: "rate_limited" });
    expect(chat).not.toHaveBeenCalled();
  });
});

describe("lời nhắc", () => {
  it("dặn trả JSON, giải thích tiếng Việt, câu sửa ít nhất; câu người học nằm trong thẻ và bị cắt đúng độ dài", () => {
    expect(GRAMMAR_SYSTEM_PROMPT).toContain("TIẾNG VIỆT");
    expect(GRAMMAR_SYSTEM_PROMPT).toContain("minimalFix");
    expect(buildGrammarPrompt("你好")).toContain("<sentence>你好</sentence>");
    expect(buildGrammarPrompt("好".repeat(300)).length).toBeLessThan(300);
  });
});
