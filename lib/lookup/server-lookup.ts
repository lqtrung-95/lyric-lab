import "server-only";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { PROMPT_VERSION } from "@/lib/analysis/build-analysis-prompt";
import { createGroqChat } from "@/lib/analysis/groq-chat";
import { EXPLAIN_LANG } from "@/lib/analysis/analyze-video";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import { buildTermEntry, type TermEntry } from "./build-term-entry";
import type { ExplainDeps } from "./explain-term";

/** Tra một từ (dạng phồn hoặc giản) trong từ điển: pinyin, Hán Việt, cấp HSK, nghĩa tiếng Anh. */
export async function lookupTermEntry(term: string): Promise<TermEntry | null> {
  const sb = createSupabaseServiceClient();
  const simplified = toSimplifiedChinese(term);
  const rows = (await lookupWords(sb as never, [simplified])).get(simplified) ?? [];
  if (rows.length === 0) return null;
  const chars = [...new Set([...rows.flatMap((r) => [...r.traditional])])];
  const { data } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
  const sinoViet = new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
  return buildTermEntry(rows, sinoViet);
}

/** Phụ thuộc thật cho `explainTerm`: cache `term_explanations`, từ điển, Groq. */
export function createExplainDeps(allowLlmCall: () => boolean | Promise<boolean>): ExplainDeps {
  const sb = createSupabaseServiceClient();
  const key = (r: { videoId: string; lineIndex: number; term: string }) => ({
    video_id: r.videoId, line_index: r.lineIndex, term: r.term, explain_lang: EXPLAIN_LANG, prompt_version: PROMPT_VERSION,
  });
  return {
    readCache: async (req) => {
      const k = key(req);
      const { data } = await sb.from("term_explanations").select("meaning_in_context,note,model")
        .eq("video_id", k.video_id).eq("line_index", k.line_index).eq("term", k.term)
        .eq("explain_lang", k.explain_lang).eq("prompt_version", k.prompt_version).maybeSingle();
      return data ? { meaningInContext: data.meaning_in_context, note: data.note ?? undefined, model: data.model } : null;
    },
    writeCache: async (req, v) => {
      const { error } = await sb.from("term_explanations").upsert(
        { ...key(req), meaning_in_context: v.meaningInContext, note: v.note ?? null, model: v.model },
        { onConflict: "video_id,line_index,term,explain_lang,prompt_version" },
      );
      if (error) throw new Error(error.message);
    },
    dictionaryMeanings: async (term) => (await lookupTermEntry(term))?.meanings ?? [],
    chat: createGroqChat(getServerEnv().GROQ_API_KEY),
    allowLlmCall,
  };
}
