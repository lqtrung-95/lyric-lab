import "server-only";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { createDictSearchPort } from "./dict-search-port";
import { loadGlossIndex } from "./load-search-indexes";
import type { HanziInfoView } from "./hanzi-info-types";
import type { CompoundWord } from "./rank-compounds";
import { popularityBonus, sortReadings } from "./rank-results";
import { themeNeighbors } from "./theme-neighbors";
import type { MapGroup, MapNode } from "./word-map-layout";

const PER_GROUP = 4;

/** Nút bản đồ từ các dòng từ điển của một từ: cách đọc chính + nghĩa Việt đã duyệt (nếu có) hoặc nghĩa Anh đầu tiên. */
export function nodeFromRows(rows: DictWordRow[], gloss: string | null): MapNode {
  const main = sortReadings(rows)[0];
  return { term: rows[0].simplified, pinyin: main.pinyin, meaning: gloss ?? main.meanings[0] ?? "" };
}

const bestFirst = (rows: DictWordRow[]) => [...rows].sort((a, b) => popularityBonus(b.hsk_level, b.frequency) - popularityBonus(a.hsk_level, a.frequency));

// Mục "bộ thủ Khang Hy", biến thể cổ hay tham chiếu sang chữ khác không giúp người học mở rộng vốn từ.
const NOT_USEFUL = /radical|variant|archaic|obsolete|^see |ancient/i;

/** Các chữ đơn cùng bộ thủ (theo `dict_hanzi_info`), phổ biến trước, không gồm chữ đang xem. Bảng chưa có thì rỗng. */
async function sameRadicalChars(radical: string, exclude: Set<string>): Promise<DictWordRow[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.from("dict_hanzi_info").select("hanzi").eq("radical", radical).limit(400);
  const chars = (data ?? []).map((r) => r.hanzi as string).filter((c) => !exclude.has(c));
  if (chars.length === 0) return [];
  return (await createDictSearchPort(sb).bySimplified(chars)).filter((r) => !NOT_USEFUL.test(r.meanings[0] ?? ""));
}

/**
 * Bản đồ từ vựng liên quan: từ ghép, chữ cùng bộ thủ, từ cùng chủ đề (lộ trình HSK). Mọi dữ liệu từ từ điển và bảng chủ đề đã duyệt, không qua AI.
 * Lỗi một nhóm thì nhóm đó rỗng (bản đồ vẫn hiện các nhóm còn lại).
 */
export async function loadWordMap(term: string, compounds: CompoundWord[], info: HanziInfoView | undefined): Promise<MapGroup[]> {
  const glosses = await loadGlossIndex().catch(() => null);
  const gloss = (t: string) => glosses?.glosses.get(t) ?? null;
  const group = async (id: MapGroup["id"], label: string, shortLabel: string, rows: () => Promise<DictWordRow[]>): Promise<MapGroup> => {
    try {
      const byWord = new Map<string, DictWordRow[]>();
      for (const r of bestFirst(await rows())) byWord.set(r.simplified, [...(byWord.get(r.simplified) ?? []), r]);
      return { id, label, shortLabel, nodes: [...byWord.values()].slice(0, PER_GROUP).map((rs) => nodeFromRows(rs, gloss(rs[0].simplified))) };
    } catch { return { id, label, shortLabel, nodes: [] }; }
  };

  const theme = themeNeighbors(term, 12);
  const radical = info?.radical;
  const [radicalGroup, themeGroup] = await Promise.all([
    radical ? group("radical", `Cùng bộ ${radical.char}${radical.sinoViet ? ` (${radical.sinoViet})` : ""}`, `Cùng bộ ${radical.char}`, () => sameRadicalChars(radical.char, new Set([...term, radical.char]))) : Promise.resolve(null),
    theme ? group("theme", `Cùng chủ đề: ${theme.themeTitle}`, "Cùng chủ đề", () => createDictSearchPort().bySimplified(theme.words)) : Promise.resolve(null),
  ]);
  const compoundGroup: MapGroup = { id: "compound", label: "Từ ghép", shortLabel: "Từ ghép", nodes: compounds.slice(0, PER_GROUP).map((c) => ({ term: c.simplified, pinyin: c.pinyin, meaning: c.gloss ?? c.meaning })) };
  return [compoundGroup, radicalGroup, themeGroup].filter((g): g is MapGroup => !!g && g.nodes.length > 0);
}
