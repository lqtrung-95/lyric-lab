// Sinh emoji minh họa và mẹo nhớ (nối âm Hán Việt) cho các từ của một khóa HSK bằng AI, ghi vào `course_units.content.emojis` / `.tips`.
// Chỉ xử lý từ CHƯA có emoji lẫn mẹo (chạy lại an toàn, tiếp tục dở dang). Mặc định chỉ in thử; --apply mới ghi. Kết quả do AI gợi ý, chưa rà soát (giao diện gắn nhãn "gợi ý").
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/enrich-hsk-course.mts --course hsk-2 [--unit 3] [--apply]
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import { VIDEO_TRANSLATION_MODELS } from "@/lib/video/translate-lines";
import { unitContentSchema } from "@/lib/courses/course-types";
import { buildEnrichPrompt, ENRICH_SYSTEM, parseEnrichment, type EnrichInput } from "@/lib/courses/word-enrichment";

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const slug = opt("course") ?? "hsk-1";
const onlyUnit = opt("unit") ? Number(opt("unit")) : undefined;
const apply = args.includes("--apply");
const BATCH_TERMS = 40;

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createChat(getServerEnv());
const course = await sb.from("courses").select("id").eq("slug", slug).single();
if (course.error) throw new Error(`không có khóa học ${slug}: ${course.error.message}`);
const rows = await sb.from("course_units").select("id,idx,content").eq("course_id", course.data.id).order("idx");
if (rows.error) throw rows.error;

type Row = { id: string; idx: number; content: unknown };
const units = (rows.data as Row[]).flatMap((r) => {
  const c = unitContentSchema.safeParse(r.content);
  return c.success && c.data.kind === "hsk" && (!onlyUnit || r.idx === onlyUnit) ? [{ id: r.id, idx: r.idx, content: c.data }] : [];
});
const todoOf = (u: (typeof units)[number]) => u.content.terms.filter((t) => !u.content.emojis?.[t] && !u.content.tips?.[t]);

let batch: (typeof units) = [];
let batchTerms = 0;
let done = 0;
async function flush() {
  if (batch.length === 0) return;
  const inputs: EnrichInput[] = [];
  for (const u of batch) {
    for (const term of todoOf(u)) {
      const e = await lookupTermEntry(term);
      inputs.push({ term, pinyin: e?.pinyin ?? "", sinoViet: e?.sinoViet ?? null, gloss: u.content.glosses?.[term] ?? e?.meanings?.[0] ?? "" });
    }
  }
  const sinoViet = Object.fromEntries(inputs.map((i) => [i.term, i.sinoViet]));
  const emojis: Record<string, string> = {};
  const tips: Record<string, string> = {};
  let pending = inputs.map((i) => i.term);
  for (const model of VIDEO_TRANSLATION_MODELS) {
    if (pending.length === 0) break;
    try {
      const raw = await chat({ model, system: ENRICH_SYSTEM, user: buildEnrichPrompt(inputs.filter((i) => pending.includes(i.term))), maxTokens: 6000, timeoutMs: 60_000 });
      const out = parseEnrichment(raw, pending, sinoViet);
      Object.assign(emojis, out.emojis);
      Object.assign(tips, out.tips);
      pending = pending.filter((t) => !out.answered.includes(t));
    } catch (e) { console.log(`  ${model}: ${(e as Error).message.slice(0, 80)}`); }
  }
  for (const u of batch) {
    const next = { ...u.content, emojis: { ...(u.content.emojis ?? {}) }, tips: { ...(u.content.tips ?? {}) } };
    for (const t of u.content.terms) { if (emojis[t]) next.emojis[t] = emojis[t]; if (tips[t]) next.tips[t] = tips[t]; }
    if (apply) { const { error } = await sb.from("course_units").update({ content: next }).eq("id", u.id); if (error) throw new Error(`ghi chặng ${u.idx}: ${error.message}`); }
    console.log(`${u.idx}. ` + u.content.terms.map((t) => `${next.emojis[t] ?? ""}${t}${next.tips[t] ? `: ${next.tips[t]}` : ""}`).join(" | "));
  }
  done += batch.length;
  console.log(`  [${done}/${units.length} chặng]${pending.length ? ` (model chưa trả lời: ${pending.join(" ")})` : ""}`);
  batch = [];
  batchTerms = 0;
}
for (const u of units) {
  const n = todoOf(u).length;
  if (n === 0) { done++; continue; }
  batch.push(u);
  batchTerms += n;
  if (batchTerms >= BATCH_TERMS) await flush();
}
await flush();
process.exit(0);
