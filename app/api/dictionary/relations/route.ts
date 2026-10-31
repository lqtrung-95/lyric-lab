import { createChat } from "@/lib/analysis/server-deps";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { generateCachedNote, NoteError } from "@/lib/tra-tu/cached-llm-note";
import { loadWordDetail } from "@/lib/tra-tu/load-word-detail";
import { buildWordRelationsPrompt, rawRelationsSchema, WORD_RELATIONS_SYSTEM } from "@/lib/tra-tu/word-relations";
import { enrichRelations, readWordRelations, writeWordRelations } from "@/lib/tra-tu/word-relations-store";

export const runtime = "nodejs";
export const maxDuration = 30;

const ipLimiter = new InMemoryRateLimiter(100, 24 * 60 * 60 * 1000);
const HAN_WORD = /^\p{Script=Han}{1,8}$/u;

/** POST /api/dictionary/relations {term} → từ đồng nghĩa, trái nghĩa (AI gợi ý, lưu đệm theo từ, lọc theo từ điển). Mỗi lần gọi LLM tính hạn mức "explain" của tài khoản. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = (await req.json().catch(() => null)) as { term?: unknown } | null;
  const term = typeof body?.term === "string" ? body.term : "";
  if (!HAN_WORD.test(term)) return Response.json({ error: "invalid_request" }, { status: 400 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });

  try {
    const detail = await loadWordDetail(term);
    if (!detail) return Response.json({ error: "term_not_found" }, { status: 404 });
    const { tableReady } = await readWordRelations(detail.simplified);
    if (!tableReady) return Response.json({ error: "unavailable" }, { status: 503 });
    const r = await generateCachedNote({
      readCache: async () => { const c = await readWordRelations(detail.simplified); return c.raw && { value: c.raw, model: c.model ?? "" }; },
      writeCache: (v) => writeWordRelations(detail.simplified, v.value, v.model),
      chat: createChat(getServerEnv()),
      allowLlmCall: async () => ipLimiter.tryConsume(ip) && (await consumeUsage(user, "explain")),
      system: WORD_RELATIONS_SYSTEM, prompt: buildWordRelationsPrompt(detail), maxTokens: 200,
      parse: (raw) => rawRelationsSchema.parse(JSON.parse(raw)),
    });
    return Response.json({ relations: await enrichRelations(r.value, detail.simplified), model: r.model });
  } catch (error) {
    if (error instanceof NoteError) return Response.json({ error: error.code }, { status: error.code === "rate_limited" ? 429 : 502 });
    console.error(JSON.stringify({ event: "tra_tu_relations_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
