import "server-only";
import { TtlCache } from "@/lib/courses/ttl-cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

const cache = new TtlCache<string[]>(30 * 60 * 1000, 20);

/** Từ HSK cùng cấp làm đáp án nhiễu cho bài điền từ (tối đa 60 từ 1–3 chữ). Lỗi thì rỗng: bài tập tự ẩn. */
export async function loadPracticePool(level: number | null): Promise<string[]> {
  const key = String(level ?? 1);
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const { data, error } = await createSupabaseServiceClient().from("dict_words").select("simplified").eq("hsk_level", level ?? 1).limit(400);
    if (error) throw new Error(error.message);
    const words = [...new Set((data ?? []).map((r) => r.simplified as string))].filter((w) => [...w].length <= 3).slice(0, 60);
    cache.set(key, words);
    return words;
  } catch { return []; }
}
