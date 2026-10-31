import "server-only";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { TtlCache } from "@/lib/courses/ttl-cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { RadicalEntry } from "./radicals";

export interface RadicalChar { char: string; pinyin: string | null; meaning: string | null; hsk: number | null }

const cache = new TtlCache<RadicalChar[]>(30 * 60 * 1000, 60);
const MAX_CHARS = 24;

/**
 * Chữ chứa bộ này, ưu tiên chữ thuộc HSK và thông dụng (từ `dict_hanzi_info` + `dict_words`); pinyin lấy từ từ điển, nghĩa ưu tiên nghĩa Việt đã duyệt.
 * Bảng chưa nạp hoặc lỗi thì dùng chữ ví dụ viết tay của bộ (nếu có), vẫn tra pinyin; lỗi cả tra từ điển thì trả chữ trơn.
 */
export async function loadRadicalChars(entry: RadicalEntry): Promise<RadicalChar[]> {
  const hit = cache.get(entry.char);
  if (hit) return hit;
  const curated = entry.rich?.chars ?? [];
  try {
    const sb = createSupabaseServiceClient();
    const info = await sb.from("dict_hanzi_info").select("hanzi").in("radical", [entry.char, ...entry.variants]).limit(600);
    const fromDb = (info.data ?? []).map((r) => r.hanzi as string).filter((c) => c !== entry.char);
    const candidates = [...new Set([...curated, ...fromDb])];
    const words = await lookupWords(sb as never, candidates);
    const vi = await sb.from("dict_word_vi").select("term,meaning").in("term", candidates.slice(0, 400));
    const viMap = new Map((vi.data ?? []).map((r) => [r.term as string, r.meaning as string]));
    const rows = candidates.flatMap((c) => {
      const w = (words.get(c) ?? []).find((x) => x.hsk_level != null) ?? words.get(c)?.[0];
      return w ? [{ char: c, pinyin: w.pinyin, meaning: viMap.get(c) ?? w.meanings?.[0] ?? null, hsk: w.hsk_level, freq: w.frequency ?? 0, curated: curated.includes(c) }] : [];
    });
    rows.sort((a, b) => Number(b.curated) - Number(a.curated) || (a.hsk ?? 99) - (b.hsk ?? 99) || b.freq - a.freq);
    const out = rows.slice(0, MAX_CHARS).map((r) => ({ char: r.char, pinyin: r.pinyin, meaning: r.meaning, hsk: r.hsk }));
    if (out.length > 0) { cache.set(entry.char, out); return out; }
  } catch { /* dùng chữ ví dụ viết tay */ }
  return curated.map((char) => ({ char, pinyin: null, meaning: null, hsk: null }));
}
