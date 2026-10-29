// Sinh nghĩa tiếng Việt ngắn cho TOÀN BỘ từ HSK 1–6 (trang Từ vựng HSK) bằng API Deploy, ghi vào bảng `dict_word_vi`. Với chữ nhiều âm, AI chọn cách đọc thông dụng nhất TRONG các mục từ điển (pinyin vẫn của từ điển, lưu ở cột `reading`).
// Mặc định chỉ in thử (dry-run, không ghi DB, mặc định 40 từ); --apply mới ghi. Từ đã có nghĩa trong bảng thì bỏ qua (--force để sinh lại, trừ bản đã `reviewed`).
// Biến môi trường (.env.local): DEPLOY_API_KEY (bắt buộc), DEPLOY_MODEL (tuỳ chọn), NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/gloss-hsk-vocab.mts --level 1 [--limit 40] [--batch 40] [--concurrency 3] [--force] [--apply]
//   Dùng --level all để chạy cả 6 cấp (kèm --limit 100000 --apply khi đã duyệt mẫu).
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createDeployChat, DEPLOY_DEFAULT_MODEL } from "@/lib/analysis/deploy-chat";
import { HSK1_GLOSS_OVERRIDES } from "@/lib/courses/hsk1-gloss-overrides";
import { buildHskRows, HSK_LEVELS } from "@/lib/tools/build-hsk-rows";
import { buildHskGlossPrompt, HSK_GLOSS_SYSTEM, parseHskGlosses, readingCandidates, type HskGloss, type HskGlossInput } from "@/lib/tools/hsk-gloss";
import { loadHskDictRows } from "@/lib/tools/load-hsk-dict-rows";

const GLOSS_PROMPT_VERSION = "hsk-vi-2";
const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const apply = args.includes("--apply");
const force = args.includes("--force");
const levelArg = opt("level") ?? "1";
const levels = levelArg === "all" ? [...HSK_LEVELS] : [Number(levelArg)];
const limit = Number(opt("limit") ?? 40);
const batchSize = Number(opt("batch") ?? 30);
const concurrency = Number(opt("concurrency") ?? 3);
const model = process.env.DEPLOY_MODEL ?? DEPLOY_DEFAULT_MODEL;
const apiKey = process.env.DEPLOY_API_KEY;
if (!apiKey) throw new Error("Thiếu DEPLOY_API_KEY trong .env.local");
if (levels.some((l) => !(HSK_LEVELS as readonly number[]).includes(l))) throw new Error("--level 1..6 hoặc all");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createDeployChat(apiKey);

/** Các từ của một cấp theo thứ tự thường gặp, mỗi từ kèm các cách đọc ứng viên từ MỌI mục từ điển. */
async function loadLevel(level: number): Promise<HskGlossInput[]> {
  const rows = await loadHskDictRows(sb, level);
  const groups = new Map<string, typeof rows>();
  for (const r of rows) groups.set(r.simplified, [...(groups.get(r.simplified) ?? []), r]);
  return buildHskRows(rows, new Map()).map((r) => ({ term: r.word, candidates: readingCandidates(groups.get(r.word) ?? []) }));
}

/** Từ đã có trong bảng: `reviewed` (không ghi đè) và `hasReading` (bản cũ chưa chọn cách đọc cần sinh lại). */
async function existing(): Promise<Map<string, { reviewed: boolean; hasReading: boolean }>> {
  const map = new Map<string, { reviewed: boolean; hasReading: boolean }>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from("dict_word_vi").select("term,reviewed,reading").range(from, from + 999);
    if (error) throw new Error(`đọc dict_word_vi (đã chạy migration 20261029000003 bản mới chưa?): ${error.message}`);
    for (const r of data ?? []) map.set(r.term as string, { reviewed: r.reviewed === true, hasReading: r.reading != null });
    if ((data ?? []).length < 1000) break;
  }
  return map;
}

/** Sinh nghĩa và chọn cách đọc cho một mẻ; từ thiếu hoặc không hợp lệ thử lại một lần. */
async function glossBatch(items: HskGlossInput[]): Promise<{ glosses: Record<string, HskGloss>; missing: string[] }> {
  const glosses: Record<string, HskGloss> = {};
  let pending = items;
  for (let round = 0; round < 2 && pending.length > 0; round++) {
    try {
      const raw = await chat({ model, system: HSK_GLOSS_SYSTEM, user: buildHskGlossPrompt(pending), maxTokens: 4000 });
      const out = parseHskGlosses(raw, pending);
      Object.assign(glosses, out.glosses);
      pending = pending.filter((i) => out.missing.includes(i.term));
    } catch (e) { console.log(`  lỗi mẻ ${pending.length} từ: ${(e as Error).message.slice(0, 120)}`); }
  }
  return { glosses, missing: pending.map((i) => i.term) };
}

const have = await existing();
const todo: HskGlossInput[] = [];
for (const level of levels) {
  for (const w of await loadLevel(level)) {
    const cur = have.get(w.term);
    if (cur?.reviewed) continue; // bản đã duyệt không bao giờ bị ghi đè
    if (cur && cur.hasReading && !force) continue;
    todo.push(w);
  }
}
const picked = todo.slice(0, limit);
console.log(`Model ${model}. Cần sinh ${todo.length} từ, lần này ${picked.length}${apply ? " (sẽ GHI vào DB)" : " (dry-run)"}.`);

const batches: HskGlossInput[][] = [];
for (let i = 0; i < picked.length; i += batchSize) batches.push(picked.slice(i, i + batchSize));
const results: Record<string, HskGloss> = {};
const missing: string[] = [];
let next = 0;
await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
  while (next < batches.length) {
    const batch = batches[next++];
    const out = await glossBatch(batch);
    Object.assign(results, out.glosses);
    missing.push(...out.missing);
    if (apply && Object.keys(out.glosses).length > 0) {
      const rows = Object.entries(out.glosses).map(([term, g]) => ({ term, meaning: HSK1_GLOSS_OVERRIDES[term] ?? g.gloss, reading: g.reading, model, prompt_version: GLOSS_PROMPT_VERSION, reviewed: term in HSK1_GLOSS_OVERRIDES }));
      const { error } = await sb.from("dict_word_vi").upsert(rows, { onConflict: "term" });
      if (error) throw new Error(`ghi dict_word_vi: ${error.message}`);
    }
    console.log(`  xong mẻ ${next}/${batches.length}: ${Object.keys(out.glosses).length}/${batch.length} từ`);
  }
}));

for (const p of picked.slice(0, 40)) {
  const g = results[p.term];
  console.log(`${p.term}\t[${p.candidates.map((c) => c.pinyin).join(" / ")}]  =>  ${g ? `${g.reading}: ${HSK1_GLOSS_OVERRIDES[p.term] ?? g.gloss}` : "?"}`);
}
console.log(`\n${Object.keys(results).length}/${picked.length} từ có nghĩa${missing.length ? `, THIẾU ${missing.length}: ${missing.slice(0, 30).join(" ")}` : ""}.${apply ? "" : " Dry-run: thêm --apply để ghi."}`);
process.exit(0);
