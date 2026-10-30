import { getCurrentUser } from "@/lib/auth/current-user";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { consumeUsage, refundUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { segmentReply } from "@/lib/roleplay/segment-reply";
import { RoleplayError, runRoleplayTurn } from "@/lib/roleplay/roleplay-turn";
import { roleplayRequestSchema } from "@/lib/roleplay/turn-schema";

export const runtime = "nodejs";
export const maxDuration = 30;

const ipLimiter = new InMemoryRateLimiter(300, 24 * 60 * 60 * 1000);

/**
 * POST /api/roleplay/turn {scenarioId, level, history, userText} → lượt đáp của AI đóng vai (chữ Hán, nghĩa Việt, câu gợi ý, lời sửa nếu có) kèm pinyin từ từ điển.
 * Chỉ tài khoản đã đăng ký (khách bị 403 account_required); mỗi lượt tính vào hạn mức `roleplay` theo ngày, hoàn lại nếu lỗi phía hệ thống.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await req.json().catch(() => null);
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (user.isAnonymous) return Response.json({ error: "account_required" }, { status: 403 });
  const parsed = roleplayRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  let consumed = false;
  try {
    const started = Date.now();
    const out = await runRoleplayTurn(parsed.data, {
      chat: createChat(getServerEnv()),
      allowLlmCall: async () => (consumed = ipLimiter.tryConsume(ip) && (await consumeUsage(user, "roleplay"))),
    });
    const llmMs = Date.now() - started;
    const pinyin = await annotatePinyin([out.reply, ...out.tips, ...(out.feedback ? [out.feedback.better] : [])]);
    console.info(JSON.stringify({ event: "roleplay_turn", scenario: parsed.data.scenarioId, level: parsed.data.level, model: out.model, llmMs, ms: Date.now() - started }));
    return Response.json({ reply: out.reply, replyVi: out.replyVi, tips: out.tips, feedback: out.feedback ? { ...out.feedback, tokens: segmentReply(out.feedback.better) } : null, pinyin, tokens: segmentReply(out.reply) });
  } catch (error) {
    if (consumed && (error as { code?: string })?.code !== "rate_limited") await refundUsage(user, "roleplay");
    if (error instanceof RoleplayError) return Response.json({ error: error.code }, { status: error.code === "rate_limited" ? 429 : 502 });
    console.error(JSON.stringify({ event: "roleplay_turn_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
