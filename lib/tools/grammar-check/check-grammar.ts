import type { ChatFn } from "@/lib/analysis/groq-chat";
import { buildGrammarPrompt, GRAMMAR_SYSTEM_PROMPT } from "./grammar-prompt";
import { grammarOutputSchema, MAX_GRAMMAR_CHARS, type GrammarOutput } from "./grammar-schema";

export type GrammarErrorCode = "invalid_sentence" | "rate_limited" | "check_failed";

export class GrammarError extends Error {
  constructor(public readonly code: GrammarErrorCode, message: string) {
    super(message);
    this.name = "GrammarError";
  }
}

export interface GrammarDeps {
  chat: ChatFn;
  models: string[];
  /** Gọi trước khi tốn token (áp hạn mức); trả false để từ chối. */
  allowLlmCall?: () => boolean | Promise<boolean>;
}

const MAX_GRAMMAR_TOKENS = 700;

/** Câu hợp lệ để kiểm tra: có chữ Hán hoặc ít nhất vài chữ (pinyin, tiếng Việt cũng được chấm là sai), không quá dài, một dòng. */
export function cleanSentence(input: string): string | null {
  const s = input.normalize("NFC").replace(/\s+/g, " ").trim();
  if (s.length < 2 || s.length > MAX_GRAMMAR_CHARS) return null;
  return /\p{L}/u.test(s) ? s : null;
}

/** Gỡ rào markdown và lấy khối JSON đầu tiên (model đôi khi bọc ```json). */
function extractJson(raw: string): string {
  const text = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

/**
 * Chuẩn hóa sau khi model trả về: câu "ok" không cần câu sửa/lỗi (loại để không gây hiểu nhầm), câu sửa giống hệt câu gốc thì bỏ,
 * mỗi lỗi phải trỏ vào đoạn có trong câu gốc (giống quy tắc khớp vị trí của dự án), còn lại giữ nguyên thứ tự.
 */
export function normalizeGrammar(sentence: string, out: GrammarOutput): GrammarOutput {
  const same = (a?: string) => !a || a.replace(/\s+/g, "") === sentence.replace(/\s+/g, "");
  const issues = out.issues.filter((i) => sentence.includes(i.snippet));
  if (out.verdict === "ok") return { ...out, minimalFix: undefined, issues: [], natural: out.natural };
  return { ...out, minimalFix: same(out.minimalFix) ? undefined : out.minimalFix, issues };
}

/** Nhờ model chấm một câu tiếng Trung: thử lần lượt các model tới khi nhận được JSON hợp lệ (đúng dạng, giải thích bằng tiếng Việt). */
export async function checkGrammar(input: string, deps: GrammarDeps): Promise<GrammarOutput & { model: string }> {
  const sentence = cleanSentence(input);
  if (!sentence) throw new GrammarError("invalid_sentence", "Câu trống hoặc quá dài");
  if (deps.allowLlmCall && !(await deps.allowLlmCall())) throw new GrammarError("rate_limited", "Vượt giới hạn kiểm tra ngữ pháp");
  let lastError = "";
  for (const model of deps.models) {
    try {
      const raw = await deps.chat({ model, system: GRAMMAR_SYSTEM_PROMPT, user: buildGrammarPrompt(sentence), maxTokens: MAX_GRAMMAR_TOKENS });
      const parsed = grammarOutputSchema.parse(JSON.parse(extractJson(raw)));
      return { ...normalizeGrammar(sentence, parsed), model };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new GrammarError("check_failed", `Không chấm được: ${lastError.slice(0, 120)}`);
}
