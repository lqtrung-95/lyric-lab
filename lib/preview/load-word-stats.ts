import "server-only";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { collectWordStats, distinctHanTerms, levelFromRows, type WordStat } from "./word-stats";

/**
 * Thống kê từ của một bài kèm cấp HSK từng từ (tra từ điển một lượt) để màn xem trước ước tính độ hiểu theo level người dùng.
 * Lỗi tra từ điển thì trả null (màn xem trước chỉ ẩn thanh độ hiểu, không hỏng trang).
 */
export async function loadWordStats(lines: AnalyzedLine[]): Promise<WordStat[] | null> {
  try {
    const dictionary = await lookupWords(createSupabaseServiceClient() as never, distinctHanTerms(lines));
    return collectWordStats(lines, (term) => levelFromRows(dictionary.get(term)));
  } catch (error) {
    console.error(JSON.stringify({ event: "word_stats_error", message: (error as Error)?.message }));
    return null;
  }
}
