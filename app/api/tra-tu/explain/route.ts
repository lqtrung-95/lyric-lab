import { createChat } from "@/lib/analysis/server-deps";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { NoteError } from "@/lib/tra-tu/cached-llm-note";
import { explainWord } from "@/lib/tra-tu/explain-word";
import { loadWordDetail } from "@/lib/tra-tu/load-word-detail";
import { readWordNote, writeWordNote } from "@/lib/tra-tu/word-note-store";

export const runtime = "nodejs";
export const maxDuration = 30;

const ipLimiter = new InMemoryRateLimiter(100, 24 * 60 * 60 * 1000);
const HAN_WORD = /^\p{Script=Han}{1,8}$/u;

/** POST /api/tra-tu/explain {term} → giải nghĩa tiếng Việt cho cả từ (AI, có lưu đệm). Chỉ từ có trong từ điển; mỗi lần gọi LLM tính hạn mức "explain" của tài khoản. */
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
    const { tableReady } = await readWordNote(detail.simplified);
    if (!tableReady) return Response.json({ error: "unavailable" }, { status: 503 });
    const { stored, fromCache } = await explainWord(detail, {
      readCache: async (t) => (await readWordNote(t)).stored,
      writeCache: writeWordNote,
      chat: createChat(getServerEnv()),
      allowLlmCall: async () => ipLimiter.tryConsume(ip) && (await consumeUsage(user, "explain")),
    });
    return Response.json({ ...stored, fromCache });
  } catch (error) {
    if (error instanceof NoteError) return Response.json({ error: error.code }, { status: error.code === "rate_limited" ? 429 : 502 });
    console.error(JSON.stringify({ event: "tra_tu_explain_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
