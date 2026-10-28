// Tạo bảng pinyin cho mọi câu nói của chế độ phá án cùng bạn (câu ghép từ mẫu, câu nói nhanh, nơi chốn, đồ vật), lấy từ TỪ ĐIỂN (quy tắc 2: không để AI sinh pinyin).
// Ghi vào lib/explore/coop/coop-pinyin.generated.json; test `coop-pinyin.test.ts` báo lỗi nếu bảng thiếu hoặc cũ.
// Chạy: NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/generate-coop-pinyin.mts
import { writeFileSync } from "node:fs";
import { coopPinyinKeys } from "../lib/explore/coop/coop-pinyin-keys";
import { annotatePinyin } from "../lib/explore/story/annotate-lines";

const keys = coopPinyinKeys();
const BATCH = 150;
const out: Record<string, string> = {};
for (let i = 0; i < keys.length; i += BATCH) Object.assign(out, await annotatePinyin(keys.slice(i, i + BATCH)));
const missing = keys.filter((k) => !out[k]);
if (missing.length) { console.error("Thiếu pinyin:", missing.slice(0, 10).join(" ")); process.exit(1); }
const sorted = Object.fromEntries(Object.entries(out).filter(([k]) => keys.includes(k)).sort(([a], [b]) => a.localeCompare(b, "zh")));
writeFileSync(new URL("../lib/explore/coop/coop-pinyin.generated.json", import.meta.url), JSON.stringify(sorted, null, 1) + "\n");
console.log(`Đã ghi ${Object.keys(sorted).length} mục pinyin.`);
