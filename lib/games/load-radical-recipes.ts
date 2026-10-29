import "server-only";
import { unstable_cache } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { lookupWords, pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { sinoVietForWord } from "@/lib/dictionary/sino-viet";
import { cleanMeanings } from "@/lib/tools/build-hsk-rows";
import { getHskRows } from "@/lib/tools/hsk-vocab";
import { parsePair, pickStart, type Recipe } from "./radical-forge";

/** `meaningLang` = "en" khi chưa có nghĩa Việt và tạm dùng nghĩa tiếng Anh của từ điển (giao diện gắn nhãn). */
export interface CharInfo { pinyin: string; sinoViet: string | null; meaning: string; meaningLang?: "vi" | "en" }
export interface ForgeData { start: string[]; recipes: Recipe[]; info: Record<string, CharInfo> }

const BATCH = 200;
/** Số vòng lần theo cấu tạo của các mảnh trung gian (mảnh không phải chữ HSK nhưng cần để ghép tiếp). */
const EXTRA_ROUNDS = 2;

async function decompositions(chars: string[]): Promise<Map<string, string>> {
  const sb = createSupabaseServiceClient();
  const out = new Map<string, string>();
  for (let i = 0; i < chars.length; i += BATCH) {
    const { data, error } = await sb.from("dict_hanzi_info").select("hanzi,decomposition").in("hanzi", chars.slice(i, i + BATCH));
    if (error) throw new Error(`radical forge: ${error.message}`);
    for (const r of data ?? []) if (r.decomposition) out.set(r.hanzi as string, r.decomposition as string);
  }
  return out;
}

/**
 * Thông tin cho chữ ghép ra mà không phải chữ HSK có nghĩa Việt (mảnh trung gian như 林): pinyin và Hán Việt từ từ điển, nghĩa Việt nếu bảng `dict_word_vi` có,
 * không thì nghĩa tiếng Anh đầu tiên (đã lọc ghi chú). Chữ không có trong từ điển thì để trống (giao diện chỉ hiện chữ).
 */
async function fillMissingInfo(chars: string[], info: Record<string, CharInfo>): Promise<void> {
  if (chars.length === 0) return;
  const sb = createSupabaseServiceClient();
  const entries = await lookupWords(sb as never, chars).catch(() => new Map());
  const vi = new Map<string, string>();
  const { data: viRows } = await sb.from("dict_word_vi").select("term,meaning").in("term", chars);
  for (const r of viRows ?? []) vi.set(r.term as string, r.meaning as string);
  const { data: svRows } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
  const sv = new Map((svRows ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
  for (const c of chars) {
    const e = pickPrimaryEntry(entries.get(c) ?? []);
    if (!e) continue;
    // Bỏ ghi chú ngữ pháp ở đầu nghĩa ("(bound form) woods" → "woods").
    const english = cleanMeanings(e.meanings)[0]?.replace(/^\([^)]*\)\s+(?=\S)/, "");
    const meaning = vi.get(c) ?? english;
    if (meaning) info[c] = { pinyin: e.pinyin, sinoViet: sinoVietForWord(e.traditional, sv, c), meaning, meaningLang: vi.has(c) ? "vi" : "en" };
  }
}

/** Dựng dữ liệu trò chơi: chữ đích là chữ HSK một chữ có nghĩa Việt (có pinyin, Hán Việt từ từ điển); công thức từ cấu tạo thật của chữ. */
async function build(): Promise<ForgeData> {
  const rows = (await Promise.all([1, 2, 3, 4, 5, 6].map((l) => getHskRows(l as 1).catch(() => [])))).flat();
  const info: Record<string, CharInfo> = {};
  for (const r of rows) if ([...r.word].length === 1 && r.meaningVi && !info[r.word]) info[r.word] = { pinyin: r.pinyin, sinoViet: r.sinoViet, meaning: r.meaningVi };
  const known = new Set<string>();
  const recipes: Recipe[] = [];
  let todo = Object.keys(info);
  for (let round = 0; round <= EXTRA_ROUNDS && todo.length > 0; round++) {
    const next = new Set<string>();
    for (const [out, ids] of await decompositions(todo)) {
      known.add(out);
      const pair = parsePair(ids);
      if (!pair) continue;
      recipes.push({ a: pair[0], b: pair[1], out });
      for (const p of pair) if (!known.has(p) && !info[p]) next.add(p);
    }
    todo = [...next].filter((c) => !known.has(c));
  }
  const picked = pickStart(recipes);
  await fillMissingInfo([...new Set(picked.recipes.map((r) => r.out))].filter((c) => !info[c]), info);
  return { start: picked.start, recipes: picked.recipes, info };
}

/** Cache một ngày: dữ liệu từ điển ít đổi và phép dựng cần hàng chục truy vấn. */
export const loadRadicalRecipes = unstable_cache(build, ["radical-forge-v5"], { revalidate: 86400 });
