// Phân loại từ của một cấp HSK (2–5) vào bộ chủ đề chung (`lib/courses/hsk-theme-taxonomy.ts`) bằng AI, ghi vào `lib/courses/hsk-themed-words.json`.
// Chỉ phân loại từ CHƯA có trong file (chạy lại an toàn, tiếp tục dở dang). Người dùng duyệt file JSON rồi mới chạy generate-hsk-course.mts.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/theme-hsk-words.mts --level 2
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { lookupWords, pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { VIDEO_TRANSLATION_MODELS } from "@/lib/video/translate-lines";
import { buildThemePrompt, parseThemeAssignment, type ThemeAssignment } from "@/lib/courses/hsk-theme-taxonomy";

const FILE = "lib/courses/hsk-themed-words.json";
const BATCH = 80;
const args = process.argv.slice(2);
const level = Number(args[args.indexOf("--level") + 1]);
if (!(level >= 2 && level <= 6)) throw new Error("--level 2..6");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createChat(getServerEnv());
const byWord = new Map<string, number>();
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("dict_words").select("simplified,frequency").eq("hsk_level", level).order("id").range(from, from + 999);
  if (error) throw error;
  if (!data?.length) break;
  for (const w of data as { simplified: string; frequency: number | null }[]) byWord.set(w.simplified, Math.max(w.frequency ?? 0, byWord.get(w.simplified) ?? 0));
}
const words = [...byWord].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([w]) => w);

const all: Record<string, ThemeAssignment> = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {};
const mine: ThemeAssignment = all[String(level)] ?? {};
const done = new Set(Object.values(mine).flat());
let todo = words.filter((w) => !done.has(w));
console.log(`HSK ${level}: ${words.length} từ, đã phân loại ${done.size}, còn ${todo.length}`);

for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  const entries = await lookupWords(sb as never, batch);
  const items = batch.map((term) => { const e = pickPrimaryEntry(entries.get(term) ?? []); return { term, pinyin: e?.pinyin ?? "", meaning: (e?.meanings ?? []).slice(0, 3).join("; ") }; });
  let pending = batch;
  for (const model of VIDEO_TRANSLATION_MODELS) {
    if (pending.length === 0) break;
    try {
      const raw = await chat({ model, system: "Bạn phân loại từ vựng tiếng Trung theo chủ đề cho giáo trình người Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ.", user: buildThemePrompt(items.filter((x) => pending.includes(x.term))), maxTokens: 4000, timeoutMs: 40_000 });
      const out = parseThemeAssignment(raw, pending);
      for (const [term, theme] of Object.entries(out.assigned)) (mine[theme] ??= []).push(term);
      pending = out.missing;
    } catch (e) { console.log(`  ${model}: ${(e as Error).message.slice(0, 80)}`); }
  }
  console.log(`  ${Math.min(i + BATCH, todo.length)}/${todo.length}${pending.length ? ` (chưa phân loại: ${pending.join(" ")})` : ""}`);
  all[String(level)] = mine;
  writeFileSync(FILE, JSON.stringify(all, null, 1) + "\n"); // ghi sau mỗi lô để dở dang không mất
}
const rank = new Map(words.map((w, i) => [w, i]));
for (const list of Object.values(mine)) list.sort((a, b) => rank.get(a)! - rank.get(b)!);
all[String(level)] = mine;
writeFileSync(FILE, JSON.stringify(all, null, 1) + "\n");
for (const [theme, list] of Object.entries(mine)) console.log(`${theme} [${list.length}]: ${list.slice(0, 12).join(" ")}…`);
process.exit(0);
