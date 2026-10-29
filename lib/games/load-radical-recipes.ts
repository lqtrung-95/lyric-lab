import "server-only";
import { unstable_cache } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { getHskRows } from "@/lib/tools/hsk-vocab";
import { parsePair, pickStart, type Recipe } from "./radical-forge";

export interface CharInfo { pinyin: string; sinoViet: string | null; meaning: string }
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
  return { start: picked.start, recipes: picked.recipes, info };
}

/** Cache một ngày: dữ liệu từ điển ít đổi và phép dựng cần hàng chục truy vấn. */
export const loadRadicalRecipes = unstable_cache(build, ["radical-forge-v3"], { revalidate: 86400 });
