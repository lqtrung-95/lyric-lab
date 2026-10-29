// Sinh nghĩa tiếng Việt ngắn cho TOÀN BỘ từ HSK 1–6 (trang Từ vựng HSK) bằng API Deploy, ghi vào bảng `dict_word_vi`.
// Mặc định chỉ in thử (dry-run, không ghi DB, mặc định 40 từ); --apply mới ghi. Từ đã có nghĩa trong bảng thì bỏ qua (--force để sinh lại, trừ bản đã `reviewed`).
// Biến môi trường (.env.local): DEPLOY_API_KEY (bắt buộc), DEPLOY_MODEL (tuỳ chọn), NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/gloss-hsk-vocab.mts --level 1 [--limit 40] [--batch 40] [--concurrency 3] [--force] [--apply]
//   Dùng --level all để chạy cả 6 cấp (kèm --limit 100000 --apply khi đã duyệt mẫu).
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createDeployChat, DEPLOY_DEFAULT_MODEL } from "@/lib/analysis/deploy-chat";
import { HSK1_GLOSS_OVERRIDES } from "@/lib/courses/hsk1-gloss-overrides";
import { buildGlossPrompt, GLOSS_SYSTEM, parseGlosses, type GlossInput } from "@/lib/courses/vietnamese-glosses";
import { buildHskRows, HSK_LEVELS } from "@/lib/tools/build-hsk-rows";
import { loadHskDictRows } from "@/lib/tools/load-hsk-dict-rows";

const GLOSS_PROMPT_VERSION = "hsk-vi-1";
const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const apply = args.includes("--apply");
const force = args.includes("--force");
const levelArg = opt("level") ?? "1";
const levels = levelArg === "all" ? [...HSK_LEVELS] : [Number(levelArg)];
const limit = Number(opt("limit") ?? 40);
const batchSize = Number(opt("batch") ?? 40);
const concurrency = Number(opt("concurrency") ?? 3);
const model = process.env.DEPLOY_MODEL ?? DEPLOY_DEFAULT_MODEL;
const apiKey = process.env.DEPLOY_API_KEY;
if (!apiKey) throw new Error("Thiếu DEPLOY_API_KEY trong .env.local");
if (levels.some((l) => !(HSK_LEVELS as readonly number[]).includes(l))) throw new Error("--level 1..6 hoặc all");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createDeployChat(apiKey);

async function loadLevel(level: number): Promise<GlossInput[]> {
  const rows = await loadHskDictRows(sb, level);
  return buildHskRows(rows, new Map()).map((r) => ({ term: r.word, pinyin: r.pinyin, meanings: r.meanings }));
}

async function existing(): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from("dict_word_vi").select("term,reviewed").range(from, from + 999);
    if (error) throw new Error(`đọc dict_word_vi (đã chạy migration 20261029000003 chưa?): ${error.message}`);
    for (const r of data ?? []) map.set(r.term as string, r.reviewed === true);
    if ((data ?? []).length < 1000) break;
  }
  return map;
}

/** Sinh nghĩa cho một mẻ; từ thiếu hoặc không hợp lệ thử lại một lần theo mẻ nhỏ hơn. */
async function glossBatch(items: GlossInput[]): Promise<{ glosses: Record<string, string>; missing: string[] }> {
  const glosses: Record<string, string> = {};
  let pending = items;
  for (let round = 0; round < 2 && pending.length > 0; round++) {
    try {
      const raw = await chat({ model, system: GLOSS_SYSTEM, user: buildGlossPrompt(pending), maxTokens: 4000 });
      const out = parseGlosses(raw, pending.map((i) => i.term));
      Object.assign(glosses, out.glosses);
      pending = pending.filter((i) => out.missing.includes(i.term));
    } catch (e) { console.log(`  lỗi mẻ ${pending.length} từ: ${(e as Error).message.slice(0, 120)}`); }
  }
  return { glosses, missing: pending.map((i) => i.term) };
}

const have = await existing();
const todo: GlossInput[] = [];
for (const level of levels) {
  for (const w of await loadLevel(level)) {
    const reviewed = have.get(w.term);
    if (reviewed === true) continue; // bản đã duyệt không bao giờ bị ghi đè
    if (have.has(w.term) && !force) continue;
    todo.push(w);
  }
}
const picked = todo.slice(0, limit);
console.log(`Model ${model}. Cần sinh ${todo.length} từ, lần này ${picked.length}${apply ? " (sẽ GHI vào DB)" : " (dry-run)"}.`);

const batches: GlossInput[][] = [];
for (let i = 0; i < picked.length; i += batchSize) batches.push(picked.slice(i, i + batchSize));
const results: Record<string, string> = {};
const missing: string[] = [];
let next = 0;
await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
  while (next < batches.length) {
    const batch = batches[next++];
    const out = await glossBatch(batch);
    Object.assign(results, out.glosses);
    missing.push(...out.missing);
    if (apply && Object.keys(out.glosses).length > 0) {
      const rows = Object.entries(out.glosses).map(([term, meaning]) => ({ term, meaning, model, prompt_version: GLOSS_PROMPT_VERSION, reviewed: false }));
      const { error } = await sb.from("dict_word_vi").upsert(rows, { onConflict: "term" });
      if (error) throw new Error(`ghi dict_word_vi: ${error.message}`);
    }
    console.log(`  xong mẻ ${next}/${batches.length}: ${Object.keys(out.glosses).length}/${batch.length} từ`);
  }
}));

// Bảng sửa tay HSK 1 luôn thắng AI (xem hsk1-gloss-overrides.ts), và được ghi đánh dấu đã duyệt.
const overrides = Object.entries(HSK1_GLOSS_OVERRIDES).filter(([t]) => picked.some((p) => p.term === t) || (!have.has(t) && levels.includes(1)));
if (apply && overrides.length > 0) {
  const { error } = await sb.from("dict_word_vi").upsert(overrides.map(([term, meaning]) => ({ term, meaning, model: "manual", prompt_version: GLOSS_PROMPT_VERSION, reviewed: true })), { onConflict: "term" });
  if (error) throw new Error(`ghi bản sửa tay: ${error.message}`);
}

for (const p of picked.slice(0, 40)) console.log(`${p.term}\t${p.pinyin}\t${p.meanings.slice(0, 2).join("; ")}  =>  ${HSK1_GLOSS_OVERRIDES[p.term] ?? results[p.term] ?? "?"}`);
console.log(`\n${Object.keys(results).length}/${picked.length} từ có nghĩa${missing.length ? `, THIẾU ${missing.length}: ${missing.slice(0, 30).join(" ")}` : ""}.${apply ? "" : " Dry-run: thêm --apply để ghi."}`);
process.exit(0);
