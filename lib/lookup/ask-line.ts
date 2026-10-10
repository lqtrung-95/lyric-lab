import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import { askLineOutputSchema, type AskLineRequest } from "./ask-line-schema";
import { ASK_LINE_SYSTEM_PROMPT, buildAskLinePrompt } from "./build-ask-line-prompt";
import { EXPLAIN_MODELS } from "./explain-term";

const MAX_ASK_TOKENS = 700;

export type AskLineErrorCode = "line_not_found" | "ask_failed" | "rate_limited";

export class AskLineError extends Error {
  constructor(public readonly code: AskLineErrorCode, message: string) {
    super(message);
    this.name = "AskLineError";
  }
}

export interface AskLineDeps {
  chat: ChatFn;
  models?: string[];
  /** Gọi trước khi tốn token LLM (áp hạn mức). Trả false để từ chối. */
  allowLlmCall?: () => boolean | Promise<boolean>;
}

/** Trả lời một câu hỏi tự do của người học về một câu có thật trong bài/video (không cache: mỗi câu hỏi là riêng). */
export async function askLine(lines: AnalyzedLine[], req: AskLineRequest, deps: AskLineDeps): Promise<{ answer: string; model: string }> {
  const line = lines.find((l) => l.index === req.lineIndex);
  if (!line || !line.text.trim()) throw new AskLineError("line_not_found", "Không tìm thấy câu này");
  if (deps.allowLlmCall && !(await deps.allowLlmCall())) throw new AskLineError("rate_limited", "Vượt giới hạn hỏi AI");

  const pos = lines.indexOf(line);
  const prompt = buildAskLinePrompt({
    line: line.text, translation: line.translation, before: lines[pos - 1]?.text, after: lines[pos + 1]?.text,
    question: req.question, history: req.history,
  });
  let lastError = "";
  for (const model of deps.models ?? EXPLAIN_MODELS) {
    try {
      const raw = await deps.chat({ model, system: ASK_LINE_SYSTEM_PROMPT, user: prompt, maxTokens: MAX_ASK_TOKENS });
      return { answer: askLineOutputSchema.parse(JSON.parse(raw)).answer, model };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new AskLineError("ask_failed", `Không trả lời được: ${lastError.slice(0, 120)}`);
}
