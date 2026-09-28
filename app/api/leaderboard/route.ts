import { getCurrentUser } from "@/lib/auth/current-user";
import { weekEnd } from "@/lib/leaderboard/week";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOP = 50;

/**
 * GET ?scope=week|all → top 50 người tham gia (chỉ biệt danh và điểm, không lộ tài khoản), kèm hạng của người đang xem
 * (kể cả ngoài top) và trạng thái tham gia của họ.
 */
export async function GET(req: Request) {
  const scope = new URL(req.url).searchParams.get("scope") === "all" ? "all" : "week";
  const sb = createSupabaseServiceClient();
  const user = await getCurrentUser();

  const [top, profile, rank] = await Promise.all([
    sb.rpc("leaderboard_top", { p_scope: scope, p_limit: TOP }),
    user ? sb.from("leaderboard_profiles").select("nickname,opted_in,avatar_url").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    user ? sb.rpc("leaderboard_rank", { p_user: user.id, p_scope: scope }) : Promise.resolve({ data: null }),
  ]);
  if (top.error) return Response.json({ error: "server_error" }, { status: 500 });

  const entries = (top.data ?? []).map((r: { rank: number; user_id: string; nickname: string; points: number; avatar_url: string | null }) => ({
    rank: Number(r.rank), nickname: r.nickname, points: Number(r.points), avatarUrl: r.avatar_url, isMe: r.user_id === user?.id,
  }));
  const mine = (rank.data as { rank: number; points: number }[] | null)?.[0];
  return Response.json(
    {
      scope, entries,
      me: mine ? { rank: Number(mine.rank), points: Number(mine.points) } : null,
      profile: profile.data ? { nickname: profile.data.nickname, optedIn: profile.data.opted_in, avatarUrl: profile.data.avatar_url } : null,
      weekEndsAt: weekEnd(new Date()).toISOString(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
