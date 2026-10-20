// Sinh các chặng của lộ trình HSK cho một cấp từ từ điển + chủ đề soạn tay (`lib/courses/hsk1-themes.ts`), in ra để duyệt, rồi (--apply) ghi vào `courses` / `course_units`.
// Cần migration `20261019000001_courses_and_term_sentences.sql`. Ghi theo (khóa học, số thứ tự chặng) nên mã chặng ổn định giữa các lần chạy: tiến độ người học không mất khi sinh lại;
// chặng thừa ở cuối (nếu số chặng giảm) bị xóa.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/generate-hsk-course.mts --level 1 [--status listed|draft] [--apply]
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { generateHskUnits } from "@/lib/courses/generate-hsk-units";
import { readFileSync } from "node:fs";
import { themesFromAssignment, type ThemeAssignment } from "@/lib/courses/hsk-theme-taxonomy";
import { HSK1_THEMES } from "@/lib/courses/hsk1-themes";

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const level = Number(opt("level") ?? 1);
const status = opt("status") === "draft" ? "draft" : "listed";
const apply = args.includes("--apply");
// HSK 1: chủ đề soạn tay (`hsk1-themes.ts`). HSK 2–5: chủ đề do AI phân loại rồi người duyệt (`scripts/theme-hsk-words.mts` → `hsk-themed-words.json`).
if (level < 1 || level > 5) throw new Error("--level 1..5");
const THEMES = level === 1 ? HSK1_THEMES : themesFromAssignment((JSON.parse(readFileSync("lib/courses/hsk-themed-words.json", "utf8")) as Record<string, ThemeAssignment>)[String(level)] ?? {});
if (THEMES.length === 0) throw new Error(`Chưa có chủ đề cho HSK ${level}: chạy scripts/theme-hsk-words.mts --level ${level} trước`);

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const byWord = new Map<string, number>();
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("dict_words").select("simplified,frequency").eq("hsk_level", level).order("id").range(from, from + 999);
  if (error) throw error;
  if (!data?.length) break;
  for (const w of data as { simplified: string; frequency: number | null }[]) byWord.set(w.simplified, Math.max(w.frequency ?? 0, byWord.get(w.simplified) ?? 0));
}
const words = [...byWord].map(([simplified, frequency]) => ({ simplified, frequency }));
const units = generateHskUnits(words, THEMES, `HSK ${level}`);

const themed = new Set(THEMES.flatMap((t) => t.words));
const typos = [...themed].filter((t) => !byWord.has(t));
console.log(`HSK ${level}: ${words.length} từ → ${units.length} chặng (${units.map((u) => u.terms.length).reduce((a, b) => a + b, 0)} từ được xếp)`);
units.forEach((u, i) => console.log(`${String(i + 1).padStart(2)}. ${u.title} [${u.terms.length}]: ${u.terms.join(" ")}`));
if (typos.length) console.log(`\nTừ trong chủ đề nhưng KHÔNG thuộc HSK ${level} (bị bỏ qua): ${typos.join(" ")}`);
if (!apply) { console.log("\nDry-run: duyệt danh sách trên rồi thêm --apply để ghi."); process.exit(0); }

const course = await sb.from("courses").upsert({ slug: `hsk-${level}`, kind: "hsk", title: `HSK ${level}`, level, sort_order: level, status }, { onConflict: "slug" }).select("id").single();
if (course.error) throw new Error(`ghi khóa học: ${course.error.message} (đã chạy migration chưa?)`);
const courseId = course.data.id as string;
const rows = units.map((u, i) => ({ course_id: courseId, idx: i + 1, title: u.title, summary: u.summary, content: { kind: "hsk", terms: u.terms, topic: u.topic }, status }));
const up = await sb.from("course_units").upsert(rows, { onConflict: "course_id,idx" });
if (up.error) throw new Error(`ghi chặng: ${up.error.message}`);
const del = await sb.from("course_units").delete().eq("course_id", courseId).gt("idx", units.length);
if (del.error) throw new Error(`xóa chặng thừa: ${del.error.message}`);
console.log(`Đã ghi khóa học hsk-${level} với ${units.length} chặng (${status}).`);
process.exit(0);
