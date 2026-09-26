import { getCurrentUser } from "@/lib/auth/current-user";
import { loadStreak } from "@/lib/streak/load-streak";

export const runtime = "nodejs";

/** GET → chuỗi ngày học, tiến độ tuần và số từ đã ôn của người dùng hiện tại. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  try {
    return Response.json(await loadStreak(user.id), { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
