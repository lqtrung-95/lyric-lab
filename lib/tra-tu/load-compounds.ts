import "server-only";
import { TtlCache } from "@/lib/courses/ttl-cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { loadGlossIndex } from "./load-search-indexes";
import { rankCompounds, type CompoundWord } from "./rank-compounds";

const POOL = 300;
const MAX = 36;
const cache = new TtlCache<CompoundWord[]>(10 * 60 * 1000, 300);

/** Từ ghép chứa `term` lấy từ `dict_words` (quét `like %term%`, nhớ đệm 10 phút), kèm nghĩa tiếng Việt đã duyệt nếu có. Lỗi thì trả rỗng, không làm hỏng trang. */
export async function loadCompounds(term: string): Promise<CompoundWord[]> {
  const hit = cache.get(term);
  if (hit) return hit;
  try {
    const { data, error } = await createSupabaseServiceClient().from("dict_words")
      .select("simplified,traditional,pinyin,meanings,hsk_level,frequency")
      .like("simplified", `%${term}%`).neq("simplified", term)
      // Lấy trước các từ phổ biến để vùng đệm 300 dòng không bị từ hiếm chiếm chỗ; xếp hạng chính xác làm ở `rankCompounds`.
      .order("hsk_level", { ascending: true, nullsFirst: false }).order("frequency", { ascending: true, nullsFirst: false }).limit(POOL);
    if (error) throw new Error(error.message);
    const glosses = await loadGlossIndex().catch(() => null);
    const ranked = rankCompounds((data ?? []) as DictWordRow[], term, MAX).map((c) => ({ ...c, gloss: glosses?.glosses.get(c.simplified) ?? null }));
    cache.set(term, ranked);
    return ranked;
  } catch (error) {
    console.error(JSON.stringify({ event: "tra_tu_compounds_error", message: (error as Error).message }));
    return [];
  }
}
