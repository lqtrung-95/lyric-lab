import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { orderSinoViet } from "@/lib/dictionary/sino-viet-overrides";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import { parseDecomposition } from "./hanzi-structure";
import type { ComponentRef, HanziInfoView } from "./hanzi-info-types";
import type { HanziEtymology } from "./parse-hanzi-dictionary";

interface InfoRow { hanzi: string; radical: string; decomposition: string | null; etymology: HanziEtymology | null; definition: string | null }

/** Dựng dạng hiển thị từ dòng dữ liệu + hàm tra Hán Việt (hàm thuần để test). */
export function buildHanziInfoView(row: InfoRow, sinoViet: (c: string) => string[]): HanziInfoView {
  const ref = (char: string): ComponentRef => ({ char, sinoViet: sinoViet(char)[0] ?? null });
  const structure = parseDecomposition(row.decomposition);
  const e = row.etymology;
  return {
    hanzi: row.hanzi, sinoViet: sinoViet(row.hanzi), radical: ref(row.radical), layout: structure.layout, layoutLabel: structure.layoutLabel,
    components: structure.components.map(ref),
    etymology: e ? { type: e.type, hint: e.hint, phonetic: e.phonetic ? ref(e.phonetic) : undefined, semantic: e.semantic ? ref(e.semantic) : undefined } : null,
    definition: row.definition,
  };
}

/**
 * Chiết tự các chữ của một từ (bộ thủ, cấu tạo, nguồn gốc) từ `dict_hanzi_info`. `ready` false khi bảng chưa tạo/chưa nạp dữ liệu (migration + script do người dùng chạy)
 * để trang ẩn cả khối thay vì lỗi.
 */
export async function loadHanziInfo(chars: string[]): Promise<{ ready: boolean; items: HanziInfoView[] }> {
  const unique = [...new Set(chars)].slice(0, 6);
  if (unique.length === 0) return { ready: false, items: [] };
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("dict_hanzi_info").select("hanzi,radical,decomposition,etymology,definition").in("hanzi", unique);
  if (error || !data?.length) return { ready: false, items: [] };
  const rows = data as InfoRow[];
  const needed = new Set<string>();
  for (const r of rows) {
    const s = parseDecomposition(r.decomposition);
    for (const c of [r.hanzi, r.radical, ...s.components, r.etymology?.phonetic, r.etymology?.semantic]) if (c) { needed.add(c); needed.add(toSimplifiedChinese(c)); }
  }
  const sv = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", [...needed]);
  const readings = new Map((sv.data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
  const lookup = (c: string) => orderSinoViet(c, readings.get(c) ?? readings.get(toSimplifiedChinese(c)) ?? []);
  const byChar = new Map(rows.map((r) => [r.hanzi, buildHanziInfoView(r, lookup)]));
  return { ready: true, items: unique.map((c) => byChar.get(c)).filter((x): x is HanziInfoView => !!x) };
}
