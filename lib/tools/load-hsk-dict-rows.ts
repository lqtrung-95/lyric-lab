import type { SupabaseClient } from "@supabase/supabase-js";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";

const PAGE = 1000;
const CHUNK = 150;
const COLUMNS = "simplified,traditional,pinyin,meanings,hsk_level,frequency";

/**
 * Các dòng từ điển của một cấp HSK, kèm MỌI cách đọc của các từ đó (kể cả mục chưa gắn cấp). Dữ liệu nguồn chỉ gắn cấp cho một vài mục của chữ nhiều âm
 * (vd. chỉ mục họ người "Yě" của 也, hoặc "hú" của 和), nên nếu chỉ lấy các mục có cấp thì `pickPrimaryEntry` không còn cách đọc thông dụng để chọn.
 * Sắp theo `id` (thứ tự file CC-CEDICT, cách đọc thông dụng thường đứng trước) để chọn ổn định khi mọi mục ngang nhau.
 */
export async function loadHskDictRows(sb: SupabaseClient, level: number): Promise<DictWordRow[]> {
  const atLevel: DictWordRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from("dict_words").select(COLUMNS).eq("hsk_level", level).order("id").range(from, from + PAGE - 1);
    if (error) throw new Error(`đọc từ vựng HSK ${level}: ${error.message}`);
    atLevel.push(...((data ?? []) as DictWordRow[]));
    if ((data ?? []).length < PAGE) break;
  }
  const terms = [...new Set(atLevel.map((r) => r.simplified))];
  const all: DictWordRow[] = [];
  for (let i = 0; i < terms.length; i += CHUNK) {
    const { data, error } = await sb.from("dict_words").select(COLUMNS).in("simplified", terms.slice(i, i + CHUNK)).order("id").range(0, PAGE - 1);
    if (error) throw new Error(`đọc mọi cách đọc của từ HSK ${level}: ${error.message}`);
    all.push(...((data ?? []) as DictWordRow[]));
  }
  return all;
}
