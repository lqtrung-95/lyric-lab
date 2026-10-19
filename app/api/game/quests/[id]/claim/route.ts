import { getCurrentUser } from "@/lib/auth/current-user";
import { claimQuest } from "@/lib/game/game-service";

export const runtime = "nodejs";

const STATUS = { quest_not_found: 404, not_complete: 409, unavailable: 503 } as const;

/**
 * POST → nhận thưởng một nhiệm vụ đã đủ tiến độ. Idempotent: gọi lại trả `claimed: false` kèm tổng quan mới, không cộng thưởng lần hai.
 * `id` có dấu hai chấm (daily:2026-10-20:review10), client nên encodeURIComponent.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const result = await claimQuest(user.id, decodeURIComponent(id));
    if (!result.ok) return Response.json({ error: result.error }, { status: STATUS[result.error] });
    return Response.json({ claimed: result.claimed, summary: result.summary }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    console.error(JSON.stringify({ event: "game_claim_error", message: e instanceof Error ? e.message : String(e) }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
