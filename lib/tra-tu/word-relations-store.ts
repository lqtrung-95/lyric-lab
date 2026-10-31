import "server-only";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { readAiNote, writeAiNote } from "./ai-note-store";
import { sortReadings } from "./rank-results";
import { cleanRelationWords, MAX_ANTONYMS, MAX_SYNONYMS, rawRelationsSchema, WORD_RELATIONS_PROMPT_VERSION, type RawRelations, type RelatedWord, type WordRelations } from "./word-relations";

/** Danh sách từ liên quan đã lưu (thô, chỉ chữ Hán); null khi chưa có hoặc bảng chưa tạo. */
export async function readWordRelations(term: string): Promise<{ raw: RawRelations | null; tableReady: boolean; model: string | null }> {
  const { row, tableReady } = await readAiNote(term, "relations", WORD_RELATIONS_PROMPT_VERSION);
  const parsed = row ? rawRelationsSchema.safeParse(row.data) : null;
  return { raw: parsed?.success ? parsed.data : null, tableReady, model: parsed?.success ? row!.model : null };
}

export const writeWordRelations = (term: string, raw: RawRelations, model: string): Promise<void> => writeAiNote(term, "relations", WORD_RELATIONS_PROMPT_VERSION, raw, model);

/**
 * Biến danh sách thô của model thành từ hiển thị được: chỉ giữ từ CÓ TRONG TỪ ĐIỂN (model hay bịa từ), pinyin lấy từ từ điển, nghĩa ưu tiên nghĩa Việt đã duyệt rồi nghĩa tiếng Anh đầu tiên.
 * Lỗi tra từ điển thì trả rỗng (giao diện ẩn mục này).
 */
export async function enrichRelations(raw: RawRelations, self: string): Promise<WordRelations> {
  const { synonyms, antonyms } = cleanRelationWords(raw, self);
  const all = [...synonyms, ...antonyms];
  if (all.length === 0) return { synonyms: [], antonyms: [] };
  try {
    const sb = createSupabaseServiceClient();
    const rows = await lookupWords(sb as never, all);
    const vi = await sb.from("dict_word_vi").select("term,meaning").in("term", all);
    const viMap = new Map((vi.data ?? []).map((r) => [r.term as string, r.meaning as string]));
    const make = (term: string): RelatedWord[] => {
      const r = rows.get(term);
      if (!r || r.length === 0) return [];
      const top = sortReadings(r)[0];
      return [{ term, pinyin: top.pinyin, meaning: viMap.get(term) ?? top.meanings[0] ?? null }];
    };
    return { synonyms: synonyms.flatMap(make).slice(0, MAX_SYNONYMS), antonyms: antonyms.flatMap(make).slice(0, MAX_ANTONYMS) };
  } catch {
    return { synonyms: [], antonyms: [] };
  }
}
