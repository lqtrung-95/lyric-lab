// Rà âm Hán Việt trong `dict_hanzi_sino_viet` cho mọi chữ thuộc từ HSK: xuất data-cache/hanviet-audit.csv để người rà tay.
// Chạy: npx tsx scripts/dictionary/audit-hanviet.mts   (cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local)
// Cột: hanzi, hsk_thap_nhat, am_dau_trong_db, tat_ca_am, am_chuan_trong_bang, ly_do.
// Lý do: THIEU (không có âm), KHAC_BANG (âm đầu khác bảng chuẩn `sino-viet-overrides.ts`), NHIEU_AM (≥2 âm, âm đầu chưa có trong bảng: cần người xem có đúng âm Hán Việt thông dụng nhất không).
// Gửi lại các dòng sai (chữ → âm đúng) để thêm vào bảng chuẩn.
import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { overrideSinoViet } from "@/lib/dictionary/sino-viet-overrides";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local");
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

const words = await readAll<{ simplified: string; traditional: string; hsk_level: number }>("dict_words", "simplified,traditional,hsk_level", "simplified", (q) => q.not("hsk_level", "is", null));
const level = new Map<string, number>();
for (const w of words) for (const c of new Set([...w.traditional, ...w.simplified])) if (/\p{Script=Han}/u.test(c)) level.set(c, Math.min(level.get(c) ?? 9, w.hsk_level));
const rows = await readAll<{ hanzi: string; readings: string[] }>("dict_hanzi_sino_viet", "hanzi,readings", "hanzi");
const byChar = new Map(rows.map((r) => [r.hanzi, r.readings]));

const lines = ["hanzi,hsk,am_dau_trong_db,tat_ca_am,am_chuan_trong_bang,ly_do"];
let missing = 0, differ = 0, multi = 0;
for (const [c, lv] of [...level].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))) {
  const r = byChar.get(c) ?? [];
  const std = overrideSinoViet(c);
  const reason = r.length === 0 && !std ? "THIEU" : std && r[0] !== std ? "KHAC_BANG" : !std && r.length >= 2 ? "NHIEU_AM" : "";
  if (!reason) continue;
  if (reason === "THIEU") missing++; else if (reason === "KHAC_BANG") differ++; else multi++;
  lines.push([c, lv, r[0] ?? "", r.join("/"), std ?? "", reason].join(","));
}
mkdirSync("data-cache", { recursive: true });
writeFileSync("data-cache/hanviet-audit.csv", lines.join("\n") + "\n");
console.log(`${level.size} chữ HSK; THIEU ${missing}, KHAC_BANG ${differ}, NHIEU_AM ${multi} → data-cache/hanviet-audit.csv`);
