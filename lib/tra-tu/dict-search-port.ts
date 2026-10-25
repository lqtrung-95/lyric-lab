import "server-only";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { pinyinRegexFallback } from "./pinyin-plain";
import type { DictSearchPort } from "./search-dictionary";

const COLS = "simplified,traditional,pinyin,meanings,hsk_level,frequency";
const PAGE = 40;
type Sb = ReturnType<typeof createSupabaseServiceClient>;

// Có cột `pinyin_plain`/`meanings_text` (migration dict_search_columns) thì dùng chỉ mục; chưa có thì rớt về truy vấn chậm hơn nhưng vẫn đúng.
let columnsPromise: Promise<boolean> | null = null;
function hasSearchColumns(sb: Sb): Promise<boolean> {
  columnsPromise ??= (async () => !(await sb.from("dict_words").select("pinyin_plain,meanings_text").limit(1)).error)();
  return columnsPromise;
}

const popular = <T extends { order: (c: string, o: { ascending: boolean; nullsFirst: boolean }) => T }>(q: T) =>
  q.order("hsk_level", { ascending: true, nullsFirst: false }).order("frequency", { ascending: true, nullsFirst: false });

async function run(q: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<DictWordRow[]> {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as DictWordRow[];
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const safeLatin = (s: string) => s.replace(/[^a-z0-9 '-]/g, "");

// Danh sách `in` quá dài làm URL vượt giới hạn của gateway (mỗi chữ Hán mã hóa thành 9 ký tự): chia lô nhỏ chạy song song.
const CHUNK = 100;
async function inChunks(sb: Sb, column: "simplified" | "traditional", terms: string[]): Promise<DictWordRow[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < terms.length; i += CHUNK) chunks.push(terms.slice(i, i + CHUNK));
  return (await Promise.all(chunks.map((c) => run(sb.from("dict_words").select(COLS).in(column, c))))).flat();
}

export function createDictSearchPort(sb: Sb = createSupabaseServiceClient()): DictSearchPort {
  return {
    async byHan(simplified, traditional) {
      const [exact, prefix] = await Promise.all([
        run(popular(sb.from("dict_words").select(COLS).or(`simplified.eq.${simplified},traditional.eq.${traditional}`)).limit(PAGE)),
        run(popular(sb.from("dict_words").select(COLS).like("simplified", `${simplified}%`)).limit(PAGE)),
      ]);
      // Truy vấn một chữ: thêm các từ chứa chữ đó khi chưa đủ kết quả (đăng sau cùng).
      const more = prefix.length + exact.length < 12
        ? await run(popular(sb.from("dict_words").select(COLS).like("simplified", `%${simplified}%`)).limit(PAGE))
        : [];
      return [...exact, ...prefix, ...more];
    },
    async byPinyinPlain(plain) {
      if (await hasSearchColumns(sb)) {
        const [exact, prefix] = await Promise.all([
          run(popular(sb.from("dict_words").select(COLS).eq("pinyin_plain", plain)).limit(PAGE)),
          run(popular(sb.from("dict_words").select(COLS).like("pinyin_plain", `${plain}%`)).limit(PAGE)),
        ]);
        return [...exact, ...prefix];
      }
      return run(popular(sb.from("dict_words").select(COLS).filter("pinyin", "imatch", pinyinRegexFallback(plain))).limit(PAGE));
    },
    async byEnglish(folded) {
      const q = safeLatin(folded).trim();
      if (!q) return [];
      if (!(await hasSearchColumns(sb))) {
        return run(popular(sb.from("dict_words").select(COLS).or(`meanings.cs.{${q}},meanings.cs.{to ${q}}`)).limit(PAGE));
      }
      const word = await run(popular(sb.from("dict_words").select(COLS).filter("meanings_text", "imatch", `(^|[^a-z])${escapeRegex(q)}([^a-z]|$)`)).limit(PAGE));
      if (word.length >= 20) return word;
      return [...word, ...(await run(popular(sb.from("dict_words").select(COLS).ilike("meanings_text", `%${q}%`)).limit(PAGE)))];
    },
    bySimplified: (terms) => inChunks(sb, "simplified", terms),
    byTraditional: (terms) => inChunks(sb, "traditional", terms),
  };
}
