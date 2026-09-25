// Nạp từ điển vào Supabase từ file trong data-cache/ (tải bằng lệnh trong plan M1 phase 3). Idempotent (upsert).
// Chạy: npx tsx --env-file=.env.local scripts/dictionary/import-dictionary.mts [--dry-run]
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { buildDictWordRows } from "@/lib/dictionary/build-dictionary-rows";
import { parseCedict } from "@/lib/dictionary/parse-cedict";
import { parseHskVocabulary } from "@/lib/dictionary/parse-hsk-vocabulary";
import { parseUnihanVietnamese } from "@/lib/dictionary/parse-unihan-vietnamese";

const DIR = "data-cache";
const BATCH = 1000;
const dryRun = process.argv.includes("--dry-run");

const cedict = parseCedict(readFileSync(`${DIR}/cedict_ts.u8`, "utf8"));
const hsk = parseHskVocabulary(JSON.parse(readFileSync(`${DIR}/hsk-complete.json`, "utf8")));
const words = buildDictWordRows(cedict, hsk);
// Âm Hán Việt: ưu tiên Wiktionary (có nhãn Hán Việt rõ ràng); Unihan chỉ dùng khi chữ không có ở Wiktionary
// vì Unihan lẫn âm Nôm (少年 → "thiểu nên"). Chạy fetch-hanviet-from-wiktionary.mts trước để có file này.
const unihan = parseUnihanVietnamese(readFileSync(`${DIR}/Unihan_Readings.txt`, "utf8"));
const wikiPath = `${DIR}/hanviet-wiktionary.json`;
const wiki: Record<string, string[]> = existsSync(wikiPath) ? JSON.parse(readFileSync(wikiPath, "utf8")) : {};
const sinoViet = [...new Set([...unihan.keys(), ...Object.keys(wiki)])]
  .map((hanzi) => ({ hanzi, readings: wiki[hanzi]?.length ? wiki[hanzi] : (unihan.get(hanzi) ?? []) }))
  .filter((r) => r.readings.length > 0);

const byLevel: Record<number, number> = {};
words.forEach((w) => w.hsk_level && (byLevel[w.hsk_level] = (byLevel[w.hsk_level] ?? 0) + 1));
console.log(`CEDICT ${cedict.length} dòng, HSK 3.0 ${hsk.length} từ → ${words.length} mục; Hán Việt ${sinoViet.length} chữ (${Object.values(wiki).filter((r) => r.length).length} từ Wiktionary)`);
console.log("Mục có cấp HSK theo cấp:", byLevel);
if (dryRun) process.exit(0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local");
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function upsertAll(table: string, rows: object[], onConflict: string) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from(table).upsert(rows.slice(i, i + BATCH), { onConflict });
    if (error) throw new Error(`${table}: ${error.message} (đã chạy migration supabase/migrations/*dictionary_tables.sql chưa?)`);
    if ((i / BATCH) % 20 === 0) console.log(`${table}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
}

await upsertAll("dict_hanzi_sino_viet", sinoViet, "hanzi");
await upsertAll("dict_words", words, "simplified,traditional,pinyin");
console.log("Xong.");
