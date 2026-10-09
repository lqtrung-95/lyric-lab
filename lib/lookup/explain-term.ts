import { GEMINI_MODELS } from "@/lib/analysis/gemini-models";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { EXPLAIN_SYSTEM_PROMPT, buildExplainPrompt } from "./build-explain-prompt";
import { stripTermFromMeaning } from "./strip-term-from-meaning";
import { explainOutputSchema, type ExplainRequest, type TermExplanation } from "./explain-schema";
import { withGroqFallback } from "@/lib/analysis/openrouter-chat";

// Model nhỏ trước cho nhanh (LS-06: ≤ 1,5 giây), model lớn làm dự phòng, rồi cùng hai model đó bằng khóa Groq thứ hai
// (FALLBACK_LLM_API_KEY). Kế đó BytePlus ModelArk (nếu có đủ BYTE_PLUS_API_KEY + BYTE_PLUS_MODEL_ID) — thêm nhà
// cung cấp khác để đỡ phụ thuộc hạn mức ngày của Groq (từng cạn khi chạy backfill, xem lịch sử). Khi cả hai khóa
// Groq VÀ BytePlus đều không dùng được mới sang OpenRouter (chỉ dùng khi có OPENROUTER_API_KEY): gemini-2.5-flash-
// lite trước (rẻ, đủ cho tác vụ ngắn) rồi mới tới gemini-2.5-flash.
const EXPLAIN_GROQ_MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];
// Gemini (khóa Google AI Studio, nhiều khóa) đứng đầu để chia tải khỏi hạn mức Groq; thiếu GEMINI_API_KEYS thì rớt ngay sang model sau, không lỗi.
export const EXPLAIN_MODELS = [
  ...GEMINI_MODELS,
  ...EXPLAIN_GROQ_MODELS,
  ...withGroqFallback(EXPLAIN_GROQ_MODELS),
  "byteplus:doubao",
  "openrouter:google/gemini-2.5-flash-lite",
  "openrouter:google/gemini-2.5-flash",
];
const MAX_EXPLAIN_TOKENS = 400;

export type ExplainErrorCode = "term_not_in_line" | "explain_failed" | "rate_limited";

export class ExplainError extends Error {
  constructor(public readonly code: ExplainErrorCode, message: string) {
    super(message);
    this.name = "ExplainError";
  }
}

export interface CachedExplanation {
  meaningInContext: string;
  note?: string;
  model: string;
}

export interface ExplainDeps {
  readCache(req: ExplainRequest): Promise<CachedExplanation | null>;
  writeCache(req: ExplainRequest, value: CachedExplanation): Promise<void>;
  /** Nghĩa tiếng Anh của từ trong từ điển, để bám vào khi giải nghĩa. */
  dictionaryMeanings(term: string): Promise<string[]>;
  chat: ChatFn;
  models?: string[];
  /** Loại câu: lời bài hát (mặc định) hoặc câu nói trong video, chỉ để gọi đúng tên trong prompt. */
  lineKind?: "lyric" | "speech";
  /** Gọi trước khi tốn token LLM (để áp giới hạn tần suất). Trả false để từ chối. */
  allowLlmCall?: () => boolean | Promise<boolean>;
}

const HAN = /\p{Script=Han}/u;

/**
 * Giải nghĩa một từ theo đúng câu hát (LS-06). Từ phải là một token có thật trong dòng đó (chặn việc dùng API
 * để hỏi LLM tùy ý). Đọc cache trước; chỉ gọi LLM khi chưa có và ghi lại kết quả.
 */
export async function explainTerm(lines: AnalyzedLine[], req: ExplainRequest, deps: ExplainDeps): Promise<TermExplanation> {
  const line = lines[req.lineIndex];
  if (!line || !HAN.test(req.term) || !line.tokens.some((t) => t.text === req.term)) {
    throw new ExplainError("term_not_in_line", "Từ không có trong dòng lời này");
  }

  const cached = await deps.readCache(req);
  // Kể cả bản đã lưu từ trước cũng bỏ chữ Hán: nghĩa này hiện làm gợi ý trong bài tập.
  if (cached) return { ...cached, meaningInContext: stripTermFromMeaning(cached.meaningInContext, req.term), fromCache: true };

  if (deps.allowLlmCall && !(await deps.allowLlmCall())) throw new ExplainError("rate_limited", "Vượt giới hạn giải nghĩa");

  const prompt = buildExplainPrompt({
    term: req.term, line: line.text, lineTranslation: line.translation, dictionaryMeanings: await deps.dictionaryMeanings(req.term), lineKind: deps.lineKind,
  });
  let lastError = "";
  for (const model of deps.models ?? EXPLAIN_MODELS) {
    try {
      const raw = await deps.chat({ model, system: EXPLAIN_SYSTEM_PROMPT, user: prompt, maxTokens: MAX_EXPLAIN_TOKENS });
      const parsed = explainOutputSchema.parse(JSON.parse(raw));
      const value: CachedExplanation = { meaningInContext: stripTermFromMeaning(parsed.meaningInContext, req.term), note: parsed.note || undefined, model };
      await deps.writeCache(req, value).catch(() => {}); // ghi cache lỗi không được làm hỏng câu trả lời
      return { ...value, fromCache: false };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new ExplainError("explain_failed", `Không giải nghĩa được: ${lastError.slice(0, 120)}`);
}
