import type { ChatFn } from "@/lib/analysis/groq-chat";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";
import { buildWordNotePrompt, WORD_NOTE_SYSTEM } from "./build-word-note-prompt";
import { wordMeaningNoteSchema, type StoredWordNote } from "./word-note-schema";
import type { WordDetail } from "./word-detail-types";

export type ExplainWordErrorCode = "rate_limited" | "explain_failed";

export class ExplainWordError extends Error {
  constructor(public readonly code: ExplainWordErrorCode, message: string) { super(message); this.name = "ExplainWordError"; }
}

export interface ExplainWordDeps {
  readCache(term: string): Promise<StoredWordNote | null>;
  writeCache(term: string, value: StoredWordNote): Promise<void>;
  chat: ChatFn;
  models?: string[];
  /** Gọi trước khi tốn token (áp hạn mức). Trả false để từ chối. */
  allowLlmCall?: () => boolean | Promise<boolean>;
}

const MAX_TOKENS = 500;

/** Giải nghĩa tiếng Việt cho cả từ bằng LLM, có lưu đệm theo từ. Đọc đệm trước; model lỗi/ra sai dạng thì rớt sang model kế. */
export async function explainWord(detail: WordDetail, deps: ExplainWordDeps): Promise<{ stored: StoredWordNote; fromCache: boolean }> {
  const cached = await deps.readCache(detail.simplified);
  if (cached) return { stored: cached, fromCache: true };
  if (deps.allowLlmCall && !(await deps.allowLlmCall())) throw new ExplainWordError("rate_limited", "Vượt giới hạn giải nghĩa");

  const prompt = buildWordNotePrompt(detail);
  let lastError = "";
  for (const model of deps.models ?? EXPLAIN_MODELS) {
    try {
      const raw = await deps.chat({ model, system: WORD_NOTE_SYSTEM, user: prompt, maxTokens: MAX_TOKENS });
      const note = wordMeaningNoteSchema.parse(JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")));
      const stored = { note, model };
      try { await deps.writeCache(detail.simplified, stored); } catch (error) {
        console.error(JSON.stringify({ event: "word_note_cache_write_error", message: (error as Error).message }));
      }
      return { stored, fromCache: false };
    } catch (error) {
      lastError = (error as Error).message;
    }
  }
  throw new ExplainWordError("explain_failed", `Không model nào giải nghĩa được: ${lastError}`);
}
