// Làm sạch nghĩa đã lưu trong user_cards: bỏ cụm dẫn nhập kiểu "Ở câu này mang nghĩa là …" và phần giải thích dài,
// chỉ giữ nghĩa đơn thuần (xem lib/lookup/clean-saved-meaning.ts). Không gọi LLM. Mặc định chỉ xem (dry-run):
//   NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/clean-saved-meanings.mts
// Thêm --apply để ghi DB. Chạy lại được (nghĩa đã sạch thì không đổi).
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { cleanSavedMeaning } from "@/lib/lookup/clean-saved-meaning";

const apply = process.argv.includes("--apply");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });

const PAGE = 1000;
let changed = 0, scanned = 0, failed = 0;
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb.from("user_cards").select("user_id,item_key,term,meaning").order("user_id").order("item_key").range(from, from + PAGE - 1);
  if (error) throw new Error(error.message);
  if (!data?.length) break;
  scanned += data.length;
  for (const row of data) {
    const next = cleanSavedMeaning(row.meaning, row.term);
    if (next === row.meaning) continue;
    changed++;
    if (changed <= 15) console.log(`${row.term}: "${row.meaning.slice(0, 70)}" → "${next}"`);
    if (!apply) continue;
    const { error: e } = await sb.from("user_cards").update({ meaning: next }).eq("user_id", row.user_id).eq("item_key", row.item_key);
    if (e) { failed++; console.log(`  → LỖI ${row.item_key}: ${e.message}`); }
  }
  if (data.length < PAGE) break;
}
console.log(`\nTổng: ${changed}/${scanned} thẻ đổi nghĩa${apply ? `, ${failed} lỗi` : " (dry-run, thêm --apply để ghi)"}`);
process.exit(0);
