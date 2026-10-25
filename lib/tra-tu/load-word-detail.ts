import "server-only";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { sinoVietForWord } from "@/lib/dictionary/sino-viet";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import { loadGlossIndex } from "./load-search-indexes";
import { sortReadings } from "./rank-results";
import type { WordDetail } from "./word-detail-types";

/** Từ điển + Hán Việt từng chữ cho trang chi tiết; null nếu từ không có trong từ điển. Nhận cả phồn thể. */
export async function loadWordDetail(term: string): Promise<WordDetail | null> {
  const sb = createSupabaseServiceClient();
  const simplified = toSimplifiedChinese(term);
  const rows = (await lookupWords(sb as never, [simplified])).get(simplified) ?? [];
  if (rows.length === 0) return null;

  const readings = sortReadings(rows);
  const primaryTraditional = rows.find((r) => r.pinyin === readings[0].pinyin)?.traditional ?? rows[0].traditional;
  const traditionalChars = [...new Set(rows.flatMap((r) => [...r.traditional]))];
  const { data } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", traditionalChars);
  const readingsOf = new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
  const glosses = await loadGlossIndex().catch(() => null);

  const simpChars = [...simplified];
  const tradChars = [...primaryTraditional];
  const levels = readings.map((r) => r.hskLevel).filter((l): l is number => l !== null);
  return {
    simplified,
    traditionalForms: [...new Set(rows.map((r) => r.traditional))],
    readings,
    sinoViet: sinoVietForWord(primaryTraditional, readingsOf),
    hskLevel: levels.length ? Math.min(...levels) : null,
    chars: simpChars.map((hanzi, i) => {
      const traditional = tradChars.length === simpChars.length ? tradChars[i] : hanzi;
      return { hanzi, traditional, sinoViet: readingsOf.get(traditional) ?? readingsOf.get(hanzi) ?? [] };
    }),
    gloss: glosses?.glosses.get(simplified) ?? null,
  };
}
