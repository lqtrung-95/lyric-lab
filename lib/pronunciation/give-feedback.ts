import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import { FEEDBACK_SYSTEM_PROMPT, buildFeedbackPrompt } from "./build-feedback-prompt";
import { feedbackOutputSchema, type FeedbackOutput, type FeedbackRequest } from "./feedback-schema";

const MAX_FEEDBACK_TOKENS = 900;
// Nghe âm thanh chậm hơn đọc chữ; vẫn nhỏ hơn trần 30s của route để còn dư thời gian báo lỗi.
const FEEDBACK_TIMEOUT_MS = 20_000;

export type FeedbackErrorCode = "line_not_found" | "feedback_failed" | "rate_limited";

export class FeedbackError extends Error {
  constructor(public readonly code: FeedbackErrorCode, message: string) {
    super(message);
    this.name = "FeedbackError";
  }
}

export interface FeedbackDeps {
  chat: ChatFn;
  /** Model nghe được âm thanh (chỉ Gemini). */
  models: string[];
  allowLlmCall?: () => boolean | Promise<boolean>;
}

/**
 * Nhờ model nghe ghi âm của người học và nhận xét phát âm so với câu mẫu. Mục "issues" không trỏ tới chữ nào có trong câu mẫu bị loại
 * (giống quy tắc khớp vị trí của phân tích bài hát), để nhận xét không chỉ vào chữ không tồn tại.
 */
export async function giveFeedback(lines: AnalyzedLine[], req: FeedbackRequest, deps: FeedbackDeps): Promise<FeedbackOutput & { model: string }> {
  const line = lines.find((l) => l.index === req.lineIndex);
  if (!line || !line.text.trim()) throw new FeedbackError("line_not_found", "Không tìm thấy câu này");
  if (deps.allowLlmCall && !(await deps.allowLlmCall())) throw new FeedbackError("rate_limited", "Vượt giới hạn nhận xét giọng");

  let lastError = "";
  for (const model of deps.models) {
    try {
      const raw = await deps.chat({
        model, system: FEEDBACK_SYSTEM_PROMPT, user: buildFeedbackPrompt(line.text),
        maxTokens: MAX_FEEDBACK_TOKENS, timeoutMs: FEEDBACK_TIMEOUT_MS, audio: { mimeType: req.mimeType, data: req.audio },
      });
      const parsed = feedbackOutputSchema.parse(JSON.parse(raw));
      return { ...parsed, issues: parsed.issues.filter((i) => line.text.includes(i.word)), model };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new FeedbackError("feedback_failed", `Không nhận xét được: ${lastError.slice(0, 120)}`);
}
