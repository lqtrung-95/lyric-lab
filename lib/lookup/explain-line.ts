import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { EXPLAIN_LINE_SYSTEM_PROMPT, buildExplainLinePrompt } from "./build-explain-line-prompt";
import { explainLineOutputSchema, type ExplainLineOutput, type ExplainLineRequest, type LineExplanation } from "./explain-line-schema";
import { EXPLAIN_MODELS } from "./explain-term";

// Cấu trúc đầy đủ (dịch + từ vựng + ngữ pháp + ghi chú) tốn nhiều token hơn giải nghĩa một câu đơn giản.
const MAX_EXPLAIN_LINE_TOKENS = 1200;

export type ExplainLineErrorCode = "line_not_found" | "explain_failed" | "rate_limited";

export class ExplainLineError extends Error {
  constructor(public readonly code: ExplainLineErrorCode, message: string) {
    super(message);
    this.name = "ExplainLineError";
  }
}

export interface CachedLineExplanation extends ExplainLineOutput {
  model: string;
}

export interface ExplainLineDeps {
  readCache(req: ExplainLineRequest): Promise<CachedLineExplanation | null>;
  writeCache(req: ExplainLineRequest, value: CachedLineExplanation): Promise<void>;
  chat: ChatFn;
  models?: string[];
  /** Gọi trước khi tốn token LLM (để áp giới hạn tần suất). Trả false để từ chối. */
  allowLlmCall?: () => boolean | Promise<boolean>;
}

/**
 * Giải nghĩa cả câu (không phải một từ riêng lẻ). Đọc cache trước; chỉ gọi LLM khi chưa có và ghi lại kết quả.
 * Câu phải có thật trong bài (chặn việc dùng API để hỏi LLM tùy ý).
 */
export async function explainLine(lines: AnalyzedLine[], req: ExplainLineRequest, deps: ExplainLineDeps): Promise<LineExplanation> {
  const line = lines[req.lineIndex];
  if (!line || !line.text.trim()) throw new ExplainLineError("line_not_found", "Không tìm thấy câu này");

  const cached = await deps.readCache(req);
  if (cached) return { ...cached, fromCache: true };

  if (deps.allowLlmCall && !(await deps.allowLlmCall())) throw new ExplainLineError("rate_limited", "Vượt giới hạn giải nghĩa");

  const prompt = buildExplainLinePrompt({ line: line.text, lineTranslation: line.translation });
  let lastError = "";
  for (const model of deps.models ?? EXPLAIN_MODELS) {
    try {
      const raw = await deps.chat({ model, system: EXPLAIN_LINE_SYSTEM_PROMPT, user: prompt, maxTokens: MAX_EXPLAIN_LINE_TOKENS });
      const parsed = explainLineOutputSchema.parse(JSON.parse(raw));
      const value: CachedLineExplanation = { ...parsed, model };
      await deps.writeCache(req, value).catch(() => {}); // ghi cache lỗi không được làm hỏng câu trả lời
      return { ...value, fromCache: false };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new ExplainLineError("explain_failed", `Không giải nghĩa được: ${lastError.slice(0, 120)}`);
}
