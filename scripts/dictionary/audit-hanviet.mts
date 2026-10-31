// Rà âm Hán Việt trong `dict_hanzi_sino_viet` cho các chữ thuộc từ HSK. Chạy:
//   npx tsx --env-file=.env.local scripts/dictionary/audit-hanviet.mts
// Ghi ba tệp vào data-cache/ (cột: hanzi, hsk, am_dau_trong_db, tat_ca_am, am_chuan_trong_bang):
//   hanviet-audit-khac-bang.csv  chữ có âm đầu trong DB KHÁC bảng chuẩn `sino-viet-overrides.ts` (nghi sai, nên rà trước)
//   hanviet-audit-nhieu-am-hsk123.csv  chữ HSK 1–3 có ≥ 2 âm mà chưa có trong bảng chuẩn (xem âm đầu có phải âm Hán Việt thông dụng nhất không)
//   hanviet-audit-thieu.csv  chữ không có âm ở cả dạng phồn lẫn giản, không có trong bảng chuẩn lẫn bảng bổ sung
// Chữ được tính theo ĐÚNG cách app tra: dạng phồn của từ trước, thiếu thì dạng giản cùng vị trí (nên chữ giản như 们 không bị tính là thiếu chỉ vì bảng khóa theo phồn).
import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { SUPPLEMENT_SINO_VIET } from "@/lib/dictionary/sino-viet";
import { overrideSinoViet } from "@/lib/dictionary/sino-viet-overrides";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (dùng --env-file=.env.local)");
const sb = createClient(url, key, { auth: { persistSession: false } });

async function readAll<T>(table: string, columns: string, orderBy: string, filter?: (q: any) => any): Promise<T[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select(columns).order(orderBy).range(from, from + 999);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

const isHan = (c: string) => /\p{Script=Han}/u.test(c);
const words = await readAll<{ simplified: string; traditional: string; hsk_level: number }>("dict_words", "simplified,traditional,hsk_level", "simplified", (q) => q.not("hsk_level", "is", null));
const rows = await readAll<{ hanzi: string; readings: string[] }>("dict_hanzi_sino_viet", "hanzi,readings", "hanzi");
const byChar = new Map(rows.map((r) => [r.hanzi, r.readings]));

// Mỗi chữ phồn của từ, kèm chữ giản cùng vị trí (nếu độ dài khớp) và cấp HSK thấp nhất.
const chars = new Map<string, { simp: string | null; level: number }>();
for (const w of words) {
  const t = [...w.traditional], s = [...w.simplified];
  t.forEach((c, i) => {
    if (!isHan(c)) return;
    const cur = chars.get(c);
    chars.set(c, { simp: s.length === t.length ? s[i] : (cur?.simp ?? null), level: Math.min(cur?.level ?? 9, w.hsk_level) });
  });
}

const head = "hanzi,hsk,am_dau_trong_db,tat_ca_am,am_chuan_trong_bang";
const out = { khac: [head], nhieu: [head], thieu: [head] };
for (const [c, { simp, level }] of [...chars].sort((a, b) => a[1].level - b[1].level || a[0].localeCompare(b[0]))) {
  const r = byChar.get(c) ?? (simp ? byChar.get(simp) : undefined) ?? [];
  const std = overrideSinoViet(c) ?? (simp ? overrideSinoViet(simp) : undefined);
  const fallback = SUPPLEMENT_SINO_VIET[c] ?? (simp ? SUPPLEMENT_SINO_VIET[simp] : undefined);
  const line = [c, level, r[0] ?? "", r.join("/"), std ?? ""].join(",");
  if (r.length === 0 && !std && !fallback) out.thieu.push(line);
  else if (std && r.length > 0 && r[0] !== std) out.khac.push(line);
  else if (!std && r.length >= 2 && level <= 3) out.nhieu.push(line);
}
mkdirSync("data-cache", { recursive: true });
writeFileSync("data-cache/hanviet-audit-khac-bang.csv", out.khac.join("\n") + "\n");
writeFileSync("data-cache/hanviet-audit-nhieu-am-hsk123.csv", out.nhieu.join("\n") + "\n");
writeFileSync("data-cache/hanviet-audit-thieu.csv", out.thieu.join("\n") + "\n");
console.log(`${chars.size} chữ phồn HSK: KHÁC BẢNG ${out.khac.length - 1}, NHIỀU ÂM HSK1-3 ${out.nhieu.length - 1}, THIẾU ${out.thieu.length - 1}`);
console.log("\n=== KHÁC BẢNG (dán các dòng này cho Claude) ===\n" + out.khac.join("\n"));
