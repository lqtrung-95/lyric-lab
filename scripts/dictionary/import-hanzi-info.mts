// Nạp bộ thủ, cấu tạo và nguồn gốc chữ Hán từ Make Me a Hanzi (LGPL v3+) vào bảng dict_hanzi_info (cần chạy migration trước). Idempotent (upsert).
// Tải dữ liệu (kèm giấy phép COPYING cùng thư mục repo nguồn):
//   mkdir -p data-cache && curl -L -o data-cache/makemeahanzi-dictionary.txt https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt
// Chạy thử (mặc định chỉ đọc và in thống kê): npx tsx --env-file=.env.local scripts/dictionary/import-hanzi-info.mts
// Ghi thật vào DB:                           npx tsx --env-file=.env.local scripts/dictionary/import-hanzi-info.mts --apply
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
(globalThis as { WebSocket?: unknown }).WebSocket ??= WebSocket;
import { parseHanziDictionary } from "@/lib/tra-tu/parse-hanzi-dictionary";

const BATCH = 500;
const apply = process.argv.includes("--apply");
const rows = parseHanziDictionary(readFileSync("data-cache/makemeahanzi-dictionary.txt", "utf8"));
const withEtymology = rows.filter((r) => r.etymology).length;
console.log(`${rows.length} chữ (${withEtymology} có nguồn gốc, ${rows.filter((r) => r.decomposition).length} có cấu tạo)`);
if (!apply) { console.log("Chạy thử, chưa ghi DB. Thêm --apply để ghi."); process.exit(0); }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local");
const supabase = createClient(url, key, { auth: { persistSession: false } });
for (let i = 0; i < rows.length; i += BATCH) {
  const { error } = await supabase.from("dict_hanzi_info").upsert(rows.slice(i, i + BATCH), { onConflict: "hanzi" });
  if (error) throw new Error(`Ghi lô ${i} lỗi: ${error.message}`);
}
console.log("Xong.");
