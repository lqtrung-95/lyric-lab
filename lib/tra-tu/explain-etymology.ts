import type { ChatFn } from "@/lib/analysis/groq-chat";
import { generateCachedNote } from "./cached-llm-note";
import { allowedHan, buildEtymologyPrompt, ETYMOLOGY_SYSTEM, etymologyNoteSchema } from "./etymology-note";
import type { HanziInfoView, StoredEtymologyNote } from "./hanzi-info-types";

export interface ExplainEtymologyDeps {
  readCache(char: string): Promise<StoredEtymologyNote | null>;
  writeCache(char: string, value: StoredEtymologyNote): Promise<void>;
  chat: ChatFn;
  models?: string[];
  allowLlmCall?: () => boolean | Promise<boolean>;
}

/** Lời giải chiết tự tiếng Việt do AI viết cho một chữ (có lưu đệm). Chữ Hán trong lời AI phải nằm trong dữ kiện, nếu không model đó bị loại. */
export async function explainEtymology(info: HanziInfoView, deps: ExplainEtymologyDeps): Promise<{ stored: StoredEtymologyNote; fromCache: boolean }> {
  const schema = etymologyNoteSchema(allowedHan(info));
  const r = await generateCachedNote({
    readCache: async () => { const c = await deps.readCache(info.hanzi); return c && { value: c.note, model: c.model }; },
    writeCache: (v) => deps.writeCache(info.hanzi, { note: v.value, model: v.model }),
    chat: deps.chat, models: deps.models, allowLlmCall: deps.allowLlmCall,
    system: ETYMOLOGY_SYSTEM, prompt: buildEtymologyPrompt(info), maxTokens: 450,
    parse: (raw) => schema.parse(JSON.parse(raw)),
  });
  return { stored: { note: r.value, model: r.model }, fromCache: r.fromCache };
}
