import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import { sinoVietForWord } from "@/lib/dictionary/sino-viet";
import { classifyQuery } from "./classify-query";
import { searchGlosses, type GlossIndex } from "./gloss-search";
import { rankCandidates, type Candidate } from "./rank-results";
import { readsAs, sinoVietCandidates, sinoVietSyllables, type SinoVietIndex } from "./sino-viet-search";
import type { WordResult } from "./types";

/** Các truy vấn vào bảng `dict_words` mà tìm kiếm cần (bản thật ở `dict-search-port.ts`); tách ra để test bằng dữ liệu nhỏ. */
export interface DictSearchPort {
  byHan(simplified: string, traditional: string): Promise<DictWordRow[]>;
  byPinyinPlain(plain: string): Promise<DictWordRow[]>;
  byEnglish(folded: string): Promise<DictWordRow[]>;
  bySimplified(terms: string[]): Promise<DictWordRow[]>;
  byTraditional(terms: string[]): Promise<DictWordRow[]>;
}

export interface SearchDeps { port: DictSearchPort; sinoViet: SinoVietIndex; glosses: GlossIndex }

const tag = (rows: DictWordRow[], source: Candidate["source"]): Candidate[] => rows.map((row) => ({ row, source }));

/** Mỗi nguồn lỗi chỉ làm mất nguồn đó, không làm hỏng cả lần tìm (ô gợi ý vẫn có kết quả từ các nguồn còn lại). */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch (error) {
    console.error(JSON.stringify({ event: "tra_tu_source_error", message: (error as Error).message }));
    return fallback;
  }
}

async function latinCandidates(q: ReturnType<typeof classifyQuery>, deps: SearchDeps): Promise<Candidate[]> {
  const folded = q.folded!;
  const syllables = sinoVietSyllables(deps.sinoViet, folded);
  const glossHits = searchGlosses(deps.glosses, folded, 30);
  const [pinyin, english, sino, gloss] = await Promise.all([
    q.plainPinyin ? safe(deps.port.byPinyinPlain(q.plainPinyin), []) : [],
    folded.length >= 2 ? safe(deps.port.byEnglish(folded), []) : [],
    syllables ? safe(deps.port.byTraditional(sinoVietCandidates(deps.sinoViet, syllables)), []) : [],
    glossHits.length ? safe(deps.port.bySimplified(glossHits.map((h) => h.term)), []) : [],
  ]);
  return [
    ...tag(pinyin, "pinyin"), ...tag(english, "english"), ...gloss.map((row): Candidate => ({ row, source: "vi-gloss", strength: glossHits.find((h) => h.term === row.simplified)?.strength })),
    ...tag(syllables ? sino.filter((r) => readsAs(deps.sinoViet, r.traditional, syllables)) : [], "sino-viet"),
  ];
}

/** Tìm từ theo chữ Hán (giản/phồn), pinyin (có/không dấu, có/không cách), âm Hán Việt, nghĩa tiếng Anh và nghĩa tiếng Việt đã duyệt. */
export async function searchDictionary(query: string, limit: number, deps: SearchDeps): Promise<WordResult[]> {
  const q = classifyQuery(query);
  let simplified = "";
  let candidates: Candidate[];
  if (q.han) {
    simplified = toSimplifiedChinese(q.han);
    candidates = tag(await deps.port.byHan(simplified, q.han), "han");
  } else if (q.folded) {
    candidates = await latinCandidates(q, deps);
  } else return [];

  const ranked = rankCandidates(candidates, q, simplified, limit);
  return ranked.map((r) => ({
    ...r,
    sinoViet: sinoVietForWord(r.traditional, deps.sinoViet.byHanzi),
    gloss: deps.glosses.glosses.get(r.simplified) ?? null,
  }));
}
