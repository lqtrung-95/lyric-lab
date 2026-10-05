import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfile, saveProfile } from "@/lib/leaderboard/profile-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → hồ sơ của người đang xem ({profile: {nickname, optedIn, avatarUrl} | null}); chưa có phiên cũng trả null (không lỗi). */
export async function GET() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  return Response.json({ profile }, { headers: { "Cache-Control": "private, no-store" } });
}

/**
 * POST {nickname?, optedIn?} → đặt/đổi biệt danh (dùng chung cho phòng thi đấu và bảng xếp hạng) và/hoặc bật-tắt tham gia bảng xếp hạng.
 * Chỉ `nickname` thì không tự công khai điểm; xem `saveProfile`. Biệt danh duy nhất không phân biệt hoa thường (trùng thì 409).
 * Không nhận email hay tên Google.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { optedIn?: unknown; nickname?: unknown };
  if (body.nickname !== undefined && typeof body.nickname !== "string") return Response.json({ error: "invalid_chars" }, { status: 400 });
  if (body.optedIn !== undefined && typeof body.optedIn !== "boolean") return Response.json({ error: "invalid_chars" }, { status: 400 });
  if (body.nickname === undefined && body.optedIn === undefined) return Response.json({ error: "invalid_chars" }, { status: 400 });

  const result = await saveProfile(user.id, { nickname: body.nickname as string | undefined, optedIn: body.optedIn as boolean | undefined });
  if (result === "ok") return Response.json({ ok: true });
  if (result === "taken") return Response.json({ error: "taken" }, { status: 409 });
  if (result === "server_error") return Response.json({ error: "server_error" }, { status: 500 });
  return Response.json({ error: result }, { status: 400 });
}
