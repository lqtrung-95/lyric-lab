import "server-only";
import { TtlCache } from "@/lib/courses/ttl-cache";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { loadGlossIndex } from "./load-search-indexes";
import { plainPinyin } from "./pinyin-plain";
import { rankSoundAlikes, type SoundAlike } from "./rank-homophones";

const cache = new TtlCache<{ same: SoundAlike[]; otherTone: SoundAlike[] }>(10 * 60 * 1000, 300);
const POOL = 300;
const EMPTY = { same: [], otherTone: [] };

/** Từ cùng âm (cùng cách đọc và cùng âm khác thanh) từ `dict_words.pinyin_plain` (nhớ đệm 10 phút), kèm nghĩa Việt đã duyệt nếu có. Lỗi hoặc thiếu cột (migration chưa chạy) thì trả rỗng, trang tự ẩn mục này. */
export async function loadSoundAlikes(term: string, pinyin: string): Promise<{ same: SoundAlike[]; otherTone: SoundAlike[] }> {
  const plain = plainPinyin(pinyin);
  if (!plain) return EMPTY;
  const key = `${term}|${pinyin}`;
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const { data, error } = await createSupabaseServiceClient().from("dict_words")
      .select("simplified,traditional,pinyin,meanings,hsk_level,frequency")
      .eq("pinyin_plain", plain).neq("simplified", term)
      .order("hsk_level", { ascending: true, nullsFirst: false }).order("frequency", { ascending: true, nullsFirst: false }).limit(POOL);
    if (error) throw new Error(error.message);
    const glosses = await loadGlossIndex().catch(() => null);
    const r = rankSoundAlikes((data ?? []) as DictWordRow[], term, pinyin, 8);
    const withGloss = (l: SoundAlike[]) => l.map((w) => ({ ...w, gloss: glosses?.glosses.get(w.simplified) ?? null }));
    const out = { same: withGloss(r.same), otherTone: withGloss(r.otherTone) };
    cache.set(key, out);
    return out;
  } catch (error) {
    console.error(JSON.stringify({ event: "tra_tu_sound_alikes_error", message: (error as Error).message }));
    return EMPTY;
  }
}
