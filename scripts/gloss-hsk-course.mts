// Sinh nghĩa tiếng Việt ngắn cho các từ của lộ trình HSK (từ điển chỉ có nghĩa tiếng Anh) rồi ghi vào `course_units.content.glosses`.
// Mặc định chỉ in thử (dry-run) để người dùng duyệt; --apply mới ghi. Chỉ sinh cho từ CHƯA có nghĩa (--force để sinh lại toàn bộ). Sau khi duyệt có thể sửa tay trong DB hoặc chạy lại với --force.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/gloss-hsk-course.mts --course hsk-1 [--unit 3] [--force] [--apply]
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { VIDEO_TRANSLATION_MODELS } from "@/lib/video/translate-lines";
import { unitContentSchema } from "@/lib/courses/course-types";
import { HSK1_GLOSS_OVERRIDES } from "@/lib/courses/hsk1-gloss-overrides";
import { buildGlossPrompt, GLOSS_SYSTEM, parseGlosses } from "@/lib/courses/vietnamese-glosses";

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const slug = opt("course") ?? "hsk-1";
const onlyUnit = opt("unit") ? Number(opt("unit")) : undefined;
const force = args.includes("--force");
const apply = args.includes("--apply");
// --overrides-only: không gọi AI, chỉ áp bảng sửa tay `hsk1-gloss-overrides.ts` lên các nghĩa đã có.
const overridesOnly = args.includes("--overrides-only");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createChat(getServerEnv());
const course = await sb.from("courses").select("id").eq("slug", slug).single();
if (course.error) throw new Error(`không có khóa học ${slug}: ${course.error.message}`);
const units = await sb.from("course_units").select("id,idx,title,content").eq("course_id", course.data.id).order("idx");
if (units.error) throw units.error;

let total = 0;
for (const unit of units.data as { id: string; idx: number; title: string; content: unknown }[]) {
  if (onlyUnit && unit.idx !== onlyUnit) continue;
  const content = unitContentSchema.parse(unit.content);
  const glosses = { ...(content.glosses ?? {}) };
  const todo = overridesOnly ? [] : content.terms.filter((t) => force || !glosses[t]);
  if (todo.length === 0 && !overridesOnly) continue;
  const entries = await lookupWords(sb as never, todo);
  const items = todo.map((term) => { const e = pickPrimaryEntry(entries.get(term) ?? []); return { term, pinyin: e?.pinyin ?? "", meanings: e?.meanings ?? [] }; });

  let pending = todo;
  for (const model of VIDEO_TRANSLATION_MODELS) {
    if (pending.length === 0) break;
    try {
      const raw = await chat({ model, system: GLOSS_SYSTEM, user: buildGlossPrompt(items.filter((i) => pending.includes(i.term))), maxTokens: 3000, timeoutMs: 40_000 });
      const out = parseGlosses(raw, pending);
      Object.assign(glosses, out.glosses);
      pending = out.missing;
    } catch (e) { console.log(`  ${model}: ${(e as Error).message.slice(0, 80)}`); }
  }
  // Bảng sửa tay luôn thắng kết quả của AI.
  for (const t of content.terms) if (HSK1_GLOSS_OVERRIDES[t]) glosses[t] = HSK1_GLOSS_OVERRIDES[t];
  if (overridesOnly && !content.terms.some((t) => HSK1_GLOSS_OVERRIDES[t])) continue;
  console.log(`${unit.idx}. ${unit.title}${pending.length ? `  (THIẾU: ${pending.join(" ")})` : ""}`);
  console.log("   " + content.terms.map((t) => `${t}=${glosses[t] ?? "?"}`).join(" | "));
  total += todo.length - pending.length;
  if (apply) {
    const { error } = await sb.from("course_units").update({ content: { ...content, glosses } }).eq("id", unit.id);
    if (error) throw new Error(`ghi chặng ${unit.idx}: ${error.message}`);
  }
}
console.log(apply ? `\nĐã ghi ${total} nghĩa.` : `\nDry-run: ${total} nghĩa sinh ra, thêm --apply để ghi.`);
process.exit(0);
