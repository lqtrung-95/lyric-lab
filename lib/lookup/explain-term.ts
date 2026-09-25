import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { EXPLAIN_SYSTEM_PROMPT, buildExplainPrompt } from "./build-explain-prompt";
import { explainOutputSchema, type ExplainRequest, type TermExplanation } from "./explain-schema";

// Model nhỏ trước cho nhanh (LS-06: ≤ 1,5 giây), model lớn làm dự phòng.
export const EXPLAIN_MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];
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
  /** Gọi trước khi tốn token LLM (để áp giới hạn tần suất). Trả false để từ chối. */
  allowLlmCall?: () => boolean;
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
  if (cached) return { ...cached, fromCache: true };

  if (deps.allowLlmCall && !deps.allowLlmCall()) throw new ExplainError("rate_limited", "Vượt giới hạn giải nghĩa");

  const prompt = buildExplainPrompt({
    term: req.term, line: line.text, lineTranslation: line.translation, dictionaryMeanings: await deps.dictionaryMeanings(req.term),
  });
  let lastError = "";
  for (const model of deps.models ?? EXPLAIN_MODELS) {
    try {
      const raw = await deps.chat({ model, system: EXPLAIN_SYSTEM_PROMPT, user: prompt, maxTokens: MAX_EXPLAIN_TOKENS });
      const parsed = explainOutputSchema.parse(JSON.parse(raw));
      const value: CachedExplanation = { meaningInContext: parsed.meaningInContext, note: parsed.note || undefined, model };
      await deps.writeCache(req, value).catch(() => {}); // ghi cache lỗi không được làm hỏng câu trả lời
      return { ...value, fromCache: false };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new ExplainError("explain_failed", `Không giải nghĩa được: ${lastError.slice(0, 120)}`);
}
