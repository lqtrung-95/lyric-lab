import type { ChatFn } from "@/lib/analysis/groq-chat";
import { buildWordNotePrompt, WORD_NOTE_SYSTEM } from "./build-word-note-prompt";
import { generateCachedNote, NoteError } from "./cached-llm-note";
import { wordMeaningNoteSchema, type StoredWordNote } from "./word-note-schema";
import type { WordDetail } from "./word-detail-types";

/** Lỗi giải nghĩa từ: dùng chung lớp lỗi của ghi chú AI (`rate_limited` | `explain_failed`). */
export { NoteError as ExplainWordError };

export interface ExplainWordDeps {
  readCache(term: string): Promise<StoredWordNote | null>;
  writeCache(term: string, value: StoredWordNote): Promise<void>;
  chat: ChatFn;
  models?: string[];
  allowLlmCall?: () => boolean | Promise<boolean>;
}

/** Giải nghĩa tiếng Việt cho cả từ bằng LLM, có lưu đệm theo từ. Model lỗi/ra sai dạng thì rớt sang model kế. */
export async function explainWord(detail: WordDetail, deps: ExplainWordDeps): Promise<{ stored: StoredWordNote; fromCache: boolean }> {
  const r = await generateCachedNote({
    readCache: async () => { const c = await deps.readCache(detail.simplified); return c && { value: c.note, model: c.model }; },
    writeCache: (v) => deps.writeCache(detail.simplified, { note: v.value, model: v.model }),
    chat: deps.chat, models: deps.models, allowLlmCall: deps.allowLlmCall,
    system: WORD_NOTE_SYSTEM, prompt: buildWordNotePrompt(detail), maxTokens: 500,
    parse: (raw) => wordMeaningNoteSchema.parse(JSON.parse(raw)),
  });
  return { stored: { note: r.value, model: r.model }, fromCache: r.fromCache };
}
