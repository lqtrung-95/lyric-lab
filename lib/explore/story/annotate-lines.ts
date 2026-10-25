import "server-only";
import { buildLinePinyin, withSubwordEntries } from "@/lib/analysis/build-line-pinyin";
import { collectHanTerms, tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

/**
 * Pinyin cho các câu tiếng Trung tự viết (lời thoại, manh mối): tách từ bằng jieba rồi ghép pinyin từ TỪ ĐIỂN (quy tắc 2: không để AI sinh pinyin),
 * cùng đường ống với lời video. Trả bản đồ câu gốc → pinyin; câu không có chữ Hán bị bỏ qua; lỗi tra từ điển thì trả bản đồ rỗng (giao diện chỉ thiếu dòng pinyin).
 */
export async function annotatePinyin(texts: readonly string[]): Promise<Record<string, string>> {
  const unique = [...new Set(texts.filter((t) => /\p{Script=Han}/u.test(t)))];
  if (unique.length === 0) return {};
  try {
    const lines = tokenizeLyricLines(normalizeLyricLines(unique.map((text, i) => ({ text, start: i, end: i + 1 }))));
    const sb = createSupabaseServiceClient();
    const lookup = (terms: string[]) => lookupWords(sb as never, terms);
    const terms = collectHanTerms(lines);
    const dictionary = await withSubwordEntries(lookup, await lookup(terms), terms);
    return Object.fromEntries(lines.map((l) => [l.text, buildLinePinyin(l.tokens, dictionary)]));
  } catch {
    return {};
  }
}
