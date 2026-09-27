// Bù bản dịch tiếng Việt cho các bài đã phân tích mà LLM dịch dở dang (chỉ vài dòng đầu có dịch). Mặc định chỉ xem (dry-run):
//   NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/backfill-translations.mts
// Thêm --apply để ghi vào DB. Chỉ điền dòng còn thiếu, không đụng dòng đã có.
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { fillMissingTranslations } from "@/lib/analysis/fill-translations";
import { createGroqChat } from "@/lib/analysis/groq-chat";
import { DEFAULT_MODELS } from "@/lib/analysis/analyze-lyrics";
import { createChatRouter, createOpenRouterChat } from "@/lib/analysis/openrouter-chat";

const apply = process.argv.includes("--apply");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createChatRouter(createGroqChat(process.env.GROQ_API_KEY!), process.env.OPENROUTER_API_KEY ? createOpenRouterChat(process.env.OPENROUTER_API_KEY) : undefined);

const { data, error } = await sb.from("song_analyses").select("video_id,learn_lang,explain_lang,prompt_version,analysis");
if (error) throw new Error(error.message);
for (const row of data ?? []) {
  const a = row.analysis as SongAnalysis;
  const missing = a.lines.filter((l) => !l.translation && l.text.trim()).length;
  if (missing === 0) continue;
  console.log(`${row.video_id}: thiếu ${missing}/${a.lines.length} dòng dịch${apply ? "" : " (dry-run)"}`);
  if (!apply) continue;
  const lines = await fillMissingTranslations(a.lines, chat, DEFAULT_MODELS);
  const left = lines.filter((l) => !l.translation && l.text.trim()).length;
  const { error: e } = await sb.from("song_analyses").update({ analysis: { ...a, lines } })
    .eq("video_id", row.video_id).eq("learn_lang", row.learn_lang).eq("explain_lang", row.explain_lang).eq("prompt_version", row.prompt_version);
  console.log(`  → ${e ? "LỖI " + e.message : `xong, còn thiếu ${left}`}`);
}
process.exit(0);
