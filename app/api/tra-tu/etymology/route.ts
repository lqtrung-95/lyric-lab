import { createChat } from "@/lib/analysis/server-deps";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { NoteError } from "@/lib/tra-tu/cached-llm-note";
import { readEtymologyNote, writeEtymologyNote } from "@/lib/tra-tu/etymology-note-store";
import { explainEtymology } from "@/lib/tra-tu/explain-etymology";
import { isSingleHan } from "@/lib/tra-tu/han-char";
import { loadHanziInfo } from "@/lib/tra-tu/load-hanzi-info";

export const runtime = "nodejs";
export const maxDuration = 30;

const ipLimiter = new InMemoryRateLimiter(100, 24 * 60 * 60 * 1000);

/** POST /api/tra-tu/etymology {char} → lời giải chiết tự tiếng Việt do AI viết (có lưu đệm), bám dữ kiện từ Make Me a Hanzi. Tính hạn mức "explain" của tài khoản. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = (await req.json().catch(() => null)) as { char?: unknown } | null;
  const char = typeof body?.char === "string" ? body.char : "";
  if (!isSingleHan(char)) return Response.json({ error: "invalid_request" }, { status: 400 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });

  try {
    const { ready, items } = await loadHanziInfo([char]);
    if (!ready || items.length === 0) return Response.json({ error: "not_found" }, { status: 404 });
    if (!(await readEtymologyNote(char)).tableReady) return Response.json({ error: "unavailable" }, { status: 503 });
    const { stored, fromCache } = await explainEtymology(items[0], {
      readCache: async (c) => (await readEtymologyNote(c)).stored, writeCache: writeEtymologyNote, chat: createChat(getServerEnv()),
      allowLlmCall: async () => ipLimiter.tryConsume(ip) && (await consumeUsage(user, "explain")),
    });
    return Response.json({ ...stored, fromCache });
  } catch (error) {
    if (error instanceof NoteError) return Response.json({ error: error.code }, { status: error.code === "rate_limited" ? 429 : 502 });
    console.error(JSON.stringify({ event: "tra_tu_etymology_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
