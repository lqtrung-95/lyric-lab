import type { ChatFn } from "@/lib/analysis/groq-chat";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";

export type NoteErrorCode = "rate_limited" | "explain_failed";

export class NoteError extends Error {
  constructor(public readonly code: NoteErrorCode, message: string) { super(message); this.name = "NoteError"; }
}

export interface CachedNoteRequest<T> {
  readCache(): Promise<{ value: T; model: string } | null>;
  writeCache(value: { value: T; model: string }): Promise<void>;
  chat: ChatFn;
  models?: string[];
  /** Gọi trước khi tốn token (áp hạn mức). Trả false để từ chối. */
  allowLlmCall?: () => boolean | Promise<boolean>;
  system: string;
  prompt: string;
  maxTokens: number;
  /** Đọc và kiểm tra đầu ra của model (ném lỗi nếu sai dạng) để rớt sang model kế. */
  parse(raw: string): T;
}

/** Sinh một ghi chú bằng LLM có lưu đệm: đọc đệm → kiểm hạn mức → thử lần lượt các model tới khi đầu ra hợp lệ → ghi đệm (lỗi ghi chỉ log). */
export async function generateCachedNote<T>(req: CachedNoteRequest<T>): Promise<{ value: T; model: string; fromCache: boolean }> {
  const cached = await req.readCache();
  if (cached) return { ...cached, fromCache: true };
  if (req.allowLlmCall && !(await req.allowLlmCall())) throw new NoteError("rate_limited", "Vượt giới hạn giải nghĩa");
  let lastError = "";
  for (const model of req.models ?? EXPLAIN_MODELS) {
    try {
      const raw = await req.chat({ model, system: req.system, user: req.prompt, maxTokens: req.maxTokens });
      const value = req.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
      try { await req.writeCache({ value, model }); } catch (error) {
        console.error(JSON.stringify({ event: "tra_tu_note_cache_write_error", message: (error as Error).message }));
      }
      return { value, model, fromCache: false };
    } catch (error) {
      lastError = (error as Error).message;
    }
  }
  throw new NoteError("explain_failed", `Không model nào viết được: ${lastError}`);
}
