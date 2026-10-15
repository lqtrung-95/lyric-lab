import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import { FEEDBACK_SYSTEM_PROMPT, buildFeedbackPrompt } from "./build-feedback-prompt";
import { feedbackOutputSchema, type FeedbackOutput, type FeedbackRequest } from "./feedback-schema";

const HAN = /\p{Script=Han}/gu;
const hanOf = (s: string) => s.match(HAN) ?? [];
/** Trần điểm khi nội dung nghe được gần như không khớp câu mẫu (prompt đã dặn, nhưng model vẫn có lúc cho điểm cao cho câu khác hẳn). */
const MISMATCH_SCORE_CAP = 30;
const MIN_MATCH_RATIO = 0.5;

/** Nhận xét viết bằng tiếng Trung thay vì tiếng Việt (model đôi khi trả lời theo ngôn ngữ của đoạn nghe): quá nửa ký tự chữ là chữ Hán. */
export function isMostlyChinese(text: string): boolean {
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  return letters > 0 && hanOf(text).length / letters > 0.5;
}

/** Tỉ lệ chữ Hán của câu mẫu xuất hiện trong chữ nghe được (đếm theo tần suất, không phụ thuộc thứ tự). */
export function matchRatio(reference: string, heard: string): number {
  const ref = hanOf(reference);
  if (!ref.length) return 1;
  const pool = new Map<string, number>();
  for (const c of hanOf(heard)) pool.set(c, (pool.get(c) ?? 0) + 1);
  let hit = 0;
  for (const c of ref) { const n = pool.get(c) ?? 0; if (n > 0) { hit++; pool.set(c, n - 1); } }
  return hit / ref.length;
}

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
        model, system: FEEDBACK_SYSTEM_PROMPT, user: buildFeedbackPrompt(line.text, line.pinyin),
        maxTokens: MAX_FEEDBACK_TOKENS, timeoutMs: FEEDBACK_TIMEOUT_MS, audio: { mimeType: req.mimeType, data: req.audio },
      });
      const parsed = feedbackOutputSchema.parse(JSON.parse(raw));
      if ([parsed.summary, ...parsed.issues.flatMap((i) => [i.problem, i.tip ?? ""])].some(isMostlyChinese)) throw new Error("Nhận xét không viết bằng tiếng Việt");
      const mismatch = parsed.heard.trim() !== "" && matchRatio(line.text, parsed.heard) < MIN_MATCH_RATIO;
      return { ...parsed, score: mismatch ? Math.min(parsed.score, MISMATCH_SCORE_CAP) : parsed.score, issues: parsed.issues.filter((i) => line.text.includes(i.word)), model };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new FeedbackError("feedback_failed", `Không nhận xét được: ${lastError.slice(0, 120)}`);
}
