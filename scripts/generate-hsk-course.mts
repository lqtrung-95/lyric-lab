// Sinh các chặng của lộ trình HSK cho một cấp từ từ điển + chủ đề soạn tay (`lib/courses/hsk1-themes.ts`), in ra để duyệt, rồi (--apply) ghi vào `courses` / `course_units`.
// Cần migration `20261019000001_courses_and_term_sentences.sql`. Ghi theo (khóa học, số thứ tự chặng) nên mã chặng ổn định giữa các lần chạy: tiến độ người học không mất khi sinh lại;
// chặng thừa ở cuối (nếu số chặng giảm) bị xóa.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/generate-hsk-course.mts --level 1 [--max 18] [--review-every 5] [--no-final] [--status listed|draft] [--apply]
// --max: số từ tối đa mỗi chặng (mặc định 18; HSK 4–5 dùng 12 vì từ trừu tượng khó nhớ hơn). --review-every N: chèn chặng "Ôn tập" sau mỗi N chặng học (0 = không chèn, mặc định 0
// để HSK 1 giữ nguyên số thứ tự chặng đang có tiến độ); luôn thêm "Kiểm tra cuối cấp" ở cuối trừ khi --no-final. Nghĩa tiếng Việt đã có được GIỮ lại theo từng từ khi ghi đè.
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { readFileSync } from "node:fs";
import { generateHskUnits, withReviewUnits } from "@/lib/courses/generate-hsk-units";
import { themesFromAssignment, type ThemeAssignment } from "@/lib/courses/hsk-theme-taxonomy";
import { HSK1_THEMES } from "@/lib/courses/hsk1-themes";

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const level = Number(opt("level") ?? 1);
const status = opt("status") === "draft" ? "draft" : "listed";
const apply = args.includes("--apply");
const max = Number(opt("max") ?? 18);
const reviewEvery = Number(opt("review-every") ?? 0);
const withFinal = !args.includes("--no-final");
// HSK 1: chủ đề soạn tay (`hsk1-themes.ts`). HSK 2–5: chủ đề do AI phân loại rồi người duyệt (`scripts/theme-hsk-words.mts` → `hsk-themed-words.json`).
if (level < 1 || level > 6) throw new Error("--level 1..6");
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
const learning = generateHskUnits(words, THEMES, `HSK ${level}`, max);
const units = withReviewUnits(learning, `HSK ${level}`, reviewEvery, withFinal);

const themed = new Set(THEMES.flatMap((t) => t.words));
const typos = [...themed].filter((t) => !byWord.has(t));
console.log(`HSK ${level}: ${words.length} từ → ${learning.length} chặng học + ${units.length - learning.length} chặng ôn/kiểm tra (${learning.map((u) => u.terms.length).reduce((a, b) => a + b, 0)} từ được xếp)`);
units.forEach((u, i) => console.log(`${String(i + 1).padStart(2)}. ${u.title}${u.kind === "hsk" ? ` [${u.terms.length}]: ${u.terms.join(" ")}` : " (ôn)"}`));
if (typos.length) console.log(`\nTừ trong chủ đề nhưng KHÔNG thuộc HSK ${level} (bị bỏ qua): ${typos.join(" ")}`);
if (!apply) { console.log("\nDry-run: duyệt danh sách trên rồi thêm --apply để ghi."); process.exit(0); }

const course = await sb.from("courses").upsert({ slug: `hsk-${level}`, kind: "hsk", title: `HSK ${level}`, level, sort_order: level, status }, { onConflict: "slug" }).select("id").single();
if (course.error) throw new Error(`ghi khóa học: ${course.error.message} (đã chạy migration chưa?)`);
const courseId = course.data.id as string;
// Giữ nghĩa tiếng Việt đã có (kể cả bản sửa tay) theo từng từ: chia lại chặng không làm mất công sinh/rà nghĩa.
const existing = await sb.from("course_units").select("content").eq("course_id", courseId);
const keptGlosses = new Map<string, string>();
for (const r of (existing.data ?? []) as { content: { kind?: string; glosses?: Record<string, string> } }[]) if (r.content.kind === "hsk") for (const [t, g] of Object.entries(r.content.glosses ?? {})) keptGlosses.set(t, g);
const rows = units.map((u, i) => {
  const base = { course_id: courseId, idx: i + 1, title: u.title, summary: u.summary, status };
  if (u.kind === "review") return { ...base, content: { kind: "review", variant: u.variant, topic: u.topic, ...(u.from ? { from: u.from, to: u.to } : {}) } };
  const glosses = Object.fromEntries(u.terms.filter((t) => keptGlosses.has(t)).map((t) => [t, keptGlosses.get(t)!]));
  return { ...base, content: { kind: "hsk", terms: u.terms, topic: u.topic, ...(Object.keys(glosses).length ? { glosses } : {}) } };
});
const up = await sb.from("course_units").upsert(rows, { onConflict: "course_id,idx" });
if (up.error) throw new Error(`ghi chặng: ${up.error.message}`);
const del = await sb.from("course_units").delete().eq("course_id", courseId).gt("idx", units.length);
if (del.error) throw new Error(`xóa chặng thừa: ${del.error.message}`);
console.log(`Đã ghi khóa học hsk-${level} với ${units.length} chặng (${status}); giữ lại ${keptGlosses.size} nghĩa tiếng Việt đã có.`);
process.exit(0);
