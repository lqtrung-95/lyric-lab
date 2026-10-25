import "server-only";
import { TtlCache } from "@/lib/courses/ttl-cache";
import { createDictSearchPort } from "./dict-search-port";
import { loadGlossIndex, loadSinoVietIndex } from "./load-search-indexes";
import { searchDictionary } from "./search-dictionary";
import type { WordResult } from "./types";

const results = new TtlCache<WordResult[]>(5 * 60 * 1000, 500);
const port = createDictSearchPort();

/** Tìm từ (bản chạy thật, có nhớ đệm 5 phút theo truy vấn + giới hạn). */
export async function searchWords(query: string, limit: number): Promise<WordResult[]> {
  const key = `${limit}|${query.trim().toLowerCase()}`;
  const hit = results.get(key);
  if (hit) return hit;
  const [sinoViet, glosses] = await Promise.all([loadSinoVietIndex(), loadGlossIndex()]);
  const found = await searchDictionary(query, limit, { port, sinoViet, glosses });
  results.set(key, found);
  return found;
}
